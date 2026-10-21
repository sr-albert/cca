import { FeedbackPayload } from "./payload";

export const REPORTER_KEY = "studyhub:reporter";

const isUuid = (v: unknown): v is string => FeedbackPayload.shape.reporterId.safeParse(v).success;

/** Used when localStorage is blocked, so one page session still reports a single ID. */
let fallbackId: string | null = null;

function newId(): string {
  // randomUUID only exists in secure contexts; plain http on a LAN IP needs the fallback.
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export function getReporterId(): string {
  try {
    const stored = localStorage.getItem(REPORTER_KEY);
    if (isUuid(stored)) return stored;
    const id = newId();
    localStorage.setItem(REPORTER_KEY, id);
    return id;
  } catch {
    return (fallbackId ??= newId());
  }
}
