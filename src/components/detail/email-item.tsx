"use client";

import { Mail, Paperclip, Eye, EyeOff, Download } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/notes/data";
import { stripHtml, type Email } from "@/lib/email/data";

/** Ein gesendeter E-Mail-Eintrag im Verlauf. */
export function EmailItem({ email }: { email: Email }) {
  async function openAttachment(path: string, name: string) {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from("email-attachments")
      .createSignedUrl(path, 60, { download: name });
    if (error || !data) return;
    window.open(data.signedUrl, "_blank");
  }

  const text = stripHtml(email.bodyHtml);

  return (
    <div className="rounded-lg border bg-card p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4 shrink-0" />
          <span>
            An: <span className="text-foreground">{email.to}</span>
            {email.cc ? ` · CC: ${email.cc}` : ""}
          </span>
        </div>
        <time className="shrink-0 text-xs text-muted-foreground">
          {formatDateTime(email.sentAt)}
        </time>
      </div>

      {email.subject ? (
        <p className="mt-1.5 font-medium">{email.subject}</p>
      ) : (
        <p className="mt-1.5 italic text-muted-foreground">(kein Betreff)</p>
      )}

      {text ? (
        <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{text}</p>
      ) : null}

      {email.attachments.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-2">
          {email.attachments.map((att) => (
            <li key={att.id}>
              <button
                type="button"
                onClick={() => openAttachment(att.storagePath, att.fileName)}
                className="flex items-center gap-1 rounded-full border bg-muted px-2 py-1 text-xs hover:bg-accent"
              >
                <Paperclip className="h-3 w-3" />
                {att.fileName}
                <Download className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-2 flex items-center gap-1 text-xs">
        {email.openedAt ? (
          <span className="flex items-center gap-1 text-green-600">
            <Eye className="h-3 w-3" /> geöffnet am {formatDateTime(email.openedAt)}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-muted-foreground">
            <EyeOff className="h-3 w-3" /> noch nicht geöffnet
          </span>
        )}
      </div>
    </div>
  );
}
