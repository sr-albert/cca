import { useNavigate } from "react-router";
import type { Action } from "../content/ccarf/types";
import { filterToSearch } from "../lib/filters";
import { useProgress } from "../state/progress";

/** Carries out a plan task's action, as the old site's chip buttons did. */
export function useRunAction() {
  const navigate = useNavigate();
  const trackId = useProgress((s) => s.plan.track);
  const setTaskDone = useProgress((s) => s.setTaskDone);
  const setTrack = useProgress((s) => s.setTrack);

  return (action: Action, stepN: number, idx: number) => {
    switch (action.go) {
      case "practice": {
        const search = filterToSearch(action.filter);
        navigate(`/ccarf/practice${search ? `?${search}` : ""}`);
        return;
      }
      case "reference":
        navigate(`/ccarf/reference#${action.section}`);
        return;
      case "lesson":
        navigate(`/ccarf/lessons/${action.slug}`);
        return;
      case "track":
        setTaskDone(trackId, stepN, idx, true);
        setTrack(action.track);
        return;
    }
  };
}
