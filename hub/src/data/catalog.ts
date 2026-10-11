import * as ccarf from "../content/ccarf";
import { CERT_IDS, type Cert, type Flashcard, type Lesson, type MirrorFile, type Question } from "./schema";

const ccarfContent = {
  trackOrder: ccarf.TRACK_ORDER,
  tracks: ccarf.tracks,
  heuristics: ccarf.heuristics,
  blueprint: ccarf.blueprint,
  scenarios: ccarf.scenarios,
  diagnostic: ccarf.diagnostic,
  statics: ccarf.statics,
};
export type CcarfContent = typeof ccarfContent;

export type Catalog = {
  certs: Cert[];
  questions: Question[];
  lessons: Lesson[];
  flashcards: Flashcard[];
  ccarf: CcarfContent;
  mirrorAvailable: boolean;
};

const guideDomains = ccarf.blueprint.domains.map((d) => ({ n: d.n, name: d.name, weight: d.w }));
const fallbackCcarf: Cert = { id: "ccarf", code: "CCAR-F", name: "Claude Certified Architect &ndash; Foundations", domains: guideDomains };

export function buildCatalog(mirror: MirrorFile): Catalog {
  const certs = CERT_IDS.flatMap((id): Cert[] => {
    const found = mirror.certs.find((c) => c.id === id);
    if (id === "ccarf") return [{ ...(found ?? fallbackCcarf), domains: guideDomains }];
    return found ? [found] : [];
  });

  const questions = [...ccarf.questions, ...mirror.questions];
  const seen = new Set<string>();
  for (const q of questions) {
    if (seen.has(q.id)) throw new Error(`Duplicate question id: ${q.id}`);
    seen.add(q.id);
  }

  return {
    certs,
    questions,
    lessons: [ccarf.lab, ...mirror.lessons],
    flashcards: mirror.flashcards,
    ccarf: ccarfContent,
    mirrorAvailable: mirror.mirrorAvailable,
  };
}
