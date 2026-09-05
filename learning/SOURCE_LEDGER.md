# SOURCE_LEDGER — docs-freshness table (plan §14; ADR-0009)

One row per version-sensitive claim. The 2026-09-05 review opened the linked
primary documentation and checked claim content. This is documentation evidence,
not proof of runtime behavior or account availability. `verified-in-lab: no`
means SDK/host/live validation remains required at implementation.

Recheck after >30 days, a relevant release, or the named milestone boundary.
The `sources:` blocks in `course/` refer to exact claim names below. Recheck
the relevant page before teaching, then update truth, URL, and date together.
`npm run learn:check -- --strict` detects stale dates; `npm run sources:check`
checks link health/redirects only. Neither establishes semantic correctness.
`learning/sources-report.json` remains a dated historical link report until rerun.

| claim | current truth | official URL | as-of date | verified-in-lab | recheck trigger |
|---|---|---|---|---|---|
| MCP current spec revision | Revision 2026-07-28: self-describing stateless requests and optional extensions; use the recorded revision's discovery/request contract, with older lifecycle behavior isolated as compatibility | https://modelcontextprotocol.io/specification/2026-07-28 | 2026-09-05 | no | >30d, new spec revision, or M3 start |
| MCP security best practices | HTTP authorization requires resource-bound token validation, appropriate scopes and issuer checks; accepting or transiting other-resource tokens is forbidden; stdio uses environment credentials | https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization | 2026-09-05 | no | >30d or M3/M8 start |
| Anthropic structured outputs | JSON output uses `output_config.format`; strict tools use `strict: true`; schema limitations, refusal/max-token outcomes, and enum/const capitalization caveats require adapter handling | https://platform.claude.com/docs/en/build-with-claude/structured-outputs | 2026-09-05 | no | >30d or M1 lab 01 |
| OpenAI structured outputs | Responses structured output uses `text.format` with supported strict JSON Schema; handle refusal and incomplete results separately; shape compliance does not establish factual accuracy | https://developers.openai.com/api/docs/guides/structured-outputs | 2026-09-05 | no | >30d or M1 provider-swap exercise |
| Claude Code plugins | Course layout uses `.claude-plugin/plugin.json` with native skills, hooks and MCP components; current docs also describe optional manifests for default component layouts; verify installed-host behavior | https://code.claude.com/docs/en/plugins | 2026-09-05 | no | >30d or M7 start |
| Claude Code skills | Repository skills can use `.claude/skills/<name>/SKILL.md`; invocation, metadata, and plugin discovery follow host-specific rules | https://code.claude.com/docs/en/skills | 2026-09-05 | no | >30d or M7 start |
| Codex plugins/skills | Repository skills use `.agents/skills/<name>/SKILL.md`; name/description select a workflow and full instructions load when selected; native host configuration remains distinct | https://developers.openai.com/codex/skills | 2026-09-05 | no | >30d or M7 start |
| Agent Skills open standard | SKILL.md with name and description plus optional scripts/references/assets; a shared authoring format does not establish identical host execution or trust behavior | https://agentskills.io/specification | 2026-09-05 | no | >30d or M7 start |
| OpenAI hosted Evals retirement | Official guidance still states read-only on 2026-10-31 and shutdown on 2026-11-30; keep evalkit local/provider-neutral and recheck timeline before platform use | https://developers.openai.com/api/docs/guides/evaluation-best-practices | 2026-09-05 | no | >30d, M2 evalkit design, or M6 release gate |
| Anthropic Messages API + current models | Messages reference supplies current model identifiers and request/response fields; resolve chosen model, account access, SDK behavior, and pricing before live calls instead of fixing a model family in the curriculum | https://platform.claude.com/docs/en/api/http/messages/create | 2026-09-05 | no | before each new live model/SDK and >30d |
| Node.js runtime for this repo | Node 22 remains an LTS line on the release page; this shell reports Node v22.22.2 and npm 10.9.7; this is compatibility evidence, not a latest-patch claim | https://nodejs.org/en/about/previous-releases | 2026-09-05 | yes (local version commands 2026-09-05) | >30d or milestone-boundary toolchain review |
| MCP Inspector | Official debugging client; pin the Inspector/SDK version for reproducible testing and verify it against the selected protocol/client | https://modelcontextprotocol.io/docs/2026-07-28/tools/inspector | 2026-09-05 | no | >30d or M3 start |
| Codex plugin packaging | `.codex-plugin/plugin.json` is the entry point; skills, MCP configuration, and hooks are optional components; installed plugins do not automatically confer hook trust | https://developers.openai.com/plugins/build/plugins | 2026-09-05 | no | >30d or M7 start |
| OpenAI model and reasoning controls | Model guidance documents model-dependent effort, tools, compaction and other capabilities; select supported settings by measured task quality/cost/latency and verify exact model/SDK support before use | https://developers.openai.com/api/docs/guides/latest-model | 2026-09-05 | no | before model change, M1/M5, or >30d |
| Context engineering | Curate instructions, evidence, tools and working context; compaction and external state help manage finite context but need task-specific evaluation | https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents | 2026-09-05 | no | >30d or M5 design review |
| Long-running agent harnesses | Incremental work, explicit progress artifacts, and end-to-end verification support continuity; application-specific recovery still needs durable state and effect reconciliation | https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents | 2026-09-05 | no | >30d or M5/M8 recovery design |
| Contextual retrieval | Adding document context to indexed chunks is an optional retrieval technique; compare it against the labeled baseline rather than assume a universal gain | https://www.anthropic.com/engineering/contextual-retrieval | 2026-09-05 | no | >30d or M4 optional experiment |
