import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
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
assert.match(result.stderr, /different configuration; left unchanged/);
assert(readFileSync(cfgPath, 'utf8').includes('https://example.com'));
const githubCwd = mkdtempSync(path.join(tmpdir(), 'awsm-github-test-'));
const fromGithub = spawnSync(process.execPath, [path.join(root, 'build/index.js'), 'setup', '--source', 'github:someone/my-awsm-mcp'], { cwd: githubCwd, encoding: 'utf8' });
assert.equal(fromGithub.status, 0, fromGithub.stderr);
assert.deepEqual(JSON.parse(readFileSync(path.join(githubCwd, '.opencode/opencode.json'), 'utf8')).mcp.servers.awsm.command, ['npx', '-y', 'github:someone/my-awsm-mcp']);

const multiCwd = mkdtempSync(path.join(tmpdir(), 'awsm-all-test-'));
const allResult = spawnSync(process.execPath, [path.join(root, 'build/index.js'), 'setup', '--client', 'all', '--source', 'github:rikoarik/figcraft-mcp-awsm'], { cwd: multiCwd, encoding: 'utf8' });
assert.equal(allResult.status, 0, allResult.stderr);
const json = p => JSON.parse(readFileSync(path.join(multiCwd, p), 'utf8'));
assert.equal(json('.opencode/opencode.json').mcp.servers.awsm.command[3], 'github:rikoarik/figcraft-mcp-awsm');
assert.equal(json('.mcp.json').mcpServers.awsm.type, 'stdio');
assert.equal(json('.agents/mcp_config.json').mcpServers.awsm.command, 'npx');
assert.equal(json('.github/mcp.json').mcpServers.awsm.tools[0], '*');
assert(readFileSync(path.join(multiCwd, '.codex/config.toml'), 'utf8').includes('[mcp_servers.awsm]'));
assert(existsSync(path.join(multiCwd, '.agents/skills/awsm-taste-ui/SKILL.md')));
assert(existsSync(path.join(multiCwd, '.agents/skills/awsm-iconography/SKILL.md')));
assert(existsSync(path.join(multiCwd, '.agents/skills/awsm-admin-dashboard/SKILL.md')));
assert(existsSync(path.join(multiCwd, '.agents/skills/awsm-app-ui/SKILL.md')));
assert(existsSync(path.join(multiCwd, '.claude/skills/awsm-antislop-ui/SKILL.md')));
const skillNames = readdirSync(path.join(root, 'skills'));
assert.equal(skillNames.length, 18);
for (const name of skillNames) {
  const text = readFileSync(path.join(root, 'skills', name, 'SKILL.md'), 'utf8');
  assert(text.startsWith('---\n') && text.includes(`\nname: ${name}\n`) && /\ndescription: .+\n/.test(text), `${name}: invalid frontmatter`);
  assert(text.split(/\s+/).length > 200, `${name}: workflow too short`);
  assert(!/\b(?:untuk|dengan|jangan|pakai|sebelum|setelah|ketika|gambar|ikon|lisensi|warna|tidak|bukan|hasil|buat|simpan)\b/i.test(text), `${name}: untranslated skill content`);
  assert(existsSync(path.join(multiCwd, '.agents/skills', name, 'SKILL.md')));
}
const allAgain = spawnSync(process.execPath, [path.join(root, 'build/index.js'), 'setup', '--client', 'all', '--source', 'github:rikoarik/figcraft-mcp-awsm'], { cwd: multiCwd, encoding: 'utf8' });
assert.equal(allAgain.status, 0, allAgain.stderr); // idempotent
assert.equal(readFileSync(path.join(multiCwd, '.codex/config.toml'), 'utf8').match(/\[mcp_servers\.awsm\]/g).length, 1);
const fakeHome = mkdtempSync(path.join(tmpdir(), 'awsm-home-test-'));
const globalResult = spawnSync(process.execPath, [path.join(root, 'build/index.js'), 'setup', '--client', 'all', '--global', '--source', 'github:rikoarik/figcraft-mcp-awsm'], { cwd: multiCwd, env: { ...process.env, HOME: fakeHome }, encoding: 'utf8' });
assert.equal(globalResult.status, 0, globalResult.stderr);
assert.equal(JSON.parse(readFileSync(path.join(fakeHome, '.gemini/config/mcp_config.json'), 'utf8')).mcpServers.awsm.command, 'npx');
assert(existsSync(path.join(fakeHome, '.gemini/antigravity-cli/skills/awsm-taste-ui/SKILL.md')));
const zedConfig = path.join(fakeHome, process.platform === 'darwin' ? '.zed/settings.json' : '.config/zed/settings.json');
assert.equal(JSON.parse(readFileSync(zedConfig, 'utf8')).context_servers.awsm.command, 'npx');


