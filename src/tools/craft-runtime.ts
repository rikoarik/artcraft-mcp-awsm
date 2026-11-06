import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import net from "node:net";
import crypto from "node:crypto";
import {execFile, spawn} from "node:child_process";
import {promisify} from "node:util";
import {craftNames, type Craft} from "./craft-adapters.js";
import {activeEndpoint, endpoint} from "./craft-session.js";

const exec=promisify(execFile);
const names:Record<Craft,string>={figcraft:"FigCraft",solidcraft:"SolidCraft",cadcraft:"CADCraft",materialcraft:"MaterialCraft",texturecraft:"TextureCraft"};
const repos:Record<Craft,string>={figcraft:"storytold/figcraft",solidcraft:"tangency-labs/solidcraft",cadcraft:"storytold/cadcraft",materialcraft:"storytold/materialcraft",texturecraft:"storytold/texturecraft"};
export type NativeApp={executable:string;bundle?:string;version?:string};
export const nativeSetupEnabled=()=>process.env.AWSM_NATIVE_SETUP!=="0";
export const nativeDir=()=>path.resolve(process.env.AWSM_NATIVE_DIR??path.join(os.homedir(),".awsm","native"));
const pause=(ms:number)=>new Promise(r=>setTimeout(r,ms));
const exists=async(p:string)=>fs.stat(p).then(s=>s.isFile()).catch(()=>false);

export async function findOnPath(binary:string):Promise<string|undefined>{
 for(const dir of (process.env.PATH??"").split(path.delimiter)){
  if(!path.isAbsolute(dir))continue;
  const p=path.join(dir,binary+(process.platform==="win32"?".exe":""));
  if(await exists(p))return p;
 }
 return undefined;
}

export async function findNativeApp(craft:Craft):Promise<NativeApp|undefined>{
 const custom=process.env["AWSM_"+craft.toUpperCase()+"_APP"];
 if(custom){if(!path.isAbsolute(custom)||!await exists(custom))throw new Error("Invalid native app path for "+craft);return {executable:custom};}
 if(process.platform==="darwin"){
  for(const dir of ["/Applications",path.join(os.homedir(),"Applications")]){
   const bundle=path.join(dir,names[craft]+".app");
   const executable=path.join(bundle,"Contents/MacOS",names[craft]);
   if(!await exists(executable))continue;
   const version=await exec("/usr/libexec/PlistBuddy",["-c","Print :CFBundleShortVersionString",path.join(bundle,"Contents/Info.plist")],{timeout:2000}).then(r=>r.stdout.trim()).catch(()=>undefined);
   return {executable,bundle,version};
  }
 }else if(process.platform==="win32"){
  for(const dir of [process.env.LOCALAPPDATA&&path.join(process.env.LOCALAPPDATA,"Programs"),process.env.ProgramFiles,process.env["ProgramFiles(x86)"]].filter((v):v is string=>Boolean(v))){
   for(const file of [names[craft]+".exe",craft+".exe"]){
    const executable=path.join(dir,names[craft],file);
    if(await exists(executable))return {executable};
   }
  }
 }
 const executable=await findOnPath(craft);
 return executable?{executable}:undefined;
}

export function managedCli(craft:Craft){return path.join(nativeDir(),craft,"bin",craft+"-cli"+(process.platform==="win32"?".exe":""));}
export async function installedCli(craft:Craft,app?:NativeApp):Promise<string|undefined>{
 // App-bundled and AWSM-managed CLIs do not depend on a GUI harness's PATH.
 const bundled=app&&path.join(path.dirname(app.executable),craft+"-cli"+(process.platform==="win32"?".exe":""));
 const common=process.platform==="win32"?[]:[path.join(os.homedir(),".local/bin",craft+"-cli"),"/opt/homebrew/bin/"+craft+"-cli","/usr/local/bin/"+craft+"-cli"];
 for(const file of [bundled,managedCli(craft),...common])if(file&&await exists(file))return file;
 return findOnPath(craft+"-cli");
}

