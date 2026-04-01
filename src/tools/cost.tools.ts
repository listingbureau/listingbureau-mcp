import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { LBClient } from "../client/lb-client.js";
import type { ServiceRates, WalletBalance } from "../client/types.js";
import { sfbUnitCost, estimateCost, round2 } from "../utils/cost.js";
import { formatResult, formatErrorResult } from "../utils/response.js";

const scheduleItemSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format").describe("Date in YYYY-MM-DD format"),
  atc: z.number().int().min(0).default(0).describe("Add-to-cart volume"),
  sfb: z.number().int().min(0).default(0).describe("Search-find-buy volume"),
  pgv: z.number().int().min(0).default(0).describe("Page view volume"),
});

const estimateCostShape = {
  atc: z.number().int().min(0).optional().describe("Uniform daily add-to-cart volume"),
  sfb: z.number().int().min(0).optional().describe("Uniform daily search-find-buy volume"),
  pgv: z.number().int().min(0).optional().describe("Uniform daily page view volume"),
  num_days: z.number().int().min(1).max(365).optional().describe("Number of days for uniform volumes"),
  schedule: z
    .array(scheduleItemSchema)
    .min(1)
    .max(365)
    .optional()
    .describe("Per-day schedule entries (alternative to uniform volumes)"),
  retail_price: z
    .number()
    .min(0)
    .optional()
    .describe("Product retail price in USD — needed for accurate SFB cost including product price, tax, and passthrough"),
};

export function registerCostTools(server: McpServer, client: LBClient) {
  server.tool(
    "lb_estimate_cost",
    "Estimate campaign cost before committing. Fetches current rates and wallet balance, then computes total cost, daily averages, and wallet sustainability. Provide either uniform daily volumes (atc/sfb/pgv + num_days) or a per-day schedule array. Include retail_price for accurate SFB costs.",
    estimateCostShape,
    { readOnlyHint: true },
    async (params) => {
      try {
        // Validate: either schedule array, or (volumes + num_days)
        const hasSchedule = params.schedule && params.schedule.length > 0;
        const hasVolume = (params.atc ?? 0) > 0 || (params.sfb ?? 0) > 0 || (params.pgv ?? 0) > 0;
        if (!hasSchedule && !(hasVolume && params.num_days != null)) {
          return formatErrorResult(
            new Error("Provide either a 'schedule' array, OR at least one volume (atc/sfb/pgv > 0) with 'num_days'"),
          );
        }

        const [ratesRes, walletRes] = await Promise.all([
          client.request<ServiceRates>("GET", "/api/v1/account/service-rates"),
          client.request<WalletBalance>("GET", "/api/v1/wallet"),
        ]);

        const rates = ratesRes.data;
        const wallet = walletRes.data;

        // Build normalized schedule
        let schedule: { date: string; atc: number; sfb: number; pgv: number }[];
        if (params.schedule && params.schedule.length > 0) {
          schedule = params.schedule;
        } else {
          const numDays = params.num_days!;
          // Uniform volumes — use "uniform" as date to signal these aren't real calendar dates
          schedule = Array.from({ length: numDays }, () => ({
            date: "uniform",
            atc: params.atc ?? 0,
            sfb: params.sfb ?? 0,
            pgv: params.pgv ?? 0,
          }));
        }

        const estimate = estimateCost(schedule, rates, params.retail_price);

        // Wallet sustainability (clamp to zero for overdraft states)
        const availableUsd = Math.max(0, wallet.balance_usd - wallet.held_usd);
        const daysAffordable =
          estimate.avg_daily_cost > 0
            ? Math.floor(availableUsd / estimate.avg_daily_cost)
            : estimate.num_days;

        const warnings: string[] = [];

        // SFB without retail_price warning
        const hasSfb = schedule.some((d) => d.sfb > 0);
        if (hasSfb && params.retail_price == null) {
          warnings.push(
            "SFB volumes provided without retail_price — estimate uses service fee only ($" +
              rates.sfb_service_fee.toFixed(2) +
              "/unit). Provide retail_price for full cost including product price, tax, and passthrough.",
          );
        }

        // Affordability warning
        if (availableUsd < estimate.totals.grand_total) {
          warnings.push(
            `Campaign cost ($${estimate.totals.grand_total.toFixed(2)}) exceeds available balance ($${availableUsd.toFixed(2)}). ` +
              `Can afford ~${daysAffordable} days at current rate.`,
          );
        }

        const sfbUnit = sfbUnitCost(rates, params.retail_price);

        const result: Record<string, unknown> = {
          estimate,
          wallet: {
            balance_usd: wallet.balance_usd,
            held_usd: wallet.held_usd,
            available_usd: round2(availableUsd),
            can_afford_campaign: availableUsd >= estimate.totals.grand_total,
            days_affordable: daysAffordable,
          },
          rates_used: {
            atc_per_action: rates.atc,
            pgv_per_action: rates.pgv,
            sfb_per_unit: round2(sfbUnit),
            sfb_formula: rates.sfb_formula,
            sfb_retail_price_provided: params.retail_price != null,
          },
        };

        if (warnings.length > 0) {
          result.warnings = warnings;
        }

        return formatResult(result);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );
}

