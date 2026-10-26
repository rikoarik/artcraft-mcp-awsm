#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyEdits, modify, parse, type ParseError } from "jsonc-parser";

type Client = "opencode" | "claude" | "codex" | "antigravity" | "zed" | "copilot";
const clients: Client[] = ["opencode", "claude", "codex", "antigravity", "zed", "copilot"];
const root = fileURLToPath(new URL("..", import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")) as { name: string };
const args = process.argv.slice(2);
const globalInstall = args.includes("--global");
const forceSkills = args.includes("--force-skills");
const sourceIndex = args.indexOf("--source");
const source = sourceIndex < 0 ? pkg.name : args[sourceIndex + 1];
const clientIndex = args.indexOf("--client");
const clientArg = clientIndex < 0 ? "opencode" : args[clientIndex + 1];
if (!source || (source !== pkg.name && !/^github:[a-z0-9_.-]+\/[a-z0-9_.-]+(?:#[a-z0-9_.\/-]+)?$/i.test(source))) {
  console.error("--source harus nama package ini atau github:OWNER/REPO");
  process.exit(1);
}
if (!clientArg || (clientArg !== "all" && !clients.includes(clientArg as Client))) {
  console.error(`--client harus all atau salah satu: ${clients.join(", ")}`);
  process.exit(1);
}
const selected = clientArg === "all" ? clients : [clientArg as Client];
const home = os.homedir();
const cwd = process.cwd();
const command = ["npx", "-y", source];
const errors: string[] = [];
const messages: string[] = [];

function jsonConfig(file: string, keys: string[], entry: object, schema = false): void {
  const original = existsSync(file) ? readFileSync(file, "utf8") : "{}\n";
  const parseErrors: ParseError[] = [];
  const cfg = parse(original, parseErrors, { allowTrailingComma: true }) as Record<string, unknown>;
  if (parseErrors.length || !cfg || typeof cfg !== "object" || Array.isArray(cfg)) {
    errors.push(`${file}: bukan JSON/JSONC valid; tidak ditimpa`);
    return;
  }
  let cursor: unknown = cfg;
  for (const key of keys.slice(0, -1)) {
    if (cursor && typeof cursor === "object" && !Array.isArray(cursor)) cursor = (cursor as Record<string, unknown>)[key];
    else cursor = undefined;
    if (cursor !== undefined && (!cursor || typeof cursor !== "object" || Array.isArray(cursor))) {
      errors.push(`${file}: ${key} bukan objek; tidak ditimpa`);
      return;
    }
  }
  const previous = cursor && typeof cursor === "object" ? (cursor as Record<string, unknown>)[keys.at(-1)!] : undefined;
  if (previous !== undefined) {
    if (JSON.stringify(previous) !== JSON.stringify(entry)) errors.push(`${file}: awsm sudah ada dengan konfigurasi berbeda; tidak ditimpa`);
    else messages.push(`= MCP ${file} sudah terpasang`);
    return;
  }
  const options = { formattingOptions: { insertSpaces: true, tabSize: 2, eol: "\n" } };
  let text = original;
  if (schema && !cfg.$schema) text = applyEdits(text, modify(text, ["$schema"], "https://opencode.ai/config.json", options));
  text = applyEdits(text, modify(text, keys, entry, options));
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, text.endsWith("\n") ? text : `${text}\n`);
  messages.push(`+ MCP ${file}`);
}

function tomlConfig(file: string): void {
  const original = existsSync(file) ? readFileSync(file, "utf8") : "";
  // Avoid editing a TOML file we cannot parse reliably; only append a fresh table.
  if (/^\s*\[mcp_servers\.(?:awsm|"awsm")(?:\]|\.)/m.test(original)) {
    const section = original.split(/^\s*\[mcp_servers\.(?:awsm|"awsm")\]\s*$/m)[1]?.split(/^\s*\[/m)[0] ?? "";
    if (section.includes(`command = ${JSON.stringify(command[0])}`) && section.includes(`args = ${JSON.stringify(command.slice(1))}`))
      messages.push(`= MCP ${file} sudah terpasang`);
    else errors.push(`${file}: mcp_servers.awsm sudah ada dengan konfigurasi berbeda; tidak ditimpa`);
    return;
  }
  mkdirSync(path.dirname(file), { recursive: true });
  const block = `[mcp_servers.awsm]\ncommand = ${JSON.stringify(command[0])}\nargs = ${JSON.stringify(command.slice(1))}\n`;
  writeFileSync(file, `${original}${original && !original.endsWith("\n") ? "\n" : ""}${original ? "\n" : ""}${block}`);
  messages.push(`+ MCP ${file}`);
}

function copySkills(dir: string): void {
  const src = path.join(root, "skills");
  if (!existsSync(src)) { errors.push(`Folder skill tidak ditemukan: ${src}`); return; }
  mkdirSync(dir, { recursive: true });
  let count = 0;
  for (const item of readdirSync(src, { withFileTypes: true })) {
    if (!item.isDirectory()) continue;
    const target = path.join(dir, item.name);
    if (existsSync(target) && !forceSkills) continue;
    cpSync(path.join(src, item.name), target, { recursive: true, force: forceSkills });
    count++;
  }
  messages.push(`+ ${count} skill → ${dir}${forceSkills ? " (overwrite diminta)" : " (existing dipertahankan)"}`);
}

const sharedSkills = new Set<string>();
for (const client of selected) {
  if (!args.includes("--skip-mcp")) {
    switch (client) {
      case "opencode": jsonConfig(globalInstall ? path.join(home, ".config/opencode/opencode.json") : path.join(cwd, ".opencode/opencode.json"), ["mcp", "servers", "awsm"], { type: "local", command }, true); break;
      case "claude": jsonConfig(globalInstall ? path.join(home, ".claude.json") : path.join(cwd, ".mcp.json"), ["mcpServers", "awsm"], { type: "stdio", command: command[0], args: command.slice(1) }); break;
      case "codex": tomlConfig(globalInstall ? path.join(home, ".codex/config.toml") : path.join(cwd, ".codex/config.toml")); break;
      case "antigravity": jsonConfig(globalInstall ? path.join(home, ".gemini/config/mcp_config.json") : path.join(cwd, ".agents/mcp_config.json"), ["mcpServers", "awsm"], { command: command[0], args: command.slice(1) }); break;
      case "zed": if (globalInstall) jsonConfig(path.join(home, process.platform === "darwin" ? ".zed/settings.json" : ".config/zed/settings.json"), ["context_servers", "awsm"], { command: command[0], args: command.slice(1), env: {} });
        else messages.push("= Zed MCP: pengaturan context_servers bersifat user-level; jalankan --global untuk MCP (skill project tetap dipasang)"); break;
      case "copilot": jsonConfig(globalInstall ? path.join(home, ".copilot/mcp-config.json") : path.join(cwd, ".github/mcp.json"), ["mcpServers", "awsm"], { type: "local", command: command[0], args: command.slice(1), tools: ["*"] }); break;
    }
  }
  if (args.includes("--skip-skills")) continue;
  const skillsDir = client === "opencode" ? (globalInstall ? path.join(home, ".config/opencode/skills") : path.join(cwd, ".opencode/skills"))
    : client === "claude" ? (globalInstall ? path.join(home, ".claude/skills") : path.join(cwd, ".claude/skills"))
    : client === "antigravity" && globalInstall ? path.join(home, ".gemini/antigravity-cli/skills")
    : globalInstall ? path.join(home, ".agents/skills") : path.join(cwd, ".agents/skills");
  if (!sharedSkills.has(skillsDir)) { copySkills(skillsDir); sharedSkills.add(skillsDir); }
}
console.error([...messages, ...errors.map(e => `✗ ${e}`), `\n${errors.length ? "Selesai dengan konflik" : "Selesai"}. Periksa status MCP di client pilihan sebelum menggunakan tools.`].join("\n"));
if (errors.length) process.exitCode = 1;
