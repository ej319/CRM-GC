// Serverseitiges Bereinigen des vom Editor gelieferten HTML-Texts (XSS-Schutz).
// Reine Funktion (über sanitize-html) – wird ausschließlich serverseitig (in actions.ts)
// verwendet. Bewusst ohne "server-only", damit sie isoliert testbar bleibt.
import sanitizeHtml from "sanitize-html";

const OPTIONS: sanitizeHtml.IOptions = {
  // Nur einfache Formatierung – passend zum Editor (fett/kursiv/unterstrichen/Listen/Links).
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
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  // Erlaubte Links härten (kein Tab-Nabbing); <script>/<style>-Inhalte entfernt
  // sanitize-html standardmäßig komplett.
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      rel: "noopener noreferrer",
      target: "_blank",
    }),
  },
};

/** Bereinigt unsicheren HTML-Text auf eine sichere Tag-/Attribut-Auswahl. */
export function sanitizeEmailHtml(dirty: string): string {
  return sanitizeHtml(dirty ?? "", OPTIONS);
}
