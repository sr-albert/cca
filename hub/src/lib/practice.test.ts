import { describe, expect, it } from "vitest";
import type { Answer, Question } from "../data/schema";
import { compareTasks, filterQuestions, isCorrect, scoreLine, toggleSelection } from "./practice";

const q = (over: Partial<Question>): Question => ({
  id: "x", cert: "ccarf", domain: 1, source: "mine", kind: "single",
  stem: "S", options: ["a", "b", "c", "d", "e"], correct: [0], ...over,
});
const ans = (correct: boolean): Answer => ({ selected: [0], correct, at: "2026-10-11T00:00:00Z" });

const bank = [
  q({ id: "A", domain: 1, task: "1.1", scenario: 1, source: "mine" }),
  q({ id: "B", domain: 2, task: "2.3", scenario: 2, source: "official" }),
  q({ id: "C", domain: 2, source: "mirror" }),
  q({ id: "D", domain: 3, task: "3.1", scenario: 1, source: "mine" }),
];

describe("isCorrect", () => {
  const multi = q({ kind: "multi", correct: [0, 2, 4] });
  it("accepts the exact set in any order", () => expect(isCorrect(multi, [4, 0, 2])).toBe(true));
  it("rejects a partial selection", () => expect(isCorrect(multi, [0, 2])).toBe(false));
  it("rejects a superset", () => expect(isCorrect(multi, [0, 1, 2, 4])).toBe(false));
  it("handles single answers", () => {
    expect(isCorrect(q({ correct: [1] }), [1])).toBe(true);
    expect(isCorrect(q({ correct: [1] }), [0])).toBe(false);
  });
});

describe("toggleSelection", () => {
  it("adds up to max and ignores further picks", () => {
    expect(toggleSelection([0, 2], 4, 3)).toEqual([0, 2, 4]);
    expect(toggleSelection([0, 2, 4], 1, 3)).toEqual([0, 2, 4]);
  });
  it("removes an already selected option", () => expect(toggleSelection([0, 2], 0, 3)).toEqual([2]));
});

describe("filterQuestions", () => {
  const none = new Set<string>();
  it("returns everything with an empty filter", () => expect(filterQuestions(bank, {}, {}, none)).toHaveLength(4));
  it("filters by domain", () => expect(filterQuestions(bank, { domain: 2 }, {}, none).map((x) => x.id)).toEqual(["B", "C"]));
  it("filters by several task statements and drops questions without one", () =>
    expect(filterQuestions(bank, { tasks: ["1.1", "3.1"] }, {}, none).map((x) => x.id)).toEqual(["A", "D"]));
  it("filters by scenario and source together", () =>
    expect(filterQuestions(bank, { scenario: 1, source: "mine" }, {}, none).map((x) => x.id)).toEqual(["A", "D"]));
  it("filters by ids", () => expect(filterQuestions(bank, { ids: ["C", "A"] }, {}, none).map((x) => x.id)).toEqual(["A", "C"]));
  it("filters unanswered and previously wrong", () => {
    const answers = { A: ans(true), B: ans(false) };
    expect(filterQuestions(bank, { status: "unanswered" }, answers, none).map((x) => x.id)).toEqual(["C", "D"]);
    expect(filterQuestions(bank, { status: "wrong" }, answers, none).map((x) => x.id)).toEqual(["B"]);
  });
  it("filters the diagnostic set", () =>
    expect(filterQuestions(bank, { status: "diagnostic" }, {}, new Set(["D", "A"])).map((x) => x.id)).toEqual(["A", "D"]));
});

describe("scoreLine", () => {
  it("shows the item count before anything is answered", () => expect(scoreLine(bank, 4, {})).toBe("4 items · none answered yet"));
  it("shows the shown count when filters narrow the list", () => expect(scoreLine(bank, 2, {})).toBe("2 shown · 4 items · none answered yet"));
  it("scores within the given questions and ignores stale or foreign answers", () => {
    const answers = { A: ans(true), B: ans(false), "gone-id": ans(true), "ccao-001": ans(true) };
    expect(scoreLine(bank, 4, answers)).toBe("1/2 correct · 50% · 2 left");
  });
});

describe("compareTasks", () => {
  it("sorts task statements numerically", () => expect(["1.10", "2.1", "1.2"].sort(compareTasks)).toEqual(["1.2", "1.10", "2.1"]));
});
