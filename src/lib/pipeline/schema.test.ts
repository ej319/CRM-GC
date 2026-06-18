import { describe, it, expect } from "vitest";

import { customerInputSchema } from "./schema";

describe("customerInputSchema", () => {
  it("akzeptiert eine gültige Eingabe", () => {
    const result = customerInputSchema.safeParse({
      name: "Acme GmbH",
      email: "info@acme.de",
      monthlyValue: 100,
    });
    expect(result.success).toBe(true);
  });

  it("lehnt einen fehlenden Firmennamen ab", () => {
    const result = customerInputSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("lehnt eine ungültige E-Mail ab", () => {
    const result = customerInputSchema.safeParse({
      name: "Acme",
      email: "keine-mail",
    });
    expect(result.success).toBe(false);
  });

  it("erlaubt eine leere E-Mail", () => {
    const result = customerInputSchema.safeParse({ name: "Acme", email: "" });
    expect(result.success).toBe(true);
  });

  it("lehnt einen negativen Monatswert ab", () => {
    const result = customerInputSchema.safeParse({
      name: "Acme",
      monthlyValue: -5,
    });
    expect(result.success).toBe(false);
  });
});
