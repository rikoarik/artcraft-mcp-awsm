import fs from "node:fs/promises";
import path from "node:path";
import { findPlaywright, validUrl } from "./browser-capture.js";

type Severity = "high"|"medium"|"info";
type Finding = { code:string; severity:Severity; viewport:string; selector?:string; message:string; suggestedFix:string };
type NodeIssue = {selector:string; detail?:string};
export interface UiAuditSnapshot {
  width:number; height:number; scrollWidth:number; clientWidth:number;
  totalElements:number; truncated:boolean; hasMain:boolean; title:string;
  brokenImages:NodeIssue[]; missingControlNames:NodeIssue[];
  unlabeledInputs:NodeIssue[]; placeholderLinks:NodeIssue[];
  horizontalOverflow:NodeIssue[]; smallTargets:NodeIssue[];
}
function bounded(v:string):string {return v.slice(0,200);}
export function analyzeUiSnapshot(snapshot:UiAuditSnapshot,viewport:string):Finding[] {
  const out:Finding[]=[];
  const add=(code:string,severity:Severity,items:NodeIssue[],message:string,suggestedFix:string) => {
    for(const item of items.slice(0,20)) {
      if(out.length>=100)break;
      out.push({code,severity,viewport,selector:item.selector,
        message:message+(item.detail?" ("+bounded(item.detail)+")":""),suggestedFix});
    }
  };
  if(snapshot.scrollWidth>snapshot.clientWidth+2)
    out.push({code:"HORIZONTAL_PAGE_OVERFLOW",severity:"high",viewport,
      message:"Document width "+snapshot.scrollWidth+"px exceeds viewport "+snapshot.clientWidth+"px.",
      suggestedFix:"Inspect offending containers and replace fixed widths with responsive constraints."});
  add("ELEMENT_OFFSCREEN","medium",snapshot.horizontalOverflow,"Visible element extends beyond the right viewport edge.","Inspect min-width, transforms, flex shrink and grid sizing.");
  add("BROKEN_IMAGE","high",snapshot.brokenImages,"Image failed to load.","Verify the local asset path, source URL and bundler public directory.");
  add("UNNAMED_CONTROL","medium",snapshot.missingControlNames,"Interactive control has no discernible name.","Provide visible text or an accessible name with aria-label/aria-labelledby.");
  add("UNLABELED_INPUT","medium",snapshot.unlabeledInputs,"Form control has no associated label.","Associate a visible label using htmlFor/id or use aria-labelledby.");
  add("PLACEHOLDER_LINK","medium",snapshot.placeholderLinks,"Link points to an empty or placeholder destination.","Connect the link to a meaningful route or replace it with a real button action.");
  add("SMALL_CONTROL","info",snapshot.smallTargets,"Button appears smaller than 24 CSS pixels in one dimension.","Check touch size and adjacent spacing; consider a larger interactive hit area.");
  if(!snapshot.hasMain)out.push({code:"MISSING_MAIN_LANDMARK",severity:"info",viewport,
    message:"No main landmark found.",suggestedFix:"Wrap primary page content in a main element when appropriate."});
  if(snapshot.truncated)out.push({code:"ELEMENT_LIMIT",severity:"info",viewport,
    message:"DOM scan was capped at 2500 elements; some findings may be omitted.",
    suggestedFix:"Audit individual routes or simplify the DOM for reliable coverage."});
  return out.slice(0,100);
}

