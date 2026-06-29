import { describe, it, expect } from "vitest";

import { safeNextPath } from "./url";

describe("safeNextPath", () => {
  it("erlaubt echte interne Pfade", () => {
    expect(safeNextPath("/kunde/123")).toBe("/kunde/123");
    expect(safeNextPath("/")).toBe("/");
  });

  it("blockt protokoll-relative und Backslash-Ziele (Open Redirect)", () => {
    expect(safeNextPath("//evil.com")).toBe("/");
    expect(safeNextPath("/\\evil.com")).toBe("/");
  });

  it("blockt absolute, externe und leere Eingaben", () => {
    expect(safeNextPath("https://evil.com")).toBe("/");
    expect(safeNextPath("evil.com")).toBe("/");
    expect(safeNextPath(null)).toBe("/");
    expect(safeNextPath(undefined)).toBe("/");
    expect(safeNextPath("")).toBe("/");
  });
});
