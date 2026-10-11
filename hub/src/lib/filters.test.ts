import { describe, expect, it } from "vitest";
import { filterToSearch, parseFilter } from "./filters";

describe("parseFilter", () => {
  it("reads every filter", () => {
    expect(parseFilter(new URLSearchParams("domain=2&task=2.1,2.3&scenario=4&source=official&ids=a,b&status=wrong"))).toEqual({
      domain: 2, tasks: ["2.1", "2.3"], scenario: 4, source: "official", ids: ["a", "b"], status: "wrong",
    });
  });
  it("ignores garbage instead of failing", () => {
    expect(parseFilter(new URLSearchParams("domain=abc&scenario=-1&source=web&status=bogus&task=x;y,,"))).toEqual({});
  });
});

describe("filterToSearch", () => {
  it("round-trips through parseFilter", () => {
    const f = { domain: 3, tasks: ["3.1", "3.2"], status: "diagnostic" as const };
    expect(parseFilter(new URLSearchParams(filterToSearch(f)))).toEqual(f);
  });
  it("gives an empty string for no filters", () => expect(filterToSearch({})).toBe(""));
});
