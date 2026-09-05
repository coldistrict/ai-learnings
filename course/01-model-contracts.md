# M1 — Model contracts and reliable calls

Prerequisite: [foundations](00-foundations.md). Use with the three
[M1 labs](../labs/m1-model-contracts/PLAN.md). Lab acceptance criteria remain the
grading contract; the production extensions below are taught before live use.

Tutor entry for the paused M1-01 session: [prepared teaching pilot](pilots/m1-01-structured-output-contract.md).
Use its paced analogous example when the learner separately asks to begin. Full
chapter restructuring remains pending; see [scope](SCOPE.md).

## Four checks, four different guarantees

Imagine extracting a room reservation: room, date, headcount, and evidence ID.

1. **Parse:** is the response valid JSON?
2. **Validate shape:** are required fields present, types correct, enums allowed,
   and extra properties handled according to the contract?
3. **Validate meaning:** does the room exist, does headcount fit its capacity,
   and does the supplied evidence support the requested date?
4. **Authorize:** may this user reserve this room now?

A schema can require a date-shaped string; it cannot establish that the meeting
really occurs on that date. Likewise a model-generated `confidence: 0.95` is a
claim, not a calibrated 95% probability. Measure correctness within confidence
bands before using a score for routing, and keep high-impact policy in code.

**Structured outputs** constrain the response to a supported schema. JSON mode
only addresses JSON syntax. Function calling structures a proposed tool call;
it does not itself authorize or execute a side effect. OpenAI's Responses API
uses `text.format` for structured response output; refusal and incomplete output
need explicit handling. [Official structured-output guide](https://developers.openai.com/api/docs/guides/structured-outputs).

Claude's documented surfaces are `output_config.format` for JSON output and
`strict: true` for strict tool use. Check supported schema features and stop
conditions in the chosen SDK/model. The current documentation also notes possible
enum/const capitalization differences. Preserve the application's exact contract:
reject mismatches or deliberately map unambiguous values at the adapter boundary,
with tests. Do not silently weaken strict enums throughout the application.
[Claude structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs).

## Prompt design as an experiment

A useful prompt states the task, the evidence it may use, the output contract,
and what to do when information is missing. Add a small example when a failure
shows an ambiguous instruction; include an unknown case, not only happy paths.
Keep retrieved text clearly labeled as data. Delimiters improve readability but
do not enforce permissions or prevent injection by themselves.

For the room example: “Extract only facts supported by the supplied request;
return missing fields as unknown; do not reserve the room.” Then test an
ambiguous date, a cancelled meeting, and conflicting requests. Change one element
at a time and compare on the same development cases. Keep final evaluation cases
out of the prompt and tuning loop.

Ask for a concise decision justification and evidence references when useful.
Do not treat a long reasoning narrative as proof. Reasoning settings are
model-specific: test the supported effort levels for quality, time, and cost
instead of assuming maximum effort or a “think step by step” phrase always helps.
Verify current options in the [model guidance](https://developers.openai.com/api/docs/guides/latest-model).

## A provider boundary makes differences explicit

The application should receive a stable result type while an adapter handles
provider-specific request fields, usage accounting, tool-call IDs, and stop
reasons. Preserve meaningful distinctions: success, refusal, incomplete output,
invalid request, transient service error, timeout, and local validation failure.
Do not silently turn a refusal into a repair attempt or route around it through
another provider.

Repeated identical inputs can produce different outputs. Sampling is one cause;
provider/model updates and execution differences can also change behavior. A
low temperature or fixed seed, when supported, is not a cross-version guarantee
of determinism. Pin configuration and measure repeated task outcomes; keep truly
deterministic requirements such as authorization outside the generation step.

| Failure | Sensible response | Why |
|---|---|---|
| Invalid credentials or unsupported request | Stop and fix configuration | Repeating the request cannot repair it |
| Temporary rate limit | Bounded retry respecting provider delay | Immediate retries can amplify overload |
| Malformed unconstrained output | Bounded repair if permitted | Repair can help; its success rate must be measured |
| Wrong but schema-valid fact | Recheck evidence or abstain | Parsing again cannot establish truth |
| Timeout after an external write | Reconcile state using operation identity | The write may already have happened |

Lab 02 deliberately supplies unconstrained malformed output. Repair prompts use
a safe validation summary; arbitrary untrusted output must not become privileged
instructions. Its limited outcomes are not a complete provider contract.

Retries consume a shared attempt, time, and spending budget. Use backoff with
jitter, meaning a bounded randomized delay, to avoid synchronized retry storms.
Check SDK retry defaults so an outer loop does not unknowingly multiply them.
Fallback also needs compatible output, privacy, authorization, and cost policies.

## Streaming and cancellation

Streaming exposes partial output before the whole response is complete. It can
reduce perceived waiting time; it does not guarantee shorter total execution.
Do not commit a parsed object or execute tool arguments from unfinished chunks.
Assemble the documented event sequence, check completion status, then validate.
A disconnected stream is an incomplete result, not an empty successful answer.

A timeout stops the caller waiting. It does not prove remote work or billing stopped.
Propagate cancellation where supported, observe late completions, and reconcile
uncertain side effects. A run deadline covers all attempts, backoff, and tools;
a per-attempt timeout covers one operation. Both are useful and distinct.

## Accounting is different from reserving a budget

With synthetic rates of $2/million input tokens and $8/million output tokens,
3,000 input plus 500 output tokens costs $0.006 + $0.004 = **$0.010**. These
numbers teach arithmetic; they are not current provider prices. Actual billing
may distinguish cached input, reasoning/output usage, tool fees, and other items.

If a run has spent $0.09 of a $0.10 cap, a check that asks only whether it has
already reached the cap still permits a next call costing $0.04. It ends at
$0.13. The current fake-provider lab demonstrates an exhausted-budget check,
especially zero-budget blocking; it does not prove a hard positive spending cap.

Before live use, estimate a conservative upper bound for the next call using
bounded input and maximum billable output, include applicable fees, and reserve
that amount **atomically** from the shared budget. Concurrent calls must see
each other's reservations. Reconcile with reported usage after completion; retain
reservations for uncertain in-flight work until accounted for. If a billable
component cannot be bounded, report that limitation and do not claim a hard cap.
Provider account limits are a separate control whose enforcement timing must be
checked. Live calls also require the course's explicit spending consent.

## Practice and readiness

Use the offline labs first. Before the M1 live benchmark, the tutor authors
visible cases for refusal, truncated streaming, an attempted positive-budget
overspend, and overlapping reservations. These are prerequisites for claiming
live safety, not retroactive additions to the existing lab tests.

Create a provider comparison note recording SDK/model identifiers, structured
output fields, stop/error mapping, usage fields, retry defaults, and supported
limits. Compare models on task success and cost per successful task, not price
per token alone. Explain how zero-budget blocking differs from preventing the
next call from exceeding a positive cap.

sources: OpenAI structured outputs; Anthropic structured outputs; OpenAI model
and reasoning controls; Anthropic Messages API + current models.
