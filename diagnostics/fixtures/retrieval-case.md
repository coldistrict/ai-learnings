# Fixture — m0-a3-retrieval-case (synthetic)

## Query (from an engineer)

> "Records seem to get dropped at page edges when two rows share a
> modification time — is there a standard for this?"

## Retrieval (lexical BM25 over NimbusPay world docs, top 3 returned)

1. `doc-data-freshness-and-retention` (score 7.1) — matched: "records",
   "time" — freshness SLOs and retention windows.
2. `doc-runbook-merchant-service` (score 6.4) — matched: "rows", "state" —
   settlement-state storage notes.
3. `doc-deployment-and-rollback-checklist` (score 5.2) — matched: "standard"
   — deploy discipline.

## Produced answer

> "Per the data-freshness standard, derived states may lag up to 30 minutes;
> records aren't dropped, just delayed. See
> doc-data-freshness-and-retention."

## Known corpus fact (for your diagnosis)

`doc-pagination-cursor-design` exists in the corpus and contains: "rows
sharing the boundary value are silently skipped or duplicated between
pages… cursor: the tuple (updated_at, id)…". It was NOT in the top 10 for
this query.

## Your task

Diagnose the failure: what class of retrieval failure is this, why did BM25
miss the right document for this phrasing, why is the produced answer worse
than a refusal, and what would you measure (metric + dataset) to confirm and
then to fix-verify this class of failure?
