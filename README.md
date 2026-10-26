# FigCraft MCP AWSM — visual asset & prototype kit

MCP stdio server + **13 editable agent skills** for finding relevant icons/photos, creating simple SVG assets, and building/reviewing motion prototypes. Works with MCP-capable coding agents; this package **does not control the FigCraft canvas**. To design inside FigCraft, connect its own app MCP separately and use the handoff skill.

**[Watch the installation & tools demo](demo/awsm-demo.mp4)** (short scripted walkthrough made from actual CLI/MCP test output).

## Install from GitHub

Requires Node.js 18+ and `npx`. From the project where you want the skills:

```sh
npx -y github:rikoarik/figcraft-mcp-awsm setup --client all --source github:rikoarik/figcraft-mcp-awsm
```

`--client all` configures **OpenCode, Claude Code, Codex, Google Antigravity, and GitHub Copilot CLI** project MCP settings and copies skills to their native locations. Zed reads the shared `.agents/skills` folder but its MCP `context_servers` is user-level: run `--client zed --global` to connect it. You can instead select one client: `opencode`, `claude`, `codex`, `antigravity`, `zed`, `copilot`. Add `--global` for a user-level install (review existing global configs first). `--skip-mcp`, `--skip-skills`, and `--force-skills` are available; **existing skills are not overwritten by default**. When an existing `awsm` MCP entry conflicts, setup reports it and preserves the file.

> GitHub install uses npm's Git dependency support and compiles TypeScript via `prepare`. The package is **not yet published to npm**. Use the GitHub command above, not `npx my-awsm-mcp`, until npm publication. `--source` ensures the agent's MCP command points to the working GitHub source.

| Client | MCP (project) | Skills (project) | Check connection |
| --- | --- | --- | --- |
| OpenCode V2 | `.opencode/opencode.json` | `.opencode/skills` | `/mcps` in the project |
| Claude Code | `.mcp.json` | `.claude/skills` | `/mcp`; approve project server |
| Codex CLI/IDE | `.codex/config.toml` (trusted projects) | `.agents/skills` | `codex mcp list` |
| Antigravity | `.agents/mcp_config.json` | `.agents/skills` | MCP settings / agent |
| Zed Agent | user settings `~/.config/zed/settings.json` (`--global`) | `.agents/skills` | Settings → AI → MCP Servers |
| GitHub Copilot CLI | `.github/mcp.json` (trusted repositories) | `.agents/skills` | `copilot mcp list` |

Client support means a *local stdio MCP configuration and discoverable skills*, not identical tool naming/UI in every client. Claude, Codex, and Copilot require project trust/approval as documented by the client; Zed external agents/terminal threads may have separate configs. `--client all --global` changes multiple personal configs; prefer project install first. Other MCP clients can connect manually with command `npx -y github:rikoarik/figcraft-mcp-awsm` and load the skills according to their format. Browser/cloud agents that cannot launch local processes need a hosted MCP endpoint, which this package does not provide.

### Example prompts

```text
Use awsm-prompt-to-prototype and awsm-taste-ui to build a responsive coffee-shop landing page. Search licensed coffee photos and a consistent icon family, implement a working menu and booking form, add reduced-motion transitions, then run awsm-prototype-qa.
```

```text
Use awsm-antislop-ui to audit this dashboard. Preserve our brand tokens, remove generic repeated card sections, and show before/after screenshots at 360px and 1200px.
```

```text
Find an icon for a delivery status using awsm find_icons, inspect the SVG using get_icon, then make a matching OG card with make_asset. Record attribution/license for any external photo.
```

The client decides when to load a skill; mention its ID for reliable invocation. The tools are `find_icons`, `get_icon`, `find_images`, `download_asset`, `make_asset`, `palette`, and `serve`. In OpenCode V2 Code Mode, find them under the `awsm` namespace; on some clients they appear as `awsm_find_icons`, etc. Image search uses Openverse by default; Pexels and Unsplash require optional `PEXELS_API_KEY` / `UNSPLASH_ACCESS_KEY` in the MCP process environment. Review photo and icon licenses and attribution before shipping. `make_asset` is a **text-based SVG template**, not AI image generation. `serve` is localhost preview, not deployment.

### Included skills

| Workflow | Skills |
| --- | --- |
| Asset discovery | `awsm-assets`, `awsm-asset-lab` |
| Prototype delivery | `awsm-prompt-to-prototype`, `awsm-auto-prototype`, `awsm-prototype-qa` |
| Visual direction | `awsm-taste-ui`, `awsm-antislop-ui`, `awsm-design-system`, `awsm-template-adapter` |
| UX & validation | `awsm-ui-ux-best-practices`, `awsm-motion-storyboard`, `awsm-responsive-audit` |
| Design-app handoff | `awsm-figcraft-handoff` |

Skills are **original instructions**, not repackaged third-party `taste-ui`/`anti-ai-slop` skills. Edit `SKILL.md` in your project after install to customize; rerunning setup preserves edits unless you explicitly pass `--force-skills`. If reusing a UI template, verify its license first.

## Development

```sh
npm ci
npm test               # builds; tests installer, MCP handshake/tools and preview
npm audit --audit-level=high
npm pack --dry-run
```

The GitHub repo contains source, not committed build files; `prepare` builds on Git installs. To run locally, `npm run build` then `node build/index.js` for stdio, or `node build/index.js setup --client opencode --source github:rikoarik/figcraft-mcp-awsm` for setup. Local setup still points the installed client at GitHub; it does not point to the checkout automatically.

### Demo

`demo/awsm-demo.mp4` shows a scripted walkthrough of a project-level multi-client install and MCP calls. It uses captured CLI/MCP results, not a live recording of six agents or FigCraft canvas. Rebuild with `npm run demo` (requires `ffmpeg`, Python 3 and Pillow). The smoke test is the executable proof of the same steps. Source and license: MIT; external assets retain their own licenses.

### Documentation sources

[OpenCode MCP](https://opencode.ai/v2/docs/mcp-servers) · [Claude Code MCP](https://code.claude.com/docs/en/mcp) · [Codex MCP](https://developers.openai.com/codex/mcp) · [Antigravity MCP](https://antigravity.google/docs/mcp/) · [Zed MCP](https://zed.dev/docs/ai/mcp) · [Copilot CLI MCP](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-mcp-servers)
