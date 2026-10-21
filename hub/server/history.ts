import type { StoredReport } from "./store";

export type ReporterHistory = { reportNumber: number; otherReportersOnNetwork: number };

export function reporterHistory(all: StoredReport[], current: StoredReport): ReporterHistory {
  const reporter = current.payload.reporterId;
  const index = all.findIndex((r) => r.id === current.id);
  const upTo = index === -1 ? all : all.slice(0, index + 1);
  const mine = upTo.filter((r) => r.payload.reporterId === reporter).length;
  const others = new Set(
    all
      .filter((r) => r.ipHash === current.ipHash && r.payload.reporterId !== reporter)
      .map((r) => r.payload.reporterId),
  );
  return {
    reportNumber: index === -1 ? mine + 1 : mine,
    otherReportersOnNetwork: others.size,
  };
}

function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  const suffix = { 1: "st", 2: "nd", 3: "rd" }[n % 10] ?? "th";
  return `${n}${suffix}`;
}

export function historyLine(h: ReporterHistory): string {
  const first =
    h.reportNumber <= 1
      ? "First report from this reporter"
      : `${ordinal(h.reportNumber)} report from this reporter`;
  const n = h.otherReportersOnNetwork;
  if (n <= 0) return first;
  return `${first} · same network as ${n} other reporter${n > 1 ? "s" : ""}`;
}
