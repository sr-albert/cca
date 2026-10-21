export type MarkdownKind = "bold" | "italic" | "code" | "list" | "link";
type Edit = { text: string; start: number; end: number };

const MARKER = { bold: "**", italic: "_", code: "`" } as const;

export function applyMarkdown(text: string, start: number, end: number, kind: MarkdownKind): Edit {
  const before = text.slice(0, start);
  const sel = text.slice(start, end);
  const after = text.slice(end);

  if (kind === "list") {
    const lineStart = text.lastIndexOf("\n", start - 1) + 1;
    const nl = text.indexOf("\n", end);
    const lineEnd = nl === -1 ? text.length : nl;
    const lines = text.slice(lineStart, lineEnd).split("\n");
    return {
      text: text.slice(0, lineStart) + lines.map((l) => `- ${l}`).join("\n") + text.slice(lineEnd),
      start: start + 2,
      end: end + 2 * lines.length,
    };
  }
  if (kind === "link") {
    const urlStart = start + sel.length + 3;
    return { text: `${before}[${sel}](url)${after}`, start: urlStart, end: urlStart + 3 };
  }
  const m = MARKER[kind];
  return { text: before + m + sel + m + after, start: start + m.length, end: end + m.length };
}
