import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { LBClient } from "../client/lb-client.js";
import type { MessageResponse } from "../client/types.js";
import { formatResult, formatErrorResult } from "../utils/response.js";

export function registerFeedbackTools(server: McpServer, client: LBClient) {
  server.tool(
    "lb_feedback_submit",
    "Submit feedback, feature requests, or suggestions (10-5000 characters).",
    {
      feedback: z
        .string()
        .min(10)
        .max(5000)
        .describe("Feedback text (10-5000 characters)"),
    },
    { idempotentHint: false },
    async (params) => {
      try {
        const res = await client.request<MessageResponse>(
          "POST",
          "/api/v1/feedback",
          { feedback: params.feedback },
          undefined,
          "lb_feedback_submit",
        );
        return formatResult(res.data);
      } catch (e) {
        return formatErrorResult(e);
      }
    },
  );
}
