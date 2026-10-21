// @vitest-environment node
import { describe, expect, it } from "vitest";
import { samplePayload } from "../src/feedback/fixtures";
import { isRateLimited } from "./ratelimit";
import type { StoredReport } from "./store";

const now = new Date("2026-10-21T12:00:00.000Z");

const ago = (minutes: number, ipHash = "ip", count = 1): StoredReport[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `FB-${i}`,
    receivedAt: new Date(now.getTime() - minutes * 60_000).toISOString(),
    ipHash,
    payload: samplePayload(),
    delivery: "delivered",
    discordMessageId: null,
    verdict: null,
  }));

describe("isRateLimited", () => {
  it("allows 4 in 10 minutes and blocks 5", () => {
    expect(isRateLimited(ago(3, "ip", 4), "ip", now)).toBe(false);
    expect(isRateLimited(ago(3, "ip", 5), "ip", now)).toBe(true);
  });

  it("ignores reports older than 10 minutes for the short window", () => {
    expect(isRateLimited(ago(11, "ip", 5), "ip", now)).toBe(false);
  });

  it("blocks 30 within 24 hours", () => {
    expect(isRateLimited(ago(120, "ip", 29), "ip", now)).toBe(false);
    expect(isRateLimited(ago(120, "ip", 30), "ip", now)).toBe(true);
    expect(isRateLimited(ago(25 * 60, "ip", 30), "ip", now)).toBe(false);
  });

  it("only counts the same IP hash", () => {
    expect(isRateLimited(ago(1, "other", 10), "ip", now)).toBe(false);
  });
});
