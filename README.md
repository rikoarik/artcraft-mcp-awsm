# FigCraft MCP AWSM

A **local stdio MCP server and 13 editable agent skills** for finding relevant photos and icons, creating simple SVG assets, and designing, building, and reviewing web prototypes with a coding agent. Supports OpenCode V2, Claude Code, Codex, Google Antigravity CLI, Zed Agent, and GitHub Copilot CLI. **This package does not control the FigCraft canvas**; connect FigCraft's own MCP separately to design inside the application.

## See the tools in use—and the result

[![AWSM MCP usage walkthrough](demo/awsm-demo.gif)](demo/awsm-demo.mp4)

**[Watch the complete MP4](demo/awsm-demo.mp4)** · [View the poster](demo/poster.png) · [Open the generated SVG](demo/example/coffee-card.svg) · [See the example HTML page](demo/example/index.html)

The demo makes **real MCP calls**: `palette` derives colors from `#176F57`, `make_asset` creates a [1200 × 630 Kopi Pagi card](demo/example/coffee-card.svg), and `serve` opens an [example HTML page](demo/example/index.html) on localhost and verifies the HTTP responses. It is a **scripted walkthrough of MCP call results**, not a recording of six agents, an automatically generated website, or the FigCraft canvas. The example HTML integrates the SVG; it is not an output of `make_asset`.

## Requirements and installation

You need Node.js **18+**, `npx`, internet access for installation from GitHub (and for photo/icon search), and a coding agent capable of launching a **local stdio MCP server**. Run this **from the project directory**:

```sh
npx -y github:rikoarik/figcraft-mcp-awsm setup --client all --source github:rikoarik/figcraft-mcp-awsm
```

This package is **not published to npm yet**. `--source` configures each agent to launch `npx -y github:rikoarik/figcraft-mcp-awsm` instead of the unpublished npm package name. GitHub installation runs `prepare` to compile TypeScript. Review the configuration changes and any trust or approval prompts in your client. `--client all` installs project-level configurations for five clients; **Zed** needs a separate `--global` step for its user-level MCP setting (its project skills are still installed).

### Choose and verify a client

Replace `CLIENT` with an ID from the table and run the command at the root of the project your agent will use:

```sh
npx -y github:rikoarik/figcraft-mcp-awsm setup --client CLIENT --source github:rikoarik/figcraft-mcp-awsm
```

| Client | Project MCP configuration | Project skill location | How to verify |
| --- | --- | --- | --- |
| **OpenCode V2** (`opencode`) | `.opencode/opencode.json` → `mcp.servers.awsm` | `.opencode/skills/awsm-*/SKILL.md` | Reopen the project; use `/mcps` and confirm `awsm` connects with seven tools. |
| **Claude Code** (`claude`) | `.mcp.json` → `mcpServers.awsm` | `.claude/skills/awsm-*/SKILL.md` | Open Claude in the project, approve the project server, and use `/mcp`. |
| **Codex CLI/IDE** (`codex`) | `.codex/config.toml` → `[mcp_servers.awsm]` | `.agents/skills/awsm-*/SKILL.md` | Trust the project, run `codex mcp list`, then try `palette`. |
| **Antigravity CLI** (`antigravity`) | `.agents/mcp_config.json` → `mcpServers.awsm` | `.agents/skills/awsm-*/SKILL.md` | Open the workspace, inspect the agent's MCP tools, and try the prompt below. |
| **Zed Agent** (`zed`) | User settings, **only** with `--global` | `.agents/skills/awsm-*/SKILL.md` | Check Settings → AI → MCP Servers and the tools in Zed Agent (not an external agent). |
| **GitHub Copilot CLI** (`copilot`) | `.github/mcp.json` → `mcpServers.awsm` | `.agents/skills/awsm-*/SKILL.md` | Open a trusted repository, use `copilot mcp list` or `/mcp`, and try `palette`. |

