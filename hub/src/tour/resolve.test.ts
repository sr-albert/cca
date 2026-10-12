import { describe, expect, it } from "vitest";
import { needsNavigation, pickTarget, tourSelector } from "./resolve";

describe("tour target resolution", () => {
  it("builds a data-tour selector", () => {
    expect(tourSelector("tracks")).toBe('[data-tour="tracks"]');
  });

  it("picks the first visible marker", () => {
    expect(pickTarget(["plan-pane", "plan-steps"], (m) => m === "plan-steps")).toBe("plan-steps");
    expect(pickTarget(["plan-pane", "plan-steps"], () => true)).toBe("plan-pane");
  });

  it("returns null when nothing is visible or there are no targets", () => {
    expect(pickTarget(["nav", "nav-top"], () => false)).toBeNull();
    expect(pickTarget([], () => true)).toBeNull();
  });

  it("navigates only when pathname or search differ", () => {
    const step = { path: "/ccarf/practice?status=diagnostic" };
    expect(needsNavigation(step, { pathname: "/ccarf/practice", search: "?status=diagnostic" })).toBe(false);
    expect(needsNavigation(step, { pathname: "/ccarf/practice", search: "" })).toBe(true);
    expect(needsNavigation({ path: "/ccarf" }, { pathname: "/ccarf", search: "" })).toBe(false);
    expect(needsNavigation({ path: "/ccarf" }, { pathname: "/ccarf/plan", search: "" })).toBe(true);
  });
});
