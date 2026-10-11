import type { Step, Track } from "../content/ccarf/types";
import type { Answer, Cert, Question } from "../data/schema";

export type DomainStat = {
  n: number; name: string; weight: number;
  total: number; answered: number; correct: number; pct: number | null;
};

export function domainStats(cert: Cert, questions: Question[], answers: Record<string, Answer>): DomainStat[] {
  return cert.domains.map((d) => {
    const inDomain = questions.filter((q) => q.domain === d.n);
    const answered = inDomain.filter((q) => answers[q.id]);
    const correct = answered.filter((q) => answers[q.id].correct).length;
    return {
      n: d.n, name: d.name, weight: d.weight,
      total: inDomain.length, answered: answered.length, correct,
      pct: answered.length ? Math.round((correct / answered.length) * 100) : null,
    };
  });
}

export const MIN_ANSWERS_FOR_WEAKEST = 3;

export function weakestDomain(stats: DomainStat[]): DomainStat | null {
  return stats
    .filter((s) => s.answered >= MIN_ANSWERS_FOR_WEAKEST)
    .reduce<DomainStat | null>((w, s) => (!w || s.correct / s.answered < w.correct / w.answered ? s : w), null);
}

export function doneCount(step: Step, done: Record<number, number[]>): number {
  return (done[step.n] ?? []).filter((i) => i < step.tasks.length).length;
}

/** The lowest step that still has unticked tasks; the last step once all are done. */
export function currentStep(track: Track, done: Record<number, number[]>): Step {
  return track.steps.find((s) => doneCount(s, done) < s.tasks.length) ?? track.steps[track.steps.length - 1];
}
