# Five-Craft adapter verification — 2026-11-06

## Implementation

A shared adapter registry defines the five native providers, attach flags, inspection
tools and focused schemas. All gateway connection paths resolve visible mode by
default, including direct calls and connect-enabled listing. Explicit separate
work uses craft_prepare headless or bridges.json sessionMode headless. Existing
attached connections cannot silently be repurposed as headless sessions.

MaterialCraft and TextureCraft use --bridge with a numeric port. This was checked
against their current CLI source; MaterialCraft parses --bridge as u16, so passing
127.0.0.1:PORT would be incorrect. The adapter normalizes local endpoints accordingly.
Native CLIs retain responsibility for auth tokens and file-root restrictions.
No secrets are read into gateway responses. Custom launchers/options are not rewritten.

Preparation inspects the native session and returns session mode/endpoint plus
best-effort CLI/desktop version diagnostics. Provider schemas remain authoritative.
Surface tasks load material/texturing guidance automatically. Original MCP content,
images, errors and other fields remain intact; guidance is appended once per
brief/provider after success and is loaded before dispatch, so guide errors cannot
mask an already executed mutation. This does not prove the model followed the guide.

The new skills cover reference-driven graph/material decisions, UV/layer/painting/
baking checks, native viewport inspection and bounded exports. Material-only and
texture-only jobs do not automatically create geometry or web output. Extra surface
stages are selected explicitly via surfaceTools; native file-transfer restrictions
still apply. No automated cross-app file pipeline was added or claimed.

## Automated checks

npm test covers existing regressions plus:

- All five adapter flags and discovery of installed CLI fixtures without launching.
- Default-visible refusal through prepare, direct call and connect-enabled listing.
- Material/texture attached preparation using native session_inspect tool shape.
- Automatic matching guidance, once-per-task delivery and unchanged first content.
- Native error/image retention and mutation authorization.
- Explicit headless work and refusal to switch cached session modes implicitly.
- Brief/session mismatch refusal on direct mutation calls.
- All 24 skills reachable and the corresponding standalone surface/output boundaries.

Skill-creator structural validation passed 24 skills. These tests use deterministic
MCP fixtures; they are not native painting/modeling visual acceptance.

## Initial read-only native environment probe (before setup)

No apps were restarted and no documents were edited.

| Provider | Observed result |
| --- | --- |
| FigCraft | CLI discovered; no verified active endpoint; no headless fallback started |
| SolidCraft | Recorded endpoint refused connection; native inspection reported app absent |
| MaterialCraft | GUI installed earlier; matching CLI not found by gateway |
| TextureCraft | GUI installed earlier; matching CLI not found by gateway |

Separate FigCraft diagnostics: CLI 0.11.2 versus installed desktop 0.15.1, mismatch.
Code changes do not install missing CLIs or align native releases. At this stage,
native edits were blocked by missing endpoints/CLIs; setup and retest results appear
below. Agent avatar/selection outlines are provider capabilities, not a
promise of an animated mouse cursor in every app.

Native references:
- https://github.com/storytold/figcraft/blob/main/docs/mcp.md
- https://github.com/tangency-labs/solidcraft/blob/main/docs/mcp.md
- https://github.com/storytold/materialcraft/blob/main/docs/control-protocol.md
- https://github.com/storytold/texturecraft/blob/main/docs/control-protocol.md


## Native setup and live retest — 2026-11-06

Official release CLI archives were downloaded from the respective GitHub repositories
and SHA-256 verified against release asset digests. Installed to ~/.local/bin:
FigCraft 0.15.1 (previous CLI backed up), MaterialCraft 0.1.2, TextureCraft 0.3.2.
SolidCraft CLI and app both report 0.30.1. Blank/welcome sessions were inspected
before controlled relaunch; no existing user file was opened, overwritten or exported.

Visible app control endpoints were started at 47800 (FigCraft), 47801 (MaterialCraft),
47802 (TextureCraft) and initially 47803 (SolidCraft). The local built AWSM gateway
discovered the control flags and successfully inspected all four attached sessions.
No headless process was substituted.

