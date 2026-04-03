import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { formatError } from "./errors.js";
import { getUpdateNotice } from "./update-check.js";

/**
 * Format a successful API response as an MCP tool result.
 * Handles both entity responses and message-only responses.
 * Surfaces `warning` and `balance_warning` fields independently.
 */
export function formatResult(data: unknown): CallToolResult {
  const warnings: string[] = [];
  let cleaned: Record<string, unknown> | unknown = data;

  if (data && typeof data === "object") {
    const obj = { ...(data as Record<string, unknown>) };

    // Top-level warning string
    if ("warning" in obj && typeof obj.warning === "string") {
      warnings.push(obj.warning);
      delete obj.warning;
    }

    // balance_warning object (independent of warning)
    if ("balance_warning" in obj && obj.balance_warning && typeof obj.balance_warning === "object") {
      const bw = obj.balance_warning as Record<string, unknown>;
      const parts: string[] = [];
      if (typeof bw.warning === "string" && bw.warning.trim()) parts.push(bw.warning);
      if (typeof bw.daily_cost_estimate === "number")
        parts.push(`Daily cost estimate: $${bw.daily_cost_estimate.toFixed(2)}`);
      if (typeof bw.balance === "number")
        parts.push(`Balance: $${bw.balance.toFixed(2)}`);
      if (typeof bw.days_remaining === "number")
        parts.push(`Days remaining: ${bw.days_remaining.toFixed(1)}`);
      if (parts.length > 0) warnings.push(parts.join(" | "));
      delete obj.balance_warning;
    }

    cleaned = obj;
  }

  let text = JSON.stringify(cleaned, null, 2);
  for (const w of warnings) {
    text += `\n\n⚠️ Warning: ${w}`;
  }

  const notice = getUpdateNotice();
  if (notice) {
    text += `\n\n${notice}`;
  }

  return {
    content: [{ type: "text", text }],
  };
}

/**
 * Format a paginated API response as an MCP tool result.
 * Includes pagination metadata.
 */
export function formatPaginatedResult(
  data: unknown,
  meta: { page: number; per_page: number; total: number; total_pages: number },
): CallToolResult {
  const result = {
    data,
    pagination: meta,
  };
  let text = JSON.stringify(result, null, 2);

  const notice = getUpdateNotice();
  if (notice) {
    text += `\n\n${notice}`;
  }

  return {
    content: [{ type: "text", text }],
  };
}

/** Format an error as an MCP tool error result. */
export function formatErrorResult(error: unknown): CallToolResult {
  return {
    content: [{ type: "text", text: formatError(error) }],
    isError: true,
  };
}
