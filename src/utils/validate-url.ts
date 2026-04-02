/**
 * Validate and normalize a base URL for API requests.
 * - Rejects invalid URLs and non-http(s) protocols
 * - Non-localhost URLs must use https://
 * - Strips trailing slash for consistent path concatenation
 */
export function validateBaseUrl(raw: string): string {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(
      `Invalid LB_BASE_URL: "${raw}" is not a valid URL`,
    );
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(
      `Invalid LB_BASE_URL: protocol "${parsed.protocol}" is not allowed (must be http: or https:)`,
    );
  }

  const isLocalhost =
    parsed.hostname === "localhost" ||
    parsed.hostname === "127.0.0.1" ||
    parsed.hostname === "[::1]" ||
    // IPv4-mapped IPv6 loopback (e.g. [::ffff:127.0.0.1] → normalized to [::ffff:7f00:1])
    parsed.hostname === "[::ffff:7f00:1]";

  if (parsed.protocol === "http:" && !isLocalhost) {
    throw new Error(
      `Invalid LB_BASE_URL: http:// is only allowed for localhost — use https:// for "${parsed.hostname}"`,
    );
  }

  // Strip trailing slash for consistent path concatenation
  return parsed.origin.replace(/\/$/, "");
}
