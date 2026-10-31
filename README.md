# AWSM

**One MCP connection. The right design tools for the work you actually request.**

AWSM is a local [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for coding agents. One MCP entry provides UI design utilities, assets, browser visual QA and access to trusted design/CAD applications. Installed **SolidCraft** and **CADCraft** are discoverable on demand: ask for a 3D model and AWSM uses SolidCraft; ask for a 2D floor plan and it uses CADCraft. Website publishing and FigCraft handoff are optional, not mandatory next steps.

No hosted service or VPS is required. AWSM runs on your computer over stdio.

![AWSM MCP tools walkthrough — icons, palette and local preview](demo/awsm-demo.gif)

<sub>Demo of built-in tools; gateway connections and FigCraft editing are configured separately.</sub>

[Get started](#quick-start) · [Connect other MCPs](#connect-other-mcps) · [Explore tools](#whats-included) · [Updates](#updates-and-existing-installations) · [GitHub issues](https://github.com/rikoarik/artcraft-mcp-awsm/issues)

---

## How it works

```text
┌───────────────────────────────────────────────────────┐
│ Coding agent (OpenCode, Claude Code, Codex, etc.)     │
└─────────────────────────┬─────────────────────────────┘
                          │ one MCP connection (stdio)
                          ▼
                   ┌─────────────┐
                   │  AWSM MCP   │
                   └──────┬──────┘
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
    Built-in design tools        Optional MCP gateway
    • assets and icons           • bridge_list
    • typography and tokens      • bridge_call
    • FigCraft handoff                   │
    • browser visual QA                 ▼
                               Configured local MCPs
                               (e.g. FigCraft server)
```

**One connection does not mean one tool or one process.** AWSM exposes small, typed tools within a single MCP server. Downstream MCPs remain separate local processes, launched only when the agent connects/calls them. CADCraft and SolidCraft are discoverable if installed; other downstream MCPs require explicit configuration.

AWSM complements your coding agent: the **agent carries out the requested task** (code or CAD); AWSM supplies utilities, controlled integration access, and validation evidence. It is not an autonomous coding agent or a replacement for the FigCraft MCP.

## Workflows follow your intent

AWSM is not a fixed CADCraft → SolidCraft → FigCraft → website pipeline. The coding agent connects **only the providers required by the requested output**.

| Request | Tool(s) | Output |
| --- | --- | --- |
| "Build a 3D speaker" / "make a 3D building" | **SolidCraft only** | Editable model and relevant preview; no 2D drafting or web work |
| "Edit my existing 3D model" or "render it" | **SolidCraft only** | Edited 3D session or requested image |
| "Draw a house floor plan" | **CADCraft only** | 2D drawing |
| "Turn this measured CADCraft plan into a 3D house" | **CADCraft + SolidCraft** | Parametric building geometry checked against the plan |
| "Put this finished model on my website" | **SolidCraft + optional publishing** | Web asset via `publish_3d_asset` |
| "Use the preview in FigCraft" | **SolidCraft + configured FigCraft bridge** | 2D image layer, not editable 3D |

**Standalone 3D is a complete workflow by itself.** The agent inspects or creates the SolidCraft model, applies requested style/materials, validates geometry and checks screenshots. It saves an editable `.sc` file when a permitted output path exists and the user requests a deliverable; it does not generate a website, launch CADCraft, or invoke FigCraft. A high-quality rendered PNG is produced only when the request calls for a render, rather than automatically publishing every model.

AWSM's routing is **skill-guided**, not a hidden semantic classifier or DXF-to-BIM engine. The coding agent interprets intent and selects native MCP tools. The gateway only discovers providers until they are called; detection does **not** open CADCraft or SolidCraft.

## Quick start

**Requirements:** Node.js 18+, `npx`, and an MCP-compatible coding agent.

Run this inside the project where you use your agent:

```bash
npx -y github:rikoarik/artcraft-mcp-awsm setup \
  --client opencode \
  --source github:rikoarik/artcraft-mcp-awsm
```

Restart the coding agent or reconnect its MCP servers. You should see **`awsm`** as one MCP connection, with the `awsm-design` skill installed.

For OpenCode V2, verify the local connection with `opencode mcp list` or the `/mcps` view. AWSM's installer writes the entry under `mcp.servers.awsm` in `.opencode/opencode.json`.

> AWSM currently installs from GitHub; it is **not published to npm** under `my-awsm-mcp`. The setup command downloads/builds and executes the GitHub source. Review code before running third-party packages.

### Choose your agent

Replace `opencode` with the client you actually use:

| Client | `--client` | MCP configuration created |
| --- | --- | --- |
| OpenCode | `opencode` | `.opencode/opencode.json` |
| Claude Code | `claude` | `.mcp.json` |
| Codex | `codex` | `.codex/config.toml` |
| Google Antigravity | `antigravity` | `.agents/mcp_config.json` |
| GitHub Copilot CLI | `copilot` | `.github/mcp.json` |
| Zed | `zed` | User-level Zed settings with `--global` |

Use `--client all` only if you really need multiple clients. For Zed, `--global` configures the MCP entry; project-level setup can still install the skill separately. Restart the relevant client after setup.

### Try your first task

Give the agent a real interface request instead of asking it to test every AWSM tool:

> Design and implement a construction-project dashboard in this existing app. Reuse its components and styles, use AWSM for missing icons or assets, and check the mobile and desktop render. Build working UI rather than stopping at a plan.

The default installation provides **one skill**, `awsm-design`, to guide that workflow. AWSM's individual tools remain available when the agent needs them.

A **3D-only** task can be as simple as:

> Create an editable 3D desk speaker in SolidCraft. Follow this reference's proportions and materials, verify the geometry and show an isometric preview. Do not use CADCraft, build a website, or publish to FigCraft.

It requires `solidcraft-cli` installed or an explicit `solidcraft` bridge. AWSM does not install SolidCraft for you; `bridge_list({server:"solidcraft"})` checks discovery without starting it.

## What's included

| Capability | What it helps with | Key tools |
| --- | --- | --- |
| Project context | Inspect an existing UI repo and plan a fast first render | `inspect_ui_project`, `design_quickstart` |
| Icons and images | Find, download, and prepare visual assets | `find_design_assets`, `find_icons`, `get_icon`, `find_images`, `save_icon_set`, `download_asset` |
| Design foundations | Work with local fonts, palette, observed tokens, and contrast | `google_font`, `palette`, `extract_design_tokens`, `check_contrast` |
| FigCraft handoff | Classify inspected layers and copy exported artwork into a web project | `prepare_web_handoff`, `sync_figcraft_assets` |
| Visual QA | Inspect a running UI and compare screenshots at matching viewports | `review_ui`, `audit_ui_page`, `capture_ui_screenshots`, `compare_ui_screenshots` |
| MCP connections | Discover and invoke configured third-party tools | `bridge_list`, `bridge_call` |
| 3D asset publishing | Prepare SolidCraft OBJ/PNG for a website; optionally place the PNG into FigCraft | `publish_3d_asset` |

Additional utilities include `draw_icon`, `make_asset`, and `serve`. In total, AWSM currently exposes **24 MCP tools** through one server.

### FigCraft → working UI

When a FigCraft document is available:

1. Use the **actual FigCraft MCP** to inspect the document and export artwork. AWSM does not edit the FigCraft canvas.
2. Pass the inspected layer data to `prepare_web_handoff` to classify text, layout, components, and exportable assets.
3. Run `sync_figcraft_assets` after the native exports exist.
4. Let the coding agent implement semantic HTML/components with editable text and functioning interactions.
5. Compare a running page to a same-size reference image using `review_ui`, if local Playwright is available.

This workflow is deliberately **design-to-code**, not a one-click pixel-perfect export.

## Connect other MCPs

The gateway is **optional**. Without additional configuration, AWSM's built-in tools still work. Installed CADCraft and SolidCraft CLIs are discovered on demand; other providers require explicit configuration.

If you want the coding agent to connect **only to AWSM**, you can let AWSM start trusted downstream **stdio MCP servers**, then discover and call their tools through `bridge_list` and `bridge_call`.

### 1. Install the downstream MCP separately

For example, install a FigCraft MCP server using its own instructions. Obtain its **real launch command**, arguments, and tool names. AWSM does **not** install third-party MCPs or automatically read your other clients' configurations.

### 2. Create `.awsm/bridges.json`

Place the file in the working directory from which AWSM starts:

```json
{
  "version": 1,
  "servers": {
    "figcraft": {
      "command": "node",
      "args": ["/absolute/path/to/figcraft-mcp-entry.js"],
      "allowedTools": ["exact_tool_name_from_figcraft"]
    }
  }
}
```

**This is a configuration template, not a verified FigCraft command.** Replace both the file path and tool names with the values supported by your installed provider. Other stdio servers may use different executables and arguments. Installed CADCraft and SolidCraft are detected automatically unless disabled.

If AWSM starts from another directory, set `AWSM_BRIDGE_CONFIG` to an **absolute file path** pointing to the JSON configuration. Restart AWSM after changing the file.

### 3. Discover, then call

Ask the coding agent to:

```text
Use AWSM bridge_list with connect=true.
List the available tools for the configured "figcraft" server.
Then use bridge_call with the exact tool name and required arguments.
Do not invent tool names or modify the FigCraft document unless requested.
```

At the MCP level the workflow looks like:

```js
bridge_list({ connect: true })

bridge_call({
  server: "figcraft",
  tool: "exact_tool_name_from_figcraft",
  arguments: { /* use the discovered tool schema */ }
})
```

The bridge returns downstream MCP content, including text or images when supported. It does **not** automatically expose every downstream tool as a new top-level tool.

**Security and limits**

- Only **explicitly configured local stdio MCP servers** are supported. Direct HTTP/SSE proxying is not implemented.
- `allowedTools` restricts what AWSM can call. Avoid `["*"]` unless you trust every action exposed by that server.
- Child servers execute with your local account's permissions and may inherit your process environment. Review commands, environment variables, and provider trust.
- Third-party tools can perform writes or destructive actions. Use the coding agent's normal approval process.
- Missing or failed downstream MCPs do not disable AWSM's built-in utilities.

### Architecture workflow: CADCraft to SolidCraft

AWSM can use **CADCraft for an architectural floor plan (2D)** and **SolidCraft for the corresponding building model (3D)**. The agent selects the minimum workflow that matches the request:

| Intent | Applications used | Result |
| --- | --- | --- |
| Draw or modify a floor plan | CADCraft | 2D plan only |
| Convert a floor plan into a 3D building | CADCraft → SolidCraft | Parametric 3D based on measured plan geometry |
| Design a standalone 3D object or building | SolidCraft | 3D only |
| Publish a finished 3D model into a website | SolidCraft → `publish_3d_asset` | OBJ/PNG for a web project |
| Place a model preview in FigCraft | SolidCraft + configured FigCraft bridge | 2D PNG image layer |

**No website, FigCraft canvas, web framework, or unrelated export is created during CAD-to-3D work unless requested.**

AWSM discovers an already installed `cadcraft-cli` from PATH, alongside `solidcraft-cli`. Detection does not open the apps or start the MCP processes. `bridge_list({connect:false})` lists configured/installed integrations without connecting. For a 2D→3D task, the agent uses CADCraft `inspect_drawing`, `query_entities`, `find_text`, `render`, and relevant `execute` drawing-analysis commands (`shapes`, `loops`), then SolidCraft's modeling, inspection and render commands.

**Important:** `cadcraft-cli mcp` starts a **headless drawing**; it does not automatically read the document open in the CADCraft desktop app. To work with the user's **visible drawing**, start CADCraft with its control channel and configure an attached bridge in `.awsm/bridges.json`:

```bash
cadcraft --control 7979
```

```json
{
  "version": 1,
  "servers": {
    "cadcraft": {
      "command": "cadcraft-cli",
      "args": ["mcp", "--connect", "127.0.0.1:7979"],
      "allowedTools": [
        "inspect_drawing", "query_entities", "find_text", "render",
        "list_commands", "execute", "command_line", "script", "save"
      ]
    }
  }
}
```

That snippet shows **only the CADCraft entry**. Merge it into any existing `servers` object rather than replacing the rest of `.awsm/bridges.json`. Explicit configuration takes precedence over auto-discovery. To disable CADCraft auto-detection, set `AWSM_AUTO_CADCRAFT=0` for the AWSM process.

**No automatic DXF→BIM conversion is claimed.** CADCraft drafting entities do not inherently identify wall types, floors, windows or roof heights. The AWSM skill guides the agent to interpret blocks, layer naming, dimensions, room labels and closed shapes; validate units and openings; then reconstruct those elements using editable SolidCraft parameters. Heights and architectural details not present in the plan remain assumptions requiring explicit treatment. Validate a top-view SolidCraft screenshot, measurements and wall/opening alignment against the source plan before declaring completion.

Useful references: [CADCraft MCP](https://github.com/storytold/cadcraft/blob/main/docs/mcp.md) and [SolidCraft MCP](https://github.com/tangency-labs/solidcraft/blob/main/docs/mcp.md).

### SolidCraft: installed-only 3D CAD integration

AWSM can automatically **discover an installed SolidCraft CLI** in your system `PATH`. You do **not** need to configure another MCP entry in OpenCode, copy SolidCraft's skills, or add a new AWSM tool. SolidCraft's own MCP remains responsible for its parametric CAD engine.

1. Install SolidCraft from [its official website](https://solidcraft.io/download) and ensure `solidcraft-cli` is available on `PATH` (or specify the full executable through the optional config below).
2. Restart AWSM after installation. Call `bridge_list({server:"solidcraft"})` to see the detected integration **without starting SolidCraft**.
3. When you request 3D modeling, the coding agent can run `bridge_list({server:"solidcraft",connect:true})`. AWSM lazily launches `solidcraft-cli mcp --param-check strict` and forwards tool calls through `bridge_call`. This works headlessly or connects to the running SolidCraft desktop app according to SolidCraft's own behavior.

Auto-discovery does **not** auto-install SolidCraft, read app files, change a design, or start a CAD engine at AWSM startup. It discovers an installed executable only. To disable automatic detection, set `AWSM_AUTO_SOLIDCRAFT=0` in the AWSM process environment.

For a custom path or a tighter tool allowlist, add the following server to `.awsm/bridges.json`. An explicitly configured `solidcraft` entry takes precedence over auto-discovery:

```json
{
  "version": 1,
  "servers": {
    "solidcraft": {
      "command": "/absolute/path/to/solidcraft-cli",
      "args": ["mcp", "--param-check", "strict"],
      "allowedTools": [
        "list_commands",
        "describe_command",
        "skill_reference",
        "inspect_design",
        "measure",
        "screenshot",
        "execute",
        "batch",
        "save",
        "export"
      ]
    }
  }
}
```

The `awsm-design` core skill now guides the agent through **SolidCraft's native modeling and checking skills** (accessible through `skill_reference`), including dimensioned sketches, constrained parameters, named features, staged batches and geometric measurement. For presentation-quality results, it guides deliberate camera framing, coherent material/opaque PBR appearances, and native screenshot/product-render workflows. This does **not** add 3D modeling algorithms to AWSM or guarantee stylistic fidelity without examining the rendered result.

Official technical references: [SolidCraft MCP](https://github.com/tangency-labs/solidcraft/blob/main/docs/mcp.md), [modeling skill](https://github.com/tangency-labs/solidcraft/tree/main/skills/solidcraft-modeling), [checking skill](https://github.com/tangency-labs/solidcraft/tree/main/skills/solidcraft-checking), and [product renders](https://github.com/tangency-labs/solidcraft/blob/main/docs/render-jobs.md).

### Publish 3D assets to a website and FigCraft

AWSM offers one optional handoff tool, `publish_3d_asset`, after the agent builds and verifies a model through the existing SolidCraft MCP:

```text
SolidCraft model (editable .sc)
     ├── OBJ geometry → public/assets/3d/product/model.obj → interactive website
     └── PNG model preview → public/assets/3d/product/preview.png
                                   └── FigCraft image layer (when connected)
```

The model remains editable in SolidCraft. **FigCraft does not import a native editable 3D scene via this workflow**; it places a 2D PNG representation in an actual FigCraft document. An OBJ in a website can be an **interactive 3D** model, not just a screenshot.

1. Build a SolidCraft model and verify both dimensions and style against the brief.
2. Make sure SolidCraft can write to the target website's `public/assets/3d` folder under its own file-access restrictions. When access is denied, add a narrow `--allow-path /absolute/path/to/website/public/assets/3d` to the trusted SolidCraft CLI configuration and restart; **do not use `--allow-any-path`**.
3. If you also want to place the render directly into the **visible** FigCraft app, configure its native MCP in `.awsm/bridges.json`, using its actual `figcraft-cli mcp --attach <port>` command to connect to the running app. Enable `run_command` on its tool allowlist and grant FigCraft read access to the website assets via its documented automation roots. A plain `figcraft-cli mcp` launches a separate headless document, not the visible app.
4. Ask your coding agent to call `publish_3d_asset` with `projectRoot`, `name`, and optionally `figcraft` placement coordinates. Example:

```js
publish_3d_asset({
  projectRoot: "/absolute/path/to/my-web",
  name: "desk-speaker",
  figcraft: { x: 160, y: 260, width: 520, height: 390 }
})
```

The tool exports the **current SolidCraft scene** as OBJ and collects a PNG from its `screenshot` MCP tool. It creates a new package without overwriting an existing one and returns web paths, status and instructions. For FigCraft, it calls `run_command` → `file.placeImage` on the configured bridge; failed placement is reported separately from the website export.

For the web implementation, the coding agent adapts the existing stack: in React/Next.js use an established Three.js-based OBJ loader with loading/error states, responsive camera, and a static PNG fallback. OBJ does **not** preserve all SolidCraft materials or PBR fidelity. For production performance, use a *separately verified* local conversion pipeline to GLB/GLTF when available and optimize mesh complexity, render overhead and mobile behavior. AWSM does not bundle Blender, install rendering dependencies, or pretend SolidCraft's MCP exports GLB directly.

### Matching a requested 3D style

**The current AWSM skill can guide a coding agent to match a 3D style; it is not an automatic reference-image-to-CAD converter.** When a user provides a visual reference that the agent can view, the `awsm-design` skill asks the agent to translate it into a compact style direction *before* modeling: silhouette, proportions, edge treatment, detail density, palette, surface finish, and camera/framing. If no image is accessible, use the text brief and do not claim image-based matching.

For example, an industrial-machined enclosure should use editable thicknesses, purposeful chamfers and restrained metal finishes, whereas a playful rounded desk accessory needs larger corner radii, simpler geometry and coherent matte color blocking. These choices affect **model geometry**, not just render filters. The agent should inspect the actual SolidCraft screenshot, compare it with the reference visually, correct the main mismatches, and re-measure after geometry edits. `review_ui` and pixel-diff tools are for **web UI**, not reliable semantic checks of CAD style.

SolidCraft is strongest for parametric hard-surface and product CAD. It does not become an organic sculptor or a full studio renderer just because AWSM supplies design guidance. Its current opaque PBR/product-image tools do not imply HDRI, refraction, transparent glass, cloth textures or guaranteed photorealism. The final result needs both **geometry validation** and **visible style review**; passing CI alone does not prove visual fidelity.

**Safety:** AWSM uses a constrained built-in allowlist, but `execute` and `batch` can modify the open design and `save`/`export` can write files. Configure the user's normal tool approval process and use SolidCraft's file-access protections. The default integration intentionally does not expose `new_design` or `open`; add them explicitly only when necessary and authorized.

## Browser visual QA

`review_ui` combines a read-only DOM audit, responsive screenshots, and optional comparison against reference PNGs in a single local browser pass.

Install Playwright and Chromium **in the target web project**:

```bash
npm install -D playwright
npx playwright install chromium
```

Start the app's local development server, then ask the agent to run a review:

```js
review_ui({
  url: "http://127.0.0.1:3000/",
  projectRoot: ".",
  outputDir: ".awsm/review"
})
```

Optional reference images can be supplied for pixel comparison, provided their physical dimensions match the capture viewport:

```js
referenceImages: [
  { viewport: "desktop", file: "./figcraft-exports/desktop.png" }
]
```

AWSM reports issues such as horizontal overflow, broken images, missing accessible names, placeholder links, and browser errors. When a reference is supplied it also reports pixel-difference regions.

**What it doesn't do:** edit application code on its own, test every interaction, certify WCAG compliance, or infer semantic design quality from pixels alone. External browser requests are intentionally blocked, which can affect remote font and photo rendering. Check blocked resources before judging fidelity.

## Updates and existing installations

GitHub-source setup enables **best-effort update checks on MCP restart** using `npx --prefer-online`. Managed skill files are synchronized when AWSM starts. User-edited skills are preserved rather than silently overwritten.

This is **not** a background auto-updater. A running MCP session does not receive new code without restart, and caching/network conditions can delay a revision.

To refresh an existing AWSM configuration (including one installed from the old `figcraft-mcp-awsm` GitHub URL), run setup from the **new** repository:

```bash
npx -y --prefer-online github:rikoarik/artcraft-mcp-awsm setup \
  --client opencode \
  --source github:rikoarik/artcraft-mcp-awsm \
  --upgrade-config
```

Use `--no-auto-update` to disable startup revalidation or pin `--source` to a Git commit/tag for reproducible installations.

AWSM installs **one default skill**. The optional specialist library can be installed with `--all-skills`. Existing specialist skill folders are **not deleted** when returning to core mode.

| Installer option | Purpose |
| --- | --- |
| `--client <name>` | Configure a specific agent; default `opencode` |
| `--global` | Install at user level rather than project level |
| `--all-skills` | Install the 21 optional specialist skills alongside `awsm-design` |
| `--upgrade-config` | Update a previously recognized AWSM MCP configuration |
| `--skip-mcp` / `--skip-skills` | Install only skills or only the MCP config |
| `--no-auto-update` | Disable startup package revalidation |
| `--force-skills` | Explicitly overwrite customized skill files; use with care |

If using a **local Git clone** rather than a GitHub-source `npx` entry, updates to that clone require `git pull`, `npm ci`, `npm run build`, and a server restart. A local checkout does not pull changes itself.

## Development

```bash
git clone https://github.com/rikoarik/artcraft-mcp-awsm.git
cd artcraft-mcp-awsm
npm ci
npm test
```

The test script compiles TypeScript and runs MCP smoke tests. Optional Chromium fixture tests live in `test/browser-e2e.mjs` and have a separate GitHub Actions workflow.

For development issues or feature requests, [open an issue](https://github.com/rikoarik/artcraft-mcp-awsm/issues).

### Troubleshooting

- **AWSM not listed in the agent:** confirm setup ran in the same project, inspect the client config, restart the MCP session and check the client's MCP status. For OpenCode V2, run `opencode mcp list`.
- **`bridge_list` returns no servers:** install `cadcraft-cli` or `solidcraft-cli` on `PATH` for auto-detection, or add a custom server in `.awsm/bridges.json` (or `AWSM_BRIDGE_CONFIG`), then restart.
- **Downstream connection error:** use the provider's launch command directly to verify it works, and check the `allowedTools` names. A provider requiring remote HTTP transport cannot be bridged with this stdio-only gateway.
- **Visual review cannot run:** install Playwright/Chromium in the target project, start the local web server, and use an explicit localhost HTTP URL with a port of at least 1024.

## Scope and licensing

AWSM is an open-source local developer tool under the [MIT License](LICENSE). There is no required paid hosting, but third-party image/font providers can have their own usage terms and rate limits. Verify licensing before using assets commercially.

The local FigCraft MCP, remote HTTP MCP servers, and application-specific code generation are **not bundled** into AWSM. The gateway connects only to downstream MCP processes that you explicitly configure.

---

<sub>Built for coding-agent workflows, from early UI design to evidence-based implementation review.</sub>
