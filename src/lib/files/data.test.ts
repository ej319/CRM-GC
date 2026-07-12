import { describe, it, expect } from "vitest";
import {
  buildFileEntries,
  formatFileSize,
  type CustomerFile,
  type EmailWithAttachments,
} from "./data";

const files: CustomerFile[] = [
  {
    id: "f1",
    fileName: "angebot.pdf",
    description: "Angebot März",
    fileSize: 2048,
    storagePath: "a/angebot.pdf",
    createdAt: "2026-07-10T10:00:00Z",
  },
];

const emails: EmailWithAttachments[] = [
  {
    subject: "Ihr Angebot",
    sentAt: "2026-07-11T09:00:00Z",
    attachments: [
      { id: "e1", fileName: "flyer.pdf", fileSize: 500, storagePath: "x/flyer.pdf" },
    ],
  },
];

describe("buildFileEntries", () => {
  it("führt eigene Dateien und E-Mail-Anhänge zusammen", () => {
    const res = buildFileEntries(files, emails);
    expect(res).toHaveLength(2);
  });

  it("sortiert neueste zuerst", () => {
    const res = buildFileEntries(files, emails);
    // E-Mail (11.07.) vor eigener Datei (10.07.)
    expect(res[0].origin).toBe("email");
    expect(res[1].origin).toBe("upload");
  });

  it("markiert Herkunft und Löschbarkeit korrekt", () => {
    const res = buildFileEntries(files, emails);
    const upload = res.find((e) => e.origin === "upload")!;
    const mail = res.find((e) => e.origin === "email")!;
    expect(upload.canDelete).toBe(true);
    expect(upload.bucket).toBe("customer-files");
    expect(upload.description).toBe("Angebot März");
    expect(mail.canDelete).toBe(false);
    expect(mail.bucket).toBe("email-attachments");
    expect(mail.emailSubject).toBe("Ihr Angebot");
  });

  it("kommt mit leeren Listen klar", () => {
    expect(buildFileEntries([], [])).toEqual([]);
  });
});

describe("formatFileSize", () => {
  it("zeigt KB unter 1 MB", () => {
    expect(formatFileSize(2048)).toBe("2 KB");
  });
  it("zeigt MB ab 1 MB mit Komma", () => {
    expect(formatFileSize(1572864)).toBe("1,5 MB");
  });
  it("kommt mit 0/negativ klar", () => {
    expect(formatFileSize(0)).toBe("0 KB");
  });
});
