import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { z } from "zod";
import { CERT_IDS, CertId, MirrorData, type MirrorFile } from "../src/data/schema";
import { escapeHtml as esc } from "../src/lib/html";

const En = z.object({ en: z.string() });
const RawLearn = z.object({
  certs: z.record(z.string(), z.object({
    code: z.string(),
    name: z.string(),
    domains: z.record(z.string(), z.object({ en: z.string(), w: z.number() })),
  })),
  questions: z.array(z.object({
    cert: CertId,
    id: z.string(),
    source: z.string(),
    domain: z.number(),
    type: z.enum(["mc", "mr"]),
    ans: z.array(z.number()),
    q: z.string(),
    opts: z.array(z.string()),
    why_en: z.array(z.string()).nullish(),
    rationale: z.string().nullish(),
    takeaway_en: z.string().nullish(),
    task: z.string().nullish(),
    scenario: z.number().nullish(),
  })),
  labs: z.array(z.object({
    cert: CertId,
    domain: z.number(),
    task: z.string(),
    slug: z.string(),
    title: En,
    lead: En,
    mechanism: z.object({ en: z.array(z.object({ h: z.string(), p: z.string() })) }),
    diagram: z.string().nullish(),
    questionIds: z.array(z.string()),
  })),
  fcs: z.record(z.string(), z.object({ s: z.string() })),
});

/** Returns the `{...}` literal starting at `start`, skipping braces inside JSON strings. */
export function sliceObjectLiteral(src: string, start: number): string {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (c === "\\") escaped = true;
      else if (c === '"') inString = false;
    } else if (c === '"') inString = true;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return src.slice(start, i + 1);
  }
  throw new Error("window.LEARN object is not terminated");
}

function formatPath(path: PropertyKey[]): string {
  return path.map((p, i) => (typeof p === "number" ? `[${p}]` : `${i ? "." : ""}${String(p)}`)).join("");
}

function parseOrExplain<T>(schema: z.ZodType<T>, value: unknown, what: string): T {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  const detail = result.error.issues.map((i) => `${formatPath(i.path)}: ${i.message}`).join("; ");
  throw new Error(`${what} format changed: ${detail}`);
}

export function extractLearn(html: string): MirrorData {
  const match = /window\.LEARN\s*=\s*\{/.exec(html);
  if (!match) throw new Error("window.LEARN not found in learn.html");
  const literal = sliceObjectLiteral(html, match.index + match[0].length - 1);
  const raw = parseOrExplain(RawLearn, JSON.parse(literal), "Mirror");

  const certs = CERT_IDS.filter((id) => raw.certs[id]).map((id) => {
    const c = raw.certs[id];
    return {
      id,
      code: c.code,
      name: esc(c.name),
      domains: Object.entries(c.domains)
        .map(([n, d]) => ({ n: Number(n), name: esc(d.en), weight: d.w }))
        .sort((a, b) => a.n - b.n),
    };
  });

  const questions = raw.questions.map((q) => {
    const rationale = q.rationale ?? q.takeaway_en;
    return {
      id: q.id,
      cert: q.cert,
      domain: q.domain,
      ...(q.task ? { task: q.task } : {}),
      ...(q.scenario != null ? { scenario: q.scenario } : {}),
      source: q.source === "official" ? ("official" as const) : ("mirror" as const),
      kind: q.type === "mr" ? ("multi" as const) : ("single" as const),
      stem: esc(q.q),
      options: q.opts.map(esc),
      correct: q.ans,
      ...(q.why_en ? { explanations: q.why_en.map(esc) } : {}),
      ...(rationale ? { rationale: esc(rationale) } : {}),
    };
  });

  const lessons = raw.labs.map((l) => ({
    slug: l.slug,
    cert: l.cert,
    domain: l.domain,
    task: l.task,
    title: esc(l.title.en),
    lead: esc(l.lead.en),
    mechanism: l.mechanism.en.map(({ h, p }) => ({ h: esc(h), p: esc(p) })),
    ...(l.diagram ? { diagram: l.diagram } : {}),
    questionIds: l.questionIds,
  }));

  const flashcards = Object.entries(raw.fcs).map(([term, v]) => ({ term: esc(term), sentence: esc(v.s) }));

  return parseOrExplain(MirrorData, { certs, questions, lessons, flashcards }, "Extracted mirror");
}

export function run(mirrorPath: string, outDir: string): MirrorFile {
  const data: MirrorFile = existsSync(mirrorPath)
    ? { mirrorAvailable: true, ...extractLearn(readFileSync(mirrorPath, "utf8")) }
    : { mirrorAvailable: false, certs: [], questions: [], lessons: [], flashcards: [] };
  if (!data.mirrorAvailable) console.warn(`Mirror not found at ${mirrorPath}; building with CCAR-F content only.`);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "mirror.js"), `export default JSON.parse(${JSON.stringify(JSON.stringify(data))});\n`);
  writeFileSync(join(outDir, "mirror.d.ts"), "declare const mirror: unknown;\nexport default mirror;\n");
  return data;
}

const hubRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const data = run(
      process.env.MIRROR_PATH ?? resolve(hubRoot, "../mirror/exam-prep-web/learn.html"),
      resolve(hubRoot, "src/data/generated"),
    );
    console.log(`Mirror: ${data.questions.length} questions, ${data.lessons.length} lessons, ${data.flashcards.length} flashcards.`);
  } catch (e) {
    console.error((e as Error).message);
    process.exit(1);
  }
}
