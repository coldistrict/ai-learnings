# AI Enabler Mastery System — course guide

Content revision: **2026-09-05**. Base plan: `ai-enabler-mastery-system-v3`,
with the teaching and freshness amendments in
[ADR-0009](../learning/DECISIONS.md#adr-0009--course-content-refresh-2026-09-05).

The outcome is to build, evaluate, operate, and explain a useful AI integration:
the **AI Incident Enablement Platform**, using the synthetic NimbusPay company.
You will learn how to choose a workflow, constrain model and tool behavior,
retrieve evidence, measure failures, and help a team adopt the result.

## How to use the course

Run `npm run learn:next` from the repository root, then say **“Teach me the next
session.”** Resume an interrupted session before starting a new one. Read the
chapter for your current milestone with your tutor; these pages explain concepts
and use separate practice examples. They do not disclose diagnostic answers or
the incident packs' ground truth. A chapter is a reference across several
sessions, not a reading assignment to finish in one sitting.

For each concept: explain it in plain language → predict one failure → try a
small example → inspect evidence → explain the result without notes. Learning
to recognize an answer and independently producing it are different abilities.
Revisit the concept in a different setting at least three days later before
claiming durable mastery.

The executable M1 labs remain the coding contracts. M2–M9 have teaching guides
and practice briefs here; their executable labs are authored just in time from
your learning evidence. Reading these pages does not complete a module or gate.
Tutors follow [the authoring standard](AUTHORING.md) before opening a new lab.

## Learning sequence

| Milestone | Read | What you should be able to demonstrate | Hours |
|---|---|---|---:|
| M0 | [Foundations and workflow selection](00-foundations.md) | Distinguish the model, application, and business problem; establish a baseline | 4–6 |
| M1 | [Model contracts and reliable calls](01-model-contracts.md) | Validate output, classify failures, explain streaming and spending limits | 8–11 |
| M2 | [Workflows, tools, and evalkit](02-workflows-and-evals.md) | Build a deterministic baseline and an evaluation that can fail | 13–17 |
| M3 | [MCP and protocol boundaries](03-mcp.md) | Expose narrow capabilities and test the actual client/server revision | 12–16 |
| M4 | [Retrieval and grounded answers](04-retrieval.md) | Compare lexical and hybrid retrieval; check access, freshness, and support | 13–17 |
| M5 | [Context and agent execution](05-context-and-agents.md) | Run a bounded investigation, persist progress, and recover safely | 11–15 |
| M6 | [Evaluation, observability, and security](06-evaluation-and-security.md) | Defend a release with measured evidence and adversarial tests | 13–18 |
| M7 | [Developer tools and packaging](07-developer-tools.md) | Ship a shared workflow through two tested native integrations | 10–14 |
| M8 | [Production and operations](08-production.md) | Exercise remote authorization, load limits, deployment, and rollback | 12–17 |
| M9 | [Enablement and project defense](09-enablement.md) | Run an honest pilot, teach the workflow, and defend your decisions | 12–16 |

The listed ranges sum to **108–147 focused hours**, including practice and
review. At 15 hours/week this is approximately 7.2–9.8 weeks of planned work;
remediation, waiting for delayed reviews, and unavailable prerequisites can
extend elapsed time. This is a planning range, not a mastery or employment promise.
Diagnostic skips may shorten lessons but never waive gates.

## What is core and what is optional

Core: structured contracts, prompt experiments, context selection, deterministic
workflows, a bounded single-agent loop, MCP, lexical/embedding/hybrid comparison,
evals, access controls, approval, recovery, packaging, rollout, and enablement.
Reasoning effort, tool discovery, caching, and framework delegation are taught
as decisions to evaluate, with exact product settings checked when used.

Optional experiments: reranking, contextual retrieval, programmatic tool calling,
parallel agents, multimodal incident evidence, and fine-tuning feasibility. Adopt
one only after a baseline identifies a specific problem and an experiment earns
its cost. Foundation-model training and GPU serving remain specialist topics.
Do not turn the project into several unrelated demos.

Use the [glossary](GLOSSARY.md) for terminology and the
[source ledger](../learning/SOURCE_LEDGER.md) for checked product facts.
The [review report](../docs/course-review-2026-09-05.md) explains this revision,
its verification, and the remaining execution work.
