import { describe, expect, it, vi } from "vitest";
import { samplePayload } from "./fixtures";
import { sendFeedback } from "./send";

const reply = (status: number, body: unknown = {}) =>
  vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));

describe("sendFeedback", () => {
  it("posts the payload as JSON and returns the id on 201", async () => {
    const f = reply(201, { id: "abc" });
    expect(await sendFeedback(samplePayload(), f)).toEqual({ ok: true, id: "abc" });
    const [url, init] = f.mock.calls[0];
    expect(url).toBe("/api/feedback");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body).type).toBe("wrong-answer");
  });
  it("maps 429 to rate-limited", async () => {
    expect(await sendFeedback(samplePayload(), reply(429, { error: "rate-limited" }))).toEqual({ ok: false, reason: "rate-limited" });
  });
  it("maps other statuses and network errors to failed", async () => {
    expect(await sendFeedback(samplePayload(), reply(500))).toEqual({ ok: false, reason: "failed" });
    expect(await sendFeedback(samplePayload(), vi.fn().mockRejectedValue(new Error("down")))).toEqual({ ok: false, reason: "failed" });
  });
});
