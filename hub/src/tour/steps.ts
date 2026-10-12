import { useProgress } from "../state/progress";

export type TourStep = {
  id: string;
  /** Route plus optional query the step is shown on. */
  path: string;
  /** data-tour markers, first visible wins; empty centres the popover. */
  targets: string[];
  title: string;
  /** HTML. */
  body: string;
  before?: () => void;
};

const DIAGNOSTIC = "/ccarf/practice?status=diagnostic";

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    path: "/ccarf",
    targets: [],
    title: "Welcome to your study hub",
    body: "A two-minute tour: pick a track, find today's tasks, then take a 15-question diagnostic to see where you stand.",
  },
  {
    id: "tracks",
    path: "/ccarf/plan",
    targets: ["tracks"],
    title: "Pick your track",
    body: "<em>Experienced</em> fits if you use Claude Code daily but haven't built with the API or Agent SDK. Click one now. You can switch anytime, and progress is kept per track.",
  },
  {
    id: "today",
    path: "/ccarf/plan",
    targets: ["plan-pane", "plan-steps"],
    title: "Today's tasks live here",
    body: "Tick each task as you finish it. The buttons on a task jump straight to the practice set, lesson or reference section it needs.",
    before: () => useProgress.getState().setPaneOpen(true),
  },
  {
    id: "nav",
    path: "/ccarf/plan",
    targets: ["nav", "nav-top"],
    title: "Everything else",
    body: "<em>Lessons</em> for reading, <em>Practice</em> for questions, <em>Flashcards</em> for recall, <em>Reference</em> for the exam blueprint and heuristics.",
  },
  {
    id: "domains",
    path: "/ccarf",
    targets: ["domains"],
    title: "Your weak spots show up here",
    body: "After you answer questions, the weakest domain is highlighted. Click any row to practise that domain.",
  },
  {
    id: "diagnostic",
    path: DIAGNOSTIC,
    targets: ["filters"],
    title: "Start with the diagnostic",
    body: "15 questions spread across all five domains. Answer from memory, with no notes. The goal is to find your gaps, not to score well.",
  },
  {
    id: "answer",
    path: DIAGNOSTIC,
    targets: ["question"],
    title: "How to answer",
    body: "Choose, Submit, then read <em>every</em> explanation, including why the wrong options are wrong. That's where most of the learning happens.",
  },
];
