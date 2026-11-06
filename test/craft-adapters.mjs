import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {McpGateway} from '../build/tools/mcp-gateway.js';
import {craftNames,adapters} from '../build/tools/craft-adapters.js';
import {attachedArgs,processEndpoints} from '../build/tools/craft-session.js';
import {designBrief} from '../build/tools/design-brief.js';
process.env.AWSM_NATIVE_SETUP='0';
const root=fileURLToPath(new URL('..',import.meta.url));
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'awsm-adapters-'));
const config=path.join(dir,'bridges.json');
process.env.AWSM_BRIDGE_CONFIG=config;
for(const name of craftNames)process.env['AWSM_AUTO_'+name.toUpperCase()]='0';
const fixture=path.join(root,'test/bridge-child.mjs');
function setup(name,args,extra={}){fs.writeFileSync(config,JSON.stringify({version:1,servers:{[name]:{command:process.execPath,args:[fixture,...args],allowedTools:['session_inspect','command_run','viewport_screenshot','inspect_document'],...extra}}}));}
for(const name of craftNames){
 const args=attachedArgs(name,'7878');
 assert.equal(args[1],adapters[name].flag);
 if(['materialcraft','texturecraft'].includes(name))assert.equal(args[2],'7878');
 assert.deepEqual(processEndpoints(name,`/Applications/${name}.app/Contents/MacOS/${name} --control=7878`),['127.0.0.1:7878']);
}
// Every entry point refuses an unverified active target rather than starting headless.
for(const entry of ['list','call','prepare']){
 setup('figcraft',[]);process.env.AWSM_FIGCRAFT_ENDPOINT='bad';
 const g=new McpGateway();
 try {
  if(entry==='list')assert.equal((await g.list({connect:true})).servers[0].status,'error');
  else await assert.rejects(entry==='call'?g.call({server:'figcraft',tool:'inspect_document'}):g.prepare({craft:'figcraft',task:'inspect'}),/control port/);
 }finally{await g.close();}
}
delete process.env.AWSM_FIGCRAFT_ENDPOINT;
for(const craft of ['materialcraft','texturecraft']){
 setup(craft,['--bridge','7878']);
 const brief=designBrief({answers:{outcome:craft==='materialcraft'?'material':'texture',projectMode:'existing',target:'Surface fixture',style:'Painted metal',scope:'Edit finish',session:'visible'}});
 assert.equal(brief.status,'ready');
 const g=new McpGateway();
 try {
  const prepared=await g.prepare({craft,task:'edit',briefId:brief.briefId});
  assert.equal(prepared.mode,'attached');
  assert.equal(prepared.session.verifiedBy,'session_inspect');
  assert(prepared.executionGuide.guides.some(x=>x.file.includes(craft==='materialcraft'?'awsm-materials':'awsm-texturing')));
  assert(!prepared.executionGuide.guides.some(x=>x.file.includes('auto-prototype')));
  const first=await g.call({server:craft,tool:'command_run',arguments:{id:'change'},briefId:brief.briefId});
  assert.equal(first.content[0].text,'native:change');assert.equal(first.content.length,2);
  const again=await g.call({server:craft,tool:'command_run',arguments:{id:'change'},briefId:brief.briefId});
  assert.equal(again.content.length,1);
  const failed=await g.call({server:craft,tool:'command_run',arguments:{id:'fail'},briefId:brief.briefId});
  assert.equal(failed.isError,true);assert.equal(failed.content.length,1);
  const image=await g.call({server:craft,tool:'viewport_screenshot'});
  assert.equal(image.content[0].type,'image');
  await assert.rejects(g.call({server:craft,tool:'command_run',arguments:{id:'change'}}),/Brief missing/);
  await assert.rejects(g.prepare({craft,task:'inspect',headless:true}),/refusing/);
 }finally{await g.close();}
 // Explicit headless is available, but cannot change modes on a cached connection.
 setup(craft,[],{sessionMode:'headless'});
 const h=new McpGateway();
 try {
  const r=await h.call({server:craft,tool:'session_inspect'});
  assert(!JSON.parse(r.content[0].text).argv.includes('--bridge'));
  process.env['AWSM_'+craft.toUpperCase()+'_ENDPOINT']='7878';
  await assert.rejects(h.prepare({craft,task:'inspect'}),/custom bridge|another mode/);
 }finally{await h.close();delete process.env['AWSM_'+craft.toUpperCase()+'_ENDPOINT'];}
}
// Direct mutations cannot bypass the selected visible/separate session.
setup('materialcraft',[],{sessionMode:'headless'});
const visible=designBrief({answers:{outcome:'material',projectMode:'existing',target:'Surface fixture',style:'Metal',scope:'Change roughness'}});
assert.equal(visible.status,'ready');assert.equal(visible.summary.session,'visible');
const mismatch=new McpGateway();
try{await assert.rejects(mismatch.call({server:'materialcraft',tool:'command_run',arguments:{id:'change'},briefId:visible.briefId}),/Session mode/);}finally{await mismatch.close();}
// Installed CLI discovery and direct calls use each provider's native launch contract.
if(process.platform!=='win32'){
 const bin=path.join(dir,'bin');fs.mkdirSync(bin);
 const originalPath=process.env.PATH;
 for(const craft of craftNames){
  const script=path.join(bin,craft+'-cli');
  const q=v=>"'"+v.replaceAll("'","'\\''")+"'";
  fs.writeFileSync(script,'#!/bin/sh\nexec '+q(process.execPath)+' '+q(fixture)+' "$@"\n',{mode:0o755});
  process.env['AWSM_AUTO_'+craft.toUpperCase()]='1';
  process.env['AWSM_'+craft.toUpperCase()+'_ENDPOINT']='7878';
 }
 process.env.PATH=bin+path.delimiter+originalPath;
 fs.writeFileSync(config,JSON.stringify({version:1,servers:{}}));
 const g=new McpGateway();
 try {
  const found=await g.list({connect:false});assert.equal(found.configuredServers,5);
  assert(found.servers.every(x=>x.status==='configured'));
  for(const craft of ['materialcraft','texturecraft']){
   const r=await g.call({server:craft,tool:'session_inspect'});
   assert.deepEqual(JSON.parse(r.content[0].text).argv,['mcp','--bridge','7878']);
  }
 }finally{await g.close();process.env.PATH=originalPath;}
}
console.log('Five-Craft adapter, visible routing, headless opt-in and automatic guidance tests passed');
