import { z } from "zod";

export const CERT_IDS = ["ccarf", "ccarp", "ccdv", "ccao"] as const;
export const CertId = z.enum(CERT_IDS);
export type CertId = z.infer<typeof CertId>;

export const Domain = z.object({ n: z.number().int(), name: z.string(), weight: z.number() });
export type Domain = z.infer<typeof Domain>;

export const Cert = z.object({ id: CertId, code: z.string(), name: z.string(), domains: z.array(Domain) });
export type Cert = z.infer<typeof Cert>;

export const QUESTION_SOURCES = ["mine", "official", "mirror"] as const;
export type QuestionSource = (typeof QUESTION_SOURCES)[number];

export const Question = z
  .object({
    id: z.string(),
    cert: CertId,
    domain: z.number().int(),
    task: z.string().optional(),
    scenario: z.number().int().optional(),
    source: z.enum(QUESTION_SOURCES),
    kind: z.enum(["single", "multi"]),
    stem: z.string(),
    options: z.array(z.string()).min(2),
    correct: z.array(z.number().int().nonnegative()).min(1),
    explanations: z.array(z.string()).optional(),
    rationale: z.string().optional(),
  })
  .refine((q) => q.correct.every((i) => i < q.options.length), { message: "correct index out of range" })
  .refine((q) => (q.kind === "single") === (q.correct.length === 1), { message: "kind does not match number of correct options" });
export type Question = z.infer<typeof Question>;

export const Lesson = z.object({
  slug: z.string(),
  cert: CertId,
  domain: z.number().int(),
  task: z.string(),
  title: z.string(),
  lead: z.string(),
  mechanism: z.array(z.object({ h: z.string(), p: z.string() })),
  diagram: z.string().optional(),
  body: z.string().optional(),
  questionIds: z.array(z.string()),
});
export type Lesson = z.infer<typeof Lesson>;

export const Flashcard = z.object({ term: z.string(), sentence: z.string() });
export type Flashcard = z.infer<typeof Flashcard>;

export const MirrorData = z.object({
  certs: z.array(Cert),
  questions: z.array(Question),
  lessons: z.array(Lesson),
  flashcards: z.array(Flashcard),
});
export type MirrorData = z.infer<typeof MirrorData>;

export const MirrorFile = MirrorData.extend({ mirrorAvailable: z.boolean() });
export type MirrorFile = z.infer<typeof MirrorFile>;

export const PRACTICE_STATUSES = ["unanswered", "wrong", "diagnostic"] as const;
export type PracticeStatus = (typeof PRACTICE_STATUSES)[number];

export type PracticeFilter = {
  domain?: number;
  tasks?: string[];
  scenario?: number;
  source?: QuestionSource;
  ids?: string[];
  status?: PracticeStatus;
};

export type Answer = { selected: number[]; correct: boolean; at: string };
