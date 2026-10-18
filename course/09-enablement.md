# M9 — Enablement and project defense

Prerequisite: the implemented capstone and its evidence. Outcome: an honest
pilot report, a usable adoption plan, and demonstrated interview readiness.

## The practical problem

Noor's team tries the assistant. Drafts appear faster, but operators spend time
checking and correcting them. Has the workflow improved? You will measure the
whole task, including review effort, and decide whether to expand, revise, or
stop. Your final demonstration should explain one useful outcome, one failure,
and the evidence behind your choices. That makes the project defensible to both
an engineering interviewer and the people expected to use it.

## Enablement includes the people doing the work

Discover a workflow with its operators before choosing a model or platform.
Document the current process, exception handling, access owner, cost of mistakes,
and what users consider an acceptable result. Choose a problem with both a useful
outcome and someone responsible for maintaining it.

Build/buy decisions compare integration effort, data controls, evaluation access,
reliability, support, migration risk, and ongoing ownership. A low per-token price
does not make a system inexpensive if operators must correct every output.
Define who owns the tool, data, incidents, training, and eventual retirement.

## Worked example: pilot economics without inflated claims

Use synthetic figures: a manual process needs 8 operator minutes/task. Assisted
drafting takes 3 minutes plus 2 minutes of review/correction. Net human time saved
is **3 minutes**, not 5. Across 100 comparable tasks, that is 300 minutes, or
5 hours. If the assumed labor value is $40/hour, gross time value is $200.
Subtract API/tool cost, training, support, and maintenance to estimate net value.

Saved time is not necessarily cash savings: it may become capacity for other
work, and only useful adopted work realizes that capacity. State the assumptions
and show sensitivity to correction rate, adoption, and request volume. Track
quality and unsafe-action rate so speed does not hide worse outcomes.

## Design a comparison that can disappoint you

Write the pilot protocol before observing the results: cases, success definition,
manual/assisted conditions, scoring, timing, exclusions, and stop rules. Preserve
held-out packs. If one learner sees the same case manually and then with AI,
learning the answer confounds the comparison. Prefer matched unfamiliar cases
and counterbalance order where feasible; report the residual case-difficulty
and single-operator limitations.

Measure completion, evidence accuracy, unsafe actions, elapsed and human time,
correction rate, and total cost. Report per-case data and sample size, including
failed or abandoned attempts. Record predicted deltas before running the pilot,
then compare those predictions to the observations.

Label this exactly as a **portfolio pilot methodology using synthetic data**.
It demonstrates how you would evaluate deployment; it is not evidence of company
ROI, organization-wide adoption, or performance on real incidents.

## Teach and support the workflow

A practical onboarding guide gives the starting prerequisites, one representative
task, a way to recognize a good answer, a known failure, and an escalation path.
Run a workshop and office-hours simulation. Observe where people need help;
confusion can reveal a product issue rather than a training deficit.

Propose a bounded rollout with explicit expand, revise, and sunset criteria.
Example: expand only after acceptable quality and review burden across the pilot
cases, with no observed unauthorized effects; revise if useful answers require
too much correction; stop if the workflow has no responsible owner. Set actual
thresholds from your baseline and operator needs, not an arbitrary universal score.

## Defend the project with evidence

Build interview stories from first attempts, failures, tradeoffs, and measured
improvements. A useful narrative states the problem, rejected alternative,
implementation boundary, observed result, and remaining limitation. Distinguish
your code from tutor scaffolding and AI assistance. Do not claim a technique
merely because its name appears in the repository.

Prepare a five-minute demo and a deeper technical defense. Intentionally show
one safe failure and its recovery, with a replay fallback clearly labeled when
used. Rehearse live debugging, tool-contract design, retrieval diagnosis,
threat modeling, eval design, and executive explanation. Resample five relevant
current job postings at M9 and record observations separately from your inference
about priorities; the July sample is historical evidence, not today's market.

Fine-tuning belongs in your tradeoff vocabulary: it can change learned behavior
from examples, but does not replace permission checks or supply a live source of
truth. First establish a measurable persistent failure, data rights, evaluation
splits, and whether prompting/retrieval already solves the problem. Training
large foundation models and GPU serving remain specialist work.

## Completion evidence

Core build complete requires the original gate artifacts, including V27/V28,
the selected-language port V32, growing evalkit evidence V33, pilot V35, and
**6–8 valid scenario packs** under V36. Add the later packs as milestones need
them, keeping their assessed answers withheld. V29 is the additional
interview-readiness gate, not an automatic
consequence of finishing the repository.

Deep-target competencies must be durable and working-target competencies at
least usable. The base readiness contract uses a 0–4 scale:

| Timed gate | Time | Required evidence |
|---|---:|---|
| Unfamiliar tool/MCP contract build | 45 min | Working boundary and tests, score at least 3/4 |
| Broken trace/retrieval diagnosis | 45 min | Root cause and regression eval, at least 3/4 |
| AI system design | 45 min | Trust, cost, and rollout decisions, at least 3/4 |
| Project defense | 20 min | Evidence-backed answers to adversarial follow-ups, at least 3/4 |
| Enablement/ROI/30-60-90 scenario | 30 min | Defensible workflow and adoption decisions, at least 3/4 |

Three mixed mocks on different days must average at least 3.2, with no dimension
below 2.5, no safety-critical failure, and at least two examiners across the set.
Failed gates schedule remediation and retakes. A 30/60/90 proposal closes the
story: discover and baseline; pilot and evaluate; then roll out or stop with
evidence. “Ready” means demonstrated behavior, never guaranteed employment.
