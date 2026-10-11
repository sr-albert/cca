import { describe, expect, it } from "vitest";
import { buildCatalog } from "./catalog";
import type { MirrorFile } from "./schema";

const empty: MirrorFile = { mirrorAvailable: false, certs: [], questions: [], lessons: [], flashcards: [] };

const mirror: MirrorFile = {
  mirrorAvailable: true,
  certs: [
    { id: "ccao", code: "CCAO-F", name: "Associate", domains: [{ n: 1, name: "Basics", weight: 100 }] },
    { id: "ccarf", code: "CCAR-F", name: "Architect", domains: [{ n: 1, name: "Mirror name", weight: 99 }] },
  ],
  questions: [{ id: "ccao-001", cert: "ccao", domain: 1, source: "mirror", kind: "single", stem: "S", options: ["a", "b"], correct: [0] }],
  lessons: [{ slug: "l1", cert: "ccao", domain: 1, task: "1.1", title: "T", lead: "L", mechanism: [], questionIds: [] }],
  flashcards: [{ term: "t", sentence: "s" }],
};

describe("buildCatalog", () => {
  it("works with no mirror: CCAR-F own content only", () => {
    const c = buildCatalog(empty);
    expect(c.mirrorAvailable).toBe(false);
    expect(c.certs.map((x) => x.id)).toEqual(["ccarf"]);
    expect(c.questions).toHaveLength(52);
    expect(c.lessons.map((l) => l.slug)).toEqual(["agentic-loop"]);
    expect(c.flashcards).toEqual([]);
  });

  it("merges the mirror and orders certs by CERT_IDS", () => {
    const c = buildCatalog(mirror);
    expect(c.certs.map((x) => x.id)).toEqual(["ccarf", "ccao"]);
    expect(c.questions).toHaveLength(53);
    expect(c.lessons).toHaveLength(2);
    expect(c.flashcards).toHaveLength(1);
  });

  it("uses the official guide's CCAR-F domains, not the mirror's", () => {
    const ccarf = buildCatalog(mirror).certs[0];
    expect(ccarf.name).toBe("Architect");
    expect(ccarf.domains).toHaveLength(5);
    expect(ccarf.domains[0]).toEqual({ n: 1, name: "Agentic Architecture &amp; Orchestration", weight: 27 });
  });

  it("rejects duplicate question ids across sources", () => {
    const dup: MirrorFile = { ...mirror, questions: [{ ...mirror.questions[0], id: "Q01", cert: "ccarf" }] };
    expect(() => buildCatalog(dup)).toThrow("Duplicate question id: Q01");
  });
});
