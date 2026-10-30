import fs from "node:fs/promises";
import path from "node:path";

type Framework = "nextjs"|"react"|"vue"|"nuxt"|"svelte"|"flutter"|"expo"|"react-native"|"android"|"unknown";
const safeFiles = ["package.json","pubspec.yaml","settings.gradle.kts","settings.gradle","build.gradle.kts","app/build.gradle.kts","vite.config.ts","tailwind.config.ts","tailwind.config.js","components.json"];
const dirs = ["src","app","pages","components","src/components","src/app","src/pages","assets","public","public/fonts","public/icons","src/assets","lib","lib/core","lib/features","android","ios"];
const maxBytes=100*1024;
const isInside=(root:string,p:string)=>p===root || (!path.relative(root,p).startsWith(".."+path.sep) && path.relative(root,p)!==".." && !path.isAbsolute(path.relative(root,p)));

async function readSafe(root:string,file:string):Promise<string|null> {
  const target=path.join(root,file);
  try {
    const real=await fs.realpath(target);
    if(!isInside(root,real))return null;
    const stat=await fs.stat(real);
    if(!stat.isFile() || stat.size>maxBytes)return null;
    return await fs.readFile(real,"utf8");
  }catch(err) {
    if((err as NodeJS.ErrnoException).code==="ENOENT")return null;
    throw err;
  }
}

export async function inspectUiProject(input:{ root?:string; maxEntries?:number }) {
  const root=await fs.realpath(path.resolve(input.root??"."));
  const maxEntries=input.maxEntries??150;
  if(!Number.isInteger(maxEntries)||maxEntries<10||maxEntries>400)throw new Error("maxEntries must be 10..400");
  const inspected:Record<string,string>={};
  for (const file of safeFiles) {
    const data=await readSafe(root,file);
    if(data!==null)inspected[file]=data;
  }
  const pkg=inspected["package.json"];
  let dependencies:Record<string,string>={};
  let scripts:Record<string,string>={};
  if(pkg) {
    const parsed=JSON.parse(pkg) as Record<string,unknown>;
    const dep=(v:unknown)=>v && typeof v==="object"&&!Array.isArray(v) ? v as Record<string,string> : {};
    dependencies={...dep(parsed.dependencies),...dep(parsed.devDependencies)};
    scripts=dep(parsed.scripts);
  }
  const has=(p:string)=>Object.prototype.hasOwnProperty.call(dependencies,p);
  const framework:Framework=inspected["pubspec.yaml"]?"flutter":
    has("next")?"nextjs":has("expo")?"expo":has("react-native")?"react-native":
    has("nuxt")?"nuxt":has("vue")?"vue":has("@sveltejs/kit")?"svelte":
    (inspected["settings.gradle.kts"]||inspected["settings.gradle"])?"android":
    has("react")?"react":"unknown";
  const uiPackages=Object.keys(dependencies).filter(k=>/radix|shadcn|lucide|icon|motion|framer|gsap|tailwind|mui|chakra|antd|victory|recharts|tanstack|bloc|zustand|riverpod|go_router/i.test(k)).slice(0,60);
  const availableDirs:string[]=[];
  const samples:Record<string,string[]>={};
  for(const dir of dirs) {
    const full=path.join(root,dir);
    try {
      const real=await fs.realpath(full);
      if(!isInside(root,real))continue;
      const stat=await fs.stat(real); if(!stat.isDirectory())continue;
      availableDirs.push(dir);
      samples[dir]=(await fs.readdir(real,{withFileTypes:true})).filter(x=>!x.name.startsWith(".") && x.name!=="node_modules" && x.name!=="build").slice(0,Math.min(12,maxEntries)).map(x=>x.isDirectory()?x.name+"/":x.name);
    }catch(err){if((err as NodeJS.ErrnoException).code!=="ENOENT")throw err;}
  }
  return {
    root,framework, filesFound:Object.keys(inspected),dirs:availableDirs,examples:samples,
    uiPackages, scripts:Object.keys(scripts).filter(k=>["dev","start","build","test","lint"].includes(k)).reduce((a,k)=>({...a,[k]:scripts[k]}),{}),
    reuseFirst:availableDirs.filter(d=>/components|assets|public|features/.test(d)),
    note:"Shallow, bounded inspection only. Do not assume unused components or styles are absent from a project.",
  };
}
