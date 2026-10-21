import { describe, expect, it } from "vitest";
import { applyMarkdown } from "./markdown";

describe("applyMarkdown", () => {
  it("wraps the selection and keeps it selected", () => {
    expect(applyMarkdown("hello", 0, 5, "bold")).toEqual({ text: "**hello**", start: 2, end: 7 });
  });
  it("uses _ for italic and ` for code", () => {
    expect(applyMarkdown("a b", 2, 3, "italic").text).toBe("a _b_");
    expect(applyMarkdown("a b", 2, 3, "code").text).toBe("a `b`");
  });
  it("prefixes every selected line for a list", () => {
    expect(applyMarkdown("one\ntwo", 0, 7, "list").text).toBe("- one\n- two");
  });
  it("inserts markers with the cursor between them on an empty selection", () => {
    expect(applyMarkdown("", 0, 0, "bold")).toEqual({ text: "****", start: 2, end: 2 });
  });
  it("turns the selection into a link with url selected", () => {
    const r = applyMarkdown("see docs", 4, 8, "link");
    expect(r.text).toBe("see [docs](url)");
    expect(r.text.slice(r.start, r.end)).toBe("url");
  });
});
