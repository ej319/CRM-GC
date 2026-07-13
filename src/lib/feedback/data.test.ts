import { describe, it, expect } from "vitest";
import {
  kindLabel,
  statusLabel,
  KIND_OPTIONS,
  STATUS_OPTIONS,
} from "./data";

describe("feedback labels", () => {
  it("übersetzt Art-Werte", () => {
    expect(kindLabel("fehler")).toBe("Fehler");
    expect(kindLabel("idee")).toBe("Idee");
    expect(kindLabel("frage")).toBe("Frage");
  });

  it("übersetzt Status-Werte", () => {
    expect(statusLabel("neu")).toBe("Neu");
    expect(statusLabel("in_arbeit")).toBe("In Arbeit");
    expect(statusLabel("erledigt")).toBe("Erledigt");
  });

  it("lässt unbekannte Werte unverändert", () => {
    expect(kindLabel("xxx")).toBe("xxx");
    expect(statusLabel("yyy")).toBe("yyy");
  });

  it("bietet vollständige Optionslisten", () => {
    expect(KIND_OPTIONS).toHaveLength(3);
    expect(STATUS_OPTIONS).toHaveLength(3);
  });
});
