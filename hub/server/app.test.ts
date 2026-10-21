// @vitest-environment node
import { mkdtempSync, rmSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { samplePayload } from "../src/feedback/fixtures";
import { createApp } from "./app";
import { loadConfig } from "./config";
import type { postToDiscord } from "./discord";
import { openStore } from "./store";

const WEBHOOK = "https://discord.com/api/webhooks/123/secret-token";

let dir: string;
let server: Server;
let base: string;
let store: ReturnType<typeof openStore>;
let app: ReturnType<typeof createApp>;
let post: ReturnType<typeof vi.fn<typeof postToDiscord>>;

async function start(env: Record<string, string> = {}) {
  const config = loadConfig({ DATA_DIR: dir, IP_HASH_SECRET: "s", DISCORD_WEBHOOK_URL: WEBHOOK, ...env });
  store = openStore(join(dir, "reports.json"));
  post = vi.fn<typeof postToDiscord>().mockResolvedValue("m-1");
  app = createApp({ config, store, post });
  server = createServer(app.handle);
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

const send = (body: unknown, headers: Record<string, string> = {}, path = "/api/feedback") =>
  fetch(base + path, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

const settled = () =>
  vi.waitFor(() => expect(store.all().every((r) => r.delivery !== "undelivered")).toBe(true));

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "fb-app-"));
});
afterEach(async () => {
  await new Promise((r) => server.close(r));
  rmSync(dir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe("POST /api/feedback", () => {
  it("stores a valid report, hashes the IP and posts to Discord", async () => {
    await start();
    const res = await send(samplePayload(), { "x-client-ip": "203.0.113.9" });
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ id: "FB-0001" });
    expect(store.all()[0].ipHash).not.toBe("203.0.113.9");
    await settled();
    expect(post).toHaveBeenCalledTimes(1);
    expect(store.all()[0]).toMatchObject({ delivery: "delivered", discordMessageId: "m-1" });
  });

  it("rejects invalid, oversized and non-matching requests", async () => {
    await start();
    expect((await send({ nope: true })).status).toBe(400);
    expect((await send("not json")).status).toBe(400);
    expect((await send("x".repeat(70 * 1024))).status).toBe(413);
    expect((await fetch(base + "/api/feedback")).status).toBe(404);
    expect((await send(samplePayload(), {}, "/other")).status).toBe(404);
    expect(store.all()).toHaveLength(0);
  });

  it("answers a honeypot hit with a fake success and stores nothing", async () => {
    await start();
    const res = await send({ ...samplePayload(), hp: "bot" });
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ id: "FB-0000" });
    expect(store.all()).toHaveLength(0);
    expect(post).not.toHaveBeenCalled();
  });

  it("rate limits the sixth report from one IP but not another IP", async () => {
    await start({ DISCORD_WEBHOOK_URL: "" });
    for (let i = 0; i < 5; i++) {
      expect((await send(samplePayload(), { "x-client-ip": "198.51.100.1" })).status).toBe(201);
    }
    const limited = await send(samplePayload(), { "x-client-ip": "198.51.100.1" });
    expect(limited.status).toBe(429);
    expect(await limited.json()).toEqual({ error: "rate-limited" });
    expect((await send(samplePayload(), { "x-client-ip": "198.51.100.2" })).status).toBe(201);
  });

  it("keeps the report undelivered when Discord fails, then retries it", async () => {
    await start();
    post.mockRejectedValueOnce(new Error("Discord request failed (network error)"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await send(samplePayload())).status).toBe(201);
    await vi.waitFor(() => expect(console.error).toHaveBeenCalled());
    expect(store.all()[0].delivery).toBe("undelivered");

    await app.deliverPending();
    expect(post).toHaveBeenCalledTimes(2);
    expect(store.all()[0].delivery).toBe("delivered");
  });

  it("does not run two delivery passes at once", async () => {
    await start();
    post.mockRejectedValue(new Error("down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    await send(samplePayload());
    await send(samplePayload());
    await vi.waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    await vi.waitFor(() => expect(console.error).toHaveBeenCalledTimes(2));
    let release: (id: string) => void = () => {};
    post.mockReset();
    post.mockReturnValueOnce(new Promise((r) => (release = r)));
    post.mockResolvedValue("m-2");
    const first = app.deliverPending();
    await vi.waitFor(() => expect(post).toHaveBeenCalledTimes(1));
    await app.deliverPending();
    expect(post).toHaveBeenCalledTimes(1);
    release("m-1");
    await first;
    expect(post).toHaveBeenCalledTimes(2);
    expect(store.all().map((r) => r.delivery)).toEqual(["delivered", "delivered"]);
  });

  it("does not repost a report that was delivered while a retry pass was running", async () => {
    await start();
    post.mockRejectedValueOnce(new Error("down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    await send(samplePayload());
    await vi.waitFor(() => expect(console.error).toHaveBeenCalled());

    const calls: string[] = [];
    const releases: Record<string, (id: string) => void> = {};
    post.mockImplementation((_url, msg) => {
      calls.push(msg.attachment.name);
      return new Promise((r) => (releases[msg.attachment.name] = r));
    });
    // FB-0002 is submitted and its own post is still pending when the retry pass snapshots both reports.
    await send(samplePayload());
    await vi.waitFor(() => expect(calls).toEqual(["report-FB-0002.json"]));
    const pass = app.deliverPending();
    await vi.waitFor(() => expect(calls).toHaveLength(2));
    releases["report-FB-0002.json"]("m-2");
    await vi.waitFor(() => expect(store.all()[1].delivery).toBe("delivered"));
    releases["report-FB-0001.json"]("m-1");
    await pass;
    expect(calls.sort()).toEqual(["report-FB-0001.json", "report-FB-0002.json"]);
    expect(store.all().map((r) => r.delivery)).toEqual(["delivered", "delivered"]);
  });

  it("marks reports disabled and never posts without a webhook", async () => {
    await start({ DISCORD_WEBHOOK_URL: "" });
    expect((await send(samplePayload())).status).toBe(201);
    expect(store.all()[0].delivery).toBe("disabled");
    await app.deliverPending();
    expect(post).not.toHaveBeenCalled();
  });

  it("delivers reports stored as disabled once a webhook is set", async () => {
    await start({ DISCORD_WEBHOOK_URL: "" });
    await send(samplePayload());
    expect(store.all()[0].delivery).toBe("disabled");
    await new Promise((r) => server.close(r));
    await start();
    await app.deliverPending();
    expect(post).toHaveBeenCalledTimes(1);
    expect(store.all()[0].delivery).toBe("delivered");
  });

  it("rejects a mismatched Origin when allowedOrigin is set", async () => {
    await start({ ALLOWED_ORIGIN: "https://hub.example.com" });
    expect((await send(samplePayload(), { origin: "https://evil.example" })).status).toBe(403);
    expect((await send(samplePayload(), { origin: "https://hub.example.com" })).status).toBe(201);
  });

  it("never logs the client IP or the webhook URL", async () => {
    await start();
    const spies = (["log", "warn", "error"] as const).map((m) =>
      vi.spyOn(console, m).mockImplementation(() => {}),
    );
    post.mockRejectedValueOnce(new Error("Discord rejected the report: HTTP 500"));
    await send(samplePayload(), { "x-client-ip": "203.0.113.77" });
    await vi.waitFor(() => expect(console.error).toHaveBeenCalled());
    const logged = spies.flatMap((s) => s.mock.calls).flat().join(" ");
    expect(logged).not.toContain("203.0.113.77");
    expect(logged).not.toContain(WEBHOOK);
  });
});
