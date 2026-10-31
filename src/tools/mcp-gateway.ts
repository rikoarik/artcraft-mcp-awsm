import fs from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

type RemoteTool = { name: string; description?: string; inputSchema?: unknown; annotations?: { readOnlyHint?: boolean } };
type ServerConfig = {
  command: string;
  args?: string[];
  cwd?: string;
  env?: Record<string,string>;
  allowedTools: string[];
};
type ConfigFile = { version: 1; servers: Record<string,ServerConfig> };
type Connection = {
  client: Client;
  transport: StdioClientTransport;
  tools: Map<string,RemoteTool>;
};
const namePattern=/^[a-zA-Z][a-zA-Z0-9_-]{0,47}$/;
const toolPattern=/^[a-zA-Z0-9_.:/-]{1,128}$/;
const MAX_BYTES=64*1024;
const MAX_SERVERS=8;
const MAX_TOOL_LIST=250;
const timeout=<T>(promise:Promise<T>,durationMs:number,label:string):Promise<T>=>{
  let handle:ReturnType<typeof setTimeout>;
  const deadline=new Promise<T>((_,reject)=>{
    handle=setTimeout(()=>reject(new Error(label+" timed out after "+durationMs+"ms")),durationMs);
  });
  return Promise.race([promise,deadline]).finally(()=>clearTimeout(handle));
};
function plain(v:unknown):v is Record<string,unknown> {
  return v!==null && typeof v==="object"&&!Array.isArray(v) &&
    (Object.getPrototypeOf(v)===Object.prototype||Object.getPrototypeOf(v)===null);
}
function validate(raw:unknown):ConfigFile {
  if(!plain(raw)||raw.version!==1||!plain(raw.servers))
    throw new Error("Expected AWSM bridges JSON: {version:1,servers:{...}}");
  const servers=Object.entries(raw.servers);
  if(servers.length>MAX_SERVERS)throw new Error("Maximum 8 downstream MCP servers.");
  const out:Record<string,ServerConfig>=Object.create(null);
  for(const [name,item] of servers){
    if(!namePattern.test(name)||name==="awsm"||!plain(item))
      throw new Error("Invalid bridge name: "+name);
    const command=item.command;
    if(typeof command!=="string"||!command.trim()||command.length>500)
      throw new Error("Invalid command for bridge "+name);
    const args=item.args??[];
    if(!Array.isArray(args)||args.length>32||!args.every(x=>typeof x==="string"&&x.length<=1000))
      throw new Error("Invalid args for bridge "+name);
    const allowedTools=item.allowedTools;
    if(!Array.isArray(allowedTools)||!allowedTools.length||allowedTools.length>100 ||
      !allowedTools.every(t=>typeof t==="string" && (t==="*"||toolPattern.test(t))))
      throw new Error("Configure explicit allowedTools for bridge "+name);
    if(item.cwd!==undefined&&(typeof item.cwd!=="string"||item.cwd.length>1000))
      throw new Error("Invalid cwd for bridge "+name);
    if(item.env!==undefined&&(!plain(item.env)||Object.entries(item.env).some(([k,v])=>
      !/^[A-Z_][A-Z_0-9]*$/i.test(k)||typeof v!=="string"||v.length>4096)))
      throw new Error("Invalid env for bridge "+name);
    const resolvedBinary=path.basename(command).toLowerCase();
    const selfEntrypoint=fileURLToPath(new URL("../index.js",import.meta.url));
    const binaryIsNode=resolvedBinary==="node"||resolvedBinary==="node.exe";
    const childScript=binaryIsNode && args[0]?path.resolve(item.cwd??process.cwd(),args[0]):null;
    const invokesSelf=resolvedBinary==="my-awsm-mcp" ||
      args.some((arg:string)=>arg==="github:rikoarik/figcraft-mcp-awsm"||arg==="github:rikoarik/artcraft-mcp-awsm"||arg==="my-awsm-mcp") ||
      childScript===selfEntrypoint;
    if(invokesSelf)throw new Error("Refusing to launch AWSM as a child of itself.");
    out[name]={command,args,allowedTools,
      ...(item.cwd?{cwd:item.cwd}:{}),...(item.env?{env:item.env as Record<string,string>}:{})};
  }
  return {version:1,servers:out};
}
async function config():Promise<ConfigFile> {
  const filename=path.resolve(process.env.AWSM_BRIDGE_CONFIG??".awsm/bridges.json");
  let configured:ConfigFile={version:1,servers:Object.create(null)};
  try {
    const stats=await fs.stat(filename);
    if(!stats.isFile()||stats.size>MAX_BYTES)throw new Error("Bridge config is not a file or exceeds 64KB.");
    configured=validate(JSON.parse(await fs.readFile(filename,"utf8")) as unknown);
  }catch(e){
    if((e as NodeJS.ErrnoException).code!=="ENOENT")throw e;
  }
  if(!configured.servers.solidcraft && Object.keys(configured.servers).length<MAX_SERVERS){
    const executable=await discoverSolidCraft();
    if(executable){
      configured.servers.solidcraft={
        command:executable,args:["mcp","--param-check","strict"],
        allowedTools:SOLIDCRAFT_TOOLS,
      };
    }
  }
  if(!configured.servers.cadcraft && Object.keys(configured.servers).length<MAX_SERVERS){
    const executable=await discoverCADCraft();
    if(executable){
      configured.servers.cadcraft={
        command:executable,args:["mcp"],
        allowedTools:CADCRAFT_TOOLS,
      };
    }
  }
  return configured;
}
/**
 * Discover installed, executable Craft CLIs without launching programs,
 * running a shell, downloading dependencies, or searching relative paths.
 * Only these two known providers are autodiscovered; others need explicit config.
 */
