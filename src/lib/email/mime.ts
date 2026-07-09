// Baut eine RFC-822-Nachricht (für gmail.users.messages.send als base64url).
// Reine Formatier-Funktion (kein Geheimnis) – wird serverseitig in gmail.ts verwendet.

export interface RawAttachment {
  fileName: string;
  contentType: string;
  /** Dateiinhalt bereits als base64 (ohne Zeilenumbrüche). */
  base64: string;
}

/** Ein ins HTML eingebettetes Bild (inline), referenziert über cid. */
export interface InlineImage {
  fileName: string;
  contentType: string;
  base64: string;
  /** Content-ID; im HTML als src="cid:<cid>" referenziert. */
  cid: string;
}

interface BuildOptions {
  from: string;
  to: string;
  cc?: string;
  subject: string;
  html: string;
  attachments?: RawAttachment[];
  inlineImages?: InlineImage[];
}

/** RFC-2047-kodierung für Header mit Nicht-ASCII (z.B. Umlaute im Betreff). */
function encodeHeader(value: string): string {
  // CR/LF entfernen → verhindert Header-Injection über den Betreff (QA-Finding L1).
  const clean = value.replace(/[\r\n]+/g, " ");
  // eslint-disable-next-line no-control-regex
  if (/^[\x00-\x7F]*$/.test(clean)) return clean;
  return `=?UTF-8?B?${Buffer.from(clean, "utf8").toString("base64")}?=`;
}

/** base64 in 76-Zeichen-Zeilen umbrechen (MIME-konform). */
function wrap76(b64: string): string {
  return b64.replace(/(.{76})/g, "$1\r\n").trimEnd();
}

function boundary(prefix = "b"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

/** Baut die komplette Nachricht und gibt sie als base64url zurück (Gmail-Format). */
export function buildRawMessage(opts: BuildOptions): string {
  const { from, to, cc, subject, html, attachments = [], inlineImages = [] } = opts;
  const lines: string[] = [];
  lines.push(`From: ${from}`);
  lines.push(`To: ${to}`);
  if (cc) lines.push(`Cc: ${cc}`);
  lines.push(`Subject: ${encodeHeader(subject)}`);
  lines.push("MIME-Version: 1.0");

  const htmlB64 = wrap76(Buffer.from(html, "utf8").toString("base64"));

  const emitHtml = () => {
    lines.push('Content-Type: text/html; charset="UTF-8"');
    lines.push("Content-Transfer-Encoding: base64");
    lines.push("");
    lines.push(htmlB64);
  };
  const emitAttachment = (att: RawAttachment) => {
    const safeName = att.fileName.replace(/["\r\n]/g, "_");
    lines.push(`Content-Type: ${att.contentType || "application/octet-stream"}; name="${safeName}"`);
    lines.push("Content-Transfer-Encoding: base64");
    lines.push(`Content-Disposition: attachment; filename="${safeName}"`);
    lines.push("");
    lines.push(wrap76(att.base64));
  };
  const emitInline = (img: InlineImage) => {
    const safeName = img.fileName.replace(/["\r\n]/g, "_");
    lines.push(`Content-Type: ${img.contentType || "application/octet-stream"}; name="${safeName}"`);
    lines.push("Content-Transfer-Encoding: base64");
    lines.push(`Content-ID: <${img.cid}>`);
    lines.push(`Content-Disposition: inline; filename="${safeName}"`);
    lines.push("");
    lines.push(wrap76(img.base64));
  };
  // Text + eingebettete Bilder als ein multipart/related-Block.
  const emitRelated = (rel: string) => {
    lines.push(`--${rel}`);
    emitHtml();
    for (const img of inlineImages) {
      lines.push(`--${rel}`);
      emitInline(img);
    }
    lines.push(`--${rel}--`);
  };

  const hasInline = inlineImages.length > 0;
  const hasAtt = attachments.length > 0;

  if (!hasInline && !hasAtt) {
    // Reine HTML-Mail (unverändert).
    emitHtml();
  } else if (!hasInline && hasAtt) {
    // Text + Datei-Anhänge (unverändert): multipart/mixed.
    const mixed = boundary();
    lines.push(`Content-Type: multipart/mixed; boundary="${mixed}"`);
    lines.push("");
    lines.push(`--${mixed}`);
    emitHtml();
    for (const att of attachments) {
      lines.push(`--${mixed}`);
      emitAttachment(att);
    }
    lines.push(`--${mixed}--`);
  } else if (hasInline && !hasAtt) {
    // Text + eingebettete Bilder: multipart/related.
    const rel = boundary("r");
    lines.push(`Content-Type: multipart/related; boundary="${rel}"`);
    lines.push("");
    emitRelated(rel);
  } else {
    // Text + eingebettete Bilder + Datei-Anhänge: mixed[ related[html,bilder], anhänge ].
    const mixed = boundary("m");
    const rel = boundary("r");
    lines.push(`Content-Type: multipart/mixed; boundary="${mixed}"`);
    lines.push("");
    lines.push(`--${mixed}`);
    lines.push(`Content-Type: multipart/related; boundary="${rel}"`);
    lines.push("");
    emitRelated(rel);
    for (const att of attachments) {
      lines.push(`--${mixed}`);
      emitAttachment(att);
    }
    lines.push(`--${mixed}--`);
  }

  const raw = lines.join("\r\n");
  return Buffer.from(raw, "utf8").toString("base64url");
}
