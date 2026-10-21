import { DIAGNOSTIC, questionsByCert } from "../data";
import type { Answer, CertId, Question } from "../data/schema";
import type { ProgressData } from "../state/progress";
import type { Context, Device, ErrorEntry, FeedbackPayload, FeedbackType, Study } from "./payload";
import { CONTENT_VERSION } from "./version";

export function contextFor(o: {
  cert: CertId;
  pathname: string;
  search: string;
  prevRoute: string | null;
  question?: Question;
  answer?: Answer;
}): Context {
  const q = o.question;
  return {
    cert: o.cert,
    route: o.pathname,
    url: o.pathname + o.search,
    prevRoute: o.prevRoute,
    question: q
      ? {
          id: q.id,
          source: q.source,
          domain: q.domain,
          ...(q.task !== undefined && { task: q.task }),
          answer: o.answer ? { selected: o.answer.selected, correct: o.answer.correct, at: o.answer.at } : null,
        }
      : null,
  };
}

export function studySummary(p: Pick<ProgressData, "answers" | "tourSeen">, cert: CertId): Study {
  const ids = questionsByCert[cert].map((q) => q.id);
  const answers = Object.values(p.answers);
  const inCert = ids.map((id) => p.answers[id]).filter((a): a is Answer => a !== undefined);
  return {
    cert: { answered: inCert.length, correct: inCert.filter((a) => a.correct).length, total: ids.length },
    overall: { answered: answers.length, correct: answers.filter((a) => a.correct).length },
    diagnosticDone: [...DIAGNOSTIC].every((id) => p.answers[id] !== undefined),
    tourSeen: p.tourSeen,
  };
}

export function buildPayload(
  input: { type: FeedbackType; text: string; contact: string; context: Context | null },
  deps: { device: Device; study: Study; errors: ErrorEntry[]; reporterId: string },
): FeedbackPayload {
  const contact = input.contact.trim();
  return {
    type: input.type,
    text: input.text.trim(),
    ...(contact && { contact }),
    reporterId: deps.reporterId,
    context: input.context,
    meta: { contentVersion: CONTENT_VERSION, device: deps.device, study: deps.study, errors: deps.errors },
  };
}
