// Moved once from site/index.html by scripts/migrate-site.ts. This file is now the source of truth: edit it directly.
import type { Heuristic } from "./types";

export const heuristics: Heuristic[] = [
  {
    "id": "H1",
    "t": "Determinism beats prompting",
    "b": "When a rule must never break &mdash; identity checked before a refund, a threshold never exceeded &mdash; use a hook or a programmatic prerequisite. Prompt instructions have a non-zero failure rate, and that is disqualifying when money or identity is involved.",
    "ev": "Sample Q1"
  },
  {
    "id": "H2",
    "t": "Proportionate root-cause fix",
    "b": "Find the actual cause and apply the cheapest change that addresses it. If two tools are confused and their descriptions are one line each, the answer is better descriptions &mdash; not few-shot, not a routing layer, not consolidation.",
    "ev": "Sample Q2, Q3, Q12"
  },
  {
    "id": "H3",
    "t": "Confidence and sentiment are not signals",
    "b": "A model's self-reported confidence is poorly calibrated precisely where it matters: it is already wrong and sure. Sentiment measures mood, not complexity. Neither may gate a decision.",
    "ev": "Sample Q3"
  },
  {
    "id": "H4",
    "t": "Preserve information, never suppress it",
    "b": "Structured error context with partial results and what was attempted. Never a generic status, never an empty result marked successful, never terminating the whole workflow on one failure.",
    "ev": "Sample Q8"
  },
  {
    "id": "H5",
    "t": "Least privilege, scoped tools",
    "b": "Give each agent only its role's tools. Where one need is high-frequency and simple, give it a narrow dedicated tool and route the rare complex case through the coordinator.",
    "ev": "Sample Q9"
  },
  {
    "id": "H6",
    "t": "Blame the assigner, not the executor",
    "b": "When every subagent reports success but the output is wrong, the fault is in what they were asked. Look at the coordinator's decomposition before you look at any worker.",
    "ev": "Sample Q7"
  },
  {
    "id": "H7",
    "t": "More context is not more attention",
    "b": "Inconsistent depth and contradictory findings across a large input are attention dilution. Decompose into focused passes plus an integration pass. A bigger window does not fix it.",
    "ev": "Sample Q12"
  },
  {
    "id": "H8",
    "t": "Match the mechanism to the scope",
    "b": "Shared by the team means project scope and version control; personal means user scope. Blocking means synchronous; overnight means batch. Architectural means plan mode; a one-line fix means direct execution.",
    "ev": "Sample Q4, Q5, Q6, Q11"
  }
];
