import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { LBClient } from "../client/lb-client.js";
import type { WalletBalance, Transaction, TopupResponse } from "../client/types.js";
import {
  formatResult,
  formatPaginatedResult,
  formatErrorResult,
} from "../utils/response.js";

export function registerWalletTools(server: McpServer, client: LBClient) {
  server.tool(
    "lb_wallet_get_balance",
    "Get Listing Bureau wallet balance (credits and USD). May include a warning if data is temporarily unavailable.",
    {},
    { readOnlyHint: true  },
    async () => {
      try {
        const res = await client.request<WalletBalance>(
          "GET",
          "/api/v1/wallet",
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.tool(
    "lb_wallet_get_transactions",
    "Get Listing Bureau wallet transaction history (paginated). Last page may include legacy entries beyond per_page count.",
    {
      page: z.number().int().min(1).optional().describe("Page number (default 1)"),
      per_page: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe("Results per page (default 50, max 100)"),
      type: z
        .enum(["credits", "usd"])
        .optional()
        .describe("Filter by transaction type: 'credits' or 'usd'"),
    },
    { readOnlyHint: true  },
    async (params) => {
      try {
        const query: Record<string, string> = {};
        if (params.page !== undefined) query.page = String(params.page);
        if (params.per_page !== undefined)
          query.per_page = String(params.per_page);
        if (params.type !== undefined) query.type = params.type;

        const res = await client.request<Transaction[]>(
          "GET",
          "/api/v1/wallet/transactions",
          undefined,
          query,
        );
        if (res.meta) {
          return formatPaginatedResult(res.data, res.meta);
        }
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );

  server.tool(
    "lb_wallet_topup",
    "Generate a Stripe checkout URL to top up wallet balance. Returns a URL to complete payment.",
    {
      amount: z
        .number()
        .min(5)
        .describe("Top-up amount in USD (minimum $5)"),
    },
    {},
    async (params) => {
      try {
        const res = await client.request<TopupResponse>(
          "POST",
          "/api/v1/wallet/topup",
          { amount: params.amount },
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );
}
