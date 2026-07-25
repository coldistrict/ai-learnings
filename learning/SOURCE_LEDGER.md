# SOURCE_LEDGER — docs-freshness table (plan §14)

One row per version-sensitive claim. Recheck triggers: >30 days old, a major
release, or a milestone boundary. Version-sensitive lesson pages carry a
`sources:` block referencing these rows; lessons re-verify stale rows in a
5-minute docs check before teaching. `npm run learn:check -- --strict` flags
rows older than 30 days; `npm run sources:check` link-checks URLs with
redirect accounting (network required).

| claim | current truth | official URL | as-of date | verified-in-lab | recheck trigger |
|---|---|---|---|---|---|
| MCP current spec revision | Revision 2025-11-25: tools/resources/prompts stable; sampling/roots/elicitation; authorization scoped to HTTP transports; durable tasks EXPERIMENTAL | https://modelcontextprotocol.io/specification/2025-11-25 | 2026-07-15 | no | >30d, new spec revision, or M3 start |
| MCP security best practices | Token passthrough banned; roots are context scoping, not authorization; stdio servers take credentials from environment | https://modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices | 2026-07-15 | no | >30d or M3/M8 start |
| Anthropic structured outputs | GA: `output_config.format` with JSON schema, `strict: true` constrained decoding; documented unsupported-schema list | https://platform.claude.com/en/docs/build-with-claude/structured-outputs | 2026-07-15 | no | >30d or M1 lab 01 |
| OpenAI structured outputs | GA since 2024-08: `response_format: {type: "json_schema", strict: true}`; refusal field in responses | https://platform.openai.com/docs/guides/structured-outputs | 2026-07-15 | no | >30d or M1 provider-swap exercise |
| Claude Code plugins | `.claude-plugin/plugin.json` bundles skills/agents/hooks/MCP servers; marketplace install flow | https://code.claude.com/docs/en/plugins | 2026-07-15 | no | >30d or M7 start |
| Claude Code skills | `SKILL.md` per open Agent Skills standard under `.claude/skills/<name>/` | https://code.claude.com/docs/en/skills | 2026-07-15 | no | >30d or M7 start |
| Codex plugins/skills | `.codex-plugin/plugin.json` bundles `skills/`, `hooks/`, `.mcp.json`, `.app.json`; consumes SKILL.md; manifests/hook schemas NOT interchangeable with Claude Code | https://developers.openai.com/codex | 2026-07-15 | no | >30d or M7 start |
| Agent Skills open standard | SKILL.md format consumed by both Claude Code and Codex; frontmatter name/description required | https://agentskills.io | 2026-07-15 | no | >30d or M7 start |
| OpenAI hosted Evals retirement | Read-only 2026-10-31; shutdown 2026-11-30; local/provider-neutral harness unaffected (evalkit stays local) | https://developers.openai.com/api/docs/guides/evaluation-best-practices | 2026-07-25 | no | M2 evalkit design; M6 release gate |
| Anthropic Messages API + current models | Claude 5 family current (fable/opus/sonnet ids); verify exact model ids + pricing before first live call | https://platform.claude.com/docs/en/api/messages | 2026-07-25 | no | before first live M1 benchmark |
| Node.js runtime for this repo | Node 22 line; local host verified v22.22.2 with npm 10.9.7 | https://nodejs.org/en/about/previous-releases | 2026-07-25 | yes (prereq inventory 2026-07-25) | toolchain upgrade only at milestone boundaries (plan §16) |
| MCP Inspector | Official debugging client, runnable via `npx @modelcontextprotocol/inspector` | https://modelcontextprotocol.io/docs/tools/inspector | 2026-07-15 | no | >30d or M3 start |
