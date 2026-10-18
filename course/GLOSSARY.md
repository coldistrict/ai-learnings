# Working glossary

Definitions describe the concepts used in this course. Follow the linked chapter
for examples and limits; exact API fields come from the dated source ledger.

| Term | Plain-language meaning | Chapter |
|---|---|---|
| Inference | Using a trained model to produce an output from input | [M0](00-foundations.md) |
| Token | An encoded unit of model input/output, not necessarily a word | [M0](00-foundations.md) |
| Context window | The model's bounded capacity for information in a call | [M0](00-foundations.md) |
| Hallucination | Invented or unsupported generated content | [M0](00-foundations.md) |
| Runtime harness | Code that controls execution around the model | [M0](00-foundations.md) |
| Eval harness | Datasets, runners, scorers, and reports for measuring the system | [M2](02-workflows-and-evals.md) |
| Schema | A contract for data structure and permitted values | [M1](01-model-contracts.md) |
| Structured output | Model output constrained to a supported schema | [M1](01-model-contracts.md) |
| Semantic validation | Checking whether values make sense and are supported | [M1](01-model-contracts.md) |
| Provider adapter | Code translating one provider's API into the application's contract | [M1](01-model-contracts.md) |
| Refusal | A provider/model declines to fulfill the request | [M1](01-model-contracts.md) |
| Incomplete output | Generation ended before a usable complete result | [M1](01-model-contracts.md) |
| Calibration | Comparing a score or grader judgment with observed correctness | [M6](06-evaluation-and-security.md) |
| Reasoning effort | A model-specific control over reasoning work, evaluated for tradeoffs | [M1](01-model-contracts.md) |
| Backoff / jitter | Increasing retry delay / varying it to avoid synchronized retries | [M1](01-model-contracts.md) |
| Deadline | Maximum total time permitted for a run | [M1](01-model-contracts.md) |
| Timeout | Maximum time a caller waits for a particular operation | [M1](01-model-contracts.md) |
| Budget reservation | Setting aside bounded capacity before dispatching work | [M1](01-model-contracts.md) |
| State machine | Named states with explicit allowed transitions | [M2](02-workflows-and-evals.md) |
| Idempotency | Repetition preserves the intended effect of one operation | [M2](02-workflows-and-evals.md) |
| Atomic operation | Changes occur together without a partially visible intermediate result | [M2](02-workflows-and-evals.md) |
| Replay | Running against recorded responses or interactions | [M2](02-workflows-and-evals.md) |
| Scorer | A rule or grader that measures a defined aspect of a result | [M2](02-workflows-and-evals.md) |
| Held-out set | Cases excluded from tuning and used for later evaluation | [M2](02-workflows-and-evals.md) |
| Data leakage | Evaluation information reaches training/tuning or another forbidden boundary | [M2](02-workflows-and-evals.md) |
| MCP host/client/server | Application / connecting component / capability provider | [M3](03-mcp.md) |
| MCP resource/prompt/tool | Addressable content / interaction template / named operation | [M3](03-mcp.md) |
| stdio | Local process communication through standard input and output | [M3](03-mcp.md) |
| Transport | The mechanism carrying protocol messages | [M3](03-mcp.md) |
| Authentication / authorization | Establishing identity / deciding permitted access or action | [M3](03-mcp.md) |
| Token audience | The service for which an access token is intended | [M3](03-mcp.md) |
| RAG | Selecting external evidence and supplying it for generation | [M4](04-retrieval.md) |
| Chunk | A retrievable portion of a source document | [M4](04-retrieval.md) |
| Embedding | A numeric vector used to represent content for similarity tasks | [M4](04-retrieval.md) |
| Lexical / semantic search | Matching words / retrieving by represented meaning | [M4](04-retrieval.md) |
| Hybrid / reranking | Combining retrieval methods / rescoring selected candidates | [M4](04-retrieval.md) |
| Recall / precision | Relevant evidence found / retrieved evidence that is relevant | [M4](04-retrieval.md) |
| Citation validity / support | Source exists and is usable / source supports the associated claim | [M4](04-retrieval.md) |
| ACL | An access-control list or equivalent object-access policy | [M4](04-retrieval.md) |
| Context engineering | Selecting and maintaining information for each model call | [M5](05-context-and-agents.md) |
| Compaction | Lossy reduction of context while preserving needed state/references | [M5](05-context-and-agents.md) |
| Durable state | Progress persisted beyond one call or process | [M5](05-context-and-agents.md) |
| Compensation | A deliberate corrective action after partial effects | [M5](05-context-and-agents.md) |
| Programmatic tool calling | Code coordinating tool calls under controlled execution | [M5](05-context-and-agents.md) |
| Ablation | Removing one component to measure what it contributes | [M6](06-evaluation-and-security.md) |
| Trace / span | Execution record of a run / one component operation | [M6](06-evaluation-and-security.md) |
| Prompt injection | Untrusted instructions trying to redirect the system | [M6](06-evaluation-and-security.md) |
| Confused deputy | Misuse of a service's authority on behalf of an unauthorized requester | [M6](06-evaluation-and-security.md) |
| Least privilege | Giving each component only the access its task needs | [M6](06-evaluation-and-security.md) |
| Sandbox | An execution boundary restricting accessible resources and effects | [M6](06-evaluation-and-security.md) |
| Skill / hook / plugin | Reusable workflow / event handler / distribution package | [M7](07-developer-tools.md) |
| Progressive disclosure | Loading detailed instructions or tools only when relevant | [M7](07-developer-tools.md) |
| ADR | Architecture decision record: context, choice, alternatives, consequences | [M7](07-developer-tools.md) |
| Admission control | Deciding whether new work can start, queue, or must be rejected | [M8](08-production.md) |
| Circuit breaker | Temporarily stopping requests to an unhealthy dependency | [M8](08-production.md) |
| SLI / SLO | A measured service indicator / its target over a stated window | [M8](08-production.md) |
| Rollback | Restoring a prior compatible release and reconciling its state | [M8](08-production.md) |
| Pilot | A bounded trial with predefined outcomes and decision rules | [M9](09-enablement.md) |
| Counterbalancing | Varying condition order to reduce order/learning effects | [M9](09-enablement.md) |
| Provenance | Evidence of who authored, changed, or supplied an artifact | [M9](09-enablement.md) |
