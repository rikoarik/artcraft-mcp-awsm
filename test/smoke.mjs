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
assert(existsSync(path.join(cwd, '.opencode/skills/awsm-design/SKILL.md')));
assert(!existsSync(path.join(cwd, '.opencode/skills/awsm-assets/SKILL.md')),
  'Default installation should not include 21 overlapping specialist skills');
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
assert.deepEqual(JSON.parse(readFileSync(path.join(githubCwd, '.opencode/opencode.json'), 'utf8')).mcp.servers.awsm.command, ['npx', '-y', '--prefer-online', 'github:someone/my-awsm-mcp', '--managed-skills', path.join(githubCwd, '.opencode/skills')]);

const upgradeCwd = mkdtempSync(path.join(tmpdir(),'awsm-upgrade-'));
let up = spawnSync(process.execPath,[path.join(root,'build/index.js'),'setup','--source','github:rikoarik/figcraft-mcp-awsm','--no-auto-update'],{cwd:upgradeCwd,encoding:'utf8'});
assert.equal(up.status,0,up.stderr);
up = spawnSync(process.execPath,[path.join(root,'build/index.js'),'setup','--source','github:rikoarik/artcraft-mcp-awsm','--auto-update','--upgrade-config'],{cwd:upgradeCwd,encoding:'utf8'});
assert.equal(up.status,0,up.stderr);
assert.equal(JSON.parse(readFileSync(path.join(upgradeCwd,'.opencode/opencode.json'),'utf8')).mcp.servers.awsm.command[2],'--prefer-online');
assert.equal(JSON.parse(readFileSync(path.join(upgradeCwd,'.opencode/opencode.json'),'utf8')).mcp.servers.awsm.command[3],
  'github:rikoarik/artcraft-mcp-awsm');
