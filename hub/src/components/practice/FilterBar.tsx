import { catalog, DIAGNOSTIC, getCert } from "../../data";
import type { CertId, PracticeFilter, PracticeStatus, Question, QuestionSource } from "../../data/schema";
import { htmlToText } from "../../lib/html";
import { compareTasks } from "../../lib/practice";

type Props = {
  cert: CertId;
  filter: PracticeFilter;
  questions: Question[];
  onChange: (patch: Partial<PracticeFilter>) => void;
};

const select = "rounded border border-line bg-surface px-2 py-1 text-sm";

function Pill({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-accent px-2 py-0.5 font-mono text-xs text-accent">
      {label}
      <button type="button" aria-label={`Clear ${label}`} onClick={onClear}>×</button>
    </span>
  );
}

export function FilterBar({ cert, filter, questions, onChange }: Props) {
  const domains = getCert(cert)!.domains;
  const tasks = [...new Set(questions.flatMap((q) => (q.task ? [q.task] : [])))].sort(compareTasks);
  const num = (v: string) => (v ? Number(v) : undefined);

  return (
    <div className="my-4 flex flex-wrap items-center gap-2">
      <select aria-label="Domain" className={select} value={filter.domain ?? ""} onChange={(e) => onChange({ domain: num(e.target.value) })}>
        <option value="">All domains</option>
        {domains.map((d) => (
          <option key={d.n} value={d.n}>Domain {d.n} — {htmlToText(d.name)}</option>
        ))}
      </select>
      {tasks.length > 0 && (
        <select
          aria-label="Task statement"
          className={select}
          value={filter.tasks?.length === 1 ? filter.tasks[0] : ""}
          onChange={(e) => onChange({ tasks: e.target.value ? [e.target.value] : undefined })}
        >
          <option value="">All task statements</option>
          {tasks.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      )}
      {cert === "ccarf" && (
        <select aria-label="Scenario" className={select} value={filter.scenario ?? ""} onChange={(e) => onChange({ scenario: num(e.target.value) })}>
          <option value="">All scenarios</option>
          {catalog.ccarf.scenarios.map((s) => (
            <option key={s.n} value={s.n}>{s.n}. {htmlToText(s.t)}</option>
          ))}
        </select>
      )}
      <select
        aria-label="Source"
        className={select}
        value={filter.source ?? ""}
        onChange={(e) => onChange({ source: (e.target.value || undefined) as QuestionSource | undefined })}
      >
        <option value="">All sources</option>
        <option value="mine">Mine</option>
        <option value="official">Official samples</option>
        <option value="mirror">Cert Labs</option>
      </select>
      <select
        aria-label="Status"
        className={select}
        value={filter.status ?? ""}
        onChange={(e) => onChange({ status: (e.target.value || undefined) as PracticeStatus | undefined })}
      >
        <option value="">All items</option>
        <option value="unanswered">Unanswered only</option>
        <option value="wrong">Previously wrong</option>
        {cert === "ccarf" && <option value="diagnostic">Diagnostic ({DIAGNOSTIC.size})</option>}
      </select>
      {filter.tasks && filter.tasks.length > 1 && <Pill label={filter.tasks.join(", ")} onClear={() => onChange({ tasks: undefined })} />}
      {filter.ids && filter.ids.length > 0 && <Pill label={`${filter.ids.length} lesson questions`} onClear={() => onChange({ ids: undefined })} />}
    </div>
  );
}
