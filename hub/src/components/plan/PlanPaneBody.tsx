import type { TrackId } from "../../content/ccarf/types";
import { catalog } from "../../data";
import { usePlan } from "../../hooks/usePlan";
import { doneCount } from "../../lib/stats";
import { useProgress } from "../../state/progress";
import { Html } from "../Html";
import { StepTasks } from "./StepTasks";

export function PlanPaneBody() {
  const { trackId, track, doneTasks, step } = usePlan();
  const setTrack = useProgress((s) => s.setTrack);
  const setActiveStep = useProgress((s) => s.setActiveStep);
  const { trackOrder, tracks } = catalog.ccarf;

  return (
    <div className="space-y-3">
      <select
        aria-label="Track"
        value={trackId}
        onChange={(e) => setTrack(e.target.value as TrackId)}
        className="w-full rounded border border-line bg-surface px-2 py-1 text-sm"
      >
        {trackOrder.map((id) => (
          <option key={id} value={id}>
            {tracks[id].name} track · {tracks[id].steps.length} {tracks[id].unit.toLowerCase()}s
          </option>
        ))}
      </select>
      <div className="flex flex-wrap gap-1">
        {track.steps.map((s) => {
          const complete = doneCount(s, doneTasks) === s.tasks.length;
          return (
            <button
              key={s.n}
              type="button"
              aria-current={s.n === step.n ? "step" : undefined}
              title={`${track.unit} ${s.n} · ${s.short}`}
              onClick={() => setActiveStep(s.n)}
              className={`rounded border px-1.5 py-0.5 font-mono text-xs ${
                s.n === step.n ? "border-accent text-accent" : complete ? "border-good text-good" : "border-line"
              }`}
            >
              {track.unit[0]}{s.n}
            </button>
          );
        })}
      </div>
      <Html as="p" className="font-serif text-lg" html={`${track.unit} ${step.n} &middot; ${step.title}`} />
      <p className="font-mono text-xs text-muted">
        {doneCount(step, doneTasks)} of {step.tasks.length} tasks
        {step.dur && <> · <Html as="span" html={step.dur} /></>}
      </p>
      <StepTasks track={track} step={step} done={doneTasks[step.n] ?? []} />
    </div>
  );
}
