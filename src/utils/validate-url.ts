/**
 * Validate and normalize a base URL for API requests.
 * - Rejects invalid URLs and non-http(s) protocols
 * - Non-localhost URLs must use https://
 * - Returns URL.origin (never includes trailing slash per WHATWG spec)
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
    // IPv4-mapped IPv6 loopback — Node normalizes 127.x.y.z to [::ffff:7fXX:XXXX]
    (parsed.hostname.startsWith("[::ffff:7f") && parsed.hostname.endsWith("]"));

  if (parsed.protocol === "http:" && !isLocalhost) {
    throw new Error(
      `Invalid LB_BASE_URL: http:// is only allowed for localhost — use https:// for "${parsed.hostname}"`,
    );
  }

  return parsed.origin;
}
