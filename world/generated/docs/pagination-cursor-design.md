# Design standard — keyset pagination and cursors

doc-id: pagination-cursor-design

Applies to every paginated scan at NimbusPay (reconciliation, exports, audits).

## The standard
Use KEYSET pagination with a COMPOSITE cursor. A cursor over a non-unique
column (e.g. `updated_at` alone) is a correctness bug, not a style issue:
rows sharing the boundary value are silently skipped or duplicated between
pages.

Correct cursor: the tuple `(updated_at, id)` with a strict tuple comparison
`(updated_at, id) > (:cursor_updated_at, :cursor_id)`, ordered by
`updated_at, id`. Never `updated_at > :cursor` alone.

## Review checklist
- Cursor includes a unique tiebreaker column.
- Comparison is a tuple comparison, not two ANDed inequalities.
- Page size changes must not change the result set, only its chunking.
- A scan re-run over unchanged data returns identical totals (invariant to
  assert in tests).

## Known symptom of violations
Batch totals drift from source-of-truth counts by a handful of rows, worse on
days with bursts of same-timestamp updates (bulk imports, backfills).
