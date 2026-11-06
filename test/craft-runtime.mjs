import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolveVisible,selectCliAsset,cliArchiveEntry,nativeLock,managedCli,installedCli,installCli} from '../build/tools/craft-runtime.js';
import {McpGateway} from '../build/tools/mcp-gateway.js';
import {designBrief} from '../build/tools/design-brief.js';

const root=fileURLToPath(new URL('..',import.meta.url));
process.env.AWSM_NATIVE_DIR=await fs.mkdtemp(path.join(os.tmpdir(),'awsm-runtime-test-'));
for(const craft of ['figcraft','solidcraft','cadcraft','materialcraft','texturecraft']){
 let launches=0;
 const deps={active:async()=>'127.0.0.1:45678',alive:async()=>true,running:async()=>true,launch:async()=>{launches++;return '127.0.0.1:45679';}};
 assert.equal(await resolveVisible(craft,deps),'127.0.0.1:45678');assert.equal(launches,0,'Open document must be reused');
 await assert.rejects(resolveVisible(craft,{...deps,alive:async()=>false}),/Keep the current document safe/);
 assert.equal(launches,0,'An app with unsaved work cannot be replaced by a new instance');
 assert.equal(await resolveVisible(craft,{...deps,alive:async()=>false,running:async()=>false}),'127.0.0.1:45679');
 assert.equal(launches,1,'A closed selected app starts automatically');
 assert.equal(await resolveVisible(craft,{...deps,active:async()=>undefined,running:async()=>false}),'127.0.0.1:45679');
 assert.equal(launches,2);
 await assert.rejects(resolveVisible(craft,{...deps,active:async()=>{throw new Error('Multiple native sessions');}}),/Multiple/);
 assert.equal(launches,2,'Ambiguous targets cannot launch another instance');
 const assets=['macos-universal.zip','windows-x64-portable.zip','linux-x86_64.tar.gz'].map(s=>({name:craft+'-0.1.0-'+s}));
 assets.push({name:craft+'-cli-0.1.0-macos-universal.zip'});
 assert.equal(selectCliAsset(craft,assets,'darwin','arm64').name,assets[3].name);
 assert.equal(selectCliAsset(craft,assets,'win32','x64').name,assets[1].name);
 assert.equal(selectCliAsset(craft,assets,'linux','x64').name,assets[2].name);
 assert.equal(selectCliAsset(craft,assets,'linux','arm64'),undefined,'Never run the wrong architecture');
 assert.equal(cliArchiveEntry(craft,['README.md','bin/'+craft+'-cli']),'bin/'+craft+'-cli');
 assert.equal(cliArchiveEntry(craft,['bin/'+craft+'-cli.exe'],true),'bin/'+craft+'-cli.exe');
 for(const prefix of ['../','/','-bad/','C:/'])assert.throws(()=>cliArchiveEntry(craft,[prefix+craft+'-cli']),/Unsafe/);
 assert.throws(()=>cliArchiveEntry(craft,[craft+'-cli','bin/'+craft+'-cli']),/exactly one/);
 // A GUI harness may have a minimal PATH: managed connectors remain discoverable.
 const cli=managedCli(craft);await fs.mkdir(path.dirname(cli),{recursive:true});await fs.writeFile(cli,'fixture');
 const old=process.env.PATH;process.env.PATH='';assert.equal(await installedCli(craft),cli);process.env.PATH=old;
}

// Independent MCP processes must not launch/download for the same Craft concurrently.
const log=path.join(process.env.AWSM_NATIVE_DIR,'lock-order');
const script=`import fs from 'node:fs/promises'; import {nativeLock} from ${JSON.stringify(path.join(root,'build/tools/craft-runtime.js'))}; await nativeLock('figcraft',async()=>{await fs.appendFile(${JSON.stringify(log)},'start '+process.pid+'\\n');await new Promise(r=>setTimeout(r,80));await fs.appendFile(${JSON.stringify(log)},'end '+process.pid+'\\n');});`;
const run=()=>new Promise((resolve,reject)=>{const child=spawn(process.execPath,['--input-type=module','-e',script],{env:process.env,stdio:'pipe'});let error='';child.stderr.on('data',d=>error+=d);child.once('error',reject);child.once('exit',code=>code===0?resolve():reject(new Error(error)));});
await Promise.all([run(),run()]);
const order=(await fs.readFile(log,'utf8')).trim().split('\n');
assert.equal(order.length,4);assert.match(order[0],/^start /);assert.equal(order[1],order[0].replace('start','end'));assert.equal(order[3],order[2].replace('start','end'));
// An exception releases the lock rather than blocking later harnesses.
await assert.rejects(nativeLock('figcraft',async()=>{throw new Error('test failure');}),/test failure/);
assert.equal(await nativeLock('figcraft',async()=>42),42);

