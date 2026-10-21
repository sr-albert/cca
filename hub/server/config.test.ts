// @vitest-environment node
import { mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfig } from "./config";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "fb-config-"));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe("loadConfig", () => {
  it("reuses a generated secret on the same dir and never prints it", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const a = loadConfig({ DATA_DIR: dir });
    const b = loadConfig({ DATA_DIR: dir });
    expect(a.ipSecret).toHaveLength(64);
    expect(b.ipSecret).toBe(a.ipSecret);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain(join(dir, "ip-hash.secret"));
    expect(String(warn.mock.calls[0][0])).not.toContain(a.ipSecret);
    expect(statSync(join(dir, "ip-hash.secret")).mode & 0o777).toBe(0o600);
  });

  it("regenerates a secret file that is empty", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    writeFileSync(join(dir, "ip-hash.secret"), "  \n");
    const c = loadConfig({ DATA_DIR: dir });
    expect(c.ipSecret).toHaveLength(64);
    expect(loadConfig({ DATA_DIR: dir }).ipSecret).toBe(c.ipSecret);
  });

  it("prefers IP_HASH_SECRET from the env", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(loadConfig({ DATA_DIR: dir, IP_HASH_SECRET: "from-env" }).ipSecret).toBe("from-env");
    expect(warn).not.toHaveBeenCalled();
  });

  it("defaults and nulls", () => {
    const c = loadConfig({ DATA_DIR: dir, IP_HASH_SECRET: "s" });
    expect(c.port).toBe(8787);
    expect(c.webhookUrl).toBeNull();
    expect(c.allowedOrigin).toBeNull();
    expect(loadConfig({ DATA_DIR: dir, IP_HASH_SECRET: "s", PORT: "9000" }).port).toBe(9000);
  });
});