const multiCwd = mkdtempSync(path.join(tmpdir(), 'awsm-all-test-'));
const allResult = spawnSync(process.execPath, [path.join(root, 'build/index.js'), 'setup', '--client', 'all', '--all-skills', '--source', 'github:rikoarik/artcraft-mcp-awsm'], { cwd: multiCwd, encoding: 'utf8' });
assert.equal(allResult.status, 0, allResult.stderr);
const json = p => JSON.parse(readFileSync(path.join(multiCwd, p), 'utf8'));
assert.equal(json('.opencode/opencode.json').mcp.servers.awsm.command[3], 'github:rikoarik/artcraft-mcp-awsm');
assert.equal(json('.mcp.json').mcpServers.awsm.type, 'stdio');
assert.equal(json('.agents/mcp_config.json').mcpServers.awsm.command, 'npx');
assert.equal(json('.github/mcp.json').mcpServers.awsm.tools[0], '*');
assert(readFileSync(path.join(multiCwd, '.codex/config.toml'), 'utf8').includes('[mcp_servers.awsm]'));
assert(existsSync(path.join(multiCwd, '.agents/skills/awsm-taste-ui/SKILL.md')));
assert(existsSync(path.join(multiCwd, '.agents/skills/awsm-iconography/SKILL.md')));
assert(existsSync(path.join(multiCwd, '.agents/skills/awsm-admin-dashboard/SKILL.md')));
assert(existsSync(path.join(multiCwd, '.agents/skills/awsm-app-ui/SKILL.md')));
assert(existsSync(path.join(multiCwd, '.claude/skills/awsm-antislop-ui/SKILL.md')));
const coreSkill=readFileSync(path.join(root,'skills/awsm-design/SKILL.md'),'utf8');
assert.match(coreSkill,/Style-first 3D direction/);
assert.match(coreSkill,/compare silhouette, ratio, edge treatment/);
assert.match(coreSkill,/Re-measure after geometry edits/);
const direct3dSkill=readFileSync(path.join(root,'skills/awsm-design/SKILL.md'),'utf8');
assert.match(direct3dSkill,/## Direct 3D: SolidCraft only/);
assert.match(direct3dSkill,/Do not connect CADCraft/);
assert.match(direct3dSkill,/do not.*website/i);
const skillNames = readdirSync(path.join(root, 'skills'));
assert.equal(skillNames.length, 22);
for (const name of skillNames) {
  const text = readFileSync(path.join(root, 'skills', name, 'SKILL.md'), 'utf8');
  assert(text.startsWith('---\n') && text.includes(`\nname: ${name}\n`) && /\ndescription: .+\n/.test(text), `${name}: invalid frontmatter`);
  assert(text.split(/\s+/).length > 200, `${name}: workflow too short`);
  assert(!/\b(?:untuk|dengan|jangan|pakai|sebelum|setelah|ketika|gambar|ikon|lisensi|warna|tidak|bukan|hasil|buat|simpan)\b/i.test(text), `${name}: untranslated skill content`);
  assert(existsSync(path.join(multiCwd, '.agents/skills', name, 'SKILL.md')));
}
const allAgain = spawnSync(process.execPath, [path.join(root, 'build/index.js'), 'setup', '--client', 'all', '--all-skills', '--source', 'github:rikoarik/artcraft-mcp-awsm'], { cwd: multiCwd, encoding: 'utf8' });
assert.equal(allAgain.status, 0, allAgain.stderr); // idempotent
assert.equal(readFileSync(path.join(multiCwd, '.codex/config.toml'), 'utf8').match(/\[mcp_servers\.awsm\]/g).length, 1);
const fakeHome = mkdtempSync(path.join(tmpdir(), 'awsm-home-test-'));
const globalResult = spawnSync(process.execPath, [path.join(root, 'build/index.js'), 'setup', '--client', 'all', '--global', '--all-skills', '--source', 'github:rikoarik/artcraft-mcp-awsm'], { cwd: multiCwd, env: { ...process.env, HOME: fakeHome }, encoding: 'utf8' });
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
const coreSource=mkdtempSync(path.join(tmpdir(),'awsm-core-source-'));
const coreTarget=mkdtempSync(path.join(tmpdir(),'awsm-core-target-'));
fsSync.mkdirSync(path.join(coreSource,'awsm-design'));
fsSync.mkdirSync(path.join(coreSource,'awsm-extra'));
writeFileSync(path.join(coreSource,'awsm-design/SKILL.md'),'core instruction');
writeFileSync(path.join(coreSource,'awsm-extra/SKILL.md'),'specialist instruction');
assert.equal(syncSkills(coreSource,coreTarget,false,'core').added,1);
assert(existsSync(path.join(coreTarget,'awsm-design/SKILL.md')));
assert(!existsSync(path.join(coreTarget,'awsm-extra/SKILL.md')));
assert.equal(syncSkills(coreSource,coreTarget,false,'all').added,1);


const { parseGoogleFontFaces } = await import('../build/tools/google-font.js');
const fixtureCss = "/* latin */\n@font-face { font-family: 'Manrope'; font-style: normal; font-weight: 400; src: url(https://fonts.gstatic.com/s/manrope/test.woff2) format('woff2'); }";
const parsedFaces = parseGoogleFontFaces(fixtureCss);
assert.equal(parsedFaces.length,1);
assert.equal(parsedFaces[0].subset,'latin');
assert.equal(parsedFaces[0].weight,'400');

fsSync.mkdirSync(path.join(cwd,'.awsm'),{recursive:true});
writeFileSync(path.join(cwd,'.awsm/bridges.json'),JSON.stringify({
  version:1,servers:{
    demo:{command:process.execPath,args:[path.join(root,'test/bridge-child.mjs')],allowedTools:['echo']},
    solidcraft:{command:process.execPath,args:[path.join(root,'test/bridge-child.mjs')],allowedTools:['export','screenshot']},
    figcraft:{command:process.execPath,args:[path.join(root,'test/bridge-child.mjs')],allowedTools:['run_command']}
  }
}));
const transport = new StdioClientTransport({ command: process.execPath, args: [path.join(root, 'build/index.js')], cwd, env: {...process.env, AWSM_AUTO_SOLIDCRAFT:'0',AWSM_AUTO_CADCRAFT:'0'} });
const client = new Client({ name: 'awsm-smoke', version: '1.0.0' });
try {
  await client.connect(transport);
  const tools = await client.listTools();
  assert.equal(tools.tools.length, 24);
  for (const tool of tools.tools) {
    assert(!/\b(?:untuk|dengan|jangan|pakai|sebelum|gambar|ikon|lisensi|warna|tidak|bukan|hasil|buat|simpan)\b/i.test(JSON.stringify(tool)), `${tool.name}: untranslated tool description`);
  }
  const bridges = await client.callTool({name:'bridge_list',arguments:{connect:true}});
  assert.equal(bridges.isError,undefined,bridges.content[0].text);
  const found=JSON.parse(bridges.content[0].text);
  assert.equal(found.configuredServers,3);
  assert.equal(found.servers[0].status,'connected');
  assert.deepEqual(found.servers[0].tools.map(x=>x.name),['echo']);
  const proxied=await client.callTool({name:'bridge_call',arguments:{server:'demo',tool:'echo',arguments:{value:'hello'}}});
  assert.equal(proxied.isError,undefined,proxied.content[0].text);
  assert.equal(proxied.content[0].text,'echo:hello');
  const denied=await client.callTool({name:'bridge_call',arguments:{server:'demo',tool:'forbidden'}});
  assert.equal(denied.isError,true);
  const noServer=await client.callTool({name:'bridge_call',arguments:{server:'missing',tool:'echo'}});
  assert.equal(noServer.isError,true);
  const webProject=mkdtempSync(path.join(tmpdir(),'awsm-3d-web-'));
  const published=await client.callTool({name:'publish_3d_asset',arguments:{
    projectRoot:webProject,name:'sample-camera',figcraft:{x:100,y:150,width:560,height:420},
  }});
  assert.equal(published.isError,undefined,published.content[0].text);
  const result3d=JSON.parse(published.content[0].text);
  assert.equal(result3d.figcraft.status,'placed');
  assert.equal(result3d.asset.webModelUrl,'/assets/3d/sample-camera/model.obj');
  assert(existsSync(result3d.asset.model));
  assert(existsSync(result3d.asset.preview));
  assert(readFileSync(result3d.asset.model,'utf8').includes('f 1 2 3'));
  const duplicate3d=await client.callTool({name:'publish_3d_asset',arguments:{
    projectRoot:webProject,name:'sample-camera',
  }});
  assert.equal(duplicate3d.isError,true);
  assert(existsSync(result3d.asset.model));
  const badAssetName=await client.callTool({name:'publish_3d_asset',arguments:{
    projectRoot:webProject,name:'../unsafe',
  }});
  assert.equal(badAssetName.isError,true);
  const customIcon = await client.callTool({name:'draw_icon',arguments:{
    name:'project-progress',dir:path.join(cwd,'icons'),
    elements:[{kind:'circle',cx:12,cy:12,r:9},{kind:'path',d:'M 7 12 L 10 15 L 17 8'}]
  }});
  assert.equal(customIcon.isError,undefined,customIcon.content[0].text);
  assert(existsSync(JSON.parse(customIcon.content[0].text).file));
  const customDuplicate = await client.callTool({name:'draw_icon',arguments:{name:'project-progress',dir:path.join(cwd,'icons'),elements:[{kind:'circle',cx:12,cy:12,r:9}]}});
  assert.equal(customDuplicate.isError,true);
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
  const tokensDoc = {pages:[{id:'home',type:'PAGE',name:'Home',children:[{id:'txt',name:'Heading',type:'TEXT',characters:'Hello',style:{fontFamily:'Manrope',fontWeight:700,fontSize:28},fills:[{type:'SOLID',color:{r:0.1,g:0.2,b:0.3}}],cornerRadius:4},{id:'box',name:'Panel',type:'FRAME',itemSpacing:16,children:[]}]}]};
  const tokensResponse = await client.callTool({name:'extract_design_tokens',arguments:{document:tokensDoc}});
  assert.equal(tokensResponse.isError,undefined,tokensResponse.content[0].text);
  const observed=JSON.parse(tokensResponse.content[0].text);
  assert.equal(observed.tokenCandidates.fontFamilies[0].value,'Manrope');
  assert.equal(observed.tokenCandidates.fontSizes[0].value,28);
  assert.equal(observed.tokenCandidates.gaps[0].value,16);
  assert.equal(observed.tokenCandidates.colors[0].value,'#1a334d');
  const contrast = await client.callTool({name:'check_contrast',arguments:{pairs:[
    {foreground:'#000',background:'#fff'},
    {foreground:'#777',background:'#777'}
  ]}});
  assert.equal(contrast.isError,undefined,contrast.content[0].text);
  assert.equal(JSON.parse(contrast.content[0].text).results[0].ratio,21);
  assert.equal(JSON.parse(contrast.content[0].text).failedAA,1);
  const fast = await client.callTool({name:'design_quickstart',arguments:{brief:'Create an operational admin dashboard for managing invoices and customers',kind:'admin',speed:'fast',document:tokensDoc}});
  assert.equal(fast.isError,undefined,fast.content[0].text);
  const fastResult = JSON.parse(fast.content[0].text);
  assert.equal(fastResult.kind,'admin');
  assert(fastResult.reusableSkills.includes('awsm-admin-dashboard'));
  assert(fastResult.reusableSkills.includes('awsm-figcraft-to-web'));
  assert.equal(fastResult.inspectBudget.maxInitialFiles,6);
  const invalidAssetBatch = await client.callTool({name:'find_design_assets',arguments:{iconQueries:[],imageQueries:[]}});
  assert.equal(invalidAssetBatch.isError,true);
  const invalidFont = await client.callTool({name:'google_font',arguments:{family:'../../bad'}});
  assert.equal(invalidFont.isError,true);
  const projectFolder = path.join(cwd,'framework-fixture');
  fsSync.mkdirSync(projectFolder);
  writeFileSync(path.join(projectFolder,'package.json'),JSON.stringify({dependencies:{next:'15.2.1',react:'19.0.0','lucide-react':'*'}}));
  const scan = await client.callTool({name:'inspect_ui_project',arguments:{root:projectFolder}});
  assert.equal(scan.isError,undefined,scan.content[0].text);
  assert.equal(JSON.parse(scan.content[0].text).framework,'nextjs');

  const { encodeRgbaPng, decodePng } = await import('../build/tools/visual-png.js');
  const reference = path.join(cwd,'reference.png'), actual = path.join(cwd,'actual.png'), heatmap=path.join(cwd,'heatmap.png');
  const solid = (r,g,b)=>new Uint8Array([r,g,b,255,r,g,b,255,r,g,b,255,r,g,b,255]);
  const refPng=encodeRgbaPng({width:2,height:2,pixels:solid(255,255,255)});
  assert.deepEqual([...decodePng(refPng).pixels],[...solid(255,255,255)]);
  writeFileSync(reference,refPng);
  writeFileSync(actual,encodeRgbaPng({width:2,height:2,pixels:new Uint8Array([0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255])}));
  const diffResult = await client.callTool({name:'compare_ui_screenshots',arguments:{reference,actual,diffPath:heatmap,threshold:5}});
  assert.equal(diffResult.isError,undefined,diffResult.content[0].text);
  const diff=JSON.parse(diffResult.content[0].text);
  assert.equal(diff.changedPixels,1);
  assert.equal(diff.changedPercent,25);
  assert.equal(diff.passed,false);
  assert.deepEqual(diff.changedBoundingBox,{x:0,y:0,width:1,height:1});
  assert.equal(diff.regions.length,1);
  assert.equal(diff.regions[0].changedPixels,1);
  assert.equal(diff.regions[0].shareOfChanges,100);
  assert(existsSync(heatmap));
  assert.equal(decodePng(readFileSync(heatmap)).width,2);
  const identical=await client.callTool({name:'compare_ui_screenshots',arguments:{reference,actual:reference}});
  assert.equal(JSON.parse(identical.content[0].text).passed,true);
  const captureValidation=await client.callTool({name:'capture_ui_screenshots',arguments:{url:'https://example.com'}});
  assert.equal(captureValidation.isError,true);

  const { analyzeUiSnapshot } = await import('../build/tools/browser-audit.js');
  const snapshot={
    width:375,height:812,scrollWidth:490,clientWidth:375,totalElements:44,truncated:false,
    hasMain:false,title:'Example',
    brokenImages:[{selector:'#broken',detail:'/missing.png'}],
    missingAltImages:[{selector:'#no-alt'}],unnamedLinks:[{selector:'#blank-link'}],
    missingControlNames:[{selector:'button:nth-of-type(1)'}],
    unlabeledInputs:[{selector:'#email'}],placeholderLinks:[{selector:'a:nth-of-type(1)',detail:'#'}],
    horizontalOverflow:[{selector:'#wide',detail:'right 490px'}],
    smallTargets:[{selector:'#tiny',detail:'18x18'}],
  };
  const findings=analyzeUiSnapshot(snapshot,'mobile');
  assert(findings.some(x=>x.code==='HORIZONTAL_PAGE_OVERFLOW'&&x.severity==='high'));
  assert(findings.some(x=>x.code==='BROKEN_IMAGE'));
  assert(findings.some(x=>x.code==='IMAGE_MISSING_ALT'));
  assert(findings.some(x=>x.code==='UNNAMED_LINK'));
  assert(findings.some(x=>x.code==='UNLABELED_INPUT'));
  assert(findings.some(x=>x.code==='SMALL_CONTROL'));
  assert.equal(analyzeUiSnapshot({...snapshot,scrollWidth:375,brokenImages:[],missingControlNames:[],
      unlabeledInputs:[],placeholderLinks:[],horizontalOverflow:[],smallTargets:[],
      missingAltImages:[],unnamedLinks:[],hasMain:true},'mobile').length,0);
  const invalidAudit=await client.callTool({name:'audit_ui_page',arguments:{url:'https://example.com'}});
  assert.equal(invalidAudit.isError,true);
  const auditMissingBrowser=await client.callTool({name:'audit_ui_page',
    arguments:{url:'http://127.0.0.1:51000',projectRoot:cwd,viewports:[{name:'mobile',width:375,height:812}]}});
  assert.equal(auditMissingBrowser.isError,true);
  assert.match(auditMissingBrowser.content[0].text,/Playwright not found/);

  const {summarizeReview}=await import('../build/tools/review-ui.js');
  const reviewSummary=summarizeReview({
    issues:[
      {code:'MISSING_MAIN',severity:'info',viewport:'desktop',message:'Missing main',suggestedFix:'Add main'},
      {code:'BROKEN_IMAGE',severity:'high',viewport:'mobile',message:'Broken',suggestedFix:'Fix asset'},
    ],
    comparisons:[{viewport:'mobile',reference:'frame.png',passed:false,changedPercent:25,
      regions:[{x:0,y:0,width:24,height:24,changedPixels:20,shareOfChanges:80}]}],
    blockedRequests:1,viewports:2,
  });
  assert.equal(reviewSummary.issues.high,1);
  assert.equal(reviewSummary.failedComparisons,1);
  assert.equal(reviewSummary.visualStatus,'mismatches-or-errors');
  assert.equal(summarizeReview({issues:[],comparisons:[],blockedRequests:0,viewports:1}).visualStatus,'not-compared');
  assert.equal(reviewSummary.priorityFindings[0].code,'BROKEN_IMAGE');
  assert.equal(reviewSummary.priorityVisualRegions[0].changedPixels,20);
  assert.equal(reviewSummary.passed,false);
  const reviewInvalid=await client.callTool({name:'review_ui',arguments:{url:'https://example.com'}});
  assert.equal(reviewInvalid.isError,true);
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
// Installed SolidCraft is discoverable without a user-authored bridges.json,
// but must remain disconnected until explicitly requested.
if (process.platform !== 'win32') {
  const autoCwd = mkdtempSync(path.join(tmpdir(),'awsm-solidcraft-discovery-'));
  const autoBin = path.join(autoCwd,'bin');
  fsSync.mkdirSync(autoBin);
  const shim=path.join(autoBin,'solidcraft-cli');
  writeFileSync(shim,'#!/bin/sh\nexec '+JSON.stringify(process.execPath)+' '+JSON.stringify(path.join(root,'test/bridge-child.mjs'))+' "$@"\n');
  fsSync.chmodSync(shim,0o755);
  // A second installed CLI should be discovered without starting its process.
  const cadShim=path.join(autoBin,'cadcraft-cli');
  writeFileSync(cadShim,'#!/bin/sh\nexec '+JSON.stringify(process.execPath)+' '+JSON.stringify(path.join(root,'test/bridge-child.mjs'))+' "$@"\n');
  fsSync.chmodSync(cadShim,0o755);
  const autoTransport=new StdioClientTransport({
    command:process.execPath,
    args:[path.join(root,'build/index.js')],
    cwd:autoCwd,
    env:{...process.env,PATH:autoBin+path.delimiter+(process.env.PATH??''),
      AWSM_AUTO_SOLIDCRAFT:'1',AWSM_AUTO_CADCRAFT:'1',AWSM_BRIDGE_CONFIG:path.join(autoCwd,'not-created.json')},
  });
  const autoClient=new Client({name:'awsm-solidcraft-auto',version:'1.0.0'});
  try {
    await autoClient.connect(autoTransport);
    const cadListed=await autoClient.callTool({name:'bridge_list',arguments:{server:'cadcraft'}});
    assert.equal(cadListed.isError,undefined,cadListed.content[0].text);
    const cadStatus=JSON.parse(cadListed.content[0].text).servers[0];
    assert.equal(cadStatus.status,'configured');
    assert(cadStatus.allowedTools.includes('inspect_drawing'));
    assert(!cadStatus.allowedTools.includes('new_drawing'));
    const cadContents=await autoClient.callTool({name:'bridge_call',arguments:{
      server:'cadcraft',tool:'inspect_drawing',arguments:{}
    }});
    assert.equal(cadContents.isError,undefined,cadContents.content[0].text);
    assert.deepEqual(JSON.parse(cadContents.content[0].text).layers,['A-WALL','A-DOOR','A-ANNO']);
    const walls=await autoClient.callTool({name:'bridge_call',arguments:{
      server:'cadcraft',tool:'query_entities',arguments:{layer:'A-WALL'}
    }});
    assert.equal(JSON.parse(walls.content[0].text).entities[0].closed,true);
    const closed=await autoClient.callTool({name:'bridge_call',arguments:{
      server:'cadcraft',tool:'execute',arguments:{command:'loops',params:{}}
    }});
    assert.equal(JSON.parse(closed.content[0].text).closedLoops,1);
    const routeStatuses=await autoClient.callTool({name:'bridge_list',arguments:{connect:false}});
    const discoveredStatuses=JSON.parse(routeStatuses.content[0].text).servers;
    assert.equal(discoveredStatuses.find(x=>x.name==='cadcraft').status,'connected');
    assert.equal(discoveredStatuses.find(x=>x.name==='solidcraft').status,'configured',
      'CADCraft-only tasks must not start SolidCraft');
    const cadDenied=await autoClient.callTool({name:'bridge_call',
      arguments:{server:'cadcraft',tool:'new_drawing',arguments:{}}});
    assert.equal(cadDenied.isError,true);
    const discovered=await autoClient.callTool({name:'bridge_list',arguments:{server:'solidcraft'}});
    assert.equal(discovered.isError,undefined,discovered.content[0].text);
    const listing=JSON.parse(discovered.content[0].text);
    assert.equal(listing.servers[0].status,'configured');
    assert(listing.servers[0].allowedTools.includes('batch'));
    assert(!listing.servers[0].allowedTools.includes('new_design'));
    const started=await autoClient.callTool({name:'bridge_list',arguments:{server:'solidcraft',connect:true}});
    assert.equal(started.isError,undefined,started.content[0].text);
    assert.equal(JSON.parse(started.content[0].text).servers[0].status,'connected');
    const catalog=await autoClient.callTool({name:'bridge_call',
      arguments:{server:'solidcraft',tool:'list_commands',arguments:{filter:'solid'}}});
    assert.equal(catalog.isError,undefined,catalog.content[0].text);
    assert.deepEqual(JSON.parse(catalog.content[0].text).commands,['solid.box']);
    const forbidden=await autoClient.callTool({name:'bridge_call',
      arguments:{server:'solidcraft',tool:'new_design',arguments:{}}});
    assert.equal(forbidden.isError,true);
  } finally { await autoClient.close(); }

  // Regression: SolidCraft-only requests must not start CADCraft or any
  // publishing integration, even when both Craft CLIs are installed.
  const solidOnlyTransport=new StdioClientTransport({
    command:process.execPath,args:[path.join(root,'build/index.js')],cwd:autoCwd,
    env:{...process.env,PATH:autoBin+path.delimiter+(process.env.PATH??''),
      AWSM_AUTO_SOLIDCRAFT:'1',AWSM_AUTO_CADCRAFT:'1',
      AWSM_BRIDGE_CONFIG:path.join(autoCwd,'not-created.json')},
  });
  const solidOnlyClient=new Client({name:'awsm-solidcraft-only',version:'1.0.0'});
  try {
    await solidOnlyClient.connect(solidOnlyTransport);
    const before=JSON.parse((await solidOnlyClient.callTool({
      name:'bridge_list',arguments:{connect:false},
    })).content[0].text);
    assert.equal(before.servers.find(x=>x.name==='solidcraft').status,'configured');
    assert.equal(before.servers.find(x=>x.name==='cadcraft').status,'configured');
    const modeled=await solidOnlyClient.callTool({name:'bridge_call',arguments:{
      server:'solidcraft',tool:'list_commands',arguments:{filter:'solid'},
    }});
    assert.equal(modeled.isError,undefined,modeled.content[0].text);
    assert.deepEqual(JSON.parse(modeled.content[0].text).commands,['solid.box']);
    const after=JSON.parse((await solidOnlyClient.callTool({
      name:'bridge_list',arguments:{connect:false},
    })).content[0].text);
    assert.equal(after.servers.find(x=>x.name==='solidcraft').status,'connected');
    assert.equal(after.servers.find(x=>x.name==='cadcraft').status,'configured',
      'SolidCraft-only 3D must not connect CADCraft');
  } finally { await solidOnlyClient.close(); }

  // Users can disable CADCraft auto-discovery without disabling 3D modeling.
  const optOutTransport=new StdioClientTransport({
    command:process.execPath,args:[path.join(root,'build/index.js')],cwd:autoCwd,
    env:{...process.env,PATH:autoBin+path.delimiter+(process.env.PATH??''),
      AWSM_AUTO_SOLIDCRAFT:'1',AWSM_AUTO_CADCRAFT:'0',
      AWSM_BRIDGE_CONFIG:path.join(autoCwd,'not-created.json')},
  });
  const optOutClient=new Client({name:'awsm-cadcraft-optout',version:'1.0.0'});
  try {
    await optOutClient.connect(optOutTransport);
    const integrations=JSON.parse((await optOutClient.callTool({
      name:'bridge_list',arguments:{connect:false},
    })).content[0].text);
    assert.equal(integrations.configuredServers,1);
    assert.equal(integrations.servers[0].name,'solidcraft');
    assert.equal(integrations.servers[0].status,'configured');
  } finally { await optOutClient.close(); }
}
const skillTarget = mkdtempSync(path.join(tmpdir(),'awsm-runtime-skills-'));
const secondTransport = new StdioClientTransport({command:process.execPath,args:[path.join(root,'build/index.js'),'--managed-skills',skillTarget],cwd});
const secondClient = new Client({name:'runtime-sync-check',version:'1.0.0'});
try { await secondClient.connect(secondTransport); assert.equal((await secondClient.listTools()).tools.length,24); }
finally { await secondClient.close(); }
assert(existsSync(path.join(skillTarget,'awsm-design','SKILL.md')));
assert(!existsSync(path.join(skillTarget,'awsm-admin-dashboard','SKILL.md')));
console.log('Smoke tests passed');
