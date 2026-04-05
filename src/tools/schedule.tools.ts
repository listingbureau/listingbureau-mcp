import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { LBClient } from "../client/lb-client.js";
import type { ScheduleResponse, ServiceRates, CostSummary, Project } from "../client/types.js";
import { formatResult, formatErrorResult } from "../utils/response.js";
import { assertSfbAllowed, SfbRegionError } from "../utils/regions.js";
import { sfbUnitCost, estimateCost, mapScheduleEntries, round2 } from "../utils/cost.js";

// Write schema: only YYYY-MM-DD dates (backend manages 'ongoing' entries internally)
const scheduleEntrySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format")
    .describe("Date in YYYY-MM-DD format"),
  atc: z.number().int().min(0).describe("Add-to-cart volume (all regions; lower execution rate outside US)"),
  sfb: z.number().int().min(0).describe("Search Find Buy (SFB) volume (US-region projects only)"),
  pgv: z.number().int().min(0).describe("Page view volume (all regions; lower execution rate outside US)"),
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
    // Internal enrichment fetch — no tool attribution in audit log
    const ratesRes = await client.request<ServiceRates>("GET", "/api/v1/account/service-rates");
    const rates = ratesRes.data;
    const { dated, ongoing } = mapScheduleEntries(data.scheduling);

    if (dated.length === 0 && !ongoing) return result;

    const sfbNote = "SFB costs use service fee only ($" + rates.sfb_service_fee.toFixed(2) +
      "), matching backend balance check behavior. Use lb_estimate_cost with retail_price for full SFB cost.";

    if (dated.length > 0 && ongoing) {
      // Mixed: dated entries + ongoing
      const est = estimateCost(dated, rates);
      const ongoingDailyCost = estimateCost([{ date: "ongoing", ...ongoing }], rates).avg_daily_cost;
      result.cost_summary = {
        total_estimated_cost: est.totals.grand_total,
        avg_daily_cost: est.avg_daily_cost,
        num_scheduled_days: est.num_days,
        note: `Includes ${dated.length} dated day(s) + ongoing at $${ongoingDailyCost.toFixed(2)}/day. ${sfbNote}`,
      } satisfies CostSummary;
    } else if (dated.length > 0) {
      // Dated entries only
      const est = estimateCost(dated, rates);
      result.cost_summary = {
        total_estimated_cost: est.totals.grand_total,
        avg_daily_cost: est.avg_daily_cost,
        num_scheduled_days: est.num_days,
        note: sfbNote,
      } satisfies CostSummary;
    } else if (ongoing) {
      // Ongoing only
      const dailyEst = estimateCost([{ date: "ongoing", ...ongoing }], rates);
      result.cost_summary = {
        total_estimated_cost: null,
        avg_daily_cost: dailyEst.avg_daily_cost,
        num_scheduled_days: null,
        note: `Ongoing schedule — $${dailyEst.avg_daily_cost.toFixed(2)}/day with no fixed end date. ${sfbNote}`,
      } satisfies CostSummary;
    }
    // SFB lock info (best-effort, appended when schedule has SFBs)
    const lockDays = rates.sfb_lock_days ?? 0;
    const allEntries = [...dated, ...(ongoing ? [{ date: "ongoing", ...ongoing }] : [])];
    const hasSfb = allEntries.some((d) => d.sfb > 0);

    if (hasSfb && lockDays > 0) {
      const serverDate = rates.server_date;
      if (serverDate) {
        const boundary = new Date(serverDate + "T00:00:00Z");
        boundary.setUTCDate(boundary.getUTCDate() + lockDays);
        const earliestSfbDate = boundary.toISOString().split("T")[0];

        // Count locked SFB units
        let lockedSfb = 0;
        const boundaryStr = earliestSfbDate;
        const ongoingSfb = ongoing?.sfb ?? 0;

        if (ongoingSfb > 0) {
          lockedSfb += ongoingSfb * lockDays;
        }
        for (const d of dated) {
          if (d.sfb > 0 && d.date < boundaryStr) {
            lockedSfb += d.sfb;
          }
        }

        if (lockedSfb > 0) {
          const unit = sfbUnitCost(rates);
          result.sfb_lock_info = {
            lock_days: lockDays,
            locked_sfb_units: lockedSfb,
            lock_commitment_usd: round2(lockedSfb * unit),
            earliest_sfb_date: earliestSfbDate,
            note: `${lockedSfb} SFB units across the next ${lockDays} days fall within the freeze period once scheduled and cannot be cancelled or changed. Cost shown uses service fee only ($${rates.sfb_service_fee.toFixed(2)}/unit); use lb_estimate_cost with retail_price for full cost.`,
          };
        }
      }
    }
  } catch (e) {
    // Best-effort: skip cost summary on failure, log for debugging
    console.error("[cost-summary]", e);
  }
  return result;
}

