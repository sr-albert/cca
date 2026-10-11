import { describe, expect, it } from "vitest";
import type { Track } from "../content/ccarf/types";
import type { Answer, Cert, Question } from "../data/schema";
import { currentStep, doneCount, domainStats, weakestDomain } from "./stats";

const cert: Cert = { id: "ccarf", code: "CCAR-F", name: "A", domains: [
  { n: 1, name: "One", weight: 60 }, { n: 2, name: "Two", weight: 40 },
] };
const q = (id: string, domain: number): Question =>
  ({ id, cert: "ccarf", domain, source: "mine", kind: "single", stem: "S", options: ["a", "b"], correct: [0] });
const a = (correct: boolean): Answer => ({ selected: [0], correct, at: "2026-10-11T00:00:00Z" });
const qs = [q("a1", 1), q("a2", 1), q("a3", 1), q("b1", 2), q("b2", 2), q("b3", 2), q("b4", 2)];

describe("domainStats", () => {
  it("counts per domain and ignores answers for unknown ids", () => {
    const s = domainStats(cert, qs, { a1: a(true), a2: a(false), b1: a(true), "gone-id": a(false) });
    expect(s[0]).toEqual({ n: 1, name: "One", weight: 60, total: 3, answered: 2, correct: 1, pct: 50 });
    expect(s[1]).toMatchObject({ total: 4, answered: 1, correct: 1, pct: 100 });
  });
  it("reports null pct for an unanswered domain", () => {
    expect(domainStats(cert, qs, {})[0].pct).toBeNull();
  });
});

describe("weakestDomain", () => {
  it("ignores domains with fewer than 3 answers", () => {
    expect(weakestDomain(domainStats(cert, qs, { a1: a(false), a2: a(false) }))).toBeNull();
  });
  it("picks the lowest share correct among eligible domains", () => {
    const answers = { a1: a(true), a2: a(true), a3: a(false), b1: a(false), b2: a(false), b3: a(true) };
    expect(weakestDomain(domainStats(cert, qs, answers))?.n).toBe(2);
  });
});

describe("plan progress", () => {
  const track = {
    id: "expert", name: "Expert", tag: "", unit: "Day", runway: "", who: "", notes: [],
    steps: [
      { n: 1, short: "a", title: "A", ts: [], tasks: [{ text: "t", actions: [] }, { text: "u", actions: [] }] },
      { n: 2, short: "b", title: "B", ts: [], tasks: [{ text: "v", actions: [] }] },
    ],
  } satisfies Track;

  it("counts done tasks and ignores out-of-range indexes", () => {
    expect(doneCount(track.steps[0], { 1: [0, 1, 7] })).toBe(2);
  });
  it("returns the first step that is not complete", () => {
    expect(currentStep(track, {}).n).toBe(1);
    expect(currentStep(track, { 1: [0, 1] }).n).toBe(2);
  });
  it("returns the last step when everything is done", () => {
    expect(currentStep(track, { 1: [0, 1], 2: [0] }).n).toBe(2);
  });
});
