import {designBrief} from '../build/tools/design-brief.js';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {endpoint,processEndpoints,attachedArgs} from '../build/tools/craft-session.js';
import {McpGateway} from '../build/tools/mcp-gateway.js';
assert.equal(endpoint('7979'),'127.0.0.1:7979');
for(const port of ['0','65536','evil:7979','7979oops'])assert.throws(()=>endpoint(port));
assert.deepEqual(processEndpoints('figcraft','/Applications/FigCraft.app/Contents/MacOS/FigCraft --control 7979'),['127.0.0.1:7979']);
assert.deepEqual(processEndpoints('figcraft','node script.js --control 7979'),[]);
assert.deepEqual(attachedArgs('figcraft','7979'),['mcp','--attach','127.0.0.1:7979']);
const root=fileURLToPath(new URL('..',import.meta.url));
const dir=mkdtempSync(path.join(tmpdir(),'awsm-session-'));
const config=path.join(dir,'bridges.json');
process.env.AWSM_BRIDGE_CONFIG=config;
process.env.AWSM_AUTO_FIGCRAFT='0';process.env.AWSM_AUTO_SOLIDCRAFT='0';process.env.AWSM_AUTO_CADCRAFT='0';
writeFileSync(config,JSON.stringify({version:1,servers:{figcraft:{command:process.execPath,args:[path.join(root,'test/bridge-child.mjs'),'--attach','7979'],allowedTools:['inspect_document','run_command','screenshot']}}}));
function approved(category='web-app',session='visible') {
 const draft=designBrief({mode:"guided",answers:{outcome:'figcraft',category,projectMode:'existing',target:'Active fixture',style:'Keep existing',threeD:'none',scope:'Requested screen',session}});
 return designBrief({briefId:draft.briefId,confirm:true}).briefId;
}
const briefId=approved();
const gateway=new McpGateway();
try {
 const first=await gateway.prepare({craft:'figcraft',task:'edit',briefId});
 assert.equal(first.mode,'attached');
 assert(first.executionGuide.guides.some(g=>g.file.endsWith('screen-blueprints.md')));
 assert.match(JSON.stringify(first.document),/Active fixture/);
 assert.equal(typeof first.skillGuidance,'string');
 assert.match(first.skillGuidance,/UI\/UX for real tasks/);
 const mobile=await gateway.prepare({craft:'figcraft',task:'create',briefId:approved('mobile')});
 assert.match(mobile.skillGuidance,/awsm-app-ui/);
 assert(first.tools.some(t=>t.name==='inspect_document'));
 assert(!first.tools.some(t=>t.name==='export'));
 const second=await gateway.prepare({craft:'figcraft',task:'edit',briefId});
 assert.deepEqual(first.document,second.document);
 await assert.rejects(gateway.prepare({craft:'figcraft',task:'edit',briefId:approved('web-app','separate'),headless:true}),/refusing/);
}finally{await gateway.close();}
writeFileSync(config,JSON.stringify({version:1,servers:{figcraft:{command:process.execPath,args:[path.join(root,'test/bridge-child.mjs')],allowedTools:['inspect_document']}}}));
process.env.AWSM_FIGCRAFT_ENDPOINT='not-a-local-port';
const invalid=new McpGateway();
try{await assert.rejects(invalid.prepare({craft:'figcraft',task:'edit',briefId}),/localhost control port/);}finally{await invalid.close();}
process.env.AWSM_FIGCRAFT_ENDPOINT='7979';
const custom=new McpGateway();
try{await assert.rejects(custom.prepare({craft:'figcraft',task:'edit',briefId}),/custom bridge/);}finally{await custom.close();}
console.log('Craft session tests passed');
