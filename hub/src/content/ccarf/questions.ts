// Moved once from site/index.html by scripts/migrate-site.ts. This file is now the source of truth: edit it directly.
import type { Question } from "../../data/schema";

export const questions: Question[] = [
  {
    "id": "Q01",
    "cert": "ccarf",
    "domain": 1,
    "task": "1.1",
    "scenario": 1,
    "source": "mine",
    "kind": "single",
    "stem": "Your support agent&rsquo;s loop terminates when the assistant message contains the phrase &ldquo;task complete&rdquo;. In production it sometimes stops while tool calls are still pending, and sometimes keeps looping after the work is finished. What is the correct control-flow fix?",
    "options": [
      "Continue the loop while <code>stop_reason</code> is <code>tool_use</code> and terminate when it is <code>end_turn</code>.",
      "Add a maximum iteration cap of 10 and treat reaching it as completion.",
      "Broaden the phrase matching to cover more completion wordings the model tends to use.",
      "Require the model to emit a sentinel JSON object when it is done, and parse for that."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "The API already reports intent explicitly. <code>stop_reason</code> is the only reliable termination signal, and reading it removes both failure modes at once.",
      "An iteration cap is a safety net against runaway loops, never the primary stopping mechanism. It will cut off long legitimate work and still mis-handle short work.",
      "This doubles down on the anti-pattern. Parsing natural language for control flow is unreliable no matter how many phrases you enumerate.",
      "Still text parsing, and it now depends on the model reliably remembering an output convention. The transport already tells you the answer for free."
    ]
  },
  {
    "id": "Q02",
    "cert": "ccarf",
    "domain": 1,
    "task": "1.1",
    "scenario": 3,
    "source": "mine",
    "kind": "multi",
    "stem": "Which two statements about the agentic loop are correct? Select two.",
    "options": [
      "Tool results are appended to the conversation history so the model can reason about them on the next iteration.",
      "The loop continues for as long as the response&rsquo;s <code>stop_reason</code> is <code>tool_use</code>.",
      "Subagents automatically inherit the coordinator&rsquo;s conversation history.",
      "The presence of assistant text content indicates the model has finished its work.",
      "An arbitrary iteration cap is the recommended way to terminate an agentic loop."
    ],
    "correct": [
      0,
      1
    ],
    "explanations": [
      "Correct. Results must re-enter context, or the model has no way to incorporate what the tools returned.",
      "Correct. This is the loop condition.",
      "They do not. Subagent context must be provided explicitly in the prompt. This is one of the most heavily tested facts in Domain 1.",
      "An explicit anti-pattern. A model can emit text alongside tool calls; text is not a completion signal.",
      "Named in the guide as an anti-pattern when used as the primary mechanism."
    ]
  },
  {
    "id": "Q03",
    "cert": "ccarf",
    "domain": 1,
    "task": "1.2",
    "scenario": 3,
    "source": "mine",
    "kind": "single",
    "stem": "Your research system is asked about the impact of AI on creative industries. The search subagent returns good sources, the analysis subagent summarises them correctly, and synthesis reads coherently &mdash; but the report only covers visual art. Coordinator logs show it created three subtasks: AI in digital art, AI in graphic design, AI in photography. What is the root cause?",
    "options": [
      "The coordinator decomposed the topic too narrowly, so the subagent assignments never covered music, writing or film.",
      "The search subagent&rsquo;s queries were not broad enough and need expanding.",
      "The synthesis agent lacks instructions to detect coverage gaps in what it receives.",
      "The analysis subagent filtered out non-visual sources through over-restrictive relevance criteria."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Every worker executed its assignment correctly. The defect is in the assignment. When subagents all succeed but output is wrong, look at the decomposition first.",
      "The search agent searched what it was told to search. Widening its queries cannot recover subtopics it was never assigned.",
      "Gap detection is a useful safety net, but it addresses a symptom. Nothing about music ever entered the pipeline for synthesis to notice missing.",
      "Contradicted by the logs, which show the omission happening upstream at decomposition."
    ]
  },
  {
    "id": "Q04",
    "cert": "ccarf",
    "domain": 1,
    "task": "1.2",
    "scenario": 3,
    "source": "mine",
    "kind": "single",
    "stem": "To cut latency, an engineer proposes letting the search subagent hand results straight to the synthesis subagent instead of routing through the coordinator. What is the strongest architectural objection?",
    "options": [
      "Routing through the coordinator is what provides observability, consistent error handling and controlled information flow; direct edges give those up.",
      "Subagents are technically incapable of passing data between themselves.",
      "It would prevent the system from ever running subagents in parallel.",
      "Latency is not a legitimate concern in a research pipeline."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Hub-and-spoke exists for exactly these three properties. Once workers talk to each other, failures and data flow become invisible to the component responsible for recovery.",
      "The objection is architectural, not a capability limit. Framing it as impossible is simply wrong.",
      "Unrelated. Parallelism comes from emitting several Task calls in one coordinator response and is orthogonal to who talks to whom.",
      "It is legitimate &mdash; the guide has a whole item about reducing verification round trips. The problem is the proposed remedy, not the goal."
    ]
  },
  {
    "id": "Q05",
    "cert": "ccarf",
    "domain": 1,
    "task": "1.3",
    "scenario": 3,
    "source": "mine",
    "kind": "single",
    "stem": "Your synthesis subagent produces fluent reports with no working citations, even though the search subagent collected source URLs and the analysis subagent recorded document names. What change fixes this?",
    "options": [
      "Pass the upstream findings into the synthesis prompt in a structured form that separates each claim from its source URL, document name and page reference.",
      "Instruct the synthesis agent more firmly to always include citations for its claims.",
      "Move to a model with a larger context window so nothing is dropped.",
      "Have the synthesis agent re-run the searches itself so it sees the URLs first-hand."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Subagents share no memory. Provenance survives only if it is explicitly carried in the prompt as structured data, with content and metadata kept distinct.",
      "It cannot cite what it was never given. No amount of instruction recovers information absent from context.",
      "Nothing is being dropped for want of room. The attribution data never reached the agent at all.",
      "Duplicates work, adds latency, and over-provisions the synthesis agent with tools outside its specialisation."
    ]
  },
  {
    "id": "Q06",
    "cert": "ccarf",
    "domain": 1,
    "task": "1.3",
    "scenario": 4,
    "source": "mine",
    "kind": "multi",
    "stem": "Your coordinator agent silently fails to delegate and instead attempts every task itself. Which two things must be true for delegation to work as intended? Select two.",
    "options": [
      "The coordinator&rsquo;s <code>allowedTools</code> must include <code>Task</code>.",
      "Parallel subagents are spawned by emitting multiple <code>Task</code> calls within a single coordinator response.",
      "A subagent inherits the coordinator&rsquo;s conversation history automatically, so its prompt can stay brief.",
      "Subagents must be given the coordinator&rsquo;s full tool set so they can handle anything.",
      "An <code>AgentDefinition</code> must omit a system prompt so the subagent stays flexible."
    ],
    "correct": [
      0,
      1
    ],
    "explanations": [
      "Correct. <code>Task</code> is the spawning mechanism; without it in the allow-list there is no way to invoke a subagent.",
      "Correct. Spreading them across separate turns serialises the work and loses the latency benefit.",
      "False, and one of the most consequential facts in Domain 1. Subagents share no memory and inherit nothing &mdash; context must be explicit in the prompt.",
      "The opposite of least privilege. Broad tool access degrades selection reliability and invites cross-specialisation misuse.",
      "Invented constraint. Agent definitions carry descriptions, system prompts and tool restrictions."
    ]
  },
  {
    "id": "Q07",
    "cert": "ccarf",
    "domain": 1,
    "task": "1.4",
    "scenario": 1,
    "source": "mine",
    "kind": "single",
    "stem": "Telemetry shows that in roughly one in eight conversations your agent calls <code>process_refund</code> without ever having called <code>get_customer</code>, occasionally refunding the wrong account. What most effectively fixes this?",
    "options": [
      "Add a programmatic prerequisite that blocks <code>lookup_order</code> and <code>process_refund</code> until <code>get_customer</code> has returned a verified customer id.",
      "State in the system prompt that customer verification is mandatory before any order operation.",
      "Add few-shot examples showing the agent verifying identity first even when the customer volunteers an order number.",
      "Add a classifier that inspects each request and enables only the tools appropriate to it."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Identity before money is a rule that must hold every time. Only programmatic enforcement gives a deterministic guarantee; this is heuristic H1 in its purest form.",
      "Prompt compliance is probabilistic. A one-in-eight failure rate on financial operations is not acceptable, and instructions cannot drive it to zero.",
      "Improves the odds without guaranteeing anything. Same category of fix as the system prompt, same ceiling.",
      "Addresses which tools are available, not the order they are called in. The failure here is sequencing."
    ]
  },
  {
    "id": "Q08",
    "cert": "ccarf",
    "domain": 1,
    "task": "1.4",
    "scenario": 1,
    "source": "mine",
    "kind": "single",
    "stem": "When your agent escalates mid-conversation, human agents complain they have to re-interview the customer from scratch because they cannot see the transcript. What should the escalation produce?",
    "options": [
      "A structured handoff summary carrying the verified customer id, the root cause established, the amount in question and a recommended action.",
      "A full verbatim dump of the conversation transcript appended to the ticket.",
      "A confidence score indicating how uncertain the agent was when it escalated.",
      "A link to the customer record so the human can look up whatever they need."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "The receiving human has no conversation context. A structured summary of facts and a recommendation is what makes the handoff usable.",
      "Shifts the re-interviewing cost to reading cost. The human still has to reconstruct the facts and the recommendation themselves.",
      "Self-reported confidence is not a reliable signal (H3), and it tells the human nothing actionable about the case.",
      "Available anyway, and it discards the investigation the agent already performed."
    ]
  },
  {
    "id": "Q09",
    "cert": "ccarf",
    "domain": 1,
    "task": "1.5",
    "scenario": 1,
    "source": "mine",
    "kind": "single",
    "stem": "Three MCP tools return timestamps three different ways: Unix epoch seconds, ISO 8601 strings, and an integer status code with a separate date field. The agent frequently reasons incorrectly about ordering and recency. What is the cleanest fix?",
    "options": [
      "A <code>PostToolUse</code> hook that normalises the heterogeneous formats into one representation before the model sees the results.",
      "Describe each tool&rsquo;s timestamp format in detail in its tool description.",
      "Instruct the model in the system prompt to convert all timestamps before comparing them.",
      "Rewrite the three backend services so they agree on a format."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "This is the textbook use for <code>PostToolUse</code>: intercept and transform tool output on its way into context, so the model never has to reconcile formats itself.",
      "Tool descriptions drive selection, not result interpretation. The model would still be doing format arithmetic on every call, unreliably.",
      "Probabilistic where a deterministic transform is available and trivial. H1.",
      "Sometimes right in the long run, but it is the heaviest possible change and the guide points at hooks as the normalisation layer for exactly this."
    ]
  },
  {
    "id": "Q10",
    "cert": "ccarf",
    "domain": 1,
    "task": "1.5",
    "scenario": 1,
    "source": "mine",
    "kind": "single",
    "stem": "Company policy is that no automated refund may exceed $500 &mdash; anything higher must go to a human. Compliance requires this to hold without exception. How do you implement it?",
    "options": [
      "A hook that intercepts outgoing tool calls, blocks any <code>process_refund</code> above the threshold, and redirects to the escalation workflow.",
      "A strongly worded system prompt rule stating the $500 limit.",
      "A <code>PostToolUse</code> hook that reverses any refund it finds was over the limit.",
      "Few-shot examples demonstrating correct refusals at various amounts."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "A guaranteed business rule needs interception at the call boundary. The hook cannot be talked out of it, and the redirect keeps the customer journey intact.",
      "Non-zero failure rate against a compliance requirement. Exactly the trade the guide asks you to refuse.",
      "Wrong side of the call: the refund has already happened. Prevention, not compensation.",
      "Improves likelihood only. Also brittle at boundary values it has not seen."
    ]
  },
  {
    "id": "Q11",
    "cert": "ccarf",
    "domain": 1,
    "task": "1.6",
    "scenario": 4,
    "source": "mine",
    "kind": "single",
    "stem": "You are asked to add comprehensive tests to a large legacy codebase with no test suite and no documentation. Which decomposition strategy fits?",
    "options": [
      "Dynamic decomposition: map the structure first, identify high-impact areas, then build a prioritised plan that adapts as dependencies surface.",
      "A fixed sequential pipeline that walks every directory alphabetically and writes tests per file.",
      "One prompt containing the whole instruction, relying on a large context window to hold the codebase.",
      "Prompt chaining with a fixed set of passes decided before any exploration."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Open-ended investigation where the right subtasks are not knowable up front. The plan has to be generated from what each step discovers.",
      "Predetermined ordering on a task whose shape is unknown. It spends equal effort on trivial and critical code and misses dependency structure entirely.",
      "Attention dilution (H7), and it forgoes decomposition altogether.",
      "Prompt chaining suits predictable multi-aspect work. Here you cannot name the passes before you have looked."
    ]
  },
  {
    "id": "Q12",
    "cert": "ccarf",
    "domain": 1,
    "task": "1.6",
    "scenario": 5,
    "source": "mine",
    "kind": "single",
    "stem": "Your CI reviewer must check every pull request for the same four concerns: security, error handling, test coverage and naming conventions. The set never varies. Which pattern fits?",
    "options": [
      "Prompt chaining: a fixed sequence of focused passes, one per concern, then a cross-file integration pass.",
      "Dynamic decomposition that generates subtasks from what each step finds.",
      "A single prompt asking for all four concerns across all files at once.",
      "Four independent agents with no coordination, results concatenated."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "The aspects are known in advance and stable, which is precisely when a fixed chain beats adaptive decomposition. Focused passes also avoid attention dilution.",
      "Adds nondeterminism and cost to a workflow whose structure is already fully known. Reserve adaptive planning for open-ended tasks.",
      "The setup that produces inconsistent depth and contradictory findings. H7.",
      "Loses the cross-file integration pass, and concatenation without synthesis produces duplicate and conflicting findings."
    ]
  },
  {
    "id": "Q13",
    "cert": "ccarf",
    "domain": 1,
    "task": "1.7",
    "scenario": 4,
    "source": "mine",
    "kind": "single",
    "stem": "You resume a named session from yesterday to continue a refactor. Overnight, a teammate rewrote six of the files your earlier analysis was based on. What is the most reliable way to proceed?",
    "options": [
      "Start a fresh session and inject a structured summary of the still-valid findings, rather than resuming on top of stale tool results.",
      "Resume the session and let the agent rediscover the changes as it works.",
      "Resume the session and tell the agent exactly which files changed so it re-analyses those.",
      "Use <code>fork_session</code> to branch from yesterday&rsquo;s analysis."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "When prior tool results no longer describe reality, resumption carries confident wrong context. A fresh session seeded with a curated summary is the reliable option.",
      "The agent has no reason to re-read files it believes it already knows. Stale context is not self-correcting.",
      "A legitimate technique &mdash; and the right answer when prior context is <em>mostly</em> valid. With six files rewritten, the baseline is too degraded; prefer a fresh start. Know both cases and where the line falls.",
      "Forking preserves the stale baseline into the branch. Forking is for exploring divergent approaches from a <em>valid</em> shared baseline."
    ]
  },
  {
    "id": "Q14",
    "cert": "ccarf",
    "domain": 1,
    "task": "1.7",
    "scenario": 4,
    "source": "mine",
    "kind": "single",
    "stem": "After an expensive codebase analysis, you want to compare two different refactoring strategies without repeating the analysis and without letting the two explorations contaminate each other. What do you use?",
    "options": [
      "<code>fork_session</code>, to create two independent branches from the shared analysis baseline.",
      "<code>--resume</code> with the same session name for each strategy in turn.",
      "<code>/compact</code> between the two explorations.",
      "Two fresh sessions, each re-running the analysis."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Exactly the described purpose: divergent exploration from one valid baseline, with no cross-talk between branches.",
      "Sequential resumption of one session means the first exploration is in context while you do the second. That is the contamination you are trying to avoid.",
      "Compaction reduces context size; it does not create isolated branches, and it may discard analysis you paid for.",
      "Achieves isolation by paying for the expensive analysis twice, which the question rules out."
    ]
  },
  {
    "id": "Q15",
    "cert": "ccarf",
    "domain": 2,
    "task": "2.1",
    "scenario": 1,
    "source": "mine",
    "kind": "single",
    "stem": "Your agent often calls <code>get_customer</code> when a user asks about an order. Both tools accept similar identifier formats and each description is a single short sentence. What is the most effective first step?",
    "options": [
      "Expand each description to cover the input formats it accepts, example queries, edge cases, and when to use it rather than the similar tool.",
      "Add five to eight few-shot examples showing order queries routing to <code>lookup_order</code>.",
      "Add a routing layer that inspects the user text and pre-selects the tool from keyword patterns.",
      "Merge both into one <code>lookup_entity</code> tool that decides internally which backend to query."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Descriptions are the primary mechanism the model uses to select tools. Minimal descriptions are the root cause here, and fixing them is low-effort and high-leverage. H2.",
      "Adds token overhead on every request and treats the symptom. The model still lacks the information it needs to generalise to unseen phrasings.",
      "Over-engineered, and it discards the language understanding you are paying for. Classic distractor shape.",
      "A defensible architecture eventually, but far more work than a &ldquo;first step&rdquo; warrants when the immediate cause is thin descriptions."
    ]
  },
  {
    "id": "Q16",
    "cert": "ccarf",
    "domain": 2,
    "task": "2.1",
    "scenario": 3,
    "source": "mine",
    "kind": "single",
    "stem": "Your research system exposes <code>analyze_content</code> and <code>analyze_document</code> with near-identical descriptions. The agent picks between them essentially at random. Beyond rewriting descriptions, what is the sound structural fix?",
    "options": [
      "Rename and re-scope them into purpose-specific tools with defined input and output contracts &mdash; for example <code>extract_web_results</code>, <code>extract_data_points</code> and <code>verify_claim_against_source</code>.",
      "Keep both tools and add a system prompt rule about which to prefer.",
      "Remove one of the two tools and let the survivor handle everything.",
      "Set <code>tool_choice</code> to force <code>analyze_document</code> whenever a document is present."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Eliminating functional overlap removes the ambiguity at its source. Names and contracts carry meaning; two generic analysers competing for the same intent cannot be disambiguated by prose alone.",
      "Leaves the overlap in place. Worse, keyword-sensitive prompt wording can create unintended tool associations that override good descriptions.",
      "Consolidating into a single generic tool moves the ambiguity inside the tool, where the agent can no longer express intent through its choice.",
      "Forced selection is for guaranteeing a specific call happens, not for papering over an interface design problem."
    ]
  },
  {
    "id": "Q17",
    "cert": "ccarf",
    "domain": 2,
    "task": "2.2",
    "scenario": 1,
    "source": "mine",
    "kind": "single",
    "stem": "Every MCP tool in your integration returns the string &ldquo;Operation failed&rdquo; on any error. The agent retries permanently-failing calls, and gives up on transient ones. What should the tools return instead?",
    "options": [
      "Structured error metadata: an <code>errorCategory</code> of transient, validation, business or permission, an <code>isRetryable</code> boolean, and a human-readable description.",
      "The raw exception and stack trace from the backend service.",
      "A uniform failure shape, for consistency, with details written to server logs.",
      "Nothing &mdash; return an empty successful result so the agent moves on gracefully."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "The agent can only make good recovery decisions if failures are distinguishable. Category plus retryability is the minimum useful signal, and it stops both wasted retries and premature surrender.",
      "Leaks internals into context, burns tokens, and still leaves the agent to infer retryability by guesswork.",
      "Consistency of shape is fine; uniformity of <em>meaning</em> is the bug. Detail in logs is invisible to the agent that has to recover.",
      "Suppressing failure as success is called out as an anti-pattern. It guarantees silent incorrectness downstream. H4."
    ]
  },
  {
    "id": "Q18",
    "cert": "ccarf",
    "domain": 2,
    "task": "2.2",
    "scenario": 3,
    "source": "mine",
    "kind": "multi",
    "stem": "Which two distinctions genuinely matter when designing MCP error responses? Select two.",
    "options": [
      "Retryable versus non-retryable, so the agent does not waste attempts on permanent failures.",
      "An access failure versus a valid empty result.",
      "Errors from MCP tools versus errors from built-in tools.",
      "Errors that occur early in a conversation versus late.",
      "Whether the error message is under a certain token length."
    ],
    "correct": [
      0,
      1
    ],
    "explanations": [
      "Correct. Structured retryability metadata is what prevents pointless retry loops.",
      "Correct, and easy to miss. &ldquo;The search broke&rdquo; and &ldquo;the search worked and found nothing&rdquo; demand opposite responses.",
      "Not a meaningful axis for recovery design. What matters is the nature of the failure, not which tool surface produced it.",
      "Position does not determine recovery strategy.",
      "Brevity is nice; it is not a design distinction the guide draws."
    ]
  },
  {
    "id": "Q19",
    "cert": "ccarf",
    "domain": 2,
    "task": "2.3",
    "scenario": 4,
    "source": "mine",
    "kind": "single",
    "stem": "A single productivity agent has accumulated 18 tools. Tool selection accuracy has visibly degraded, and the agent sometimes uses tools well outside the task at hand. What is the principled fix?",
    "options": [
      "Scope each agent to the four or five tools its role actually needs, splitting the work across specialised agents where necessary.",
      "Write longer, more emphatic descriptions for all 18 tools.",
      "Set <code>tool_choice</code> to <code>any</code> so the model always commits to a tool.",
      "Keep all 18 and add a preamble listing which tools apply to which task type."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Selection reliability falls as the decision space grows, and agents holding tools outside their specialisation tend to misuse them. Scoping addresses both.",
      "Better descriptions help, but they cannot undo the combinatorial cost of an 18-way choice on every turn.",
      "Forces a call to happen; does nothing about choosing the right one among 18.",
      "Restates the problem inside the prompt and consumes context on every request."
    ]
  },
  {
    "id": "Q20",
    "cert": "ccarf",
    "domain": 2,
    "task": "2.3",
    "scenario": 3,
    "source": "mine",
    "kind": "single",
    "stem": "Your synthesis agent needs facts verified mid-pass. Today it returns to the coordinator, which calls the search agent, then re-invokes synthesis &mdash; adding two to three round trips and 40% latency. Measurement shows 85% of these are simple lookups of dates, names and figures; 15% need real investigation.",
    "options": [
      "Give the synthesis agent a scoped <code>verify_fact</code> tool for the simple case, and keep routing complex verification through the coordinator.",
      "Give the synthesis agent the full web search tool set so it never needs a round trip.",
      "Have synthesis batch all verification needs and send them to the coordinator at the end of its pass.",
      "Have the search agent cache extra surrounding context during initial research in anticipation."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Least privilege applied with judgment: the common case gets a narrow dedicated tool, the rare hard case keeps the coordination that makes it tractable. H5.",
      "Over-provisions an agent outside its specialisation &mdash; the exact condition under which agents misuse tools.",
      "Creates a blocking dependency: later synthesis steps often depend on facts verified earlier.",
      "Speculative caching of something you cannot predict. A recurring distractor pattern."
    ]
  },
  {
    "id": "Q21",
    "cert": "ccarf",
    "domain": 2,
    "task": "2.4",
    "scenario": 4,
    "source": "mine",
    "kind": "single",
    "stem": "Your team needs a GitHub MCP server available to every developer on clone, authenticating with a token that must not be committed. How do you configure it?",
    "options": [
      "In a project-scoped <code>.mcp.json</code>, using environment variable expansion such as <code>${GITHUB_TOKEN}</code> for the credential.",
      "In each developer&rsquo;s <code>~/.claude.json</code>, with the token inline.",
      "In <code>.mcp.json</code> with the token committed but the repository kept private.",
      "In <code>CLAUDE.md</code>, documenting the server so Claude can connect to it."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Project scope makes it shared and version-controlled; variable expansion keeps the secret out of the repository. Both halves of the requirement, one mechanism.",
      "User scope is for personal and experimental servers &mdash; it is not shared via version control, so every developer would configure it by hand.",
      "A private repository is not a secret store. Committed credentials leak through forks, clones, CI logs and history.",
      "CLAUDE.md carries instructions and context, not server configuration."
    ]
  },
  {
    "id": "Q22",
    "cert": "ccarf",
    "domain": 2,
    "task": "2.4",
    "scenario": 4,
    "source": "mine",
    "kind": "single",
    "stem": "You have added an MCP server whose <code>search_codebase</code> tool is faster and semantically smarter than plain text search, but the agent still reaches for the built-in <code>Grep</code> almost every time. What is the fix?",
    "options": [
      "Enhance the MCP tool&rsquo;s description so it explains its capabilities and outputs in detail, and when it should be preferred.",
      "Remove <code>Grep</code> from the agent&rsquo;s allowed tools.",
      "Add a system prompt line instructing the agent to always prefer MCP tools.",
      "Expose the same functionality as an MCP resource instead of a tool."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Selection is description-driven. A built-in with a clear well-known purpose will out-compete a vaguely described MCP tool every time.",
      "Blunt, and it removes a genuinely useful tool for cases the MCP server does not serve well. Fix the information before removing the option.",
      "Crude and over-broad; it would misroute cases where a built-in genuinely is the better choice.",
      "Resources expose content catalogues; they are not a substitute for an action tool, and this does not address the selection problem."
    ]
  },
  {
    "id": "Q23",
    "cert": "ccarf",
    "domain": 2,
    "task": "2.5",
    "scenario": 4,
    "source": "mine",
    "kind": "single",
    "stem": "You need to understand how a legacy payment module works before changing it. What is the efficient tool sequence?",
    "options": [
      "<code>Grep</code> to find entry points and callers, then <code>Read</code> to follow imports and trace the flow from there.",
      "<code>Read</code> every file in the module directory first so nothing is missed.",
      "<code>Glob</code> for the file names, then <code>Write</code> a summary of each.",
      "<code>Bash</code> with a chain of <code>find</code> and <code>sed</code> to dump everything to one file, then read that."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Build understanding incrementally: search content to locate the interesting places, then read outward along the dependency edges. Reading everything up front floods context for no benefit.",
      "Exhausts context on code you do not need and produces the degradation the guide warns about in extended exploration.",
      "<code>Glob</code> matches paths, not contents, so it cannot find callers; and writing summaries of files you have not analysed is premature.",
      "Reinvents the search tools, loses structure, and still ends in reading everything at once."
    ]
  },
  {
    "id": "Q24",
    "cert": "ccarf",
    "domain": 3,
    "task": "3.1",
    "scenario": 2,
    "source": "mine",
    "kind": "single",
    "stem": "You documented your team&rsquo;s testing conventions so Claude Code would follow them, and it works perfectly for you. A new team member clones the repository and Claude ignores every convention. What is the most likely cause?",
    "options": [
      "The conventions are in your user-level <code>~/.claude/CLAUDE.md</code>, which is personal and never travels through version control.",
      "The new member needs to run <code>/memory</code> before the file loads.",
      "Their editor has cached an older version of the configuration.",
      "<code>CLAUDE.md</code> only applies to files in the same directory as itself."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "User-level configuration applies only to you. Team-wide standards belong at project level, in the repository, so they arrive with the clone.",
      "<code>/memory</code> is a diagnostic that shows which memory files are loaded. It is how you would <em>find</em> this bug, not a step that fixes it.",
      "Not a real mechanism here, and it would not explain conventions being absent rather than stale.",
      "Directory-level files do scope that way, but a project-root file applies project-wide. The scoping issue here is user versus project, not directory."
    ]
  },
  {
    "id": "Q25",
    "cert": "ccarf",
    "domain": 3,
    "task": "3.1",
    "scenario": 2,
    "source": "mine",
    "kind": "single",
    "stem": "Your project&rsquo;s <code>CLAUDE.md</code> has grown past a thousand lines covering testing, API conventions, deployment and style. It is unwieldy to edit and behaviour has become inconsistent. What is the best reorganisation?",
    "options": [
      "Split it into focused topic files under <code>.claude/rules/</code>, and use <code>@import</code> where a package needs specific standards included.",
      "Move most of it into a <code>docs/</code> folder and reference it in prose.",
      "Leave it as one file but add a table of contents at the top.",
      "Convert the whole thing into a skill in <code>.claude/skills/</code>."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Both mechanisms the guide names for modularity: topic files replace the monolith, and <code>@import</code> pulls in only what a given package needs. <code>/memory</code> then verifies what actually loaded.",
      "Claude does not load arbitrary documentation as instructions. Context that must apply has to be in a mechanism that loads it.",
      "Navigation aid for humans; changes nothing about how much irrelevant context loads on every request.",
      "Skills are invoked on demand for task-specific workflows. Always-applicable universal standards belong in CLAUDE.md or rules."
    ]
  },
  {
    "id": "Q26",
    "cert": "ccarf",
    "domain": 3,
    "task": "3.2",
    "scenario": 2,
    "source": "mine",
    "kind": "single",
    "stem": "You want a <code>/review</code> command running your team&rsquo;s review checklist to be available to every developer as soon as they pull the repository. Where does it go?",
    "options": [
      "<code>.claude/commands/</code> in the project repository.",
      "<code>~/.claude/commands/</code> in each developer&rsquo;s home directory.",
      "A <code>commands</code> array in <code>.claude/config.json</code>.",
      "Defined inside the project&rsquo;s root <code>CLAUDE.md</code>."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Project-scoped commands are version-controlled and available to everyone on clone or pull. This is the mechanism for team-wide commands.",
      "User scope. Personal, not shared &mdash; every developer would have to create it themselves.",
      "<strong>This file does not exist.</strong> Invented configuration surface is a recurring distractor &mdash; learn the real paths cold.",
      "CLAUDE.md carries instructions and context. It is not where command definitions live."
    ]
  },
  {
    "id": "Q27",
    "cert": "ccarf",
    "domain": 3,
    "task": "3.2",
    "scenario": 2,
    "source": "mine",
    "kind": "single",
    "stem": "You have written a codebase-analysis skill that emits several thousand lines of exploration output. Useful, but it swamps the main conversation and pushes out context you still need. Which frontmatter option addresses this?",
    "options": [
      "<code>context: fork</code>, so the skill runs in an isolated subagent context and only its result returns.",
      "<code>allowed-tools</code>, restricted to read-only tools.",
      "<code>argument-hint</code>, to prompt for a narrower scope.",
      "Run it with <code>/compact</code> immediately afterwards."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Purpose-built for verbose or exploratory skills: the noise stays in the fork, the conclusion comes back.",
      "Restricts what the skill may do, which is a safety control. It has no effect on how much output lands in your conversation.",
      "Prompts the developer for parameters when they invoke without arguments. Unrelated to output volume.",
      "Reactive cleanup after the damage; compaction is lossy and you may lose context you wanted. Prevent the pollution instead."
    ]
  },
  {
    "id": "Q28",
    "cert": "ccarf",
    "domain": 3,
    "task": "3.3",
    "scenario": 2,
    "source": "mine",
    "kind": "single",
    "stem": "Your test files sit beside the code they test &mdash; <code>Button.test.tsx</code> next to <code>Button.tsx</code> &mdash; scattered across the whole tree. You want one set of testing conventions applied automatically whenever any test file is edited, wherever it lives.",
    "options": [
      "Rule files in <code>.claude/rules/</code> with YAML frontmatter <code>paths</code> globs such as <code>**/*.test.tsx</code>.",
      "A <code>CLAUDE.md</code> in every directory that contains test files.",
      "All conventions in the root <code>CLAUDE.md</code> under a testing heading, relying on Claude to apply the right section.",
      "A skill per code type holding the relevant conventions in its SKILL.md."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Glob path-scoping applies conventions by file type regardless of directory, and loads them only when a matching file is being edited &mdash; so irrelevant context stays out.",
      "Directory-bound, so it means dozens of duplicated files that drift apart. Poor fit for conventions spread across a tree.",
      "Depends on inference rather than explicit matching, and loads every convention on every request.",
      "Skills need invoking, or Claude choosing to load them. The requirement here is automatic application based on the path."
    ]
  },
  {
    "id": "Q29",
    "cert": "ccarf",
    "domain": 3,
    "task": "3.3",
    "scenario": 2,
    "source": "mine",
    "kind": "multi",
    "stem": "Which two are genuine advantages of path-scoped <code>.claude/rules/</code> files over directory-level <code>CLAUDE.md</code> files? Select two.",
    "options": [
      "Conventions can follow a file type across many directories with one rule.",
      "Rules load only when a matching file is being edited, reducing irrelevant context and token use.",
      "Rules override user-level configuration, which directory files cannot.",
      "Rules can execute shell commands when they load.",
      "Rules are the only mechanism version-controlled with the repository."
    ],
    "correct": [
      0,
      1
    ],
    "explanations": [
      "Correct. The glob is not bound to a location, so files of a kind scattered through the tree share one definition.",
      "Correct. Conditional activation is the second half of the benefit.",
      "Not a documented precedence claim. Do not invent hierarchy rules.",
      "Fabricated capability. Rules carry conventions, not executable hooks.",
      "Project-level <code>CLAUDE.md</code>, commands and skills are all version-controlled too."
    ]
  },
  {
    "id": "Q30",
    "cert": "ccarf",
    "domain": 3,
    "task": "3.4",
    "scenario": 2,
    "source": "mine",
    "kind": "single",
    "stem": "You have been asked to migrate the codebase off a deprecated HTTP library. It touches roughly 45 files, two candidate replacements have different concurrency models, and one requires an infrastructure change. How should you work?",
    "options": [
      "Plan mode, to explore the codebase and dependencies and settle the approach before making any change.",
      "Direct execution, with very detailed up-front instructions on how the migration should go.",
      "Direct execution, switching to plan mode only if unexpected complexity appears.",
      "Direct execution file by file, letting the right pattern emerge from the work."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Large-scale change, multiple valid approaches, architectural consequences. Plan mode exists for exactly this shape, and it prevents the expensive rework that late discovery causes.",
      "Assumes you already know the right approach. The two candidates have not been evaluated against the actual code yet.",
      "The complexity is stated in the requirements, not hypothetical. There is nothing to wait and see about.",
      "Risks discovering a blocking incompatibility after 30 files are converted."
    ]
  },
  {
    "id": "Q31",
    "cert": "ccarf",
    "domain": 3,
    "task": "3.4",
    "scenario": 2,
    "source": "mine",
    "kind": "single",
    "stem": "A stack trace points at one function: a date comparison throws when the optional <code>expiresAt</code> field is null. The fix is a single conditional in a single file. How should you proceed?",
    "options": [
      "Direct execution &mdash; the scope is clear, well understood and confined to one place.",
      "Plan mode, because every change benefits from planning first.",
      "Plan mode, to check whether other call sites share the bug.",
      "Delegate it to an Explore subagent first."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Plan mode earns its overhead on architectural and multi-approach work. Using it for a one-line guarded conditional is process for its own sake. H8: match the mechanism to the scope.",
      "Ceremony scaling with habit rather than complexity. The guide is explicit that direct execution suits simple well-scoped changes.",
      "Tempting, but a <code>Grep</code> answers that in seconds inside direct execution. Do not reach for the mode to justify one search.",
      "Explore isolates verbose discovery. There is nothing to discover &mdash; the stack trace already names the line."
    ]
  },
  {
    "id": "Q32",
    "cert": "ccarf",
    "domain": 3,
    "task": "3.5",
    "scenario": 2,
    "source": "mine",
    "kind": "single",
    "stem": "You have described a data transformation in prose three times and got three different interpretations of how edge cases should be handled. What works best?",
    "options": [
      "Give two or three concrete input and output examples covering the edge cases you care about.",
      "Rewrite the prose description with more precision and detail.",
      "Ask Claude to restate its understanding before implementing.",
      "Write the implementation yourself and ask for a review."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Concrete examples are the most effective way to communicate an expected transformation when prose is being read inconsistently. They pin down exactly the cases prose leaves open.",
      "A fourth attempt at the technique that has already failed three times. When description is the problem, demonstration is the fix.",
      "Useful for surfacing unknowns &mdash; that is the interview pattern &mdash; but here you already know what you want. Just show it.",
      "Abandons the task rather than solving the communication problem."
    ]
  },
  {
    "id": "Q33",
    "cert": "ccarf",
    "domain": 3,
    "task": "3.6",
    "scenario": 5,
    "source": "mine",
    "kind": "single",
    "stem": "Your CI job runs <code>claude &quot;Review this pull request for security issues&quot;</code> and hangs forever. Logs show Claude Code waiting on interactive input. What is the fix?",
    "options": [
      "Add the <code>-p</code> (or <code>--print</code>) flag: <code>claude -p &quot;Review this...&quot;</code>",
      "Set <code>CLAUDE_HEADLESS=true</code> before the command.",
      "Add the <code>--batch</code> flag.",
      "Redirect stdin from <code>/dev/null</code>."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "<code>-p</code> is the documented non-interactive mode: it processes the prompt, writes the result to stdout and exits. Precisely what a pipeline needs.",
      "<strong>This environment variable does not exist.</strong> One of the three invented-surface distractors worth memorising.",
      "<strong>No such flag.</strong> Do not confuse it with the Message Batches API, which is an API feature, not a CLI mode.",
      "A Unix workaround that may stop the hang without engaging the intended non-interactive path. The tool has a flag for this."
    ]
  },
  {
    "id": "Q34",
    "cert": "ccarf",
    "domain": 3,
    "task": "3.6",
    "scenario": 5,
    "source": "mine",
    "kind": "single",
    "stem": "You want your CI reviewer&rsquo;s findings posted as inline pull request comments by a script. What produces reliably parseable output?",
    "options": [
      "<code>--output-format json</code> together with <code>--json-schema</code> to constrain the shape the findings come back in.",
      "Ask for markdown in the prompt and parse the headings with a regular expression.",
      "<code>--output-format json</code> alone, then validate the result in the script.",
      "Have Claude Code write the comments directly through the GitHub API using <code>Bash</code>."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Machine-parseable and schema-constrained, which is what a posting script needs. Pair it with project context in CLAUDE.md so the findings themselves are worth posting.",
      "Text parsing where a structured output mechanism exists. Formatting drifts and the regex silently breaks.",
      "Half right. Without a schema you get valid JSON of unpredictable shape, and validation failures leave you nothing to post.",
      "Couples review to posting, makes failures harder to diagnose, and skips the structured-output mechanism the question is about."
    ]
  },
  {
    "id": "Q35",
    "cert": "ccarf",
    "domain": 4,
    "task": "4.1",
    "scenario": 5,
    "source": "mine",
    "kind": "single",
    "stem": "Your automated reviewer flags too many non-issues. You have already added &ldquo;be conservative&rdquo; and &ldquo;only report high-confidence findings&rdquo; to the prompt, with no measurable improvement. What actually works?",
    "options": [
      "Replace the confidence language with explicit categorical criteria &mdash; which classes of issue to report and which to skip, stated concretely.",
      "Ask the model to attach a confidence score and drop anything below a threshold.",
      "Lower the temperature so the model is more cautious.",
      "Run the review twice and keep only findings that appear both times."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Vague calibration language does not improve precision. Specific criteria such as &ldquo;flag a comment only where the claimed behaviour contradicts the actual code&rdquo; give a decidable test.",
      "Self-reported confidence is poorly calibrated exactly where it matters &mdash; it is already confidently wrong on these. H3.",
      "Temperature affects variability, not the definition of what counts as an issue. The criteria are still vague.",
      "Consensus voting suppresses genuine findings that are caught intermittently, while stable false positives survive both runs."
    ]
  },
  {
    "id": "Q36",
    "cert": "ccarf",
    "domain": 4,
    "task": "4.1",
    "scenario": 5,
    "source": "mine",
    "kind": "single",
    "stem": "Four finding categories perform well; a fifth &mdash; possible race conditions &mdash; is wrong about 70% of the time. Developers have started ignoring all five. What is the right immediate move?",
    "options": [
      "Temporarily disable the race-condition category to restore trust, and keep improving its prompt separately.",
      "Keep all five and add a banner explaining that race findings are less reliable.",
      "Raise the reporting threshold across all five categories equally.",
      "Replace the whole reviewer with a static analysis tool for concurrency."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "A high false-positive category poisons confidence in the accurate ones. Removing it protects the value of what already works while you fix it out of band.",
      "Puts the filtering burden on developers who have already stopped reading. Trust is behavioural, not informational.",
      "Punishes the four working categories for the fifth&rsquo;s failure, suppressing findings developers currently act on.",
      "Discards four working categories to solve one, and a rewrite is disproportionate to a single miscalibrated prompt."
    ]
  },
  {
    "id": "Q37",
    "cert": "ccarf",
    "domain": 4,
    "task": "4.2",
    "scenario": 5,
    "source": "mine",
    "kind": "single",
    "stem": "Your review findings are accurate but formatted inconsistently &mdash; sometimes a location and a fix, sometimes a paragraph, sometimes a severity, sometimes not. Your instructions already specify the format in detail. What is the most effective step?",
    "options": [
      "Add few-shot examples demonstrating the exact output shape: location, issue, severity, suggested fix.",
      "Restate the format instructions at both the start and the end of the prompt.",
      "Add fifteen examples covering every finding type you have seen.",
      "Post-process the output with a script that reformats whatever comes back."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "When detailed instructions have already failed to produce consistency, demonstration is the documented next move. Examples show the shape rather than describing it.",
      "Position helps with long inputs, but the failure here is format compliance, not information being lost mid-context.",
      "Two to four targeted examples is the guidance. Fifteen is token overhead and crowds out the content you are reviewing.",
      "Papers over unstructured output when the model can be made to emit the right shape &mdash; and for guaranteed structure, <code>tool_use</code> with a schema is the real answer."
    ]
  },
  {
    "id": "Q38",
    "cert": "ccarf",
    "domain": 4,
    "task": "4.2",
    "scenario": 6,
    "source": "mine",
    "kind": "single",
    "stem": "Your extractor handles neatly tabulated documents well, but on papers where methodology is buried in narrative prose and citations are inline rather than in a bibliography, required fields come back null. What helps most?",
    "options": [
      "Few-shot examples showing correct extraction from documents with these varied structures.",
      "Make the affected fields nullable so the nulls stop failing validation.",
      "Split each document into chunks and extract from each independently.",
      "Add a preprocessing step converting every document to a uniform table format."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Examples let the model generalise across structural variety rather than pattern-matching one layout. This is the named remedy for empty or null extraction from varied formats.",
      "Legitimate when information is genuinely absent &mdash; but here it <em>is</em> present, just formatted differently. This would hide a real extraction failure.",
      "May help with length, but the failure is structural interpretation, not context capacity. Chunking can also sever a claim from its context.",
      "Pushes the hard interpretation problem into a preprocessor that has to solve the same task with less capability."
    ]
  },
  {
    "id": "Q39",
    "cert": "ccarf",
    "domain": 4,
    "task": "4.3",
    "scenario": 6,
    "source": "mine",
    "kind": "single",
    "stem": "Your pipeline parses JSON out of model text responses and roughly 4% of calls fail on malformed JSON. What eliminates this class of failure?",
    "options": [
      "Define an extraction tool with a JSON schema and read the structured data from the <code>tool_use</code> response.",
      "Add &ldquo;respond only with valid JSON, no prose&rdquo; to the prompt and retry on parse failure.",
      "Wrap the parser in a repair library that fixes common JSON mistakes.",
      "Set <code>tool_choice</code> to <code>any</code> and keep parsing the text content."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Tool use with a schema is the reliable route to schema-compliant output and removes syntax errors as a category. Note the limit: it eliminates syntax errors, never semantic ones.",
      "Reduces the rate without eliminating the class, and spends a retry on every failure. The mechanism exists; use it.",
      "Treats the symptom, and silent repair can change meaning &mdash; a truncated array becomes a shorter valid array.",
      "Confuses two things. <code>tool_choice: any</code> guarantees a tool is called; the structure comes from reading the tool input, not the text."
    ]
  },
  {
    "id": "Q40",
    "cert": "ccarf",
    "domain": 4,
    "task": "4.3",
    "scenario": 6,
    "source": "mine",
    "kind": "single",
    "stem": "Your invoice schema marks <code>purchase_order_number</code> as required. Many invoices genuinely have no PO number, and the model has started inventing plausible ones. What is the correct schema change?",
    "options": [
      "Make the field optional or nullable, so absence can be represented honestly.",
      "Keep it required and instruct the model to use the string &ldquo;UNKNOWN&rdquo; when absent.",
      "Keep it required and add a validation-retry loop for suspicious values.",
      "Remove the field from the schema entirely."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "A required field is an instruction to produce a value. If the source may not contain one, requiring it manufactures hallucination. Nullable fields remove the pressure.",
      "Workable in a pinch but it encodes absence as a magic string every consumer must special-case. The schema can express this properly.",
      "Retry cannot recover information that is not in the document, and there is no reliable test for a plausible fabrication.",
      "Loses the value on the majority of invoices that do have one."
    ]
  },
  {
    "id": "Q41",
    "cert": "ccarf",
    "domain": 4,
    "task": "4.4",
    "scenario": 6,
    "source": "mine",
    "kind": "single",
    "stem": "Your validation-retry loop resends the document, the failed extraction and the specific error. It fixes most failures. One class never succeeds no matter how many times you retry. Which is it?",
    "options": [
      "Cases where the required information is simply not present in the source document.",
      "Cases where a numeric field arrives as a string instead of a number.",
      "Cases where the model put a value in the wrong field.",
      "Cases where the JSON was truncated mid-object."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Retry works on format and structural errors, where the model can correct how it answered. It cannot conjure information that was never there &mdash; recognising this saves real money in production.",
      "A format mismatch, which is exactly what retry with a specific error message fixes.",
      "A structural error. Telling the model what was wrong usually corrects placement.",
      "Retry generally resolves this, and moving to <code>tool_use</code> with a schema removes the category."
    ]
  },
  {
    "id": "Q42",
    "cert": "ccarf",
    "domain": 4,
    "task": "4.4",
    "scenario": 6,
    "source": "mine",
    "kind": "single",
    "stem": "Extractions pass schema validation, but downstream accounting rejects some: line items do not sum to the stated total. The JSON is always well-formed. What detects this before it ships?",
    "options": [
      "Have the model emit a <code>calculated_total</code> alongside the <code>stated_total</code> so a discrepancy can be flagged, and add a <code>conflict_detected</code> flag for inconsistent source data.",
      "Tighten the JSON schema so totals must be consistent.",
      "Add a retry loop triggered whenever accounting rejects a record.",
      "Route all extractions to human review."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Semantic validation needs something to compare. Extracting both figures makes the inconsistency checkable in code and distinguishes a model error from a genuinely contradictory document.",
      "JSON Schema constrains shape and type, not arithmetic relationships between fields. Schemas eliminate syntax errors, never semantic ones.",
      "Reactive and late, and it does not tell the model what was wrong &mdash; the specific validation error is what makes retry effective.",
      "Discards the automation. Confidence-based routing of the suspect subset is the proportionate answer."
    ]
  },
  {
    "id": "Q43",
    "cert": "ccarf",
    "domain": 4,
    "task": "4.5",
    "scenario": 5,
    "source": "mine",
    "kind": "single",
    "stem": "Two workflows currently use synchronous API calls: a pre-merge check developers wait on before merging, and a technical-debt report generated overnight for the morning. Your manager wants both moved to the Message Batches API for the 50% saving. How do you respond?",
    "options": [
      "Move the overnight report to batch; keep the pre-merge check synchronous.",
      "Move both, polling for completion, since batches usually finish quickly.",
      "Move both, with a fallback to synchronous if a batch runs long.",
      "Keep both synchronous, because batch results cannot be correlated back to inputs."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Batch is 50% cheaper with a processing window of up to 24 hours and no latency SLA. That is ideal for overnight work and unacceptable for anything a developer is blocked on.",
      "&ldquo;Usually&rdquo; is not a guarantee, and there is no SLA to appeal to. Blocking a merge on it is the wrong risk.",
      "Builds a complex dual path when simply matching each workflow to the right API is available and correct.",
      "Factually wrong &mdash; <code>custom_id</code> exists to correlate request and response pairs."
    ]
  },
  {
    "id": "Q44",
    "cert": "ccarf",
    "domain": 4,
    "task": "4.6",
    "scenario": 5,
    "source": "mine",
    "kind": "single",
    "stem": "Claude Code generates a module, then in the same session you ask it to review that module for bugs. It reports the code looks correct; an engineer later finds two real defects. What is the structural fix?",
    "options": [
      "Run the review in a separate, independent instance that does not carry the generation reasoning.",
      "Instruct the model to review its work critically and assume bugs exist.",
      "Enable extended thinking for the review turn.",
      "Ask for a second review later in the same session."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "A model that just generated code retains the reasoning that produced it and is less likely to question its own decisions. Independent review, without that context, catches subtler issues than any self-review instruction.",
      "Self-review instructions do not overcome the retained reasoning context. This is the option the guide specifically contrasts against.",
      "More deliberation over the same biased context. The problem is whose context it is, not how long it thinks.",
      "Same session, same reasoning context, same blind spot."
    ]
  },
  {
    "id": "Q45",
    "cert": "ccarf",
    "domain": 5,
    "task": "5.1",
    "scenario": 1,
    "source": "mine",
    "kind": "single",
    "stem": "In long support conversations, your agent progressively summarises earlier turns. Refund amounts, order dates and what the customer was promised keep getting compressed into vague paraphrase, and the agent then contradicts itself. What is the right structure?",
    "options": [
      "Extract the transactional facts &mdash; amounts, dates, order numbers, statuses &mdash; into a persistent case-facts block included in every prompt, outside the summarised history.",
      "Stop summarising and always send the entire conversation history.",
      "Summarise more aggressively so more room is left for recent turns.",
      "Ask the model to re-read its own earlier messages before answering."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Summarisation is lossy in exactly the places precision matters. Pulling hard facts into a separate durable layer keeps them verbatim while prose history compresses freely.",
      "Postpones the problem to the context limit and pays full token cost every turn. Long conversations still need compression somewhere.",
      "Increases the loss of the very details being dropped.",
      "They are already in context in summarised form. Re-reading a lossy summary cannot restore the numbers."
    ]
  },
  {
    "id": "Q46",
    "cert": "ccarf",
    "domain": 5,
    "task": "5.1",
    "scenario": 1,
    "source": "mine",
    "kind": "single",
    "stem": "Each <code>lookup_order</code> call returns more than forty fields; about five matter for a return. After a handful of calls, context is dominated by order payloads and quality drops. What is the fix?",
    "options": [
      "Trim the tool output to the relevant fields before it enters context.",
      "Call <code>/compact</code> once context passes a threshold.",
      "Instruct the model to ignore fields that are not relevant.",
      "Move to a model with a larger context window."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Tool results accumulate and consume tokens out of all proportion to their relevance. Trimming at the boundary &mdash; a hook is a natural place &mdash; keeps context proportionate to what is actually needed.",
      "Useful during long exploration, but reactive and lossy. Better not to admit thirty-five irrelevant fields per call in the first place.",
      "They still occupy context whether attended to or not. Instruction does not reclaim tokens.",
      "Buys headroom while leaving the waste in place, and larger windows do not fix attention quality. H7."
    ]
  },
  {
    "id": "Q47",
    "cert": "ccarf",
    "domain": 5,
    "task": "5.2",
    "scenario": 1,
    "source": "mine",
    "kind": "single",
    "stem": "A customer opens with: &ldquo;I do not want to talk to a bot, put me through to a person.&rdquo; The request itself &mdash; a late delivery refund &mdash; is one your agent handles routinely. What should it do?",
    "options": [
      "Escalate to a human immediately, without first attempting to investigate or resolve.",
      "Explain that it can resolve this quickly and proceed with the refund.",
      "Attempt the resolution, then escalate if the customer objects again.",
      "Run sentiment analysis and escalate if frustration is high enough."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "An explicit request for a human is a valid escalation trigger on its own. Capability to resolve does not override a stated preference.",
      "Overrides a clear customer instruction. Being able to help is not permission to ignore what was asked.",
      "Requires the customer to repeat themselves. The distinction to know: acknowledge frustration and offer to help when the customer is merely <em>frustrated</em>; escalate at once when they explicitly ask for a person.",
      "Sentiment is not the signal. The customer made an explicit request; no inference is needed. H3."
    ]
  },
  {
    "id": "Q48",
    "cert": "ccarf",
    "domain": 5,
    "task": "5.2",
    "scenario": 1,
    "source": "mine",
    "kind": "single",
    "stem": "A customer asks you to match a competitor&rsquo;s lower price. Your published policy covers price adjustments on your own site within 14 days and says nothing at all about competitors. What should the agent do?",
    "options": [
      "Escalate, because the policy is silent on this request and it is a policy gap rather than a complex case.",
      "Decline, since the policy does not authorise competitor matching.",
      "Apply the own-site rule by analogy and grant the adjustment within 14 days.",
      "Ask the customer to submit a formal request through the website."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Policy gaps and ambiguity are named escalation triggers. Silence is not permission, and it is not the agent&rsquo;s place to invent commercial policy.",
      "Reads silence as prohibition. A human owns that call, and a wrong refusal costs a customer.",
      "Invents policy by extension. The financial and precedent consequences are not the agent&rsquo;s to set.",
      "Deflection that resolves nothing and does not route the gap to anyone who can close it."
    ]
  },
  {
    "id": "Q49",
    "cert": "ccarf",
    "domain": 5,
    "task": "5.3",
    "scenario": 3,
    "source": "mine",
    "kind": "single",
    "stem": "Your web search subagent times out mid-research. How should that failure reach the coordinator?",
    "options": [
      "As structured error context: the failure type, the query attempted, any partial results, and possible alternative approaches.",
      "Retry internally with exponential backoff, returning &ldquo;search unavailable&rdquo; only once exhausted.",
      "Catch the timeout and return an empty result set marked successful.",
      "Let the exception propagate to a top-level handler that ends the research run."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "This is what lets the coordinator decide intelligently &mdash; retry with a narrower query, try another source, or proceed and annotate the gap. H4.",
      "Local recovery for transient failures is right; collapsing the outcome to a generic status is what is wrong. It hides the context the coordinator needs.",
      "Silently suppressing failure as success. Prevents all recovery and quietly corrupts the report. Explicit anti-pattern.",
      "Terminates a workflow that could have completed with partial coverage. Also an explicit anti-pattern."
    ]
  },
  {
    "id": "Q50",
    "cert": "ccarf",
    "domain": 5,
    "task": "5.4",
    "scenario": 4,
    "source": "mine",
    "kind": "single",
    "stem": "Four hours into exploring an unfamiliar codebase, the agent starts giving inconsistent answers and referring to &ldquo;typical patterns in codebases like this&rdquo; rather than the specific classes it identified earlier. What addresses this?",
    "options": [
      "Have the agent maintain a scratchpad file of key findings and consult it for later questions, and delegate verbose exploration to subagents.",
      "Call <code>/compact</code> and continue.",
      "Start over with a larger context window.",
      "Ask the agent to be more careful and cite specific class names."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Two complementary moves against context degradation: persist findings outside the conversation so they survive context boundaries, and keep discovery noise in subagents while the main agent coordinates.",
      "Reduces size, and it is a legitimate tool during long exploration &mdash; but on its own it discards the specific findings you need rather than preserving them.",
      "Throws away four hours and does not prevent the same degradation recurring later.",
      "The specifics have decayed out of reliable reach. Instruction cannot recover them."
    ]
  },
  {
    "id": "Q51",
    "cert": "ccarf",
    "domain": 5,
    "task": "5.5",
    "scenario": 6,
    "source": "mine",
    "kind": "single",
    "stem": "Your extraction pipeline reports 97% overall accuracy and there is pressure to drop human review for high-confidence results. What must you check first?",
    "options": [
      "Break the accuracy down by document type and by field to confirm no segment performs badly, and set up stratified random sampling of high-confidence extractions to keep measuring.",
      "Raise the confidence threshold until the high-confidence bucket reaches 99%.",
      "Review a random 5% sample of all extractions indefinitely.",
      "Automate now and monitor downstream complaint volume."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "An aggregate can hide a document type at 60%. Segmented analysis before automating, and ongoing stratified sampling afterwards to catch novel error patterns as inputs drift.",
      "Tunes against an uncalibrated self-reported number and still tells you nothing about which segments fail.",
      "Better than nothing, but unstratified sampling under-samples exactly the rare document types most likely to be failing.",
      "Uses customer harm as the detector, with a long lag before the signal arrives."
    ]
  },
  {
    "id": "Q52",
    "cert": "ccarf",
    "domain": 5,
    "task": "5.6",
    "scenario": 3,
    "source": "mine",
    "kind": "single",
    "stem": "Two credible sources give different figures for the same market size, collected in different years. Your synthesis agent silently picks one. What should it do instead?",
    "options": [
      "Preserve both values with source attribution and collection dates, annotate the conflict explicitly, and structure the report to separate well-established findings from contested ones.",
      "Use the figure from the more recent publication.",
      "Average the two figures.",
      "Drop the claim, since the sources disagree."
    ],
    "correct": [
      0
    ],
    "explanations": [
      "Conflicts are information. Attribution plus dates lets the reader judge, and often reveals that a temporal difference was never a contradiction at all.",
      "A reasonable editorial instinct that still discards a data point and hides the disagreement from the reader.",
      "Manufactures a number no source supports and destroys both attributions.",
      "Loses genuine information. The guide asks for coverage annotation, not omission."
    ]
  }
];
