import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { LBClient } from "../client/lb-client.js";
import type { ScheduleResponse, ServiceRates } from "../client/types.js";
import { formatResult, formatErrorResult } from "../utils/response.js";
import { estimateCost, mapScheduleEntries, getOngoingVolumes } from "../utils/cost.js";

const scheduleEntrySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$|^ongoing$/, "Must be YYYY-MM-DD or 'ongoing'")
    .describe("Date in YYYY-MM-DD format, or 'ongoing' for all future days until next update"),
  atc: z.number().int().min(0).describe("Add-to-cart volume"),
  sfb: z.number().int().min(0).describe("Search-find-buy volume"),
  pgv: z.number().int().min(0).describe("Page view volume"),
});

/**
 * Best-effort: fetch rates and compute cost summary for a schedule response.
 * Returns the response data augmented with cost_summary, or unchanged on failure.
 */
async function appendCostSummary(
  data: ScheduleResponse,
  client: LBClient,
): Promise<Record<string, unknown>> {
  const result = { ...data } as Record<string, unknown>;
  try {
    const ratesRes = await client.request<ServiceRates>("GET", "/api/v1/account/service-rates");
    const rates = ratesRes.data;
    const { dated, hasOngoing } = mapScheduleEntries(data.scheduling);

    if (dated.length === 0 && !hasOngoing) return result;

    const sfbNote = "SFB costs use service fee only ($" + rates.sfb_service_fee.toFixed(2) +
      "), matching backend balance check behavior. Use lb_estimate_cost with retail_price for full SFB cost.";

    if (dated.length > 0 && hasOngoing) {
      // Mixed: dated entries + ongoing
      const est = estimateCost(dated, rates);
      const ongoing = getOngoingVolumes(data.scheduling);
      const ongoingDailyCost = ongoing
        ? estimateCost([{ date: "ongoing", ...ongoing }], rates).avg_daily_cost
        : 0;
      result.cost_summary = {
        total_estimated_cost: est.totals.grand_total,
        avg_daily_cost: est.avg_daily_cost,
        num_scheduled_days: est.num_days,
        note: `Includes ${dated.length} dated day(s) + ongoing at $${ongoingDailyCost.toFixed(2)}/day. ${sfbNote}`,
      };
    } else if (dated.length > 0) {
      // Dated entries only
      const est = estimateCost(dated, rates);
      result.cost_summary = {
        total_estimated_cost: est.totals.grand_total,
        avg_daily_cost: est.avg_daily_cost,
        num_scheduled_days: est.num_days,
        note: sfbNote,
      };
    } else {
      // Ongoing only
      const ongoing = getOngoingVolumes(data.scheduling);
      if (ongoing) {
        const dailyEst = estimateCost([{ date: "ongoing", ...ongoing }], rates);
        result.cost_summary = {
          total_estimated_cost: null,
          avg_daily_cost: dailyEst.avg_daily_cost,
          num_scheduled_days: null,
          note: `Ongoing schedule — $${dailyEst.avg_daily_cost.toFixed(2)}/day with no fixed end date. ${sfbNote}`,
        };
      }
    }
  } catch {
    // Best-effort: silently skip cost summary on failure
  }
  return result;
}

export function registerScheduleTools(server: McpServer, client: LBClient) {
  server.tool(
    "lb_schedule_get",
    "Get the current schedule for a Listing Bureau project. Shows per-day service volumes (atc, sfb, pgv).",
    {
      ui_id: z.string().describe("Project unique identifier"),
    },
    { readOnlyHint: true  },
    async (params) => {
      try {
        const res = await client.request<ScheduleResponse>(
          "GET",
          `/api/v1/projects/${encodeURIComponent(params.ui_id)}/schedule`,
        );
        const augmented = await appendCostSummary(res.data, client);
        return formatResult(augmented);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.tool(
    "lb_schedule_set",
    "Set the full per-day schedule for a Listing Bureau project. Replaces any existing schedule. Each entry represents one day with volumes for atc, sfb, and pgv. Max 365 entries.",
    {
      ui_id: z.string().describe("Project unique identifier"),
      schedule: z
        .array(scheduleEntrySchema)
        .min(1)
        .max(365)
        .describe("Array of daily schedule entries"),
    },
    { destructiveHint: true, idempotentHint: true  },
    async (params) => {
      try {
        const res = await client.request<ScheduleResponse>(
          "PUT",
          `/api/v1/projects/${encodeURIComponent(params.ui_id)}/schedule`,
          { schedule: params.schedule },
        );
        const augmented = await appendCostSummary(res.data, client);
        return formatResult(augmented);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.tool(
    "lb_schedule_quick_set",
    "Quick-set uniform daily volumes for a Listing Bureau project. WARNING: This clears any existing per-day schedule and replaces it with uniform values. All omitted fields default to 0.",
    {
      ui_id: z.string().describe("Project unique identifier"),
      atc: z.number().int().min(0).optional().describe("Add-to-cart volume per day (default 0)"),
      sfb: z.number().int().min(0).optional().describe("Search-find-buy volume per day (default 0)"),
      pgv: z.number().int().min(0).optional().describe("Page view volume per day (default 0)"),
    },
    { destructiveHint: true, idempotentHint: true  },
    async (params) => {
      try {
        const body: Record<string, unknown> = {
          atc: params.atc ?? 0,
          sfb: params.sfb ?? 0,
          pgv: params.pgv ?? 0,
        };

        const res = await client.request<ScheduleResponse>(
          "POST",
          `/api/v1/projects/${encodeURIComponent(params.ui_id)}/schedule/quick`,
          body,
        );
        const augmented = await appendCostSummary(res.data, client);
        return formatResult(augmented);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );
}
