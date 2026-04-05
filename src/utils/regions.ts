// Centralized region constants and validation for Listing Bureau MCP tools.

/** Canonical 18 backend region codes (matches CONSTANTS['MARKETPLACES'] in Flask). */
export const VALID_REGIONS = [
  "US", "CA", "MX",          // Americas
  "UK", "DE", "FR", "IT",    // Europe
  "ES", "NL", "SE", "TR",    // Europe cont.
  "JP", "AU", "IN",          // Asia-Pacific
  "AE", "BR", "SG", "SA",   // Rest of world
] as const;

/**
 * All accepted region codes for MCP tool input (19-element tuple).
 * Includes GB as an alias for UK. Declared as a flat literal tuple
 * because z.enum() requires a literal non-empty tuple type.
 */
export const ACCEPTED_REGIONS = [
  "US", "CA", "MX",
  "UK", "DE", "FR", "IT",
  "ES", "NL", "SE", "TR",
  "JP", "AU", "IN",
  "AE", "BR", "SG", "SA",
  "GB",
] as const;

/** Regions where SFB (Search Find Buy) is available. */
export const SFB_REGIONS = new Set<(typeof VALID_REGIONS)[number]>(["US"]);

/** Normalize user-supplied region code: GB -> UK, all others passthrough. */
export function normalizeRegion(region: string): string {
  return region === "GB" ? "UK" : region;
}

/** Typed error thrown by assertSfbAllowed for non-US SFB requests. */
export class SfbRegionError extends Error {
  constructor(region: string) {
    super(
      `SFB (Search Find Buy) is only available for US-region projects. This project's region is ${region}. Remove SFB volumes or use a US-region project.`,
    );
    this.name = "SfbRegionError";
  }
}

/**
 * Assert that SFB is allowed for the given region.
 * Throws SfbRegionError if the region is not in SFB_REGIONS.
 *
 * @param region - Canonical region code (already normalized)
 * @param hasSfb - Whether the request includes SFB volumes > 0
 */
export function assertSfbAllowed(region: string, hasSfb: boolean): void {
  if (hasSfb && !SFB_REGIONS.has(region as (typeof VALID_REGIONS)[number])) {
    throw new SfbRegionError(region);
  }
}
