import { describe, it, expect } from "vitest";
import { toDialNumber } from "./format";

describe("toDialNumber", () => {
  it("entfernt Leerzeichen, Klammern und Bindestriche", () => {
    expect(toDialNumber("030 / 44 03 20")).toBe("030440320");
    expect(toDialNumber("(030) 12-34")).toBe("0301234");
  });

  it("behält ein führendes Plus", () => {
    expect(toDialNumber("+49 30 1234567")).toBe("+49301234567");
  });

  it("gibt null ohne Ziffern oder bei leer zurück", () => {
    expect(toDialNumber("")).toBeNull();
    expect(toDialNumber("   ")).toBeNull();
    expect(toDialNumber("kein Anschluss")).toBeNull();
    expect(toDialNumber(undefined)).toBeNull();
  });
});
