import type { PracticeFilter } from "../../data/schema";

export type TrackId = "beginner" | "experienced" | "expert";

export type Action = { label: string } & (
  | { go: "practice"; filter: PracticeFilter }
  | { go: "reference"; section: "heuristics" | "blueprint" | "scenarios" }
  | { go: "lesson"; slug: string }
  | { go: "track"; track: TrackId }
);

export type Task = { text: string; actions: Action[] };
export type Step = { n: number; short: string; title: string; dur?: string; ts: string[]; tasks: Task[]; gate?: string };
export type TrackNote = { w?: number; b: string; t: string };
export type Track = {
  id: TrackId; name: string; tag: string; unit: string; runway: string; who: string;
  notes: TrackNote[]; steps: Step[];
};

export type Heuristic = { id: string; t: string; b: string; ev: string };
export type BlueprintDomain = { n: number; name: string; w: number; items: number; ts: string };
export type Blueprint = { domains: BlueprintDomain[]; inScope: string[]; outScope: string[] };
export type Scenario = { n: number; t: string; d: string; dom: number[] };

export type Statics = {
  place: string; heurLede: string; heurExtras: string; blueIntro: string; blueNote: string;
  scenLede: string; drillLede: string; labLede: string; footer: string;
};
