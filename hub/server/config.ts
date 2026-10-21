import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type Config = {
  port: number;
  dataDir: string;
  webhookUrl: string | null;
  ipSecret: string;
  allowedOrigin: string | null;
};

export function loadConfig(env: Record<string, string | undefined>): Config {
  const dataDir = env.DATA_DIR || "/data";
  return {
    port: env.PORT ? Number(env.PORT) : 8787,
    dataDir,
    webhookUrl: env.DISCORD_WEBHOOK_URL || null,
    ipSecret: env.IP_HASH_SECRET || fileSecret(dataDir),
    allowedOrigin: env.ALLOWED_ORIGIN || null,
  };
}

function fileSecret(dataDir: string): string {
  const path = join(dataDir, "ip-hash.secret");
  if (existsSync(path)) return readFileSync(path, "utf8").trim();
  mkdirSync(dataDir, { recursive: true });
  const secret = randomBytes(32).toString("hex");
  writeFileSync(path, secret, { mode: 0o600 });
  console.warn(`IP_HASH_SECRET not set; using the generated secret in ${path}`);
  return secret;
}
