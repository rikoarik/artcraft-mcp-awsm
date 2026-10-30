import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";

const PNG_SIGNATURE = Buffer.from([137,80,78,71,13,10,26,10]);
const MAX_COMPRESSED_BYTES = 25 * 1024 * 1024;
const MAX_PIXELS = 12_000_000;
const crcTable = new Uint32Array(256);
for (let i=0;i<256;i++) {
  let c=i;
  for(let j=0;j<8;j++) c=(c&1)?0xedb88320^(c>>>1):c>>>1;
  crcTable[i]=c>>>0;
}
function crc32(bytes:Buffer):number {
  let crc=0xffffffff;
  for(const b of bytes) crc=crcTable[(crc^b)&255]^(crc>>>8);
  return (crc^0xffffffff)>>>0;
}
function chunk(type:string, data:Buffer):Buffer {
  const name=Buffer.from(type,"ascii");
  const len=Buffer.alloc(4);len.writeUInt32BE(data.length);
  const sum=Buffer.alloc(4);sum.writeUInt32BE(crc32(Buffer.concat([name,data])));
  return Buffer.concat([len,name,data,sum]);
}
export interface DecodedPng {width:number;height:number;pixels:Uint8Array}
export function readPngDimensions(buffer:Buffer) {
  if(buffer.length<33 || !buffer.subarray(0,8).equals(PNG_SIGNATURE) || buffer.toString("ascii",12,16)!=="IHDR")
    throw new Error("Expected a PNG with an IHDR chunk.");
  const width=buffer.readUInt32BE(16),height=buffer.readUInt32BE(20);
  if(width<1||height<1||width*height>MAX_PIXELS)throw new Error("PNG dimensions exceed 12 megapixels.");
  return {width,height};
}
export function decodePng(buffer:Buffer):DecodedPng {
  if(buffer.length>MAX_COMPRESSED_BYTES)throw new Error("PNG file exceeds 25 MB.");
  const {width,height}=readPngDimensions(buffer);
  let offset=8;
  let type=0,bitDepth=0,interlace=0;
  const idat:Buffer[]=[];
  let palette:Buffer|undefined,transparency:Buffer|undefined;
  let seenHeader=false,seenEnd=false;
  while(offset+12<=buffer.length) {
    const length=buffer.readUInt32BE(offset);
    if(length>MAX_COMPRESSED_BYTES||offset+length+12>buffer.length)throw new Error("Invalid PNG chunk size.");
    const name=buffer.toString("ascii",offset+4,offset+8);
    const payload=buffer.subarray(offset+8,offset+8+length);
    const checksum=buffer.readUInt32BE(offset+8+length);
    if(crc32(buffer.subarray(offset+4,offset+8+length))!==checksum)throw new Error("PNG chunk checksum failed: "+name);
    offset+=length+12;
    if(name==="IHDR") {
      if(seenHeader||length!==13)throw new Error("Invalid PNG header.");
      seenHeader=true;bitDepth=payload[8];type=payload[9];interlace=payload[12];
    } else if(name==="IDAT") idat.push(payload);
    else if(name==="PLTE") palette=payload;
    else if(name==="tRNS") transparency=payload;
    else if(name==="IEND") {seenEnd=true;break;}
  }
  if(!seenHeader||!seenEnd||!idat.length||bitDepth!==8||interlace!==0||![0,2,3,4,6].includes(type))
    throw new Error("Only non-interlaced 8-bit PNG formats are supported.");
  const channels=type===0||type===3?1:type===2?3:type===4?2:4;
  const stride=width*channels;
  const expected=(stride+1)*height;
  const raw=zlib.inflateSync(Buffer.concat(idat),{maxOutputLength:expected+1});
  if(raw.length!==expected)throw new Error("PNG decompressed length mismatch.");
  const pixels=new Uint8Array(width*height*4);
  let previous=Buffer.alloc(stride),pos=0;
  for(let y=0;y<height;y++) {
    const filter=raw[pos++];
    const row=Buffer.alloc(stride);
    for(let i=0;i<stride;i++) {
      const v=raw[pos++],left=i>=channels?row[i-channels]:0,up=previous[i],corner=i>=channels?previous[i-channels]:0;
      let guess=0;
      if(filter===1)guess=left;
      else if(filter===2)guess=up;
      else if(filter===3)guess=Math.floor((left+up)/2);
      else if(filter===4){
        const p=left+up-corner;
        const a=Math.abs(p-left),b=Math.abs(p-up),c=Math.abs(p-corner);
        guess=a<=b&&a<=c?left:b<=c?up:corner;
      } else if(filter!==0)throw new Error("Unsupported PNG scanline filter.");
      row[i]=(v+guess)&255;
    }
    for(let x=0;x<width;x++) {
      const src=x*channels,dst=(y*width+x)*4;
      if(type===6){pixels.set(row.subarray(src,src+4),dst);}
      else if(type===2){pixels[dst]=row[src];pixels[dst+1]=row[src+1];pixels[dst+2]=row[src+2];pixels[dst+3]=255;}
      else if(type===0){pixels[dst]=pixels[dst+1]=pixels[dst+2]=row[src];pixels[dst+3]=255;}
      else if(type===4){pixels[dst]=pixels[dst+1]=pixels[dst+2]=row[src];pixels[dst+3]=row[src+1];}
      else {
        const index=row[src];
        if(!palette||index*3+2>=palette.length)throw new Error("PNG palette is incomplete.");
        pixels[dst]=palette[index*3];pixels[dst+1]=palette[index*3+1];pixels[dst+2]=palette[index*3+2];
        pixels[dst+3]=transparency?.[index]??255;
      }
    }
    previous=row;
  }
  return {width,height,pixels};
}
export function encodeRgbaPng(image:DecodedPng):Buffer {
  const {width,height,pixels}=image;
  if(width<1||height<1||width*height>MAX_PIXELS||pixels.length!==width*height*4)
    throw new Error("Invalid RGBA image dimensions.");
  const ihdr=Buffer.alloc(13);
  ihdr.writeUInt32BE(width,0);ihdr.writeUInt32BE(height,4);ihdr[8]=8;ihdr[9]=6;
  const raw=Buffer.alloc((width*4+1)*height);
  for(let y=0;y<height;y++) Buffer.from(pixels.buffer,pixels.byteOffset+y*width*4,width*4).copy(raw,y*(width*4+1)+1);
  return Buffer.concat([PNG_SIGNATURE,chunk("IHDR",ihdr),chunk("IDAT",zlib.deflateSync(raw,{level:6})),chunk("IEND",Buffer.alloc(0))]);
}
const composite=(channel:number,alpha:number)=>Math.round(channel*alpha+255*(1-alpha));
export async function compareUiScreenshots(input:{
  reference:string;actual:string;threshold?:number;maxChangedPercent?:number;
  diffPath?:string;overwrite?:boolean;
}) {
  const threshold=input.threshold??20;
  const allowed=input.maxChangedPercent??2;
  if(!Number.isInteger(threshold)||threshold<0||threshold>255)throw new Error("threshold must be integer 0..255.");
  if(!Number.isFinite(allowed)||allowed<0||allowed>100)throw new Error("maxChangedPercent must be 0..100.");
  const [refPath,actPath]=[input.reference,input.actual].map(x=>path.resolve(x));
  const [refBytes,actBytes]=await Promise.all([fs.readFile(refPath),fs.readFile(actPath)]);
  const ref=decodePng(refBytes),act=decodePng(actBytes);
  if(ref.width!==act.width||ref.height!==act.height)throw new Error(
    "Image dimensions differ: reference "+ref.width+"x"+ref.height+", actual "+act.width+"x"+act.height+
    ". Capture matching physical pixel sizes before comparing.");
  let changed=0,totalAbsolute=0,minX=ref.width,minY=ref.height,maxX=-1,maxY=-1;
  const heat=input.diffPath?new Uint8Array(ref.pixels.length):undefined;
  // Coarse connected regions group nearby pixel differences into actionable UI areas.
  const tileSize=24,cols=Math.ceil(ref.width/tileSize),rows=Math.ceil(ref.height/tileSize);
  const tileChanged=new Uint32Array(cols*rows);
  for(let y=0;y<ref.height;y++)for(let x=0;x<ref.width;x++) {
    const i=(y*ref.width+x)*4;
    const ra=ref.pixels[i+3]/255,aa=act.pixels[i+3]/255;
    const d=[0,1,2].map(k=>Math.abs(composite(ref.pixels[i+k],ra)-composite(act.pixels[i+k],aa)));
    totalAbsolute+=d[0]+d[1]+d[2];
    const changedPixel=Math.max(...d)>threshold;
    if(changedPixel){
      changed++;minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);
      tileChanged[Math.floor(y/tileSize)*cols+Math.floor(x/tileSize)]++;
    }
    if(heat) {
      if(changedPixel){heat[i]=255;heat[i+1]=40;heat[i+2]=65;heat[i+3]=255;}
      else {const avg=Math.round((ref.pixels[i]+ref.pixels[i+1]+ref.pixels[i+2])/3);heat[i]=heat[i+1]=heat[i+2]=avg;heat[i+3]=255;}
    }
  }

  const visited=new Uint8Array(tileChanged.length);
  const regions:Array<{x:number;y:number;width:number;height:number;changedPixels:number;shareOfChanges:number}>=[];
  for(let start=0;start<tileChanged.length;start++){
    if(visited[start]||!tileChanged[start])continue;
    visited[start]=1;
    const stack=[start];
    let count=0,left=cols,top=rows,right=0,bottom=0;
    while(stack.length){
      const current=stack.pop()!;
      const cx=current%cols,cy=Math.floor(current/cols);
      count+=tileChanged[current];
      left=Math.min(left,cx);right=Math.max(right,cx);
      top=Math.min(top,cy);bottom=Math.max(bottom,cy);
      // 4-connected tile regions: keeps unrelated visual changes separate.
      const neighbors=[cy>0?current-cols:-1,cx>0?current-1:-1,cx+1<cols?current+1:-1,cy+1<rows?current+cols:-1];
      for(const neighbor of neighbors)if(neighbor>=0&&!visited[neighbor]&&tileChanged[neighbor]){
        visited[neighbor]=1;stack.push(neighbor);
      }
    }
    const x=left*tileSize,y=top*tileSize;
    regions.push({x,y,width:Math.min(ref.width,(right+1)*tileSize)-x,
      height:Math.min(ref.height,(bottom+1)*tileSize)-y,
      changedPixels:count,shareOfChanges:changed?Math.round(count/changed*10000)/100:0});
  }
  regions.sort((a,b)=>b.changedPixels-a.changedPixels);
  const pixels=ref.width*ref.height,percent=Math.round(changed/pixels*10000)/100;
  const meanAbsoluteError=Math.round(totalAbsolute/(pixels*3)*100)/100;
  let savedDiff:string|undefined;
  if(heat && input.diffPath) {
    savedDiff=path.resolve(input.diffPath);
    await fs.mkdir(path.dirname(savedDiff),{recursive:true});
    await fs.writeFile(savedDiff,encodeRgbaPng({width:ref.width,height:ref.height,pixels:heat}),{flag:input.overwrite?"w":"wx"});
  }
  return {reference:refPath,actual:actPath,size:{width:ref.width,height:ref.height},
    changedPixels:changed,totalPixels:pixels,changedPercent:percent,meanAbsoluteError,
    threshold,maxChangedPercent:allowed,passed:percent<=allowed,
    changedBoundingBox:changed?{x:minX,y:minY,width:maxX-minX+1,height:maxY-minY+1}:null,
    regions:regions.slice(0,12), regionMethod:"24px tile, 4-connected components; boxes approximate",
    diffPath:savedDiff,
    sha256:{reference:crypto.createHash("sha256").update(refBytes).digest("hex"),actual:crypto.createHash("sha256").update(actBytes).digest("hex")},
    caveats:["Pixel changes include browser/font rendering differences; a pass does not prove functional quality.","Images must be aligned at identical physical pixel dimensions.","Regions group nearby pixel changes but do not identify components or causes."],
  };
}
