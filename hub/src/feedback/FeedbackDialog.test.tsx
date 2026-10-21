import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { routes } from "../router";
import { initialProgress, useProgress } from "../state/progress";
import { FeedbackPayload } from "./payload";

function renderAt(path: string) {
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />);
}
const reply = (status: number, body: unknown = { id: "r1" }) => new Response(JSON.stringify(body), { status });
const openTopBar = () => userEvent.click(screen.getByRole("button", { name: "Feedback" }));
const dialog = () => screen.getByRole("dialog", { name: "Report a problem" });
const send = () => within(dialog()).getByRole("button", { name: /^Send|Sending/ });
const box = () => within(dialog()).getByRole("textbox", { name: "What should change?" });
async function fill(text = "Option C looks right") {
  await userEvent.click(within(dialog()).getByRole("radio", { name: "Wrong answer" }));
  await userEvent.type(box(), text);
}
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  useProgress.setState(initialProgress());
  fetchMock = vi.fn().mockResolvedValue(reply(201));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe("Feedback dialog", () => {
  it("opens from the top bar with the page as context", async () => {
    renderAt("/ccarf/plan");
    await openTopBar();
    expect(dialog()).toHaveAttribute("aria-modal", "true");
    expect(within(dialog()).getByText("About: CCAR-F · /ccarf/plan")).toBeInTheDocument();
  });

  it("reports a question and lets the learner remove the context", async () => {
    renderAt("/ccarf/practice?ids=Q01");
    await userEvent.click(within(screen.getByTestId("q-Q01")).getByRole("button", { name: "⚑ Report" }));
    expect(within(dialog()).getByText(/^About: Q01 · Domain \d/)).toBeInTheDocument();
    await userEvent.click(within(dialog()).getByRole("button", { name: "Remove" }));
    expect(within(dialog()).getByText("No page attached")).toBeInTheDocument();
    await fill();
    await userEvent.click(send());
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).context).toBeNull();
  });

  it("enables Send only with a type and text, and posts a valid payload", async () => {
    renderAt("/ccarf/plan");
    await openTopBar();
    expect(send()).toBeDisabled();
    await userEvent.click(within(dialog()).getByRole("radio", { name: "Wrong answer" }));
    expect(send()).toBeDisabled();
    await userEvent.type(box(), "  hi  ");
    expect(send()).toBeEnabled();
    await userEvent.click(send());
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const body = FeedbackPayload.parse(JSON.parse(fetchMock.mock.calls[0][1].body));
    expect(body).toMatchObject({ type: "wrong-answer", text: "hi" });
    expect(body.reporterId).toBeTruthy();
  });

  it("shows the payload as literal text", async () => {
    renderAt("/ccarf/plan");
    await openTopBar();
    await fill("<b>x</b>");
    await userEvent.click(within(dialog()).getByRole("button", { name: "See exactly what" }));
    const pre = dialog().querySelector("pre")!;
    expect(pre.textContent).toContain("reporterId");
    expect(pre.textContent).toContain("<b>x</b>");
    expect(pre.querySelector("b")).toBeNull();
  });

  it("sends once on a double click", async () => {
    renderAt("/ccarf/plan");
    await openTopBar();
    await fill();
    await userEvent.dblClick(send());
    await screen.findByText("Thanks, it's on its way.");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("keeps the text on failure and the draft across close and reopen", async () => {
    fetchMock.mockRejectedValue(new Error("down"));
    renderAt("/ccarf/plan");
    await openTopBar();
    await fill("keep me");
    await userEvent.click(send());
    expect(await screen.findByText("Couldn't send your report. Your text is still here, so you can try again.")).toBeInTheDocument();
    expect(box()).toHaveValue("keep me");
    await userEvent.click(within(dialog()).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    await openTopBar();
    expect(box()).toHaveValue("keep me");
    expect(within(dialog()).getByRole("radio", { name: "Wrong answer" })).toBeChecked();
  });

  it("explains a rate limit", async () => {
    fetchMock.mockResolvedValue(reply(429, { error: "rate-limited" }));
    renderAt("/ccarf/plan");
    await openTopBar();
    await fill();
    await userEvent.click(send());
    expect(await screen.findByText("Too many reports from your network right now. Please try again later.")).toBeInTheDocument();
  });

  it("thanks the learner and clears the draft after a send", async () => {
    renderAt("/ccarf/plan");
    await openTopBar();
    await fill();
    await userEvent.click(send());
    expect(await screen.findByText("Thanks, it's on its way.")).toBeInTheDocument();
    expect(screen.getByText(/We check every report/)).toBeInTheDocument();
    await userEvent.click(within(dialog()).getByRole("button", { name: "Back" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    await openTopBar();
    expect(box()).toHaveValue("");
    expect(within(dialog()).getByRole("radio", { name: "Wrong answer" })).not.toBeChecked();
  });

  it("closes on Escape", async () => {
    renderAt("/ccarf/plan");
    await openTopBar();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
