// Moved once from site/index.html by scripts/migrate-site.ts. This file is now the source of truth: edit it directly.
import type { Blueprint } from "./types";

export const blueprint: Blueprint = {
  "domains": [
    {
      "n": 1,
      "name": "Agentic Architecture &amp; Orchestration",
      "w": 27,
      "items": 16,
      "ts": "1.1 &ndash; 1.7"
    },
    {
      "n": 2,
      "name": "Tool Design &amp; MCP Integration",
      "w": 18,
      "items": 11,
      "ts": "2.1 &ndash; 2.5"
    },
    {
      "n": 3,
      "name": "Claude Code Configuration &amp; Workflows",
      "w": 20,
      "items": 12,
      "ts": "3.1 &ndash; 3.6"
    },
    {
      "n": 4,
      "name": "Prompt Engineering &amp; Structured Output",
      "w": 20,
      "items": 12,
      "ts": "4.1 &ndash; 4.6"
    },
    {
      "n": 5,
      "name": "Context Management &amp; Reliability",
      "w": 15,
      "items": 9,
      "ts": "5.1 &ndash; 5.6"
    }
  ],
  "inScope": [
    "Agentic loop control flow, <code>stop_reason</code>, termination conditions",
    "Coordinator&ndash;subagent patterns, parallel execution, iterative refinement",
    "Explicit context passing, state persistence, crash-recovery manifests",
    "Tool interface design, naming, splitting versus consolidating",
    "MCP tools and resources, description quality, server scoping",
    "Structured error responses; transient, business and permission errors",
    "Escalation criteria and policy-gap identification",
    "CLAUDE.md hierarchy, <code>@import</code>, <code>.claude/rules/</code> globs",
    "Commands and skills; scope, <code>context: fork</code>, <code>allowed-tools</code>",
    "Plan mode versus direct execution",
    "Structured output via <code>tool_use</code>, schema design, nullable fields",
    "Few-shot prompting; ambiguity, format, false positives",
    "Batch processing suitability and failure handling",
    "Context trimming, fact extraction, position-aware ordering",
    "Human review, confidence calibration, stratified sampling",
    "Provenance, temporal data, conflict annotation"
  ],
  "outScope": [
    "Fine-tuning or training custom models",
    "API authentication, billing, account management",
    "Language and framework implementation detail",
    "Deploying or hosting MCP servers",
    "Claude's internal architecture or training process",
    "Constitutional AI, RLHF, safety training",
    "Embedding models and vector databases",
    "Computer use and browser automation",
    "Vision and image analysis",
    "Streaming APIs and server-sent events",
    "Rate limits, quotas, pricing calculations",
    "OAuth, key rotation, auth protocols",
    "Cloud provider configuration",
    "Benchmarking and model comparison",
    "Prompt caching implementation detail",
    "Token counting and tokenisation"
  ]
};
