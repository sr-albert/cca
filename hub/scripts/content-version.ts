import { readFileSync } from "node:fs";
import type { ContentVersion } from "../src/feedback/payload";

function readMirror(fingerprintFile: string): string {
  try {
    const { mirror } = JSON.parse(readFileSync(fingerprintFile, "utf8")) as { mirror?: unknown };
    return typeof mirror === "string" ? mirror : "none";
  } catch {
    return "none";
  }
}

/** Version stamped into the bundle: git commit and dirty flag come from the build env, the mirror from the extractor. */
export function contentVersion(
  env: Record<string, string | undefined>,
  command: "serve" | "build",
  fingerprintFile: string,
): ContentVersion {
  return {
    commit: env.GIT_COMMIT || (command === "serve" ? "dev" : "unknown"),
    dirty: !!env.GIT_DIRTY && env.GIT_DIRTY !== "0",
    mirror: readMirror(fingerprintFile),
  };
}
