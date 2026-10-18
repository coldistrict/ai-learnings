# M5 — Context and agent execution

Prerequisite: contracts, evalkit, MCP, and retrieval. Outcome: one bounded
investigation loop with explicit state, safe approval, and interruption recovery.

## The practical problem

Noor has a ticket with incomplete evidence. The next useful lookup depends on
what the previous one reveals, so a fixed sequence may waste work or miss a lead.
This is a reason to test an agent: a model that proposes the next step while code
controls execution. You will compare it with the existing workflow and handle
an interruption without forgetting what happened. More autonomy must earn its
cost through better investigation results.

## Context engineering: decide what each call needs

**Prompt engineering** designs the instructions. **Context engineering** chooses
and maintains everything supplied to the call: instructions, tools, retrieved
evidence, history, and working state. More context can increase distraction,
cost, and latency; enough relevant context is the objective.
[Anthropic's context engineering guidance](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents).

Give each item a purpose and trust level. Keep policy separate from documents;
attach IDs and timestamps to evidence; include unresolved questions and the next
allowed actions. Fetch detailed evidence when needed instead of repeatedly
inserting an entire archive. Discovering a tool description on demand saves
context only if the required tool can still be found reliably.

**Compaction** summarizes working context so execution can continue. It is lossy:
an omitted uncertainty can become a false fact in the next call. Preserve
references to original evidence, pending effects, budgets, and unresolved
decisions. Test the resumed system against the full-state baseline.

Distinguish three kinds of memory:

| Store | Example | Authority |
|---|---|---|
| Call context | Selected ticket excerpt | Temporary input; may be incomplete |
| Persisted task state | Completed steps, evidence IDs, pending draft | Application-managed execution record |
| Longer-term memory | A user's permitted reporting preference | Scoped, attributable, correctable data |

Retrieved text must not silently become a permanent instruction. Scope memory
by user/tenant, record source and expiry, and support correction/deletion. A
summary never proves that an external action succeeded.

## The agent loop

The model proposes a next step; the runtime checks policy, validates inputs,
reserves resources, executes the step, records the outcome, and decides whether
another iteration is allowed. Stop on success, insufficient evidence, denied
authority, repeated lack of progress, cancellation, or exhausted budgets. A
useful loop has both a maximum and a reason to stop earlier.

```text
task + selected evidence
          ↓
model proposes action
          ↓
validate → authorize → reserve → execute → record
          ↑                                  ↓
          └──── continue only if useful ──────┘
                       otherwise finish/escalate
```

Compare the agent with M2's fixed workflow on the same tasks. An agent earns
its extra freedom when adaptive evidence gathering improves measured success
enough to justify extra time, cost, and operational complexity.

## Worked example: recovery after a lost response

An equipment assistant has collected evidence and saved a local draft. The
save response is lost and the process restarts. Its durable record says the
save was attempted with operation key `op-17`, but completion is unknown.
Recovery queries the stored operation outcome or safely retries with that key.
It must not infer “no response means nothing happened” and create a new draft.

Persist the run ID, task scope, step/version, evidence references, operation
identities, pending/completed effects, approvals, budget reservations, and last
verified result. Resume by reconciling uncertain operations and checking changed
permissions. Incremental work and explicit progress artifacts support recovery
across context windows. [Long-running harness guidance](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents).

An approval should bind the user, tenant, action, target, exact payload (or
digest), expiry, and one-time use policy. Recheck authorization when executing.
Editing the approved payload invalidates its approval. A stored “user said yes”
does not authorize a different target after restart.

**Compensation** is a deliberate recovery action after a partial multi-step
operation. It is not guaranteed rollback: deleting a sent message cannot undo
someone reading it. Prefer local drafts and reversible steps, and route
irreversible uncertainty to a human with evidence.

## Newer techniques: earn their place

Programmatic tool calling lets generated code coordinate several tool calls and
return a compact result. It requires sandboxing, permitted tools, bounded
execution, and visible traces; fewer model round trips do not remove security
boundaries. Prototype only if repetitive tool coordination is a measured bottleneck.

Parallel agents can investigate independent questions, with explicit ownership,
bounded inputs, and a result contract. They add duplicated work, merge conflicts,
and correlated errors. Two agents agreeing is not independent ground truth.
Keep this optional until it beats the single-agent baseline. Do not use agent
count as a progress metric.

Compare one raw loop with an agent SDK. Name what the framework owns—tool
dispatch, state, tracing, retries—and what the application still owns, especially
authorization and side effects. Adoption requires an ADR and regression evidence.

## Practice and completion evidence

Investigate at least two public packs under budgets and a draft-only default.
Before running a new lab, publish cases for repeated calls without new evidence,
poisoned tool output, cancellation, stale approval, and interruption immediately
after a simulated effect. Show safe resume and preserved budget accounting.

Deliver V23/V24 evidence, an operator approval-flow review, and a concise defense
of agent versus workflow. Transfer the design to support triage on a later day.

sources: Context engineering; Long-running agent harnesses; OpenAI model and
reasoning controls.