export function registerScheduleTools(server: McpServer, client: LBClient) {
  server.tool(
    "lb_schedule_get",
    "Get the current schedule for a Listing Bureau project. Shows per-day service volumes (atc, sfb, pgv). Note: SFB is only available for US-region projects.",
    {
      ui_id: z.string().describe("Project unique identifier"),
    },
    { readOnlyHint: true  },
    async (params) => {
      try {
        const res = await client.request<ScheduleResponse>(
          "GET",
          `/api/v1/projects/${encodeURIComponent(params.ui_id)}/schedule`,
          undefined,
          undefined,
          "lb_schedule_get",
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
    "Set the full per-day schedule for a Listing Bureau project. Replaces any existing schedule. Each entry represents one day with volumes for atc, sfb, and pgv. Max 365 entries. SFB is US-region only; ATC/PGV work in all regions (lower execution rate outside US).",
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
        // SFB region gate: only fetch project when schedule contains SFB > 0
        let regionWarning: string | undefined;
        if (params.schedule.some((e) => e.sfb > 0)) {
          try {
            const projRes = await client.request<Project>(
              "GET",
              `/api/v1/projects/${encodeURIComponent(params.ui_id)}`,
              undefined,
              undefined,
              "lb_schedule_set",
            );
            assertSfbAllowed(projRes.data.region, true);
          } catch (fetchErr) {
            // If assertSfbAllowed threw, re-throw (it's a validation error, not a fetch failure)
            if (fetchErr instanceof SfbRegionError) {
              throw fetchErr;
            }
            // Fetch failure: warn and proceed — backend enforces the real restriction
            regionWarning = "Could not verify project region for SFB eligibility. The backend will enforce region restrictions.";
          }
        }

        const res = await client.request<ScheduleResponse>(
          "PUT",
          `/api/v1/projects/${encodeURIComponent(params.ui_id)}/schedule`,
          { schedule: params.schedule },
          undefined,
          "lb_schedule_set",
        );
        const augmented = await appendCostSummary(res.data, client);
        if (regionWarning) {
          (augmented as Record<string, unknown>).region_warning = regionWarning;
        }
        return formatResult(augmented);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.tool(
    "lb_schedule_quick_set",
    "Quick-set uniform daily volumes for a Listing Bureau project. WARNING: This clears any existing per-day schedule and replaces it with uniform values. All omitted fields default to 0. SFB is US-region only; ATC/PGV work in all regions (lower execution rate outside US).",
    {
      ui_id: z.string().describe("Project unique identifier"),
      atc: z.number().int().min(0).optional().describe("Add-to-cart volume per day (default 0) (all regions; lower execution rate outside US)"),
      sfb: z.number().int().min(0).optional().describe("Search Find Buy (SFB) volume per day (default 0) (US-region projects only)"),
      pgv: z.number().int().min(0).optional().describe("Page view volume per day (default 0) (all regions; lower execution rate outside US)"),
    },
    { destructiveHint: true, idempotentHint: true  },
    async (params) => {
      try {
        // SFB region gate: only fetch project when SFB > 0
        let regionWarning: string | undefined;
        if ((params.sfb ?? 0) > 0) {
          try {
            const projRes = await client.request<Project>(
              "GET",
              `/api/v1/projects/${encodeURIComponent(params.ui_id)}`,
              undefined,
              undefined,
              "lb_schedule_quick_set",
            );
            assertSfbAllowed(projRes.data.region, true);
          } catch (fetchErr) {
            if (fetchErr instanceof SfbRegionError) {
              throw fetchErr;
            }
            regionWarning = "Could not verify project region for SFB eligibility. The backend will enforce region restrictions.";
          }
        }

        const body: Record<string, unknown> = {
          atc: params.atc ?? 0,
          sfb: params.sfb ?? 0,
          pgv: params.pgv ?? 0,
        };

        const res = await client.request<ScheduleResponse>(
          "POST",
          `/api/v1/projects/${encodeURIComponent(params.ui_id)}/schedule/quick`,
          body,
          undefined,
          "lb_schedule_quick_set",
        );
        const augmented = await appendCostSummary(res.data, client);
        if (regionWarning) {
          (augmented as Record<string, unknown>).region_warning = regionWarning;
        }
        return formatResult(augmented);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );
}
