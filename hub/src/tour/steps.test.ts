import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { matchRoutes } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { routes } from "../router";
import { initialProgress, useProgress } from "../state/progress";
import { TOUR_STEPS } from "./steps";

const SRC = join(__dirname, "..");
function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return name === "generated" ? [] : sourceFiles(p);
    return /\.tsx$/.test(name) && !name.includes(".test.") ? [p] : [];
  });
}

beforeEach(() => useProgress.setState(initialProgress()));

describe("tour steps", () => {
  it("has seven steps ending on the diagnostic", () => {
    expect(TOUR_STEPS).toHaveLength(7);
    expect(TOUR_STEPS.at(-1)!.path).toBe("/ccarf/practice?status=diagnostic");
    expect(TOUR_STEPS[0]).toMatchObject({ path: "/ccarf", targets: [], title: "Welcome to your study hub" });
  });

  it("points every step at a real route", () => {
    for (const s of TOUR_STEPS) {
      const matches = matchRoutes(routes, s.path.split("?")[0]);
      expect(matches, s.id).not.toBeNull();
      expect(matches!.at(-1)!.route.path, s.id).not.toBe("*");
    }
  });

  it("uses only markers that exist in the source", () => {
    const source = sourceFiles(SRC).map((f) => readFileSync(f, "utf8")).join("\n");
    for (const m of TOUR_STEPS.flatMap((s) => s.targets)) {
      expect(source, m).toMatch(new RegExp(`data-tour=(\\{[^}]*)?"${m}"`));
    }
  });

  it("step 3 opens the plan pane", () => {
    useProgress.getState().setPaneOpen(false);
    TOUR_STEPS[2].before?.();
    expect(useProgress.getState().plan.paneOpen).toBe(true);
  });
});
