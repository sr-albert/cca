import { z } from "zod";
import { CertId, QUESTION_SOURCES } from "../data/schema";

export const FEEDBACK_TYPES = ["wrong-answer", "confusing", "outdated", "other"] as const;
export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export const TYPE_LABEL: Record<FeedbackType, string> = {
  "wrong-answer": "Wrong answer",
  confusing: "Confusing explanation",
  outdated: "Outdated",
  other: "Something else",
};

export const ContentVersion = z.object({ commit: z.string(), dirty: z.boolean(), mirror: z.string() });
export type ContentVersion = z.infer<typeof ContentVersion>;

export const QuestionContext = z.object({
  id: z.string(),
  source: z.enum(QUESTION_SOURCES),
  domain: z.number(),
  task: z.string().optional(),
  answer: z.object({ selected: z.array(z.number()), correct: z.boolean(), at: z.string() }).nullable(),
});
export type QuestionContext = z.infer<typeof QuestionContext>;

export const Context = z.object({
  cert: CertId,
  route: z.string(),
  url: z.string(),
  prevRoute: z.string().nullable(),
  question: QuestionContext.nullable(),
});
export type Context = z.infer<typeof Context>;

const Size = z.object({ w: z.number(), h: z.number() });

export const Device = z.object({
  userAgent: z.string(),
  browser: z.string(),
  browserVersion: z.string(),
  os: z.string(),
  deviceType: z.enum(["mobile", "tablet", "desktop"]),
  screen: Size,
  viewport: Size,
  pixelRatio: z.number(),
  zoom: z.number().nullable(),
  languages: z.array(z.string()),
  timeZone: z.string(),
  localTime: z.string(),
  colorScheme: z.enum(["light", "dark"]),
  reducedMotion: z.boolean(),
  pointer: z.enum(["coarse", "fine", "none"]),
  touch: z.boolean(),
  connection: z.string().nullable(),
});
export type Device = z.infer<typeof Device>;

export const ErrorEntry = z.object({
  message: z.string().max(300),
  source: z.string().max(200),
  line: z.number().nullable(),
});
export type ErrorEntry = z.infer<typeof ErrorEntry>;

export const Study = z.object({
  cert: z.object({ answered: z.number(), correct: z.number(), total: z.number() }),
  overall: z.object({ answered: z.number(), correct: z.number() }),
  diagnosticDone: z.boolean(),
  tourSeen: z.boolean(),
});
export type Study = z.infer<typeof Study>;

export const FeedbackPayload = z.object({
  type: z.enum(FEEDBACK_TYPES),
  text: z.string().trim().min(1).max(4000),
  contact: z.string().trim().max(200).optional(),
  hp: z.string().optional(),
  reporterId: z.uuid(),
  context: Context.nullable(),
  meta: z.object({
    contentVersion: ContentVersion,
    device: Device,
    study: Study,
    errors: z.array(ErrorEntry).max(10),
  }),
});
export type FeedbackPayload = z.infer<typeof FeedbackPayload>;

export function formatVersion(v: ContentVersion): string {
  return `${v.commit}${v.dirty ? "-dirty" : ""} · mirror ${v.mirror}`;
}
