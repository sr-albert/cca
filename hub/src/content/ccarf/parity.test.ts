// @vitest-environment node
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildContent } from "../../../scripts/migrate-site";
import { TRACK_ORDER, blueprint, diagnostic, heuristics, lab, questions, scenarios, statics, tracks } from ".";

const sitePath = fileURLToPath(new URL("../../../../site/index.html", import.meta.url));

describe.skipIf(!existsSync(sitePath))("CCAR-F content matches site/index.html", () => {
  it("has the original counts", () => {
    expect(questions).toHaveLength(52);
    expect(questions.filter((q) => q.kind === "multi")).toHaveLength(4);
    const shape = Object.fromEntries(TRACK_ORDER.map((id) => [id, [tracks[id].steps.length, tracks[id].steps.reduce((n, s) => n + s.tasks.length, 0)]]));
    expect(shape).toEqual({ beginner: [5, 25], experienced: [14, 73], expert: [9, 44] });
    expect(heuristics).toHaveLength(8);
    expect(scenarios).toHaveLength(6);
    expect(blueprint.inScope).toHaveLength(16);
    expect(blueprint.outScope).toHaveLength(16);
    expect(diagnostic).toHaveLength(15);
  });

  it("is identical to a fresh migration, including task text and actions", () => {
    const fresh = buildContent(readFileSync(sitePath, "utf8"));
    expect({ trackOrder: TRACK_ORDER, tracks, heuristics, blueprint, scenarios, questions, diagnostic, lab, statics }).toEqual(fresh);
  });

  it("points every lesson action at the lab lesson", () => {
    const actions = TRACK_ORDER.flatMap((id) => tracks[id].steps.flatMap((s) => s.tasks.flatMap((t) => t.actions)));
    for (const a of actions) if (a.go === "lesson") expect(a.slug).toBe(lab.slug);
  });
});
