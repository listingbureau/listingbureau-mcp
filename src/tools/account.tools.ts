import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { LBClient } from "../client/lb-client.js";
import type { Account, ServiceRates, Subscription } from "../client/types.js";
import { formatResult, formatErrorResult } from "../utils/response.js";

export function registerAccountTools(server: McpServer, client: LBClient) {
  server.tool(
    "lb_account_get",
    "Get Listing Bureau account info (email, name, company, plan, account type)",
    {},
    { readOnlyHint: true  },
    async () => {
      try {
        const res = await client.request<Account>("GET", "/api/v1/account");
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.tool(
    "lb_account_update_profile",
    "Update Listing Bureau account profile fields (first_name, last_name, company). At least one field required.",
    {
      first_name: z.string().optional().describe("New first name"),
      last_name: z.string().optional().describe("New last name"),
      company: z.string().optional().describe("New company name"),
    },
    { idempotentHint: true  },
    async (params) => {
      try {
        const body: Record<string, unknown> = {};
        if (params.first_name !== undefined) body.first_name = params.first_name;
        if (params.last_name !== undefined) body.last_name = params.last_name;
        if (params.company !== undefined) body.company = params.company;

        if (Object.keys(body).length === 0) {
          return formatErrorResult(
            new Error("At least one field (first_name, last_name, company) must be provided"),
          );
        }

        const res = await client.request<Account>(
          "PATCH",
          "/api/v1/account/profile",
          body,
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.tool(
    "lb_account_get_service_rates",
    "Get current Listing Bureau service pricing rates. Returns empty object if no plan is active.",
    {},
    { readOnlyHint: true  },
    async () => {
      try {
        const res = await client.request<ServiceRates>(
          "GET",
          "/api/v1/account/service-rates",
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.tool(
    "lb_account_get_subscription",
    "Get Listing Bureau subscription info (plan label, fee, discount, wallet usage)",
    {},
    { readOnlyHint: true  },
    async () => {
      try {
        const res = await client.request<Subscription>(
          "GET",
          "/api/v1/account/subscription",
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );
}
