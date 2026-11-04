import assert from 'node:assert/strict';
import {designBrief} from '../build/tools/design-brief.js';
import {designGuidance} from '../build/tools/design-guidance.js';
const research=await designGuidance({phase:'research'});
assert(research.guides.every(g=>g.content.length>100));
assert(research.guides.some(g=>g.file.endsWith('research-direction.md')));
await assert.rejects(designGuidance({phase:'modeling'}),/Complete/);
const draft=designBrief({answers:{outcome:'website'}});
const draftGuide=await designGuidance({phase:'research',briefId:draft.briefId});
assert.equal(draftGuide.draft.outcome,'website');
const ui=designBrief({answers:{outcome:'website',category:'marketing',style:'Product-led',threeD:'none',scope:'Home',projectMode:'new',target:'/tmp/test',motion:'none'}});
assert.equal(ui.status,'ready');
await assert.rejects(designGuidance({phase:'modeling',briefId:ui.briefId}),/3D/);
await assert.rejects(designGuidance({phase:'motion',briefId:ui.briefId}),/excluded/);
const components=await designGuidance({phase:'components',briefId:ui.briefId});
assert.equal(components.guides.length,4);
const model=designBrief({answers:{outcome:'model-3d',source:'direct',projectMode:'new',target:'Model',style:'Machined metal',scope:'Speaker',session:'visible'}});
const modeling=await designGuidance({phase:'modeling',briefId:model.briefId});
assert(modeling.guides.some(g=>g.file.endsWith('modeling-direction.md')));
console.log('Design guidance routing tests passed');

// All specialists must remain retrievable through the MCP path, including core-only installs.
const loaded=new Set();
async function collect(options){
 const result=await designGuidance(options);
 for(const guide of result.guides) {
  assert(guide.content.trim().length>0);
  if(guide.file.endsWith('/SKILL.md'))loaded.add(guide.file.split('/')[0]);
 }
 return result;
}
const site=designBrief({answers:{outcome:'website',category:'admin',style:'Operational',threeD:'none',scope:'Queue detail edit',projectMode:'new',target:'/tmp/guide-site',motion:'feedback'}});
const fig=designBrief({answers:{outcome:'figcraft',category:'admin',style:'Operational',threeD:'none',scope:'Queue',projectMode:'new',target:'New frame',session:'visible',motion:'none'}});
const app=designBrief({answers:{outcome:'app',platform:'flutter',style:'Native',scope:'Booking',projectMode:'new',target:'/tmp/native-app',motion:'feedback'}});
assert.equal(app.status,'ready');
assert.deepEqual(app.route.crafts,[]);
for(const options of [
 {phase:'routing',briefId:site.briefId},
 {phase:'research',briefId:site.briefId,intent:'audit'},
 {phase:'research',briefId:site.briefId,intent:'adapt-template'},
 {phase:'screens',briefId:site.briefId},
 {phase:'screens',briefId:ui.briefId},
 {phase:'screens',briefId:app.briefId},
 {phase:'screens'},
 {phase:'components',briefId:site.briefId},
 {phase:'assets',briefId:site.briefId,assetKind:'svg'},
 {phase:'implementation',briefId:site.briefId,speed:'fast'},
 {phase:'implementation',briefId:site.briefId},
 {phase:'handoff',briefId:site.briefId,intent:'from-figcraft'},
 {phase:'handoff',briefId:fig.briefId,intent:'to-figcraft'},
 {phase:'motion',briefId:site.briefId},
 {phase:'validation',briefId:site.briefId},
])await collect(options);
const fs=await import('node:fs/promises');
const dirs=await fs.readdir(new URL('../skills/',import.meta.url));
assert.deepEqual([...loaded].sort(),dirs.sort());

const {designQuickstart}=await import('../build/tools/design-quickstart.js');
const nativePlan=await designQuickstart({briefId:app.briefId,brief:'Build the booking app'});
assert.equal(nativePlan.platform,'flutter');
assert.equal(nativePlan.kind,'mobile');
const nativeMotion=await collect({phase:'motion',briefId:app.briefId});
assert(!nativeMotion.guides.some(g=>g.file.includes('motion-storyboard')));
await assert.rejects(designGuidance({phase:'handoff',intent:'from-figcraft',briefId:fig.briefId}),/Code output/);
await assert.rejects(designGuidance({phase:'handoff',intent:'to-figcraft',briefId:site.briefId}),/FigCraft output/);
await assert.rejects(designQuickstart({briefId:fig.briefId,brief:'Edit the design only'}),/not selected/);
for(const phase of ['implementation','validation']) {
 const canvas=await collect({phase,briefId:fig.briefId});
 assert(canvas.guides.some(g=>g.file.includes('canvas-workflow')));
 assert(!canvas.guides.some(g=>g.file.includes('auto-prototype')||g.file.includes('visual-qa')));
 const geometry=await collect({phase,briefId:model.briefId});
 assert(!geometry.guides.some(g=>g.file.endsWith('/SKILL.md')));
 assert(geometry.guides.some(g=>g.file.includes('modeling-direction')));
}
const doc={pages:[{id:1,type:'PAGE',name:'Source',children:[{id:2,type:'FRAME',name:'Queue',width:1440,height:900,children:[]}]}]};
const webFromFig=await designQuickstart({briefId:site.briefId,brief:'Implement this FigCraft queue as a website',document:doc});
assert.equal(webFromFig.implementationIntent,'from-figcraft');
assert(webFromFig.implementationGuide.guides.some(g=>g.file.includes('awsm-figcraft-to-web')));
console.log('All 22 skills reachable; native/canvas/model/web handoff scope tests passed');
