// Opt-in real-app check. Only --auto-start may launch a closed selected app.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {McpGateway} from '../build/tools/mcp-gateway.js';
import {designBrief} from '../build/tools/design-brief.js';
const edit=process.argv.includes('--edit');
const geometry=process.argv.includes('--geometry');
if(geometry&&!edit)throw new Error('--geometry requires --edit in an empty SolidCraft QA session.');
process.env.AWSM_NATIVE_SETUP=process.argv.includes('--auto-start')?'1':'0';
const selected=process.argv.find(a=>a.startsWith('--craft='))?.slice(8).split(',');
const cases=[
 {craft:'figcraft',outcome:'figcraft',inspect:'inspect_document',extra:{category:'web-app',threeD:'none',motion:'none'},
  mutation:['create_node',{type:'rectangle',name:'AWSM temporary connection test',x:100,y:100,width:360,height:220,props:{fill:'#0CBFA0',cornerRadius:24}}],
  undo:['run_command',{command:'edit.undo',params:{}}],shot:['screenshot',{window:true}],
  empty:d=>!d.path&&d.pages.every(p=>!p.children?.length),signature:d=>d.pages},
 {craft:'solidcraft',outcome:'model-3d',inspect:'inspect_design',extra:{source:'direct'},
  mutation:geometry?['execute',{command:'solid.box',params:{length:10,width:10,height:10,name:'AWSM temporary geometry test'}}]:['set_parameter',{name:'awsm_connection_test',value:40}],undo:['undo',{}],shot:['screenshot',{source:'window'}],
  empty:d=>!d.path&&!d.bodies.length&&!d.params.length&&!d.sketches.length&&!d.timeline.length,
  signature:d=>({bodies:d.bodies,params:d.params,sketches:d.sketches,timeline:d.timeline})},
 {craft:'materialcraft',outcome:'material',inspect:'session_inspect',extra:{},
  mutation:['node_add',{def:'uniform',at:[80,80],params:{color:'#0CBFA0'}}],undo:['command_run',{id:'edit.undo',params:{}}],shot:['ui_screenshot',{}],
  empty:d=>!d.package.path&&!d.graph.nodes.length&&!d.graph.connections.length,
  signature:d=>({nodes:d.graph.nodes,connections:d.graph.connections})},
 {craft:'texturecraft',outcome:'texture',inspect:'session_inspect',extra:{},
  mutation:['command_run',{id:'layer.add.fill',params:{name:'AWSM temporary connection test',color:'#0CBFA0',roughness:0.45,metallic:0.2}}],
  undo:['command_run',{id:'edit.undo',params:{}}],shot:['ui_screenshot',{}],
  empty:d=>!d.path&&d.mesh?.source==='builtin:material_ball',signature:d=>d.layers},
];
if(selected?.some(name=>!cases.some(c=>c.craft===name)))throw new Error('Supported native tests: '+cases.map(c=>c.craft).join(', '));
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'awsm-native-'));
const report=[];
const parse=r=>JSON.parse(r.content.find(c=>c.type==='text').text);
async function call(g,craft,tool,args={},briefId){
 const r=await g.call({server:craft,tool,arguments:args,briefId});
 if(r.isError)throw new Error(JSON.stringify(r.content));
 return r;
}
for(const c of cases.filter(c=>!selected||selected.includes(c.craft))){
 const g=new McpGateway();const entry={craft:c.craft};let changed=false;let uncertain=false;let briefId;
 const stage=name=>console.log(JSON.stringify({craft:c.craft,stage:name}));
 try{
  stage('inspect-attached-session');
  const ready=await g.prepare({craft:c.craft,task:'inspect'});
  assert.equal(ready.session.mode,'attached');entry.session=ready.session;entry.versions=ready.versions;
  const before=parse(await call(g,c.craft,c.inspect));entry.before=before;
  if(edit){
   assert(c.empty(before),'Edits require an empty unsaved QA session (TextureCraft: unsaved built-in material ball).');
   const brief=designBrief({answers:{outcome:c.outcome,projectMode:'existing',target:'Inspected visible QA session',scope:'One temporary test edit followed by undo',style:'Existing',session:'visible',...c.extra}});
   assert.equal(brief.status,'ready');briefId=brief.briefId;
   const prepared=await g.prepare({craft:c.craft,task:'edit',briefId});
   assert(prepared.executionGuide.guides.length>0,'Native edits must receive automatic guidance');
   stage('temporary-edit');
   uncertain=true;
   const start=performance.now();await call(g,c.craft,...c.mutation,briefId);
   uncertain=false;changed=true;entry.mutationMs=Math.round(performance.now()-start);
   const after=parse(await call(g,c.craft,c.inspect));entry.after=after;
   assert.notDeepEqual(c.signature(after),c.signature(before),'Native content must change');
   if(c.craft==='solidcraft'&&geometry){
    assert.equal(after.bodies.length,1);assert.equal(after.bodies[0].closed,true);
    assert(Math.abs(after.bodies[0].volume_mm3-1000)<1e-6,'10 mm cube must measure 1000 mm³');
   }
   stage('native-window-screenshot');
   const image=(await call(g,c.craft,...c.shot)).content.find(c=>c.type==='image');
   assert(image,'Native screenshot missing');
   entry.screenshot=path.join(dir,c.craft+'.png');fs.writeFileSync(entry.screenshot,Buffer.from(image.data,'base64'));
   // Never replay an uncertain mutation/undo: inspect and resolve it manually instead.
   stage('undo-and-verify');
   changed=false;uncertain=true;await call(g,c.craft,...c.undo,briefId);uncertain=false;
   const restored=parse(await call(g,c.craft,c.inspect));entry.restored=restored;
   assert.deepEqual(c.signature(restored),c.signature(before),'Native content must return to baseline');
  }
  entry.status=edit?'mutation-screenshot-undo-verified':'inspection-verified';
 }catch(e){
  entry.status='failed';entry.error=e.message;
  if(uncertain)entry.cleanup='Operation status uncertain. No retry/undo sent; inspect this app before further edits.';
  else if(changed){try{
   await call(g,c.craft,...c.undo,briefId);
   entry.restored=parse(await call(g,c.craft,c.inspect));
   assert.deepEqual(c.signature(entry.restored),c.signature(entry.before));
   entry.cleanup='Undo verified after test failure; document content restored.';
  }catch(e){entry.cleanup='Cleanup requires inspection: '+e.message;}}
 }finally{
  await g.close();report.push(entry);fs.writeFileSync(path.join(dir,'report.json'),JSON.stringify(report,null,2));
 }
 console.log(JSON.stringify({craft:c.craft,status:entry.status,error:entry.error,mutationMs:entry.mutationMs}));
}
console.log('Native report and screenshots: '+dir);
console.log(geometry?'SolidCraft geometry check covers one measured 10 mm cube; complex modeling/exports require separate acceptance.':'SolidCraft edit check covers parameters only; add --geometry for a measured 10 mm cube test.');
if(report.some(r=>r.status==='failed'))process.exitCode=1;
