import { findIcons } from "./icons.js";
import { findImages, type ImageProvider } from "./images.js";

type SearchResult={ query:string; result?:unknown; error?:string; cached?:boolean };
const cache=new Map<string,{ expires:number; value:unknown }>();
const TTL=5*60*1000;
const cacheLimit=48;
async function cached(key:string,run:()=>Promise<unknown>):Promise<{value:unknown;cached:boolean}> {
  const now=Date.now();
  const existing=cache.get(key);
  if(existing && existing.expires>now)return {value:existing.value,cached:true};
  const value=await run();
  if(cache.size>=cacheLimit)cache.delete(cache.keys().next().value!);
  cache.set(key,{expires:now+TTL,value});
  return {value,cached:false};
}

export async function findDesignAssets(input:{
  iconQueries?:string[]; imageQueries?:string[];
  iconFamily?:string; imageProvider?:ImageProvider;
  iconLimit?:number; imageLimit?:number;
}) {
  const clean=(items:string[]|undefined)=>[...new Set((items??[]).map(s=>s.trim()).filter(Boolean))];
  const icons=clean(input.iconQueries), images=clean(input.imageQueries);
  if(!icons.length&&!images.length)throw new Error("Provide at least one icon or image query.");
  if(icons.length>4||images.length>4)throw new Error("Max 4 icon queries and 4 image queries per batch.");
  if([...icons,...images].some(q=>q.length>160))throw new Error("Query exceeds 160 characters.");
  const iconFamily=input.iconFamily??"lucide";
  if(!/^[a-z0-9_.-]+$/i.test(iconFamily))throw new Error("Invalid Iconify family.");
  const iconLimit=input.iconLimit??5,imageLimit=input.imageLimit??4;
  if(!Number.isInteger(iconLimit)||iconLimit<1||iconLimit>20||!Number.isInteger(imageLimit)||imageLimit<1||imageLimit>10)
    throw new Error("Invalid per-query limit.");
  const provider=input.imageProvider??"openverse";
  if(!["openverse","pexels","unsplash","picsum"].includes(provider))throw new Error("Unsupported image provider.");
  async function resolve(query:string,type:"icon"|"image"):Promise<SearchResult> {
    try {
      const key=JSON.stringify([type,query,type==="icon"?iconFamily:provider,type==="icon"?iconLimit:imageLimit]);
      const result=await cached(key,()=>type==="icon"?
        findIcons({query,prefix:iconFamily,limit:iconLimit}):
        findImages({query,provider,limit:imageLimit}));
      return {query,result:result.value,cached:result.cached};
    }catch(error){return {query,error:error instanceof Error?error.message:String(error)};}
  }
  const [iconMatches,imageMatches]=await Promise.all([
    Promise.all(icons.map(query=>resolve(query,"icon"))),
    Promise.all(images.map(query=>resolve(query,"image"))),
  ]);
  return {
    iconMatches,imageMatches,
    cacheTtlSeconds:300,
    complete:[...iconMatches,...imageMatches].every(r=>!r.error),
    note:"Batch discovery returns candidates, not downloaded or licensed assets. Verify rights and visual fit before use.",
  };
}
