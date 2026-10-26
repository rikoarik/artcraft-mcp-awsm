#!/usr/bin/env node
// MCP server "awsm" — stdio transport.
// Tools: find_icons, get_icon, find_images, download_asset, make_asset, palette, serve

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as icons from "./tools/icons.js";
import * as images from "./tools/images.js";
import * as assets from "./tools/assets.js";
import * as serveMod from "./tools/serve.js";

const server = new McpServer({ name: "awsm", version: "1.0.0" });

const json = (result: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
});

const fail = (error: unknown) => ({
  isError: true,
  content: [{ type: "text" as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
});

// --- Ikon ---------------------------------------------------------------

server.registerTool(
  "find_icons",
  {
    title: "Find Icons",
    description:
      "Cari ikon SVG gratis via Iconify (TANPA API key). Balas daftar ikon dengan format 'family:name' + URL preview. Tip: pertahankan satu 'family' (mis. lucide saja) untuk konsistensi UI.",
    inputSchema: {
      query: z.string().min(1).describe("Kata kunci ikon, contoh 'rocket', 'shopping cart', 'cloud upload'."),
      limit: z.number().int().min(1).max(50).optional().describe("Jumlah hasil (1-50, default 20)."),
      prefix: z.string().optional().describe("Saring keluarga ikon, contoh 'lucide' atau 'lucide,tabler'."),
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
      "Ambil MARKUP SVG dari satu ikon Iconify ('family:name', contoh 'lucide:rocket') untuk langsung di-inline ke HTML/JSX.",
    inputSchema: {
      name: z.string().min(1).describe("Nama ikon 'family:name'."),
      height: z.number().int().min(16).max(512).optional().describe("Height normalisasi (default 64)."),
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

// --- Gambar -------------------------------------------------------------

server.registerTool(
  "find_images",
  {
    title: "Find Images",
    description:
      "Cari foto gratis per query. provider 'openverse' (default, tanpa key, hasil lisensi komersial CC/PD), 'pexels' (butuh env PEXELS_API_KEY), 'unsplash' (butuh env UNSPLASH_ACCESS_KEY), 'picsum' (placeholder acak tanpa jaminan relevan).",
    inputSchema: {
      query: z.string().min(1).describe("Kata kunci foto, contoh 'coffee shop interior warm light'."),
      provider: z.enum(["openverse", "pexels", "unsplash", "picsum"]).optional().describe("Default 'openverse'."),
      limit: z.number().int().min(1).max(20).optional().describe("Jumlah hasil (1-20, default 8)."),
      width: z.number().int().min(100).max(4000).optional().describe("Khusus picsum: lebar gambar."),
      height: z.number().int().min(100).max(4000).optional().describe("Khusus picsum: tinggi gambar."),
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

// --- Asset lokal --------------------------------------------------------

server.registerTool(
  "download_asset",
  {
    title: "Download Asset",
    description:
      "Simpan 1 gambar raster dari URL ke folder project (default './assets'), maksimum 10 MB, tanpa menimpa file lama. SVG eksternal ditolak; cek lisensi sumber sebelum pakai.",
    inputSchema: {
      url: z.string().url().describe("URL gambar (http/https)."),
      filename: z.string().optional().describe("Nama file tujuan; default diambil dari URL. Karakter aneh dilapangkan."),
      dir: z.string().optional().describe("Folder tujuan (default './assets')."),
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
      "Generate SVG template berbasis teks: 'og-card' (1200×630), 'banner', 'badge' monogram, atau 'placeholder'. Bukan AI image generator; cek panjang teks karena tidak otomatis wrap.",
    inputSchema: {
      kind: z.enum(["og-card", "banner", "badge", "placeholder"]).describe("Jenis asset."),
      title: z.string().optional().describe("Teks utama (judul/initial)."),
      subtitle: z.string().optional().describe("Teks teman satu baris."),
      label: z.string().optional().describe("Kicker kecil di atas judul (og-card/banner)."),
      colors: z.array(z.string()).max(3).optional().describe("[warna dasar, warna gelap-ke-terang, aksen] format hex."),
      width: z.number().int().optional().describe("Lebar px (default per jenis)."),
      height: z.number().int().optional().describe("Tinggi px (default per jenis)."),
      dir: z.string().optional().describe("Folder simpan (default './assets')."),
      filename: z.string().optional().describe("Nama file tanpa ekstensi akan tetap disimpan .svg."),
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
      "Derive palet warna dari 1 warna hex: scheme 'analogous', 'complementary', 'triadic', atau 'complete' (semua + tint/shade). Balasan punya CSS variables siap pakai.",
    inputSchema: {
      color: z.string().min(1).describe("Hex, contoh '#1b7f5a'."),
      scheme: z.enum(["analogous", "complementary", "triadic", "complete"]).optional().describe("Default 'complete'."),
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

// --- Preview ------------------------------------------------------------

server.registerTool(
  "serve",
  {
    title: "Serve Preview",
    description:
      "Start/stop server statis localhost untuk preview prototype (HTML/CSS/JS/SVG). Hanya file non-hidden di folder root; bukan deployment. Jangan gunakan untuk file rahasia.",
    inputSchema: {
      root: z.string().optional().describe("Folder yang diserve (default '.')."),
      port: z.number().int().min(1024).max(65535).optional().describe("Port awal; kalau dipakai, dicoba port+1 dst."),
      action: z.enum(["start", "stop"]).optional().describe("Default 'start'."),
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

// --- main ---------------------------------------------------------------

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Log ke stderr SAJA — stdout dipakai protokol MCP.
  console.error("awsm MCP server aktif (stdio)");
}

if (process.argv[2] === "setup") {
  // `npx my-awsm-mcp setup` harus masuk installer, bukan membuka transport MCP.
  void import("./setup.js").catch((error) => {
    console.error("Gagal menjalankan setup:", error);
    process.exitCode = 1;
  });
} else if (process.argv.length > 2 && process.argv[2] !== "--help") {
  console.error(`Subcommand tidak dikenal: ${process.argv[2]}. Pakai 'setup' atau jalankan tanpa argumen untuk MCP stdio.`);
  process.exitCode = 1;
} else if (process.argv[2] === "--help") {
  console.error("my-awsm-mcp: jalankan tanpa argumen untuk MCP stdio, atau 'setup [--client opencode|claude|codex|antigravity|zed|copilot|all] [--global] [--source github:OWNER/REPO] [--skip-mcp] [--skip-skills] [--force-skills]' untuk instalasi OpenCode.");
} else {
  main().catch((error) => {
    console.error("Gagal memulai awsm MCP server:", error);
    process.exitCode = 1;
  });
}
