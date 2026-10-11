import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import type { TrackId } from "../content/ccarf/types";
import type { Answer, CertId } from "../data/schema";

export const STORAGE_KEY = "studyhub:v1";
export type CardMark = "known" | "again";

export type ProgressData = {
  answers: Record<string, Answer>;
  plan: { track: TrackId; doneTasks: Record<TrackId, Record<number, number[]>>; paneOpen: boolean };
  cards: Record<string, CardMark>;
  lastVisit: { cert: CertId; path: string } | null;
  /** The step shown in the plan; null follows the current (lowest unfinished) step. */
  activeStep: number | null;
};

type ProgressActions = {
  answer: (id: string, selected: number[], correct: boolean) => void;
  resetAnswers: (ids: string[]) => void;
  setTrack: (track: TrackId) => void;
  setActiveStep: (n: number) => void;
  setTaskDone: (track: TrackId, step: number, idx: number, done: boolean) => void;
  setStepTasks: (track: TrackId, step: number, idxs: number[]) => void;
  setPaneOpen: (open: boolean) => void;
  markCard: (term: string, mark: CardMark) => void;
  setLastVisit: (v: { cert: CertId; path: string }) => void;
};

export type ProgressState = ProgressData & ProgressActions;

export const initialProgress = (): ProgressData => ({
  answers: {},
  plan: { track: "experienced", doneTasks: { beginner: {}, experienced: {}, expert: {} }, paneOpen: true },
  cards: {},
  lastVisit: null,
  activeStep: null,
});

/** localStorage that never throws and treats unparseable data as absent. */
const safeStorage: StateStorage = {
  getItem: (key) => {
    try {
      const value = localStorage.getItem(key);
      if (value === null) return null;
      JSON.parse(value);
      return value;
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try { localStorage.setItem(key, value); } catch { /* storage blocked or full */ }
  },
  removeItem: (key) => {
    try { localStorage.removeItem(key); } catch { /* storage blocked */ }
  },
};

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      ...initialProgress(),
      answer: (id, selected, correct) =>
        set((s) => ({ answers: { ...s.answers, [id]: { selected, correct, at: new Date().toISOString() } } })),
      resetAnswers: (ids) =>
        set((s) => {
          const answers = { ...s.answers };
          for (const id of ids) delete answers[id];
          return { answers };
        }),
      setTrack: (track) => set((s) => ({ plan: { ...s.plan, track }, activeStep: null })),
      setActiveStep: (n) => set({ activeStep: n }),
      setTaskDone: (track, step, idx, done) =>
        set((s) => {
          const current = s.plan.doneTasks[track][step] ?? [];
          const next = done
            ? [...new Set([...current, idx])].sort((a, b) => a - b)
            : current.filter((i) => i !== idx);
          return { activeStep: step, plan: { ...s.plan, doneTasks: { ...s.plan.doneTasks, [track]: { ...s.plan.doneTasks[track], [step]: next } } } };
        }),
      setStepTasks: (track, step, idxs) =>
        set((s) => ({ activeStep: step, plan: { ...s.plan, doneTasks: { ...s.plan.doneTasks, [track]: { ...s.plan.doneTasks[track], [step]: idxs } } } })),
      setPaneOpen: (open) => set((s) => ({ plan: { ...s.plan, paneOpen: open } })),
      markCard: (term, mark) => set((s) => ({ cards: { ...s.cards, [term]: mark } })),
      setLastVisit: (lastVisit) => set({ lastVisit }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ answers: s.answers, plan: s.plan, cards: s.cards, lastVisit: s.lastVisit }),
    },
  ),
);
