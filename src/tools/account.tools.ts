import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { LBClient } from "../client/lb-client.js";
import type { Account, WalletBalance, ServiceRates, Subscription } from "../client/types.js";
import { formatResult, formatErrorResult } from "../utils/response.js";

export function registerAccountTools(server: McpServer, client: LBClient) {
  server.tool(
    "lb_account_get",
    "Get Listing Bureau account info (email, name, account status, wallet balance)",
    {},
    { readOnlyHint: true  },
    async () => {
      try {
        const [accountRes, walletRes] = await Promise.all([
          client.request<Account>("GET", "/api/v1/account"),
          client.request<WalletBalance>("GET", "/api/v1/wallet"),
        ]);

        const account = accountRes.data;
        const wallet = walletRes.data;

        // Derive display status
        let status: string;
        let note: string | undefined;
        if (account.account_status === "inactive") {
          status = "Inactive";
          note = "Account disabled. Contact hello@listingbureau.com";
        } else if ((wallet.balance_usd - wallet.held_usd) < 1) {
          status = "No funds";
        } else {
          status = "Active";
        }

        const result: Record<string, unknown> = {
          email: account.email,
          name: `${account.first_name} ${account.last_name}`.trim(),
          account_status: status,
          wallet_balance: {
            balance_usd: wallet.balance_usd,
            held_usd: wallet.held_usd,
          },
        };
        if (note) result.note = note;

        return formatResult(result);
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
