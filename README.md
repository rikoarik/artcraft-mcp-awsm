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

**Default installation:** one MCP entry named `awsm` + one skill named `awsm-design`. The 21 MCP tools are internal capabilities offered by that one server, not 21 separately installed MCP servers.

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

- **FigCraft integration:** connect the native FigCraft MCP separately when reading, editing or exporting the design canvas. AWSM only handles handoff/asset management and code-side checks.
- **Third-party assets and fonts:** verify source licenses, attribution and glyph coverage. Search results are candidates, not automatic rights clearance.
- **UI validation:** pixel differences and DOM audits are heuristics, not accessibility certification or proof that the application works.
- **No destructive migration:** switching to the one-skill default does not remove old installed skills or override user changes.

Source: [GitHub repository](https://github.com/rikoarik/figcraft-mcp-awsm) · License: MIT.
