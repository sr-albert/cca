# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal exam prep for **CCAR-F** (Claude Certified Architect – Foundations). The primary app is `hub/`, a React + Vite SPA that combines two sources:

- `hub/src/content/ccarf/`: the CCAR-F plan tracks, heuristics, blueprint, scenarios, 52 questions and the Lab. These were moved once from `site/index.html` by `hub/scripts/migrate-site.ts` and are now the source of truth, so edit them directly. `site/index.html` stays only as the original reference.
- `mirror/exam-prep-web/learn.html`: an untracked offline copy of a third-party study site (4 certs). `hub/scripts/extract-mirror.ts` turns its `window.LEARN` JSON into `hub/src/data/generated/mirror.js` at build time. The content has no license: never commit the mirror, the generated data, or a built image.
- `reference/ccar-f-exam-guide.txt`: the official exam guide, the source of truth for domains, weights and task statements.

Specs and plans live in `docs/superpowers/`, which is untracked because the global gitignore excludes it.

## Running

```sh
docker compose up                          # production build → http://localhost:8080
docker compose --profile dev up hub-dev    # Vite live reload → http://localhost:5173
cd hub && npm run dev                      # without Docker
cd hub && npm test                         # all tests; one file: npx vitest run src/lib/practice.test.ts
cd hub && npm run typecheck && npm run lint
```

`npm run dev`, `build`, `test` and `typecheck` run the extractor first. Without `mirror/`, the hub builds with CCAR-F only.

## How `hub/` is put together

- `src/data/schema.ts` holds the zod schemas and shared types. `src/data/catalog.ts` merges the own content and the mirror into one `Catalog`. Pages import only from `src/data` (`catalog`, `getCert`, `questionsByCert`, `lessonsByCert`, `DIAGNOSTIC`).
- **Every catalog string is HTML.** The extractor escapes the mirror's plain text, and all content renders through `components/Html.tsx`. Mirror SVG diagrams rely on the `.dg-*` classes in `styles/content.css`.
- **Plan actions are data.** Each task carries `actions` (practice filter, reference section, lesson or track switch). They were generated from the old regex in `site/index.html` during the move; edit them as data now.
- **The diagnostic is the explicit ID list** in `content/ccarf/diagnostic.ts`.
- **Progress** lives in `src/state/progress.ts` (Zustand, `localStorage` key `studyhub:v1`). Answers are keyed by question ID, so never renumber IDs.
- **Routes** are `/:cert/{plan,lessons,lessons/:slug,practice,cards,reference}`. Plan and Reference are CCAR-F only. Practice filters live in the URL query (`lib/filters.ts`).
- `src/content/ccarf/parity.test.ts` checks the moved content against `site/index.html`, and skips itself when `site/` is absent. Its "identical to a fresh migration" test pins the one-time move: delete that test (keep the count checks) the first time you change content on purpose.
