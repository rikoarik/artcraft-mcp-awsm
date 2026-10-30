import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

type Primitive = {
  kind: "path" | "circle" | "rect" | "line" | "polyline" | "ellipse";
  d?: string;
  points?: string;
  x?: number; y?: number; x2?: number; y2?: number;
  cx?: number; cy?: number; r?: number; rx?: number; ry?: number;
  width?: number; height?: number;
  fill?: boolean;
};
const number = (value: number | undefined, label: string): string => {
  if (typeof value !== "number" || !Number.isFinite(value) || Math.abs(value) > 4096)
    throw new Error("Invalid numeric icon coordinate: " + label);
  return String(value);
};
const esc = (value: string): string => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const attr = (name: string, value: number | undefined): string => " " + name + '="' + number(value, name) + '"';
const shape = (p: Primitive): string => {
  let props = p.fill ? ' fill="currentColor" stroke="none"' : ' fill="none"';
  switch (p.kind) {
    case "path":
      if (!p.d || p.d.length > 4096 || !/^[A-Za-z0-9+.,eE\s-]+$/.test(p.d))
        throw new Error("Invalid SVG path data.");
      return '<path d="' + esc(p.d) + '"' + props + "/>";
    case "polyline":
      if (!p.points || p.points.length > 2000 || !/^[0-9+.,eE\s-]+$/.test(p.points))
        throw new Error("Invalid polyline points.");
      return '<polyline points="' + esc(p.points) + '"' + props + "/>";
    case "circle": return '<circle' + attr("cx",p.cx) + attr("cy",p.cy) + attr("r",p.r) + props + "/>";
    case "ellipse": return '<ellipse' + attr("cx",p.cx) + attr("cy",p.cy) + attr("rx",p.rx) + attr("ry",p.ry) + props + "/>";
    case "rect": return '<rect' + attr("x",p.x) + attr("y",p.y) + attr("width",p.width) + attr("height",p.height) +
      (p.rx === undefined ? "" : attr("rx",p.rx)) + props + "/>";
    case "line": return '<line' + attr("x1",p.x) + attr("y1",p.y) + attr("x2",p.x2) + attr("y2",p.y2) + props + "/>";
  }
};
export async function drawIcon(input: {
  name: string; elements: Primitive[]; dir?: string; size?: number; strokeWidth?: number; overwrite?: boolean;
}) {
  if (!/^[a-z0-9][a-z0-9-]{0,55}$/.test(input.name)) throw new Error("Icon name must be lowercase kebab-case.");
  if (!input.elements.length || input.elements.length > 30) throw new Error("Provide 1–30 icon primitives.");
  const size = input.size ?? 24;
  const strokeWidth = input.strokeWidth ?? 1.75;
  if (!Number.isFinite(size) || size < 12 || size > 512) throw new Error("Invalid icon size.");
  if (!Number.isFinite(strokeWidth) || strokeWidth < 0.5 || strokeWidth > 5) throw new Error("Invalid stroke width.");
  const body = input.elements.map(shape).join("\n  ");
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size +
    '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' +
    strokeWidth + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">\n  ' + body + '\n</svg>\n';
  const dir = path.resolve(input.dir ?? "./public/icons/custom");
  const file = path.join(dir, input.name + ".svg");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(file, svg, { flag: input.overwrite ? "w" : "wx" });
  return { file, name: input.name, size, bytes: Buffer.byteLength(svg), sha256: crypto.createHash("sha256").update(svg).digest("hex"),
    note: "Original vector icon assembled from supplied paths. Inspect its actual rendered appearance before shipping." };
}
