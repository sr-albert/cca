import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { tracks } from "../../content/ccarf";
import { catalog } from "../../data";
import { filterToSearch } from "../../lib/filters";
import { routes } from "../../router";
import { initialProgress, useProgress } from "../../state/progress";

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}
const pane = () => within(screen.getByRole("complementary", { name: "Today's plan" }));

beforeEach(() => useProgress.setState(initialProgress()));

describe("Today's plan pane", () => {
  it("shows step 1 of the experienced track and ticks a task", async () => {
    renderAt("/ccarf");
    const step = tracks.experienced.steps[0];
    expect(pane().getByText(`0 of ${step.tasks.length} tasks`, { exact: false })).toBeInTheDocument();
    await userEvent.click(pane().getByRole("checkbox", { name: "Mark task 1 done" }));
    expect(pane().getByText(`1 of ${step.tasks.length} tasks`, { exact: false })).toBeInTheDocument();
    expect(useProgress.getState().plan.doneTasks.experienced[step.n]).toEqual([0]);
  });

  it("opens Practice with the task's filter", async () => {
    const step = tracks.experienced.steps.find((s) => s.tasks.some((t) => t.actions.some((a) => a.go === "practice")))!;
    const action = step.tasks.flatMap((t) => t.actions).find((a) => a.go === "practice")!;
    useProgress.setState({ activeStep: step.n });
    const router = renderAt("/ccarf");
    await userEvent.click(pane().getAllByRole("button", { name: action.label })[0]);
    expect(router.state.location.pathname).toBe("/ccarf/practice");
    if (action.go === "practice") expect(router.state.location.search.replace(/^\?/, "")).toBe(filterToSearch(action.filter));
  });

  it("switches track from a track action and ticks that task", async () => {
    const step = tracks.beginner.steps.find((s) => s.tasks.some((t) => t.actions.some((a) => a.go === "track")))!;
    const idx = step.tasks.findIndex((t) => t.actions.some((a) => a.go === "track"));
    const action = step.tasks[idx].actions.find((a) => a.go === "track")!;
    useProgress.setState({ plan: { ...initialProgress().plan, track: "beginner" }, activeStep: step.n });
    renderAt("/ccarf");
    await userEvent.click(pane().getByRole("button", { name: action.label }));
    expect(useProgress.getState().plan.track).toBe("expert");
    expect(useProgress.getState().plan.doneTasks.beginner[step.n]).toContain(idx);
  });

  it("marks all tasks done and clears them", async () => {
    renderAt("/ccarf");
    const step = tracks.experienced.steps[0];
    await userEvent.click(pane().getByRole("button", { name: "Mark all done" }));
    expect(useProgress.getState().plan.doneTasks.experienced[step.n]).toHaveLength(step.tasks.length);
    await userEvent.click(pane().getByRole("button", { name: "Clear" }));
    expect(useProgress.getState().plan.doneTasks.experienced[step.n]).toEqual([]);
  });

  it.skipIf(!catalog.mirrorAvailable)("is not shown for other certs", () => {
    renderAt("/ccdv");
    expect(screen.queryByRole("complementary", { name: "Today's plan" })).not.toBeInTheDocument();
  });
});

describe("Plan page", () => {
  it("switches track with the track buttons", async () => {
    renderAt("/ccarf/plan");
    await userEvent.click(screen.getByRole("button", { name: /^Expert/ }));
    expect(screen.getByRole("heading", { name: "Expert track" })).toBeInTheDocument();
  });
});
