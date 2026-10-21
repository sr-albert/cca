import type { FeedbackPayload } from "./payload";

export type SendResult = { ok: true; id: string } | { ok: false; reason: "rate-limited" | "failed" };

export async function sendFeedback(p: FeedbackPayload, fetchImpl: typeof fetch = fetch): Promise<SendResult> {
  try {
    const res = await fetchImpl("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    });
    if (res.status === 429) return { ok: false, reason: "rate-limited" };
    if (res.status !== 201) return { ok: false, reason: "failed" };
    const body = (await res.json()) as { id?: unknown };
    return { ok: true, id: String(body.id ?? "") };
  } catch {
    return { ok: false, reason: "failed" };
  }
}