| App | Native test | Result |
| --- | --- | --- |
| FigCraft | Create temporary rectangle, window screenshot, undo, compare page tree | Passed; native agent label awsm-bridge (agent) visible |
| MaterialCraft | Add uniform-color graph node, window screenshot, undo, compare nodes/connections | Passed |
| TextureCraft | Add temporary fill layer, window screenshot, undo, compare layer stack | Passed |
| SolidCraft | Inspect empty session, then attempt box creation | Inspection passed; mutation timed out; not marked passed |

Evidence and detailed before/after/restored snapshots are in
/tmp/awsm-native-setup/live-report.json and *-live-test.png. This is a local test
artifact location, not a repository-bundled image or published proof. Screenshots
were decoded and visually inspected. The FigCraft rectangle, MaterialCraft node
and TextureCraft layer were undone and their content signatures matched baseline.
Undo history/selection/dirty flags can differ even when document content is restored.
The screenshots show the temporary changed state, not the final restored contents.

SolidCraft did not answer further inspection requests after the geometry mutation.
The test process was not allowed to retry the uncertain mutation. Since this was
an empty session launched solely for QA, it was terminated and relaunched as an
empty visible test session at 47804. A native process sample was retained locally.
This native limitation is not presented as successful modeling or fixed by switching
to hidden/headless work. No other user model was involved.

These tests exercise the local build directly; the MCP tool catalog already loaded
in a running chat is not hot-reloaded. Existing harness configuration is preserved.
Control flags currently belong to the launched app processes, not a new system
startup service; closing/reopening an app without its control channel may require
reattaching setup again. CADCraft was not installed and was not live-tested.


SolidCraft follow-up: a fresh visible session at 47804 accepted
set_parameter(awsm_connection_test, 40), inspect_design verified the parameter,
the native window screenshot was saved, and undo reported Change Parameters.
This proves attached parameter mutation, not geometry creation. A separate minimal
10 mm box/volume-check trial was then attempted after verifying the fresh session
had zero bodies and zero parameters. It is a new isolated test, not replay of the
uncertain operation in the previous destroyed QA session.

The minimal box trial also timed out. The empty QA process was relaunched at
47805; it accepted a parameter edit and undo again. Its native window screenshot
failed with `no frame was presented (window hidden?)`. This distinguishes a
successful attached parameter mutation from successful native visual acceptance.
CUA subsequently showed the visible viewport with zero bodies and zero parameters.
Neither the recovery dialog nor GPU rendering is established as the root cause.
Existing recovery entries were preserved. No native application fix is claimed.

## Repeatable native tests

`npm run test:native` inspects the four attached apps without edits. It never
launches/restarts apps or substitutes headless sessions. Use
`npm run test:native -- --craft=figcraft,materialcraft` to select providers.

`npm run test:native -- --edit` additionally checks automatic guidance, performs
one temporary change, captures a native window screenshot, undoes the change and
compares document contents. Edits are refused unless the session is empty and
unsaved (TextureCraft: its unsaved built-in material ball). No file is saved or
exported. Uncertain mutations/undos are never replayed automatically. A failed
screenshot still fails the test even when the content change and cleanup work.
SolidCraft's regular connection test uses a parameter, not geometry; it cannot be
used as proof that 3D modeling works.

The repository native test was run with `--edit` against all four apps:
FigCraft, MaterialCraft and TextureCraft passed again; SolidCraft failed native
window capture after successfully changing a parameter, then undo was sent. Full
report and screenshots: `/var/folders/9s/mncd1zcx40d37hll0d2b9hh40000gp/T/awsm-native-GX1AIP`.
Reports are local temporary artifacts, not published assets. The regular
`npm test` suite passed after adding this separate opt-in native test command.
The final read-only `--craft=solidcraft` test passed and confirmed zero bodies,
zero parameters and an empty timeline after cleanup. Its report is in
`/var/folders/9s/mncd1zcx40d37hll0d2b9hh40000gp/T/awsm-native-Zq3iG7`.

## Automatic setup and connection follow-up

Native setup is now part of the normal installer and selected-provider connection.
It discovers installed desktop apps, bundled/common-location/managed CLIs without
requiring a GUI harness to inherit a shell PATH. A missing connector is downloaded
from the provider's official release, pinned to the known macOS desktop version,
SHA-256 checked, and installed in AWSM's own cache. Native apps themselves are not
downloaded or patched. Custom bridge/access-root options remain unchanged.

