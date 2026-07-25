# Data freshness and retention

doc-id: data-freshness-and-retention

Freshness SLOs: merchant settlement state ≤ 30 min behind ledger truth;
dashboards ≤ 5 min; analytics warehouse ≤ 24 h. Derived states carry an
`as_of` field; consumers must surface it rather than implying real-time.
Retention: operational logs 30 days hot / 13 months cold; ledger postings are
append-only and permanent; PII lives only in merchant-service with field-level
encryption. Synthetic-world note: every record in this world is generated
fiction — there is no real user data anywhere in this repository.
