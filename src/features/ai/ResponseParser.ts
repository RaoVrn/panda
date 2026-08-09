/**
 * ResponseParser  -  normalizes model output so answers render cleanly.
 *
 * Applied to streamed + final text. Keeps the writing untouched, just tidies
 * whitespace and trims trailing space so the UI never shows double-blank
 * paragraphs or stray characters.
 */

/** Collapse runs of blank lines and trim trailing whitespace. */
export function normalizeResponse(text: string): string {
  return text
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+$/gm, "")
    .trim();
}

/** Extract a short plain-text preview (e.g. for collapsed answers). */
export function preview(text: string, max = 160): string {
  const clean = text.replace(/[`*_#>|]/g, "").replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max).trimEnd() + "…" : clean;
}