type ReleaseAsset={name:string;browser_download_url:string;digest?:string;size:number};
export function selectCliAsset(craft:Craft,assets:ReleaseAsset[],platform:string=process.platform,arch:string=process.arch){
 const windows:Record<string,string>={x64:"x64",arm64:"arm64",ia32:"x86"};
 const linux:Record<string,string>={x64:"x86_64",arm64:"aarch64"};
 const suffix=platform==="darwin"?"macos-universal.zip":platform==="win32"?"windows-"+(windows[arch]??arch)+"-portable.zip":"linux-"+(linux[arch]??arch)+".tar.gz";
 return assets.find(a=>a.name.startsWith(craft+"-cli-")&&a.name.endsWith(suffix))??assets.find(a=>a.name.startsWith(craft+"-")&&a.name.endsWith(suffix));
}
export function cliArchiveEntry(craft:Craft,entries:string[],windows=false){
 const filename=craft+"-cli"+(windows?".exe":"");
 const matches=entries.filter(s=>s.split("/").at(-1)===filename);
 if(matches.length!==1)throw new Error("Official archive must contain exactly one "+filename);
 const entry=matches[0];
 if(entry.startsWith("/")||entry.startsWith("-")||entry.includes("\\")||entry.split("/").includes("..")||/^[A-Za-z]:/.test(entry))throw new Error("Unsafe CLI archive entry");
 return entry;
}

// Shared across harness processes: one CLI download/app launch per Craft at a time.
export async function nativeLock<T>(craft:Craft,work:()=>Promise<T>):Promise<T>{
 const dir=path.join(nativeDir(),craft);await fs.mkdir(dir,{recursive:true,mode:0o700});
 const lock=path.join(dir,"setup.lock");const until=Date.now()+180000;
 for(;;){
  try{const handle=await fs.open(lock,"wx",0o600);await handle.writeFile(String(process.pid));await handle.close();break;}
  catch(e){
   if((e as NodeJS.ErrnoException).code!=="EEXIST")throw e;
   const pid=Number(await fs.readFile(lock,"utf8").catch(()=>""));
   if(pid>0){try{process.kill(pid,0);}catch(e){if((e as NodeJS.ErrnoException).code==="ESRCH"){await fs.unlink(lock).catch(()=>{});continue;}}}
   if(Date.now()>until)throw new Error("Another AWSM process is preparing "+names[craft]+". Retry shortly.");
   await pause(200);
  }
 }
 try{return await work();}finally{await fs.unlink(lock).catch(()=>{});}
}

