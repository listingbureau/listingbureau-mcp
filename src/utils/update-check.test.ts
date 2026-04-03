import { describe, it, expect, beforeEach } from "vitest";
import { isNewerVersion, getUpdateNotice, resetForTesting } from "./update-check.js";

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

describe("getUpdateNotice", () => {
  beforeEach(() => {
    resetForTesting();
  });

  it("returns null when no update is available", () => {
    expect(getUpdateNotice()).toBeNull();
  });
});
