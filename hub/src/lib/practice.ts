import type { Answer, PracticeFilter, Question } from "../data/schema";

export function isCorrect(q: Question, selected: number[]): boolean {
  return selected.length === q.correct.length && selected.every((i) => q.correct.includes(i));
}

/** Multi-answer picking: toggles `i`, never holding more than `max` options. */
export function toggleSelection(selected: number[], i: number, max: number): number[] {
  if (selected.includes(i)) return selected.filter((x) => x !== i);
  return selected.length < max ? [...selected, i] : selected;
}

export function filterQuestions(
  qs: Question[],
  f: PracticeFilter,
  answers: Record<string, Answer>,
  diagnostic: ReadonlySet<string>,
): Question[] {
  return qs.filter((q) => {
    if (f.domain !== undefined && q.domain !== f.domain) return false;
    if (f.scenario !== undefined && q.scenario !== f.scenario) return false;
    if (f.source && q.source !== f.source) return false;
    if (f.tasks?.length && !(q.task && f.tasks.includes(q.task))) return false;
    if (f.ids?.length && !f.ids.includes(q.id)) return false;
    const a = answers[q.id];
    if (f.status === "unanswered" && a) return false;
    if (f.status === "wrong" && (!a || a.correct)) return false;
    if (f.status === "diagnostic" && !diagnostic.has(q.id)) return false;
    return true;
  });
}

/** The Drill's score line, counted within `all` (the current cert's questions). */
export function scoreLine(all: Question[], shown: number, answers: Record<string, Answer>): string {
  const done = all.filter((q) => answers[q.id]);
  const right = done.filter((q) => answers[q.id].correct).length;
  const prefix = shown !== all.length ? `${shown} shown · ` : "";
  if (!done.length) return `${prefix}${all.length} items · none answered yet`;
  return `${prefix}${right}/${done.length} correct · ${Math.round((right / done.length) * 100)}% · ${all.length - done.length} left`;
}

export function compareTasks(a: string, b: string): number {
  const [a1, a2] = a.split(".").map(Number);
  const [b1, b2] = b.split(".").map(Number);
  return a1 - b1 || a2 - b2;
}
