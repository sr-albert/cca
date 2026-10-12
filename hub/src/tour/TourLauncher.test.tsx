import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { routes } from "../router";
import { initialProgress, useProgress } from "../state/progress";

const popover = () => document.querySelector(".driver-popover");
const renderAt = (path: string) => {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return { router, ...render(<RouterProvider router={router} />) };
};

beforeAll(() => {
  // jsdom has no layout; driver.js may scroll the highlighted element into view.
  Element.prototype.scrollIntoView ??= () => {};
});
beforeEach(() => useProgress.setState(initialProgress()));

describe("guided tour", () => {
  it("opens on a first visit to CCAR-F", async () => {
    renderAt("/ccarf");
    expect(await screen.findByText("Welcome to your study hub", {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it("closing it marks it seen, and it does not come back", async () => {
    const first = renderAt("/ccarf");
    await screen.findByText("Welcome to your study hub", {}, { timeout: 3000 });
    await userEvent.click(document.querySelector<HTMLButtonElement>(".driver-popover-close-btn")!);
    await waitFor(() => expect(popover()).toBeNull());
    expect(useProgress.getState().tourSeen).toBe(true);
    first.unmount();
    renderAt("/ccarf");
    await act(() => new Promise((r) => setTimeout(r, 100)));
    expect(popover()).toBeNull();
  });

  it("Take the tour replays it", async () => {
    useProgress.setState({ tourSeen: true });
    renderAt("/ccarf");
    await userEvent.click(screen.getAllByRole("button", { name: "Take the tour" })[0]);
    expect(await screen.findByText("Welcome to your study hub", {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it("does not auto-start on another cert", async () => {
    renderAt("/ccao");
    await act(() => new Promise((r) => setTimeout(r, 100)));
    expect(popover()).toBeNull();
  });

  it("does not auto-start on a deep link, so the page stays put", async () => {
    const { router } = renderAt("/ccarf/reference");
    await act(() => new Promise((r) => setTimeout(r, 100)));
    expect(popover()).toBeNull();
    expect(router.state.location.pathname).toBe("/ccarf/reference");
  });

  it("Next moves to the Plan page", async () => {
    const { router } = renderAt("/ccarf");
    await screen.findByText("Welcome to your study hub", {}, { timeout: 3000 });
    await userEvent.click(document.querySelector<HTMLButtonElement>(".driver-popover-next-btn")!);
    expect(await screen.findByText("Pick your track", {}, { timeout: 3000 })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/ccarf/plan");
  });

  it("navigating away closes the tour", async () => {
    const { router } = renderAt("/ccarf");
    await screen.findByText("Welcome to your study hub", {}, { timeout: 3000 });
    await act(() => router.navigate("/ccarf/lessons"));
    await waitFor(() => expect(popover()).toBeNull());
    expect(useProgress.getState().tourSeen).toBe(true);
  });

  it("unmounting does not mark the tour as seen", async () => {
    const view = renderAt("/ccarf");
    await screen.findByText("Welcome to your study hub", {}, { timeout: 3000 });
    view.unmount();
    expect(popover()).toBeNull();
    expect(useProgress.getState().tourSeen).toBe(false);
  });
});
