#!/usr/bin/env node
// `npx my-awsm-mcp setup` — memasang MCP server + skill:
//   --global        : config di ~/.config/opencode, skill ke ~/.config/opencode/skills
//   (tanpa flag)    : config di ./.opencode/opencode.json, skill ke ./.opencode/skills
//   --skip-skills   : hanya daftarkan MCP server
//   --skip-mcp      : hanya copy skill
//   --force-skills  : timpa skill yang sudah ada (mulai default: skip biar editan user aman)

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { applyEdits, modify, parse, type ParseError } from "jsonc-parser";

const SERVER_KEY = "awsm"; // samakan dengan nama yang direferensikan di skill (prefix tool: awsm_*)

const pkgRoot = fileURLToPath(new URL("..", import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(pkgRoot, "package.json"), "utf8")) as { name: string };
const skillsSrc = path.join(pkgRoot, "skills");

const args = process.argv.slice(2);
const isGlobal = args.includes("--global");
const skipSkills = args.includes("--skip-skills");
const skipMcp = args.includes("--skip-mcp");
const forceSkills = args.includes("--force-skills");
const sourceIndex = args.indexOf("--source");
const source = sourceIndex >= 0 ? args[sourceIndex + 1] : pkg.name;
if (!source || (sourceIndex >= 0 && (!/^github:[a-z0-9_.-]+\/[a-z0-9_.-]+(?:#[a-z0-9_.\/-]+)?$/i.test(source) && source !== pkg.name))) {
  console.error(`Sumber tidak valid. Pakai '--source ${pkg.name}' atau '--source github:OWNER/REPO'.`);
  process.exit(1);
}

const configPath = isGlobal
  ? path.join(os.homedir(), ".config/opencode/opencode.json")
  : path.resolve(".opencode/opencode.json");
const skillsDir = isGlobal
  ? path.join(os.homedir(), ".config/opencode/skills")
  : path.resolve(".opencode/skills");

const lines: string[] = [];
let failed = false;

const manualSnippet = (key: string, name: string): string => `{
  "mcp": {
    "servers": {
      "${key}": {
        "type": "local",
        "command": ["npx", "-y", "${name}"]
      }
    }
  }
}`;

function writeMcpEntry(): void {
  const existing = existsSync(configPath);
  let text = existing ? readFileSync(configPath, "utf8") : "{}\n";
  const errors: ParseError[] = [];
  const cfg = parse(text, errors, { allowTrailingComma: true }) as Record<string, unknown>;
  if (errors.length || !cfg || typeof cfg !== "object" || Array.isArray(cfg)) {
    failed = true;
    lines.push(`✗ ${configPath} tidak bisa diparse sebagai JSON/JSONC; tidak ditimpa.`);
    lines.push("  Tambahkan blok berikut secara manual:\n\n" + manualSnippet(SERVER_KEY, source));
    return;
  }
  const servers = (cfg.mcp as Record<string, unknown> | undefined)?.servers;
  const previous = servers && typeof servers === "object" && !Array.isArray(servers)
    ? (servers as Record<string, unknown>)[SERVER_KEY] : undefined;
  const entry = { type: "local", command: ["npx", "-y", source] };
  if (previous !== undefined && JSON.stringify(previous) !== JSON.stringify(entry)) {
    failed = true;
    lines.push(`✗ Server '${SERVER_KEY}' sudah ada dengan konfigurasi berbeda di ${configPath}; tidak ditimpa.`);
    return;
  }
  if (previous !== undefined) {
    lines.push(`✓ MCP server '${SERVER_KEY}' sudah terdaftar; konfigurasi dibiarkan utuh.`);
    return;
  }
  if (cfg.mcp !== undefined && (!cfg.mcp || typeof cfg.mcp !== "object" || Array.isArray(cfg.mcp)) ||
      servers !== undefined && (!servers || typeof servers !== "object" || Array.isArray(servers))) {
    failed = true;
    lines.push(`✗ Bagian mcp/servers di ${configPath} tidak berbentuk objek; tidak ditimpa.`);
    return;
  }
  const opts = { formattingOptions: { insertSpaces: true, tabSize: 2, eol: "\n" } };
  if (!cfg.$schema) text = applyEdits(text, modify(text, ["$schema"], "https://opencode.ai/config.json", opts));
  text = applyEdits(text, modify(text, ["mcp", "servers", SERVER_KEY], entry, opts));
  mkdirSync(path.dirname(configPath), { recursive: true });
  writeFileSync(configPath, text.endsWith("\n") ? text : text + "\n");
  lines.push(`✓ MCP server "${SERVER_KEY}" (${pkg.name}) terdaftar di ${configPath}`);
}

function copySkills(): void {
  if (!existsSync(skillsSrc)) {
    failed = true;
    lines.push(`✗ Folder skills tidak ditemukan di package (${skillsSrc}) — lewati.`);
    return;
  }
  mkdirSync(skillsDir, { recursive: true });

  if (!forceSkills) {
    let copied = 0;
    const skipped: string[] = [];
    for (const entry of readdirSafe(skillsSrc)) {
      const target = path.join(skillsDir, entry);
      if (existsSync(path.join(target, "SKILL.md")) || existsSync(target + ".md")) {
        skipped.push(entry);
        continue;
      }
      cpSync(path.join(skillsSrc, entry), target, { recursive: true });
      copied++;
    }
    lines.push(`✓ Skill terpasang → ${skillsDir} (${copied} baru)`);
    if (skipped.length) {
      lines.push(`  Lewat (sudah ada, jangan ganggu editan kamu): ${skipped.join(", ")}`);
      lines.push("  Pakai --force-skills untuk menimpa dengan versi package.");
    }
    return;
  }

  cpSync(skillsSrc, skillsDir, { recursive: true });
  lines.push(`✓ Skill ditimpa dari versi package → ${skillsDir}`);
}

function readdirSafe(dir: string): string[] {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
  } catch {
    return [];
  }
}

if (!skipMcp) writeMcpEntry();
if (!skipSkills) copySkills();

lines.push("");
lines.push("Selesai! Langkah berikutnya (OpenCode):");
lines.push("  • opencode mcp list — pastikan 'awsm' connected");
lines.push("  • Kalau OpenCode lagi jalan, config reload otomatis setelah file tersimpan (/reload kalau ragu)");
lines.push("  • Coba di chat: \"cariin ikon rocket buat hero\" — skill akan aktif otomatis");
if (!isGlobal) {
  lines.push("  • Pasang --global kalau mau tersedia di semua project");
}
if (!process.env.PEXELS_API_KEY && !process.env.UNSPLASH_ACCESS_KEY) {
  lines.push("  • Optional: export PEXELS_API_KEY / UNSPLASH_ACCESS_KEY untuk provider foto premium");
}

console.error(lines.join("\n"));
if (failed) process.exitCode = 1;
