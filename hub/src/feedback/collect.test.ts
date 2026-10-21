import { describe, expect, it } from "vitest";
import { DIAGNOSTIC, questionsByCert } from "../data";
import type { Answer } from "../data/schema";
import { buildPayload, contextFor, studySummary } from "./collect";
import { samplePayload } from "./fixtures";
import { ErrorEntry, FeedbackPayload } from "./payload";

const q34 = questionsByCert.ccarf.find((q) => q.id === "Q34")!;
const ans = (correct: boolean, selected = [0]): Answer => ({ selected, correct, at: "2026-10-21T09:30:00.000Z" });

describe("contextFor", () => {
  const base = { cert: "ccarf" as const, pathname: "/ccarf/practice", search: "?domain=1", prevRoute: "/ccarf/plan" };

  it("describes the question and the learner's answer", () => {
    const c = contextFor({ ...base, question: q34, answer: ans(false, [2]) });
    expect(c.url).toBe("/ccarf/practice?domain=1");
    expect(c.route).toBe("/ccarf/practice");
    expect(c.question).toMatchObject({ id: "Q34", source: q34.source, domain: q34.domain });
    expect(c.question?.answer?.selected).toEqual([2]);
    expect(c.question?.answer?.correct).toBe(false);
  });

  it("has a null answer when the question is unanswered", () => {
    expect(contextFor({ ...base, question: q34 }).question?.answer).toBeNull();
  });

  it("has a null question without one", () => {
    expect(contextFor(base).question).toBeNull();
  });
});

describe("studySummary", () => {
  it("counts answered and correct for the cert and overall", () => {
    const ccarf = questionsByCert.ccarf;
    // Overall counts are keyed by answer ID, so a fake ID stands in for another cert without needing the mirror.
    const s = studySummary(
      { answers: { [ccarf[0].id]: ans(true), [ccarf[1].id]: ans(false), "MIRROR-X1": ans(true) }, tourSeen: true },
      "ccarf",
    );
    expect(s.cert).toEqual({ answered: 2, correct: 1, total: ccarf.length });
    expect(s.overall).toEqual({ answered: 3, correct: 2 });
    expect(s.tourSeen).toBe(true);
  });

  it("is diagnosticDone only once every diagnostic question is answered", () => {
    const ids = [...DIAGNOSTIC];
    const answers = Object.fromEntries(ids.slice(1).map((id) => [id, ans(true)]));
    expect(studySummary({ answers, tourSeen: false }, "ccarf").diagnosticDone).toBe(false);
    answers[ids[0]] = ans(false);
    expect(studySummary({ answers, tourSeen: false }, "ccarf").diagnosticDone).toBe(true);
  });
});

describe("buildPayload", () => {
  const { device, study } = samplePayload().meta;
  const deps = { device, study, errors: [], reporterId: samplePayload().reporterId };

  it("produces a valid payload and omits an empty contact", () => {
    const p = buildPayload({ type: "confusing", text: "  unclear  ", contact: "  ", context: null }, deps);
    expect(FeedbackPayload.parse(p)).toBeTruthy();
    expect("contact" in p).toBe(false);
    expect(p.text).toBe("unclear");
    expect(p.meta.contentVersion.commit).toBe("dev");
  });

  it("keeps a contact", () => {
    const p = buildPayload({ type: "other", text: "hi", contact: "me@example.com", context: null }, deps);
    expect(p.contact).toBe("me@example.com");
  });

  it("stays under the 64 KB body cap in the worst case", () => {
    const errors: ErrorEntry[] = Array.from({ length: 10 }, () => ({
      message: "ệ".repeat(300),
      source: "ệ".repeat(200),
      line: 99999,
    }));
    const p = buildPayload(
      { type: "other", text: "ệ".repeat(4000), contact: "c".repeat(200), context: samplePayload().context },
      { ...deps, errors, device: { ...device, userAgent: "u".repeat(1000) } },
    );
    expect(FeedbackPayload.safeParse(p).success).toBe(true);
    expect(new Blob([JSON.stringify(p)]).size).toBeLessThan(64 * 1024);
  });
});
