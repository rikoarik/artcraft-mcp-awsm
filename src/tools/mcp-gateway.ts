import { adapters, craftNames, isCraft, attachedEndpoint } from "./craft-adapters.js";
import { designGuidance } from "./design-guidance.js";
import { confirmedBrief, authorizeCraft } from "./design-brief.js";
import { activeEndpoint, attachedArgs, endpoint, versionDiagnostics, type Craft } from "./craft-session.js";
import {findNativeApp, installedCli, managedCli, ensureNativeCli, ensureVisibleNative, nativeSetupEnabled} from "./craft-runtime.js";
import fs from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

type RemoteTool = { name: string; description?: string; inputSchema?: unknown; annotations?: { readOnlyHint?: boolean } };
type BridgeCall = {server:string;tool:string;arguments?:Record<string,unknown>;briefId?:string};
type ServerConfig = {
  command: string;
  args?: string[];
  cwd?: string;
  env?: Record<string,string>;
  allowedTools: string[];
  sessionMode?: "visible" | "headless";
  nativeManaged?: boolean;
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
    if(item.sessionMode!==undefined && !["visible","headless"].includes(String(item.sessionMode)))throw new Error("Invalid sessionMode for "+name);
    out[name]={command,args,allowedTools,...(item.sessionMode?{sessionMode:item.sessionMode as "visible"|"headless"}:{}),
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
  for(const craft of craftNames){
    if(configured.servers[craft] || Object.keys(configured.servers).length>=MAX_SERVERS || process.env["AWSM_AUTO_"+craft.toUpperCase()]==="0")continue;
    let executable=await discoverExecutable(craft+"-cli",process.env.PATH??"",process.platform);
    if(!executable&&nativeSetupEnabled()){
      const app=await findNativeApp(craft);
      executable=await installedCli(craft,app)??(app?managedCli(craft):undefined);
    }
    if(executable)configured.servers[craft]={command:executable,nativeManaged:true,args:craft==="solidcraft"?["mcp","--param-check","strict"]:["mcp"],allowedTools:[...adapters[craft].tools]};
  }
  return configured;
}
/**
 * Discover installed, executable Craft CLIs without launching programs,
 * running a shell, downloading dependencies, or searching relative paths.
 * Known Craft providers are autodiscovered; other MCPs need explicit configuration.
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
const allowed=(cfg:ServerConfig,tool:string)=>cfg.allowedTools.includes("*")||cfg.allowedTools.includes(tool);

export class McpGateway {
  private readonly connections=new Map<string,Connection>();
  private readonly pending=new Map<string,Promise<Connection>>();
  private configuration:Promise<ConfigFile>|undefined;
  private readonly preparedModes=new Map<string,"visible"|"headless">();
  private readonly launchKeys=new Map<string,string>();
  private readonly deliveredGuides=new Set<string>();
  private readonly guidance=new Map<string,unknown>();
  private readonly activeCalls=new Map<string,number>();
  private readonly refreshing=new Map<string,Promise<void>>();
  private readonly needsInspection=new Map<string,"reconnected"|"uncertain">();

  private async getConfig(target?:string):Promise<ConfigFile> {
    let current=await(this.configuration??=config());
    if(target&&isCraft(target)&&!current.servers[target])current=await(this.configuration=config());
    return current;
  }
  private async connect(name:string,cfg:ServerConfig):Promise<Connection>{
    if(isCraft(name))cfg=await this.resolveSession(name,cfg);
    const launchKey=JSON.stringify([cfg.command,cfg.args,cfg.cwd,cfg.env]);
    await this.refreshing.get(name);
    const previousKey=this.launchKeys.get(name);
    if(previousKey&&previousKey!==launchKey){
      const previous=JSON.parse(previousKey) as [string,string[]];
      const canReconnect=isCraft(name)&&cfg.nativeManaged&&previous[0]===cfg.command&&attachedEndpoint(name,previous[1])&&attachedEndpoint(name,cfg.args??[]);
      if(!canReconnect)throw new Error("Bridge already connected in another mode; restart AWSM to switch sessions.");
      if((this.activeCalls.get(name)??0)>1||this.pending.has(name))throw new Error("Craft connection changed while a request is active. Wait for it to settle, then inspect through craft_prepare; do not replay mutations.");
      const old=this.connections.get(name);
      const refresh=(async()=>{
        this.connections.delete(name);this.launchKeys.delete(name);this.needsInspection.set(name,"reconnected");
        for(const key of this.deliveredGuides)if(key.startsWith(name+":"))this.deliveredGuides.delete(key);
        if(old)await old.client.close();
      })();
      this.refreshing.set(name,refresh);
      try{await refresh;}finally{this.refreshing.delete(name);}
    }
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
        this.launchKeys.delete(name);
        await transport.close().catch(()=>{});
        throw error;
      }
    })();
    this.launchKeys.set(name,launchKey);
    this.pending.set(name,promise);
    try{return await promise;}
    finally{this.pending.delete(name);}
  }
  private async resolveSession(craft:Craft,cfg:ServerConfig):Promise<ServerConfig>{
    const args=cfg.args??[];
    const explicit=attachedEndpoint(craft,args);
    const requested=this.preparedModes.get(craft)??cfg.sessionMode??"visible";
    if(cfg.nativeManaged&&!await fs.access(cfg.command).then(()=>true).catch(()=>false))cfg={...cfg,command:await ensureNativeCli(craft)};
    if(explicit){if(args.includes("--headless"))throw new Error("Conflicting attached and headless flags.");endpoint(explicit);if(requested==="headless")throw new Error("Configured bridge is attached; refusing headless substitution.");
      if(adapters[craft].flag==="--bridge"){
        const port=endpoint(explicit).split(":")[1];
        const normalized=args.map((arg,i)=>arg.startsWith("--bridge=")?"--bridge="+port:args[i-1]==="--bridge"?port:arg);
        return {...cfg,args:normalized};
      }
      return cfg;}
    if(requested==="headless")return {...cfg,args:craft==="solidcraft"&&!args.includes("--headless")?[...args,"--headless"]:args};
    const observed=await activeEndpoint(craft);
    if(path.basename(cfg.command).toLowerCase().replace(/\.exe$/,"")!==craft+"-cli" || args.join(" ")!==(craft==="solidcraft"?"mcp --param-check strict":"mcp"))throw new Error("Configure "+adapters[craft].flag+" explicitly for this custom bridge; access-root arguments are preserved.");
    const port=process.env["AWSM_"+craft.toUpperCase()+"_ENDPOINT"]?observed:await ensureVisibleNative(craft);
    if(!port)throw new Error("No verified active endpoint for "+craft+". No headless fallback was started.");
    return {...cfg,args:attachedArgs(craft,port)};
  }
  async prepare(input:{craft:Craft;task:"create"|"edit"|"inspect";briefId?:string;headless?:boolean}) {
    const choices=input.task==="inspect"?undefined:confirmedBrief(input.briefId);
    if(choices && !choices.route.crafts.includes(input.craft))throw new Error("This Craft is not part of the user's confirmed choices.");
    if(choices && Boolean(input.headless)!==(choices.session==="separate"))throw new Error("Session mode does not match the user's confirmed choice.");
    const cfg=await this.getConfig(input.craft);
    const original=cfg.servers[input.craft];
    if(!original)throw new Error("Craft app is not installed or its AWSM integration is disabled: "+input.craft+". Install the desktop app once; AWSM prepares its connector automatically.");
    const previous=this.preparedModes.get(input.craft);
    this.preparedModes.set(input.craft,input.headless?"headless":"visible");
    let resolved:ServerConfig;
    try{resolved=await this.resolveSession(input.craft,original);}catch(e){if(previous)this.preparedModes.set(input.craft,previous);else this.preparedModes.delete(input.craft);throw e;}
    const mode=attachedEndpoint(input.craft,resolved.args??[])?"attached":"headless";
    const current=await this.connect(input.craft,resolved);
    const adapter=adapters[input.craft];
    const inspect=adapter.inspect;
    const snapshot=await this.call({server:input.craft,tool:inspect,arguments:input.craft==="figcraft"?{depth:2}:{}});
    if(snapshot.isError)throw new Error("Active document inspection failed: "+JSON.stringify(snapshot.content));
    const names:readonly string[]=adapter.focused;
    const uiSkill=input.task==="inspect"?"awsm-visual-qa":choices!.route.uiSkill;
    const guideKey=input.craft+":"+input.task+":"+uiSkill;
    if(!this.guidance.has(guideKey)) {
      if(input.craft==="solidcraft" && current.tools.has("skill_reference")) {
        const skill=input.task==="edit"?"solidcraft-editing":input.task==="inspect"?"solidcraft-checking":"solidcraft-modeling";
        const result=await this.call({server:input.craft,tool:"skill_reference",arguments:{skill}});
        if(!result.isError)this.guidance.set(guideKey,result.content);
      } else if(input.craft==="figcraft") {
        const file=fileURLToPath(new URL("../../skills/"+uiSkill+"/SKILL.md",import.meta.url));
        this.guidance.set(guideKey,await fs.readFile(file,"utf8"));
      }
    }
    return {craft:input.craft,mode,task:input.task,choices,executionGuide:choices?await designGuidance({phase:adapters[input.craft].phase,briefId:input.briefId}):undefined,document:snapshot.content,skillGuidance:this.guidance.get(guideKey),
      instructions:current.client.getInstructions(),
      versions:await versionDiagnostics(input.craft,original.command),
      session:{mode,endpoint:attachedEndpoint(input.craft,resolved.args??[])??null,verifiedBy:inspect},
      visibility:"Attached means edits reach the open app; it does not guarantee a moving mouse cursor. Use native selection/UI inspection and screenshots where available; do not fake pointer motion or move the viewport without a task reason.",
      tools:names.flatMap(name=>current.tools.has(name)?[current.tools.get(name)!]:[]),
      guidance:input.craft==="figcraft"?
        "Reuse the inspected active document and its components/styles. Use native editable text and auto layout. Inspect only target nodes; batch related edits using the returned schema, then screenshot and correct. Do not open or replace a document. Reinspect before writes if the user switched tabs.":
        input.craft==="materialcraft"||input.craft==="texturecraft"?"Preserve the active session. Inspect the graph/layers and native UI, use actual command schemas, make staged changes and inspect the viewport. Do not create a new package/project or export without task scope.":
        input.craft==="solidcraft"?"Preserve the active design. Use named parametric features and staged batches; inspect, measure and screenshot after edits. Do not open or replace a design.":
        "Preserve the active drawing. Read units, layers and measured geometry before editing; inspect and render after changes.",
      note:"Only relevant schemas are returned; use bridge_call for these operations. Preparation is read-only. A lost mutation reply must be inspected before retrying."};
  }
  async list(input:{server?:string;connect?:boolean}={}){
    const cfg=await this.getConfig(input.server);
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
        const current=await this.connect(name,item);
        results.push({name,status:"connected",allowedTools:item.allowedTools,
          tools:[...current.tools.values()].map(x=>({name:x.name,description:x.description,inputSchema:x.inputSchema,
            annotations:x.annotations}))});
      }catch(error){
        results.push({name,status:"error",allowedTools:item.allowedTools,
          error:error instanceof Error?error.message:String(error)});
      }
    }
    return {connectedThrough:"awsm",configuredServers:selected.length,servers:results,
      note:"Installed Craft apps and connectors are discovered without starting providers. When connecting, AWSM prepares a missing official CLI and opens the selected app if it is closed. Open documents are reused and never replaced or restarted automatically. All Craft connections default to the active app; explicit headless mode is required for separate work. Set AWSM_NATIVE_SETUP=0 to disable automatic native setup. Other MCPs require configuration."};
  }
  async call(input:BridgeCall){
    this.activeCalls.set(input.server,(this.activeCalls.get(input.server)??0)+1);
    try{return await this.dispatch(input);}finally{this.activeCalls.set(input.server,(this.activeCalls.get(input.server)??1)-1);}
  }
  private async dispatch(input:BridgeCall){
    const readTools=["inspect_ui","inspect_document","get_node","inspect_design","inspect_drawing","query_entities","find_text","list_commands","describe_command","skill_reference","measure","body_topology","screenshot","render","running","pending","session_inspect","command_list","library_list","ui_inspect","view_screenshot","ui_screenshot","viewport_screenshot","view_render","viewport_render"];
    const cadAnalysis=input.server==="cadcraft" && input.tool==="execute" && ["loops","shapes"].includes(String(input.arguments?.command));
    const mutation=isCraft(input.server) && !readTools.includes(input.tool) && !cadAnalysis;
    const choices=mutation?authorizeCraft(input.server,input.briefId):undefined;
    const cfg=await this.getConfig(input.server);
    const server=cfg.servers[input.server];
    if(!server)throw new Error("Bridge is not configured: "+input.server);
    if(!allowed(server,input.tool))throw new Error("Tool is not on the allowlist: "+input.server+"/"+input.tool);
    if(!plain(input.arguments??{}))throw new Error("Tool arguments must be a JSON object.");
    if(choices && isCraft(input.server)){
      const resolved=await this.resolveSession(input.server,server);
      const mode=attachedEndpoint(input.server,resolved.args??[])?"visible":"separate";
      if(mode!==(choices.session??"visible"))throw new Error("Session mode does not match the brief. Use craft_prepare with the requested explicit mode.");
    }
    const connection=await this.connect(input.server,server);
    if(mutation&&this.needsInspection.has(input.server))throw new Error(this.needsInspection.get(input.server)==="uncertain"?
      "A previous native operation has uncertain status. No new mutation was sent. Inspect the current document through craft_prepare before deciding what to do; do not replay the timed-out operation.":
      "Craft reconnected automatically. Inspect its current document through craft_prepare before editing; no mutation was sent.");
    if(!connection.tools.has(input.tool))throw new Error("Tool is unavailable on "+input.server+": "+input.tool);
    let autoGuide:Awaited<ReturnType<typeof designGuidance>>|undefined;
    const guideKey=input.server+":"+input.briefId+":"+(isCraft(input.server)?adapters[input.server].phase:"");
    if(isCraft(input.server) && input.briefId && !this.deliveredGuides.has(guideKey)) {
      // Load before dispatch: a guidance error must never mask an already executed mutation.
      autoGuide=await designGuidance({phase:adapters[input.server].phase,briefId:input.briefId});
    }
    // Preserve native fields, content ordering, images and errors; append context once per task.

    const result=await timeout(connection.client.callTool({
      name:input.tool,arguments:input.arguments??{},
    }),60000,"Bridge call "+input.server+"/"+input.tool).catch(error=>{
      if(mutation&&/timed out|timeout|transport closed|connection closed/i.test(String(error))){
        this.needsInspection.set(input.server,"uncertain");
        throw new Error("Native operation status is uncertain. Inspect through craft_prepare before any further edit; do not retry the mutation. "+String(error));
      }
      throw error;
    });
    if(isCraft(input.server)&&input.tool===adapters[input.server].inspect&&!result.isError)this.needsInspection.delete(input.server);
    if("content" in result && Array.isArray(result.content)){
      if(mutation&&result.isError&&/timed out|timeout|still running|transport closed/i.test(result.content.filter(c=>c.type==="text").map(c=>c.text).join("\n")))this.needsInspection.set(input.server,"uncertain");
      if(autoGuide && !result.isError){this.deliveredGuides.add(guideKey);return {...result,content:[...result.content,{type:"text" as const,text:JSON.stringify({awsmGuidance:autoGuide})}]} as CallToolResult;}
      return result as CallToolResult;
    }
    return {content:[{type:"text" as const,text:JSON.stringify(result)}]};
  }
  async close(){
    const active=[...this.connections.values()];
    this.connections.clear();
    this.launchKeys.clear();
    this.preparedModes.clear();
    this.deliveredGuides.clear();
    this.needsInspection.clear();
    await Promise.all(active.map(x=>x.client.close().catch(()=>{})));
  }
}
