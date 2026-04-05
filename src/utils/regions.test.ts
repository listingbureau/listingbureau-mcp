import { describe, it, expect } from "vitest";
import {
  VALID_REGIONS,
  ACCEPTED_REGIONS,
  SFB_REGIONS,
  SfbRegionError,
  normalizeRegion,
  assertSfbAllowed,
} from "./regions.js";

describe("VALID_REGIONS", () => {
  it("contains 18 canonical region codes", () => {
    expect(VALID_REGIONS).toHaveLength(18);
  });

  it("does not include GB (alias only)", () => {
    expect(VALID_REGIONS).not.toContain("GB");
  });

  it("includes US and UK", () => {
    expect(VALID_REGIONS).toContain("US");
    expect(VALID_REGIONS).toContain("UK");
  });
});

describe("ACCEPTED_REGIONS", () => {
  it("contains 19 codes (18 canonical + GB alias)", () => {
    expect(ACCEPTED_REGIONS).toHaveLength(19);
  });

  it("includes GB", () => {
    expect(ACCEPTED_REGIONS).toContain("GB");
  });

  it("is a superset of VALID_REGIONS", () => {
    for (const region of VALID_REGIONS) {
      expect(ACCEPTED_REGIONS).toContain(region);
    }
  });
});

describe("SFB_REGIONS", () => {
  it("contains only US", () => {
    expect(SFB_REGIONS.size).toBe(1);
    expect(SFB_REGIONS.has("US")).toBe(true);
  });

  it("does not contain UK, DE, etc.", () => {
    expect(SFB_REGIONS.has("UK")).toBe(false);
    expect(SFB_REGIONS.has("DE")).toBe(false);
    expect(SFB_REGIONS.has("JP")).toBe(false);
  });
});

describe("normalizeRegion", () => {
  it("converts GB to UK", () => {
    expect(normalizeRegion("GB")).toBe("UK");
  });

  it("passes through US unchanged", () => {
    expect(normalizeRegion("US")).toBe("US");
  });

  it("passes through UK unchanged", () => {
    expect(normalizeRegion("UK")).toBe("UK");
  });

  it("passes through all other canonical regions unchanged", () => {
    for (const region of VALID_REGIONS) {
      expect(normalizeRegion(region)).toBe(region);
    }
  });
});

describe("assertSfbAllowed", () => {
  it("does not throw for US region with SFB", () => {
    expect(() => assertSfbAllowed("US", true)).not.toThrow();
  });

  it("does not throw when hasSfb is false regardless of region", () => {
    expect(() => assertSfbAllowed("UK", false)).not.toThrow();
    expect(() => assertSfbAllowed("DE", false)).not.toThrow();
    expect(() => assertSfbAllowed("JP", false)).not.toThrow();
  });

  it("throws for UK region with SFB", () => {
    expect(() => assertSfbAllowed("UK", true)).toThrow(/US-region/);
    expect(() => assertSfbAllowed("UK", true)).toThrow(/UK/);
  });

  it("throws for DE region with SFB", () => {
    expect(() => assertSfbAllowed("DE", true)).toThrow(/DE/);
  });

  it("throws for any non-US region with SFB", () => {
    const nonUs = VALID_REGIONS.filter((r) => r !== "US");
    for (const region of nonUs) {
      expect(() => assertSfbAllowed(region, true)).toThrow(/US-region/);
    }
  });

  it("throws SfbRegionError with the actual region code in the message", () => {
    expect(() => assertSfbAllowed("JP", true)).toThrow(SfbRegionError);
    expect(() => assertSfbAllowed("JP", true)).toThrow("JP");
  });
});
