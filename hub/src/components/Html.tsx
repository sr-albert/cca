import type { ElementType } from "react";

type Props = { html: string; as?: ElementType; className?: string };

/** Renders trusted catalog HTML. Mirror text is escaped at extraction, so every string here is safe. */
export function Html({ html, as: Tag = "div", className }: Props) {
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
