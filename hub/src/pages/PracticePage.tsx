import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { Html } from "../components/Html";
import { FilterBar } from "../components/practice/FilterBar";
import { QuestionCard } from "../components/practice/QuestionCard";
import { catalog, DIAGNOSTIC, getCert, questionsByCert } from "../data";
import type { PracticeFilter } from "../data/schema";
import { useCert } from "../hooks/useCert";
import { filterToSearch, parseFilter } from "../lib/filters";
import { filterQuestions, isCorrect, scoreLine } from "../lib/practice";
import { useProgress } from "../state/progress";

export default function PracticePage() {
  const cert = useCert();
  const [params, setParams] = useSearchParams();
  const filter = useMemo(() => parseFilter(params), [params]);
  const answers = useProgress((s) => s.answers);
  const answer = useProgress((s) => s.answer);
  const resetAnswers = useProgress((s) => s.resetAnswers);
  const all = questionsByCert[cert];
  const shown = useMemo(() => filterQuestions(all, filter, answers, DIAGNOSTIC), [all, filter, answers]);

  const update = (patch: Partial<PracticeFilter>) => setParams(filterToSearch({ ...filter, ...patch }));
  const reset = () => {
    if (window.confirm(`Clear all your ${getCert(cert)!.code} answers? This cannot be undone.`)) {
      resetAnswers(all.map((q) => q.id));
    }
  };

  return (
    <section className="max-w-3xl">
      <h2 className="font-serif text-3xl">Practice</h2>
      {cert === "ccarf" && <Html className="content mt-2" html={catalog.ccarf.statics.drillLede} />}
      <FilterBar cert={cert} filter={filter} questions={all} onChange={update} />
      <div className="flex flex-wrap items-center gap-3 border-b border-line pb-3">
        <p data-testid="score" className="font-mono text-sm">{scoreLine(all, shown.length, answers)}</p>
        <button type="button" className="ml-auto text-sm text-accent" onClick={() => setParams("")}>Start the mock</button>
        <button type="button" className="text-sm text-muted hover:text-bad" onClick={reset}>Reset answers</button>
      </div>
      {shown.length ? (
        shown.map((q) => (
          <QuestionCard key={q.id} q={q} answer={answers[q.id]} onSubmit={(sel) => answer(q.id, sel, isCorrect(q, sel))} />
        ))
      ) : (
        <p className="mt-6 text-muted">No items match these filters.</p>
      )}
    </section>
  );
}
