// @vitest-environment node
import { describe, expect, it } from "vitest";
import { samplePayload } from "../src/feedback/fixtures";
import { formatDiscordMessage, postToDiscord } from "./discord";
import type { StoredReport } from "./store";

function report(mutate?: (r: StoredReport) => void): StoredReport {
  const r: StoredReport = {
    id: "FB-0042",
    receivedAt: "2026-10-21T09:31:00.000Z",
    ipHash: "abc123",
    payload: samplePayload(),
    delivery: "undelivered",
    discordMessageId: null,
    verdict: null,
  };
  mutate?.(r);
  return r;
}

const HISTORY = "1st report from this reporter";

function fields(r: StoredReport) {
  const { payload } = formatDiscordMessage(r, HISTORY);
  return Object.fromEntries(payload.embeds[0].fields.map((f) => [f.name, f.value]));
}

describe("formatDiscordMessage", () => {
  it("builds the title and fields for a wrong answer", () => {
    const { payload } = formatDiscordMessage(report(), HISTORY);
    const embed = payload.embeds[0];
    expect(embed.title).toBe("⚑ Wrong answer · Q34 · FB-0042");
    expect(embed.color).toBe(0xe07a52);
    expect(embed.description).toBe("Option C is marked wrong, but the explanation supports it.");
    const f = fields(report());
    expect(f.Reporter).toBe(`r-3b24 · ${HISTORY}`);
    expect(f.Picked).toBe("C · marked wrong");
    expect(f["Content version"]).toBe("bcc6669 · mirror 3fa1c2d0");
    expect(f.Progress).toBe("12 / 52 · 75%");
    expect(f.Device).toBe("Chrome 130 · macOS · 1280×720");
    expect(f.Page).toBe("http://localhost:5173/ccarf/practice?domain=1");
    expect(f.File).toBe("hub/src/content/ccarf/questions.ts");
    expect(f.Contact).toBe("learner@example.com");
    expect(embed.fields.every((x) => x.inline)).toBe(true);
  });

  it("points official and mirror questions away from the editable file", () => {
    for (const source of ["official", "mirror"] as const) {
      const f = fields(
        report((r) => {
          r.payload.context!.question!.source = source;
        }),
      );
      expect(f.File).toBe("mirror (generated, not editable here)");
    }
  });

  it("formats multiple right answers, unanswered and zero progress", () => {
    const right = fields(
      report((r) => {
        r.payload.context!.question!.answer = { selected: [0, 2], correct: true, at: "x" };
      }),
    );
    expect(right.Picked).toBe("A, C · marked right");
    const none = fields(
      report((r) => {
        r.payload.context!.question!.answer = null;
        r.payload.meta.study.cert = { answered: 0, correct: 0, total: 52 };
      }),
    );
    expect(none.Picked).toBe("not answered");
    expect(none.Progress).toBe("0 / 52");
  });

  it("handles a report without context or contact", () => {
    const r = report((x) => {
      x.payload.context = null;
      delete x.payload.contact;
    });
    const { payload } = formatDiscordMessage(r, HISTORY);
    expect(payload.embeds[0].title).toBe("⚑ Wrong answer · no context · FB-0042");
    const f = fields(r);
    expect(f.Picked).toBe("—");
    expect(f.Page).toBe("—");
    expect(f.File).toBe("—");
    expect(f.Contact).toBe("none");
  });

  it("uses the route when there is no question", () => {
    const r = report((x) => {
      x.payload.context!.question = null;
    });
    expect(formatDiscordMessage(r, HISTORY).payload.embeds[0].title).toBe(
      "⚑ Wrong answer · /ccarf/practice · FB-0042",
    );
  });

  it("attaches the full report without the IP hash", () => {
    const { attachment, payload } = formatDiscordMessage(report(), HISTORY);
    expect(attachment.name).toBe("report-FB-0042.json");
    expect(payload.attachments).toEqual([{ id: 0, filename: "report-FB-0042.json" }]);
    const parsed = JSON.parse(attachment.json);
    expect(parsed).not.toHaveProperty("ipHash");
    expect(parsed.id).toBe("FB-0042");
    expect(parsed.payload.text).toContain("Option C");
  });

  it("blocks mentions and respects Discord limits", () => {
    const r = report((x) => {
      x.payload.text = "@everyone <script>alert(1)</script>".padEnd(4000, "x");
      x.payload.contact = "c".repeat(200);
      x.payload.context!.url = "http://localhost/" + "u".repeat(3000);
    });
    const { payload } = formatDiscordMessage(r, HISTORY);
    const embed = payload.embeds[0];
    expect(payload.allowed_mentions).toEqual({ parse: [] });
    expect(embed.description.length).toBeLessThanOrEqual(4096);
    expect(embed.title.length).toBeLessThanOrEqual(256);
    for (const f of embed.fields) {
      expect(f.name.length).toBeLessThanOrEqual(256);
      expect(f.value.length).toBeLessThanOrEqual(1024);
    }
    const total =
      embed.title.length +
      embed.description.length +
      embed.fields.reduce((n, f) => n + f.name.length + f.value.length, 0);
    expect(total).toBeLessThanOrEqual(6000);
  });
});

describe("postToDiscord", () => {
  const msg = () => formatDiscordMessage(report(), HISTORY);
  const URL_ = "https://discord.com/api/webhooks/1/secret-token";

  it("posts multipart to ?wait=true and resolves the message id", async () => {
    let seenUrl = "";
    let seenBody: unknown;
    const fake = (async (url: string, init: RequestInit) => {
      seenUrl = url;
      seenBody = init.body;
      return new Response(JSON.stringify({ id: "998877" }), { status: 200 });
    }) as unknown as typeof fetch;
    await expect(postToDiscord(URL_, msg(), fake)).resolves.toBe("998877");
    expect(seenUrl).toBe(`${URL_}?wait=true`);
    expect(seenBody).toBeInstanceOf(FormData);
    const form = seenBody as FormData;
    expect(JSON.parse(form.get("payload_json") as string).embeds).toHaveLength(1);
    expect(form.get("files[0]")).toBeInstanceOf(Blob);
  });

  it("rejects on a non-2xx response without leaking the webhook URL", async () => {
    const fake = (async () => new Response("nope", { status: 500 })) as unknown as typeof fetch;
    const err = await postToDiscord(URL_, msg(), fake).catch((e: Error) => e);
    expect(err).toBeInstanceOf(Error);
    expect((err as Error).message).toContain("500");
    expect((err as Error).message).not.toContain("secret-token");
  });

  it("does not leak the webhook URL when fetch itself fails", async () => {
    const fake = (async (url: string) => {
      throw new Error(`connect failed for ${url}`);
    }) as unknown as typeof fetch;
    const err = await postToDiscord(URL_, msg(), fake).catch((e: Error) => e);
    expect((err as Error).message).not.toContain("secret-token");
  });
});
