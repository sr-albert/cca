// Moved once from site/index.html by scripts/migrate-site.ts. This file is now the source of truth: edit it directly.
import type { Scenario } from "./types";

export const scenarios: Scenario[] = [
  {
    "n": 1,
    "t": "Customer Support Resolution Agent",
    "d": "High-ambiguity requests &mdash; returns, billing disputes, account issues &mdash; through custom MCP tools, targeting 80% first-contact resolution while knowing when to escalate.",
    "dom": [
      1,
      2,
      5
    ]
  },
  {
    "n": 2,
    "t": "Code Generation with Claude Code",
    "d": "A team using Claude Code for generation, refactoring, debugging and documentation, with custom slash commands, CLAUDE.md configuration, and plan mode judgment.",
    "dom": [
      3,
      5
    ]
  },
  {
    "n": 3,
    "t": "Multi-Agent Research System",
    "d": "A coordinator delegating to search, analysis, synthesis and report subagents to produce comprehensive cited reports.",
    "dom": [
      1,
      2,
      5
    ]
  },
  {
    "n": 4,
    "t": "Developer Productivity with Claude",
    "d": "An agent helping engineers explore unfamiliar codebases and legacy systems using the built-in tools and MCP servers.",
    "dom": [
      2,
      3,
      1
    ]
  },
  {
    "n": 5,
    "t": "Claude Code for Continuous Integration",
    "d": "Automated code review, test generation and pull request feedback in a CI/CD pipeline, designed to give actionable feedback and minimise false positives.",
    "dom": [
      3,
      4
    ]
  },
  {
    "n": 6,
    "t": "Structured Data Extraction",
    "d": "Extracting information from unstructured documents, validating against JSON schemas, handling edge cases and feeding downstream systems.",
    "dom": [
      4,
      5
    ]
  }
];
