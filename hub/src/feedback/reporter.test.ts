import { afterEach, describe, expect, it, vi } from "vitest";
import { FeedbackPayload } from "./payload";
import { getReporterId, REPORTER_KEY } from "./reporter";

const isUuid = (v: string) => FeedbackPayload.shape.reporterId.safeParse(v).success;

describe("getReporterId", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns the same valid ID on every call and persists it", () => {
    const a = getReporterId();
    expect(isUuid(a)).toBe(true);
    expect(getReporterId()).toBe(a);
    expect(localStorage.getItem(REPORTER_KEY)).toBe(a);
  });

  it("replaces a stored value that is not a UUID", () => {
    localStorage.setItem(REPORTER_KEY, "not-a-uuid");
    const id = getReporterId();
    expect(isUuid(id)).toBe(true);
    expect(localStorage.getItem(REPORTER_KEY)).toBe(id);
  });

  it("keeps a stable ID when storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const id = getReporterId();
    expect(isUuid(id)).toBe(true);
    expect(getReporterId()).toBe(id);
  });
});
