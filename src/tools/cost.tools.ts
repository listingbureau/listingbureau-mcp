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
          // Uniform volumes: "uniform" label signals these aren't real calendar dates.
          // Daily breakdown (for <= 14 days) will show identical rows — this is intentional.
          schedule = Array.from({ length: numDays }, () => ({
            date: "uniform",
            atc: params.atc ?? 0,
            sfb: params.sfb ?? 0,
            pgv: params.pgv ?? 0,
          }));
        }

        const estimate = estimateCost(schedule, rates, params.retail_price);

        // Wallet sustainability (clamp to zero for overdraft, round to match grand_total precision)
        const availableUsd = round2(Math.max(0, wallet.balance_usd - wallet.held_usd));
        // null = unlimited (zero-cost schedule can run indefinitely)
        const daysAffordable =
          estimate.avg_daily_cost > 0
            ? Math.floor(availableUsd / estimate.avg_daily_cost)
            : null;

        const warnings: string[] = [];

        // Warn if schedule array was used but uniform params were also provided
        if (hasSchedule && (hasVolume || params.num_days != null)) {
          warnings.push(
            "schedule array provided — num_days and uniform volumes (atc/sfb/pgv) were ignored.",
          );
        }

        // SFB without retail_price warning (0 is effectively the same as omitting)
        const hasSfb = schedule.some((d) => d.sfb > 0);
        if (hasSfb && (params.retail_price == null || params.retail_price === 0)) {
          warnings.push(
            "SFB volumes provided without retail_price — estimate uses service fee only ($" +
              rates.sfb_service_fee.toFixed(2) +
              "/unit). Provide retail_price for full cost including product price, tax, and passthrough.",
          );
        }

        // Affordability warning (skip for zero-cost schedules to avoid confusing "$0.00 exceeds" messages)
        if (estimate.totals.grand_total > 0 && availableUsd < estimate.totals.grand_total) {
          const affordMsg = daysAffordable != null
            ? `Can afford ~${daysAffordable} days at current rate.`
            : "";
          warnings.push(
            `Campaign cost ($${estimate.totals.grand_total.toFixed(2)}) exceeds available balance ($${availableUsd.toFixed(2)}). ${affordMsg}`.trim(),
          );
        }

        const sfbUnit = sfbUnitCost(rates, params.retail_price);

        // Note rounding caveat when daily breakdown is present
        if (estimate.daily_breakdown) {
          warnings.push(
            "daily_breakdown rows are rounded independently — their sum may differ from grand_total by a few cents. Trust grand_total for the accurate figure.",
          );
        }

        const result: Record<string, unknown> = {
          estimate,
          wallet: {
            balance_usd: wallet.balance_usd,
            held_usd: wallet.held_usd,
            available_usd: round2(availableUsd),
            // >= is intentional: exact-balance means campaign is affordable
            can_afford_campaign: availableUsd >= estimate.totals.grand_total,
            // null = zero-cost schedule (unlimited days), number = finite affordability
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

