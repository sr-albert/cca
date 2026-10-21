// @vitest-environment node
import { describe, expect, it } from "vitest";
import { samplePayload } from "../src/feedback/fixtures";
import { historyLine, reporterHistory } from "./history";
import type { StoredReport } from "./store";

const A = "3b241101-e2bb-4255-8caf-4136c566a962";
const B = "9c0f7a1e-1111-4222-8333-444455556666";

let n = 0;
const report = (reporterId: string, ipHash = "ip1"): StoredReport => ({
  id: `FB-${String(++n).padStart(4, "0")}`,
  receivedAt: "2026-10-21T10:00:00.000Z",
  ipHash,
  payload: { ...samplePayload(), reporterId },
  delivery: "delivered",
  discordMessageId: null,
  verdict: null,
});

describe("reporterHistory", () => {
  it("counts the reporter's reports and other reporters on the same network", () => {
    const all = [report(A), report(B), report(A)];
    const h = reporterHistory(all, all[2]);
    expect(h).toEqual({ reportNumber: 2, otherReportersOnNetwork: 1 });
    const third = report(A);
    all.push(third);
    expect(historyLine(reporterHistory(all, third))).toBe(
      "3rd report from this reporter · same network as 1 other reporter",
    );
  });

  it("describes a first report", () => {
    const only = report(A, "solo");
    expect(historyLine(reporterHistory([only], only))).toBe("First report from this reporter");
  });

  it("does not count reporters on other networks", () => {
    const all = [report(B, "other"), report(A)];
    expect(reporterHistory(all, all[1]).otherReportersOnNetwork).toBe(0);
  });
});

describe("historyLine", () => {
  it("uses correct ordinals and plurals", () => {
    const line = (reportNumber: number, otherReportersOnNetwork = 0) =>
      historyLine({ reportNumber, otherReportersOnNetwork });
    expect(line(2)).toBe("2nd report from this reporter");
    expect(line(4)).toBe("4th report from this reporter");
    expect(line(11)).toBe("11th report from this reporter");
    expect(line(12)).toBe("12th report from this reporter");
    expect(line(13)).toBe("13th report from this reporter");
    expect(line(21)).toBe("21st report from this reporter");
    expect(line(22)).toBe("22nd report from this reporter");
    expect(line(2, 2)).toBe("2nd report from this reporter · same network as 2 other reporters");
  });
});
