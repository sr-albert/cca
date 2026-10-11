import { PRACTICE_STATUSES, QUESTION_SOURCES, type PracticeFilter } from "../data/schema";

const int = (v: string | null) => (v !== null && /^\d+$/.test(v) ? Number(v) : undefined);
const list = (v: string | null) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []);
const oneOf = <T extends string>(options: readonly T[], v: string | null) =>
  options.includes(v as T) ? (v as T) : undefined;

export function parseFilter(p: URLSearchParams): PracticeFilter {
  const f: PracticeFilter = {};
  const domain = int(p.get("domain"));
  if (domain !== undefined) f.domain = domain;
  const tasks = list(p.get("task")).filter((t) => /^\d+\.\d+$/.test(t));
  if (tasks.length) f.tasks = tasks;
  const scenario = int(p.get("scenario"));
  if (scenario !== undefined) f.scenario = scenario;
  const source = oneOf(QUESTION_SOURCES, p.get("source"));
  if (source) f.source = source;
  const ids = list(p.get("ids"));
  if (ids.length) f.ids = ids;
  const status = oneOf(PRACTICE_STATUSES, p.get("status"));
  if (status) f.status = status;
  return f;
}

export function filterToSearch(f: PracticeFilter): string {
  const p = new URLSearchParams();
  if (f.domain !== undefined) p.set("domain", String(f.domain));
  if (f.tasks?.length) p.set("task", f.tasks.join(","));
  if (f.scenario !== undefined) p.set("scenario", String(f.scenario));
  if (f.source) p.set("source", f.source);
  if (f.ids?.length) p.set("ids", f.ids.join(","));
  if (f.status) p.set("status", f.status);
  return p.toString();
}
