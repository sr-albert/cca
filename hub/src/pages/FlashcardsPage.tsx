import { useMemo, useState } from "react";
import { Html } from "../components/Html";
import { catalog } from "../data";
import type { Flashcard } from "../data/schema";
import { useProgress, type CardMark } from "../state/progress";

export function FlashcardDeck({ cards }: { cards: Flashcard[] }) {
  const marks = useProgress((s) => s.cards);
  const markCard = useProgress((s) => s.markCard);
  const [onlyAgain, setOnlyAgain] = useState(false);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const deck = useMemo(() => (onlyAgain ? cards.filter((c) => marks[c.term] === "again") : cards), [cards, marks, onlyAgain]);
  const i = deck.length ? index % deck.length : 0;
  const card = deck[i];
  const known = cards.filter((c) => marks[c.term] === "known").length;
  const again = cards.filter((c) => marks[c.term] === "again").length;

  const mark = (m: CardMark) => {
    markCard(card.term, m);
    setRevealed(false);
    // A card marked Known leaves the Again-only deck, so the same index already shows the next card.
    if (!(onlyAgain && m === "known")) setIndex(i + 1);
  };
  const choose = (again: boolean) => {
    setOnlyAgain(again);
    setIndex(0);
    setRevealed(false);
  };

  return (
    <section className="max-w-2xl">
      <h2 className="font-serif text-3xl">Flashcards</h2>
      {cards.length === 0 ? (
        <p className="mt-4 text-muted">No flashcards: the mirror is not available. Run <code>mirror/update.sh</code> and rebuild.</p>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-xs text-muted">
            <span>{known} known · {again} again · {cards.length} total</span>
            <span className="ml-auto flex gap-1">
              <button type="button" aria-pressed={!onlyAgain} onClick={() => choose(false)} className={!onlyAgain ? "text-accent" : ""}>All</button>
              <span>/</span>
              <button type="button" aria-pressed={onlyAgain} onClick={() => choose(true)} className={onlyAgain ? "text-accent" : ""}>Again only</button>
            </span>
          </div>
          {!card ? (
            <p className="mt-6 text-muted">Nothing marked Again.</p>
          ) : (
            <div className="mt-4 rounded border border-line bg-surface p-6">
              <p className="font-mono text-xs text-muted">{i + 1} / {deck.length}</p>
              <Html as="p" className="mt-2 font-mono text-2xl" html={card.term} />
              {revealed ? (
                <Html as="p" className="mt-4 font-serif text-lg" html={card.sentence} />
              ) : (
                <button type="button" onClick={() => setRevealed(true)} className="mt-4 text-sm text-accent">Show sentence</button>
              )}
              <div className="mt-6 flex gap-2">
                <button type="button" onClick={() => mark("known")} className="rounded border border-good px-3 py-1 text-sm text-good">Know it</button>
                <button type="button" onClick={() => mark("again")} className="rounded border border-bad px-3 py-1 text-sm text-bad">Again</button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default function FlashcardsPage() {
  return <FlashcardDeck cards={catalog.flashcards} />;
}
