# M7 — Developer tools and packaging

Prerequisite: the tested M3/M5 capability and M6 safety boundaries. Outcome:
the same useful workflow delivered through two verified native integrations.

## The practical problem

A colleague wants to use Noor's incident workflow from their own coding assistant.
The demo worked on the author's machine; the colleague's installation loads the
instructions but never runs the expected check. Packaging is about making the
actual workflow usable and verifiable on each host. You will test the experience
from installation through a useful result and a recoverable failure, so the next
person does not need to guess the missing setup.

## Separate instructions, capabilities, and enforcement

Repository instructions explain how work should be done in a project. A **skill**
packages a reusable workflow and optional supporting resources. An **MCP server**
exposes tools and data. A **hook** responds to a host event. A **plugin** distributes
these pieces using that product's packaging and installation rules.

A skill can instruct an assistant to draft an incident update and cite sources.
The underlying tool must still enforce that “draft” stays local. Hooks may add
checks or feedback, but an untrusted, disabled, or unsupported hook cannot enforce
a policy. Critical authorization belongs at the server/effect boundary as well.

The Agent Skills format centers on `SKILL.md` with name and description metadata.
Keep entry instructions concise and load supporting material when needed; this
is **progressive disclosure**. Explain triggering and non-triggering use cases
so an assistant can select the workflow appropriately.
[Agent Skills specification](https://agentskills.io/specification),
[OpenAI skill documentation](https://learn.chatgpt.com/docs/build-skills).

## Share meaning; verify each host

Keep the workflow's purpose, input/output contract, examples, and safety rules in
one semantic source. Use thin native packaging around it. This repository's
teaching wrappers illustrate the pattern but do not satisfy the capstone gate:
the learner must package the actual incident workflow.

| Surface | Claude Code | Codex/OpenAI plugin packaging |
|---|---|---|
| Project skills in this repo | `.claude/skills/` | `.agents/skills/` |
| Plugin metadata | `.claude-plugin/plugin.json` | `.codex-plugin/plugin.json` |
| Workflow material | `SKILL.md` and references | `SKILL.md` and references |
| Host-specific behavior | Hook events, install/trust/configuration | Hook events, install/trust/configuration |

These paths identify the course's layouts; they do not claim all fields or
discovery rules are interchangeable. Verify current manifests, hook trust, and
cache/update behavior before implementing.

Documentation check, 2026-10-09: OpenAI describes `.codex-plugin/plugin.json` as
a supported compatibility layout. It also documents a portable Agent Plugins
layout with root `plugin.json` and `mcp.json`, using different schemas. Keep the
course's existing layout unless an actual host test justifies migration; renaming
files alone does not convert the formats. Compare the packaging that each tested
host supports before choosing an adapter.
[Claude plugins](https://code.claude.com/docs/en/plugins),
[OpenAI plugin packaging](https://developers.openai.com/plugins/build/plugins).

## Worked example: an installed plugin that does nothing

A workshop participant installs the incident plugin but the enforcement hook
does not run. Possible causes include an untrusted hook, an event that never
fires on that host, a wrong path, stale installed content, or disabled configuration.
A successful installation proves only that installation succeeded.

Create a tiny synthetic trigger with an observable expected result. Inspect the
host's effective configuration and logs; compare source and installed versions;
then test one permitted action and one denied action. Avoid a smoke test that
only asks the assistant whether it knows the skill's name.

For AI-assisted coding, make each change concrete and reviewable: task contract,
bounded edits, relevant tests, diff review, and an explanation of ownership.
An agent-generated test that repeats the same incorrect assumption as its code
does not independently verify the behavior. During this program's scored labs,
the learner still writes substantive code under the existing provenance rules.

## Practice and completion evidence

Build one full-depth native integration and a thin second-host adapter. Record
actual host versions and install, invocation, capability, hook, update, and
uninstall/rollback results. Include one invalid manifest and one missed-hook
failure. A missing host is a named prerequisite blocker, not an excuse to infer
that the second adapter works.

Prepare a 20-minute workshop with a clear starting state, one useful task, one
recoverable failure, and an observable success condition. Have a simulated new
user follow the guide without undocumented setup. Explain what the plugin does,
what permission it needs, and how a team can disable it.

V31 remains the gate. Deliver the native-delta ADR and onboarding evidence.
Explain why identical skill prose does not establish identical security or
execution behavior across hosts.

sources: Claude Code plugins; Claude Code skills; Codex plugins/skills;
Codex plugin packaging; Agent Skills open standard.
