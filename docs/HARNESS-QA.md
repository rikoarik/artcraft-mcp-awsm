# AWSM harness QA — 2026-11-04

## Scope

Read-only runtime tests of the local build. Prompt: inspect the currently open
FigCraft document through AWSM and report its name, without changes or shell use.
No skill name or `craft_prepare` name was supplied in the prompt.

Harness tests used a deterministic downstream MCP fixture reporting `Active fixture`,
not the visible FigCraft canvas. This isolates harness routing from unavailable
native control channels. Existing global user/client settings were not modified.
Temporary launch configs and tool-call traces are in `/tmp/awsm-harness-qa`.

## Results

| Runtime | Outcome | Elapsed | AWSM calls |
| --- | --- | --- | --- |
| Claude Code 2.1.316 | Correct fixture name; did not select fast entry | 19.84 s | `bridge_list`, `bridge_call(inspect_document)` |
| OpenCode 2.2.5 | Failed to complete; global skill/tool interference, then transport error; terminated at deadline | 57.12 s including termination | None |
| Codex CLI 0.164.0 | Reported AWSM tools unavailable | 14.99 s | None |
| Codex CLI retry without daemon | Same unavailable-tool outcome | 11.92 s | None |
| Antigravity IDE 1.107.0 | CLI inspected only; GUI chat lacks captured headless result path in this test | Not measured | Not tested |
| ChatGPT desktop | No end-to-end MCP test performed | Not measured | Not tested |

Claude Code's initialization event reported its configured model as `chat-gpt`.
This is a harness test using the user's configured provider, **not evidence that
Anthropic Claude models were tested**. OpenCode and Codex used their configured
defaults; provider/model comparability was not established.

Claude Code received `craft_prepare` in its advertised tools but chose the older
two-call route despite server instructions. OpenCode loaded the globally installed
`figcraft-ui-design` skill, then attempted `effectcraft-app.doc_inspect`, whose
endpoint refused the connection. Its eventual error was ECONNRESET. Codex reported
that AWSM tools were absent; `codex mcp get awsm` could parse the launch override,
but that alone does not prove the model session loaded the tools. A later OpenCode `debug config --standalone` check confirmed the temporary local
AWSM config was parsed alongside global configs. `mcp list --standalone` nevertheless
reported no configured servers. Consequently, the test does not establish that
OpenCode loaded the new AWSM build into its model session. Root causes of OpenCode
runtime routing and Codex tool availability remain unresolved; these are inconclusive
new-build compatibility tests, not demonstrated AWSM protocol failures.

## Native bridge measurement

Separately called `McpGateway.prepare` against the **installed real FigCraft CLI**,
explicitly selecting a separate headless session and performing inspection only.
The document was `Untitled`; six focused tool schemas were returned.

- First preparation: 38 ms (rounded).
- Two subsequent preparations: below 1 ms each (rounded to 0 ms).

These three local samples measure bridge preparation only. They do not establish
model response latency, UI creation speed, visible-app attachment, or a performance
SLA. No model-driven UI creation or mutation was tested.

The earlier native SolidCraft attached inspection failed with connection refused
at its recorded localhost endpoint. FigCraft was open without a discoverable
control endpoint. No apps were restarted and no open document was changed.

## Automated regression coverage

`npm test` passed after implementation: build, existing smoke tests and new Craft
session tests. Those tests cover configured attached inspection, context-based
UI guidance selection, compact schemas, headless refusal for attached sessions,
endpoint validation, and rejection of implicit rewrites of custom bridge launchers.
They do not replace real harness or native UI acceptance testing.

## Acceptance status

**Not accepted as universally fast or automatically routed across harnesses.**
Before making that claim, resolve the two harness integration failures, make the
fast entry consistently selected, test named models, and verify editable UI in
an attached real FigCraft document. Test Antigravity and ChatGPT in their actual
supported MCP environment rather than inferring success from installer output.
