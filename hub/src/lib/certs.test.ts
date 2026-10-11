import { describe, expect, it } from "vitest";
import { certSwitchPath, navItems, resolveCert } from "./certs";

describe("resolveCert", () => {
  it("accepts an available cert", () => expect(resolveCert("ccdv", ["ccarf", "ccdv"])).toBe("ccdv"));
  it("rejects an unknown or unavailable cert", () => {
    expect(resolveCert("aws", ["ccarf"])).toBeNull();
    expect(resolveCert("ccdv", ["ccarf"])).toBeNull();
    expect(resolveCert(undefined, ["ccarf"])).toBeNull();
  });
});

describe("certSwitchPath", () => {
  it("keeps the page when the target cert has it", () => expect(certSwitchPath("ccdv", "/ccarf/practice")).toBe("/ccdv/practice"));
  it("drops lesson slugs", () => expect(certSwitchPath("ccao", "/ccarf/lessons/agentic-loop")).toBe("/ccao/lessons"));
  it("goes to Home for CCAR-F-only pages", () => expect(certSwitchPath("ccdv", "/ccarf/plan")).toBe("/ccdv"));
  it("keeps CCAR-F-only pages when switching to CCAR-F", () => expect(certSwitchPath("ccarf", "/ccarf/reference")).toBe("/ccarf/reference"));
});

describe("navItems", () => {
  it("hides Plan and Reference outside CCAR-F", () => {
    expect(navItems("ccdv").map((n) => n.label)).toEqual(["Home", "Lessons", "Practice", "Flashcards"]);
    expect(navItems("ccarf").map((n) => n.label)).toEqual(["Home", "Plan", "Lessons", "Practice", "Flashcards", "Reference"]);
  });
});
