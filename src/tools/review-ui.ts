import fs from "node:fs/promises";
import path from "node:path";
import { auditUiPage } from "./browser-audit.js";
import { compareUiScreenshots } from "./visual-png.js";

type Reference = {viewport:string; file:string};
type Screen = {name:string;width:number;height:number};
type Comparison = {viewport:string; reference:string; actual?:string; passed?:boolean;
  changedPercent?:number; regions?:Array<{x:number;y:number;width:number;height:number;changedPixels:number;shareOfChanges:number}>;
  error?:string; diffPath?:string};
type Issue = {code:string;severity:"high"|"medium"|"info";viewport:string;selector?:string;message:string;suggestedFix:string};

export function summarizeReview(input:{
  issues:Issue[]; comparisons:Comparison[]; blockedRequests:number; viewports:number;
}) {
  const priority={high:0,medium:1,info:2};
  const issues=[...input.issues].sort((a,b)=>priority[a.severity]-priority[b.severity] ||
    a.viewport.localeCompare(b.viewport)||a.code.localeCompare(b.code));
  const failedComparisons=input.comparisons.filter(c=>c.error || c.passed===false);
  const visualChanges=input.comparisons.flatMap(c=>(c.regions??[]).map(region=>({
    viewport:c.viewport,...region,
  }))).sort((a,b)=>b.changedPixels-a.changedPixels);
  const high=issues.filter(i=>i.severity==="high").length;
  const medium=issues.filter(i=>i.severity==="medium").length;
  const info=issues.filter(i=>i.severity==="info").length;
  return {
    issues:{high,medium,info,total:issues.length},
    comparedViewports:input.comparisons.length,
    failedComparisons:failedComparisons.length,
    blockedRequests:input.blockedRequests,
    inspectedViewports:input.viewports,
    passed:high===0 && medium===0 && failedComparisons.length===0,
    priorityFindings:issues.slice(0,20),
    priorityVisualRegions:visualChanges.slice(0,12),
    nextActions:[
      ...(high?["Fix blocking layout or broken asset errors first."]:[]),
      ...(medium?["Review semantic controls, links and accessible labels."]:[]),
      ...(failedComparisons.length?["Inspect screenshot heatmaps and visually diagnose the largest changed regions."]:[]),
      ...(input.blockedRequests?["Resolve intentionally blocked remote fonts/images before interpreting visual fidelity."]:[]),
      "Verify navigation and app actions separately; an image match is not a functional test.",
    ],
  };
}
export async function reviewUi(input:{
  url:string;projectRoot?:string;viewports?:Screen[];referenceImages?:Reference[];
  outputDir?:string;reportPath?:string;overwrite?:boolean;
  threshold?:number;maxChangedPercent?:number;timeoutMs?:number;
}) {
  const references=input.referenceImages??[];
  if(references.length>5 || references.some(r=>!r.viewport || !r.file))
    throw new Error("Provide up to five named reference screenshots.");
  if(new Set(references.map(r=>r.viewport)).size!==references.length)
    throw new Error("Duplicate reference viewport names.");
  const outputDir=path.resolve(input.outputDir??".awsm/review");
  const audit=await auditUiPage({
    url:input.url,projectRoot:input.projectRoot,viewports:input.viewports,
    captureDir:outputDir,overwrite:input.overwrite,timeoutMs:input.timeoutMs,
  });
  const comparisons:Comparison[]=[];
  for(const reference of references) {
    const rendered=audit.views.find(v=>v.viewport.name===reference.viewport);
    if(!rendered || !rendered.capture){
      comparisons.push({viewport:reference.viewport,reference:reference.file,
        error:"No screenshot captured for this viewport. Match reference names to viewports."});
      continue;
    }
    try {
      const diff=await compareUiScreenshots({
        reference:reference.file,actual:rendered.capture.file,
        threshold:input.threshold,maxChangedPercent:input.maxChangedPercent,
        diffPath:path.join(outputDir,reference.viewport+"-diff.png"),overwrite:input.overwrite,
      });
      comparisons.push({
        viewport:reference.viewport,reference:reference.file,actual:rendered.capture.file,
        passed:diff.passed,changedPercent:diff.changedPercent,regions:diff.regions,diffPath:diff.diffPath,
      });
    }catch(error){
      comparisons.push({viewport:reference.viewport,reference:reference.file,actual:rendered.capture.file,
        error:error instanceof Error?error.message:String(error)});
    }
  }
  const issues=audit.views.flatMap(v=>v.findings);
  const blockedRequests=audit.views.reduce((sum,v)=>sum+v.blockedExternalRequests.length,0);
  const summary=summarizeReview({issues,comparisons,blockedRequests,viewports:audit.views.length});
  const output={
    schemaVersion:"awsm.ui-review/v1",url:audit.url,outputDir,
    viewports:audit.views.map(v=>({viewport:v.viewport,capture:v.capture,findings:v.findings,
      blockedExternalRequests:v.blockedExternalRequests,consoleErrors:v.jsErrors})),
    comparisons,summary,
    limitations:[
      "UI review captures read-only page states. It never submits forms, clicks destructive actions or rewrites source code.",
      "Findings are heuristic and do not certify accessibility or semantic visual accuracy.",
      "Only references with exact matching viewport PNG dimensions can be compared.",
      "Browser screenshots rely on project-local Playwright and a running localhost dev server.",
    ],
  };
  let savedTo:string|undefined;
  if(input.reportPath){
    savedTo=path.resolve(input.reportPath);
    await fs.mkdir(path.dirname(savedTo),{recursive:true});
    await fs.writeFile(savedTo,JSON.stringify(output,null,2)+"\n",{flag:input.overwrite?"w":"wx"});
  }
  return {...output,savedTo};
}
