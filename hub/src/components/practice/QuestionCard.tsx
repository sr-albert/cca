import { useState } from "react";
import type { Answer, Question } from "../../data/schema";
import { useFeedback } from "../../feedback/FeedbackProvider";
import { toggleSelection } from "../../lib/practice";
import { Html } from "../Html";

const LETTERS = ["A", "B", "C", "D", "E", "F"];
const SOURCE_LABEL = { mine: "Mine", official: "Official sample", mirror: "Cert Labs" } as const;

type Props = { q: Question; answer?: Answer; onSubmit: (selected: number[]) => void };

export function QuestionCard({ q, answer, onSubmit }: Props) {
  const feedback = useFeedback();
  const [picked, setPicked] = useState<number[]>([]);
  const multi = q.kind === "multi";
  const need = q.correct.length;
  const meta = [q.id, `Domain ${q.domain}`, q.task, q.scenario !== undefined ? `Scenario ${q.scenario}` : undefined]
    .filter(Boolean)
    .join(" · ");

  return (
    <article data-testid={`q-${q.id}`} data-tour="question" className="my-4 rounded border border-line bg-surface p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2 font-mono text-xs text-muted">
        <span>{meta}</span>
        <span className="rounded border border-line px-1.5">{SOURCE_LABEL[q.source]}</span>
        {answer && (
          <span className={`font-semibold ${answer.correct ? "text-good" : "text-bad"}`}>
            {answer.correct ? "Correct" : "Incorrect"}
          </span>
        )}
        {feedback && (
          <button type="button" onClick={() => feedback.open(q)} className="ml-auto hover:text-accent">
            ⚑ Report
          </button>
        )}
      </div>
      <Html className="content font-serif text-[17px] leading-relaxed" html={q.stem} />
      {multi && !answer && <p className="mt-1 text-sm text-muted">Select {need}.</p>}
      <div className="mt-3 grid gap-2">
        {q.options.map((opt, i) => {
          const isRight = q.correct.includes(i);
          const chosen = answer ? answer.selected.includes(i) : picked.includes(i);
          const tone = answer
            ? isRight ? "border-good bg-good/10" : chosen ? "border-bad bg-bad/10" : "border-line"
            : chosen ? "border-accent bg-accent-soft" : "border-line hover:border-ink";
          return (
            <button
              key={i}
              type="button"
              disabled={!!answer}
              aria-pressed={chosen}
              onClick={() => (multi ? setPicked((p) => toggleSelection(p, i, need)) : onSubmit([i]))}
              className={`flex gap-3 rounded border px-3 py-2 text-left ${tone}`}
            >
              <span className="font-mono text-sm">{LETTERS[i]}</span>
              <span className="min-w-0">
                <Html as="span" className="content" html={opt} />
                {answer && q.explanations?.[i] && (
                  <Html as="span" className="content mt-1 block text-sm text-muted" html={q.explanations[i]} />
                )}
              </span>
            </button>
          );
        })}
      </div>
      {multi && !answer && (
        <button
          type="button"
          disabled={picked.length !== need}
          onClick={() => onSubmit(picked)}
          className="mt-3 rounded border border-accent px-3 py-1 text-sm text-accent disabled:opacity-40"
        >
          Check answer
        </button>
      )}
      {answer && q.rationale && (
        <Html className="content mt-3 border-l-2 border-accent pl-3 text-sm" html={q.rationale} />
      )}
    </article>
  );
}
