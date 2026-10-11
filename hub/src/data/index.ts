import mirror from "./generated/mirror";
import { buildCatalog } from "./catalog";
import { CERT_IDS, MirrorFile, type CertId, type Lesson, type Question } from "./schema";

export const catalog = buildCatalog(MirrorFile.parse(mirror));

export const getCert = (id: CertId) => catalog.certs.find((c) => c.id === id);

export const questionsByCert = Object.fromEntries(
  CERT_IDS.map((id) => [id, catalog.questions.filter((q) => q.cert === id)]),
) as Record<CertId, Question[]>;

export const lessonsByCert = Object.fromEntries(
  CERT_IDS.map((id) => [id, catalog.lessons.filter((l) => l.cert === id)]),
) as Record<CertId, Lesson[]>;

export const DIAGNOSTIC: ReadonlySet<string> = new Set(catalog.ccarf.diagnostic);
