import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const cwd = mkdtempSync(path.join(tmpdir(), 'awsm-test-'));
const run = (...args) => spawnSync(process.execPath, [path.join(root, 'build/index.js'), ...args], { cwd, encoding: 'utf8' });
let result = run('setup');
assert.equal(result.status, 0, result.stderr);
let config = JSON.parse(readFileSync(path.join(cwd, '.opencode/opencode.json'), 'utf8'));
assert.deepEqual(config.mcp.servers.awsm.command, ['npx', '-y', 'my-awsm-mcp']);
for (const id of ['awsm-assets', 'awsm-asset-lab', 'awsm-auto-prototype', 'awsm-prompt-to-prototype', 'awsm-prototype-qa']) {
  assert(existsSync(path.join(cwd, '.opencode/skills', id, 'SKILL.md')));
}
result = run('setup');
assert.equal(result.status, 0, result.stderr);
const cfgPath = path.join(cwd, '.opencode/opencode.json');
writeFileSync(cfgPath, '{\n  // my comment\n  "custom": true,\n  "mcp": { "servers": {} },\n}\n');
result = run('setup');
assert.equal(result.status, 0, result.stderr);
assert(readFileSync(cfgPath, 'utf8').includes('// my comment'));
config = readFileSync(cfgPath, 'utf8');
assert(config.includes('"custom": true'));
assert(config.includes('"awsm"'));
writeFileSync(cfgPath, '{ "mcp": { "servers": { "awsm": { "type": "remote", "url": "https://example.com" } } } }');
result = run('setup');
assert.equal(result.status, 1);
assert(readFileSync(cfgPath, 'utf8').includes('https://example.com'));
const githubCwd = mkdtempSync(path.join(tmpdir(), 'awsm-github-test-'));
const fromGithub = spawnSync(process.execPath, [path.join(root, 'build/index.js'), 'setup', '--source', 'github:someone/my-awsm-mcp'], { cwd: githubCwd, encoding: 'utf8' });
assert.equal(fromGithub.status, 0, fromGithub.stderr);
assert.deepEqual(JSON.parse(readFileSync(path.join(githubCwd, '.opencode/opencode.json'), 'utf8')).mcp.servers.awsm.command, ['npx', '-y', 'github:someone/my-awsm-mcp']);

const multiCwd = mkdtempSync(path.join(tmpdir(), 'awsm-all-test-'));
const allResult = spawnSync(process.execPath, [path.join(root, 'build/index.js'), 'setup', '--client', 'all', '--source', 'github:rikoarik/figcraft-mcp-awsm'], { cwd: multiCwd, encoding: 'utf8' });
assert.equal(allResult.status, 0, allResult.stderr);
const json = p => JSON.parse(readFileSync(path.join(multiCwd, p), 'utf8'));
assert.equal(json('.opencode/opencode.json').mcp.servers.awsm.command[2], 'github:rikoarik/figcraft-mcp-awsm');
assert.equal(json('.mcp.json').mcpServers.awsm.type, 'stdio');
assert.equal(json('.agents/mcp_config.json').mcpServers.awsm.command, 'npx');
assert.equal(json('.github/mcp.json').mcpServers.awsm.tools[0], '*');
assert(readFileSync(path.join(multiCwd, '.codex/config.toml'), 'utf8').includes('[mcp_servers.awsm]'));
assert(existsSync(path.join(multiCwd, '.agents/skills/awsm-taste-ui/SKILL.md')));
assert(existsSync(path.join(multiCwd, '.claude/skills/awsm-antislop-ui/SKILL.md')));
const allAgain = spawnSync(process.execPath, [path.join(root, 'build/index.js'), 'setup', '--client', 'all', '--source', 'github:rikoarik/figcraft-mcp-awsm'], { cwd: multiCwd, encoding: 'utf8' });
assert.equal(allAgain.status, 0, allAgain.stderr); // idempotent
assert.equal(readFileSync(path.join(multiCwd, '.codex/config.toml'), 'utf8').match(/\[mcp_servers\.awsm\]/g).length, 1);

const transport = new StdioClientTransport({ command: process.execPath, args: [path.join(root, 'build/index.js')], cwd });
const client = new Client({ name: 'awsm-smoke', version: '1.0.0' });
try {
  await client.connect(transport);
  const tools = await client.listTools();
  assert.equal(tools.tools.length, 7);
  const palette = await client.callTool({ name: 'palette', arguments: { color: '#1b7f5a' } });
  assert.equal(JSON.parse(palette.content[0].text).base, '#1b7f5a');
  const asset = await client.callTool({ name: 'make_asset', arguments: { kind: 'badge', title: 'Test', dir: cwd, filename: 'badge.svg' } });
  assert(existsSync(JSON.parse(asset.content[0].text).path));
  const duplicate = await client.callTool({ name: 'make_asset', arguments: { kind: 'badge', dir: cwd, filename: 'badge.svg' } });
  assert.equal(duplicate.isError, true);
  writeFileSync(path.join(cwd, 'index.html'), '<h1>hello</h1>');
  const served = await client.callTool({ name: 'serve', arguments: { root: cwd, port: 51000 } });
  const url = JSON.parse(served.content[0].text).url;
  assert.equal((await fetch(url)).status, 200);
  assert((await (await fetch(url)).text()).includes('hello'));
  await client.callTool({ name: 'serve', arguments: { action: 'stop' } });
} finally {
  await client.close();
}
console.log('Smoke tests passed');
