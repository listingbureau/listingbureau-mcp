import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { LBClient } from "../client/lb-client.js";
import type { MessageResponse } from "../client/types.js";
import { formatResult, formatErrorResult } from "../utils/response.js";

export function registerFeedbackTools(server: McpServer, client: LBClient) {
  server.tool(
    "lb_feedback_submit",
    "Submit feedback to Listing Bureau (10-5000 characters). Do not submit duplicate feedback -- identical text will be rejected.",
    {
      feedback: z
        .string()
        .min(10)
        .max(5000)
        .describe("Feedback text (10-5000 characters)"),
    },
    {},
    async (params) => {
      try {
        const res = await client.request<MessageResponse>(
          "POST",
          "/api/v1/feedback",
          { feedback: params.feedback },
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );
}
