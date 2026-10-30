# AWSM — one MCP for design engineering

AWSM is **one local MCP server** that helps a coding agent design, implement and review real websites and application interfaces. It runs through stdio on the developer's computer. **No VPS, paid deployment or separate backend is required.**

AWSM has **one default agent skill** (`awsm-design`) and a toolbox for design context, fonts, icons, photos, FigCraft handoff and visual QA. The project still bundles the 21 original specialist skills as optional documentation. One MCP server does **not** mean cramming every capability into one enormous MCP tool—individual tools retain small, typed inputs.

## Install

Requires Node.js 18+, npx, and a coding agent with local MCP support. For OpenCode, run inside your project:

```sh
npx -y github:rikoarik/figcraft-mcp-awsm setup \
  --client opencode \
  --source github:rikoarik/figcraft-mcp-awsm
```

Supported clients: `opencode`, `claude`, `codex`, `antigravity`, `zed`, `copilot`, or `all`. Use `--client all` **only** when you actually run multiple clients; otherwise it creates unnecessary configurations. Zed requires `--global` for its user-level MCP setting.

**Default installation:** one MCP entry named `awsm` + one skill named `awsm-design`. The 23 MCP tools include internal capabilities and two gateway tools, all exposed through that one server—not 23 separately installed MCP servers.

**For advanced users**, install the full specialist skill library with `--all-skills`:

```sh
npx -y github:rikoarik/figcraft-mcp-awsm setup \
  --client opencode --source github:rikoarik/figcraft-mcp-awsm \
  --all-skills --upgrade-config
```

The expanded library contains the core skill and 21 specialist skills. Existing user-modified skills are **not deleted or overwritten**. If you installed an older version with many skills, the new core mode will not automatically delete those old folders. You can archive unused skills yourself after confirming they are not customized.

### Existing installations and updates

To migrate an existing AWSM MCP configuration to the current launch command:

```sh
npx -y github:rikoarik/figcraft-mcp-awsm setup \
  --client opencode --source github:rikoarik/figcraft-mcp-awsm \
  --upgrade-config
```

On GitHub-source installs, npx checks for newer package revisions at MCP startup and managed skills sync non-destructively. This is best effort and can depend on cache/network state. Disable it with `--no-auto-update`, or pin the source to a reviewed Git tag/commit if reproducibility matters. Auto-updates run newly fetched code on the developer machine, so use pinned releases in controlled environments.

Relevant options: `--global` for user-level installation, `--skip-mcp`, `--skip-skills`, `--all-skills`, `--upgrade-config`, `--force-skills` (explicitly overwrite managed skill changes), `--auto-update` and `--no-auto-update`.

## AWSM as an MCP gateway — one connection to multiple MCPs

You can configure **only `awsm` in your coding agent**. AWSM then exposes its own internal tools and can forward calls to other trusted **local stdio MCP servers** (such as a separately installed FigCraft MCP). This means one **agent-facing MCP connection**, not one process that magically contains all third-party providers.

Create `.awsm/bridges.json` at your project root:

```json
{
  "version": 1,
  "servers": {
    "figcraft": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/YOUR/FIGCRAFT/MCP-SERVER.js"],
      "allowedTools": ["inspect_document", "get_node", "export"]
    }
  }
}
```

**The command, arguments and tool names above are illustrative.** Use the real FigCraft MCP launch command and exact tool names from its installed documentation. No FigCraft MCP is bundled or installed automatically by AWSM. The gateway is optional; without this file, AWSM works with its built-in tools.

The coding agent first calls `bridge_list({connect:true})` to discover configured downstream tools and their schemas, then `bridge_call({server:"figcraft",tool:"inspect_document",arguments:{...}})` to forward a request. The original tool result is returned when possible, including image/text content blocks. Gateway tools are available under the same AWSM MCP entry—no separate FigCraft entry is necessary **when its stdio process can be launched by AWSM**.

