import type { StoredReport } from "./store";

const TEN_MINUTES = 10 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;

export function isRateLimited(all: StoredReport[], ipHash: string, now: Date): boolean {
  const ages = all
    .filter((r) => r.ipHash === ipHash)
    .map((r) => now.getTime() - new Date(r.receivedAt).getTime());
  const within = (ms: number) => ages.filter((age) => age <= ms).length;
  return within(TEN_MINUTES) >= 5 || within(ONE_DAY) >= 30;
}
