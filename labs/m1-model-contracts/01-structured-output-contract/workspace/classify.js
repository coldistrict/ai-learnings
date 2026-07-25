// LEARNER-OWNED workspace — lab m1-01.
// Implement classifyIncident per the README contract. The tutor does not
// write this code (plan §8.5); tutor edits require your consent and a
// provenance event.
//
// Contract summary (authoritative version: README + fixtures/contract-schema.json):
//   classifyIncident(rawText, provider) -> Promise<Result>
//   Result: { ok: true, value: {category, causal_service, confidence, needs_human} }
//         | { ok: false, error: {code, field?, message} }
//   Never throws for provider behaviors covered by the acceptance criteria.

export async function classifyIncident(rawText, provider) {
  // TODO(learner): call the provider, then validate its text against the
  // contract before trusting a single byte of it.
  throw new Error('TODO: implement classifyIncident (see README acceptance criteria)');
}
