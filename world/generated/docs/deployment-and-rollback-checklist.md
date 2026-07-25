# Deployment and rollback checklist

doc-id: deployment-and-rollback-checklist

- Deploys ride the standard pipeline with health gates; deploy markers are
  emitted to dashboards automatically.
- Rollback = redeploy previous artifact version (N−1); never hotfix-forward a
  Sev1 without an incident commander's sign-off.
- After rollback, run the service's post-deploy smoke checks and confirm the
  error step-change reverted before closing the incident.
- A deploy that coincides with an alert is a LEAD, not a verdict: confirm the
  mechanism (diff, config change, migration) before assigning cause.
