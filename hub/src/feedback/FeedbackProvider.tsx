import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useLocation } from "react-router";
import type { CertId, Question } from "../data/schema";
import { FeedbackDialog } from "./FeedbackDialog";
import type { FeedbackType } from "./payload";

export type Draft = { type: FeedbackType | null; text: string; contact: string };
export const EMPTY_DRAFT: Draft = { type: null, text: "", contact: "" };

type Api = { open: (question?: Question) => void };
type Session = { question?: Question };

const FeedbackContext = createContext<Api | null>(null);

/** Null outside the provider, so callers can skip rendering their entry point. */
export const useFeedback = () => useContext(FeedbackContext);

export function FeedbackProvider({ cert, children }: { cert: CertId; children: ReactNode }) {
  const { pathname, search } = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const here = pathname + search;
  const [route, setRoute] = useState<{ current: string; prev: string | null }>({ current: here, prev: null });
  if (route.current !== here) setRoute({ current: here, prev: route.current });

  const open = useCallback((question?: Question) => setSession({ question }), []);
  const api = useMemo(() => ({ open }), [open]);

  return (
    <FeedbackContext.Provider value={api}>
      {children}
      {session && (
        <FeedbackDialog
          cert={cert}
          pathname={pathname}
          search={search}
          prevRoute={route.prev}
          question={session.question}
          draft={draft}
          setDraft={setDraft}
          onClose={() => setSession(null)}
        />
      )}
    </FeedbackContext.Provider>
  );
}