export async function auditUiPage(input:{
  url:string; projectRoot?:string; viewports?:Array<{name:string;width:number;height:number}>;
  reportPath?:string; overwrite?:boolean;timeoutMs?:number;
}) {
  const url=validUrl(input.url);
  const projectRoot=await fs.realpath(path.resolve(input.projectRoot??"."));
  const viewports=input.viewports??[{name:"mobile",width:375,height:812},{name:"desktop",width:1440,height:900}];
  if(!viewports.length||viewports.length>5)throw new Error("Provide 1..5 viewports.");
  if(new Set(viewports.map(v=>v.name)).size!==viewports.length)throw new Error("Duplicate viewport names.");
  for(const v of viewports)
    if(!/^[a-z0-9][a-z0-9_-]{0,31}$/.test(v.name) || !Number.isInteger(v.width) || !Number.isInteger(v.height)
      || v.width<240||v.width>2560||v.height<320||v.height>1800)throw new Error("Invalid viewport configuration.");
  const timeout=input.timeoutMs??15000;
  if(!Number.isInteger(timeout)||timeout<1000||timeout>30000)throw new Error("Timeout must be 1000..30000ms.");
  const playwright=findPlaywright(projectRoot);
  const browser=await playwright.chromium.launch({headless:true,args:["--no-first-run","--disable-extensions"]});
  const views:Array<{viewport:{name:string;width:number;height:number};snapshot:UiAuditSnapshot;
    findings:Finding[];jsErrors:string[];blockedExternalRequests:string[]}>=[];

  try {
    for(const viewport of viewports) {
      const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},
        deviceScaleFactor:1,reducedMotion:"reduce",serviceWorkers:"block",acceptDownloads:false});
      const jsErrors:string[]=[];
      const blockedExternalRequests:string[]=[];
      try {
        await context.route("**/*",async route=>{
          const requested=route.request().url();
          let allowed=false;
          try {
            const u=new URL(requested);
            allowed=u.protocol==="data:"||u.protocol==="blob:"||
              (u.protocol==="http:"&&u.hostname===url.hostname&&u.port===url.port);
          }catch{/* unsupported URL */}
          if(allowed)await route.continue();
          else {
            if(blockedExternalRequests.length<30)blockedExternalRequests.push(requested.slice(0,250));
            await route.abort();
          }
        });
        const page=await context.newPage();
        page.on("pageerror",(error:Error)=>{if(jsErrors.length<20)jsErrors.push(error.message.slice(0,400));});
        page.on("console",(message:{type():string;text():string})=>{
          if(message.type()==="error"&&jsErrors.length<20)jsErrors.push(message.text().slice(0,400));
        });
        await page.goto(url.toString(),{waitUntil:"load",timeout});
        // Read-only evaluation. No interaction, user input or DOM mutation.
        const snapshot=await page.evaluate(() => {
          const selector=(el:Element)=>{
            const id=el.getAttribute("id");
            if(id&&/^[A-Za-z][A-Za-z0-9_-]{0,60}$/.test(id))return "#"+id;
            const tag=el.tagName.toLowerCase();
            const parent=el.parentElement;
            if(!parent)return tag;
            const siblings=Array.from(parent.children).filter(e=>e.tagName===el.tagName);
            return parent.tagName.toLowerCase()+" > "+tag+":nth-of-type("+(siblings.indexOf(el)+1)+")";
          };
          const visible=(el:Element)=>{
            const r=el.getBoundingClientRect();
            const s=getComputedStyle(el);
            return s.display!=="none"&&s.visibility!=="hidden"&&Number(s.opacity)>0&&r.width>0&&r.height>0;
          };
          const named=(el:Element)=>{
            const title=el.getAttribute("title")||"";
            const by=el.getAttribute("aria-labelledby");
            const byText=by ? by.split(/\s+/).map(id=>document.getElementById(id)?.textContent||"").join(" ") : "";
            return Boolean((el.getAttribute("aria-label")||"").trim()||byText.trim()||
              (el.textContent||"").trim()||title.trim()||
              (el.querySelector("img[alt]")?.getAttribute("alt")||"").trim());
          };
          const brokenImages:Array<{selector:string;detail?:string}>=[];
          const missingControlNames:Array<{selector:string;detail?:string}>=[];
          const unlabeledInputs:Array<{selector:string;detail?:string}>=[];
          const placeholderLinks:Array<{selector:string;detail?:string}>=[];
          const horizontalOverflow:Array<{selector:string;detail?:string}>=[];
          const smallTargets:Array<{selector:string;detail?:string}>=[];
          const all=Array.from(document.querySelectorAll("*"));
          for(const el of all.slice(0,2500)) {
            if(!visible(el))continue;
            const sel=selector(el);
            const rect=el.getBoundingClientRect();
            if(rect.right>window.innerWidth+2 && rect.left>=0 && horizontalOverflow.length<20)
              horizontalOverflow.push({selector:sel,detail:"right "+Math.round(rect.right)+"px"});
            const tag=el.tagName.toLowerCase();
            if(tag==="img") {
              const img=el as HTMLImageElement;
              if(img.complete&&img.naturalWidth===0&&brokenImages.length<20)
                brokenImages.push({selector:sel,detail:img.getAttribute("src")?.slice(0,120)});
            }
            if(tag==="a") {
              const href=el.getAttribute("href");
              if((href===null||href===""||href==="#"||href.startsWith("javascript:"))&&placeholderLinks.length<20)
                placeholderLinks.push({selector:sel,detail:href??"missing href"});
            }
            if(tag==="button"||el.getAttribute("role")==="button"||el.getAttribute("role")==="link") {
              if(!named(el)&&missingControlNames.length<20)missingControlNames.push({selector:sel});
              if((rect.width<24||rect.height<24)&&smallTargets.length<20)
                smallTargets.push({selector:sel,detail:Math.round(rect.width)+"x"+Math.round(rect.height)});
            }
            if(["input","textarea","select"].includes(tag)) {
              const input=el as HTMLInputElement;
              if(input.type==="hidden"||input.type==="submit"||input.type==="button")continue;
              const labelled=Boolean((el.getAttribute("aria-label")||"").trim()||
                (el.getAttribute("aria-labelledby")||"").trim()||
                input.labels?.length||el.closest("label")||
                (el.getAttribute("title")||"").trim());
              if(!labelled&&unlabeledInputs.length<20)unlabeledInputs.push({selector:sel,detail:input.type});
            }
          }
          return {
            width:window.innerWidth,height:window.innerHeight,
            scrollWidth:document.documentElement.scrollWidth,
            clientWidth:document.documentElement.clientWidth,
            totalElements:all.length,truncated:all.length>2500,
            title:document.title,hasMain:Boolean(document.querySelector("main,[role=main]")),
            brokenImages,missingControlNames,unlabeledInputs,placeholderLinks,
            horizontalOverflow,smallTargets,
          };
        });
        const findings=analyzeUiSnapshot(snapshot,viewport.name);
        for(const error of jsErrors.slice(0,10))
          findings.push({code:"JS_ERROR",severity:"high",viewport:viewport.name,
            message:"Browser console/runtime error: "+error,suggestedFix:"Inspect stack trace, failed resources and client initialization."});
        views.push({viewport,snapshot,findings,jsErrors,blockedExternalRequests});
      }finally{await context.close();}
    }
  }finally{await browser.close();}
  const findings=views.flatMap(v=>v.findings);
  const counts={high:findings.filter(f=>f.severity==="high").length,
    medium:findings.filter(f=>f.severity==="medium").length,
    info:findings.filter(f=>f.severity==="info").length};
  const output={schemaVersion:"awsm.ui-audit/v1",url:url.toString(),
    passed:counts.high===0&&counts.medium===0,counts,views,
    caveats:["Heuristic DOM audit, not a WCAG conformance certification.",
      "Visible-only checks can miss content in unvisited states or scroll positions.",
      "External resources are intentionally blocked; inspect blockedExternalRequests before interpreting results.",
      "No form submissions or mutation actions are performed."]};
  let savedTo:string|undefined;
  if(input.reportPath){
    savedTo=path.resolve(input.reportPath);
    await fs.mkdir(path.dirname(savedTo),{recursive:true});
    await fs.writeFile(savedTo,JSON.stringify(output,null,2)+"\n",{flag:input.overwrite?"w":"wx"});
  }
  return {...output,savedTo};
}
