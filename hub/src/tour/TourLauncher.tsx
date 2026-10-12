import "driver.js/dist/driver.css";
import "../styles/tour.css";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useLocation } from "react-router";
import type { CertId } from "../data/schema";
import { useProgress } from "../state/progress";
import { useTour } from "./useTour";

const TourContext = createContext<(() => void) | null>(null);

/** Starts the tour on a first visit to CCAR-F Home (never yanking a deep link) and lets TourButton replay it. */
export function TourLauncher({ cert, children }: { cert: CertId; children: ReactNode }) {
  const start = useTour();
  const tourSeen = useProgress((s) => s.tourSeen);
  const onHome = useLocation().pathname === "/ccarf";

  useEffect(() => {
    if (cert === "ccarf" && onHome && !tourSeen) start();
  }, [cert, onHome, tourSeen, start]);

  return <TourContext.Provider value={start}>{children}</TourContext.Provider>;
}

export function TourButton({ className = "" }: { className?: string }) {
  const start = useContext(TourContext);
  if (!start) return null;
  return (
    <button type="button" onClick={start} className={`font-mono text-xs text-muted hover:text-accent ${className}`}>
      Take the tour
    </button>
  );
}
