// @vitest-environment node
import { describe, expect, it } from "vitest";
import { hashIp } from "./iphash";

describe("hashIp", () => {
  it("is deterministic, secret-dependent and hides the IP", () => {
    const h = hashIp("secret", "203.0.113.7");
    expect(hashIp("secret", "203.0.113.7")).toBe(h);
    expect(hashIp("other", "203.0.113.7")).not.toBe(h);
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(h).not.toContain("203.0.113.7");
  });
});
