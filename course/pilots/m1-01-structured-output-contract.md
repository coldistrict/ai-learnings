# M1-01 teaching pilot — from a request to a usable result

**Tutor-owned preparation · created 2026-09-05; scenario repaired 2026-09-12; continuity and bridge clarified 2026-10-09.**
Module: `m1-01-structured-output-contract`. Decisions:
[ADR-0011](../../learning/DECISIONS.md#adr-0011--explicit-scope-and-a-single-teaching-pilot-2026-09-05).
Use with the [M1 guide](../01-model-contracts.md),
[session plan](../../labs/m1-model-contracts/01-structured-output-contract/SESSION.md)
and [unchanged public lab contract](../../labs/m1-model-contracts/01-structured-output-contract/README.md).
This reference supplies analogous teaching data, not a classifier implementation.

## Tutor preparation and continuity

Do not start teaching from an implementation request. When the learner separately
asks to begin, inspect `learn:next` and the current lock/draft, then resume the
correct existing session through the normal tutoring workflow. At preparation,
the open UUID was `67aae9b3-bd60-485a-809b-ca71930d8a33`, module M1-01. This is a
historical pointer to verify, not authority to replace a later session.

The preparation snapshot below describes earlier observations; it is not the
current resume instruction. Read the latest adaptive handoff first. At the
2026-10-09 review, the September 12 input-selection/three-card work was complete,
and the September 19 different-context conceptual gate was met with H2 assistance
after an initial miss. The Result/error-handling bridge had been introduced,
with its learner response still pending; the lab had not started. Do not restart
those completed conceptual questions. New journal evidence supersedes this snapshot.

At original preparation, the draft recorded two requests for broader orientation
before boundary details.
The learner recognized wrong-but-valid output correctly; their parsing explanation
and explanation of what validation reveals were partial. The subsequent
contract-versus-truth explain-back was **correct at H0**, repairing that misconception.
The broader orientation was accepted. At that time the gate and lab were
unfinished, not failed. A question about literal model input versus application
fields called for a direct worked example. Acknowledge these observations briefly; do not restart every
prior prediction or assume the repaired misconception persists.

On 2026-09-12 the learner reported that the visitor/desk story lacked a coherent
real-world purpose and asked who uses the screen, where the text comes from,
why extraction is needed, and how the parts connect. Under ADR-0013, replace
the visitor role with the staff workflow below. This is an explanation repair,
not a learner error. Establish the scenario before returning to the pending
input-selection question. Preserve the original prompt in historical journals.

TypeScript remains the learning language and Go the selected portability language.
The existing lab entry is `workspace/classify.js`, with its existing Node test
command and interface. The draft's phrase “TypeScript classifier lab” does not
change that scaffold. Explain the mismatch and retain the existing JavaScript
lab toolchain; no rename, transpiler setup, or language migration is part of this
pilot. Live spending remains unapproved; this sequence is entirely offline.

Apply [adaptive teaching](../ADAPTIVE-TEACHING.md) (ADR-0013) throughout the pilot.
Choose segments from current evidence: compress explanation already demonstrated,
target a specific gap, or change the representation when needed. Record the
decision and its reason in the journal; do not require every suggested question
in order. Keep the public gate/lab contract and actual assistance attribution.

Use one short segment per turn and pause for the learner. Suggested allocation
within the normal session: short orientation/continuity, one worked example and
prediction, a small review task, then the normal gate and lab if time permits.
These are pacing suggestions, not recorded durations. Never begin a >20-minute
build with <25 minutes available; keep the transaction open if work is unfinished.

## Understand now

### 1. Orient before naming boundaries

Suggested opening: “Today you are learning how an application turns a language
model's reply into data it can handle predictably. Models are useful for reading
varied human wording; applications still need precise fields and failure rules.
This sits between the model call and the rest of the application. You already
explained that matching the contract does not prove the answer is correct.
We will build on that with one new example and make the exact input visible.”

A language model uses learned patterns and the input it receives to generate a
reply. The **application** is the ordinary code around it: receiving a user's
request, choosing what to send, handling the reply, and deciding what may happen.
A **provider** supplies access to the model. No booking, account lookup or other
external action happens simply because the model mentions one.

Imagine a city library service with North and South branches. A returns desk is
a staffed counter where people bring back borrowed books; a pickup desk is where
they collect reserved books. The branch manager sends staff a written schedule
note: “The returns desk opens at 10:00.” The manager sets the hours.

Sam, a library employee, uses an internal website to prepare opening-hours entries
from these notes. Sam selects North in a dropdown, pastes the manager's note into
a text box, and clicks “Prepare draft”. The AI feature extracts the desk name and
opening time into separate draft fields. Sam checks the draft against the note
before any separately authorized publication. Extraction does not change actual
hours or automatically update the public website.

```text
Prepare an opening-hours draft
Branch:        [ North Library v ]
Manager's note:[ The returns desk opens at 10:00. ]
               [ Prepare draft ]

Sam's input -> application selects model input -> model proposes fields
            -> application checks reply -> Sam reviews the draft
```

Point to the step being taught. The branch stays with the application's draft;
it is not automatically part of the model input. This sketch is an illustration,
not an additional application the learner must build.

This is a plausible use of extraction when notes arrive in varied wording and
staff want help transferring them into fields. A simple manual form could also
solve this small task; AI is not necessary to learn the distinction. The human
using this screen is an employee, not a visitor/customer asking about hours.
Keep the setting, roles, source, purpose, and review step visible as layers are
introduced. Explain the situation before displaying JSON or asking a prediction.

### 2. Show the application request, then the exact message

Sam selects North and pastes the manager's note. Behind the website screen,
application code receives the form data and gives this submission a tracking ID:

```json
{"requestId":"request-41","branchId":"north","staffNote":"The returns desk opens at 10:00."}
```

These are application request fields. `requestId` helps correlate local logs;
`branchId` selects the local branch context. They are not automatically visible
to the model. In this teaching example, application code chooses to send only
`staffNote` plus a task instruction and an output contract. The model's narrow
job is to extract fields; the application already keeps the selected branch
alongside the draft. This explains why the model message can omit that selection.

**Literal message text for this illustrative request:**

```text
Extract the desk and opening time stated in the manager's note.
Manager's note (data): The returns desk opens at 10:00.
Return only the fields desk and opens_at, following the supplied contract.
```

That block is the exact text in our illustration, not an actual transmitted call.
The **provider request** would wrap it with provider-specific fields such as the
selected model and supported output-schema configuration. A provider adapter
performs that translation. No specific SDK packet or model ID is implied here;
verify those fields from the source ledger when the real bridge is taught.
The app's field names do not automatically become API field names or model input.

### 3. Give the output its own contract

A **schema** is a set of rules about structure and permitted values. For this
example, require exactly two fields: `desk` is either `returns` or `pickup`, and
`opens_at` is a string. No extra fields are allowed. A string is text; this simple
schema deliberately does not check clock format or actual opening hours.

A possible generated reply is the following JSON text:

```json
{"desk":"returns","opens_at":"10:00"}
```

**Parsing** converts JSON text into a value the program can inspect; successful
JSON parsing establishes JSON syntax. **Schema validation** checks that value
against the application's rules. **Meaning** concerns what the values claim about
the world and whether the evidence supports them. They are separate checks.

| Layer | What exists here | What has been established |
|---|---|---|
| Application request | Staff-submitted note plus local request/branch IDs | The application received fields; no model call yet |
| Provider/model request | Chosen text, task instruction, schema configuration | What the adapter chooses to send; local IDs are not implicitly sent |
| Generated output | The reply's JSON text | A proposed answer, not a verified fact |
| Parsing | A program value with `desk` and `opens_at` | Valid JSON syntax |
| Schema validation | Allowed fields and values checked | This application's data contract is satisfied |
| Evidence check | Compare the time with supplied text or an authoritative schedule | Whether the time is supported; real current hours need a suitable source |

The real provider also reports status and usage around generated content. Here we
focus on the content path. Refusals and incomplete responses are required later.
Nothing in this extraction authorizes changing the library schedule.

### 4. Ask for one new prediction, then give direct feedback

Keep the manager's note unchanged, but suppose the reply says:

```json
{"desk":"returns","opens_at":"11:00"}
```

Ask: “Does it parse? Does it meet our schema? Is 11:00 supported by the manager's
note? What should the application do with it?” Wait before revealing feedback.

Tutor feedback branches (select from the actual response, do not pre-record):

- **Correct:** “Correct: it parses and matches the schema, but the stated time
  disagrees with the supplied text. Flag the discrepancy for correction/review;
  do not present it as verified.” Explain that allowed strings can still be wrong.
- **Partial:** If the learner says it is wrong but skips the layers: “Partially
  correct: you caught the unsupported time. It still passes parsing and schema
  validation; those checks have narrower jobs.” Invite one concise layer label.
- **Incorrect:** If the learner says schema validation proves the time: “Incorrect:
  the schema permits a string there, so 11:00 passes it. The text says 10:00;
  compare against evidence to detect that disagreement.” If they say invalid JSON,
  point to the complete quoted fields and distinguish syntax from meaning.

Accept equivalent language; do not demand these exact words. Record initial
prediction and any correction separately. The earlier H0 repair remains valid
historical evidence even if a new response needs help.

### 5. Small task: review three proposed replies

Keep the same two-field schema. Without writing a validator, have the learner
label the first failing check (parsing, schema, or support) for each card and
state what the application should report to its caller:

```text
A. The returns desk opens at ten.
B. {"desk":"returns","opens_at":10}
C. {"desk":"pickup","opens_at":"09:00"}
```

The manager's note still mentions only the returns desk at 10:00. Let the learner
produce a three-row note in their own words. This is analogous review practice,
not an implementation or replacement for the assessed classifier.

Tutor feedback after the attempt: A is ordinary prose, not JSON; B parses but
violates the string requirement; C parses and matches the schema but is unsupported
by this manager's note. That does not prove pickup really opens at a different
time; it means this input does not support the claim. Return a clear failure or
review-needed outcome for the relevant layer. Do not reveal classifier error-code
logic or invent new lab acceptance requirements from these cards.

### 6. Explain back, then use the existing gate and lab

Ask for a short explanation in the learner's own words: “What does the
application send, what does the model return, and what do parsing and schema
validation prove? Give one thing they cannot prove.” Ask which local app field
was omitted from the illustrative message. Do not ask them to repeat the whole
August conversation. Label feedback correct/partial/incorrect with a reason.

Use the existing different-context gate from the session plan and unchanged
rubric; success in this analogous task alone does not complete that gate or lab.
Two gate misses invoke the normal guided-repair route, not a third lecture; the
tutor must prepare and verify any missing public repair scaffold in scratch
before assigning it. After the gate, complete the Result bridge below before
entering the lab. For the lab, the learner runs the existing failing tests and
writes their own implementation. Use the evidence step before hints and log
actual H0–H5 assistance. Initial worked instruction and help during an assessed
attempt must be distinguishable; any analogous-example hint is recorded as H4
under the normal ladder. Do not give the learner the assessed solution.

### 7. Bridge to application-owned Result handling

After the conceptual gate, verify this prerequisite before starting the lab.
Keep Sam's existing screen and note: the model proposes `desk` and `opens_at`;
an application-owned helper checks the reply and reports success or failure to
the screen-handling code. The model does not generate the helper's Result wrapper.

In this small example, the helper checks parsing and schema only. Successful
validation returns `{ok:true,value:...}`; an expected validation problem returns
`{ok:false,error:...}`. An error can identify a field when a particular field
violates the rules. Explain an exception as an interruption of normal execution:
the helper handles expected parse failures so the caller receives a usable failure
value. “Success” here does not claim source support or permission to publish.

Use the latest pending prompt if resuming. As of the review, it asks whether a
reply with numeric `opens_at: 10` produces success or failure and which field
the error should identify. Wait for the learner's response and record actual
assistance. Do not replay the earlier three-card exercise or supply classifier
implementation logic. Once this prerequisite is demonstrated, check available
time and use the existing public lab and toolchain; the learner writes the code.

## Required later

The generated table below maps postponed topics to milestones/gates. These are
teaching destinations, not extra acceptance tests for Lab 01. The shape/truth
limit is understood now; measuring score calibration is later. Security and
spending controls remain mandatory before the relevant operations.

<!-- pilot-required-later:start -->
| Topic | Required destination |
|---|---|
| provider-policy | M1 / V17 |
| streaming-refusal | M1 / V17 |
| confidence-limits | M6 / V25 |
| live-reservations | M1 / V16 |
| workflow-contracts | M2 / V15 |
| approval-compensation | M5 / V23 |
| effect-recovery | M5 / V23; M8 / V26 |
| mcp-contracts | M3 / V20 |
| mcp-remote | M8 / V34; M3 / V20 |
| retrieval-access | M4 / V21 |
| security-regressions | M6 / V22(>=8); M8 / V22(12/12) |
<!-- pilot-required-later:end -->

Read [scope](../SCOPE.md) for original requirements versus clarifications and
added work. Within M1, streaming/refusal and reservation bridges require authored
public exercises and verified prerequisites before assignment or any live use.

## Optional exploration

Parallel agents/programmatic tools, advanced retrieval, vendor compaction or
long-term memory builds, and ablation experiments may be explored after a
measured need. Their structured references live in the course map. None is
required for this pilot or durable mastery. Required authorization, scoped state
and recovery rules apply to any optional implementation.

## Record actual pilot evidence only after participation

Append a dated “M1-01 teaching pilot attempt” section through the normal journal
workflow, preserving existing observations. Capture the actual prompt/case,
initial response, direct feedback and revision, task artifact, explain-back,
phase minutes and highest hint per exercise. Link artifacts normally; do not
write placeholder scores or estimated timing into the journal.

| Measurement | Evidence to collect |
|---|---|
| Explain the contract and its limits | Own-word explanation separating application/provider input, output, parsing, schema and support |
| Predict a new case | Initial 11:00 prediction plus correct/partial/incorrect feedback and any revision |
| Apply the idea | Learner's three-card review and later lab results, reported separately |
| Assistance | Teaching exposure versus actual per-exercise H0–H5 help, including repeats or scaffolds |
| Clarity and pacing | Learner's feedback on orientation, terminology, number of steps and pace; record their words |

Ask explicitly what felt clear or unclear and whether pacing should change.
There is no scored earlier gate baseline. Do not claim fewer hints than August,
turn an unfinished gate into a failure, or attribute improvement causally to this
format. Prior exposure limits comparison. Close only when the session is genuinely
complete through the normal transaction; preparation alone creates no evidence.

Phase B was authorized and resumed on 2026-09-05. Subsequent participation is
recorded in the journal; consult its latest handoff rather than the preparation
date. The course map's preparation status does not claim a completed observed pilot.
Adapt during the attempt. Phase C broader restructuring remains pending patterns
of learner observations and feedback; one session informs design without proving
effectiveness. Record subsequent participation in the journal.