For Zed, run **both** commands to keep the skills in the project while registering the MCP server in personal settings:

```sh
npx -y github:rikoarik/figcraft-mcp-awsm setup --client zed --source github:rikoarik/figcraft-mcp-awsm
npx -y github:rikoarik/figcraft-mcp-awsm setup --client zed --global --skip-skills --source github:rikoarik/figcraft-mcp-awsm
```

On macOS, Zed's settings are at `~/.zed/settings.json`; on other supported platforms, they are at `~/.config/zed/settings.json`. Zed external agents and terminal sessions can have separate configurations. Verify the connection in the actual client, not just by checking that files exist.

### Installer options and skill customization

- `--client opencode|claude|codex|antigravity|zed|copilot|all` (default: `opencode`).
- `--global` installs MCP configuration and skills at user level: OpenCode `~/.config/opencode`, Claude `~/.claude.json` and `~/.claude/skills`, Codex `~/.codex/config.toml`, Antigravity `~/.gemini/config/mcp_config.json` and `~/.gemini/antigravity-cli/skills`, Zed settings as above, Copilot `~/.copilot/mcp-config.json`; Codex/Copilot/Zed shared skills live at `~/.agents/skills`. Review global configurations first, especially before `--client all --global`.
- `--skip-mcp` copies only skills; `--skip-skills` configures only MCP. `--force-skills` **overwrites existing skill folders with the same names**. Without it, local `SKILL.md` edits are preserved.
- `--source github:OWNER/REPO` selects a GitHub source; the package name will be an option once published to npm. Do not use `npx my-awsm-mcp` yet.

To customize a workflow, edit `.agents/skills/awsm-taste-ui/SKILL.md` (or the corresponding `.opencode/skills/...` or `.claude/skills/...` path). Add your brand tokens, design constraints, responsive checklist, and preferred handoff format. Each skill is Markdown with YAML `name` and `description` frontmatter; keep its folder and skill ID aligned. On upgrades, compare the upstream version manually. Avoid `--force-skills` if you want to retain local changes.

The installer preserves unrelated configuration and reports a conflict if an `awsm` MCP entry already exists with a different command; it **does not overwrite** that entry or migrate old configurations automatically. Restart or reload your agent session if new tools or skills do not appear.

## End-to-end tutorial: brief → asset → preview

The following workflow works in any supported client once MCP is connected. Tool names may appear as `palette` / `make_asset` or with an `awsm_` prefix depending on the client UI; the server name is **awsm**. `make_asset` creates a **typographic SVG template**, not a photo or complete interface.

**1. Give the agent a specific brief.** For example:

```text
Use awsm-taste-ui and awsm-assets to make a page for a small coffee shop called Kopi Pagi.
Define the visual hierarchy and a palette based on #176F57. Find a relevant interior
photo with a verifiable license, not a random stock image. Create a social card titled
“Kopi Pagi” with the subtitle “A daily ritual.” Save the SVG locally, build a simple
HTML page using it, preview it, and check mobile and reduced motion with
awsm-prototype-qa. If the photo cannot be verified, use a labeled placeholder;
do not invent its license.
```

**2. Derive colors and create an asset.** The agent can call these tools with arguments like the following (these are *tool calls*, not terminal commands):

```js
palette({ "color": "#176F57", "scheme": "complete" })
make_asset({ "kind": "og-card", "title": "Kopi Pagi", "subtitle": "A daily ritual", "label": "KOPI PAGI STUDIO", "colors": ["#122923", "#27614b", "#ddad65"], "dir": "./assets", "filename": "coffee-card.svg" })
```

`palette` returns `base`, a swatch list, and `cssVars`. Choose color roles based on actual contrast; there is no need to use every swatch. `make_asset` writes an SVG and **will not overwrite an existing filename**. The demo writes to a temporary directory and copies its output to [`demo/example/coffee-card.svg`](demo/example/coffee-card.svg), so `npm run demo` is repeatable.

