import type { IncomingMessage, ServerResponse } from "node:http";
import { FeedbackPayload } from "../src/feedback/payload";
import type { Config } from "./config";
import { formatDiscordMessage, postToDiscord } from "./discord";
import { historyLine, reporterHistory } from "./history";
import { hashIp } from "./iphash";
import { isRateLimited } from "./ratelimit";
import type { Store, StoredReport } from "./store";

const MAX_BODY = 65_536;

type Deps = {
  config: Config;
  store: Store;
  post?: typeof postToDiscord;
  now?: () => Date;
};

function send(res: ServerResponse, status: number, body?: unknown): void {
  res.writeHead(status, body === undefined ? {} : { "content-type": "application/json" });
  res.end(body === undefined ? undefined : JSON.stringify(body));
}

// Resolves to the raw body, or null once it exceeds the cap (reading stops there).
function readBody(req: IncomingMessage): Promise<string | null> {
  return new Promise((resolve) => {
    const declared = Number(req.headers["content-length"]);
    if (declared > MAX_BODY) return resolve(null);
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        chunks.length = 0;
        req.removeAllListeners("data");
        req.resume();
        resolve(null);
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", () => resolve(null));
  });
}

function clientIp(req: IncomingMessage): string {
  const header = req.headers["x-client-ip"];
  const forwarded = Array.isArray(header) ? header[0] : header;
  return forwarded?.trim() || req.socket.remoteAddress || "unknown";
}

export function createApp({ config, store, post = postToDiscord, now = () => new Date() }: Deps) {
  const inFlight = new Set<string>();
  let passRunning = false;

  // Never log the webhook URL or the IP: the error from postToDiscord is already scrubbed.
  async function deliver(report: StoredReport): Promise<boolean> {
    if (!config.webhookUrl || inFlight.has(report.id)) return false;
    // A retry pass works from a snapshot: re-read the status so a report delivered meanwhile is not posted twice.
    const current = store.all().find((r) => r.id === report.id)?.delivery;
    if (current !== "undelivered" && current !== "disabled") return true;
    inFlight.add(report.id);
    try {
      const history = historyLine(reporterHistory(store.all(), report));
      const messageId = await post(
        config.webhookUrl,
        formatDiscordMessage(report, history),
        (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(10_000) }),
      );
      store.update(report.id, { delivery: "delivered", discordMessageId: messageId });
      return true;
    } catch (err) {
      console.error(`feedback: delivery of ${report.id} failed: ${(err as Error).message}`);
      return false;
    } finally {
      inFlight.delete(report.id);
    }
  }

  async function deliverPending(): Promise<void> {
    if (passRunning) return;
    passRunning = true;
    try {
      const pending = store.all().filter((r) => r.delivery === "undelivered" || (config.webhookUrl && r.delivery === "disabled"));
      for (const report of pending) {
        if (inFlight.has(report.id)) continue;
        if (!(await deliver(report))) break;
      }
    } finally {
      passRunning = false;
    }
  }

  async function submit(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (config.allowedOrigin && req.headers.origin !== config.allowedOrigin) {
      return send(res, 403, { error: "forbidden" });
    }
    const raw = await readBody(req);
    if (raw === null) {
      res.setHeader("connection", "close");
      return send(res, 413, { error: "too-large" });
    }
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      return send(res, 400, { error: "invalid" });
    }
    const parsed = FeedbackPayload.safeParse(json);
    if (!parsed.success) return send(res, 400, { error: "invalid" });
    const payload = parsed.data;
    if (payload.hp) return send(res, 201, { id: "FB-0000" });

    const ipHash = hashIp(config.ipSecret, clientIp(req));
    const received = now();
    if (isRateLimited(store.all(), ipHash, received)) {
      return send(res, 429, { error: "rate-limited" });
    }

    let stored: StoredReport;
    try {
      stored = store.add({
        receivedAt: received.toISOString(),
        ipHash,
        payload,
        delivery: config.webhookUrl ? "undelivered" : "disabled",
        discordMessageId: null,
        verdict: null,
      });
    } catch (err) {
      console.error(`feedback: store failed: ${(err as Error).message}`);
      return send(res, 500, { error: "store-failed" });
    }
    send(res, 201, { id: stored.id });
    void deliver(stored);
  }

  function handle(req: IncomingMessage, res: ServerResponse): void {
    const path = (req.url ?? "").split("?")[0];
    if (req.method !== "POST" || path !== "/api/feedback") return send(res, 404);
    submit(req, res).catch((err: Error) => {
      console.error(`feedback: unexpected error: ${err.message}`);
      if (!res.headersSent) send(res, 500, { error: "store-failed" });
    });
  }

  return { handle, deliverPending };
}
