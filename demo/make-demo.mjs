import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const repo = fileURLToPath(new URL('..', import.meta.url));
const scratch = mkdtempSync(path.join(tmpdir(), 'awsm-demo-'));
const outputDir = path.join(repo, 'demo');
const exampleDir = path.join(outputDir, 'example');
mkdirSync(exampleDir, { recursive: true });
const run = (command, args) => {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${command}: ${result.stderr?.slice(-1500) ?? result.error}`);
};
const client = new Client({ name: 'awsm-demo', version: '1.0.0' });
await client.connect(new StdioClientTransport({ command: process.execPath, args: [path.join(repo, 'build/index.js')], cwd: scratch }));
const call = async (name, args) => {
  const response = await client.callTool({ name, arguments: args });
  if (response.isError) throw new Error(response.content[0].text);
  return JSON.parse(response.content[0].text);
};
let colors, asset, preview;
try {
  colors = await call('palette', { color: '#176F57', scheme: 'complete' });
  asset = await call('make_asset', {
    kind: 'og-card', title: 'Kopi Pagi', subtitle: 'Ritual setiap hari', label: 'STUDIO KOPI',
    colors: ['#122923', '#27614b', '#ddad65'], dir: scratch, filename: 'coffee-card.svg'
  });
  copyFileSync(asset.path, path.join(exampleDir, 'coffee-card.svg'));
  writeFileSync(path.join(exampleDir, 'index.html'), `<!doctype html>
<html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Contoh keluaran AWSM</title><style>body{margin:0;min-height:100vh;background:#101c1b;color:#f2eee2;font:18px Georgia,serif;display:grid;place-content:center;padding:24px}main{max-width:900px}h1{font-size:clamp(32px,6vw,60px);margin:0 0 12px}p{max-width:55ch;line-height:1.5}img{display:block;width:100%;height:auto;border:1px solid #507166}</style><main><h1>Kopi Pagi</h1><p>Contoh halaman statis yang memakai SVG dari tool <code>make_asset</code>. Ini bukan aplikasi yang digenerasikan otomatis.</p><img alt="Kartu Kopi Pagi, ritual setiap hari" src="coffee-card.svg"></main></html>\n`);
  preview = await call('serve', { root: exampleDir });
  const response = await fetch(preview.url);
  if (!response.ok || !(await response.text()).includes('coffee-card.svg')) throw new Error('Preview HTML failed');
  const svgResponse = await fetch(new URL('coffee-card.svg', preview.url));
  if (!svgResponse.ok || !(await svgResponse.text()).includes('Kopi Pagi')) throw new Error('Preview SVG failed');
  await call('serve', { action: 'stop' });
} finally { await client.close(); }
// macOS Quick Look renders the SVG returned by the MCP tool; the card is not a mockup.
if (process.platform !== 'darwin') throw new Error('Demo visual renderer requires macOS Quick Look (qlmanage)');
run('qlmanage', ['-t', '-s', '1000', '-o', scratch, asset.path]);
copyFileSync(path.join(scratch, 'coffee-card.svg.png'), path.join(outputDir, 'card-preview.png'));
const scenes = [
  { title: '01 / PROMPT', command: 'Buat visual Kopi Pagi. Mulai dari palet, lalu kartu sosial.', result: 'Contoh pemakaian MCP langsung — bukan hasil dari model generatif.' },
  { title: '02 / PALETTE', command: "palette({ color: '#176F57', scheme: 'complete' })", result: `Base: ${colors.base}\n${colors.palette.slice(1, 5).map(v => `${v.name}: ${v.hex}`).join('   ')}`, swatches: colors.palette.slice(0, 5).map(v => v.hex) },
  { title: '03 / MAKE ASSET', command: "make_asset({ kind: 'og-card', title: 'Kopi Pagi', ... })", result: `Saved: demo/example/coffee-card.svg\nSize: ${asset.size}   Bytes: ${asset.bytes}\nSVG-nya tampil di sebelah kanan.`, image: path.join(outputDir, 'card-preview.png') },
  { title: '04 / PREVIEW', command: "serve({ root: 'demo/example' })", result: `Preview lokal: ${preview.url}\nGET / → 200 OK   GET /coffee-card.svg → 200 OK\nBuka index.html untuk melihat contoh halaman yang memakai SVG.`, image: path.join(outputDir, 'card-preview.png') },
  { title: '05 / LANJUTKAN', command: 'Di agent: gunakan awsm-taste-ui + awsm-prototype-qa', result: 'Cari foto berlisensi lewat find_images; cari ikon lewat find_icons.\nBuild & uji prototype dengan agent coding.\nPaket ini tidak mengedit kanvas FigCraft secara langsung.' }
];
const sceneFile = path.join(scratch, 'scenes.json');
writeFileSync(sceneFile, JSON.stringify(scenes));
run('python3', [path.join(outputDir, 'render-frames.py'), sceneFile, scratch]);
const inputs = scenes.flatMap((_, i) => ['-loop', '1', '-framerate', '24', '-t', '5', '-i', path.join(scratch, `frame-${String(i).padStart(2, '0')}.png`)]);
run('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', `${scenes.map((_, i) => `[${i}:v]`).join('')}concat=n=${scenes.length}:v=1:a=0[out]`, '-map', '[out]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', '-movflags', '+faststart', path.join(outputDir, 'awsm-demo.mp4')]);
run('ffmpeg', ['-v', 'error', '-y', '-ss', '12', '-i', path.join(outputDir, 'awsm-demo.mp4'), '-frames:v', '1', '-update', '1', path.join(outputDir, 'poster.png')]);
run('ffmpeg', ['-v', 'error', '-y', '-ss', '10', '-i', path.join(outputDir, 'awsm-demo.mp4'), '-vf', 'fps=1/5,scale=640:-1:flags=lanczos', '-loop', '0', path.join(outputDir, 'awsm-demo.gif')]);
console.log('Usage demo, poster, GIF and actual example asset ready in demo/');
