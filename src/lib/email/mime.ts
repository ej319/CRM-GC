// Baut eine RFC-822-Nachricht (für gmail.users.messages.send als base64url).
// Reine Formatier-Funktion (kein Geheimnis) – wird serverseitig in gmail.ts verwendet.

export interface RawAttachment {
  fileName: string;
  contentType: string;
  /** Dateiinhalt bereits als base64 (ohne Zeilenumbrüche). */
  base64: string;
}

interface BuildOptions {
  from: string;
  to: string;
  cc?: string;
  subject: string;
  html: string;
  attachments?: RawAttachment[];
}

/** RFC-2047-kodierung für Header mit Nicht-ASCII (z.B. Umlaute im Betreff). */
function encodeHeader(value: string): string {
  // eslint-disable-next-line no-control-regex
  if (/^[\x00-\x7F]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

/** base64 in 76-Zeichen-Zeilen umbrechen (MIME-konform). */
function wrap76(b64: string): string {
  return b64.replace(/(.{76})/g, "$1\r\n").trimEnd();
}

/** Baut die komplette Nachricht und gibt sie als base64url zurück (Gmail-Format). */
export function buildRawMessage(opts: BuildOptions): string {
  const { from, to, cc, subject, html, attachments = [] } = opts;
  const lines: string[] = [];
  lines.push(`From: ${from}`);
  lines.push(`To: ${to}`);
  if (cc) lines.push(`Cc: ${cc}`);
  lines.push(`Subject: ${encodeHeader(subject)}`);
  lines.push("MIME-Version: 1.0");

  const htmlB64 = wrap76(Buffer.from(html, "utf8").toString("base64"));

  if (attachments.length === 0) {
    lines.push('Content-Type: text/html; charset="UTF-8"');
    lines.push("Content-Transfer-Encoding: base64");
    lines.push("");
    lines.push(htmlB64);
  } else {
    const boundary = `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
    lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
    lines.push("");
    lines.push(`--${boundary}`);
    lines.push('Content-Type: text/html; charset="UTF-8"');
    lines.push("Content-Transfer-Encoding: base64");
    lines.push("");
    lines.push(htmlB64);
    for (const att of attachments) {
      const safeName = att.fileName.replace(/["\r\n]/g, "_");
      lines.push(`--${boundary}`);
      lines.push(`Content-Type: ${att.contentType || "application/octet-stream"}; name="${safeName}"`);
      lines.push("Content-Transfer-Encoding: base64");
      lines.push(`Content-Disposition: attachment; filename="${safeName}"`);
      lines.push("");
      lines.push(wrap76(att.base64));
    }
    lines.push(`--${boundary}--`);
  }

  const raw = lines.join("\r\n");
  return Buffer.from(raw, "utf8").toString("base64url");
}
