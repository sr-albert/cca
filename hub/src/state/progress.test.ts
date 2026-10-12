import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEY, initialProgress, useProgress } from "./progress";

const state = () => useProgress.getState();

beforeEach(() => {
  localStorage.clear();
  useProgress.setState(initialProgress());
});
afterEach(() => vi.restoreAllMocks());

describe("progress store", () => {
  it("starts on the experienced track with nothing answered", () => {
    expect(state().plan.track).toBe("experienced");
    expect(state().answers).toEqual({});
    expect(state().activeStep).toBeNull();
  });

  it("records an answer and saves it under studyhub:v1, without activeStep", () => {
    state().setActiveStep(4);
    state().answer("Q01", [0], true);
    expect(state().answers.Q01).toMatchObject({ selected: [0], correct: true });
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.state.answers.Q01.correct).toBe(true);
    expect(saved.state.activeStep).toBeUndefined();
  });

  it("resets only the given question ids", () => {
    state().answer("Q01", [0], true);
    state().answer("ccao-001", [1], false);
    state().resetAnswers(["Q01"]);
    expect(Object.keys(state().answers)).toEqual(["ccao-001"]);
  });

  it("ticks and unticks tasks per track and step", () => {
    state().setTaskDone("experienced", 2, 3, true);
    state().setTaskDone("experienced", 2, 1, true);
    expect(state().plan.doneTasks.experienced[2]).toEqual([1, 3]);
    state().setTaskDone("experienced", 2, 3, false);
    expect(state().plan.doneTasks.experienced[2]).toEqual([1]);
    expect(state().plan.doneTasks.expert).toEqual({});
  });

  it("marks a whole step and clears it", () => {
    state().setStepTasks("beginner", 1, [0, 1, 2]);
    expect(state().plan.doneTasks.beginner[1]).toEqual([0, 1, 2]);
    state().setStepTasks("beginner", 1, []);
    expect(state().plan.doneTasks.beginner[1]).toEqual([]);
  });

  it("switching track goes back to following the current step", () => {
    state().setActiveStep(5);
    state().setTrack("expert");
    expect(state().plan.track).toBe("expert");
    expect(state().activeStep).toBeNull();
  });

  it("falls back to defaults when saved data is corrupt", async () => {
    localStorage.setItem(STORAGE_KEY, "{not json");
    await useProgress.persist.rehydrate();
    expect(state().answers).toEqual({});
  });

  it("keeps working when localStorage throws", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    await useProgress.persist.rehydrate();
    expect(() => state().answer("Q01", [0], true)).not.toThrow();
    expect(state().answers.Q01.correct).toBe(true);
  });
  it("has not seen the tour by default, and saves it once seen", () => {
    expect(state().tourSeen).toBe(false);
    state().setTourSeen(true);
    expect(state().tourSeen).toBe(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).state.tourSeen).toBe(true);
  });

  it("loads saved progress from before the tour as not seen, keeping answers", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { ...initialProgress(), activeStep: undefined, tourSeen: undefined, answers: { Q01: { selected: [0], correct: true, at: "x" } } }, version: 1 }),
    );
    await useProgress.persist.rehydrate();
    expect(state().tourSeen).toBe(false);
    expect(state().answers.Q01.correct).toBe(true);
  });
});
