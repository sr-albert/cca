// @vitest-environment node
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { extractLearn, run } from "./extract-mirror";

const fixturePath = fileURLToPath(new URL("./fixtures/learn.fixture.html", import.meta.url));
const fixture = readFileSync(fixturePath, "utf8");

function readModule(dir: string): unknown {
  const src = readFileSync(join(dir, "mirror.js"), "utf8");
  const literal = src.replace(/^export default JSON\.parse\(/, "").replace(/\);\s*$/, "");
  return JSON.parse(JSON.parse(literal));
}

describe("extractLearn", () => {
  const data = extractLearn(fixture);

  it("keeps no Vietnamese text", () => {
    expect(JSON.stringify(data)).not.toContain("VI-ONLY");
  });

  it("orders certs by CERT_IDS and domains by number", () => {
    expect(data.certs.map((c) => c.id)).toEqual(["ccarf", "ccao"]);
    expect(data.certs[0].domains.map((d) => d.n)).toEqual([1, 2]);
    expect(data.certs[1].domains[0]).toEqual({ n: 1, name: "Fixture Basics &amp; More", weight: 100 });
  });

  it("maps an official single-answer question", () => {
    expect(data.questions[0]).toEqual({
      id: "fx-001", cert: "ccarf", domain: 1, task: "1.4", scenario: 2,
      source: "official", kind: "single", stem: "Which brace } is closed?",
      options: ["Alpha", "Beta", "Gamma", "Delta"], correct: [1],
      explanations: ["Alpha is wrong.", "Beta is right.", "Gamma is wrong.", "Delta is wrong."],
      rationale: "Prefer Beta.",
    });
  });

  it("maps an authored multi-answer question and escapes its text", () => {
    const q = data.questions[1];
    expect(q.source).toBe("mirror");
    expect(q.kind).toBe("multi");
    expect(q.correct).toEqual([0, 2, 4]);
    expect(q.task).toBeUndefined();
    expect(q.scenario).toBeUndefined();
    expect(q.stem).toBe("Edit services/&lt;name&gt;/infra and &quot;quote&quot;?");
    expect(q.rationale).toBe("Pick one, three and five.");
  });

  it("maps lessons, escaping text but keeping the SVG diagram raw", () => {
    expect(data.lessons[0]).toEqual({
      slug: "fixture-lab", cert: "ccarf", domain: 1, task: "1.4", title: "Fixture Lab", lead: "Lead text.",
      mechanism: [{ h: "Step one", p: "Use &lt;tags&gt; literally." }],
      diagram: '<svg class="diagram" viewBox="0 0 10 10"></svg>', questionIds: ["fx-001"],
    });
  });

  it("maps flashcards", () => {
    expect(data.flashcards).toEqual([
      { term: "--resume &lt;session-name&gt;", sentence: "Reopens the named session." },
      { term: "CLAUDE.md", sentence: "Project memory file." },
    ]);
  });

  it("names the broken field when the format changes", () => {
    const broken = fixture.replace('"opts":["Alpha","Beta","Gamma","Delta"]', '"opts":"Alpha"');
    expect(() => extractLearn(broken)).toThrow(/questions\[0\]\.opts/);
  });

  it("fails clearly when window.LEARN is missing", () => {
    expect(() => extractLearn("<html></html>")).toThrow("window.LEARN not found");
  });
});

describe("run", () => {
  it("writes an empty catalog when the mirror is missing", () => {
    const dir = mkdtempSync(join(tmpdir(), "hub-"));
    const out = run(join(dir, "nope.html"), dir);
    expect(out.mirrorAvailable).toBe(false);
    expect(readModule(dir)).toEqual({ mirrorAvailable: false, certs: [], questions: [], lessons: [], flashcards: [] });
    expect(existsSync(join(dir, "mirror.d.ts"))).toBe(true);
  });

  it("writes the extracted catalog when the mirror exists", () => {
    const dir = mkdtempSync(join(tmpdir(), "hub-"));
    run(fixturePath, dir);
    const written = readModule(dir) as { mirrorAvailable: boolean; questions: unknown[] };
    expect(written.mirrorAvailable).toBe(true);
    expect(written.questions).toHaveLength(2);
  });
});