- Only named local stdio MCP servers are supported initially. Remote HTTP/SSE integrations are not yet proxied.
- The user must explicitly configure each downstream command. AWSM does **not** scan arbitrary MCP configuration files, install providers or discover secrets automatically.
- `allowedTools` limits which downstream tools AWSM can invoke. Choose the smallest useful set; `["*"]` allows every tool, including potentially destructive actions.
- Downstream processes run with the developer's local user permissions and inherited environment. Review every command and token source you add.
- Default config location is `.awsm/bridges.json` relative to AWSM's working directory. If the agent starts AWSM elsewhere, set the `AWSM_BRIDGE_CONFIG` environment variable to the full path instead.
- An unavailable downstream server does not prevent AWSM's own design/image/font tools from working.

This keeps AWSM a **single free local entrypoint**. It does not require a VPS or paid hosting, and there is no automated third-party authorization bypass.

## How to use AWSM

Give the coding agent the normal product task and let it use `awsm-design`:

> Design and implement an operational invoice administration interface in this existing Next.js project. Reuse its components, icons, fonts and design tokens. Produce a functional first render and check mobile/desktop usability.

The core skill favors three practical outcomes:

1. **Design intelligence:** understand the actual product, inspect the existing stack, reuse design assets, source missing fonts/icons/photos only when needed, and render a useful first screen.
2. **FigCraft → code:** use the real FigCraft MCP for layer inspection and native export. AWSM prepares layer/asset handoff and syncs exports so text, layout and controls remain real code rather than flattened screenshots.
3. **Visual QA:** when project-local Playwright is available, `review_ui` collects browser audit findings, screenshots and optional same-size FigCraft comparisons in one pass. The coding agent interprets the evidence and edits its own source files.

AWSM is **not a replacement for the coding agent**, a UI image generator, or a FigCraft canvas editor. It does not automatically install Chromium or guarantee production-quality UI.

### Tool capabilities

| Category | MCP tools |
| --- | --- |
| Rapid context | `inspect_ui_project`, `design_quickstart` |
| Icons, photos and assets | `find_design_assets`, `find_icons`, `get_icon`, `save_icon_set`, `draw_icon`, `find_images`, `download_asset`, `make_asset` |
| Fonts and design values | `google_font`, `extract_design_tokens`, `palette`, `check_contrast` |
| FigCraft to web | `prepare_web_handoff`, `sync_figcraft_assets` |
| UI verification | `review_ui`, `capture_ui_screenshots`, `audit_ui_page`, `compare_ui_screenshots`, `serve` |
| Connected MCPs | `bridge_list`, `bridge_call` |

The purpose of keeping separate, narrowly typed MCP tools is to make the agent's inputs verifiable. The single `awsm-design` skill provides routing and workflow context; specialists remain optional.

## Local browser verification

To use `review_ui` on a web project, install Playwright **inside that project** and install Chromium when you actually want browser tests:

```sh
npm i -D playwright
npx playwright install chromium
```

Then start the app's development server and ask the coding agent to call `review_ui` against a localhost URL. AWSM blocks external browser requests to limit unwanted access and reports the blocked resources. External fonts and images may therefore need local copies for accurate screenshots.

For development tests on this MCP itself:

```sh
npm ci
npm test
```

A separate Chromium fixture workflow exists in `.github/workflows/browser-e2e.yml`.

## Important constraints

- **FigCraft integration:** install and configure the native FigCraft MCP as a downstream bridge, or connect it separately, when reading, editing or exporting the design canvas. AWSM only handles handoff/asset management and code-side checks.
- **Third-party assets and fonts:** verify source licenses, attribution and glyph coverage. Search results are candidates, not automatic rights clearance.
- **UI validation:** pixel differences and DOM audits are heuristics, not accessibility certification or proof that the application works.
- **No destructive migration:** switching to the one-skill default does not remove old installed skills or override user changes.

Source: [GitHub repository](https://github.com/rikoarik/figcraft-mcp-awsm) · License: MIT.
