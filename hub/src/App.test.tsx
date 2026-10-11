import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import App from "./App";

it("renders the hub title", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: "Study Hub" })).toBeInTheDocument();
});
