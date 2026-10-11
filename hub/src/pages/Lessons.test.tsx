import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";
import { routes } from "../router";

const renderAt = (path: string) => render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />);

describe("Lessons", () => {
  it("lists the CCAR-F lab lesson under Domain 1", () => {
    renderAt("/ccarf/lessons");
    expect(screen.getByRole("link", { name: /The agentic loop, annotated/ })).toHaveAttribute("href", "/ccarf/lessons/agentic-loop");
    expect(screen.getByText(/Domain 1 ·/)).toBeInTheDocument();
  });

  it("renders a lesson with its body and a practice link", () => {
    renderAt("/ccarf/lessons/agentic-loop");
    expect(screen.getByRole("heading", { name: "The agentic loop, annotated" })).toBeInTheDocument();
    expect(screen.getByText(/def run_agent/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Practice these 2 questions/ })).toHaveAttribute("href", "/ccarf/practice?ids=Q01%2CQ02");
  });

  it("handles an unknown lesson", () => {
    renderAt("/ccarf/lessons/missing");
    expect(screen.getByRole("heading", { name: "Lesson not found" })).toBeInTheDocument();
  });
});
