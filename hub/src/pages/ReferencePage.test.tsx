import { render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";
import { routes } from "../router";

const renderAt = (path: string) => render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />);

describe("Reference", () => {
  it("shows all heuristics, scenarios and scope items", () => {
    renderAt("/ccarf/reference#blueprint");
    expect(screen.getAllByTestId("heuristic")).toHaveLength(8);
    expect(screen.getAllByTestId("scenario")).toHaveLength(6);
    expect(within(screen.getByRole("list", { name: "In scope" })).getAllByRole("listitem")).toHaveLength(16);
    expect(within(screen.getByRole("list", { name: "Out of scope" })).getAllByRole("listitem")).toHaveLength(16);
    expect(screen.getAllByTestId("domain-weight")).toHaveLength(5);
  });

  it("includes the moved static text", () => {
    renderAt("/ccarf/reference");
    expect(screen.getByRole("heading", { name: "Distractor tells" })).toBeInTheDocument();
    expect(screen.getByText(/Passing score/)).toBeInTheDocument();
    expect(screen.getByText(/Provenance\./)).toBeInTheDocument();
  });
});
