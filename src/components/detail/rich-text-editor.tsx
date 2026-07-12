"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type ReactNode,
} from "react";
import { Bold, Italic, List, ListOrdered } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/** Von außen aufrufbare Methoden des Editors (z. B. Platzhalter/Bild einfügen). */
export interface RichTextEditorHandle {
  insertText: (text: string) => void;
  insertHtml: (html: string) => void;
}

interface RichTextEditorProps {
  /** Aktueller Inhalt als HTML. */
  value: string;
  /** Liefert den neuen HTML-Inhalt bei jeder Änderung. */
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  /** Zusätzliche Knöpfe rechts in der Werkzeugleiste (z. B. „Platzhalter"). */
  toolbarExtra?: ReactNode;
  /** Wird gemeldet, wenn der Textbereich den Fokus erhält. */
  onFocus?: () => void;
  /**
   * Lädt ein eingefügtes (kopiertes) Bild als eigenes Bild hoch und liefert die
   * App-Bildadresse zurück (oder null bei Fehler). Ist dies gesetzt, werden
   * per Strg+V eingefügte Bilder automatisch übernommen.
   */
  uploadImage?: (file: File) => Promise<string | null>;
}

/** Prüft, ob der Editor (HTML) inhaltlich leer ist – für die Platzhalter-Anzeige. */
function isEmptyHtml(html: string): boolean {
  const text = html
    .replace(/<br\s*\/?>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, "")
    .trim();
  return text.length === 0;
}

/**
 * Schlanker Formatierungs-Editor (fett, kursiv, Listen) ohne externe Bibliothek.
 * Gibt formatierten Text als HTML aus – die Bereinigung gegen Schadcode (XSS)
 * passiert serverseitig im Versand (siehe /lib/email).
 */
export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  function RichTextEditor(
    { value, onChange, placeholder, className, toolbarExtra, onFocus, uploadImage },
    handleRef,
  ) {
    const ref = useRef<HTMLDivElement>(null);

    // Externe Wertänderungen (z. B. Zurücksetzen nach dem Senden) übernehmen,
    // ohne beim Tippen den Cursor zu verschieben: Beim Tippen ist value === innerHTML,
    // daher greift das nur bei echten Änderungen von außen.
    useEffect(() => {
      const el = ref.current;
      if (el && value !== el.innerHTML) {
        el.innerHTML = value;
      }
    }, [value]);

    function exec(command: string) {
      document.execCommand(command, false);
      const el = ref.current;
      if (el) {
        el.focus();
        onChange(el.innerHTML);
      }
    }

    function handleInput() {
      const el = ref.current;
      if (el) onChange(el.innerHTML);
    }

    // Eingefügtes (kopiertes) Bild automatisch als eigenes Bild hochladen und
    // einbetten – so bleibt es beim Speichern erhalten und wird sicher verschickt.
    async function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
      if (!uploadImage) return; // ohne Uploader: normales Einfügen
      const items = Array.from(e.clipboardData?.items ?? []);
      const imageItem = items.find(
        (it) => it.kind === "file" && it.type.startsWith("image/"),
      );
      if (!imageItem) return; // kein Bild → Text/HTML normal einfügen
      const file = imageItem.getAsFile();
      if (!file) return;
      e.preventDefault(); // fremdes Bild NICHT direkt einfügen
      const url = await uploadImage(file);
      const el = ref.current;
      if (url && el) {
        el.focus();
        document.execCommand("insertHTML", false, `<img src="${url}" alt="" />`);
        onChange(el.innerHTML);
      }
    }

    // Text bzw. HTML (z. B. Bild) an der aktuellen Cursor-Position einfügen.
    useImperativeHandle(handleRef, () => ({
      insertText(text: string) {
        const el = ref.current;
        if (!el) return;
        el.focus();
        document.execCommand("insertText", false, text);
        onChange(el.innerHTML);
      },
      insertHtml(html: string) {
        const el = ref.current;
        if (!el) return;
        el.focus();
        document.execCommand("insertHTML", false, html);
        onChange(el.innerHTML);
      },
    }));

    return (
      <div className={cn("rounded-md border border-input bg-background", className)}>
        <div className="flex items-center gap-0.5 border-b border-input p-1">
          <ToolbarButton label="Fett" onClick={() => exec("bold")}>
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Kursiv" onClick={() => exec("italic")}>
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <Separator orientation="vertical" className="mx-1 h-5" />
          <ToolbarButton label="Aufzählung" onClick={() => exec("insertUnorderedList")}>
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Nummerierte Liste"
            onClick={() => exec("insertOrderedList")}
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          {toolbarExtra ? (
            <>
              <Separator orientation="vertical" className="mx-1 h-5" />
              {toolbarExtra}
            </>
          ) : null}
        </div>

        <div className="relative">
          <div
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-label="Nachrichtentext"
            onInput={handleInput}
            onFocus={onFocus}
            onPaste={handlePaste}
            className="min-h-40 w-full px-3 py-2 text-sm focus-visible:outline-none [&_img]:max-w-full [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
          />
          {placeholder && isEmptyHtml(value) ? (
            <p className="pointer-events-none absolute left-3 top-2 text-sm text-muted-foreground">
              {placeholder}
            </p>
          ) : null}
        </div>
      </div>
    );
  },
);

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      // Verhindert, dass der Editor beim Klick den Fokus/die Auswahl verliert –
      // sonst greift die Formatierung nicht auf den markierten Text.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  );
}
