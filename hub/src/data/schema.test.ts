import { describe, expect, it } from "vitest";
import { Question } from "./schema";

const base = {
  id: "x-1", cert: "ccarf", domain: 1, source: "mine", kind: "single",
  stem: "Stem", options: ["A", "B", "C", "D"], correct: [2],
};

describe("Question schema", () => {
  it("accepts a valid single-answer question", () => {
    expect(Question.safeParse(base).success).toBe(true);
  });
  it("accepts a multi-answer question with three correct options", () => {
    expect(Question.safeParse({ ...base, kind: "multi", correct: [0, 1, 3] }).success).toBe(true);
  });
  it("rejects a correct index outside the options", () => {
    expect(Question.safeParse({ ...base, correct: [4] }).success).toBe(false);
  });
  it("rejects a single question with two correct options", () => {
    expect(Question.safeParse({ ...base, correct: [0, 1] }).success).toBe(false);
  });
  it("rejects an unknown cert", () => {
    expect(Question.safeParse({ ...base, cert: "aws" }).success).toBe(false);
  });
});
