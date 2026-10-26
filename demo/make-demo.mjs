import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const repo = fileURLToPath(new URL('..', import.meta.url));
const scratch = mkdtempSync(path.join(tmpdir(), 'awsm-demo-'));
const output = path.join(repo, 'demo/awsm-demo.mp4');
const install = spawnSync(process.execPath, [path.join(repo, 'build/index.js'), 'setup', '--client', 'all', '--source', 'github:rikoarik/-figcraft-mcp-awsm'], { cwd: scratch, encoding: 'utf8' });
if (install.status !== 0) throw Error(install.stderr);
const client = new Client({ name: 'awsm-video-demo', version: '1.0.0' });
await client.connect(new StdioClientTransport({ command: process.execPath, args: [path.join(repo, 'build/index.js')], cwd: scratch }));
let tools, palette, svg;
try {
  tools = await client.listTools();
  palette = await client.callTool({ name: 'palette', arguments: { color: '#176F57' } });
  svg = await client.callTool({ name: 'make_asset', arguments: { kind: 'badge', title: 'AW', dir: scratch, filename: 'demo.svg' } });
} finally { await client.close(); }
const installed = install.stderr.match(/\+ \d+ skill/g)?.join(' | ') ?? 'skills copied';
const paletteValue = JSON.parse(palette.content[0].text);
const assetPath = JSON.parse(svg.content[0].text).path;
const scenes = [
  ['01 / INSTALL', `npx -y github:rikoarik/-figcraft-mcp-awsm\\n  setup --client all --source github:rikoarik/-figcraft-mcp-awsm`, `Project config: OpenCode, Claude, Codex, Antigravity, Copilot\\nZed skills: shared .agents/skills; MCP requires --global\\n${installed}`],
  ['02 / CONNECT', `MCP stdio handshake: connected`, `listTools(): ${tools.tools.length} tools\\n${tools.tools.map(t => t.name).join('  /  ')}`],
  ['03 / CREATE', `palette({ color: '#176F57' })`, `Base color: ${paletteValue.base}\\nmake_asset({ kind: 'badge', title: 'AW' })\\nSVG created: ${path.basename(assetPath)}`],
  ['04 / NEXT', `Ask your agent to use awsm-taste-ui`, `Find licensed images & icons, build a responsive prototype,\\nthen verify with awsm-prototype-qa.\\nNo FigCraft canvas control or AI image generation claimed.`]
];
const ffmpeg = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' });
if (ffmpeg.status !== 0) throw Error('ffmpeg required to create demo');
const sceneFile = path.join(scratch, 'scenes.json');
writeFileSync(sceneFile, JSON.stringify(scenes.map(([heading, command, result]) => [heading, command.replaceAll('\\n', '\n'), result.replaceAll('\\n', '\n')])));
const render = spawnSync('python3', [path.join(repo, 'demo/render-frames.py'), sceneFile, scratch], { encoding: 'utf8' });
if (render.status !== 0) throw Error(render.stderr);
const inputs = scenes.flatMap((_, i) => ['-loop', '1', '-framerate', '24', '-t', '5', '-i', path.join(scratch, `frame-${String(i).padStart(2, '0')}.png`)]);
const ff = spawnSync('ffmpeg', ['-y', ...inputs, '-filter_complex', `${scenes.map((_,i)=>`[${i}:v]`).join('')}concat=n=${scenes.length}:v=1:a=0[out]`, '-map', '[out]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', '-movflags', '+faststart', output], { encoding: 'utf8' });
if (ff.status !== 0) throw Error(ff.stderr.slice(-3000));
console.log(`Demo ready: ${output}`);
