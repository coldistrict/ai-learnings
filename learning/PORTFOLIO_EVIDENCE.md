# PORTFOLIO_EVIDENCE — append-only evidence/provenance index (plan §9.1, §12)

Append one entry per learner-defensible artifact: what it is, where it lives,
who authored it (learner vs tutor), and the session UUID that produced it.
Never list tutor scaffolding as learner build evidence (plan §8.5).

Format:

```
- <date> | <artifact> | <path> | author: learner|tutor | session: <uuid> | notes
```

---

- 2026-07-25 | Learning OS, world generator, scenario packs 01–03, M0 diagnostic, M1 labs 01–03 (scaffolds/tests/fixtures) | tools/, world/, scenarios/, diagnostics/, labs/ | author: tutor (claude, Stage 0–2) | session: none (pre-session authoring) | infrastructure, not learner build evidence (ADR-0002)
