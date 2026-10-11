// Moved once from site/index.html by scripts/migrate-site.ts. This file is now the source of truth: edit it directly.
import type { Track, TrackId } from "./types";

export const TRACK_ORDER: TrackId[] = [
  "beginner",
  "experienced",
  "expert"
];

export const tracks: Record<TrackId, Track> = {
  "beginner": {
    "id": "beginner",
    "name": "Beginner",
    "tag": "A0 &middot; never used Claude Code",
    "unit": "Phase",
    "runway": "~10 hours per week &middot; roughly 10&ndash;12 weeks",
    "who": "You have not used Claude or another AI tool for real work, and you do not write software. This track gets you to the starting line the other two tracks begin from.",
    "notes": [
      {
        "w": 1,
        "b": "This is not a nine-day path, and no honest plan makes it one.",
        "t": "The exam asks you to read Python, reason about JSON Schema, and judge decisions about git, pull requests and CI pipelines. Those are prerequisites, not exam content &mdash; the guide assumes them and never teaches them. Compressing this costs you $125 and a fourteen-day lockout, so build the foundation first."
      },
      {
        "b": "Consider a lower rung first.",
        "t": "Anthropic&rsquo;s certification program has four exams, including <b>Claude Certified Associate &ndash; Foundations</b> (CCAO-F) and <b>Claude Certified Developer &ndash; Foundations</b> (CCDV-F). CCAR-F is explicitly the <em>architect</em> track. Check whether an associate-level credential matches where you are &mdash; I have not sat it and cannot vouch for its difficulty, but it is worth ten minutes on the Partner Academy before committing here."
      },
      {
        "b": "Do not skip the gates.",
        "t": "Each phase ends with a check you can either pass or not. Advancing past a gate you have not cleared is the single most common way this track fails &mdash; the later phases assume the earlier ones landed."
      }
    ],
    "steps": [
      {
        "n": 1,
        "short": "Technical literacy",
        "title": "Technical literacy",
        "dur": "~3 weeks",
        "ts": [
          "prerequisite"
        ],
        "tasks": [
          {
            "text": "Learn the command line until running a command with flags feels ordinary rather than alarming. You will meet <code>-p</code>, <code>--output-format json</code> and <code>--json-schema</code> on the exam and they must read as unremarkable.",
            "actions": []
          },
          {
            "text": "Learn git and GitHub to the point you can clone, branch, commit, and explain what a pull request is. Two of the six exam scenarios are built entirely on CI/CD and pull request review.",
            "actions": []
          },
          {
            "text": "Learn to read JSON, and what a JSON Schema constrains &mdash; required versus optional fields, types, enums, nullability. Domain 4 is 20% of the exam and much of it is schema design judgment.",
            "actions": []
          },
          {
            "text": "Learn to <em>read</em> Python: functions, dicts, lists, loops, conditionals. You do not need to write it. You need to look at a twenty-five line loop and narrate what happens on each pass.",
            "actions": []
          },
          {
            "text": "Learn what an API is: a request, a response, authentication, and why a response might come back saying it wants to call a tool before it can answer.",
            "actions": []
          }
        ],
        "gate": "Open the Lab tab and narrate the loop line by line, out loud, without guessing. If any line is opaque, stay in this phase."
      },
      {
        "n": 2,
        "short": "Live with Claude",
        "title": "Live with Claude every day",
        "dur": "~2 weeks",
        "ts": [
          "3.1",
          "3.2",
          "3.4"
        ],
        "tasks": [
          {
            "text": "Use Claude daily for real work, not experiments. Notice where it does well unaided and where it needs context you forgot to give it &mdash; that intuition is what Domain 5 formalises.",
            "actions": []
          },
          {
            "text": "Install Claude Code and use it every day on a small real repository. A toy project is fine; daily contact is the point.",
            "actions": []
          },
          {
            "text": "Write a <code>CLAUDE.md</code>. Change it. Watch behaviour change. Run <code>/memory</code> and see exactly which files loaded.",
            "actions": []
          },
          {
            "text": "Create one slash command in <code>.claude/commands/</code>, and one skill in <code>.claude/skills/</code> with frontmatter. Deliberately try <code>context: fork</code> and watch what does not land in your conversation.",
            "actions": []
          },
          {
            "text": "Use plan mode on something genuinely tangled, and direct execution on a one-line fix. Feel the difference &mdash; Domain 3 asks you to choose between them under time pressure.",
            "actions": []
          }
        ],
        "gate": "You have a CLAUDE.md, a slash command and a skill that you wrote yourself, in a repository, all working."
      },
      {
        "n": 3,
        "short": "Build with the API",
        "title": "Build with the API",
        "dur": "~3 weeks",
        "ts": [
          "1.1",
          "2.1",
          "2.2",
          "4.3"
        ],
        "tasks": [
          {
            "text": "Make one API call from Python and print the whole response. Find <code>stop_reason</code> in it and read what it says.",
            "actions": []
          },
          {
            "text": "Define one tool and call again. Watch <code>stop_reason</code> become <code>tool_use</code>. Read the block: its <code>id</code>, <code>name</code> and <code>input</code>.",
            "actions": []
          },
          {
            "text": "Send the result back as a <code>tool_result</code> under the <code>user</code> role, with a matching <code>tool_use_id</code>. Call again. You have just completed one turn of the agentic loop by hand.",
            "actions": []
          },
          {
            "text": "Now wrap it in a loop driven by <code>stop_reason</code>. Get it wrong first. This one exercise is the spine of the 27% domain and there is no substitute for having debugged it.",
            "actions": []
          },
          {
            "text": "Add a second, similar tool with a thin one-line description. Watch the model pick the wrong one. Now rewrite both descriptions properly and watch it stop. That is Domain 2&rsquo;s central lesson, learned the honest way.",
            "actions": []
          },
          {
            "text": "Return a structured error carrying <code>errorCategory</code> and <code>isRetryable</code>, and watch the agent recover differently than it did on a generic failure string.",
            "actions": []
          },
          {
            "text": "Extract structured data using <code>tool_use</code> with a JSON schema. Mark a field required when the document lacks it, watch the model invent a value, then make it nullable and watch fabrication stop.",
            "actions": []
          }
        ],
        "gate": "You have an agent that loops on stop_reason, calls two distinct tools, and handles at least one error category deliberately."
      },
      {
        "n": 4,
        "short": "Subagents & hooks",
        "title": "Subagents and hooks",
        "dur": "~1&ndash;2 weeks",
        "ts": [
          "1.2",
          "1.3",
          "1.5"
        ],
        "tasks": [
          {
            "text": "Spawn one subagent. Discover for yourself that it inherits nothing from the parent conversation, then pass its context explicitly in the prompt.",
            "actions": []
          },
          {
            "text": "Spawn two subagents in a single response and watch them run in parallel. Then spawn them across two turns and watch the latency difference.",
            "actions": []
          },
          {
            "text": "Add a <code>PostToolUse</code> hook that rewrites a tool result before the model ever sees it. Normalise two different timestamp formats into one.",
            "actions": []
          },
          {
            "text": "Add a hook that intercepts an outgoing tool call and blocks it above a threshold. Then try to achieve the same guarantee with a system prompt instruction and count the failures.",
            "actions": []
          },
          {
            "text": "That last exercise is heuristic H1 felt rather than read. It is the most reliably tested idea in Domain 1 and you now own it.",
            "actions": []
          }
        ],
        "gate": "You can explain from your own experience why a hook beats a prompt for a rule that must never break."
      },
      {
        "n": 5,
        "short": "The nine days",
        "title": "Run the nine-day plan",
        "dur": "9 days",
        "ts": [
          "all"
        ],
        "tasks": [
          {
            "text": "Switch this page to the <b>Expert</b> track and work it end to end. Everything in it will now make sense, because you have built each thing it refers to.",
            "actions": [
              {
                "label": "Switch to the Expert track",
                "go": "track",
                "track": "expert"
              }
            ]
          },
          {
            "text": "Book the exam only once you are inside this phase. Not before.",
            "actions": []
          },
          {
            "text": "Sit the timed mock and use the reschedule window honestly &mdash; Pearson VUE lets you move the appointment free of charge up to 24 hours beforehand.",
            "actions": [
              {
                "label": "Start the timed mock",
                "go": "practice",
                "filter": {}
              }
            ]
          }
        ],
        "gate": "You are ready to book."
      }
    ]
  },
  "experienced": {
    "id": "experienced",
    "name": "Experienced",
    "tag": "A1 &middot; daily Claude user, GUI or CLI",
    "unit": "Day",
    "runway": "~2 hours per day",
    "who": "You use Claude or Claude Code most days for real work. You are fluent as a user but you have not built with the API or the Agent SDK, and you have not designed MCP tools yourself.",
    "notes": [
      {
        "b": "Your fluency covers about a fifth of the exam.",
        "t": "Domain 3 is 20% and you are close to it already. Domains 1, 2 and 4 come to 65% and they assume programmatic work you have not done. Plan your time against that split, not against how comfortable Claude feels day to day."
      },
      {
        "b": "Two build days are non-negotiable.",
        "t": "Days 4 and 5 put your hands on the API. Two hours of having debugged an agentic loop beats a week of reading about one, and Domain 1 alone is 27%. If you are already at B1 or B2 on the placement axes, skip them and finish in twelve days."
      },
      {
        "b": "Fluency is not precision.",
        "t": "You know that <code>.claude/rules/</code> exists. Do you know that its frontmatter key is <code>paths</code>, that skills take <code>argument-hint</code>, and that <code>.claude/config.json</code> is a fiction that appears as a distractor? Days 2 and 3 exist for exactly this."
      }
    ],
    "steps": [
      {
        "n": 1,
        "short": "Orient & diagnose",
        "title": "Orient and diagnose",
        "ts": [
          "all"
        ],
        "tasks": [
          {
            "text": "Read the Blueprint tab. Learn the five weights as numbers &mdash; 27, 18, 20, 20, 15. They tell you where the marks actually live.",
            "actions": [
              {
                "label": "Open Blueprint",
                "go": "reference",
                "section": "blueprint"
              }
            ]
          },
          {
            "text": "Read all eight heuristics. Do not try to memorise them yet; understand why each one is true.",
            "actions": [
              {
                "label": "Open Heuristics",
                "go": "reference",
                "section": "heuristics"
              }
            ]
          },
          {
            "text": "Read all six scenarios. Four of them will frame your exam, and they are published in full.",
            "actions": [
              {
                "label": "Open Scenarios",
                "go": "reference",
                "section": "scenarios"
              }
            ]
          },
          {
            "text": "Read the out-of-scope list properly. It is long, specific, and it is the cheapest time you will save all fortnight.",
            "actions": [
              {
                "label": "Open Blueprint",
                "go": "reference",
                "section": "blueprint"
              }
            ]
          },
          {
            "text": "Run the Diagnostic filter in the Drill tab &mdash; fifteen items, three per domain, untimed. Note which domains collapse. Do not study yet.",
            "actions": [
              {
                "label": "Run the 15-item diagnostic",
                "go": "practice",
                "filter": {
                  "status": "diagnostic"
                }
              }
            ]
          }
        ]
      },
      {
        "n": 2,
        "short": "Config precision I",
        "title": "Claude Code precision I",
        "ts": [
          "3.1",
          "3.2"
        ],
        "tasks": [
          {
            "text": "The CLAUDE.md hierarchy: user, project, directory. Know which one travels through version control and which one silently does not &mdash; that single fact is a whole exam item.",
            "actions": []
          },
          {
            "text": "<code>@import</code> for modular includes, and <code>.claude/rules/</code> as the alternative to a monolithic file.",
            "actions": []
          },
          {
            "text": "<code>/memory</code> is the diagnostic that tells you which memory files actually loaded. Know it as a debugging tool, not a fix.",
            "actions": []
          },
          {
            "text": "Commands: <code>.claude/commands/</code> is project scope and shared; <code>~/.claude/commands/</code> is personal and is not.",
            "actions": []
          },
          {
            "text": "Skills: the SKILL.md frontmatter keys are <code>context: fork</code>, <code>allowed-tools</code> and <code>argument-hint</code>. Know what each does and which problem it solves.",
            "actions": []
          },
          {
            "text": "Skills versus CLAUDE.md: on-demand and task-specific versus always-loaded and universal. Drill items 3.1 and 3.2.",
            "actions": [
              {
                "label": "Drill 3.1, 3.2",
                "go": "practice",
                "filter": {
                  "tasks": [
                    "3.1",
                    "3.2"
                  ]
                }
              }
            ]
          }
        ]
      },
      {
        "n": 3,
        "short": "Config precision II",
        "title": "Claude Code precision II",
        "ts": [
          "3.3",
          "3.4",
          "3.5",
          "3.6"
        ],
        "tasks": [
          {
            "text": "<code>.claude/rules/</code> with YAML <code>paths</code> globs, and why they beat directory-level CLAUDE.md files for conventions scattered across a tree.",
            "actions": []
          },
          {
            "text": "Plan mode versus direct execution. Learn the decision as a test you can apply in fifteen seconds: multiple valid approaches or architectural consequence means plan mode; clear single-file scope means direct.",
            "actions": []
          },
          {
            "text": "The Explore subagent as the tool for isolating verbose discovery output.",
            "actions": []
          },
          {
            "text": "Iterative refinement: concrete input/output examples, test-driven iteration, the interview pattern, and when to batch fixes versus fix sequentially.",
            "actions": []
          },
          {
            "text": "CI: <code>-p</code> / <code>--print</code>, <code>--output-format json</code>, <code>--json-schema</code>. Then learn the three invented distractors cold &mdash; they are free marks.",
            "actions": []
          },
          {
            "text": "Drill the rest of Domain 3. You have now banked a fifth of the exam.",
            "actions": [
              {
                "label": "Drill Domain 3",
                "go": "practice",
                "filter": {
                  "domain": 3
                }
              }
            ]
          }
        ]
      },
      {
        "n": 4,
        "short": "First API contact",
        "title": "First API contact",
        "ts": [
          "1.1"
        ],
        "tasks": [
          {
            "text": "<b>Build day.</b> Install the SDK, make one call, print the entire response object, and find <code>stop_reason</code>.",
            "actions": []
          },
          {
            "text": "Define one tool. Call again. Watch <code>stop_reason</code> become <code>tool_use</code> and read the block: <code>id</code>, <code>name</code>, <code>input</code>.",
            "actions": []
          },
          {
            "text": "Append the assistant response verbatim, then send a <code>tool_result</code> back under the <code>user</code> role with a matching <code>tool_use_id</code>.",
            "actions": []
          },
          {
            "text": "Note the asymmetry: assistant turn goes back as <code>assistant</code>, tool results come back as <code>user</code>. Exam options that swap these are wrong and you should be able to say why instantly.",
            "actions": []
          }
        ]
      },
      {
        "n": 5,
        "short": "The loop",
        "title": "Build the loop",
        "ts": [
          "1.1",
          "2.1",
          "2.2"
        ],
        "tasks": [
          {
            "text": "<b>Build day.</b> Wrap yesterday&rsquo;s work in a <code>while</code> loop driven entirely by <code>stop_reason</code>. Then read the Lab tab and compare it against yours.",
            "actions": [
              {
                "label": "Open the Lab",
                "go": "lesson",
                "slug": "agentic-loop"
              }
            ]
          },
          {
            "text": "Deliberately implement one anti-pattern &mdash; terminate on assistant text, or cap iterations &mdash; and watch it misbehave. You will never forget it after that.",
            "actions": []
          },
          {
            "text": "Emit two tool calls in one response and answer both before the next request.",
            "actions": []
          },
          {
            "text": "Add a second, similar tool with a thin description. Watch selection fail. Rewrite both descriptions properly. Domain 2, learned honestly.",
            "actions": []
          },
          {
            "text": "Return a structured error with <code>errorCategory</code> and <code>isRetryable</code>, and watch recovery change.",
            "actions": []
          }
        ]
      },
      {
        "n": 6,
        "short": "Domain 1a",
        "title": "Loop control and decomposition",
        "ts": [
          "1.1",
          "1.6"
        ],
        "tasks": [
          {
            "text": "Consolidate the loop: <code>stop_reason</code> as the only condition, tool results re-entering context, and the three named anti-patterns.",
            "actions": []
          },
          {
            "text": "Fixed prompt chaining versus dynamic adaptive decomposition. Be able to name one example of each from the six scenarios.",
            "actions": [
              {
                "label": "Open Scenarios",
                "go": "reference",
                "section": "scenarios"
              }
            ]
          },
          {
            "text": "Prompt chaining for predictable multi-aspect review; adaptive planning for open-ended investigation. The tell is whether you can name the subtasks before looking.",
            "actions": []
          },
          {
            "text": "Drill items 1.1 and 1.6.",
            "actions": [
              {
                "label": "Drill 1.1, 1.6",
                "go": "practice",
                "filter": {
                  "tasks": [
                    "1.1",
                    "1.6"
                  ]
                }
              }
            ]
          }
        ]
      },
      {
        "n": 7,
        "short": "Domain 1b",
        "title": "Coordinators and subagents",
        "ts": [
          "1.2",
          "1.3"
        ],
        "tasks": [
          {
            "text": "Hub and spoke: name the three properties routing through the coordinator buys &mdash; observability, consistent error handling, controlled information flow.",
            "actions": []
          },
          {
            "text": "Subagents inherit nothing. Context must be explicit in the prompt. This one fact answers a surprising number of items.",
            "actions": []
          },
          {
            "text": "<code>allowedTools</code> must include <code>Task</code>. Parallel subagents mean several Task calls in one response, not across turns.",
            "actions": []
          },
          {
            "text": "Structured claim-to-source passing, so provenance survives the handoff to synthesis.",
            "actions": []
          },
          {
            "text": "Coordinator prompts carry goals and quality criteria, not step-by-step procedure. Drill 1.2 and 1.3.",
            "actions": [
              {
                "label": "Drill 1.2, 1.3",
                "go": "practice",
                "filter": {
                  "tasks": [
                    "1.2",
                    "1.3"
                  ]
                }
              }
            ]
          }
        ]
      },
      {
        "n": 8,
        "short": "Hooks & sessions",
        "title": "Hooks, enforcement, sessions",
        "ts": [
          "1.4",
          "1.5",
          "1.7"
        ],
        "tasks": [
          {
            "text": "The deterministic guarantee. A rule that must never break cannot live in a prompt. Heuristic H1, and the most reliably tested idea in the domain.",
            "actions": []
          },
          {
            "text": "<code>PostToolUse</code> normalises results on the way in; call interception blocks actions on the way out. Know which side each sits on.",
            "actions": []
          },
          {
            "text": "Programmatic prerequisites that gate one tool on another having succeeded.",
            "actions": []
          },
          {
            "text": "Structured handoff summaries for a human who cannot see the transcript: verified id, root cause, amount, recommended action.",
            "actions": []
          },
          {
            "text": "Sessions: <code>--resume</code> by name, <code>fork_session</code> for divergent branches from a valid baseline, and when a fresh session with an injected summary beats resuming stale results. Drill 1.4, 1.5, 1.7 &mdash; the 27% domain is now complete.",
            "actions": [
              {
                "label": "Drill 1.4, 1.5, 1.7",
                "go": "practice",
                "filter": {
                  "tasks": [
                    "1.4",
                    "1.5",
                    "1.7"
                  ]
                }
              }
            ]
          }
        ]
      },
      {
        "n": 9,
        "short": "Domain 4a",
        "title": "Criteria and few-shot",
        "ts": [
          "4.1",
          "4.2"
        ],
        "tasks": [
          {
            "text": "Explicit categorical criteria beat confidence language. Know why &ldquo;be conservative&rdquo; and &ldquo;only high-confidence findings&rdquo; measurably fail.",
            "actions": []
          },
          {
            "text": "False positives are a trust problem, not just an accuracy problem. Disabling a bad category to protect the good ones is a legitimate answer.",
            "actions": []
          },
          {
            "text": "Few-shot is the fix for inconsistency and for ambiguous-case handling. Two to four targeted examples, not fifteen generic ones.",
            "actions": []
          },
          {
            "text": "Few-shot examples should show the reasoning for choosing one action over a plausible alternative. Drill 4.1 and 4.2.",
            "actions": [
              {
                "label": "Drill 4.1, 4.2",
                "go": "practice",
                "filter": {
                  "tasks": [
                    "4.1",
                    "4.2"
                  ]
                }
              }
            ]
          }
        ]
      },
      {
        "n": 10,
        "short": "Domain 4b",
        "title": "Schemas, validation, batching",
        "ts": [
          "4.3",
          "4.4",
          "4.5",
          "4.6"
        ],
        "tasks": [
          {
            "text": "<code>tool_use</code> with a JSON schema for guaranteed structure. It eliminates syntax errors and never semantic ones &mdash; that distinction is an exam item on its own.",
            "actions": []
          },
          {
            "text": "<code>tool_choice</code>: <code>auto</code>, <code>any</code>, and forced named selection. Know exactly what each guarantees.",
            "actions": []
          },
          {
            "text": "Nullable and optional fields prevent fabrication. Enum plus <code>other</code> plus a detail string handles extensibility. Add <code>unclear</code> for genuine ambiguity.",
            "actions": []
          },
          {
            "text": "Validation-retry with the specific error appended. Know the one class retry can never fix: information absent from the source.",
            "actions": []
          },
          {
            "text": "Semantic validation by extracting <code>calculated_total</code> alongside <code>stated_total</code>.",
            "actions": []
          },
          {
            "text": "Message Batches API: 50% cheaper, up to 24 hours, no latency SLA, no multi-turn tool calling, <code>custom_id</code> to correlate. Never for blocking work.",
            "actions": []
          },
          {
            "text": "Independent review instances beat self-review. Drill the rest of Domain 4.",
            "actions": [
              {
                "label": "Drill Domain 4",
                "go": "practice",
                "filter": {
                  "domain": 4
                }
              }
            ]
          }
        ]
      },
      {
        "n": 11,
        "short": "Domain 2",
        "title": "Tool design and MCP",
        "ts": [
          "2.1",
          "2.2",
          "2.3",
          "2.4",
          "2.5"
        ],
        "tasks": [
          {
            "text": "Descriptions are the selection mechanism. When two tools get confused, the first move is almost always better descriptions.",
            "actions": []
          },
          {
            "text": "Splitting a generic tool into purpose-specific ones with defined contracts, and renaming to remove overlap.",
            "actions": []
          },
          {
            "text": "The error taxonomy: transient, validation, business, permission. Plus <code>isError</code>, <code>errorCategory</code>, <code>isRetryable</code>.",
            "actions": []
          },
          {
            "text": "Access failure versus valid empty result &mdash; easy to miss and genuinely tested.",
            "actions": []
          },
          {
            "text": "Tool count degrades selection. Scope to role; give the high-frequency simple case its own narrow tool.",
            "actions": []
          },
          {
            "text": "<code>.mcp.json</code> project scope versus <code>~/.claude.json</code> user scope, and <code>${ENV_VAR}</code> expansion for credentials.",
            "actions": []
          },
          {
            "text": "MCP resources for content catalogues. Built-in tools: Grep for content, Glob for paths, Read then Write when Edit cannot find unique anchor text. Drill all of Domain 2.",
            "actions": [
              {
                "label": "Drill Domain 2",
                "go": "practice",
                "filter": {
                  "domain": 2
                }
              }
            ]
          }
        ]
      },
      {
        "n": 12,
        "short": "Domain 5",
        "title": "Context and reliability",
        "ts": [
          "5.1",
          "5.2",
          "5.3",
          "5.4",
          "5.5",
          "5.6"
        ],
        "tasks": [
          {
            "text": "Case-facts blocks kept outside summarised history, trimming verbose tool output at the boundary, and the lost-in-the-middle effect &mdash; key findings first, explicit section headers.",
            "actions": []
          },
          {
            "text": "Valid escalation triggers: explicit customer request, policy gap or silence, inability to make meaningful progress. Sentiment and self-reported confidence are not triggers.",
            "actions": []
          },
          {
            "text": "Structured error propagation with partial results. Never a generic status, never empty-marked-success, never terminating the whole workflow.",
            "actions": []
          },
          {
            "text": "Scratchpad files and subagent delegation against context degradation in long sessions.",
            "actions": []
          },
          {
            "text": "Confidence calibration, stratified sampling, and segmenting accuracy by document type and field before automating.",
            "actions": []
          },
          {
            "text": "Provenance: claim-to-source mappings, publication dates, conflicts annotated rather than resolved. Drill all of Domain 5.",
            "actions": [
              {
                "label": "Drill Domain 5",
                "go": "practice",
                "filter": {
                  "domain": 5
                }
              }
            ]
          }
        ]
      },
      {
        "n": 13,
        "short": "Mock",
        "title": "Sit the timed mock",
        "ts": [
          "all"
        ],
        "tasks": [
          {
            "text": "Restate the eight heuristics from memory before you start. If any is shaky, fix it now &mdash; not after.",
            "actions": [
              {
                "label": "Open Heuristics",
                "go": "reference",
                "section": "heuristics"
              }
            ]
          },
          {
            "text": "<b>Sit the mock timed.</b> Clear all Drill filters. Two minutes per item is the real pace; practise it.",
            "actions": [
              {
                "label": "Start the timed mock",
                "go": "practice",
                "filter": {}
              }
            ]
          },
          {
            "text": "Do not review it the same day. Mark it and stop.",
            "actions": []
          },
          {
            "text": "The mock is a gap-finder, not a score predictor &mdash; it is not calibrated to the real 100&ndash;1000 scale.",
            "actions": []
          }
        ]
      },
      {
        "n": 14,
        "short": "Repair & scenarios",
        "title": "Repair, scenarios, logistics",
        "ts": [
          "all"
        ],
        "tasks": [
          {
            "text": "Review every miss. For each, name which heuristic would have caught it. If none would have, it is a knowledge gap rather than a judgment gap &mdash; write it on one sheet of paper.",
            "actions": [
              {
                "label": "Open Heuristics",
                "go": "reference",
                "section": "heuristics"
              }
            ]
          },
          {
            "text": "Re-drill using the &ldquo;Previously wrong&rdquo; filter until that sheet is short.",
            "actions": [
              {
                "label": "Drill previous misses",
                "go": "practice",
                "filter": {
                  "status": "wrong"
                }
              }
            ]
          },
          {
            "text": "Walk all six scenarios. For each, say aloud which domains it draws on and its most likely failure mode.",
            "actions": [
              {
                "label": "Open Scenarios",
                "go": "reference",
                "section": "scenarios"
              }
            ]
          },
          {
            "text": "Logistics: confirm the appointment, check your government photo ID matches the registration name exactly, test the proctoring software, clear your desk of everything. Rescheduling inside 24 hours forfeits the fee.",
            "actions": []
          },
          {
            "text": "Stop studying the evening before. Sleep is worth more than another pass.",
            "actions": []
          }
        ]
      }
    ]
  },
  "expert": {
    "id": "expert",
    "name": "Expert",
    "tag": "A2 &middot; authors skills, commands, MCP config",
    "unit": "Day",
    "runway": "~2 hours per day &middot; compressible to 5 days at B1&ndash;B2",
    "who": "You author skills, slash commands, hooks or MCP configuration that other people rely on. Claude Code is not a tool you use so much as a surface you build on.",
    "notes": [
      {
        "w": 1,
        "b": "Your failure mode is precision, not comprehension.",
        "t": "You will not lose marks on architecture. You will lose them on whether the frontmatter key is <code>argument-hint</code> or <code>arg-hint</code>, and on whether <code>.claude/config.json</code> exists. Under time pressure, fluency feels like certainty and is not the same thing. Day 2 exists for this and it is the day you will most want to skip."
      },
      {
        "w": 1,
        "b": "The exam has opinions, and they may not be yours.",
        "t": "Where your production instinct says &ldquo;it depends&rdquo;, the answer key wants the proportionate root-cause fix or the deterministic guarantee. You might genuinely build a routing classifier at scale &mdash; the exam scores that as over-engineering. Read the eight heuristics as the house style you are being marked against, not as advice you are free to weigh."
      },
      {
        "b": "Diagnose before you study.",
        "t": "You are the one candidate who should not follow a fixed syllabus blind. Day 1 spends fifteen items finding out where you actually are, and Days 3 to 7 get reordered around what it exposes."
      },
      {
        "b": "Two minutes per item.",
        "t": "Sixty items in 120 minutes. Experts over-deliberate on scenario questions, recognise three defensible readings, and run out of clock. Practise committing at pace."
      }
    ],
    "steps": [
      {
        "n": 1,
        "short": "Diagnose",
        "title": "Diagnose, then read the heuristics",
        "ts": [
          "all"
        ],
        "tasks": [
          {
            "text": "Run the Diagnostic filter in the Drill tab first, cold, before reading anything else. Fifteen items, three per domain. Resist the urge to prepare &mdash; a diagnostic you have studied for tells you nothing.",
            "actions": [
              {
                "label": "Run the 15-item diagnostic",
                "go": "practice",
                "filter": {
                  "status": "diagnostic"
                }
              }
            ]
          },
          {
            "text": "Read your result per domain. Where you scored badly is your syllabus; the fixed order below is only a default.",
            "actions": []
          },
          {
            "text": "Now read all eight heuristics, and read them as the marking scheme rather than as opinions. Note every place you disagree &mdash; those are the items you are most likely to get wrong.",
            "actions": [
              {
                "label": "Open Heuristics",
                "go": "reference",
                "section": "heuristics"
              }
            ]
          },
          {
            "text": "Read all six scenarios and the out-of-scope list.",
            "actions": [
              {
                "label": "Open Scenarios",
                "go": "reference",
                "section": "scenarios"
              },
              {
                "label": "Open Blueprint",
                "go": "reference",
                "section": "blueprint"
              }
            ]
          }
        ]
      },
      {
        "n": 2,
        "short": "Config precision",
        "title": "Domain 3 precision pass",
        "ts": [
          "3.1",
          "3.2",
          "3.3",
          "3.4",
          "3.5",
          "3.6"
        ],
        "tasks": [
          {
            "text": "This is the day to not skip. Write out cold, from memory, before checking anything: the three CLAUDE.md scopes and which is version-controlled; what <code>@import</code> does; the frontmatter key that path-scopes a rule file; all three SKILL.md frontmatter keys; the flag for non-interactive mode; the two flags that constrain CI output.",
            "actions": []
          },
          {
            "text": "Now check yourself against the Blueprint tab. Every miss is an item you would have lost.",
            "actions": [
              {
                "label": "Open Blueprint",
                "go": "reference",
                "section": "blueprint"
              }
            ]
          },
          {
            "text": "Learn the three inventions cold: <code>.claude/config.json</code>, <code>CLAUDE_HEADLESS</code>, <code>claude --batch</code>. None exists. All appear as distractors.",
            "actions": []
          },
          {
            "text": "Plan mode versus direct execution as a fifteen-second test, not a philosophy.",
            "actions": []
          },
          {
            "text": "Drill all of Domain 3. Anything below 90% here is a precision problem you can fix today.",
            "actions": [
              {
                "label": "Drill Domain 3",
                "go": "practice",
                "filter": {
                  "domain": 3
                }
              }
            ]
          }
        ]
      },
      {
        "n": 3,
        "short": "Loop & decomposition",
        "title": "Agentic loop and decomposition",
        "ts": [
          "1.1",
          "1.6"
        ],
        "tasks": [
          {
            "text": "Read the Lab tab. If you are B0 on the placement axes, <b>build the loop today rather than only reading it</b> &mdash; two hours of having debugged it is worth more than the rest of this day.",
            "actions": [
              {
                "label": "Open the Lab",
                "go": "lesson",
                "slug": "agentic-loop"
              }
            ]
          },
          {
            "text": "<code>stop_reason</code> as the sole loop condition. The asymmetric appends: assistant response as <code>assistant</code>, tool results as <code>user</code>.",
            "actions": []
          },
          {
            "text": "The three named anti-patterns, and why an iteration cap is a guard rather than a condition.",
            "actions": []
          },
          {
            "text": "Prompt chaining versus dynamic decomposition, and the tell that distinguishes them. Drill 1.1 and 1.6.",
            "actions": [
              {
                "label": "Drill 1.1, 1.6",
                "go": "practice",
                "filter": {
                  "tasks": [
                    "1.1",
                    "1.6"
                  ]
                }
              }
            ]
          }
        ]
      },
      {
        "n": 4,
        "short": "Orchestration",
        "title": "Coordinators, subagents, context",
        "ts": [
          "1.2",
          "1.3"
        ],
        "tasks": [
          {
            "text": "Hub and spoke, and the three properties it buys. Why direct subagent edges are an architectural regression even when they are faster.",
            "actions": []
          },
          {
            "text": "Subagents inherit nothing. You know this from Task-tool use; make sure you know it as the guide states it.",
            "actions": []
          },
          {
            "text": "<code>allowedTools</code> must include <code>Task</code>. Parallel means several Task calls in one response.",
            "actions": []
          },
          {
            "text": "Overly narrow coordinator decomposition as a root cause &mdash; heuristic H6. When every worker succeeds and the output is still wrong, look upstream.",
            "actions": []
          },
          {
            "text": "Structured claim-to-source passing so provenance survives synthesis. Drill 1.2 and 1.3.",
            "actions": [
              {
                "label": "Drill 1.2, 1.3",
                "go": "practice",
                "filter": {
                  "tasks": [
                    "1.2",
                    "1.3"
                  ]
                }
              }
            ]
          }
        ]
      },
      {
        "n": 5,
        "short": "Hooks & sessions",
        "title": "Hooks, enforcement, sessions",
        "ts": [
          "1.4",
          "1.5",
          "1.7"
        ],
        "tasks": [
          {
            "text": "Hooks for deterministic guarantees. <code>PostToolUse</code> inbound, call interception outbound.",
            "actions": []
          },
          {
            "text": "Programmatic prerequisites gating one tool on another. Structured handoff summaries for humans without the transcript.",
            "actions": []
          },
          {
            "text": "<code>--resume</code>, <code>fork_session</code>, and the judgment call between resuming and starting fresh with an injected summary. Know where the line falls when prior results are partly stale.",
            "actions": []
          },
          {
            "text": "Drill 1.4, 1.5, 1.7. The 27% domain is now complete &mdash; check your rate on it before moving on.",
            "actions": [
              {
                "label": "Drill 1.4, 1.5, 1.7",
                "go": "practice",
                "filter": {
                  "tasks": [
                    "1.4",
                    "1.5",
                    "1.7"
                  ]
                }
              }
            ]
          }
        ]
      },
      {
        "n": 6,
        "short": "Prompt & output",
        "title": "Prompt engineering and structured output",
        "ts": [
          "4.1",
          "4.2",
          "4.3",
          "4.4",
          "4.5",
          "4.6"
        ],
        "tasks": [
          {
            "text": "Explicit categorical criteria over confidence language. False positives as a trust problem.",
            "actions": []
          },
          {
            "text": "Few-shot for inconsistency and ambiguity; two to four targeted examples.",
            "actions": []
          },
          {
            "text": "<code>tool_use</code> with schemas; the three <code>tool_choice</code> modes and what each guarantees; syntax versus semantic errors.",
            "actions": []
          },
          {
            "text": "Nullable fields against fabrication; enum plus <code>other</code> plus detail; <code>unclear</code> for ambiguity.",
            "actions": []
          },
          {
            "text": "Retry with specific errors, and the one class it cannot fix. <code>calculated_total</code> against <code>stated_total</code> for semantic checks.",
            "actions": []
          },
          {
            "text": "Message Batches API: the five facts &mdash; 50% saving, 24-hour window, no SLA, no multi-turn tool calling, <code>custom_id</code>. This is the most commonly under-learned corner of Domain 4.",
            "actions": []
          },
          {
            "text": "Independent review instances over self-review. Drill all of Domain 4.",
            "actions": [
              {
                "label": "Drill Domain 4",
                "go": "practice",
                "filter": {
                  "domain": 4
                }
              }
            ]
          }
        ]
      },
      {
        "n": 7,
        "short": "Tools, MCP, context",
        "title": "Tool design, MCP, context management",
        "ts": [
          "2.1",
          "2.2",
          "2.3",
          "2.4",
          "2.5",
          "5.1",
          "5.2",
          "5.3",
          "5.4",
          "5.5",
          "5.6"
        ],
        "tasks": [
          {
            "text": "Descriptions as the selection mechanism; splitting and renaming to kill overlap.",
            "actions": []
          },
          {
            "text": "The full error taxonomy plus <code>isRetryable</code>, and access failure versus valid empty result.",
            "actions": []
          },
          {
            "text": "Tool count and selection degradation; scoped cross-role tools for the high-frequency case.",
            "actions": []
          },
          {
            "text": "MCP scoping and <code>${ENV_VAR}</code> expansion. Resources as content catalogues. Why a well-described MCP tool loses to built-in Grep when its description is thin.",
            "actions": []
          },
          {
            "text": "Domain 5 in one pass, since you have lived most of it: case-facts blocks, output trimming, lost-in-the-middle, escalation triggers, structured propagation, scratchpads, stratified sampling, provenance and conflict annotation. Learn the formal names for things you already do.",
            "actions": []
          },
          {
            "text": "Drill all of Domain 2 and Domain 5.",
            "actions": [
              {
                "label": "Drill Domain 2 and Domain 5",
                "go": "practice",
                "filter": {
                  "tasks": [
                    "2.1",
                    "2.2",
                    "2.3",
                    "2.4",
                    "2.5",
                    "5.1",
                    "5.2",
                    "5.3",
                    "5.4",
                    "5.5",
                    "5.6"
                  ]
                }
              }
            ]
          }
        ]
      },
      {
        "n": 8,
        "short": "Mock",
        "title": "Sit the timed mock",
        "ts": [
          "all"
        ],
        "tasks": [
          {
            "text": "Restate the eight heuristics from memory first. Then the distractor tells. Then the three inventions.",
            "actions": [
              {
                "label": "Open Heuristics",
                "go": "reference",
                "section": "heuristics"
              }
            ]
          },
          {
            "text": "<b>Sit the mock timed</b> with all filters cleared. Hold to two minutes per item and commit rather than deliberate &mdash; that discipline is what you are practising as much as the content.",
            "actions": [
              {
                "label": "Start the timed mock",
                "go": "practice",
                "filter": {}
              }
            ]
          },
          {
            "text": "Review every miss the same evening if you have the appetite; you have less runway than the other tracks. For each, name the heuristic that would have caught it.",
            "actions": [
              {
                "label": "Open Heuristics",
                "go": "reference",
                "section": "heuristics"
              }
            ]
          },
          {
            "text": "Treat it as a gap-finder. It is not calibrated to the real scaled score and will not predict it.",
            "actions": []
          }
        ]
      },
      {
        "n": 9,
        "short": "Scenarios & recall",
        "title": "Scenarios, recall, logistics",
        "ts": [
          "all"
        ],
        "tasks": [
          {
            "text": "Walk all six scenarios. For each, name its domains and its most likely failure mode. Four will frame your exam.",
            "actions": [
              {
                "label": "Open Scenarios",
                "go": "reference",
                "section": "scenarios"
              }
            ]
          },
          {
            "text": "Re-drill with the &ldquo;Previously wrong&rdquo; filter until the list is short.",
            "actions": [
              {
                "label": "Drill previous misses",
                "go": "practice",
                "filter": {
                  "status": "wrong"
                }
              }
            ]
          },
          {
            "text": "Reread every place you noted disagreement with the heuristics on Day 1. Those are your residual risk.",
            "actions": [
              {
                "label": "Open Heuristics",
                "go": "reference",
                "section": "heuristics"
              }
            ]
          },
          {
            "text": "Logistics: confirm the appointment, check your photo ID matches the registration name exactly, test the proctoring software, clear the desk. Inside 24 hours a change forfeits the fee.",
            "actions": []
          },
          {
            "text": "Stop the evening before.",
            "actions": []
          }
        ]
      }
    ]
  }
};
