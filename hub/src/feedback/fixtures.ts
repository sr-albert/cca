import type { FeedbackPayload } from "./payload";

export function samplePayload(): FeedbackPayload {
  return {
    type: "wrong-answer",
    text: "Option C is marked wrong, but the explanation supports it.",
    contact: "learner@example.com",
    reporterId: "3b241101-e2bb-4255-8caf-4136c566a962",
    context: {
      cert: "ccarf",
      route: "/ccarf/practice",
      url: "http://localhost:5173/ccarf/practice?domain=1",
      prevRoute: "/ccarf/plan",
      question: {
        id: "Q34",
        source: "mine",
        domain: 1,
        task: "1.3",
        answer: { selected: [2], correct: false, at: "2026-10-21T09:30:00.000Z" },
      },
    },
    meta: {
      contentVersion: { commit: "bcc6669", dirty: false, mirror: "3fa1c2d0" },
      device: {
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/130.0.0.0 Safari/537.36",
        browser: "Chrome",
        browserVersion: "130",
        os: "macOS",
        deviceType: "desktop",
        screen: { w: 1920, h: 1080 },
        viewport: { w: 1280, h: 720 },
        pixelRatio: 2,
        zoom: null,
        languages: ["en-US"],
        timeZone: "Europe/Berlin",
        localTime: "2026-10-21T11:30:00+02:00",
        colorScheme: "light",
        reducedMotion: false,
        pointer: "fine",
        touch: false,
        connection: null,
      },
      study: {
        cert: { answered: 12, correct: 9, total: 52 },
        overall: { answered: 12, correct: 9 },
        diagnosticDone: true,
        tourSeen: true,
      },
      errors: [],
    },
  };
}
