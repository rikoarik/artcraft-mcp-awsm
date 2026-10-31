import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "node:fs";

const server=new McpServer({name:"awsm-test-child",version:"1.0.0"});
server.registerTool("echo",{
  description:"Return the requested text for bridge integration tests.",
  inputSchema:{value:z.string()},
}, async ({value})=>({content:[{type:"text",text:"echo:"+value}]}));
server.registerTool("forbidden",{
  description:"Tool intentionally excluded by the parent allowlist.",
  inputSchema:{},
}, async()=>({content:[{type:"text",text:"should not run"}]}));
server.registerTool("list_commands",{
  description:"Mock SolidCraft command catalog for auto-discovery integration.",
  inputSchema:{filter:z.string().optional()},
}, async ({filter})=>({content:[{type:"text",text:JSON.stringify({commands:["solid.box"],filter:filter??null})}]}));
server.registerTool("export",{
  description:"Mock SolidCraft OBJ export, writing to the caller-approved fixture path.",
  inputSchema:{path:z.string(),format:z.string().optional()},
},async ({path,format})=>{
  if(format!=="obj")return {isError:true,content:[{type:"text",text:"unsupported format"}]};
  fs.writeFileSync(path,"# SolidCraft exported geometry\nv 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3\n");
  return {content:[{type:"text",text:JSON.stringify({path,format})}]};
});
server.registerTool("screenshot",{
  description:"Mock SolidCraft model screenshot returned via MCP image block.",
  inputSchema:{source:z.string().optional(),view:z.string().optional(),width:z.number().optional(),height:z.number().optional(),grid:z.boolean().optional(),axes:z.boolean().optional()},
},async ()=>({
  content:[{type:"image",mimeType:"image/png",
  data:"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg=="}]
}));
server.registerTool("run_command",{
  description:"Mock FigCraft file.placeImage into document.",
  inputSchema:{command:z.string(),params:z.record(z.string(),z.unknown())},
},async ({command,params})=>{
  if(command!=="file.placeImage"||typeof params.path!=="string"||!fs.existsSync(params.path))
    return {isError:true,content:[{type:"text",text:"missing valid PNG input"}]};
  return {content:[{type:"text",text:JSON.stringify({placed:true,name:params.name})}]};
});
await server.connect(new StdioServerTransport());