// Managed skill synchronization never overwrites user-edited skills.
const { syncSkills } = await import('../build/skill-sync.js');
const fakeSource = mkdtempSync(path.join(tmpdir(), 'awsm-upstream-'));
const fakeTarget = mkdtempSync(path.join(tmpdir(), 'awsm-skills-'));
const fsSync = await import('node:fs');
fsSync.mkdirSync(path.join(fakeSource,'awsm-demo'));
writeFileSync(path.join(fakeSource,'awsm-demo/SKILL.md'),'upstream v1');
assert.equal(syncSkills(fakeSource,fakeTarget).added,1);
writeFileSync(path.join(fakeSource,'awsm-demo/SKILL.md'),'upstream v2');
assert.equal(syncSkills(fakeSource,fakeTarget).updated,1);
writeFileSync(path.join(fakeTarget,'awsm-demo/SKILL.md'),'my customization');
writeFileSync(path.join(fakeSource,'awsm-demo/SKILL.md'),'upstream v3');
assert.equal(syncSkills(fakeSource,fakeTarget).preserved,1);
assert.equal(readFileSync(path.join(fakeTarget,'awsm-demo/SKILL.md'),'utf8'),'my customization');
assert.equal(syncSkills(fakeSource,fakeTarget,true).updated,1);

const transport = new StdioClientTransport({ command: process.execPath, args: [path.join(root, 'build/index.js')], cwd });
const client = new Client({ name: 'awsm-smoke', version: '1.0.0' });
try {
  await client.connect(transport);
  const tools = await client.listTools();
  assert.equal(tools.tools.length, 10);
  for (const tool of tools.tools) {
    assert(!/\b(?:untuk|dengan|jangan|pakai|sebelum|gambar|ikon|lisensi|warna|tidak|bukan|hasil|buat|simpan)\b/i.test(JSON.stringify(tool)), `${tool.name}: untranslated tool description`);
  }
  const iconSetInvalid = await client.callTool({name:'save_icon_set',arguments:{icons:['lucide:users','tabler:bell']}});
  assert.equal(iconSetInvalid.isError,true);
  const example = { pages: [{id:"p1",name:"Home",type:"PAGE",children:[{id:"hero",name:"Hero",type:"FRAME",children:[{id:"t1",name:"Headline",type:"TEXT",characters:"Build better"},{id:"img",name:"Factory photo",type:"RECTANGLE",fills:[{type:"IMAGE"}]},{id:"ic",name:"icon arrow",type:"VECTOR"},{id:"rect",name:"Rectangle 2",type:"RECTANGLE"}]}]}] };
  const prepared = await client.callTool({name:"prepare_web_handoff",arguments:{document:example,exportDir:path.join(cwd,"exports"),outputPath:path.join(cwd,"handoff.json")}});
  assert.equal(prepared.isError, undefined, prepared.content[0].text);
  const manifest = JSON.parse(prepared.content[0].text);
  assert.equal(manifest.summary.exportableAssets, 2);
  assert.equal(manifest.layers.find(l=>l.id==="t1").implementation,"dom");
  assert.equal(manifest.assets.find(a=>a.nodeId==="img").format,"png");
  assert.equal(manifest.assets.find(a=>a.nodeId==="ic").format,"svg");
  const fsExtra = await import('node:fs');
  fsExtra.mkdirSync(path.join(cwd,"exports"),{recursive:true});
  for(const asset of manifest.assets) fsExtra.writeFileSync(path.join(cwd,"exports",asset.filename),asset.format==="svg" ? '<svg xmlns="http://www.w3.org/2000/svg"></svg>' : 'fake-image');
  const synced = await client.callTool({name:"sync_figcraft_assets",arguments:{handoffPath:path.join(cwd,"handoff.json"),exportDir:path.join(cwd,"exports"),publicDir:path.join(cwd,"public")}});
  assert.equal(synced.isError,undefined,synced.content[0].text);
  assert.equal(JSON.parse(synced.content[0].text).complete,true);
  const syncedAgain = await client.callTool({name:"sync_figcraft_assets",arguments:{handoffPath:path.join(cwd,"handoff.json"),exportDir:path.join(cwd,"exports"),publicDir:path.join(cwd,"public")}});
  assert.equal(JSON.parse(syncedAgain.content[0].text).files.every(a=>a.status==="unchanged"),true);
  const ambiguous = await client.callTool({name:"prepare_web_handoff",arguments:{document:{pages:[{id:"p",type:"PAGE",children:[{id:"odd",name:"Unknown",type:"CUSTOM"}]}]}}});
  assert.equal(JSON.parse(ambiguous.content[0].text).issues.some(i=>i.code==="AMBIGUOUS_LAYER"),true);
  const palette = await client.callTool({ name: 'palette', arguments: { color: '#1b7f5a' } });
  assert.equal(JSON.parse(palette.content[0].text).base, '#1b7f5a');
  assert.match(JSON.parse(palette.content[0].text).note, /contrast/);
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
