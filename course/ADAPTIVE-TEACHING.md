# Adaptive teaching with stable course goals

Tutor contract accepted in [ADR-0013](../learning/DECISIONS.md#adr-0013--continuous-adaptive-teaching-2026-09-06).
Apply during every teaching session, including the M1 pilot. Keep the diagnostic
teaching-free until scoring ends. Read this short policy alongside the current
guide; use the existing bounded journals for learner evidence.

Also read the compact [learner profile](LEARNER-PROFILE.md) (ADR-0014).
It carries evidenced teaching preferences into future sessions; the current
journal remains authoritative for progress and pending work.

## Teach, observe, and adjust

Start with the lesson's purpose, its place in the application, and the relevant
prior evidence. Introduce unfamiliar terms and show a worked analogous example.
For a new scenario, establish the setting, the people and their roles, their
goal, the screen/action they use, where the input comes from, why the model is
involved, and how its output will be used. Connect these before showing fields
or asking a technical question. A request for this context is teaching feedback;
repair an implausible scenario before assessing the intended concept.
Then invite an explanation, prediction, or small independent application. During
an assessed attempt, wait for the learner's response before revealing that case's
answer. Initial instruction is separate from assistance during an attempt; record
actual H0–H5 help under the existing ladder.

Questions should resolve a useful uncertainty or practise retrieval. Avoid a
question after every sentence or repeated explain-backs of the same example.
When the learner already demonstrates the idea, move to application or transfer.
When they ask a conceptual question, answer it directly before probing again.

## Make the work interesting and keep it moving

Open with a concrete problem: a misleading answer, duplicated draft, missing
evidence, or an operator's unnecessary work. State today's small outcome and
its place in the capstone. Chapter openings are orientation, not extra quizzes.

Keep one coherent setting while introducing a mechanism. Make the allocation of
work explicit: what the human supplies, what the model proposes, what code checks,
and what can actually change. If that allocation changes later, say so. Explain
the ordinary non-AI alternative and the proposed benefit of AI; model use needs
a purpose even in an AI course.

After a worked example, choose one activity that resolves the next uncertainty:
trace a value, predict a changed condition, critique a design, or attempt the
prepared lab. Rotate these across sessions as useful; do not stack them into
extra requirements. Once the learner demonstrates the target, move forward.
If a design question exposes an implausible example, repair it before grading.
Answer directly, connect back to the current objective, and record larger
unanswered questions at their existing later milestone rather than expanding
the current lesson indefinitely.

After a pause, recap the last demonstrated idea and pending step, with all source
data needed for that step. A long calendar gap alone does not justify repeating
a whole lesson. Use actual due retrievals and new responses to decide what needs
repair. End a segment with visible progress, such as a correct trace or tested
behavior, and the reason for the next step. Record the actual result; do not
manufacture a win or relax the gate.

Match the size of an adjustment to its evidence:

| Evidence | Teaching decision |
|---|---|
| An ambiguous or incomplete response | Clarify the uncertain point before deciding it reflects a misconception |
| A specific error in a new attempt | Give precise feedback and change the explanation, representation, or amount of support |
| A correct explanation | Try an independent application or a new context; reduce redundant explanation |
| Repeated difficulty across relevant attempts | Identify the prerequisite gap and use targeted practice or guided repair |
| Consistent independent explanation, application, and judgment | Advance within the dependency sequence and schedule delayed retrieval |
| Feedback that context, terminology, or pacing is unhelpful | Adjust teaching immediately; record it as teaching feedback, not a mastery score |

Give correctness feedback with a reason; accept equivalent wording. Keep initial
answers and assisted corrections distinct. Two gate misses still invoke the
existing guided-repair route. Prepare and verify any missing public exercise
materials before assignment, following [AUTHORING](AUTHORING.md).

## Maintain a provisional assessment by skill

Distinguish explanation, independent build/debug/review, judgment in a changed
case, assistance needed, and delayed recall. An unattempted task is unknown;
one correct answer is evidence about that narrow skill. Confidence, fluency,
typing mistakes, silence, and preferences do not establish technical mastery.
Treat repaired misconceptions as repaired in that attempt; later contradictions
are new evidence, not a reason to erase earlier observations.

At a meaningful transition, state the reason for the next step briefly:
“You demonstrated X; Y remains uncertain; next we'll do Z to check or practise Y.”
State uncertainty honestly. Use the learner's feedback alongside observed work;
do not infer a fixed learning style or a single global ability from the dialogue.

## Persist decisions through the existing journal

Record material observations and teaching changes as they occur in the open
draft's **Adaptive teaching** section. Use a compact entry with:

- **Evidence:** date, skill, prompt/case or artifact, initial response and actual
  assistance. Reference an existing journal observation rather than duplicating it.
- **Assessment:** what that evidence supports, what remains uncertain, and whether
  the observation concerns skill or the quality of teaching.
- **Decision:** the next explanation/practice/transfer and why; note the evidence
  that would support advancing or changing direction.

At pause or close, maintain an **Adaptive handoff**: demonstrated skills with
evidence references, unresolved gaps, relevant teaching preferences, next focus
and reason, and any delayed check still needed. Carry unresolved items forward
into subsequent handoffs with their original evidence references. A future tutor
reads the current draft on resume or the last two closed journals on a new session;
the learner should not have to reconstruct the history.

These are tutor-maintained body notes, not new numeric scores or automatically
enforced close fields. Do not fabricate responses, assistance levels, practice
time, or successful checks. Update formal ledger evidence only through the normal
close transaction. For an actual scheduled competency review, include its date in
the appropriate ledger-change `next_due` and describe the different-context task
in the handoff/`next_review`; prose in `next_review` alone does not schedule it in
`learn:next`. Preserve existing mastery evidence requirements.

## Choose the next lesson and improve the course

`learn:next` retains priority for the open session, mandatory remediation, due
reviews, then the curriculum's next module/gate. Within that action, the tutor
selects the next concept, example, difficulty, and practice from the handoff and
fresh evidence. The command resolves the course step; it does not infer skill
from journal prose. Use the existing remediation queue for a failed gate or
demotion. Keep unfinished module work in the open session; closing a journal
with a module ID causes the resolver to treat that module as covered.

Keep required outcomes, prerequisites, public acceptance criteria, and mastery
standards stable. Compress redundant teaching when evidence supports it; observe
the existing diagnostic skip rules and never waive gates. Preserve delayed,
different-context checks before durable mastery, including independent work and
the required explanation evidence. Adjust pacing within the session lifecycle;
record actual active time, excluding interruptions and course-maintenance work.

Adapt teaching throughout the pilot and later sessions without waiting for a
phase boundary or renewed permission. Correct an evidenced explanation or
sequencing problem in reusable materials when useful, recording the reason.
Broader chapter restructuring needs patterns across observations and learner
feedback; publish assessment changes prospectively and use an ADR for changes to
scope, gates, or planned hours. The pilot remains an evidence-gathering process;
adopting this policy is not proof of educational effectiveness.
