# M3 — MCP and protocol boundaries

Prerequisite: M2 tool contracts, traces, and negative tests. Outcome: a narrow
stdio server, an automated client suite, and recorded host compatibility.

## What MCP standardizes

Model Context Protocol gives applications a shared way to discover and use
capabilities. The **host** is the user-facing application; a **client** connects
it to a **server**, which exposes capabilities. Your model's native function-call
format and MCP's wire messages are different boundaries; the host bridges them.

Tools perform named operations, resources expose addressable content, and prompts
provide reusable interaction templates. A resource is not automatically public,
and a prompt is not automatically trusted. The server still needs validation,
authorization, timeouts, output limits, and auditing. [MCP specification](https://modelcontextprotocol.io/specification/2026-07-28).

## Teach the revision you actually run

Execution reference: [V20 amendment](../docs/verification/RESULTS.md#v20--pinned-protocol-contract)
under ADR-0009; consult it alongside the original gate before running tests.

The July plan's universal initialize/session mental model is outdated. The
**2026-07-28** revision uses self-describing requests with protocol version and
client capabilities; the initialize handshake is removed and server discovery
is available. Tasks are an extension. Roots, Sampling, and Logging are deprecated,
not instantly removed. Older clients may still require the earlier lifecycle.
[Official revision changes](https://modelcontextprotocol.io/specification/2026-07-28/changelog).

At M3, record the SDK version, server revision, client version, transport, and
supported features. Inspect a real exchange before deciding which lifecycle
tests apply. If a host requires an older revision, isolate that compatibility
path and test it explicitly. Do not combine messages from different revisions
into an invented protocol. Use the current schema and SDK documentation for
exact field names rather than a memorized packet template.

The course amendment preserves V20's intent: correct protocol behavior and
negative cases for the recorded revision. A legacy handshake test remains useful
for a legacy adapter; current clients need current discovery/request tests.
An untested host is recorded as blocked or untested, never inferred compatible.

## Local and remote are different trust boundaries

With **stdio**, the client launches a local process and exchanges protocol data
through standard input/output. Diagnostic logging goes to stderr; ordinary log
lines on stdout can corrupt the protocol stream. Keep environment credentials
within the process boundary and out of prompts, tool output, and logs.

With **Streamable HTTP**, network identity, authentication, authorization,
timeouts, and deployment enter the design. Running on localhost does not prove
the production path is secure. At M8, use the authorization rules for the pinned
revision: audience-bound tokens, scope enforcement, and issuer validation apply;
tokens intended for other services must not be accepted or passed through.
[MCP authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization).

Authorization answers “is this principal allowed this operation on this object?”
It is distinct from discovering that a tool exists. Likewise a root directory
hint, schema description, or tool's read-only annotation does not substitute for
server-side access enforcement.

## Worked example: design the boundary

For a synthetic library, `get_catalog_item(item_id)` accepts one bounded ID and
returns the item version and selected fields. It does not accept an arbitrary
filesystem path. `search_catalog(query, limit)` has a bounded query and result
count, stable pagination, and an explicit indication of truncation. The server
derives permitted collections from authenticated context.

An unknown tool is a protocol-level problem. A known tool reporting an unavailable
catalog is an execution failure. Preserve that distinction using the protocol's
documented error/result mechanisms; do not return every failure as successful
natural-language text. Exact schema and result fields follow the pinned revision.

A request ID correlates messages. It is not necessarily a durable business
operation ID. Reissuing a request after a disconnect must preserve application
idempotency for any action that may already have happened.

## Practice and completion evidence

Build narrow tools plus one resource and one prompt. Before coding, publish
visible tests for invalid arguments, unknown tool, unauthorized object access,
oversized output, and revision mismatch; add stdout-discipline coverage for stdio.
Use an automated client for repeatability and the
[Inspector](https://modelcontextprotocol.io/docs/2026-07-28/tools/inspector) for
interactive diagnosis. Pin the tool version during implementation.

Record actual results from Claude Code and Codex separately. Missing host
prerequisites block their checks. Port one narrow adapter to the already-selected
language later and run the same language-neutral fixtures for V32.

Explain which layer authorizes an operation, why stdio logs can break the client,
and how a current revision changes the legacy lifecycle test without weakening
its compatibility objective.

sources: MCP current spec revision; MCP security best practices; MCP Inspector.
