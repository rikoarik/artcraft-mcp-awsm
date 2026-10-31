import fs from "node:fs/promises";
import path from "node:path";
import type { McpGateway } from "./mcp-gateway.js";

type ToolResult = { isError?: boolean; content?: Array<Record<string,unknown>> };
type PublishArgs = {
  projectRoot: string;
  name: string;
  figcraft?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    parent?: string | number;
  };
};
const MAX_OBJ_BYTES=50*1024*1024;
const MAX_PNG_BYTES=16*1024*1024;
const PNG_HEADER=Buffer.from([137,80,78,71,13,10,26,10]);
const PNG_MIME="image/png";
const ROOT_COMPONENT="assets";
function checkResponse(result: unknown,label:string):ToolResult {
  if(!result || typeof result!=="object")throw new Error(label+": empty MCP response.");
  const r=result as ToolResult;
  if(r.isError)throw new Error(label+": "+r.content?.filter(x=>x.type==="text").map(x=>String(x.text)).join("; "));
  return r;
}
function isUnder(root:string,p:string){
  const relative=path.relative(root,p);
  return relative!=="" && relative!==".." && !relative.startsWith(".."+path.sep) && !path.isAbsolute(relative);
}
async function verifyOutputRoot(root:string) {
  const real=await fs.realpath(root);
  const stats=await fs.stat(real);
  if(!stats.isDirectory())throw new Error("projectRoot must be an existing directory.");
  // Do not follow symlinks in any target folder: avoids writing outside the project.
  const parts=["public",ROOT_COMPONENT,"3d"];
  let current=real;
  for(const part of parts){
    current=path.join(current,part);
    try {
      const st=await fs.lstat(current);
      if(st.isSymbolicLink()||!st.isDirectory())throw new Error("Output directory must be a real directory: "+current);
    }catch(e) {
      if((e as NodeJS.ErrnoException).code!=="ENOENT")throw e;
      await fs.mkdir(current);
    }
  }
  return {root:real,out:current};
}
function pngFromResult(r:ToolResult):Buffer {
  const image=r.content?.find(x=>x.type==="image"&&x.mimeType===PNG_MIME);
  if(!image||typeof image.data!=="string")throw new Error("SolidCraft did not provide PNG image bytes.");
  if(image.data.length>MAX_PNG_BYTES*1.4)throw new Error("SolidCraft screenshot exceeds 16 MiB.");
  const buf=Buffer.from(image.data,"base64");
  if(buf.length>MAX_PNG_BYTES||buf.length<33||!buf.subarray(0,8).equals(PNG_HEADER))
    throw new Error("Invalid or oversized SolidCraft PNG.");
  const width=buf.readUInt32BE(16),height=buf.readUInt32BE(20);
  if(!width||!height||width>4096||height>4096)throw new Error("Unsupported PNG dimensions.");
  return buf;
}
function validateObj(obj:Buffer){
  if(!obj.length||obj.length>MAX_OBJ_BYTES)throw new Error("SolidCraft OBJ is missing or exceeds 50 MiB.");
  const s=obj.toString("utf8");
  if(!/^v\s+[-+0-9.eE]+\s+[-+0-9.eE]+\s+[-+0-9.eE]+/m.test(s)||!/^f\s+\S+\s+\S+\s+\S+/m.test(s))
    throw new Error("Exported OBJ has no valid vertices and faces.");
  // OBJ is kept as an asset, not evaluated. Reject external material refs and relative path directives.
  // Generated material/texture resources must be reviewed/copied separately when needed.
  if(/^\s*(?:mtllib|call|csh)\s+/mi.test(s))throw new Error("OBJ references external material or script files; use an isolated geometry export.");
}
export async function publish3dAsset(gateway:McpGateway,args:PublishArgs){
  const name=args.name;
  if(!/^[a-z][a-z0-9-]{0,49}$/.test(name))throw new Error("name must be a lower-case kebab-case asset name (max 50 chars).");
  const {root,out}=await verifyOutputRoot(args.projectRoot);
  const assetDir=path.join(out,name);
  if(!isUnder(root,assetDir))throw new Error("Asset path escapes projectRoot.");
  // Never touch an existing package, especially one the user might have edited.
  await fs.mkdir(assetDir);
  const objPath=path.join(assetDir,"model.obj");
  const pngPath=path.join(assetDir,"preview.png");
  let completed=false;
  try {
    // Export to a new local package path. Requires SolidCraft's own file-access policy
    // to grant access; never weaken the downstream policy automatically.
    checkResponse(await gateway.call({server:"solidcraft",tool:"export",
      arguments:{path:objPath,format:"obj"}}),"SolidCraft OBJ export");
    const model=await fs.readFile(objPath);
    validateObj(model);
    const screenshot=checkResponse(await gateway.call({server:"solidcraft",tool:"screenshot",
      arguments:{source:"model",view:"iso",width:1024,height:768,grid:false,axes:false}}),"SolidCraft screenshot");
    const png=pngFromResult(screenshot);
    await fs.writeFile(pngPath,png,{flag:"wx"});
    completed=true;
  }finally{
    if(!completed)await fs.rm(assetDir,{recursive:true,force:true});
  }
  let figcraft:{status:string;message:string;tool?:string} = {
    status:"not-requested",
    message:"Set figcraft placement options to place a PNG image layer in the connected FigCraft document."
  };
  if(args.figcraft){
    try{
      const params:Record<string,unknown>={path:pngPath,name:name+" 3D preview"};
      for(const k of ["x","y","width","height","parent"] as const){
        const value=args.figcraft[k];
        if(value!==undefined)params[k]=value;
      }
      checkResponse(await gateway.call({server:"figcraft",tool:"run_command",
        arguments:{command:"file.placeImage",params}}),"FigCraft image placement");
      figcraft={status:"placed",message:"PNG preview placed as an image layer in the connected FigCraft document.",tool:"file.placeImage"};
    }catch(e){
      figcraft={status:"not-placed",message:e instanceof Error?e.message:String(e),
        tool:"file.placeImage"};
    }
  }
  const relative="/assets/3d/"+name;
  return {
    status:"published",
    source:"SolidCraft current model",
    destination:root,
    asset:{name,model:objPath,preview:pngPath,
      webModelUrl:relative+"/model.obj",webPreviewUrl:relative+"/preview.png",
      interactive:true,format:"obj"},
    figcraft,
    website:{
      recommendation:"Use the existing website framework and an OBJ-capable browser renderer such as Three.js OBJLoader. Adapt camera, scale, geometry material and lighting to the SolidCraft style; do not flatten the model to PNG.",
      reactThreeFiber:"Load the OBJ asset from '"+relative+"/model.obj' using three/examples/jsm/loaders/OBJLoader.js (or three-stdlib), render inside a Canvas, and provide an accessible static PNG fallback.",
      production:"OBJ is a geometry interchange format, not a fully material-preserving production web asset. For optimized delivery, use an existing trusted offline converter (e.g. Blender) to produce GLB and verify its materials, triangulation, size, compression and mobile performance.",
      fallback:relative+"/preview.png",
    },
    note:"FigCraft image layers are 2D PNG previews, not native editable 3D objects. The editable 3D source stays in SolidCraft."
  };
}