For a closed selected app, AWSM chooses a free local port and opens it with its
control channel. macOS uses LaunchServices (`open -a ... --args`) so the launch is
a normal visible app launch. Existing connected documents are reused. An open
unexposed app is preserved and gets a human-readable reconnect requirement; AWSM
does not pretend that it can enable an unsupported native API in a live process.
CLI, port and configuration instructions are no longer user setup homework.

Shared per-Craft locks serialize launches/downloads across MCP harness processes.
Changed endpoints on managed attached connections are reconnected automatically;
mutations are refused until the new document is inspected. Session mode changes
still require an explicit choice, and uncertain mutations are never replayed.

Additional automated checks cover all five providers' active/closed/unexposed/
ambiguous cases, archive/platform selection, minimal PATH, real subprocess locking,
lock release after failure, bad digests/checksums/nonofficial download rejection,
and reconnect inspection before editing. `AWSM_NATIVE_SETUP=0` isolates fixture tests.

Live verification:

- MaterialCraft: official 0.1.2 CLI download/install through the new code succeeded
  with release digest verification. From a closed app, `test:native --edit
  --auto-start --craft=materialcraft` opened it, inspected the native document,
  loaded material guidance, added a temporary uniform node, captured the native
  window and verified undo. Report: `/var/folders/9s/mncd1zcx40d37hll0d2b9hh40000gp/T/awsm-native-ZQ3MJS`.
- A minimal-PATH MaterialCraft preparation found the managed connector, matched
  CLI/app 0.1.2, reused the active document and returned `awsm-materials/SKILL.md`.
  Evidence: `/tmp/awsm-native-setup/auto-connect-minimal-path.json`.
- SolidCraft: from an inspected empty closed QA session, automatic LaunchServices
  startup, parameter mutation, **native window screenshot** and content-restoring
  undo all passed. Agent cursor was visibly present. This supersedes the earlier
  window-capture failure for this launch path, but does not prove geometry works.
  Report: `/var/folders/9s/mncd1zcx40d37hll0d2b9hh40000gp/T/awsm-native-ZQOsRG`.

With the corrected visible launch, a separate SolidCraft 10 mm cube test also
passed: one closed body, 1000 mm³ volume, 600 mm² area, native window screenshot
with the Agent cursor, then undo back to zero bodies and an empty timeline.
The first geometry operation passed on this launch path; this is evidence for
this tested case, not proof that complex modeling/native rendering is fixed.
Detailed evidence: `/tmp/awsm-native-setup/solidcraft-auto-geometry.json` and
`solidcraft-auto-geometry.png`. Repeat with
`npm run test:native -- --craft=solidcraft --auto-start --edit --geometry`.

**Repeated geometry remains intermittent:** repeating the box test after undo in
the same empty session timed out before a result was returned. The uncertain
operation was not retried and the isolated QA process was stopped. Failed report:
`/var/folders/9s/mncd1zcx40d37hll0d2b9hh40000gp/T/awsm-native-oDmipq`.
This repeated failure is not presented as fixed. AWSM now enforces inspection
before further mutations after a timeout/closed transport or a native error that
reports an operation still running. Native error content remains intact.

A self-contained local runtime was installed for the existing Codex AWSM entry.
The prior configuration was backed up and all other settings were preserved.
A real stdio handshake against that runtime exposed 27 tools and five Craft
adapters, inspected attached FigCraft/SolidCraft/MaterialCraft/TextureCraft sessions,
and returned automatic material guidance. Evidence:
`/tmp/awsm-native-setup/installed-mcp-qa.json`. The chat's already running MCP
process still requires reconnection to load a newly installed runtime. This is
not a live test of CADCraft, every harness, or every model.

Final installed-runtime check after adding timeout guards passed against all four
available apps. SolidCraft was restored as an empty visible QA session after the
failed repeat, and the final native inspection confirmed zero bodies/parameters.
Final evidence: `/tmp/awsm-native-setup/installed-mcp-final-qa.json`.
The full `npm test` suite passed with reconnect and uncertain-operation guards.
