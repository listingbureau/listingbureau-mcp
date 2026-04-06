import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { LBClient } from "../client/lb-client.js";
import type { Project, ProjectListItem, MessageResponse, ProjectStatsResponse } from "../client/types.js";
import { formatResult, formatErrorResult } from "../utils/response.js";
import { ACCEPTED_REGIONS, normalizeRegion } from "../utils/regions.js";

export function registerProjectsTools(server: McpServer, client: LBClient) {
  server.tool(
    "lb_projects_list",
    "List Listing Bureau Amazon projects with optional filters. Returns ASIN, keyword, active status, and current service volumes.",
    {
      region: z
        .enum(ACCEPTED_REGIONS)
        .optional()
        .describe("Filter by Amazon region code (GB accepted as alias for UK)"),
      active: z.boolean().optional().describe("Filter by active status"),
    },
    { readOnlyHint: true  },
    async (params) => {
      try {
        const query: Record<string, string> = { marketplace: "amazon" };
        if (params.region !== undefined) query.region = normalizeRegion(params.region);
        if (params.active !== undefined) query.active = String(params.active);

        const res = await client.request<ProjectListItem[]>(
          "GET",
          "/api/v1/projects",
          undefined,
          query,
          "lb_projects_list",
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.tool(
    "lb_projects_create",
    "Create a new Listing Bureau Amazon project. If a project with the same ASIN+keyword+region was previously archived, it will be reactivated instead (returns 201). ASIN must be a valid Amazon ASIN. Keyword must be 3-200 characters.",
    {
      region: z
        .enum(ACCEPTED_REGIONS)
        .describe("Amazon region code (GB accepted as alias for UK)"),
      asin: z
        .string()
        .describe("Amazon ASIN (e.g. 'B01MTJK06C')"),
      keyword: z
        .string()
        .min(3)
        .max(200)
        .describe("Target keyword (3-200 characters)"),
      expected_retail_price: z
        .number()
        .min(0)
        .optional()
        .describe("Expected retail price of the product in USD. Required for SFB cost estimation and holds."),
    },
    { idempotentHint: false },
    async (params) => {
      try {
        const body: Record<string, unknown> = {
          marketplace: "amazon",
          region: normalizeRegion(params.region),
          asin: params.asin,
          keyword: params.keyword,
        };
        if (params.expected_retail_price !== undefined) {
          body.expected_retail_price = params.expected_retail_price;
        }
        const res = await client.request<Project>("POST", "/api/v1/projects", body, undefined, "lb_projects_create");
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.tool(
    "lb_projects_get",
    "Get detailed info for a specific Listing Bureau project including schedule, services, and SERP data.",
    {
      ui_id: z.string().describe("Project unique identifier"),
    },
    { readOnlyHint: true  },
    async (params) => {
      try {
        const res = await client.request<Project>(
          "GET",
          `/api/v1/projects/${encodeURIComponent(params.ui_id)}`,
          undefined,
          undefined,
          "lb_projects_get",
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.tool(
    "lb_projects_update",
    "Update a Listing Bureau project. Currently supports toggling the active status (pause/resume). To archive a project, use lb_projects_archive instead.",
    {
      ui_id: z.string().describe("Project unique identifier"),
      active: z.boolean().optional().describe("Set active status (true=resume, false=pause)"),
    },
    { idempotentHint: true  },
    async (params) => {
      try {
        const body: Record<string, unknown> = {};
        if (params.active !== undefined) body.action = params.active ? "activate" : "pause";

        if (Object.keys(body).length === 0) {
          return formatErrorResult(
            new Error("At least one field (active) must be provided"),
          );
        }

        const res = await client.request<Project>(
          "PATCH",
          `/api/v1/projects/${encodeURIComponent(params.ui_id)}`,
          body,
          undefined,
          "lb_projects_update",
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.tool(
    "lb_projects_archive",
    "Archive (soft delete) a Listing Bureau Amazon project. The project can be reactivated by creating a new project with the same ASIN+keyword+region.",
    {
      ui_id: z.string().describe("Project unique identifier"),
    },
    { destructiveHint: true  },
    async (params) => {
      try {
        const res = await client.request<MessageResponse>(
          "DELETE",
          `/api/v1/projects/${encodeURIComponent(params.ui_id)}`,
          undefined,
          undefined,
          "lb_projects_archive",
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.tool(
    "lb_projects_get_stats",
    "Get daily stats for a Listing Bureau project: service execution (SFB, ATC, PGV), SERP rankings, ARA analytics, Brand Referral, and Search Query data. Note: this call may be slow (~1-2s) due to 14+ backend DB queries.",
    {
      ui_id: z.string().describe("Project unique identifier"),
      days: z
        .number()
        .int()
        .min(1)
        .max(365)
        .optional()
        .describe("Number of days of history (default 30, max 365)"),
    },
    { readOnlyHint: true },
    async (params) => {
      try {
        const query: Record<string, string> = {};
        if (params.days !== undefined) query.days = String(params.days);

        const res = await client.request<ProjectStatsResponse>(
          "GET",
          `/api/v1/projects/${encodeURIComponent(params.ui_id)}/stats`,
          undefined,
          query,
          "lb_projects_get_stats",
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );
}
