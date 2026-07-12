"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Bold, Italic, List, ListOrdered, Loader2 } from "lucide-react";

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
    const lastRange = useRef<Range | null>(null);
    const [pasting, setPasting] = useState(false);

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

    // Liefert den aktuellen Auswahlbereich, wenn er im Editor liegt.
    function currentRangeInEl(): Range | null {
      const el = ref.current;
      const sel = window.getSelection();
      if (el && sel && sel.rangeCount > 0) {
        const r = sel.getRangeAt(0);
        if (el.contains(r.commonAncestorContainer)) return r;
      }
      return null;
    }

    // Merkt sich die letzte Cursor-Position im Editor – auch bevor der Fokus
    // durch einen Klick auf Werkzeug-Knopf/Bild-Auswahl verloren geht.
    function saveSelection() {
      const r = currentRangeInEl();
      if (r) lastRange.current = r.cloneRange();
    }

    // Fügt einen Knoten an der aktuellen bzw. zuletzt gemerkten Stelle ein
    // (unabhängig vom Fokus). Ohne gültige Stelle: ans Ende hängen.
    function insertNodeAtCaret(node: Node) {
      const el = ref.current;
      if (!el) return;
      const range = currentRangeInEl() ?? lastRange.current;
      if (range && el.contains(range.commonAncestorContainer)) {
        range.deleteContents();
        range.insertNode(node);
        range.setStartAfter(node);
        range.collapse(true);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        lastRange.current = range.cloneRange();
      } else {
        el.appendChild(node);
      }
      onChange(el.innerHTML);
    }

    function htmlToFragment(html: string): DocumentFragment {
      const tpl = document.createElement("template");
      tpl.innerHTML = html;
      return tpl.content;
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

      saveSelection(); // Cursor-Position jetzt merken
      setPasting(true);
      const url = await uploadImage(file);
      setPasting(false);
      if (!url) return;

      const img = document.createElement("img");
      img.setAttribute("src", url);
      img.setAttribute("alt", "");
      insertNodeAtCaret(img);
    }

    // Text bzw. HTML (z. B. Bild) an der zuletzt gemerkten Cursor-Position einfügen.
    useImperativeHandle(handleRef, () => ({
      insertText(text: string) {
        insertNodeAtCaret(document.createTextNode(text));
      },
      insertHtml(html: string) {
        insertNodeAtCaret(htmlToFragment(html));
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
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            onBlur={saveSelection}
            className="min-h-40 w-full px-3 py-2 text-sm focus-visible:outline-none [&_img]:max-w-full [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
          />
          {placeholder && isEmptyHtml(value) ? (
            <p className="pointer-events-none absolute left-3 top-2 text-sm text-muted-foreground">
              {placeholder}
            </p>
          ) : null}
          {pasting ? (
            <div className="pointer-events-none absolute right-2 top-2 flex items-center gap-1 rounded bg-background/80 px-2 py-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Bild wird eingefügt …
            </div>
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
