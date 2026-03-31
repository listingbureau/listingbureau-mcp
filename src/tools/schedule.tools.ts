import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { LBClient } from "../client/lb-client.js";
import type { ScheduleResponse } from "../client/types.js";
import { formatResult, formatErrorResult } from "../utils/response.js";

const scheduleEntrySchema = z.object({
  date: z
    .string()
    .describe("Date in YYYY-MM-DD format, or 'ongoing' for all future days until next update"),
  atc: z.number().int().min(0).describe("Add-to-cart volume"),
  sfb: z.number().int().min(0).describe("Search-find-buy volume"),
  pgv: z.number().int().min(0).describe("Page view volume"),
});

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
        return formatResult(res.data);
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
        return formatResult(res.data);
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
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );
}
