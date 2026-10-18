# M8 — Production and operations

Prerequisite: M6 release evidence and M7 tested integrations. Outcome: a
reproducible deployment and demonstrated recovery under realistic synthetic faults.

## The practical problem

Several operators use the incident assistant at once. A dependency slows down,
retries pile up, and a new release starts using stale evidence. The problem now
extends beyond the quality of one reply. You will control how much work enters
the system, detect when service degrades, and practise recovery. A useful release
includes a tested way to stop expansion and restore a known working state.

## Design for bounded work

Reliability starts with admission control: reject, queue, or defer work when
capacity is exhausted. A queue absorbs a burst, not an unlimited sustained load.
Set concurrency limits, run deadlines, per-tenant quotas, and queue-age limits.
Use an explicit outcome for dropped or expired work.

If requests arrive at 5/second and average processing time is 2 seconds, the
average in-flight work is roughly 10 under stable conditions (Little's Law).
This is a starting estimate, not a safe capacity limit: variability, retries,
long tails, and service quotas need headroom and measurement. When arrival rate
exceeds service capacity for long enough, backlog and waiting time grow.

A **circuit breaker** temporarily stops calls to an unhealthy dependency after a
defined failure threshold, with controlled probes for recovery. It differs from
retry backoff for one request and rate limiting across requests. Combine them
deliberately; layers of retries can turn one outage into a request storm.

## Cache the right thing

A response cache reuses a computed answer; a provider prompt cache can reuse
processing of repeated input prefixes. Neither grants permission or guarantees
current evidence. Cache keys and invalidation must account for tenant/access,
document version, prompt/schema version, model identity, and relevant tool state.
Do not cache external writes as if they were pure reads.

Caching improves cost only when hit rate, storage/lookup overhead, and provider
billing behavior make it worthwhile. Record cold and warm results separately.
Batch processing may suit noninteractive evaluation or ingestion, while an
operator waiting for an incident update needs an interactive latency budget.
Check actual product support and pricing at implementation.

## Remote authorization and configuration

Execution reference: [V34 amendment](../docs/verification/RESULTS.md#v34--pinned-http-lifecycle-and-authorization)
under ADR-0009; consult it alongside the original gate before running tests.

For remote MCP, test token expiry, wrong audience, insufficient scope, issuer
mix-up, and forbidden token passthrough against the pinned revision. V34's
protocol tests follow that revision, with the historical initialize/session
sequence tested only on an explicit legacy path (ADR-0009). A token is
evidence of delegated access, not permission for arbitrary targets. Use maintained
authorization components; implementing a full authorization server is outside
the core course. [MCP authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization).

Keep configuration separate from code and secrets separate from prompts and
repositories. Validate required settings at startup without printing credentials.
Inventory data flows through the model provider, tools, logs, caches, and replay
storage; retention and access requirements apply beyond the primary database.
Use synthetic data for course drills and verify real service policies before
any later organizational use.

## Worked example: rolling back a bad release

Version B reduces latency but begins citing stale documents. Stop expansion and
route traffic back to A if A remains compatible with the current data and schema.
Rolling back a container alone will not repair an incompatible database migration
or invalidate poisoned cached answers.

A release unit therefore records application image/build, prompt, schemas,
retrieval index/data version, tool registry, model configuration, and grader/eval
report. Use backward-compatible migrations where possible; test rollback with
representative persisted state. A rollout plan states exposure stages, stop
thresholds, owner, rollback action, and how in-flight work is reconciled.

An **SLI** is a measured indicator, such as successful completed tasks or latency.
An **SLO** sets its target for a stated window. Define success to include correctness
where observable, rather than count every HTTP 200 response. Track a quality
indicator, safety violations, operator corrections, and cost alongside uptime.

## Practice and completion evidence

Run deterministic and replay checks in CI. Exercise local deployment first;
a real remote path requires an authorized account, credentials, and any spending
decision before deployment. Record the missing prerequisite explicitly when
blocked. Do not install infrastructure or claim cloud operation by diagram alone.

Drills: kill a dependency mid-run, cause a retry burst, interrupt after an effect,
revoke access before a cached read, fill the queue, migrate a schema, and roll
back a failed candidate. The public exercise contract names the expected safe
outcome and observable recovery. Include audit/redaction checks.

Deliver V26/V34, all 12 V22 categories, deployment/rollback evidence, and an
operator runbook with detection, containment, recovery, and follow-up actions.
Explain what would fail first at higher load and which measurement would test
your prediction. A local load drill is evidence about that environment, not a
claim of production-scale operation.

sources: MCP security best practices; Node.js runtime for this repo.
