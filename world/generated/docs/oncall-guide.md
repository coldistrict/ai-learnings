# On-call guide

doc-id: oncall-guide

Rotations are weekly per team (see each runbook's owner/on-call line). The
on-call owns triage, not necessarily the fix. Standing rules:

- Reproduce or capture evidence before mitigating when customer impact allows.
- Prefer the runbook's standard checks over improvisation; note gaps you find
  so runbooks improve.
- Escalate on Sev1 immediately; never investigate a money-movement outage solo
  for more than 15 minutes.
- All external communications go through the incident ticket, not DMs.
