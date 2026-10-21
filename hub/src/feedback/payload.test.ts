import { describe, expect, it } from "vitest";
import { samplePayload } from "./fixtures";
import { FeedbackPayload, formatVersion } from "./payload";

describe("FeedbackPayload", () => {
  it("accepts a full payload", () => expect(FeedbackPayload.safeParse(samplePayload()).success).toBe(true));

  it("trims text and rejects empty or over 4000 chars", () => {
    expect(FeedbackPayload.parse({ ...samplePayload(), text: "  hi  " }).text).toBe("hi");
    expect(FeedbackPayload.safeParse({ ...samplePayload(), text: "   " }).success).toBe(false);
    expect(FeedbackPayload.safeParse({ ...samplePayload(), text: "x".repeat(4001) }).success).toBe(false);
  });

  it("rejects contact over 200 chars and more than 10 errors", () => {
    expect(FeedbackPayload.safeParse({ ...samplePayload(), contact: "x".repeat(201) }).success).toBe(false);
    const base = samplePayload();
    const errors = Array.from({ length: 11 }, () => ({ message: "boom", source: "app.js", line: 1 }));
    expect(FeedbackPayload.safeParse({ ...base, meta: { ...base.meta, errors } }).success).toBe(false);
    expect(FeedbackPayload.safeParse({ ...base, meta: { ...base.meta, errors: errors.slice(0, 10) } }).success).toBe(true);
  });

  it("allows context null", () => {
    expect(FeedbackPayload.safeParse({ ...samplePayload(), context: null }).success).toBe(true);
  });
});

describe("formatVersion", () => {
  it("formats the content version", () => {
    expect(formatVersion({ commit: "bcc6669", dirty: true, mirror: "3fa1c2d0" })).toBe("bcc6669-dirty · mirror 3fa1c2d0");
    expect(formatVersion({ commit: "unknown", dirty: false, mirror: "none" })).toBe("unknown · mirror none");
  });
});
