import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { readPngDimensions } from "./visual-png.js";

export type Viewport = { name:string; width:number; height:number };
const RESERVED=new Set(["__proto__","constructor","prototype"]);
const PRESETS:Viewport[]=[{name:"mobile",width:375,height:812},{name:"desktop",width:1440,height:900}];
const validUrl=(text:string):URL=>{
  let value:URL;
  try {value=new URL(text);} catch {throw new Error("Expected a fully qualified localhost URL.");}
  if(value.protocol!=="http:" || !["localhost","127.0.0.1","[::1]"].includes(value.hostname) || value.username || value.password)
    throw new Error("Only unauthenticated HTTP localhost URLs are allowed for browser capture.");
  if(!value.port || Number(value.port)<1024)throw new Error("Provide a local development server port >=1024.");
  return value;
};
const validViewport=(v:Viewport):Viewport=>{
  if(!/^[a-z0-9][a-z0-9_-]{0,31}$/.test(v.name) || RESERVED.has(v.name))
    throw new Error("Viewport name must be lowercase alphanumeric, dash or underscore.");
  if(!Number.isInteger(v.width)||!Number.isInteger(v.height)||v.width<240||v.width>2560||v.height<320||v.height>1800)
    throw new Error("Viewport must be 240..2560 wide, 320..1800 high.");
  return v;
};
type BrowserLike={
  newContext(options:unknown):Promise<{
    route(pattern:string, handler:(route:{request():{url():string};continue():Promise<void>;abort():Promise<void>})=>Promise<void>):Promise<void>;
    newPage():Promise<{
      on(event:string,cb:(value:any)=>void):void;
      goto(url:string,options:unknown):Promise<unknown>;
      screenshot(options:unknown):Promise<Buffer>;
      title():Promise<string>;
    }>;
    close():Promise<void>;
  }>;
  close():Promise<void>;
};
function findPlaywright(projectRoot:string): {chromium:{launch(options:unknown):Promise<BrowserLike>}} {
  let module:unknown;
  try {
    const require=createRequire(path.join(projectRoot,"package.json"));
    module=require("playwright");
  } catch {
    throw new Error("Playwright not found in the target project. Install it there (npm i -D playwright && npx playwright install chromium), then retry. AWSM does not auto-install browser packages.");
  }
  const api=module as {chromium?:{launch?:unknown}};
  if(!api.chromium || typeof api.chromium.launch!=="function")
    throw new Error("The installed playwright package does not export chromium.launch.");
  return api as {chromium:{launch(options:unknown):Promise<BrowserLike>}};
}
export async function captureUiScreenshots(input:{
  url:string;projectRoot?:string;outDir?:string;viewports?:Viewport[];fullPage?:boolean;
  overwrite?:boolean;timeoutMs?:number;
}) {
  const url=validUrl(input.url);
  const projectRoot=await fs.realpath(path.resolve(input.projectRoot??"."));
  const output=path.resolve(input.outDir??path.join(projectRoot,".awsm/visual"));
  const widthConfig=input.viewports??PRESETS;
  if(widthConfig.length<1||widthConfig.length>5)throw new Error("Provide 1..5 viewports.");
  const viewports=widthConfig.map(validViewport);
  if(new Set(viewports.map(v=>v.name)).size!==viewports.length)throw new Error("Duplicate viewport name.");
  const timeout=input.timeoutMs??15000;
  if(!Number.isInteger(timeout)||timeout<1000||timeout>30000)throw new Error("Timeout must be 1000..30000 ms.");
  const playwright=findPlaywright(projectRoot);
  await fs.mkdir(output,{recursive:true});
  const browser=await playwright.chromium.launch({headless:true,args:["--no-first-run","--disable-extensions"]});
  const captures:Array<{viewport:Viewport;file:string;dimensions:{width:number;height:number};title:string;consoleErrors:string[];blockedRequests:string[]}>=[];
  try {
    for(const viewport of viewports) {
      const target=path.join(output,viewport.name+".png");
      if(!input.overwrite) {
        try {await fs.stat(target);throw new Error("Screenshot already exists: "+target+"; pass overwrite=true to replace.");}
        catch(error){if((error as NodeJS.ErrnoException).code!=="ENOENT")throw error;}
      }
      const context=await browser.newContext({
        viewport:{width:viewport.width,height:viewport.height},deviceScaleFactor:1,
        colorScheme:"light",reducedMotion:"reduce",serviceWorkers:"block",
        acceptDownloads:false,
      });
      const blockedRequests:string[]=[];
      const consoleErrors:string[]=[];
      try {
        await context.route("**/*",async route=>{
          const requested=route.request().url();
          let allowed=false;
          try {
            const u=new URL(requested);
            allowed=u.protocol==="http:" && u.hostname===url.hostname && u.port===url.port;
            if(u.protocol==="data:" || u.protocol==="blob:")allowed=true;
          } catch{/* blocked */}
          if(allowed)await route.continue();
          else {
            if(blockedRequests.length<30)blockedRequests.push(requested.slice(0,250));
            await route.abort();
          }
        });
        const page=await context.newPage();
        page.on("pageerror",(e:Error)=>{if(consoleErrors.length<20)consoleErrors.push(e.message);});
        page.on("console",(message:{type():string;text():string})=>{
          if(message.type()==="error" && consoleErrors.length<20)consoleErrors.push(message.text().slice(0,400));
        });
        await page.goto(url.toString(),{waitUntil:"domcontentloaded",timeout});
        // Do not assume animations have finished on load; this is a stable reduced-motion snapshot.
        const screenshot=await page.screenshot({fullPage:input.fullPage??false,animations:"disabled",caret:"hide",timeout});
        const dimensions=readPngDimensions(screenshot);
        if(dimensions.width*dimensions.height>12_000_000)throw new Error("Captured screenshot exceeds 12MP limit.");
        await fs.writeFile(target,screenshot,{flag:input.overwrite?"w":"wx"});
        captures.push({viewport,file:target,dimensions,title:await page.title(),consoleErrors,blockedRequests});
      } finally {await context.close();}
    }
  } finally {await browser.close();}
  return {url:url.toString(),captures,
    environment:"project-local playwright; remote network requests intentionally blocked",
    note:"Compare these PNGs with same-size FigCraft exports via compare_ui_screenshots. Browser screenshots do not prove functional interaction correctness; blocked external fonts/images may affect fidelity."};
}
