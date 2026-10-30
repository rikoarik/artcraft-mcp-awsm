#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { syncSkills } from "./skill-sync.js";
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
const skillMode = args.includes("--all-skills") ? "all" : "core";
const upgradeConfig = args.includes("--upgrade-config");
const sourceIndex = args.indexOf("--source");
const source = sourceIndex < 0 ? pkg.name : args[sourceIndex + 1];
const clientIndex = args.indexOf("--client");
const clientArg = clientIndex < 0 ? "opencode" : args[clientIndex + 1];
if (!source || (source !== pkg.name && !/^github:[a-z0-9_.-]+\/[a-z0-9_.-]+(?:#[a-z0-9_.\/-]+)?$/i.test(source))) {
  console.error("--source must be this package name or github:OWNER/REPO");
  process.exit(1);
}
if (!clientArg || (clientArg !== "all" && !clients.includes(clientArg as Client))) {
  console.error(`--client must be 'all' or one of: ${clients.join(", ")}`);
  process.exit(1);
}
const selected = clientArg === "all" ? clients : [clientArg as Client];
const autoUpdate = args.includes("--auto-update") || (!args.includes("--no-auto-update") && source.startsWith("github:"));
if (args.includes("--auto-update") && args.includes("--no-auto-update")) {
  console.error("Cannot combine --auto-update and --no-auto-update"); process.exit(1);
}
const home = os.homedir();
const cwd = process.cwd();
let command = ["npx", "-y", source];
const errors: string[] = [];
const messages: string[] = [];

function jsonConfig(file: string, keys: string[], entry: object, schema = false): void {
  const original = existsSync(file) ? readFileSync(file, "utf8") : "{}\n";
  const parseErrors: ParseError[] = [];
  const cfg = parse(original, parseErrors, { allowTrailingComma: true }) as Record<string, unknown>;
  if (parseErrors.length || !cfg || typeof cfg !== "object" || Array.isArray(cfg)) {
    errors.push(`${file}: invalid JSON/JSONC; left unchanged`);
    return;
  }
  let cursor: unknown = cfg;
  for (const key of keys.slice(0, -1)) {
    if (cursor && typeof cursor === "object" && !Array.isArray(cursor)) cursor = (cursor as Record<string, unknown>)[key];
    else cursor = undefined;
    if (cursor !== undefined && (!cursor || typeof cursor !== "object" || Array.isArray(cursor))) {
      errors.push(`${file}: ${key} is not an object; left unchanged`);
      return;
    }
  }
  const previous = cursor && typeof cursor === "object" ? (cursor as Record<string, unknown>)[keys.at(-1)!] : undefined;
  if (previous !== undefined) {
    if (JSON.stringify(previous) !== JSON.stringify(entry)) {
      const existing = JSON.stringify(previous);
      if (!upgradeConfig || (!existing.includes(source) && !existing.includes(pkg.name)) || existing.includes('"type":"remote"')) {
        errors.push(`${file}: awsm already has a different configuration; left unchanged (use --upgrade-config for owned entries)`);
        return;
      }
      const options = { formattingOptions: { insertSpaces: true, tabSize: 2, eol: "\n" } };
      const changed = applyEdits(original, modify(original, keys, entry, options));
      writeFileSync(file, changed.endsWith("\n") ? changed : changed + "\n");
      messages.push(`~ MCP ${file} upgraded`);
    } else messages.push(`= MCP ${file} already configured`);
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
  // Only append a new table; leave existing tables unchanged rather than trying to parse all TOML.
  if (/^\s*\[mcp_servers\.(?:awsm|"awsm")(?:\]|\.)/m.test(original)) {
    const section = original.split(/^\s*\[mcp_servers\.(?:awsm|"awsm")\]\s*$/m)[1]?.split(/^\s*\[/m)[0] ?? "";
    if (section.includes(`command = ${JSON.stringify(command[0])}`) && section.includes(`args = ${JSON.stringify(command.slice(1))}`))
      messages.push(`= MCP ${file} already configured`);
    else if (upgradeConfig && (section.includes(source) || section.includes(pkg.name))) {
      const table = `[mcp_servers.awsm]\ncommand = ${JSON.stringify(command[0])}\nargs = ${JSON.stringify(command.slice(1))}\n`;
      const heading = "[mcp_servers.awsm]";
      const start = original.indexOf(heading);
      const tail = original.slice(start + heading.length);
      const next = tail.search(/\n\s*\[/);
      const end = next < 0 ? original.length : start + heading.length + next + 1;
      const changed = original.slice(0, start) + table + original.slice(end);
      writeFileSync(file, changed); messages.push(`~ MCP ${file} upgraded`);
    } else errors.push(`${file}: mcp_servers.awsm already has a different configuration; left unchanged (use --upgrade-config for owned entries)`);
    return;
  }
  mkdirSync(path.dirname(file), { recursive: true });
  const block = `[mcp_servers.awsm]\ncommand = ${JSON.stringify(command[0])}\nargs = ${JSON.stringify(command.slice(1))}\n`;
  writeFileSync(file, `${original}${original && !original.endsWith("\n") ? "\n" : ""}${original ? "\n" : ""}${block}`);
  messages.push(`+ MCP ${file}`);
}

function copySkills(dir: string): void {
  const src = path.join(root, "skills");
  if (!existsSync(src)) { errors.push(`Skill directory not found: ${src}`); return; }
  try {
    const report = syncSkills(src, dir, forceSkills, skillMode);
    messages.push(`+ Skills ${dir}: ${report.added} new, ${report.updated} updated, ${report.preserved} customized preserved`);
  } catch (error) { errors.push(`Skill sync failed: ${String(error)}`); }
}

const sharedSkills = new Set<string>();
for (const client of selected) {
  const skillsDir = client === "opencode" ? (globalInstall ? path.join(home, ".config/opencode/skills") : path.join(cwd, ".opencode/skills"))
    : client === "claude" ? (globalInstall ? path.join(home, ".claude/skills") : path.join(cwd, ".claude/skills"))
    : client === "antigravity" && globalInstall ? path.join(home, ".gemini/antigravity-cli/skills")
    : globalInstall ? path.join(home, ".agents/skills") : path.join(cwd, ".agents/skills");
  command = autoUpdate ? ["npx", "-y", "--prefer-online", source, ...(args.includes("--skip-skills") ? [] : ["--managed-skills", skillsDir, ...(skillMode === "all" ? ["--all-skills"] : [])])] : ["npx", "-y", source];
  if (!args.includes("--skip-mcp")) {
    switch (client) {
      case "opencode": jsonConfig(globalInstall ? path.join(home, ".config/opencode/opencode.json") : path.join(cwd, ".opencode/opencode.json"), ["mcp", "servers", "awsm"], { type: "local", command }, true); break;
      case "claude": jsonConfig(globalInstall ? path.join(home, ".claude.json") : path.join(cwd, ".mcp.json"), ["mcpServers", "awsm"], { type: "stdio", command: command[0], args: command.slice(1) }); break;
      case "codex": tomlConfig(globalInstall ? path.join(home, ".codex/config.toml") : path.join(cwd, ".codex/config.toml")); break;
      case "antigravity": jsonConfig(globalInstall ? path.join(home, ".gemini/config/mcp_config.json") : path.join(cwd, ".agents/mcp_config.json"), ["mcpServers", "awsm"], { command: command[0], args: command.slice(1) }); break;
      case "zed": if (globalInstall) jsonConfig(path.join(home, process.platform === "darwin" ? ".zed/settings.json" : ".config/zed/settings.json"), ["context_servers", "awsm"], { command: command[0], args: command.slice(1), env: {} });
        else messages.push("= Zed MCP: context_servers settings are user-level; run --global for MCP (project skills are still installed)"); break;
      case "copilot": jsonConfig(globalInstall ? path.join(home, ".copilot/mcp-config.json") : path.join(cwd, ".github/mcp.json"), ["mcpServers", "awsm"], { type: "local", command: command[0], args: command.slice(1), tools: ["*"] }); break;
    }
  }
  if (args.includes("--skip-skills")) continue;
  if (!sharedSkills.has(skillsDir)) { copySkills(skillsDir); sharedSkills.add(skillsDir); }
}
messages.push("= Skill installation mode: " + skillMode + " (use --all-skills to install specialist workflows)");
messages.push(autoUpdate ? "= Automatic updates enabled on MCP start (network revalidation; local skill edits preserved)" : "= Automatic updates disabled");
console.error([...messages, ...errors.map(e => `✗ ${e}`), `\n${errors.length ? "Finished with conflicts" : "Finished"}. Check the MCP status in your client before using the tools.`].join("\n"));
if (errors.length) process.exitCode = 1;