async function jsonRelease(craft:Craft,version?:string){
 const tag=version&&/^\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/.test(version)?"tags/v"+version:"latest";
 const response=await fetch("https://api.github.com/repos/"+repos[craft]+"/releases/"+tag,{signal:AbortSignal.timeout(20000),headers:{Accept:"application/vnd.github+json","User-Agent":"awsm-native-setup"}});
 if(!response.ok)throw new Error("Cannot prepare the official "+names[craft]+" CLI (release lookup "+response.status+"). Retry when online.");
 return await response.json() as {tag_name:string;assets:ReleaseAsset[]};
}
export async function installCli(craft:Craft,app?:NativeApp):Promise<string>{
 const release=await jsonRelease(craft,app?.version);
 const asset=selectCliAsset(craft,release.assets);
 if(!asset)throw new Error("The official "+names[craft]+" release has no CLI archive for this platform.");
 if(!/^sha256:[a-f0-9]{64}$/.test(asset.digest??"")||asset.size>300*1024*1024)throw new Error("Official CLI archive has no supported integrity digest or is too large.");
 if(!asset.browser_download_url.startsWith("https://github.com/"+repos[craft]+"/releases/download/"))throw new Error("Unexpected official release download URL");
 console.error("AWSM: preparing "+names[craft]+" connector "+release.tag_name);
 const response=await fetch(asset.browser_download_url,{signal:AbortSignal.timeout(120000)});
 if(!response.ok||!response.body)throw new Error("Official CLI download failed: "+response.status);
 const parts:Buffer[]=[];let size=0;
 for await(const chunk of response.body){size+=chunk.length;if(size>300*1024*1024)throw new Error("CLI download exceeds size limit");parts.push(Buffer.from(chunk));}
 const bytes=Buffer.concat(parts);
 if(crypto.createHash("sha256").update(bytes).digest("hex")!==asset.digest!.slice(7))throw new Error("Official CLI archive checksum mismatch");
 const dir=path.join(nativeDir(),craft);const archive=path.join(dir,"download-"+process.pid+(asset.name.endsWith(".zip")?".zip":".tar.gz"));
 const output=managedCli(craft);const temporary=output+".tmp-"+process.pid;
 try{
  await fs.writeFile(archive,bytes,{mode:0o600});await fs.mkdir(path.dirname(output),{recursive:true,mode:0o700});
  if(process.platform==="win32"){
   // Environment values are data, never interpolated into PowerShell code.
   const script='Add-Type -AssemblyName System.IO.Compression.FileSystem; $z=[IO.Compression.ZipFile]::OpenRead($env:AWSM_ZIP); try { $entries=@($z.Entries | Where-Object { $_.Name -ceq $env:AWSM_CLI }); if ($entries.Count -ne 1 -or $entries[0].Length -gt 314572800) { throw "Invalid CLI archive" }; $inputStream=$entries[0].Open(); $outputStream=[IO.File]::Create($env:AWSM_OUTPUT); try { $inputStream.CopyTo($outputStream) } finally { $inputStream.Dispose(); $outputStream.Dispose() } } finally { $z.Dispose() }';
   await exec("powershell.exe",["-NoProfile","-NonInteractive","-Command",script],{timeout:30000,env:{...process.env,AWSM_ZIP:archive,AWSM_CLI:craft+"-cli.exe",AWSM_OUTPUT:temporary}});
  }else{
   const zip=asset.name.endsWith(".zip");
   const list=await exec(zip?"unzip":"tar",zip?["-Z1",archive]:["-tzf",archive],{timeout:30000,maxBuffer:1024*1024});
   const entry=cliArchiveEntry(craft,list.stdout.trim().split(/\r?\n/));
   const binary=await exec(zip?"unzip":"tar",zip?["-p",archive,entry]:["-xOzf",archive,entry],{timeout:30000,maxBuffer:300*1024*1024,encoding:"buffer"});
   await fs.writeFile(temporary,binary.stdout,{mode:0o755});
  }
  await fs.rename(temporary,output);
  await fs.writeFile(path.join(dir,"release.json"),JSON.stringify({repository:repos[craft],release:release.tag_name,digest:asset.digest,appVersion:app?.version??null}),{mode:0o600});
  return output;
 }finally{await fs.unlink(archive).catch(()=>{});await fs.unlink(temporary).catch(()=>{});}
}

export async function ensureNativeCli(craft:Craft):Promise<string>{
 const app=await findNativeApp(craft);const installed=await installedCli(craft,app);
 if(installed)return installed;
 if(!nativeSetupEnabled())throw new Error("Native setup is disabled for "+names[craft]);
 return nativeLock(craft,async()=>await installedCli(craft,app)??await installCli(craft,app));
}

async function listening(value:string):Promise<boolean>{
 return new Promise(resolve=>{
  const socket=net.createConnection({host:"127.0.0.1",port:Number(endpoint(value).split(":")[1])});
  const done=(ok:boolean)=>{socket.destroy();resolve(ok);};
  socket.setTimeout(400,()=>done(false));socket.once("connect",()=>done(true));socket.once("error",()=>done(false));
 });
}
async function appProcesses(app:NativeApp):Promise<number[]>{
 if(process.platform==="win32"){
  const result=await exec("powershell.exe",["-NoProfile","-NonInteractive","-Command",'Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath -eq $env:AWSM_APP } | Select-Object -ExpandProperty ProcessId'],{timeout:4000,env:{...process.env,AWSM_APP:app.executable}});
  return result.stdout.trim().split(/\s+/).map(Number).filter(p=>p>0);
 }
 const result=await exec("ps",["-ax","-o","pid=,args="],{timeout:3000,maxBuffer:1024*1024});
 return result.stdout.split("\n").flatMap(line=>{
  const m=line.match(/^\s*(\d+)\s+(.+)$/);return m&&(m[2]===app.executable||m[2].startsWith(app.executable+" "))?[Number(m[1])]:[];
 });
}

