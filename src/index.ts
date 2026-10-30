#!/usr/bin/env node
// AWSM MCP server using stdio transport.
// Tools: find_icons, get_icon, find_images, download_asset, make_asset, palette, serve, prepare_web_handoff, sync_figcraft_assets

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as icons from "./tools/icons.js";
import { saveIconSet } from "./tools/icon-set.js";
import { drawIcon } from "./tools/draw-icon.js";
import * as images from "./tools/images.js";
import * as assets from "./tools/assets.js";
import * as serveMod from "./tools/serve.js";
import * as handoff from "./tools/handoff.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { syncSkills } from "./skill-sync.js";

const server = new McpServer({ name: "awsm", version: "1.0.0" });

const json = (result: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
});

const fail = (error: unknown) => ({
  isError: true,
  content: [{ type: "text" as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
});

// Icons
server.registerTool(
  "find_icons",
  {
    title: "Find Icons",
    description:
      "Search for free SVG icons through Iconify (no API key). Returns family:name identifiers and preview URLs. Choose one family (such as lucide) for a consistent UI.",
    inputSchema: {
      query: z.string().min(1).describe("Icon search term, such as 'rocket', 'shopping cart', or 'cloud upload'."),
      limit: z.number().int().min(1).max(50).optional().describe("Number of results (1–50; default 20)."),
      prefix: z.string().optional().describe("Limit icon families, such as 'lucide' or 'lucide,tabler'."),
    },
  },
  async (args) => {
    try {
      return json(await icons.findIcons(args));
    } catch (e) {
      return fail(e);
    }
  },
);

server.registerTool(
  "get_icon",
  {
    title: "Get Icon SVG",
    description:
      "Retrieve SVG markup for one Iconify icon identified by family:name (such as 'lucide:rocket') for use in HTML or JSX.",
    inputSchema: {
      name: z.string().min(1).describe("Icon identifier in family:name format."),
      height: z.number().int().min(16).max(512).optional().describe("Normalized icon height (default 64)."),
    },
  },
  async (args) => {
    try {
      return json(await icons.getIcon(args));
    } catch (e) {
      return fail(e);
    }
  },
);

server.registerTool(
  "save_icon_set",
  {
    title: "Save Consistent SVG Icons",
    description: "Download a group of Iconify SVG icons from one family into a local project folder, without overwriting existing icons by default. Returns a path and checksum for each icon.",
    inputSchema: {
      icons: z.array(z.string()).min(1).max(40).describe("Icon identifiers in the same family, e.g. lucide:users, lucide:settings."),
      dir: z.string().optional().describe("Destination folder, default ./public/icons."),
      height: z.number().int().min(16).max(512).optional().describe("SVG height (default 24)."),
      overwrite: z.boolean().optional().describe("Replace changed existing SVG files. Default false."),
    },
  },
  async (args) => {
    try { return json(await saveIconSet(args)); }
    catch (e) { return fail(e); }
  },
);

server.registerTool(
  "draw_icon",
  {
    title: "Draw Original UI Icon",
    description: "Produce a local custom SVG icon from structured path, line, circle, rectangle, ellipse or polyline primitives authored by the coding agent. Not text-to-image generation; verify the rendered result.",
    inputSchema: {
      name: z.string().describe("Lowercase kebab-case filename, e.g. project-progress."),
      elements: z.array(z.object({
        kind: z.enum(["path","circle","rect","line","polyline","ellipse"]),
        d: z.string().optional(), points: z.string().optional(),
        x: z.number().optional(), y: z.number().optional(), x2: z.number().optional(), y2: z.number().optional(),
        cx: z.number().optional(), cy: z.number().optional(), r: z.number().optional(), rx: z.number().optional(), ry: z.number().optional(),
        width: z.number().optional(), height: z.number().optional(), fill: z.boolean().optional(),
      })).min(1).max(30).describe("Vector primitives in a 24x24 coordinate system."),
      dir: z.string().optional().describe("Output folder, default ./public/icons/custom."),
      size: z.number().min(12).max(512).optional().describe("Rendered icon dimensions, default 24."),
      strokeWidth: z.number().min(0.5).max(5).optional().describe("Outline width, default 1.75."),
      overwrite: z.boolean().optional().describe("Explicitly replace the target SVG; default false."),
    },
  },
  async (args) => {
    try { return json(await drawIcon(args)); }
    catch (e) { return fail(e); }
  },
);

// Photos
server.registerTool(
  "find_images",
  {
    title: "Find Images",
    description:
      "Search for images by query. Providers: openverse (default, no key, commercially usable CC/PD results), pexels (PEXELS_API_KEY), unsplash (UNSPLASH_ACCESS_KEY), or picsum (random placeholders, not subject-matched). Verify source licenses before use.",
    inputSchema: {
      query: z.string().min(1).describe("Photo search phrase, such as 'coffee shop interior warm light'."),
      provider: z.enum(["openverse", "pexels", "unsplash", "picsum"]).optional().describe("Default: openverse."),
      limit: z.number().int().min(1).max(20).optional().describe("Number of results (1–20; default 8)."),
      width: z.number().int().min(100).max(4000).optional().describe("Image width for picsum only."),
      height: z.number().int().min(100).max(4000).optional().describe("Image height for picsum only."),
    },
  },
  async (args) => {
    try {
      return json(await images.findImages(args));
    } catch (e) {
      return fail(e);
    }
  },
);

// Local assets
server.registerTool(
  "download_asset",
  {
    title: "Download Asset",
    description:
      "Save one raster image from a URL to a project folder (default './assets'); maximum 10 MB, never overwrites an existing file. External SVG downloads are disabled. Check the source license first.",
    inputSchema: {
      url: z.string().url().describe("Image URL (HTTP or HTTPS)."),
      filename: z.string().optional().describe("Destination filename; defaults to the URL filename. Unsupported characters are sanitized."),
      dir: z.string().optional().describe("Destination folder (default './assets')."),
    },
  },
  async (args) => {
    try {
      return json(await assets.downloadAsset(args));
    } catch (e) {
      return fail(e);
    }
  },
);

server.registerTool(
  "make_asset",
  {
    title: "Make Asset",
    description:
      "Create a text-based SVG template: an Open Graph card (1200×630), banner, monogram badge, or placeholder. Not an AI image generator; long text does not wrap automatically.",
    inputSchema: {
      kind: z.enum(["og-card", "banner", "badge", "placeholder"]).describe("Asset type."),
      title: z.string().optional().describe("Main text (title or initials)."),
      subtitle: z.string().optional().describe("Supporting text on a single line."),
      label: z.string().optional().describe("Small label above the title on cards and banners."),
      colors: z.array(z.string()).max(3).optional().describe("Up to three hex colors: [background, secondary, accent]."),
      width: z.number().int().optional().describe("Width in pixels (defaults vary by type)."),
      height: z.number().int().optional().describe("Height in pixels (defaults vary by type)."),
      dir: z.string().optional().describe("Output folder (default './assets')."),
      filename: z.string().optional().describe("Filename; .svg is appended when no image extension is supplied."),
    },
  },
  async (args) => {
    try {
      return json(await assets.makeAsset(args));
    } catch (e) {
      return fail(e);
    }
  },
);

server.registerTool(
  "palette",
  {
    title: "Palette",
    description:
      "Derive colors from a hex value using an analogous, complementary, triadic, or complete scheme (all three plus tint/shade). Returns CSS custom properties; check contrast before use.",
    inputSchema: {
      color: z.string().min(1).describe("Hex color, such as '#1b7f5a'."),
      scheme: z.enum(["analogous", "complementary", "triadic", "complete"]).optional().describe("Default: complete."),
    },
  },
  async (args) => {
    try {
      return json(await assets.makePalette(args));
    } catch (e) {
      return fail(e);
    }
  },
);

// Preview
server.registerTool(
  "serve",
  {
    title: "Serve Preview",
    description:
      "Start or stop a localhost-only static preview for HTML, CSS, JS, and SVG. Hidden files are blocked. Not a deployment service; do not serve files containing secrets.",
    inputSchema: {
      root: z.string().optional().describe("Folder to serve (default '.')."),
      port: z.number().int().min(1024).max(65535).optional().describe("Starting port; tries subsequent ports if occupied."),
      action: z.enum(["start", "stop"]).optional().describe("Default: start."),
    },
  },
  async (args) => {
    try {
      return json(await serveMod.serve(args));
    } catch (e) {
      return fail(e);
    }
  },
);


server.registerTool(
  "prepare_web_handoff",
  {
    title: "Prepare FigCraft Web Handoff",
    description: "Classify FigCraft inspect_document layers as HTML/CSS, components, review items, or exportable assets. Generate a deterministic export plan and optional JSON manifest. Supply the raw inspect_document JSON, not a screenshot.",
    inputSchema: {
      document: z.unknown().optional().describe("Raw JSON from FigCraft inspect_document."),
      documentPath: z.string().optional().describe("Local JSON file from FigCraft inspect_document. Use instead of document."),
      inspectAssets: z.unknown().optional().describe("Optional output of FigCraft inspect.assets."),
      inspectAssetsPath: z.string().optional().describe("Optional JSON file containing FigCraft inspect.assets output."),
      exportDir: z.string().optional().describe("Folder for FigCraft native export files, default ./figcraft-exports."),
      outputPath: z.string().optional().describe("Optional path to save the handoff manifest as JSON."),
      overwrite: z.boolean().optional().describe("Allow replacing an existing handoff manifest. Default false."),
    },
  },
  async (args) => {
    try { return json(await handoff.prepareWebHandoff(args)); }
    catch (e) { return fail(e); }
  },
);

server.registerTool(
  "sync_figcraft_assets",
  {
    title: "Sync FigCraft Exports into Web Assets",
    description: "Copy only files listed in an AWSM handoff manifest from the native FigCraft export directory to <publicDir>/figcraft, recording SHA-256 hashes, missing files and conflicts. Does not export from FigCraft itself.",
    inputSchema: {
      handoff: z.unknown().optional().describe("Handoff JSON returned by prepare_web_handoff."),
      handoffPath: z.string().optional().describe("Local path to the saved handoff JSON."),
      exportDir: z.string().optional().describe("Native FigCraft export directory; default ./figcraft-exports."),
      publicDir: z.string().optional().describe("Web public folder; default ./public."),
      overwrite: z.boolean().optional().describe("Replace changed assets. Default false."),
    },
  },
  async (args) => {
    try { return json(await handoff.syncFigcraftAssets(args)); }
    catch (e) { return fail(e); }
  },
);

async function main(): Promise<void> {
  const managed = process.argv[2] === "--managed-skills" ? process.argv[3] : undefined;
  if (managed) {
    try {
      const bundled = fileURLToPath(new URL("../skills", import.meta.url));
      const report = syncSkills(bundled, path.resolve(managed));
      console.error(`AWSM skills synced: ${report.added} added, ${report.updated} updated, ${report.preserved} customized preserved`);
    } catch (error) { console.error(`AWSM skills sync warning: ${String(error)}`); }
  }
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Keep logs on stderr; stdout is reserved for MCP messages.
  console.error("AWSM MCP server active (stdio)");
}

if (process.argv[2] === "setup") {
  // Route `npx my-awsm-mcp setup` to the installer rather than stdio transport.
  void import("./setup.js").catch((error) => {
    console.error("Failed to run setup:", error);
    process.exitCode = 1;
  });
} else if (process.argv.length > 2 && process.argv[2] !== "--help" && !(process.argv[2] === "--managed-skills" && process.argv[3] && process.argv.length === 4)) {
  console.error(`Unknown subcommand: ${process.argv[2]}. Use 'setup' or run without arguments for MCP stdio.`);
  process.exitCode = 1;
} else if (process.argv[2] === "--help") {
  console.error("my-awsm-mcp: run without arguments for MCP stdio, or use 'setup [--client opencode|claude|codex|antigravity|zed|copilot|all] [--global] [--source github:OWNER/REPO] [--skip-mcp] [--skip-skills] [--force-skills]' to install client configurations and skills. Use --auto-update or --no-auto-update, and --upgrade-config for existing AWSM clients.");
} else {
  main().catch((error) => {
    console.error("Failed to start AWSM MCP server:", error);
    process.exitCode = 1;
  });
}
