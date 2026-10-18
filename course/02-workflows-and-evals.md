# M2 — Workflows, tools, and evalkit

Prerequisite: M1 contracts and failure taxonomy. Outcome: a useful deterministic
workflow and an evaluation harness that exposes at least one real failure.

## The practical problem

Noor's assistant should collect records, prepare a draft, and leave it for review.
Now imagine the same request arrives twice, or a test awards full marks to an
invented answer. A convincing demo can hide both failures. Here you will make the
steps explicit and build a measuring tool that catches mistakes. The central
decision is what ordinary code should control even when one step uses a model.

## Separate proposals from execution

A tool is a typed capability offered to the application or model. Its contract
includes input, output, allowed effects, errors, and operational limits. A tool
description helps the model choose it; the implementation enforces what it does.

For an equipment-request example, prefer `get_device_status(device_id)` and
`create_local_request_draft(...)` over a generic `execute_command(text)` tool.
Narrow operations are easier to authorize, test, and explain. Return bounded
results with stable IDs, timestamps, truncation metadata, and useful error codes.
Never infer the requesting tenant from a model-supplied `tenant_id` alone; bind
access to authenticated context on the server.

Think of a workflow as a state machine: each state names the work completed,
the next allowed transitions, and its failure paths. “Lookup → validate → draft
→ review” can contain a model extraction step without giving the model control
over the whole sequence. State belongs to the application, not only the chat.

## Idempotency makes retries safe to reason about

An operation is idempotent when repeated execution has the same intended effect
as one execution. For a write, use a stable operation key scoped to the tenant
and action. Store the key and outcome with the effect atomically when possible.
Repeated keys with the same payload return the stored outcome; a repeated key
with a different payload must not silently perform a second action.

Suppose a draft save succeeds but its response is lost. A fresh random key on
retry creates a second draft. Reusing the original operation identity lets the
server recognize the retry. Merely caching a response after a write leaves a
crash window between effect and cache; name that window in the design.

A read can run concurrently with another independent read. A write followed by
a read that depends on it must be ordered. Parallelism is a dependency decision,
not a universal performance improvement.

## Build the measuring instrument early

An **eval case** has an input, expected observable behavior, and a scorer.
A **runner** executes the system against cases. A **report** records results
with configuration and versions. Put these pieces in the same evalkit throughout
the capstone so improvements remain comparable.

| Layer | What it establishes | What it cannot establish |
|---|---|---|
| Unit/contract test | An invariant for specified inputs | Overall model quality |
| Fake provider | Control-flow behavior under scripted outcomes | Live provider behavior |
| Sanitized replay | Regression behavior for a recorded trajectory | Current live quality after a model change |
| Live task eval | Observed performance on sampled tasks | Guaranteed future safety |
| Human review | Whether the output is useful and justified | Reliable measurement without a clear rubric |

Version replay recordings with prompt, model, schema, tool, and dataset details.
Reject or explicitly relabel incompatible recordings. A prerecorded answer cannot
validate a new prompt's ability to produce that answer. Store only synthetic or
appropriately sanitized data, including metadata and error messages.

## Worked example: test the scorer too

Say an extractor returns `{room: "R12", date: null}` for a request whose date is
absent. A scorer requiring any non-empty date rewards invention. A better scorer
checks known fields and required abstention separately. Test it with a correct
output, a plausible wrong output, a missing-field output, and one that tries to
instruct the grader to award full marks.

Organize cases into development, validation, and final held-out sets. Use the
development set to inspect failures and change the system; validation helps
choose among candidates; final holdout estimates performance after choices are
frozen. Split by incident family or scenario, not random near-duplicate rows,
so paraphrases of the same underlying answer do not leak across sets.

Freeze the baseline before tuning. A failing baseline means a recorded actual
failure with its configuration, not an intentionally fabricated score. Reports
include case counts, per-case failures, and missing or blocked runs.
These practices align with [OpenAI's evaluation guidance](https://developers.openai.com/api/docs/guides/evaluation-best-practices).

## Practice and completion evidence

Author a small request-triage workflow with a fake extractor and typed read/draft
tools. Public cases should cover a normal run, duplicate delivery, invalid tool
arguments, timeout, and a scorer that would otherwise pass a wrong answer.
Capture the first divergence between expected and observed execution in a trace.

Deliver the workflow-versus-agent ADR, evalkit v1 report, one failing-before case,
and a build/buy note explaining ownership and maintenance costs. Modify one small
Python evaluation script as a portability contact point; it need not become a
second implementation of the whole project. V15 remains the milestone gate.

Explain why an eval should sometimes fail, why response replay cannot benchmark
a new model, and why a fixed workflow can still contain an LLM.

sources: OpenAI hosted Evals retirement.
