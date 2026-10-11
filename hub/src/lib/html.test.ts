import { describe, expect, it } from "vitest";
import { escapeHtml, htmlToText } from "./html";

describe("escapeHtml", () => {
  it("escapes markup characters", () => {
    expect(escapeHtml(`services/<name>/ & "x" 'y'`)).toBe("services/&lt;name&gt;/ &amp; &quot;x&quot; &#39;y&#39;");
  });
});

describe("htmlToText", () => {
  it("decodes entities for plain-text contexts such as <option>", () => {
    expect(htmlToText("Tool Design &amp; MCP &ndash; 18%")).toBe("Tool Design & MCP – 18%");
  });
});
