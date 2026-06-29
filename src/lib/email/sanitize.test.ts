import { describe, it, expect } from "vitest";

import { sanitizeEmailHtml } from "./sanitize";

describe("sanitizeEmailHtml", () => {
  it("behält erlaubte Formatierungs-Tags", () => {
    const out = sanitizeEmailHtml(
      "<b>fett</b> <i>kursiv</i> <u>unterstrichen</u><ul><li>Punkt</li></ul>",
    );
    expect(out).toContain("<b>fett</b>");
    expect(out).toContain("<i>kursiv</i>");
    expect(out).toContain("<u>unterstrichen</u>");
    expect(out).toContain("<ul><li>Punkt</li></ul>");
  });

  it("entfernt <script> samt Inhalt (XSS)", () => {
    const out = sanitizeEmailHtml("<p>ok</p><script>alert(1)</script>");
    expect(out).not.toContain("<script");
    expect(out).not.toContain("alert(1)");
    expect(out).toContain("<p>ok</p>");
  });

  it("entfernt Event-Handler und gefährliche Elemente", () => {
    const out = sanitizeEmailHtml(
      '<p onclick="evil()">x</p><img src="x" onerror="evil()">',
    );
    expect(out).not.toContain("onclick");
    expect(out).not.toContain("onerror");
    expect(out).not.toContain("<img");
    expect(out).toContain("<p>x</p>");
  });

  it("neutralisiert javascript:-Links und härtet erlaubte Links", () => {
    const evil = sanitizeEmailHtml('<a href="javascript:alert(1)">x</a>');
    expect(evil).not.toContain("javascript:");

    const ok = sanitizeEmailHtml('<a href="https://gc-facility.de">Seite</a>');
    expect(ok).toContain('href="https://gc-facility.de"');
    expect(ok).toContain('rel="noopener noreferrer"');
    expect(ok).toContain('target="_blank"');
  });

  it("kommt mit leerer Eingabe klar", () => {
    expect(sanitizeEmailHtml("")).toBe("");
  });
});
