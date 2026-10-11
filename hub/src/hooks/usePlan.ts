import { catalog } from "../data";
import { currentStep } from "../lib/stats";
import { useProgress } from "../state/progress";

export function usePlan() {
  const trackId = useProgress((s) => s.plan.track);
  const doneTasks = useProgress((s) => s.plan.doneTasks[trackId]);
  const activeStep = useProgress((s) => s.activeStep);
  const track = catalog.ccarf.tracks[trackId];
  const step = track.steps.find((s) => s.n === activeStep) ?? currentStep(track, doneTasks);
  return { trackId, track, doneTasks, step };
}
