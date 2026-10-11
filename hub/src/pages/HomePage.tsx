import { useMemo } from "react";
import { Link } from "react-router";
import { Html } from "../components/Html";
import { catalog, getCert, questionsByCert } from "../data";
import { useCert } from "../hooks/useCert";
import { currentStep, domainStats, doneCount, weakestDomain } from "../lib/stats";
import { useProgress } from "../state/progress";

const PAGE_LABELS: Record<string, string> = {
  plan: "Plan", lessons: "Lessons", practice: "Practice", cards: "Flashcards", reference: "Reference",
};

function describePath(path: string): string {
  const [pathname, search] = path.split("?");
  const parts = pathname.split("/");
  const label = parts[3] ? `Lesson: ${parts[3]}` : PAGE_LABELS[parts[2]] ?? "Home";
  return search ? `${label} (filtered)` : label;
}

export default function HomePage() {
  const cert = useCert();
  const c = getCert(cert)!;
  const answers = useProgress((s) => s.answers);
  const lastVisit = useProgress((s) => s.lastVisit);
  const plan = useProgress((s) => s.plan);
  const stats = useMemo(() => domainStats(c, questionsByCert[cert], answers), [c, cert, answers]);
  const weakest = weakestDomain(stats);

  const track = catalog.ccarf.tracks[plan.track];
  const step = currentStep(track, plan.doneTasks[plan.track]);

  return (
    <section className="max-w-3xl">
      <Html as="h2" className="font-serif text-3xl" html={c.name} />

      {!catalog.mirrorAvailable && (
        <p role="status" className="mt-3 rounded border border-accent/50 bg-accent-soft p-3 text-sm">
          Mirror not found — run <code className="font-mono">mirror/update.sh</code>, then rebuild. Showing CCAR-F content only.
        </p>
      )}

      {lastVisit?.cert === cert && (
        <Link to={lastVisit.path} className="mt-5 block rounded border border-line bg-surface p-4 hover:border-accent">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted">Continue</span>
          <span className="block font-serif text-lg">{describePath(lastVisit.path)}</span>
        </Link>
      )}

      {cert === "ccarf" && (
        <Link to="/ccarf/plan" data-testid="plan-step" className="mt-3 block rounded border border-line bg-surface p-4 hover:border-accent">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted">Plan · {track.name} track</span>
          <Html
            as="span"
            className="block font-serif text-lg"
            html={`${track.unit} ${step.n} &middot; ${step.title} &middot; ${doneCount(step, plan.doneTasks[plan.track])}/${step.tasks.length}`}
          />
        </Link>
      )}

      <h3 className="mt-8 font-mono text-xs uppercase tracking-widest text-muted">Progress by domain</h3>
      <div className="mt-3 space-y-2">
        {stats.map((s) => (
          <Link
            key={s.n}
            to={`/${cert}/practice?domain=${s.n}`}
            data-testid="domain-row"
            className="grid grid-cols-[1fr_8rem_6rem] items-center gap-3 text-sm hover:text-accent"
          >
            <span>D{s.n} <Html as="span" html={s.name} /></span>
            <span className="h-1.5 overflow-hidden rounded bg-line">
              <i className={`block h-full ${weakest?.n === s.n ? "bg-accent" : "bg-ink"}`} style={{ width: `${s.pct ?? 0}%` }} />
            </span>
            <span className="text-right font-mono text-xs">{s.pct === null ? "—" : `${s.pct}%`} · {s.answered}/{s.total}</span>
          </Link>
        ))}
      </div>

      {weakest && (
        <p data-testid="weakest" className="mt-4 text-sm">
          Weakest: <b>Domain {weakest.n}</b> ({weakest.correct}/{weakest.answered} correct).{" "}
          <Link to={`/${cert}/practice?domain=${weakest.n}`} className="text-accent">Practise it</Link>
        </p>
      )}
    </section>
  );
}
