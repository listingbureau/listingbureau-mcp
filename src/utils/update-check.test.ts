import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  isNewerVersion,
  getUpdateNotice,
  checkForUpdate,
  resetForTesting,
} from "./update-check.js";

describe("isNewerVersion", () => {
  it("returns true when latest major is greater", () => {
    expect(isNewerVersion("2.0.0", "1.0.0")).toBe(true);
  });

  it("returns true when latest minor is greater", () => {
    expect(isNewerVersion("1.2.0", "1.1.0")).toBe(true);
  });

  it("returns true when latest patch is greater", () => {
    expect(isNewerVersion("1.0.2", "1.0.1")).toBe(true);
  });

  it("returns false when versions are equal", () => {
    expect(isNewerVersion("1.0.0", "1.0.0")).toBe(false);
  });

  it("returns false when current is newer", () => {
    expect(isNewerVersion("1.0.0", "1.0.1")).toBe(false);
    expect(isNewerVersion("1.0.0", "2.0.0")).toBe(false);
  });

  it("returns false for malformed versions", () => {
    expect(isNewerVersion("abc", "1.0.0")).toBe(false);
    expect(isNewerVersion("1.0.0", "abc")).toBe(false);
    expect(isNewerVersion("1.0", "1.0.0")).toBe(false);
    expect(isNewerVersion("1.0.0.0", "1.0.0")).toBe(false);
  });

  it("returns false when a segment is NaN", () => {
    expect(isNewerVersion("1.0.x", "1.0.0")).toBe(false);
    expect(isNewerVersion("1.0.0", "1.0.x")).toBe(false);
  });

  it("handles higher minor but lower patch correctly", () => {
    expect(isNewerVersion("1.2.0", "1.1.9")).toBe(true);
  });

  it("handles higher major but lower minor/patch correctly", () => {
    expect(isNewerVersion("2.0.0", "1.9.9")).toBe(true);
  });
});

describe("checkForUpdate + getUpdateNotice", () => {
  beforeEach(() => {
    resetForTesting();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when no update check has run", () => {
    expect(getUpdateNotice()).toBeNull();
  });

  it("sets notice when npm returns a newer version", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ version: "2.0.0" }),
      }),
    );

    await checkForUpdate("1.0.0");

    const notice = getUpdateNotice();
    expect(notice).toContain("Update available: v1.0.0 → v2.0.0");
    expect(notice).toContain("npx listingbureau-mcp@latest");
    expect(notice).toContain("releases/latest");
  });

  it("consumes notice on first call, returns null on second", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ version: "2.0.0" }),
      }),
    );

    await checkForUpdate("1.0.0");

    expect(getUpdateNotice()).not.toBeNull();
    expect(getUpdateNotice()).toBeNull();
  });

  it("stays null when fetch throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network error")),
    );

    await checkForUpdate("1.0.0");

    expect(getUpdateNotice()).toBeNull();
  });

  it("stays null when response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: "not found" }),
      }),
    );

    await checkForUpdate("1.0.0");

    expect(getUpdateNotice()).toBeNull();
  });

  it("stays null when npm version equals current", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ version: "1.0.0" }),
      }),
    );

    await checkForUpdate("1.0.0");

    expect(getUpdateNotice()).toBeNull();
  });

  it("second checkForUpdate after consume still returns null (once-per-process)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ version: "2.0.0" }),
      }),
    );

    await checkForUpdate("1.0.0");
    expect(getUpdateNotice()).not.toBeNull(); // consumed
    expect(getUpdateNotice()).toBeNull(); // already consumed

    // Second check overwrites updateNotice, but noticeConsumed stays true
    await checkForUpdate("1.0.0");
    expect(getUpdateNotice()).toBeNull();
  });

  it("stays null when json() throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error("invalid json")),
      }),
    );

    await checkForUpdate("1.0.0");

    expect(getUpdateNotice()).toBeNull();
  });

  it("stays null when version is empty, null, or non-string", async () => {
    for (const version of ["", null, undefined, 0, 123]) {
      resetForTesting();
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ version }),
        }),
      );

      await checkForUpdate("1.0.0");

      expect(getUpdateNotice()).toBeNull();
    }
  });

  it("stays null when npm returns malformed version", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ version: "not-a-version" }),
      }),
    );

    await checkForUpdate("1.0.0");

    expect(getUpdateNotice()).toBeNull();
  });
});