export type VisibleDependencies={active:()=>Promise<string|undefined>;alive:(value:string)=>Promise<boolean>;running:()=>Promise<boolean>;launch:()=>Promise<string>};
export async function resolveVisible(craft:Craft,deps:VisibleDependencies):Promise<string>{
 const current=await deps.active();
 if(current&&await deps.alive(current))return current;
 if(await deps.running())throw new Error(names[craft]+" is open without a working AWSM connection. Keep the current document safe. Offer one reconnect after the user saves/closes this app; AWSM will open and wire it automatically. Do not ask the user for a port, CLI command or MCP configuration, and do not start another document.");
 return deps.launch();
}

export async function ensureVisibleNative(craft:Craft):Promise<string>{
 if(!nativeSetupEnabled()){
  const active=await activeEndpoint(craft);if(active)return active;
  throw new Error("No verified active endpoint for "+craft+"; native setup is disabled.");
 }
 return nativeLock(craft,async()=>{
  const app=await findNativeApp(craft);
  if(!app){const active=await activeEndpoint(craft);if(active&&await listening(active))return active;throw new Error(names[craft]+" is not installed. Install the desktop app once; AWSM handles its connector and connection.");}
  const state=path.join(nativeDir(),craft,"session.json");
  const active=async()=>{
   const observed=await activeEndpoint(craft);if(observed&&await listening(observed))return observed;
   // A shared record is trusted only while its exact launched process still exists.
   try{const saved=JSON.parse(await fs.readFile(state,"utf8"));if(saved.executable===app.executable&&(await appProcesses(app)).includes(saved.pid))return endpoint(saved.endpoint);}catch{}
   return observed;
  };
  return resolveVisible(craft,{active,alive:listening,running:async()=>(await appProcesses(app)).length>0,launch:async()=>{
   const port=await new Promise<number>((resolve,reject)=>{const s=net.createServer();s.once("error",reject);s.listen(0,"127.0.0.1",()=>{const p=(s.address() as net.AddressInfo).port;s.close(()=>resolve(p));});});
   console.error("AWSM: opening "+names[craft]+" and connecting its visible document");
   let pid:number|undefined;
   if(app.bundle)await exec("/usr/bin/open",["-a",app.bundle,"--args","--control",String(port)],{timeout:5000});
   else{const child=spawn(app.executable,["--control",String(port)],{detached:true,stdio:"ignore"});await new Promise<void>((resolve,reject)=>{child.once("spawn",resolve);child.once("error",reject);});pid=child.pid;child.unref();}
   const value=endpoint(String(port));const until=Date.now()+15000;
   while(!await listening(value)){if(Date.now()>until)throw new Error(names[craft]+" opened but its connection is not ready. Leave the document open and retry; do not relaunch it.");await pause(200);}
   pid??=(await appProcesses(app))[0];
   await fs.writeFile(state,JSON.stringify({executable:app.executable,pid,endpoint:value}),{mode:0o600});
   return value;
  }});
 });
}

export async function setupInstalledCrafts(){
 const report=[];
 for(const craft of craftNames){
  if(process.env["AWSM_AUTO_"+craft.toUpperCase()]==="0")continue;
  const app=await findNativeApp(craft);if(!app)continue;
  try{const cli=await ensureNativeCli(craft);report.push({craft,status:"ready",cli});}
  catch(e){report.push({craft,status:"pending",error:e instanceof Error?e.message:String(e)});}
 }
 return report;
}
