import { hexToRgb, normalizeHex } from "../util.js";

type Node = Record<string, unknown>;
const obj = (v: unknown): Node | null => v !== null && typeof v === "object" && !Array.isArray(v) ? v as Node : null;
const arr = (v: unknown): unknown[] => Array.isArray(v) ? v : [];
const n = (v: unknown): number | null => typeof v === "number" && Number.isFinite(v) ? v : null;
const string = (v: unknown): string => typeof v === "string" ? v : "";
const rounded = (v: number) => Math.round(v * 100) / 100;
const toHex = (v: unknown): string | null => {
  if (typeof v === "string") {
    try { return normalizeHex(v); } catch { return null; }
  }
  const color = obj(v);
  if (!color) return null;
  const rgb = ["r","g","b"].map(k=>n(color[k]));
  if (rgb.some(v => v === null)) return null;
  const scale = rgb.every(v => v! <= 1) ? 255 : 1;
  if (rgb.some(v => v! < 0 || v! * scale > 255)) return null;
  return "#" + rgb.map(v => Math.round(v! * scale).toString(16).padStart(2,"0")).join("");
};

const alpha = (v: unknown): number | undefined => {
  const a = n(v);
  return a !== null && a >= 0 && a <= 1 ? a : undefined;
};

interface Entry { value: string | number; count: number; examples: string[] }
function record(map: Map<string, Entry>, value: string | number, path: string) {
  const k = String(value);
  const item = map.get(k) ?? { value, count: 0, examples: [] };
  item.count++;
  if (item.examples.length < 3 && !item.examples.includes(path)) item.examples.push(path);
  map.set(k, item);
}
function sort(map: Map<string,Entry>) {
  return [...map.values()].sort((a,b) => b.count-a.count || String(a.value).localeCompare(String(b.value)));
}
export function extractDesignTokens(input: { document: unknown; maxNodes?: number }) {
  const source = obj(input.document);
  const root = obj(source?.document) ?? source;
  if (!root) throw new Error("Expected a document JSON object.");
  const colors = new Map<string,Entry>();
  const fontFamilies = new Map<string,Entry>();
  const fontSizes = new Map<string,Entry>();
  const fontWeights = new Map<string,Entry>();
  const radii = new Map<string,Entry>();
  const gaps = new Map<string,Entry>();
  const nodeNames: string[] = [];
  const warnings: string[] = [];
  const limit = input.maxNodes ?? 12000;
  if (!Number.isInteger(limit) || limit < 1 || limit > 20000) throw new Error("maxNodes must be 1..20000");
  let examined = 0;

  function walk(node: Node, parent: string, depth: number) {
    if (++examined > limit) throw new Error("Design node limit exceeded; inspect fewer pages.");
    if (depth > 64) throw new Error("Layer tree nesting exceeds 64.");
    const name = string(node.name) || string(node.type) || "node";
    const here = parent ? parent + "/" + name : name;
    if (nodeNames.length < 8) nodeNames.push(here);

    const visitPaint = (v: unknown) => {
      for (const p of arr(v)) {
        const paint = obj(p); if (!paint || paint.visible === false) continue;
        const hex = toHex(paint.color ?? paint.hex ?? paint.value);
        if (hex) {
          const a = alpha(paint.opacity) ?? alpha(obj(paint.color)?.a) ?? 1;
          record(colors, a === 1 ? hex : hex + " @ " + rounded(a), here);
        }
      }
    };
    visitPaint(node.fills);
    visitPaint(node.strokes);
    visitPaint(node.paints);
    const bg = toHex(node.backgroundColor);
    if (bg) record(colors, bg, here);
    const type = obj(node.style) ?? obj(node.textStyle) ?? {};
    const font = string(type.fontFamily ?? node.fontFamily);
    if (font) record(fontFamilies, font, here);
    const size = n(type.fontSize ?? node.fontSize);
    if (size !== null && size > 0 && size <= 300) record(fontSizes, size, here);
    const weight = n(type.fontWeight ?? node.fontWeight);
    if (weight !== null && weight >= 100 && weight <= 1000) record(fontWeights,weight,here);
    const radius = n(node.cornerRadius);
    if (radius !== null && radius >= 0 && radius <= 512) record(radii,radius,here);
    const gap = n(node.itemSpacing ?? node.gap);
    if (gap !== null && gap >= 0 && gap <= 512) record(gaps,gap,here);

    const children = arr(node.children ?? node.layers ?? node.nodes);
    if (node.truncated === true || n(node.childCount) !== null && n(node.childCount)! > children.length)
      warnings.push("Layer tree may be incomplete at " + here);
    for (const child of children) {
      const c = obj(child); if (c) walk(c,here,depth+1);
    }
  }
  const roots = arr(root.pages ?? root.children ?? root.layers ?? root.nodes);
  if (!roots.length) throw new Error("Expected document pages or layer tree.");
  for (const child of roots) { const c = obj(child); if(c) walk(c,"",0); }

  const palette = sort(colors);
  const families = sort(fontFamilies);
  const sizes = sort(fontSizes);
  const spacing = sort(gaps);
  const cssLines: string[] = [":root {"];
  palette.filter(x=>/^#[0-9a-f]{6}$/i.test(String(x.value))).slice(0,24)
    .forEach((x,i)=>cssLines.push("  --awsm-observed-color-" + (i+1) + ": " + x.value + ";"));
  sizes.slice(0,12).forEach((x,i)=>cssLines.push("  --awsm-observed-type-" + (i+1) + ": " + x.value + "px;"));
  spacing.slice(0,12).forEach((x,i)=>cssLines.push("  --awsm-observed-gap-" + (i+1) + ": " + x.value + "px;"));
  cssLines.push("}");
  return {
    schemaVersion: "awsm.design-tokens/v1",
    status: "observed-values-only",
    source: "figcraft-inspection",
    examinedNodes: examined,
    tokenCandidates: { colors: palette, fontFamilies: families, fontSizes: sizes,
      fontWeights: sort(fontWeights), radii: sort(radii), gaps: spacing },
    cssPrimitives: cssLines.join("\n"),
    warnings,
    note: "These are observed values, not semantic design tokens. Decide roles such as surface, text, and action manually based on product context.",
  };
}

const luminance = (hex: string): number => {
  const {r,g,b}=hexToRgb(hex);
  const linear = (c: number) => c <= 0.04045 ? c/12.92 : ((c+0.055)/1.055)**2.4;
  return linear(r)*0.2126 + linear(g)*0.7152 + linear(b)*0.0722;
};
export function checkContrast(input: { pairs: Array<{ foreground: string; background: string; label?: string; largeText?: boolean }> }) {
  if (!input.pairs.length || input.pairs.length > 100) throw new Error("Provide 1..100 color pairs.");
  const results = input.pairs.map(pair => {
    const fg=normalizeHex(pair.foreground),bg=normalizeHex(pair.background);
    const a=luminance(fg),b=luminance(bg);
    const exactRatio=(Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);
    const ratio=rounded(exactRatio);
    return { label: pair.label ?? "", foreground:fg,background:bg,ratio,
      wcagAA:exactRatio >= (pair.largeText ? 3 : 4.5),
      wcagAAA:exactRatio >= (pair.largeText ? 4.5 : 7),
      textSize:pair.largeText ? "large" : "normal" };
  });
  return { standard: "WCAG 2.x contrast-ratio evaluation", results, failedAA:results.filter(r=>!r.wcagAA).length,
    note: "Ratio assumes opaque colors and does not inspect composited backgrounds, gradients, or rendered text sizes." };
}
