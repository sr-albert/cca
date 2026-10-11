const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** Turns plain text into HTML that displays the same characters. */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

/** Decodes entities in an HTML string for places that only take text, such as <option>. */
export function htmlToText(html: string): string {
  const el = document.createElement("textarea");
  el.innerHTML = html;
  return el.value;
}
