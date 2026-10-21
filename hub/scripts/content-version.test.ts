// @vitest-environment node
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contentVersion } from "./content-version";

const dir = mkdtempSync(join(tmpdir(), "hub-"));
const file = join(dir, "fingerprint.json");
writeFileSync(file, JSON.stringify({ mirror: "ab12cd34" }));

describe("contentVersion", () => {
  it("reads commit, dirty flag and mirror fingerprint", () => {
    expect(contentVersion({ GIT_COMMIT: "bcc6669", GIT_DIRTY: "1" }, "build", file))
      .toEqual({ commit: "bcc6669", dirty: true, mirror: "ab12cd34" });
  });

  it("falls back to unknown for a build without a commit", () => {
    expect(contentVersion({}, "build", file)).toEqual({ commit: "unknown", dirty: false, mirror: "ab12cd34" });
  });

  it("uses dev for the dev server", () => {
    expect(contentVersion({}, "serve", file).commit).toBe("dev");
  });

  it("treats empty and 0 as clean", () => {
    expect(contentVersion({ GIT_DIRTY: "" }, "build", file).dirty).toBe(false);
    expect(contentVersion({ GIT_DIRTY: "0" }, "build", file).dirty).toBe(false);
  });

  it("reports mirror none when the fingerprint file is missing", () => {
    expect(contentVersion({}, "build", join(dir, "missing.json")).mirror).toBe("none");
  });
});
