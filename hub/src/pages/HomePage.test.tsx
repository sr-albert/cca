import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { questions, tracks } from "../content/ccarf";
import { routes } from "../router";
import { initialProgress, useProgress } from "../state/progress";

const renderAt = (path: string) => render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />);
const inDomain = (n: number) => questions.filter((q) => q.domain === n);

beforeEach(() => useProgress.setState(initialProgress()));

describe("Home", () => {
  it("shows one progress row per CCAR-F domain", () => {
    renderAt("/ccarf");
    expect(screen.getAllByTestId("domain-row")).toHaveLength(5);
  });

  it("names the weakest domain once it has 3 answers", () => {
    const s = useProgress.getState();
    inDomain(1).slice(0, 3).forEach((q) => s.answer(q.id, [9], false));
    inDomain(2).slice(0, 3).forEach((q) => s.answer(q.id, q.correct, true));
    renderAt("/ccarf");
    expect(screen.getByTestId("weakest")).toHaveTextContent("Domain 1");
  });

  it("hides the weakest domain with fewer than 3 answers", () => {
    inDomain(1).slice(0, 2).forEach((q) => useProgress.getState().answer(q.id, [9], false));
    renderAt("/ccarf");
    expect(screen.queryByTestId("weakest")).not.toBeInTheDocument();
  });

  it("offers Continue for the last page visited in this cert", () => {
    useProgress.setState({ lastVisit: { cert: "ccarf", path: "/ccarf/practice?domain=2" } });
    renderAt("/ccarf");
    expect(screen.getByRole("link", { name: /Continue/ })).toHaveAttribute("href", "/ccarf/practice?domain=2");
  });

  it("shows the current plan step", () => {
    const step = tracks.experienced.steps[0];
    useProgress.getState().setStepTasks("experienced", step.n, step.tasks.map((_, i) => i));
    renderAt("/ccarf");
    expect(screen.getByTestId("plan-step")).toHaveTextContent(`Day ${tracks.experienced.steps[1].n}`);
  });
});