async function discoverExecutable(binary:string,pathValue:string,platform:string) {
  const filename=platform==="win32"?binary+".exe":binary;
  for(const dir of pathValue.split(path.delimiter).filter(Boolean)){
    if(!path.isAbsolute(dir))continue;
    const candidate=path.join(dir,filename);
    try{
      const stat=await fs.stat(candidate);
      if(!stat.isFile())continue;
      await fs.access(candidate,platform==="win32"?fsConstants.F_OK:fsConstants.X_OK);
      return candidate;
    }catch{ /* Not installed in this directory. */ }
  }
  return undefined;
}
export async function discoverSolidCraft(pathValue=process.env.PATH??"",platform=process.platform){
  if(process.env.AWSM_AUTO_SOLIDCRAFT==="0")return undefined;
  return discoverExecutable("solidcraft-cli",pathValue,platform);
}
export async function discoverCADCraft(pathValue=process.env.PATH??"",platform=process.platform){
  if(process.env.AWSM_AUTO_CADCRAFT==="0")return undefined;
  return discoverExecutable("cadcraft-cli",pathValue,platform);
}
const SOLIDCRAFT_TOOLS=[
  "list_commands","describe_command","skill_reference","inspect_design",
  "measure","body_topology","screenshot","running","pending",
  "execute","batch","set_parameter","undo","redo","save","export",
];
// CADCraft's native drawing tools. Do not expose open/new_drawing by default:
// neither can be assumed safe for unsaved user drawings.
const CADCRAFT_TOOLS=[
  "list_commands","inspect_drawing","query_entities","find_text",
  "render","execute","command_line","script","save","cancel",
];
const allowed=(cfg:ServerConfig,tool:string)=>cfg.allowedTools.includes("*")||cfg.allowedTools.includes(tool);

export class McpGateway {
  private readonly connections=new Map<string,Connection>();
  private readonly pending=new Map<string,Promise<Connection>>();
  private configuration:Promise<ConfigFile>|undefined;

