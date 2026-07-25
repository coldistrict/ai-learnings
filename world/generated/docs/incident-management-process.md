# Incident management process

doc-id: incident-management-process

Severities: Sev1 (customer-visible money movement broken) · Sev2 (degraded
with workaround) · Sev3 (internal only). Every incident gets: a ticket, a
timeline, evidence links, a cause hypothesis with a falsifying check, and a
postmortem for Sev1/Sev2.

Investigation discipline: symptoms in one service frequently originate in a
dependency (see each runbook's dependency list). State expected vs actual,
find the first divergence in the data flow, and name the trust boundary it
sits on before proposing remediation. Draft incident updates are reviewed by
the on-call before posting — updates that assert an unconfirmed cause are the
most common postmortem regret.
