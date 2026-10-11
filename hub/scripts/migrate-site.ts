import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Lesson, PracticeFilter, Question } from "../src/data/schema";
import type { Action, Track, TrackId } from "../src/content/ccarf/types";
import { loadSite, loadStatics, type LegacyAction } from "./site-source";

export const LAB_SLUG = "agentic-loop";

export function convertAction(a: LegacyAction): Action {
  switch (a.go) {
    case "drill": {
      const f = a.f ?? {};
      const filter: PracticeFilter = {};
      if (f.mode === "diag") filter.status = "diagnostic";
      if (f.mode === "wrong") filter.status = "wrong";
      if (f.dom) filter.domain = Number(f.dom);
      if (f.ts?.length) filter.tasks = f.ts;
      return { label: a.label, go: "practice", filter };
    }
    case "blue": return { label: a.label, go: "reference", section: "blueprint" };
    case "heur": return { label: a.label, go: "reference", section: "heuristics" };
    case "scen": return { label: a.label, go: "reference", section: "scenarios" };
    case "lab": return { label: a.label, go: "lesson", slug: LAB_SLUG };
    case "track": return { label: a.label, go: "track", track: a.track as TrackId };
  }
  throw new Error(`Unknown legacy action: ${a.go}`);
}

export function buildContent(html: string) {
  const site = loadSite(html);
  const statics = loadStatics(html);
  const trackOrder = site.TRACK_ORDER as TrackId[];

  const tracks = Object.fromEntries(
    trackOrder.map((id) => {
      const t = site.TRACKS[id];
      const steps = t.steps.map((st) => ({
        ...st,
        tasks: st.tasks.map((text) => ({ text, actions: site.actionsFor(text, st).map(convertAction) })),
      }));
      return [id, { ...t, id, steps }];
    }),
  ) as Record<TrackId, Track>;

  const questions: Question[] = site.Q.map((q) => ({
    id: q.id,
    cert: "ccarf",
    domain: q.d,
    task: q.ts,
    scenario: q.sc,
    source: "mine",
    kind: q.pick > 1 ? "multi" : "single",
    stem: q.stem,
    options: q.o.map((o) => o[0]),
    correct: q.o.flatMap((o, i) => (o[1] ? [i] : [])),
    explanations: q.o.map((o) => o[2]),
  }));

  const perDomain: Record<number, number> = {};
  const diagnostic = site.Q.filter((q) => (perDomain[q.d] = (perDomain[q.d] ?? 0) + 1) <= 3).map((q) => q.id);

  const lab: Lesson = {
    slug: LAB_SLUG,
    cert: "ccarf",
    domain: 1,
    task: "1.1",
    title: "The agentic loop, annotated",
    lead: statics.labLede.replace(/^<p class="lede">/, "").replace(/<\/p>$/, ""),
    mechanism: [],
    body: site.LAB.replace(/^\s*<p class="eyebrow">[\s\S]*?<\/h2>\s*/, ""),
    questionIds: site.Q.filter((q) => q.ts === "1.1").map((q) => q.id),
  };

  return {
    trackOrder,
    tracks,
    heuristics: site.HEUR,
    blueprint: { domains: site.DOMAINS, inScope: site.INSCOPE, outScope: site.OUTSCOPE },
    scenarios: site.SCEN,
    questions,
    diagnostic,
    lab,
    statics,
  };
}

const HEADER = "// Moved once from site/index.html by scripts/migrate-site.ts. This file is now the source of truth: edit it directly.\n";
const json = (v: unknown) => JSON.stringify(v, null, 2);

function main() {
  const hubRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const outDir = resolve(hubRoot, "src/content/ccarf");
  const c = buildContent(readFileSync(resolve(hubRoot, "../site/index.html"), "utf8"));
  const emit = (file: string, imports: string, body: string) =>
    writeFileSync(resolve(outDir, file), `${HEADER}${imports ? `${imports}\n\n` : "\n"}${body}\n`);

  emit("tracks.ts", 'import type { Track, TrackId } from "./types";',
    `export const TRACK_ORDER: TrackId[] = ${json(c.trackOrder)};\n\nexport const tracks: Record<TrackId, Track> = ${json(c.tracks)};`);
  emit("heuristics.ts", 'import type { Heuristic } from "./types";', `export const heuristics: Heuristic[] = ${json(c.heuristics)};`);
  emit("blueprint.ts", 'import type { Blueprint } from "./types";', `export const blueprint: Blueprint = ${json(c.blueprint)};`);
  emit("scenarios.ts", 'import type { Scenario } from "./types";', `export const scenarios: Scenario[] = ${json(c.scenarios)};`);
  emit("questions.ts", 'import type { Question } from "../../data/schema";', `export const questions: Question[] = ${json(c.questions)};`);
  emit("diagnostic.ts", "", `export const diagnostic: string[] = ${json(c.diagnostic)};`);
  emit("lab.ts", 'import type { Lesson } from "../../data/schema";', `export const lab: Lesson = ${json(c.lab)};`);
  emit("static.ts", 'import type { Statics } from "./types";', `export const statics: Statics = ${json(c.statics)};`);
  console.log(`Wrote ${c.questions.length} questions and ${c.trackOrder.length} tracks to ${outDir}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