  private getConfig():Promise<ConfigFile> {
    return this.configuration??=config();
  }
  private async connect(name:string,cfg:ServerConfig):Promise<Connection>{
    const cached=this.connections.get(name);
    if(cached)return cached;
    const inflight=this.pending.get(name);
    if(inflight)return inflight;
    const promise=(async()=>{
      // A user-authored config explicitly grants AWSM permission to execute these child commands.
      // Environment inherits the user's process, with optional explicit additions.
      const transport=new StdioClientTransport({
        command:cfg.command,args:cfg.args??[],
        cwd:cfg.cwd?path.resolve(cfg.cwd):undefined,
        env:{...process.env,...(cfg.env??{})} as Record<string,string>,
        stderr:"pipe",
      });
      const client=new Client({name:"awsm-bridge",version:"1.0.0"});
      try{
        await timeout(client.connect(transport),10000,"MCP bridge "+name+" startup");
        const tools=new Map<string,RemoteTool>();
        let cursor:string|undefined;
        for(let page=0;page<10;page++){
          const response=await timeout(client.listTools(cursor?{cursor}:undefined),10000,"MCP bridge "+name+" discovery");
          for(const tool of response.tools){
            if(allowed(cfg,tool.name))tools.set(tool.name,tool);
            if(tools.size>MAX_TOOL_LIST)throw new Error("Exceeded bridge tool limit.");
          }
          cursor=response.nextCursor;
          if(!cursor)break;
          if(page===9)throw new Error("Bridge tool pagination exceeds 10 pages.");
        }
        const entry={client,transport,tools};
        this.connections.set(name,entry);
        return entry;
      }catch(error){
        await transport.close().catch(()=>{});
        throw error;
      }
    })();
    this.pending.set(name,promise);
    try{return await promise;}
    finally{this.pending.delete(name);}
  }
  async list(input:{server?:string;connect?:boolean}={}){
    const cfg=await this.getConfig();
    if(input.server && !cfg.servers[input.server])throw new Error("Unknown MCP bridge: "+input.server);
    const selected=input.server?[input.server]:Object.keys(cfg.servers);
    const results: Array<{name:string;status:string;tools?:RemoteTool[];allowedTools:string[];error?:string}>=[];
    for(const name of selected){
      const item=cfg.servers[name];
      const connected=this.connections.get(name);
      if(!input.connect && !connected){
        results.push({name,status:"configured",allowedTools:item.allowedTools});
        continue;
      }
      try{
        const current=connected??await this.connect(name,item);
        results.push({name,status:"connected",allowedTools:item.allowedTools,
          tools:[...current.tools.values()].map(x=>({name:x.name,description:x.description,inputSchema:x.inputSchema,
            annotations:x.annotations}))});
      }catch(error){
        results.push({name,status:"error",allowedTools:item.allowedTools,
          error:error instanceof Error?error.message:String(error)});
      }
    }
    return {connectedThrough:"awsm",configuredServers:selected.length,servers:results,
      note:"Installed SolidCraft and CADCraft can be discovered but only started on request; explicit bridges.json entries override discovery. CADCraft defaults to a headless drawing; configure --connect to edit the visible app. Other MCPs require explicit configuration. Set AWSM_AUTO_SOLIDCRAFT=0 or AWSM_AUTO_CADCRAFT=0 to opt out. All calls run with local permissions."};
  }
  async call(input:{server:string;tool:string;arguments?:Record<string,unknown>}){
    const cfg=await this.getConfig();
    const server=cfg.servers[input.server];
    if(!server)throw new Error("Bridge is not configured: "+input.server);
    if(!allowed(server,input.tool))throw new Error("Tool is not on the allowlist: "+input.server+"/"+input.tool);
    if(!plain(input.arguments??{}))throw new Error("Tool arguments must be a JSON object.");
    const connection=await this.connect(input.server,server);
    if(!connection.tools.has(input.tool))throw new Error("Tool is unavailable on "+input.server+": "+input.tool);
    // The original MCP result is returned unchanged, including text or image blocks.
    const result=await timeout(connection.client.callTool({
      name:input.tool,arguments:input.arguments??{},
    }),60000,"Bridge call "+input.server+"/"+input.tool);
    if("content" in result && Array.isArray(result.content))return result as CallToolResult;
    return {content:[{type:"text" as const,text:JSON.stringify(result)}]};
  }
  async close(){
    const active=[...this.connections.values()];
    this.connections.clear();
    await Promise.all(active.map(x=>x.client.close().catch(()=>{})));
  }
}
