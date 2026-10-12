import { Html } from "../components/Html";
import { catalog } from "../data";
import { usePlan } from "../hooks/usePlan";
import { doneCount } from "../lib/stats";
import { useProgress } from "../state/progress";

export default function PlanPage() {
  const { trackId, track, doneTasks, step } = usePlan();
  const setTrack = useProgress((s) => s.setTrack);
  const setActiveStep = useProgress((s) => s.setActiveStep);
  const { trackOrder, tracks, statics } = catalog.ccarf;

  return (
    <section className="max-w-3xl">
      <h2 className="font-serif text-3xl">Three Roads to CCAR-F</h2>
      <Html className="content mt-4" html={statics.place} />

      <div role="group" aria-label="Choose a track" data-tour="tracks" className="mt-6 grid gap-2 sm:grid-cols-3">
        {trackOrder.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={id === trackId}
            onClick={() => setTrack(id)}
            className={`rounded border p-3 text-left ${id === trackId ? "border-accent bg-accent-soft" : "border-line bg-surface"}`}
          >
            <span className="block font-semibold">{tracks[id].name}</span>
            <Html as="span" className="block text-xs text-muted" html={tracks[id].tag} />
          </button>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="font-serif text-2xl">{track.name} track</h3>
        <Html as="p" className="content mt-2" html={track.who} />
        <p className="mt-2 font-mono text-xs text-muted">
          <Html as="span" html={track.runway} /> · {track.steps.length} {track.unit.toLowerCase()}s
        </p>
      </div>

      <div className="mt-4 space-y-2">
        {track.notes.map((n, i) => (
          <Html
            key={i}
            className={`content rounded border p-3 text-sm ${n.w ? "border-accent/50 bg-accent-soft" : "border-line bg-surface"}`}
            html={`<b>${n.b}</b> ${n.t}`}
          />
        ))}
      </div>

      <h3 className="mt-8 font-serif text-xl">All {track.unit.toLowerCase()}s</h3>
      <ol data-tour="plan-steps" className="mt-3 divide-y divide-line rounded border border-line bg-surface">
        {track.steps.map((s) => {
          const n = doneCount(s, doneTasks);
          const complete = n === s.tasks.length;
          return (
            <li key={s.n}>
              <button
                type="button"
                aria-current={s.n === step.n ? "step" : undefined}
                onClick={() => setActiveStep(s.n)}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left ${s.n === step.n ? "bg-accent-soft" : ""}`}
              >
                <span className={`font-mono text-xs ${complete ? "text-good" : n ? "text-accent" : "text-muted"}`}>
                  {complete ? "✓" : n ? "◐" : "○"}
                </span>
                <span className="w-10 font-mono text-xs">{track.unit[0]}{s.n}</span>
                <Html as="span" html={s.short} />
                <span className="ml-auto font-mono text-xs text-muted">{n}/{s.tasks.length}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
