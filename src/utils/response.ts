import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { formatError } from "./errors.js";

/**
 * Format a successful API response as an MCP tool result.
 * Handles both entity responses and message-only responses.
 * Surfaces `warning` fields (e.g., wallet balance warnings).
 */
export function formatResult(data: unknown): CallToolResult {
  let text: string;

  if (data && typeof data === "object" && "warning" in data) {
    const { warning, ...rest } = data as Record<string, unknown>;
    text = JSON.stringify(rest, null, 2);
    text += `\n\n Warning: ${warning}`;
  } else {
    text = JSON.stringify(data, null, 2);
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
  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
  };
}

/** Format an error as an MCP tool error result. */
export function formatErrorResult(error: unknown): CallToolResult {
  return {
    content: [{ type: "text", text: formatError(error) }],
    isError: true,
  };
}