**3. Search separately for photos or icons when needed.** Example arguments:

```js
find_images({ "query": "small coffee shop interior natural light", "provider": "openverse", "limit": 5 })
find_icons({ "query": "calendar", "prefix": "lucide", "limit": 5 })
get_icon({ "name": "lucide:calendar-days", "height": 24 })
```

Check each candidate's source page, license, creator, attribution, and cropping suitability. Openverse results are filtered for commercial use, but **you must still verify the rights**. `download_asset({ "url": "https://.../photo.jpg", "dir": "./assets", "filename": "interior.jpg" })` saves a selected raster image, with a 10 MB limit and no overwrite; external SVGs are rejected. Pexels and Unsplash require `PEXELS_API_KEY` or `UNSPLASH_ACCESS_KEY` in the **MCP process environment**. `picsum` supplies random placeholders only. Never commit API keys or paste them into a conversation.

**4. Implement and preview.** The coding agent writes HTML/CSS/JS using the project's stack and local assets, and makes the interactions work. For a **static** folder containing `index.html`:

```js
serve({ "root": "./demo/example" })
```

Open the returned localhost `url`. `serve({ "action": "stop" })` stops the preview. It runs only while the MCP process is active and is not deployment; do not serve a directory containing secrets. For Vite, Next.js, or another framework, use the project's own development server instead of `serve` as a bundler substitute. Before handoff, test mobile and desktop layouts, keyboard and focus behavior, loading and error states, the console, and `prefers-reduced-motion`.

**5. Inspect the included result without an agent.** Clone or download this repository and run from its root:

```sh
python3 -m http.server 8080 --directory demo/example
```

Open `http://localhost:8080/` and stop the server with Ctrl-C. This example page displays an SVG actually returned by MCP; **the server did not automatically generate the website**. Watch the [MP4 walkthrough](demo/awsm-demo.mp4) for the tool calls and their results.

### All 13 skills

| Skill | When to use it | What to inspect |
| --- | --- | --- |
| [`awsm-taste-ui`](skills/awsm-taste-ui/SKILL.md) | Establish a specific visual direction before markup or redesign | Concept, tokens, hierarchy, and mobile/desktop renders. |
| [`awsm-antislop-ui`](skills/awsm-antislop-ui/SKILL.md) | Audit a generic-looking interface | Problem → impact → revision and before/after comparison. |
| [`awsm-ui-ux-best-practices`](skills/awsm-ui-ux-best-practices/SKILL.md) | Journeys, forms, accessibility, navigation | Friction, evidence, recommendation, validation. |
| [`awsm-design-system`](skills/awsm-design-system/SKILL.md) | Tokens and components across several screens | Primitive → semantic → component, states, examples. |
| [`awsm-assets`](skills/awsm-assets/SKILL.md) | Relevant photos and icons | Files, slots, sources, creators, licenses, attribution. |
| [`awsm-asset-lab`](skills/awsm-asset-lab/SKILL.md) | Open Graph cards, banners, badges, placeholders | SVG, dimensions, colors, preview, target format. |
| [`awsm-template-adapter`](skills/awsm-template-adapter/SKILL.md) | Adapt a licensed template | Keep/adapt/remove mapping, provenance, and QA. |
| [`awsm-prompt-to-prototype`](skills/awsm-prompt-to-prototype/SKILL.md) | Turn a brief into an end-to-end prototype | Journeys, implementation, assets, QA. |
| [`awsm-auto-prototype`](skills/awsm-auto-prototype/SKILL.md) | Implement live interactions and states | Control → action → feedback; working/simulated/blocked. |
| [`awsm-motion-storyboard`](skills/awsm-motion-storyboard/SKILL.md) | Transitions and microinteractions | Triggers, final states, reduced motion, evidence. |
| [`awsm-responsive-audit`](skills/awsm-responsive-audit/SKILL.md) | Fix mobile/tablet/desktop layout issues | Viewport screenshots and retest status. |
| [`awsm-prototype-qa`](skills/awsm-prototype-qa/SKILL.md) | Validate before handoff | Journey matrix, reproducible findings, limits. |
| [`awsm-figcraft-handoff`](skills/awsm-figcraft-handoff/SKILL.md) | Handoff to the FigCraft app | Frame specifications, tokens, assets, interaction gaps. |

