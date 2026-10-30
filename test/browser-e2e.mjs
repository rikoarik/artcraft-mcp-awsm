import assert from "node:assert/strict";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { auditUiPage } from "../build/tools/browser-audit.js";
import { captureUiScreenshots } from "../build/tools/browser-capture.js";
import { compareUiScreenshots } from "../build/tools/visual-png.js";
import { reviewUi } from "../build/tools/review-ui.js";

const root=fileURLToPath(new URL("..",import.meta.url));
const outDir=mkdtempSync(path.join(tmpdir(),"awsm-browser-e2e-"));
const html=[
'<!DOCTYPE html><html lang="en"><head><title>AWSM Browser Fixture</title>',
'<style>body{margin:0;font:16px sans-serif}main{max-width:100%}',
'.wide{width:620px;background:#f1f1f1;padding:8px}',
'button{width:18px;height:18px;padding:0;border:0}</style></head><body>',
'<main><h1>Real Browser Fixture</h1>',
'<div class="wide" id="wide">Overflow fixture</div>',
'<img src="/missing-image.png" id="broken" width="80" height="60" alt="An intentionally missing photo">',
'<button id="unnamed"></button><input id="unlabeled" type="text" value="fixture">',
'<a href="#">Placeholder link</a></main></body></html>'
].join("");
const server=http.createServer((req,res)=>{
  if(req.url==="/missing-image.png"){res.writeHead(404,{"Content-Type":"text/plain"});res.end("Missing");return;}
  res.writeHead(200,{"Content-Type":"text/html; charset=utf-8"});res.end(html);
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
try {
  const address=server.address();
  if(!address || typeof address==="string")throw new Error("No HTTP test port");
  const url="http://127.0.0.1:"+address.port+"/";
  const audited=await auditUiPage({url,projectRoot:root,viewports:[{name:"mobile",width:375,height:812}],
    reportPath:path.join(outDir,"audit.json")});
  const codes=new Set(audited.views[0].findings.map(f=>f.code));
  for(const code of ["HORIZONTAL_PAGE_OVERFLOW","BROKEN_IMAGE","UNNAMED_CONTROL","UNLABELED_INPUT","PLACEHOLDER_LINK"])
    assert(codes.has(code),code+" was not detected in Chromium");
  assert.equal(audited.passed,false);
  assert(existsSync(path.join(outDir,"audit.json")));

  const captured=await captureUiScreenshots({url,projectRoot:root,outDir,
    viewports:[{name:"mobile",width:375,height:812}]});
  const png=captured.captures[0].file;
  assert(existsSync(png));
  assert.equal(captured.captures[0].dimensions.width,375);
  const comparison=await compareUiScreenshots({reference:png,actual:png});
  assert.equal(comparison.passed,true);
  assert.equal(comparison.regions.length,0);
  const review=await reviewUi({url,projectRoot:root,outputDir:path.join(outDir,"review"),
    referenceImages:[{viewport:"mobile",file:png}],
    viewports:[{name:"mobile",width:375,height:812}],
    reportPath:path.join(outDir,"review-summary.json")});
  assert.equal(review.comparisons[0].passed,true);
  assert.equal(review.summary.issues.high>0,true);
  assert.equal(review.summary.passed,false);
  assert(existsSync(path.join(outDir,"review-summary.json")));
  console.log("Real-browser UI audit and screenshot e2e passed.");
}finally {
  await new Promise(resolve=>server.close(resolve));
}
