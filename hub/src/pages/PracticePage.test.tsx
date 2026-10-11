import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { questions } from "../content/ccarf";
import { routes } from "../router";
import { initialProgress, useProgress } from "../state/progress";

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}
const card = (id: string) => screen.getByTestId(`q-${id}`);

beforeEach(() => useProgress.setState(initialProgress()));

describe("Practice", () => {
  it("submits a single-answer question on click and shows explanations", async () => {
    renderAt("/ccarf/practice?ids=Q01");
    await userEvent.click(within(card("Q01")).getByRole("button", { name: /Continue the loop while/ }));
    expect(within(card("Q01")).getByText("Correct")).toBeInTheDocument();
    expect(within(card("Q01")).getByText(/only reliable termination signal/)).toBeInTheDocument();
    expect(useProgress.getState().answers.Q01.correct).toBe(true);
  });

  it("requires exactly N picks on a multi-answer question", async () => {
    const multi = questions.find((q) => q.kind === "multi")!;
    renderAt(`/ccarf/practice?ids=${multi.id}`);
    const c = within(card(multi.id));
    expect(c.getByText(`Select ${multi.correct.length}.`)).toBeInTheDocument();
    const check = c.getByRole("button", { name: "Check answer" });
    expect(check).toBeDisabled();
    const options = c.getAllByRole("button", { pressed: false });
    for (const i of multi.correct) await userEvent.click(options[i]);
    expect(check).toBeEnabled();
    await userEvent.click(check);
    expect(c.getByText("Correct")).toBeInTheDocument();
  });

  it("keeps an answered card visible under Unanswered only until the filter changes", async () => {
    renderAt("/ccarf/practice?ids=Q01,Q02&status=unanswered");
    await userEvent.click(within(card("Q01")).getByRole("button", { name: /Continue the loop while/ }));
    expect(within(card("Q01")).getByText("Correct")).toBeInTheDocument();
    expect(within(card("Q01")).getByText(/only reliable termination signal/)).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Source" }), "mine");
    expect(screen.queryByTestId("q-Q01")).not.toBeInTheDocument();
  });

  it("filters to previously wrong items from the URL", async () => {
    useProgress.getState().answer("Q01", [1], false);
    useProgress.getState().answer("Q02", [0], true);
    renderAt("/ccarf/practice?source=mine&status=wrong");
    expect(screen.getAllByRole("article").map((a) => a.dataset.testid)).toEqual(["q-Q01"]);
  });

  it("shows the score line for the current cert", () => {
    useProgress.getState().answer("Q01", [0], true);
    renderAt("/ccarf/practice?ids=Q01");
    expect(screen.getByTestId("score")).toHaveTextContent(/^1 shown · 1\/1 correct · 100% · \d+ left$/);
  });

  it("resets only the current cert's answers, after confirmation", async () => {
    useProgress.getState().answer("Q01", [0], true);
    useProgress.getState().answer("ccao-001", [0], true);
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    renderAt("/ccarf/practice");
    await userEvent.click(screen.getByRole("button", { name: "Reset answers" }));
    expect(confirm).toHaveBeenCalled();
    expect(Object.keys(useProgress.getState().answers)).toEqual(["ccao-001"]);
  });

  it("keeps answers when the reset is cancelled", async () => {
    useProgress.getState().answer("Q01", [0], true);
    vi.spyOn(window, "confirm").mockReturnValue(false);
    renderAt("/ccarf/practice");
    await userEvent.click(screen.getByRole("button", { name: "Reset answers" }));
    expect(useProgress.getState().answers.Q01).toBeDefined();
  });

  it("clears every filter with Start the mock", async () => {
    const router = renderAt("/ccarf/practice?domain=2&status=wrong");
    await userEvent.click(screen.getByRole("button", { name: "Start the mock" }));
    expect(router.state.location.search).toBe("");
  });
});