Mention a skill ID in your prompt to make agent loading more reliable. Skills are **workflow instructions**, not components that build a UI without the agent implementing one. Each file is editable and contains decisions, validation, example tasks, and handoff criteria. Tailor them to your product and asset licensing policy.

## Troubleshooting and limitations

- **MCP not listed:** check the active project and configuration, restart the agent session, approve the project or server where required (Claude/Codex/Copilot), and try `npx -y github:rikoarik/figcraft-mcp-awsm` in a terminal. That launches the stdio server, not a web page; stop it with Ctrl-C. Check client stderr logs for startup errors. Zed requires `--global` for MCP.
- **Skill not loaded:** check the client's skill directory in the table, confirm each `SKILL.md` has valid frontmatter, and mention its ID in the prompt. `--skip-skills` intentionally omits skill installation.
- **`awsm` setup conflict:** the installer preserves existing entries. Compare and back up the configuration, then edit a wrong entry deliberately; `--force-skills` affects skills **only**, not MCP settings.
- **Missing images or icons:** public APIs and networks can fail. Revise the query, check provider keys and licensing, and label `picsum` results as placeholders rather than relevant search results.
- **SVG missing from preview:** check the path relative to `index.html`, the filename, long-text clipping, and the directory served. Convert an Open Graph card to PNG if the target social platform requires raster.
- **Prototype code or FigCraft:** AWSM's seven tools do not edit a project, generate an entire site or AI photos, control the FigCraft canvas, or deploy a website. The coding agent implements the web prototype; FigCraft's separate MCP handles design documents. `serve` is a local static preview only.
- **Security:** run local servers only from sources you trust. Do not commit credentials in configuration. Review created files and third-party licenses before publishing.

## Development, tests, and sources

```sh
npm ci
npm test                     # build and smoke-test the installer, seven MCP tools, and HTTP preview
npm audit --audit-level=high
npm pack --dry-run           # check that build output, README, and skills are packaged
npm run demo                 # regenerate MP4, GIF, poster, and SVG/HTML examples
```

`npm run demo` requires **macOS Quick Look (`qlmanage`)**, `ffmpeg`, Python 3, and Pillow. The script makes real MCP calls in a temporary directory, renders the SVG with Quick Look, then creates the video frames. It does not record an agent's screen. The repository includes source; Git installations generate build files through `prepare`. For local development, run `npm run build` and then `node build/index.js` for stdio. Running `node build/index.js setup --client opencode --source github:rikoarik/figcraft-mcp-awsm` still points the installed client at the *GitHub source*, not automatically at this checkout.

Client documentation: [OpenCode MCP](https://opencode.ai/v2/docs/mcp-servers) and [skills](https://opencode.ai/v2/docs/skills) · [Claude Code MCP](https://code.claude.com/docs/en/mcp) · [Codex MCP](https://developers.openai.com/codex/mcp) · [Antigravity CLI MCP/skill migration](https://antigravity.google/docs/cli/gcli-migration.md) · [Zed MCP](https://zed.dev/docs/ai/mcp) · [Copilot CLI MCP](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-mcp-servers). Skill format follows the [Agent Skills Specification](https://agentskills.io/specification). [Anthropic's frontend-design skill](https://github.com/anthropics/skills/tree/main/skills/frontend-design) was consulted for **structural inspiration only**. This package's skill instructions are original. Repository code is MIT-licensed; external photos and icons retain their own source licenses.
