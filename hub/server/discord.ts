import { TYPE_LABEL, formatVersion } from "../src/feedback/payload";
import type { StoredReport } from "./store";

type Field = { name: string; value: string; inline: true };

export type DiscordPayload = {
  embeds: {
    title: string;
    description: string;
    color: number;
    fields: Field[];
  }[];
  allowed_mentions: { parse: never[] };
  attachments: { id: number; filename: string }[];
};

const COLOR = 0xe07a52;
const LIMITS = { title: 256, description: 4096, name: 256, value: 1024, total: 6000 };
const MIRROR_FILE = "mirror (generated, not editable here)";
const OWN_FILE = "hub/src/content/ccarf/questions.ts";

function clip(s: string, max: number): string {
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}

function letters(selected: number[]): string {
  return selected.map((i) => String.fromCharCode(65 + i)).join(", ");
}

export function formatDiscordMessage(
  r: StoredReport,
  history: string,
): { payload: DiscordPayload; attachment: { name: string; json: string } } {
  const { payload: p } = r;
  const ctx = p.context;
  const q = ctx?.question ?? null;

  const target = q?.id ?? ctx?.route ?? "no context";
  const title = clip(`⚑ ${TYPE_LABEL[p.type]} · ${target} · ${r.id}`, LIMITS.title);

  const picked = !q
    ? "—"
    : q.answer
      ? `${letters(q.answer.selected)} · marked ${q.answer.correct ? "right" : "wrong"}`
      : "not answered";

  const { answered, correct, total } = p.meta.study.cert;
  const progress =
    answered > 0
      ? `${answered} / ${total} · ${Math.round((correct / answered) * 100)}%`
      : `0 / ${total}`;

  const d = p.meta.device;
  const file = !q ? "—" : q.source === "mine" ? OWN_FILE : MIRROR_FILE;

  const raw: [string, string][] = [
    ["Reporter", `r-${p.reporterId.slice(0, 4)} · ${history}`],
    ["Picked", picked],
    ["Content version", formatVersion(p.meta.contentVersion)],
    ["Progress", progress],
    ["Device", `${d.browser} ${d.browserVersion} · ${d.os} · ${d.viewport.w}×${d.viewport.h}`],
    ["Page", ctx?.url ? clip(ctx.url, 300) : "—"],
    ["File", file],
    ["Contact", p.contact || "none"],
  ];
  const fields: Field[] = raw.map(([name, value]) => ({
    name: clip(name, LIMITS.name),
    value: clip(value, LIMITS.value),
    inline: true,
  }));

  // Keep the whole embed under Discord's total text limit by trimming the description.
  const fixed = title.length + fields.reduce((n, f) => n + f.name.length + f.value.length, 0);
  const description = clip(p.text, Math.min(LIMITS.description, Math.max(0, LIMITS.total - fixed)));

  const name = `report-${r.id}.json`;
  const withoutHash: Partial<StoredReport> = { ...r };
  delete withoutHash.ipHash;

  return {
    payload: {
      embeds: [{ title, description, color: COLOR, fields }],
      allowed_mentions: { parse: [] },
      attachments: [{ id: 0, filename: name }],
    },
    attachment: { name, json: JSON.stringify(withoutHash, null, 2) },
  };
}

export async function postToDiscord(
  webhookUrl: string,
  msg: ReturnType<typeof formatDiscordMessage>,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const form = new FormData();
  form.set("payload_json", JSON.stringify(msg.payload));
  form.set("files[0]", new Blob([msg.attachment.json], { type: "application/json" }), msg.attachment.name);

  // The webhook URL is a secret and the service logs errors: never put it (or a raw fetch error) in a message.
  let res: Response;
  try {
    res = await fetchImpl(`${webhookUrl}?wait=true`, { method: "POST", body: form });
  } catch {
    throw new Error("Discord request failed (network error)");
  }
  if (!res.ok) throw new Error(`Discord rejected the report: HTTP ${res.status}`);
  const body = (await res.json()) as { id?: string };
  if (!body.id) throw new Error("Discord response had no message id");
  return body.id;
}
