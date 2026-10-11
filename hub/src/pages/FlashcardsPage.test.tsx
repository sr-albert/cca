import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { initialProgress, useProgress } from "../state/progress";
import { FlashcardDeck } from "./FlashcardsPage";

const cards = [
  { term: "alpha", sentence: "Alpha sentence." },
  { term: "beta", sentence: "Beta sentence." },
];

beforeEach(() => useProgress.setState(initialProgress()));

describe("FlashcardDeck", () => {
  it("shows the term first and the sentence on reveal", async () => {
    render(<FlashcardDeck cards={cards} />);
    expect(screen.getByText("alpha")).toBeInTheDocument();
    expect(screen.queryByText("Alpha sentence.")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Show sentence" }));
    expect(screen.getByText("Alpha sentence.")).toBeInTheDocument();
  });

  it("marks a card and moves to the next one", async () => {
    render(<FlashcardDeck cards={cards} />);
    await userEvent.click(screen.getByRole("button", { name: "Again" }));
    expect(useProgress.getState().cards.alpha).toBe("again");
    expect(screen.getByText("beta")).toBeInTheDocument();
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
  });

  it("filters to cards marked Again", async () => {
    useProgress.getState().markCard("beta", "again");
    render(<FlashcardDeck cards={cards} />);
    await userEvent.click(screen.getByRole("button", { name: "Again only" }));
    expect(screen.getByText("beta")).toBeInTheDocument();
    expect(screen.getByText("1 / 1")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Know it" }));
    expect(screen.getByText("Nothing marked Again.")).toBeInTheDocument();
  });

  it("explains an empty deck", () => {
    render(<FlashcardDeck cards={[]} />);
    expect(screen.getByText(/No flashcards/)).toBeInTheDocument();
  });
});
