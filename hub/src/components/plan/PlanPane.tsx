import { useState } from "react";
import { usePlan } from "../../hooks/usePlan";
import { doneCount } from "../../lib/stats";
import { useProgress } from "../../state/progress";
import { Html } from "../Html";
import { PlanPaneBody } from "./PlanPaneBody";

/** Desktop: a foldable right column. Below lg: a button that opens a drawer. */
export function PlanPane() {
  const paneOpen = useProgress((s) => s.plan.paneOpen);
  const setPaneOpen = useProgress((s) => s.setPaneOpen);
  const { track, doneTasks, step } = usePlan();
  const [drawer, setDrawer] = useState(false);
  const summary = `${track.unit} ${step.n} &middot; ${step.title} &middot; ${doneCount(step, doneTasks)}/${step.tasks.length}`;

  return (
    <>
      <aside
        aria-label="Today's plan"
        className={`hidden shrink-0 border-l border-line bg-pane lg:block ${paneOpen ? "w-80 p-4" : "w-12"}`}
      >
        {paneOpen ? (
          <>
            <button type="button" aria-expanded="true" onClick={() => setPaneOpen(false)} className="mb-3 font-mono text-xs uppercase tracking-widest">
              Today’s plan ›
            </button>
            <PlanPaneBody />
          </>
        ) : (
          <button
            type="button"
            aria-expanded="false"
            onClick={() => setPaneOpen(true)}
            className="h-full w-full py-4 font-mono text-xs [writing-mode:vertical-rl]"
          >
            Today’s plan · <Html as="span" html={summary} />
          </button>
        )}
      </aside>
      <button
        type="button"
        onClick={() => setDrawer(true)}
        className="fixed bottom-4 right-4 rounded-full border border-accent bg-surface px-4 py-2 font-mono text-xs text-accent shadow lg:hidden"
      >
        Today’s plan
      </button>
      {drawer && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setDrawer(false)}>
          <div
            role="dialog"
            aria-label="Today's plan drawer"
            className="absolute right-0 top-0 h-full w-[min(22rem,100%)] overflow-y-auto bg-pane p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={() => setDrawer(false)} className="mb-3 font-mono text-xs">Close ×</button>
            <PlanPaneBody />
          </div>
        </div>
      )}
    </>
  );
}
