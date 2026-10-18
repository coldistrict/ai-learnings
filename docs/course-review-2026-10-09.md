# Course review and focused improvements — 2026-10-09

The curriculum has a coherent progression from model contracts to a useful,
evaluated, operable integration. Its strongest elements are one cumulative
project, explicit failure cases, independent learner work, delayed transfer,
and honest limits on what tests and synthetic pilots establish. The most useful
change now is better teaching delivery and continuity, not a larger syllabus.

This review preserves the ten milestones, existing scope and gates, and the
108–147-hour planning estimate. Changes are tutor-authored under
[ADR-0014](../learning/DECISIONS.md#adr-0014--focused-teaching-refinement-2026-10-09).

## Learner evidence

With the learner's permission, reviewed 20 recent turns from **Pilot M1-01
teaching structure** (chat `01a07272-9410-7390-9947-1cf429add08e`) and four turns
from **Learning System Design Efficiently** (chat
`69da61cd-5e48-83ea-bb41-7b7d1baa352e`). Dates below use America/Toronto.
This is a relevant sample, not a claim to have examined all conversation history.
Unrelated personal chats were not used to infer learning preferences.

Local evidence includes the two closed diagnostic journals and the current
M1-01 draft, `learning/journal/.in-progress/67aae9b3-bd60-485a-809b-ca71930d8a33.md`.
The draft is ignored local recovery data and may not exist in another clone.
This report summarizes teaching observations so future tutors need not retrieve
the original chats; the current journal remains the source of progress.

| Evidence | Supported interpretation | Practical response |
|---|---|---|
| April 11: asks to learn system design efficiently, topic by topic, using first principles | Explicit interest in mechanisms and efficient progression | Explain the problem and why the mechanism exists before naming its parts |
| August diagnostic journals: unfamiliar tasks identified as unknown; asks for instruction | New AI concepts need teaching; diagnostic uncertainty is not incapacity | Keep diagnostics valid, then teach before independent application |
| September 6: asks for continuous adaptation and assurance that new chats resume unfinished work | Wants a stable path with responsive teaching and continuity | Keep outcomes stable and use the latest handoff to select the next step |
| September 12: asks who uses the library screen, where the input comes from, and why extraction is useful; then approves the repaired staff scenario | Missing causal context obstructed this example; concrete orientation helped | Establish roles, purpose, screen, input, and downstream use before JSON |
| September 12: correctly distinguishes input selection and first failing checks in three replies | Narrow conceptual evidence after instruction | Progress to application; avoid repeating all successful questions |
| September 19: overlooks differing order IDs, then corrects after H2 and generates the same-customer/wrong-order counterexample | Assisted transfer plus independent design reasoning; not evidence of an enduring global misconception | Preserve the hint history and distinguish intended action from allowed action |
| September 19: challenges redundant customer effort and remaining model risk | Evaluates practical value and challenges inconsistent examples | Explain AI's contribution and allocation of responsibility; accept simpler designs |

The resulting [teaching profile](../course/LEARNER-PROFILE.md) is provisional.
There is insufficient evidence to claim a preferred sensory modality, exceptional
or weak memory, an attention issue, or independent M1 implementation ability.
The latest reviewed handoff still awaits the Result-handling response and lab.
Calendar gaps are not measured practice time or a delayed-recall result.

## Improvements made

| Finding | Focused change |
|---|---|
| Chapters often begin with terminology before a human problem | Each guide now opens with a short practical problem connected to the proposed NimbusPay workflow |
| The curriculum table shows topics but makes the growing product less apparent | Added a short three-stage project progression; planned capabilities remain clearly distinguished from implemented labs |
| Teaching preferences were spread across a long draft and earlier chats | Added a compact profile and linked it through adaptive teaching and authoring guidance used by both tutors |
| Correct answers could lead to more fragmented checks, and design questions could prolong the current concept | Added guidance to choose one purposeful activity, answer objections directly, and return to the objective once resolved |
| Pilot preparation wording lagged behind actual participation | Updated dated continuity notes and README status; current journal takes precedence |
| The next bridge was recorded in chat but absent from the reusable pilot | Added the already-introduced Result-handling bridge, preserving its pending response and public lab contract |
| An abstract reservation example did not make the user's role or intended action explicit | Added an office booking context and clarified meaning versus permission |
| Plugin guidance presented a compatibility layout without naming it as such | Clarified the supported Codex compatibility layout and the separate portable format; no scaffold migration |
| An existing pilot-data check still expected `visitorText` after September's change to `staffNote` | Updated that single assertion to the established staff scenario; the pre-review snapshot confirmed this mismatch already existed |

Chapter openings are motivation, not extra exercises. No new gates, tools,
framework builds, scoring fields, session transactions, or learner code are added.
The familiar library setting remains in the current pilot; new chapter openings
are not a reason to restart it. The all-chapters migration status remains pending.

## Research and documentation checks

The [IES learning practice guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/1)
supports alternating worked examples and practice, connecting concrete and
abstract representations, explanatory questions, and revisiting learning over
time. These reinforce existing course mechanisms. Their application to this
adult tutoring context is a design judgment, not evidence that this revision
has improved retention. The [Pashler and colleagues review](https://www.psychologicalscience.org/journals/pspi/j.1539-6053.2009.01038.x/)
does not justify assigning a fixed learning-style label and matching all teaching
to it. Personal preferences and observed task performance remain useful evidence.

All 17 version-sensitive SOURCE_LEDGER rows were checked against official page
content on 2026-10-09. Existing stable conceptual guidance was retained. Notable
checks and adjustments:

- [OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
  and [Claude structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs):
  request format, schema limits, refusal/incomplete handling, and the documented
  Claude enum-case caveat. The course correctly separates shape from factual support.
- [MCP revision changes](https://modelcontextprotocol.io/specification/2026-07-28/changelog)
  and [authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization):
  the pinned stateless request/discovery contract and token/access boundaries remain
  the reference; installed-client compatibility is still an execution question.
- [OpenAI plugin packaging](https://developers.openai.com/plugins/build/plugins):
  clarified supported compatibility versus portable packaging. Updated the skill
  source to its current [Learn destination](https://learn.chatgpt.com/docs/build-skills)
  after checking repository paths and progressive loading. Checked Claude's
  [manifest reference](https://code.claude.com/docs/en/plugins/manifest-reference)
  for the optional-manifest claim and updated that ledger URL.
- [Evaluation guidance](https://developers.openai.com/api/docs/guides/evaluation-best-practices)
  still gives October 31, 2026 for hosted Evals becoming read-only and November 30
  for shutdown. The course's local, provider-neutral evalkit remains appropriate.
- The remaining rows cover Claude skills/Messages, Agent Skills, MCP Inspector,
  model controls, context engineering, harnesses, and contextual retrieval; exact
  official URLs and checked claims remain in the [source ledger](../learning/SOURCE_LEDGER.md).
- [Node release status](https://nodejs.org/en/about/previous-releases) still lists
  v22 as LTS. Local commands returned Node v22.22.2 and npm 10.9.7. This establishes
  the toolchain used for these checks, not latest-patch status.

No provider call, paid benchmark, plugin installation, or host compatibility test
was performed. Documentation verification does not establish account availability
or runtime behavior. Relevant sources still need rechecking at implementation.

## Verification

| Check | Result |
|---|---|
| `npm run course:check` | Pass: 41 topics, 136 subskills, 206 local references and 20 source uses; 108–147 hours; all ten full chapter migrations remain pending |
| `npm run course:test` | 36/36 pass after correcting the pre-existing pilot field-name mismatch |
| `npm run learn:check -- --strict` | Pass, including dates for all 17 checked source rows |
| `npm run skills:verify` | Pass: both existing host wrappers retain the same current shared body |
| `npm run learn:next` | Still resolves to resume the same open M1-01 session |
| `git diff --check` | Pass |

The [preservation record](verification/evidence/course-review-2026-10-09-preservation.json)
compares against the working tree at review start, including earlier uncommitted
changes and the ignored draft. Of 198 original files hashed, 179 remain identical;
19 tutor-owned files changed. All 64 explicitly protected files remain identical,
including learner work, lab materials, journals, learning state, scope metadata,
and prior prompt/skill/session-generator changes. Three new files contain this
review, the teaching profile, and preservation evidence. The pre-existing adaptive
policy was already untracked and was extended in place.

These checks establish consistency and preservation, not learning effectiveness
or live API behavior. The invariant checker also prints blockers from the older
prerequisite inventory (host CLIs and portability toolchains); that inventory was
not refreshed here and is not a current machine diagnosis. No such prerequisite
was needed for these documentation and offline checks.

## Remaining course work

The existing M1 refusal/streaming/provider and positive-budget bridges, and later
executable labs, still need just-in-time authoring before assignment. This review
does not mark them implemented. Full chapter restructuring is deliberately deferred;
these limited teaching changes can be assessed through ordinary participation.
No user action is required to apply this revision. When teaching next resumes,
the journal's pending Result-handling step takes priority; this maintenance does
not begin that lesson or answer its question on the learner's behalf.
