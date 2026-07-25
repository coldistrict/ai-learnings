# integrations/ — capstone plugin packaging (built at M7; plan §7 M7, V31)

Empty by design at Stage 0–2. At M7 the learner builds ONE full-depth native
plugin (skill + MCP config + ≥1 enforcing hook) and a thin second-host
adapter, from one shared semantic core:

- `claude/` — `.claude-plugin/plugin.json`
- `codex/` — `.codex-plugin/plugin.json`

The Stage-0 `teach` skill does NOT satisfy the M7 packaging gate — V31
evidence must reference paths under this directory.
