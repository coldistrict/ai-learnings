# M0 — Foundations and workflow selection

Prerequisite: ordinary programming experience. During the baseline diagnostic,
the tutor withholds teaching until scoring is complete; use this chapter afterward.

## The model is one part of a system

A language model learns patterns from training data and generates a continuation
conditioned on its current input. **Inference** is using the trained model;
**training** changes its parameters. Supplying a document in a prompt is inference,
not automatically training the model on that document. Provider storage and data
use policies are a separate question that must be verified for the chosen service.

A **token** is a unit of encoded text or other input; it is not reliably one word
or one character. The tokenizer, language, and content affect the count. A
**context window** limits the material available to a model call, with input,
output, and reasoning allowances depending on the model. A large window does
not guarantee the model will use every relevant detail correctly.

At an awareness level, a transformer's **attention** mechanism helps compute
representations using relationships among tokens. The model's learned parameters
encode patterns; they are not a queryable, automatically current company database.
You do not need to derive attention equations for this role, but you should be
able to explain why supplying relevant current evidence still matters.

The model produces useful predictions, not an authoritative database query. Its
answer can be fluent, syntactically valid, and factually wrong. We call unsupported
or invented content **hallucination**. The engineering response is to provide
evidence, validate the output, measure mistakes, and provide an abstention path.

Keep three questions separate:

| Layer | Question | Evidence |
|---|---|---|
| Model | Can it infer a useful classification from messy language? | Labeled examples and observed error rates |
| Application | Does it enforce permissions and handle failure? | Contract tests, traces, and failure drills |
| Workflow | Does this help the operator finish useful work? | Baseline and pilot measurements |

## Three harnesses

The **runtime harness** executes the application: model calls, tool dispatch,
budgets, validation, state, and policy. The **evaluation harness** measures that
application: datasets, runners, scorers, and comparisons. The **developer-tool
harness** helps people use it: repository instructions, skills, hooks, and plugins.
Confusing them leads to claims such as “the plugin makes the system secure” when
the plugin merely describes a workflow.

## Choose the smallest useful system

Start with the actual job. Who starts it? What inputs exist? What decision must
be made? What can go wrong? Who handles an exception? How will success be counted?

Suppose an operator routes equipment requests. A rule routes a known device ID
to its registered team. An LLM may help interpret free-text descriptions when
the device ID is missing. A workflow can run those steps in a fixed order. An
agent is worth considering only if deciding which evidence to collect next is
itself difficult to specify ahead of time.

That yields three design choices:

- **Deterministic code:** explicit rules determine the result. Good for arithmetic,
  authorization, schema validation, and exact lookups.
- **Workflow with model steps:** code determines the sequence; a model handles
  bounded language tasks within it.
- **Agent:** the model proposes subsequent actions in a loop; application code
  controls which proposals are allowed to execute and when execution stops.

For an AI candidate, write a short scorecard covering frequency, manual effort,
data availability, error impact, reversibility, evaluability, and ownership.
Do not average away a fatal constraint: unavailable permission or an unmeasurable
high-impact decision can disqualify a use case despite apparent time savings.

## Worked example: establish the baseline

In a synthetic practice workflow, 20 requests take 120 operator minutes and
4 require correction. The baseline is 6 minutes/request and a 20% correction
rate. Define “finished” before introducing AI: correctly routed, required fields
present, and an operator able to explain the evidence. Otherwise a fast but
unusable draft might be counted as success.

Record both human time and elapsed time. A task can consume 2 minutes of operator
attention but wait 15 minutes in a queue. Improving one does not necessarily
improve the other. Also record who labels correctness and which cases are excluded.

## Practice and explain-back

Pick a synthetic workflow outside incident investigation. Write its trigger,
input, output, owner, three failure modes, and one measurable success condition.
Choose deterministic code, a model-assisted workflow, or an agent, and explain
one rejected option. No API call is needed.

Before moving on, explain why a correct-looking answer is insufficient, why a
diagnostic score does not grant mastery, and how a slow manual baseline could
still be safer or more useful than a fast automated result.
