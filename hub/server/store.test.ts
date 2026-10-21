// @vitest-environment node
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { samplePayload } from "../src/feedback/fixtures";
import { openStore, type StoredReport } from "./store";

let dir: string;
let file: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "fb-store-"));
  file = join(dir, "reports.json");
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

const draft = (): Omit<StoredReport, "id"> => ({
  receivedAt: "2026-10-21T10:00:00.000Z",
  ipHash: "h",
  payload: samplePayload(),
  delivery: "undelivered",
  discordMessageId: null,
  verdict: null,
});

describe("openStore", () => {
  it("assigns sequential ids and persists across reopen", () => {
    const store = openStore(file);
    expect(store.add(draft()).id).toBe("FB-0001");
    expect(store.add(draft()).id).toBe("FB-0002");
    const again = openStore(file);
    expect(again.all().map((r) => r.id)).toEqual(["FB-0001", "FB-0002"]);
    expect(again.add(draft()).id).toBe("FB-0003");
  });

  it("updates delivery and discordMessageId", () => {
    const store = openStore(file);
    const r = store.add(draft());
    store.update(r.id, { delivery: "delivered", discordMessageId: "123" });
    const saved = openStore(file).all()[0];
    expect(saved.delivery).toBe("delivered");
    expect(saved.discordMessageId).toBe("123");
  });

  it("throws on a corrupt file, naming the path, and leaves it alone", () => {
    writeFileSync(file, "{not json");
    expect(() => openStore(file)).toThrow(file);
    expect(readFileSync(file, "utf8")).toBe("{not json");
  });

  it("gives 50 concurrent adds unique ids", async () => {
    const store = openStore(file);
    await Promise.all(Array.from({ length: 50 }, () => Promise.resolve().then(() => store.add(draft()))));
    const saved = JSON.parse(readFileSync(file, "utf8")) as StoredReport[];
    expect(saved).toHaveLength(50);
    expect(new Set(saved.map((r) => r.id)).size).toBe(50);
  });
});
