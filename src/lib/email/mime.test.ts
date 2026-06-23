import { describe, it, expect } from "vitest";

import { buildRawMessage } from "./mime";

function decode(raw: string): string {
  return Buffer.from(raw, "base64url").toString("utf8");
}

describe("buildRawMessage", () => {
  it("baut eine einfache HTML-Mail mit Headern", () => {
    const raw = buildRawMessage({
      from: "absender@gc-facility.de",
      to: "kunde@example.de",
      subject: "Hallo",
      html: "<p>Test</p>",
    });
    const msg = decode(raw);
    expect(msg).toContain("From: absender@gc-facility.de");
    expect(msg).toContain("To: kunde@example.de");
    expect(msg).toContain("Subject: Hallo");
    expect(msg).toContain("Content-Type: text/html");
    // HTML-Body ist base64-kodiert enthalten.
    expect(msg).toContain(Buffer.from("<p>Test</p>", "utf8").toString("base64"));
  });

  it("kodiert Betreff mit Umlauten als RFC-2047", () => {
    const raw = buildRawMessage({
      from: "a@b.de",
      to: "c@d.de",
      subject: "Angebot für Gebäudereinigung",
      html: "<p>x</p>",
    });
    const msg = decode(raw);
    expect(msg).toContain("Subject: =?UTF-8?B?");
    expect(msg).not.toContain("Subject: Angebot für");
  });

  it("setzt einen CC-Header, wenn angegeben", () => {
    const raw = buildRawMessage({
      from: "a@b.de",
      to: "c@d.de",
      cc: "chef@b.de",
      subject: "x",
      html: "<p>x</p>",
    });
    expect(decode(raw)).toContain("Cc: chef@b.de");
  });

  it("baut multipart/mixed mit Anhang", () => {
    const raw = buildRawMessage({
      from: "a@b.de",
      to: "c@d.de",
      subject: "Mit Anhang",
      html: "<p>x</p>",
      attachments: [
        {
          fileName: "angebot.pdf",
          contentType: "application/pdf",
          base64: Buffer.from("PDF-Bytes").toString("base64"),
        },
      ],
    });
    const msg = decode(raw);
    expect(msg).toContain("Content-Type: multipart/mixed; boundary=");
    expect(msg).toContain('Content-Disposition: attachment; filename="angebot.pdf"');
    expect(msg).toContain("application/pdf");
  });
});
