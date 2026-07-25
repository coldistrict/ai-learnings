# Ground truth — pack 01 (TUTOR-ONLY; never read before submission review)

**Root cause.** The reconciliation-scanner paginates with a single-column
keyset cursor: `updated_at > :cursor` ordered by `updated_at` only (L007
predicate; L023 config dump shows `cursor_columns: ["updated_at"]`,
`tiebreaker_column: null`), violating the platform standard
(`pagination-cursor-design`), which requires the `(updated_at, id)` tuple.

On 2026-07-21 at 02:00:00Z, a merchant-service bulk preference backfill
touched 181 rows in one transaction, stamping them all with the identical
`updated_at` (L014). Page 4 of the scan ends mid-group: 164 of the 181
same-timestamp rows fit in the page (L022, L006), the cursor advances to
`2026-07-21T02:00:00Z`, and the strictly-greater predicate skips the
remaining 17 rows — exactly the recurring `delta: -17` (L012, metrics for
both 07-21 and 07-22 scans). Skipped merchants (incl. `mrc_2041`,
`mrc_2287`) never get their settlement state recomputed, so they sit at
`pending_reconciliation` with `state_as_of 2026-07-20` (L015/L016) while the
ledger shows final captures (L017/L018).

**Why "success"**: the scan treats page exhaustion as completion; the count
mismatch is only a warn (L012).

**Remediation class:** `code-fix` — composite tuple cursor
`(updated_at, id)` per the standard; a one-time `data-backfill`/re-scan of
the skipped rows is an acceptable stated follow-up, not the primary class.

**Falsifying check (examples that earn AC-5):** re-run the scan with page_size
changed (e.g. 400 or 600) — if the delta changes or moves, cursor/pagination
is implicated, not load; or query rows with `updated_at = 2026-07-21T02:00:00Z`
ordered by id and show which ids page 4 excluded.
