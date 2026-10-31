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
// CADCraft architectural drafting fixtures: a room outline in millimeters.
server.registerTool("inspect_drawing",{
  description:"Inspect the active CADCraft drawing without editing it.",
  inputSchema:{entities:z.boolean().optional(),limit:z.number().optional()},
},async()=>({content:[{type:"text",text:JSON.stringify({
  extents:{min:[0,0],max:[10000,8000]},
  layers:["A-WALL","A-DOOR","A-ANNO"],
  entities:4,units:"mm",
})}]}));
server.registerTool("query_entities",{
  description:"Read CADCraft entities for a named drawing layer.",
  inputSchema:{layer:z.string().optional(),type:z.string().optional(),limit:z.number().optional(),offset:z.number().optional()},
},async({layer})=>({content:[{type:"text",text:JSON.stringify({
  count:layer==="A-WALL"?1:0,
  returned:layer==="A-WALL"?1:0,
  entities:layer==="A-WALL"?[{type:"LWPOLYLINE",layer:"A-WALL",
    closed:true,vertices:[[0,0],[10000,0],[10000,8000],[0,8000]]}]:[],
})}]}));
server.registerTool("find_text",{
  description:"Read room labels and drawing annotations.",
  inputSchema:{contains:z.string().optional(),layer:z.string().optional(),limit:z.number().optional()},
},async()=>({content:[{type:"text",text:JSON.stringify({texts:[{text:"LIVING",layer:"A-ANNO"}]})}]}));
server.registerTool("render",{
  description:"Render the CADCraft floor plan as an MCP PNG image.",
  inputSchema:{width:z.number().optional(),height:z.number().optional()},
},async()=>({content:[{type:"image",mimeType:"image/png",
  data:"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg=="}]}));
server.registerTool("execute",{
  description:"Run CADCraft drawing analysis command without inventing geometry.",
  inputSchema:{command:z.string(),params:z.record(z.string(),z.unknown()).optional()},
},async({command})=>({content:[{type:"text",text:JSON.stringify({
  command,closedLoops:command==="loops"?1:undefined,
})}]}));
await server.connect(new StdioServerTransport());
