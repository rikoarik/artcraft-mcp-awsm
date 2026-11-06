import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { adapters, type Craft } from "./craft-adapters.js";
export type { Craft } from "./craft-adapters.js";
export function endpoint(value:string):string {
  if (!/^(?:(?:127\.0\.0\.1|localhost):)?[0-9]{1,5}$/.test(value)) throw new Error("Expected a localhost control port.");
  const port=Number(value.split(":").at(-1));
  if(port<1||port>65535)throw new Error("Invalid control port.");
  return "127.0.0.1:"+port;
}
export function processEndpoints(craft:Craft,commands:string):string[] {
  const found=new Set<string>();
  for(const line of commands.split("\n")) {
    if(!new RegExp("(?:^|[/\\\\\s])"+craft+"(?:\\.exe)?(?:\\s|$)","i").test(line))continue;
    const match=line.match(/--control(?:=|\s+)([0-9]+)/);
    if(match)found.add(endpoint(match[1]));
  }
  return [...found];
}
export async function activeEndpoint(craft:Craft):Promise<string|undefined> {
  const explicit=process.env["AWSM_"+craft.toUpperCase()+"_ENDPOINT"];
  if(explicit)return endpoint(explicit);
  if(process.platform!=="win32") {
    const result=await promisify(execFile)("ps",["-ax","-o","comm=,args="],{timeout:2000,maxBuffer:1024*1024}).catch(()=>({stdout:""}));
    const candidates=processEndpoints(craft,result.stdout);
    if(candidates.length>1)throw new Error("Multiple "+craft+" control endpoints; set AWSM_"+craft.toUpperCase()+"_ENDPOINT.");
    if(candidates.length===1)return candidates[0];
  }
  if(craft==="solidcraft") {
    const base=process.platform==="darwin"?path.join(os.homedir(),"Library/Application Support/SolidCraft"):
      process.platform==="win32"?path.join(process.env.LOCALAPPDATA??"", "SolidCraft"):
      path.join(process.env.XDG_DATA_HOME??path.join(os.homedir(),".local/share"),"solidcraft");
    try{return endpoint((await fs.readFile(path.join(base,"control/current.port"),"utf8")).trim());}
    catch(e){if((e as NodeJS.ErrnoException).code!=="ENOENT")throw e;}
  }
  return undefined;
}
export function attachedArgs(craft:Craft,port:string):string[] {
  return ["mcp",adapters[craft].flag,adapters[craft].flag==="--bridge"?endpoint(port).split(":")[1]:endpoint(port),...(craft==="solidcraft"?["--param-check","strict"]:[])];
}

const diagnosticCache=new Map<string,Promise<unknown>>();
export function versionDiagnostics(craft:Craft,command:string):Promise<unknown> {
  const key=craft+":"+command;
  let cached=diagnosticCache.get(key);
  if(!cached){
    cached=(async()=>{
      if(path.basename(command).toLowerCase().replace(/\.exe$/,"")!==craft+"-cli")return {status:"custom-launcher",note:"Provider schemas are authoritative; launcher version was not executed."};
      const exec=promisify(execFile);
      const version=await exec(command,["--version"],{timeout:2000,maxBuffer:4096}).then(r=>r.stdout.trim().slice(0,200)).catch(()=>undefined);
      const appNames:Record<Craft,string>={figcraft:"FigCraft",solidcraft:"SolidCraft",cadcraft:"CADCraft",materialcraft:"MaterialCraft",texturecraft:"TextureCraft"};
      const desktop=process.platform==="darwin"?await exec("/usr/libexec/PlistBuddy",["-c","Print :CFBundleShortVersionString","/Applications/"+appNames[craft]+".app/Contents/Info.plist"],{timeout:2000,maxBuffer:4096}).then(r=>r.stdout.trim()).catch(()=>undefined):undefined;
      const cli=version?.match(/\d+\.\d+\.\d+/)?.[0];
      return {cli:cli??version??null,desktop:desktop??null,status:cli&&desktop?(cli===desktop?"matching":"mismatch"):"unverified",
        note:"Diagnostic only; desktop install is not proof of the attached server version. Use actual provider schemas. Align CLI/app releases when APIs differ; AWSM does not auto-install or restart apps."};
    })();
    diagnosticCache.set(key,cached);
  }
  return cached;
}