// Download failures must preserve the last installed connector.
const oldFetch=globalThis.fetch;
const archiveName='texturecraft-cli-0.0.1-'+(process.platform==='darwin'?'macos-universal.zip':process.platform==='win32'?'windows-'+process.arch+'-portable.zip':'linux-'+(process.arch==='x64'?'x86_64':'aarch64')+'.tar.gz');
const asset={name:archiveName,size:4,browser_download_url:'https://github.com/storytold/texturecraft/releases/download/v0.0.1/'+archiveName,digest:'invalid'};
let downloads=0;
globalThis.fetch=async url=>{
 if(String(url).startsWith('https://api.github.com/'))return new Response(JSON.stringify({tag_name:'v0.0.1',assets:[asset]}));
 downloads++;return new Response('bad!');
};
try{
 await assert.rejects(installCli('texturecraft',{executable:'/test',version:'0.0.1'}),/integrity digest/);
 assert.equal(downloads,0);
 asset.digest='sha256:'+'0'.repeat(64);
 await assert.rejects(installCli('texturecraft',{executable:'/test',version:'0.0.1'}),/checksum mismatch/);
 assert.equal(downloads,1);
 assert.equal(await fs.readFile(managedCli('texturecraft'),'utf8'),'fixture');
 asset.browser_download_url='https://example.com/not-official.zip';
 await assert.rejects(installCli('texturecraft',{executable:'/test',version:'0.0.1'}),/Unexpected official release/);
 assert.equal(downloads,1);
}finally{globalThis.fetch=oldFetch;}

if(process.platform!=='win32'){
 const bin=path.join(process.env.AWSM_NATIVE_DIR,'shim');await fs.mkdir(bin);
 const quote=s=>"'"+s.replaceAll("'","'\\''")+"'";
 const shim=path.join(bin,'materialcraft-cli');
 await fs.writeFile(shim,'#!/bin/sh\nexec '+quote(process.execPath)+' '+quote(path.join(root,'test/bridge-child.mjs'))+' "$@"\n',{mode:0o755});
 process.env.PATH=bin+path.delimiter+process.env.PATH;
 process.env.AWSM_NATIVE_SETUP='0';
 for(const name of ['figcraft','solidcraft','cadcraft','texturecraft'])process.env['AWSM_AUTO_'+name.toUpperCase()]='0';
 process.env.AWSM_AUTO_MATERIALCRAFT='1';process.env.AWSM_MATERIALCRAFT_ENDPOINT='7878';
 process.env.AWSM_BRIDGE_CONFIG=path.join(process.env.AWSM_NATIVE_DIR,'empty.json');
 const gateway=new McpGateway();
 const brief=designBrief({answers:{outcome:'material',projectMode:'existing',target:'Current fixture',scope:'Edit material',style:'Existing'}});
 try{
  await gateway.prepare({craft:'materialcraft',task:'inspect'});
  process.env.AWSM_MATERIALCRAFT_ENDPOINT='8787';
  await assert.rejects(gateway.call({server:'materialcraft',tool:'command_run',arguments:{id:'change'},briefId:brief.briefId}),/reconnected automatically/);
  const current=await gateway.prepare({craft:'materialcraft',task:'inspect'});
  assert.equal(current.session.endpoint,'8787','Reopening the app does not require an MCP restart');
  const edited=await gateway.call({server:'materialcraft',tool:'command_run',arguments:{id:'change'},briefId:brief.briefId});
  assert.equal(edited.content[0].text,'native:change');
  const uncertain=await gateway.call({server:'materialcraft',tool:'command_run',arguments:{id:'uncertain'},briefId:brief.briefId});
  assert.equal(uncertain.isError,true);assert.equal(uncertain.content[0].text,'native operation timed out; still running');
  await assert.rejects(gateway.call({server:'materialcraft',tool:'command_run',arguments:{id:'change'},briefId:brief.briefId}),/uncertain status/);
  await gateway.prepare({craft:'materialcraft',task:'inspect'});
  assert.equal((await gateway.call({server:'materialcraft',tool:'command_run',arguments:{id:'change'},briefId:brief.briefId})).content[0].text,'native:change');
 }finally{await gateway.close();}
}
console.log('Automatic native launch, active-document preservation, connector selection and cross-process locking tests passed');
