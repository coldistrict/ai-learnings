# Course review and refresh — 2026-09-05

Reviewed and edited by Codex at the learner's request. This is tutor-authored
course infrastructure, not evidence of learner implementation or mastery.

## Assessment

The course's strongest feature is its design: one coherent capstone, evidence
before promotion, explicit learner ownership, a local eval harness, security
boundaries, delayed transfer, and an enablement workstream. Preserve those.

The main weakness was the gap between that design and accessible teaching
material. Most local milestones contained titles and gates rather than clear
explanations. Three M1 labs were runnable as exercises, but did not cover all
the production behavior named in M1. Product facts and progress text had drifted.
The improvement is a teachable reference layer integrated with adaptive sessions,
with explicit limits on what the existing exercises actually prove.

Scope reviewed: the original v3 plan and verification contract; README and
START_HERE; curriculum/competencies/source ledger; tutor prompts and shared-wrapper
workflow; both public diagnostic briefs; the three M1 lab contracts, teaching
plans and rubrics; relevant learning navigation/freshness checks. Scenario answer
keys and withheld ground truth were not read. Existing learner implementation
and scores were not assessed or rewritten.

## Findings and changes

| Finding | Improvement | Where |
|---|---|---|
| Later milestones lacked local explanatory material | Ten M0–M9 guides with prerequisites, examples, practice, completion evidence, and a glossary | [Course guide](../course/README.md) |
| Concepts appeared as lists without important guarantee boundaries | Explain shape/meaning/authorization, confidence calibration, replay/live, timeout/cancellation, and citation validity/support separately | M1, M2, M4 |
| Repair lesson said models “usually” fix their output | Describe measured bounded repair and distinguish refusal, truncation, invalid requests, and unsupported facts | [M1](../course/01-model-contracts.md), lab 02 |
| Lab 03's cap wording implied hard positive live protection | Demonstrate the overspend counterexample; require public reservation/concurrency/unknown-usage bridge work before live enforcement | M1, lab 03, [authoring standard](../course/AUTHORING.md) |
| Original MCP session/initialize model had become revision-specific | Teach the current 2026-07-28 request/discovery contract and explicitly isolate legacy compatibility | [M3](../course/03-mcp.md), ADR-0009 |
| Context and long-running execution needed more depth | Explain context selection, compaction, scoped memory, tool discovery, effect reconciliation, and recovery | [M5](../course/05-context-and-agents.md) |
| Evals could be interpreted as a single score | Add split leakage, negative-control graders, outcome/trajectory scoring, ablations, variability, and sample limitations | [M6](../course/06-evaluation-and-security.md) |
| Retrieval and production needed lifecycle explanations | Explain cache isolation, access revocation, freshness, admission control, queues, and compatible rollback | M4, M8 |
| Pilot success could overstate value | Count human correction cost; explain matched cases/order effects and synthetic-pilot limits | [M9](../course/09-enablement.md) |
| README/START_HERE claimed no sessions and M0 next | Use generated progress and the live next-action command | README, START_HERE |
| Headline hours differed from the milestone arithmetic | State the actual unskipped sum, 108–147 hours, with elapsed-time caveats | Course guide, README, curriculum |
| Empty module lists were described as completed | Route unauthored milestones to lesson authoring and retain pending gates | `tools/learn/lib.js`, V12 |
| Freshness test depended on one historical date/revision | Use a dated-current-revision check and deterministic fresh/stale test dates | V10a |

## Current-source review

Seventeen claim rows were checked and dated in the
[source ledger](../learning/SOURCE_LEDGER.md). Documentation verification is
distinct from SDK/host/live testing. Relevant corrections and confirmations:

- The MCP revision changes are substantial enough to change the M3 teaching
  model, while preserving compatibility objectives.
  [Official MCP revision changes](https://modelcontextprotocol.io/specification/2026-07-28/changelog).
- Structured output still requires explicit refusal/incomplete handling and
  application-level meaning checks. Claude's current documentation also names
  enum/const capitalization caveats.
  [OpenAI](https://developers.openai.com/api/docs/guides/structured-outputs),
  [Claude](https://platform.claude.com/docs/en/build-with-claude/structured-outputs).
- Current skill/plugin documentation supports teaching shared workflows with
  product-specific packaging and separately verified hook trust/execution.
  [OpenAI plugins](https://developers.openai.com/plugins/build/plugins),
  [Claude plugins](https://code.claude.com/docs/en/plugins).
- OpenAI's published hosted Evals transition dates remain in its evaluation
  guidance; retaining a local provider-neutral evalkit remains appropriate.
  [Evaluation guidance](https://developers.openai.com/api/docs/guides/evaluation-best-practices).

Context engineering and long-running harness techniques are integrated into
existing milestones. Programmatic tool calling, reranking/contextual retrieval,
and parallel agents are optional experiments justified by an observed problem
and comparison with a baseline. No universal “best model,” hard-coded current
price, unsupported framework migration, or additional platform dependency was
introduced. Older job-market evidence remains historical; M9 rechecks postings.

## Verification

| Check | Result |
|---|---|
| `npm run verify:v12` | PASS, 6/6 checks; resume/remediation/review ordering retained and unauthored-milestone case covered |
| `npm run verify:v10a` | PASS, 13/13 checks; 17 complete source rows; exactly one stale fixture detected; current strict invariant check passes |
| `npm run verify:v11` | PASS on 10/10 static checks; two live-host subchecks remain BLOCKED in the harness's recorded inventory |
| `npm run labs:audit` | PASS, 3 labs, 18 acceptance criteria, zero unmatched tests or violations |
| `npm run skills:verify` | PASS; both native wrapper bodies remain identical/current and load START_HERE |
| `npm run learn:next` | Preserves resume of the existing interrupted session |
| `git diff --check` | PASS |
| Local content consistency audit | PASS; 93 local Markdown links resolve, 20 source references map to ledger rows, all 10 milestone guides exist, and hour totals agree |
| Learner/progress preservation | PASS; all 20 files hashed before editing retain identical SHA-256 hashes, including the active session and journals |
| Existing course contract preservation | PASS; original milestone IDs/titles/hours/modules/gates and all three lab acceptance-criteria sections are unchanged |

The full historical Stage-0 suite and learner lab implementation tests were not
rerun: this refresh did not implement learner solutions, change their tests, or
exercise the whole session transaction. The targeted checks cover the modified
navigation/freshness logic and the teaching contracts. V11's blockers are based
on the dated stored inventory and missing live artifacts; they are not a new
claim about CLI availability in every current shell. No live teaching session,
model benchmark, cloud deployment, or paid API call was performed for this review.

The historical `learning/sources-report.json` was not relabeled as a new network
link audit. The official pages were opened through documentation/web tools;
semantic review and the offline freshness/schema checks are the evidence here.

## What still happens during learning

The content refresh is available now. The learner's active M1 session, closed
journals, diagnostic results, selected Go port, and unapproved live-spend cap are
preserved. None of the new writing grants competency credit.

M1's production bridge and M2–M9 executable labs still need just-in-time authoring,
solvability QA, and execution with the learner under [the teaching standard](../course/AUTHORING.md).
Capstone implementation, host compatibility, live benchmarks, remote operation,
and interview readiness remain future demonstrated outcomes. The guides explicitly
label this distinction. No user setup or approval is needed to read the improved
course; user participation and any live-spend/account authorization become relevant
when those learning activities occur.
