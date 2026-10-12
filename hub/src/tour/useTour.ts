import { driver, type Driver, type DriveStep } from "driver.js";
import { useCallback, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { useLocation, useNavigate } from "react-router";
import { useProgress } from "../state/progress";
import { needsNavigation, pickTarget, tourSelector } from "./resolve";
import { TOUR_STEPS, type TourStep } from "./steps";

const isVisible = (marker: string) => {
  const el = document.querySelector<HTMLElement>(tourSelector(marker));
  if (!el) return false;
  // checkVisibility sees display:none on ancestors; jsdom lacks it and has no layout anyway.
  return typeof el.checkVisibility === "function" ? el.checkVisibility() : true;
};

function toDriveStep(s: TourStep): DriveStep {
  return {
    // A function so the target is resolved when the step shows; undefined lets driver.js
    // wait (waitForElement) and then centre the popover.
    element: s.targets.length
      ? () => {
          const m = pickTarget(s.targets, isVisible);
          return (m ? document.querySelector(tourSelector(m)) : undefined) as Element;
        }
      : undefined,
    popover: { title: s.title, description: s.body },
  };
}

/** Ends the tour for good. driver.js's onDestroyed is skipped while the first highlight animates, so seen is set here. */
function finish(d: Driver) {
  useProgress.getState().setTourSeen(true);
  d.destroy();
}

/** Owns the driver.js instance; returns `start`. */
export function useTour(): () => void {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const drv = useRef<Driver | null>(null);
  const here = useRef({ pathname, search });
  const pending = useRef<string | null>(null);
  const go = useCallback(
    (d: Driver, i: number) => {
      if (i < 0) return;
      if (i >= TOUR_STEPS.length) return finish(d);
      const step = TOUR_STEPS[i];
      if (needsNavigation(step, here.current)) {
        pending.current = step.path;
        navigate(step.path);
      }
      // Commit the store change before driver.js resolves the target (e.g. the pane it opens).
      if (step.before) flushSync(step.before);
      if (d.isActive()) d.moveTo(i);
      else d.drive(i);
    },
    [navigate],
  );

  const start = useCallback(() => {
    if (drv.current?.isActive()) return;
    const d: Driver = driver({
      steps: TOUR_STEPS.map(toDriveStep),
      showProgress: true,
      progressText: "{{current}} of {{total}}",
      overlayClickBehavior: "none",
      disableActiveInteraction: false,
      waitForElement: 2000,
      popoverClass: "tour-popover",
      doneBtnText: "Done",
      onNextClick: () => go(d, (d.getActiveIndex() ?? -1) + 1),
      onPrevClick: () => go(d, (d.getActiveIndex() ?? 0) - 1),
      // Close button and Esc. Our own destroy() calls skip this hook.
      onDestroyStarted: () => finish(d),
    });
    drv.current = d;
    go(d, 0);
  }, [go]);

  // Leaving the step's page by any route other than the tour's own navigation ends the tour.
  useEffect(() => {
    here.current = { pathname, search };
    const d = drv.current;
    if (!d?.isActive()) return;
    const at = pathname + search;
    if (pending.current !== null) {
      if (at === pending.current) pending.current = null;
      return;
    }
    const i = d.getActiveIndex();
    if (i !== undefined && at !== TOUR_STEPS[i].path) finish(d);
  }, [pathname, search]);

  // Unmounting (and StrictMode's dev remount) tears the tour down without marking it seen.
  useEffect(() => () => drv.current?.destroy(), []);

  return start;
}
