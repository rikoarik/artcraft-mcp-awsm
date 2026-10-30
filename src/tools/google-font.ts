import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { request } from "../util.js";

type Face={ style:string; weight:string; subset:string; url:string };
const familyPattern=/^[a-z][a-z0-9 .'-]{1,78}$/i;
const stylePattern=/^(normal|italic)$/;
const validFace=(u:URL)=>u.protocol==="https:" && u.hostname==="fonts.gstatic.com" && !u.username && !u.password && u.port==="";
function extract(css:string):Face[] {
  if(css.length>500_000)throw new Error("Google Fonts CSS response exceeds 500 KB");
  const out:Face[]=[];
  // Google Fonts labels subsets in comments immediately preceding @font-face.
  const re=/(?:\/\*\s*([^*]+?)\s*\*\/\s*)?@font-face\s*\{([^}]+)\}/g;
  for(const m of css.matchAll(re)) {
    const body=m[2];
    const get=(prop:string)=>body.match(new RegExp("(?:^|;)\\s*"+prop+"\\s*:\\s*([^;]+)","im"))?.[1].trim()??"";
    const found=body.match(/url\(\s*['"]?(https:\/\/fonts\.gstatic\.com\/[^)'"\s]+)['"]?\s*\)\s*format\(\s*['"]?woff2['"]?\s*\)/i);
    if(!found)continue;
    const url=new URL(found[1]);
    if(!validFace(url))continue;
    out.push({style:get("font-style") || "normal",weight:get("font-weight") || "400",
      subset:m[1]?.trim() || "unknown",url:url.toString()});
  }
  return out;
}

export async function googleFont(input: {
  family:string; action?:"inspect"|"install"; weights?:number[];
  style?:"normal"|"italic"; dir?:string; overwrite?:boolean;
}) {
  const family=input.family.trim();
  if(!familyPattern.test(family) || family.includes(".."))throw new Error("Invalid Google Fonts family name.");
  const weights=[...new Set(input.weights??[400,700])].sort((a,b)=>a-b);
  if(!weights.length || weights.length>8 || weights.some(w=>!Number.isInteger(w)||w<100||w>900||w%100!==0))
    throw new Error("weights must be 1..8 unique multiples of 100 from 100..900.");
  const style=input.style??"normal";
  if(!stylePattern.test(style))throw new Error("Unsupported font style.");
  const familyParam=style==="italic" ?
    family + ":ital,wght@" + weights.map(w=>"1,"+w).join(";") :
    family + ":wght@" + weights.join(";");
  const cssUrl="https://fonts.googleapis.com/css2?family="+encodeURIComponent(familyParam)+"&display=swap";
  const res=await request(cssUrl,{headers:{"User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36","Accept":"text/css"},timeoutMs:15000});
  const css=await res.text();
  const faces=extract(css);
  if(!faces.length)throw new Error("No WOFF2 faces found for requested family/styles; check Google Fonts availability.");
  const chosen=weights.map(w=>{
    const candidate=faces.filter(f=>f.style===style && (f.weight===String(w) || f.weight.split(/\s+/).map(Number).some(Number.isNaN)===false && (()=>{const v=f.weight.split(/\s+/).map(Number);return v.length===2 && w>=v[0] && w<=v[1];})()));
    return candidate.find(f=>f.subset==="latin") ?? candidate.find(f=>f.subset==="unknown") ?? candidate[0];
  });
  const found=chosen.filter((f):f is Face=>Boolean(f));
  if(found.length!==weights.length)throw new Error("Some requested weights were not served. Check the Google Fonts family or styles.");
  if((input.action??"inspect")==="inspect")
    return {family,weights,style,cssUrl,fonts:found.map((f,i)=>({weight:weights[i],subset:f.subset,format:"woff2",remoteUrl:f.url})),
      licenseStatus:"not-verified",sourcePage:"https://fonts.google.com/specimen/"+encodeURIComponent(family.replace(/ /g,"+")),
      note:"Inspect only; no local files written. Verify the current font license before redistribution."};

  const dir=path.resolve(input.dir??"./public/fonts");
  await fs.mkdir(dir,{recursive:true});
  const realDir=await fs.realpath(dir);
  const slug=family.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const files: Array<{weight:number;publicName:string;bytes:number;sha256:string;status:"created"|"unchanged"|"conflict"|"updated"}>=[];
  const cache=new Map<string,Buffer>();
  for(let i=0;i<found.length;i++) {
    const face=found[i], weight=weights[i];
    let bytes=cache.get(face.url);
    if(!bytes) {
      const u=new URL(face.url);
      if(!validFace(u))throw new Error("Font URL is not trusted.");
      const response=await request(u,{timeoutMs:15000,redirect:"error"});
      const len=Number(response.headers.get("content-length")??"0");
      if(len>5*1024*1024)throw new Error("WOFF2 font too large.");
      const reader=response.body?.getReader();
      if(!reader)throw new Error("Empty font response.");
      let size=0;const parts:Uint8Array[]=[];
      try {
        while(true) {const {value,done}=await reader.read();if(done)break;size+=value.byteLength;
          if(size>5*1024*1024)throw new Error("WOFF2 font too large.");parts.push(value);}
      }finally{await reader.cancel().catch(()=>{});}
      bytes=Buffer.concat(parts);
      if(bytes.toString("ascii",0,4)!=="wOF2")throw new Error("Unexpected font file signature.");
      cache.set(face.url,bytes);
    }
    const filename=slug+"-"+style+"-"+weight+".woff2";
    const target=path.join(realDir,filename);
    const digest=crypto.createHash("sha256").update(bytes).digest("hex");
    let status:"created"|"unchanged"|"conflict"|"updated"="created";
    try {
      const prev=await fs.readFile(target);
      if(prev.equals(bytes))status="unchanged";
      else status=input.overwrite?"updated":"conflict";
    }catch(err){if((err as NodeJS.ErrnoException).code!=="ENOENT")throw err;}
    if(status==="created"||status==="updated")await fs.writeFile(target,bytes,{flag:status==="created"?"wx":"w"});
    files.push({weight,publicName:filename,bytes:bytes.length,sha256:digest,status});
  }
  const cssLocal=files.filter(f=>f.status!=="conflict").map(f=>
    '@font-face { font-family: "'+family+'"; src: url("./'+f.publicName+'") format("woff2"); font-style: '+style+
    '; font-weight: '+f.weight+'; font-display: swap; }').join("\n");
  return {family,style,files,css:cssLocal,directory:realDir,
    licenseStatus:"not-verified",sourcePage:"https://fonts.google.com/specimen/"+encodeURIComponent(family.replace(/ /g,"+")),
    complete:files.every(f=>f.status!=="conflict"),
    note:"Latin subset preferred when available. Review font license/attribution, glyph coverage and licensing before shipping."};
}
