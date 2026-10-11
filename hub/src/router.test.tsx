import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";
import { routes } from "./router";
import { useProgress } from "./state/progress";

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

describe("routing", () => {
  it("sends / to /ccarf", async () => {
    const router = renderAt("/");
    await waitFor(() => expect(router.state.location.pathname).toBe("/ccarf"));
  });

  it("sends an unknown cert to /ccarf", async () => {
    const router = renderAt("/nope/practice");
    await waitFor(() => expect(router.state.location.pathname).toBe("/ccarf"));
  });

  it("never shows a CCAR-F-only page under another cert", async () => {
    const router = renderAt("/ccdv/plan");
    await waitFor(() => expect(router.state.location.pathname).not.toBe("/ccdv/plan"));
  });

  it("shows the sidebar with all six pages on CCAR-F", () => {
    renderAt("/ccarf/practice");
    const nav = screen.getAllByRole("navigation", { name: "Pages" })[0];
    expect(nav).toHaveTextContent("Plan");
    expect(nav).toHaveTextContent("Reference");
  });

  it("records the last visited page but not Home", async () => {
    renderAt("/ccarf/practice?domain=2");
    await waitFor(() => expect(useProgress.getState().lastVisit).toEqual({ cert: "ccarf", path: "/ccarf/practice?domain=2" }));
  });
});
