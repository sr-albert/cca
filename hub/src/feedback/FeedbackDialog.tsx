import { useEffect, useLayoutEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { getCert } from "../data";
import type { CertId, Question } from "../data/schema";
import { useProgress } from "../state/progress";
import { buildPayload, contextFor, studySummary } from "./collect";
import { collectDevice } from "./device";
import { recentErrors } from "./errors";
import { applyMarkdown, type MarkdownKind } from "./markdown";
import { FEEDBACK_TYPES, TYPE_LABEL, type FeedbackPayload } from "./payload";
import { EMPTY_DRAFT, type Draft } from "./FeedbackProvider";
import { getReporterId } from "./reporter";
import { sendFeedback } from "./send";

type Props = {
  cert: CertId;
  pathname: string;
  search: string;
  prevRoute: string | null;
  question?: Question;
  draft: Draft;
  setDraft: Dispatch<SetStateAction<Draft>>;
  sending: boolean;
  beginSend: () => boolean;
  endSend: () => void;
  onClose: () => void;
};
type Status = "idle" | "sent" | "rate-limited" | "failed";

const TOOLS: [MarkdownKind, string, string][] = [
  ["bold", "B", "Bold"],
  ["italic", "I", "Italic"],
  ["code", "code", "Code"],
  ["list", "list", "List"],
  ["link", "link", "Link"],
];
const ERROR_COPY = {
  "rate-limited": "Too many reports from your network right now. Please try again later.",
  failed: "Couldn't send your report. Your text is still here, so you can try again.",
};
const field = "w-full rounded border border-line bg-paper px-2 py-1.5 text-sm text-ink";

function PayloadPreview({ build }: { build: () => FeedbackPayload }) {
  let json: string | null = null;
  try {
    json = JSON.stringify(build(), null, 2);
  } catch {
    // fall through to the message below
  }
  if (json === null) return <p className="text-xs text-muted">Couldn't build the preview.</p>;
  return <pre className="max-h-48 overflow-auto rounded border border-line bg-pane p-2 font-mono text-xs">{json}</pre>;
}

export function FeedbackDialog({ cert, pathname, search, prevRoute, question, draft, setDraft, sending, beginSend, endSend, onClose }: Props) {
  const answer = useProgress((s) => (question ? s.answers[question.id] : undefined));
  const [attach, setAttach] = useState(true);
  const [status, setStatus] = useState<Status>("idle");
  const [showJson, setShowJson] = useState(false);
  const [hp, setHp] = useState("");
  const panel = useRef<HTMLDivElement>(null);
  const area = useRef<HTMLTextAreaElement>(null);
  const caret = useRef<[number, number] | null>(null);

  useEffect(() => panel.current?.focus(), []);
  useLayoutEffect(() => {
    if (caret.current) area.current?.setSelectionRange(...caret.current);
    caret.current = null;
  });

  const context = attach ? contextFor({ cert, pathname, search, prevRoute, question, answer }) : null;
  const aboutLabel = question
    ? ["About: " + question.id, `Domain ${question.domain}`, question.task].filter(Boolean).join(" · ")
    : `About: ${getCert(cert)?.code ?? cert} · ${pathname}`;
  const ready = draft.type !== null && draft.text.trim() !== "";

  function payload(): FeedbackPayload {
    const p = buildPayload(
      { type: draft.type ?? "other", text: draft.text, contact: draft.contact, context },
      {
        device: collectDevice(window),
        study: studySummary(useProgress.getState(), cert),
        errors: recentErrors(),
        reporterId: getReporterId(),
      },
    );
    return hp ? { ...p, hp } : p;
  }

  async function submit() {
    if (!ready || !beginSend()) return;
    setStatus("idle");
    try {
      const r = await sendFeedback(payload());
      if (r.ok) setDraft(EMPTY_DRAFT);
      setStatus(r.ok ? "sent" : r.reason);
    } catch {
      setStatus("failed");
    } finally {
      endSend();
    }
  }

  function format(kind: MarkdownKind) {
    const el = area.current;
    if (!el) return;
    const r = applyMarkdown(draft.text, el.selectionStart, el.selectionEnd, kind);
    caret.current = [r.start, r.end];
    setDraft((d) => ({ ...d, text: r.text.slice(0, 4000) }));
    el.focus();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        tabIndex={-1}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-lg border border-line bg-surface p-4 text-ink shadow-xl outline-none sm:max-w-md sm:rounded-lg"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 id="feedback-title" className="font-serif text-lg">Report a problem</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="text-muted hover:text-accent">✕</button>
        </div>

        {status === "sent" ? (
          <div className="py-4">
            <p className="font-serif text-lg">Thanks, it's on its way.</p>
            <p className="mt-1 text-sm text-muted">We check every report. If it holds up, the question gets fixed on the site.</p>
            <button type="button" onClick={onClose} className="mt-4 rounded border border-accent px-3 py-1 text-sm text-accent">Back</button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); void submit(); }} className="grid gap-3">
            <p className="flex items-center justify-between gap-2 font-mono text-xs text-muted">
              <span>{attach ? aboutLabel : "No page attached"}</span>
              {attach && <button type="button" onClick={() => setAttach(false)} className="hover:text-accent">Remove</button>}
            </p>

            <div role="radiogroup" aria-label="Problem type" className="flex flex-wrap gap-2">
              {FEEDBACK_TYPES.map((t) => (
                <label key={t} className={`cursor-pointer rounded border px-2 py-1 text-xs ${draft.type === t ? "border-accent bg-accent-soft text-accent" : "border-line hover:border-ink"}`}>
                  <input type="radio" name="type" className="sr-only" checked={draft.type === t} onChange={() => setDraft((d) => ({ ...d, type: t }))} />
                  {TYPE_LABEL[t]}
                </label>
              ))}
            </div>

            <div>
              <div className="mb-1 flex gap-1" role="toolbar" aria-label="Formatting">
                {TOOLS.map(([kind, label, name]) => (
                  <button key={kind} type="button" aria-label={name} onClick={() => format(kind)} className="rounded border border-line px-2 py-0.5 font-mono text-xs hover:border-accent hover:text-accent">
                    {label}
                  </button>
                ))}
              </div>
              <textarea
                ref={area}
                aria-label="What should change?"
                placeholder="What should change?"
                rows={5}
                maxLength={4000}
                value={draft.text}
                onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
                className={field}
              />
              <p className="text-right font-mono text-xs text-muted">{draft.text.length} / 4000</p>
            </div>

            <input aria-label="Contact" placeholder="Discord handle or email" maxLength={200} value={draft.contact} onChange={(e) => setDraft((d) => ({ ...d, contact: e.target.value }))} className={field} />
            <input name="website" aria-hidden="true" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" />

            <p className="text-xs text-muted">
              Also sent: this page, your browser details, your study progress and an anonymous ID.{" "}
              <button type="button" aria-expanded={showJson} onClick={() => setShowJson((s) => !s)} className="text-accent underline">See exactly what</button>
            </p>
            {showJson && <PayloadPreview build={payload} />}

            {(status === "rate-limited" || status === "failed") && <p role="alert" className="text-sm text-bad">{ERROR_COPY[status]}</p>}

            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted">No account needed.</span>
              <button type="submit" disabled={!ready || sending} className="rounded bg-accent px-3 py-1 text-sm text-paper disabled:opacity-40">
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
