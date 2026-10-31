import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

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
await server.connect(new StdioServerTransport());
