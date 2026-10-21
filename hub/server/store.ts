import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import type { FeedbackPayload } from "../src/feedback/payload";

export type StoredReport = {
  id: string;
  receivedAt: string;
  ipHash: string;
  payload: FeedbackPayload;
  delivery: "delivered" | "undelivered" | "disabled";
  discordMessageId: string | null;
  verdict: null;
};

export type Store = {
  all(): StoredReport[];
  add(r: Omit<StoredReport, "id">): StoredReport;
  update(
    id: string,
    patch: Partial<Pick<StoredReport, "delivery" | "discordMessageId">>,
  ): void;
};

function load(file: string): StoredReport[] {
  if (!existsSync(file)) return [];
  try {
    const data: unknown = JSON.parse(readFileSync(file, "utf8"));
    if (!Array.isArray(data)) throw new Error("not a JSON array");
    return data as StoredReport[];
  } catch (err) {
    throw new Error(`Cannot read feedback store ${file}: ${(err as Error).message}`);
  }
}

export function openStore(file: string): Store {
  const reports = load(file);
  let last = reports.reduce((max, r) => Math.max(max, Number(r.id.slice(3)) || 0), 0);

  const save = () => {
    const tmp = `${file}.tmp`;
    writeFileSync(tmp, JSON.stringify(reports, null, 2));
    renameSync(tmp, file);
  };

  return {
    all: () => reports,
    add(r) {
      last += 1;
      const stored: StoredReport = { ...r, id: `FB-${String(last).padStart(4, "0")}` };
      reports.push(stored);
      save();
      return stored;
    },
    update(id, patch) {
      const found = reports.find((r) => r.id === id);
      if (!found) return;
      Object.assign(found, patch);
      save();
    },
  };
}
