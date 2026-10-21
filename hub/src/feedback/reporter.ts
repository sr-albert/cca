import { FeedbackPayload } from "./payload";

export const REPORTER_KEY = "studyhub:reporter";

const isUuid = (v: unknown): v is string => FeedbackPayload.shape.reporterId.safeParse(v).success;

/** Used when localStorage is blocked, so one page session still reports a single ID. */
let fallbackId: string | null = null;

export function getReporterId(): string {
  try {
    const stored = localStorage.getItem(REPORTER_KEY);
    if (isUuid(stored)) return stored;
    const id = crypto.randomUUID();
    localStorage.setItem(REPORTER_KEY, id);
    return id;
  } catch {
    return (fallbackId ??= crypto.randomUUID());
  }
}
