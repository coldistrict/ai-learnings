// LEARNER-OWNED workspace — lab m1-03.
// Implement runWithPolicy per the README contract. The tutor does not write
// this code (plan §8.5).
//
//   runWithPolicy(providers, request, options) -> Promise<Result>
//   Result: { ok, text?|error?, provider_used?, report }
//   report: { calls, tokens_in, tokens_out, est_cost_usd } on EVERY outcome.

export async function runWithPolicy(providers, request, options = {}) {
  // TODO(learner): backoff on RATE_LIMITED (via injected sleep), fallback on
  // PROVIDER_UNAVAILABLE, pre-flight budget check, full cost report.
  throw new Error('TODO: implement runWithPolicy (see README acceptance criteria)');
}
