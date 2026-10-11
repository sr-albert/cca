import type { Step, Track } from "../../content/ccarf/types";
import { useRunAction } from "../../hooks/useRunAction";
import { useProgress } from "../../state/progress";
import { Html } from "../Html";

export function StepTasks({ track, step, done }: { track: Track; step: Step; done: number[] }) {
  const setTaskDone = useProgress((s) => s.setTaskDone);
  const setStepTasks = useProgress((s) => s.setStepTasks);
  const run = useRunAction();

  return (
    <div>
      <ul className="space-y-3">
        {step.tasks.map((task, i) => {
          const isDone = done.includes(i);
          return (
            <li key={i} className="flex gap-2">
              <input
                type="checkbox"
                checked={isDone}
                aria-label={`Mark task ${i + 1} done`}
                onChange={() => setTaskDone(track.id, step.n, i, !isDone)}
                className="mt-1 accent-[var(--accent)]"
              />
              <div className={isDone ? "text-muted" : ""}>
                <Html as="span" className="content text-sm" html={task.text} />
                {task.actions.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {task.actions.map((a, j) => (
                      <button
                        key={j}
                        type="button"
                        onClick={() => run(a, step.n, i)}
                        className="rounded border border-line px-2 py-0.5 font-mono text-xs hover:border-accent hover:text-accent"
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {step.gate && (
        <div className="mt-4 rounded border border-accent/40 bg-accent-soft p-3 text-sm">
          <b>Gate</b>
          <br />
          <Html as="span" html={step.gate} />
        </div>
      )}
      <div className="mt-3 flex gap-3 text-xs">
        <button type="button" onClick={() => setStepTasks(track.id, step.n, step.tasks.map((_, i) => i))}>Mark all done</button>
        <button type="button" onClick={() => setStepTasks(track.id, step.n, [])}>Clear</button>
      </div>
    </div>
  );
}
