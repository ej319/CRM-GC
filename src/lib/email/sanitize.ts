// Serverseitiges Bereinigen des vom Editor gelieferten HTML-Texts (XSS-Schutz).
// Reine Funktion (über sanitize-html) – wird ausschließlich serverseitig (in actions.ts)
// verwendet. Bewusst ohne "server-only", damit sie isoliert testbar bleibt.
import sanitizeHtml from "sanitize-html";

// Nur eigene Bilder zulassen: die login-geschützte App-Route oder – nach dem
// Einbetten im Versand – ein Mail-interner cid-Verweis. Fremde/fehlende Quellen
// (andere URLs, data:, javascript:) werden verworfen.
function isOwnImageSrc(src: string): boolean {
  if (src.startsWith("cid:")) return true;
  if (src.startsWith("/api/email/image/")) return true;
  // Auch vollständige Adressen auf die eigene Bild-Route zulassen (manche
  // Editoren speichern src absolut, z. B. https://…/api/email/image/…).
  try {
    return new URL(src).pathname.startsWith("/api/email/image/");
  } catch {
    return false;
  }
}

const OPTIONS: sanitizeHtml.IOptions = {
  // Einfache Formatierung (fett/kursiv/unterstrichen/Listen/Links) plus eigene
  // Bilder (Signatur/Vorlagen, PROJ-15).
  allowedTags: [
    "p",
    "br",
    "div",
    "span",
    "b",
    "strong",
    "i",
    "em",
    "u",
    "s",
    "ul",
    "ol",
    "li",
    "h3",
    "h4",
    "blockquote",
    "a",
    "img",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  // cid: als Bild-Schema erlauben (Mail-interne Bilder nach dem Einbetten).
  allowedSchemesByTag: {
    img: ["http", "https", "cid"],
  },
  // Erlaubte Links härten (kein Tab-Nabbing); <script>/<style>-Inhalte entfernt
  // sanitize-html standardmäßig komplett.
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      rel: "noopener noreferrer",
      target: "_blank",
    }),
  },
  // Bilder mit fremder/fehlender Quelle vollständig entfernen (nur eigene bleiben).
  exclusiveFilter(frame) {
    if (frame.tag === "img") {
      return !isOwnImageSrc(frame.attribs.src ?? "");
    }
    return false;
  },
};

/** Bereinigt unsicheren HTML-Text auf eine sichere Tag-/Attribut-Auswahl. */
export function sanitizeEmailHtml(dirty: string): string {
  return sanitizeHtml(dirty ?? "", OPTIONS);
}
