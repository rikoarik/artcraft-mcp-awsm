import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

type RecordValue = Record<string, unknown>;
type Role = "screen" | "layout" | "component" | "text" | "decoration" | "asset" | "review";
type AssetFormat = "png" | "svg";

export interface HandoffAsset {
  nodeId: string;
  name: string;
  format: AssetFormat;
  filename: string;
  publicPath: string;
  sourceLayer: string;
  status: "needs-export";
  figcraftExport: { tool: "export"; arguments: { ids: Array<string | number>; format: AssetFormat; path: string; scale?: number } };
}
export interface HandoffLayer {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
  page: string;
  path: string;
  role: Role;
  implementation: "dom" | "asset" | "manual-review";
  bounds: { width?: number; height?: number };
  text?: string;
  component?: string;
  asset?: string;
}
export interface HandoffIssue {
  code: string;
  severity: "warning" | "info";
  nodeId?: string;
  message: string;
}
export interface WebHandoff {
  schemaVersion: "awsm.figcraft-web-handoff/v1";
  source: "figcraft";
  layers: HandoffLayer[];
  assets: HandoffAsset[];
  issues: HandoffIssue[];
  summary: { screens: number; components: number; domLayers: number; exportableAssets: number; reviewLayers: number };
  workflow: string[];
}

const object = (value: unknown): RecordValue | undefined =>
  value !== null && typeof value === "object" && !Array.isArray(value) ? value as RecordValue : undefined;
const children = (value: unknown): RecordValue[] =>
  Array.isArray(value) ? value.filter((item): item is RecordValue => Boolean(object(item))) : [];
const key = (v: unknown): string => typeof v === "string" || typeof v === "number" ? String(v) : "";
const str = (v: unknown): string => typeof v === "string" ? v : "";
const slug = (value: string): string =>
  value.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70) || "unnamed";
const inside = (root: string, target: string): boolean =>
  target === root || (!path.relative(root, target).startsWith(".." + path.sep) &&
    path.relative(root, target) !== ".." && !path.isAbsolute(path.relative(root, target)));
const fileName = (name: string): boolean => /^[a-z0-9][a-z0-9-]*\.(png|svg)$/.test(name);
const hasImageFill = (node: RecordValue): boolean => {
  const fills = Array.isArray(node.fills) ? node.fills : Array.isArray(node.paints) ? node.paints : [];
  return fills.some(fill => {
    const f = object(fill);
    return f && /IMAGE|BITMAP/i.test(str(f.type));
  });
};
const meta = (node: RecordValue): RecordValue => object(node.pluginData) ?? {};
const imageHint = (node: RecordValue): boolean =>
  /^(IMAGE|BITMAP)$/i.test(str(node.type)) || hasImageFill(node);
const isVector = (type: string): boolean => /^(VECTOR|PATH|BOOLEAN_OPERATION)$/i.test(type);
const isGeneric = (name: string): boolean =>
  /^(rectangle|frame|group|vector|ellipse|polygon|image|text|line|shape)\s*\d+$/i.test(name.trim());

function hintMap(raw: unknown): Map<string, string> {
  const result = new Map<string, string>();
  const root = object(raw);
  const rows = Array.isArray(raw) ? raw : root?.assets ?? root?.items ?? [];
  for (const row of children(rows)) {
    const id = key(row.id ?? row.nodeId ?? row.node);
    const kind = str(row.kind ?? row.type);
    if (id && /^(image|icon)$/i.test(kind)) result.set(id, kind.toLowerCase());
  }
  return result;
}

export function analyzeFigcraft(input: { document: unknown; inspectAssets?: unknown; exportDir?: string }): WebHandoff {
  const wrapper = object(input.document);
  const doc = object(wrapper?.document) ?? wrapper;
  if (!doc) throw new Error("Expected an inspect_document JSON object.");
  const pages = children(doc.pages);
  const roots = pages.length ? pages : children(doc.children ?? doc.layers ?? doc.nodes);
  if (!roots.length) throw new Error("No layer tree found. Use FigCraft inspect_document with allPages:true and sufficient depth.");
  const hints = hintMap(input.inspectAssets);
  const exportDir = input.exportDir ?? "./figcraft-exports";
  const layers: HandoffLayer[] = [];
  const assets: HandoffAsset[] = [];
  const issues: HandoffIssue[] = [];
  const used = new Set<string>();
  const visited = new Set<RecordValue>();
  let sequence = 0;
  let screens = 0;
  let components = 0;
  let domLayers = 0;
  let reviewLayers = 0;

  function walk(node: RecordValue, parentId: string | null, pageName: string, parentPath: string, depth: number, parentType: string): void {
    if (++sequence > 20000) throw new Error("Layer limit exceeded (20,000). Inspect fewer pages.");
    if (depth > 64) throw new Error("Layer nesting exceeds 64 levels.");
    if (visited.has(node)) throw new Error("Cyclic or reused layer object in document.");
    visited.add(node);
    const id = key(node.id) || "missing-" + sequence;
    const type = str(node.type).toUpperCase() || "UNKNOWN";
    const name = str(node.name) || type.toLowerCase() + "-" + sequence;
    const currentPage = type === "PAGE" ? name : pageName;
    const currentPath = parentPath ? parentPath + "/" + name : name;
    const data = meta(node);
    const explicit = str(data["awsm.kind"] ?? data["awsm.role"]).toLowerCase();
    const hint = hints.get(id);
    const kids = children(node.children ?? node.layers ?? node.nodes);
    const screen = (type === "FRAME" || type === "SECTION") && (parentId === null || parentType === "PAGE");
    let role: Role = "review";
    let format: AssetFormat | undefined;

    if (["asset", "image", "photo", "illustration", "icon"].includes(explicit)) {
      role = "asset"; format = explicit === "icon" ? "svg" : "png";
    } else if (["layout", "component", "text", "decoration"].includes(explicit)) {
      role = explicit as Role;
    } else if (type === "PAGE") role = "layout";
    else if (type === "COMPONENT" || type === "COMPONENT_SET" || type === "INSTANCE") role = "component";
    else if (type === "TEXT") role = "text";
    else if (hint === "icon") { role = "asset"; format = "svg"; }
    else if (hint === "image") { role = "asset"; format = "png"; }
    else if (imageHint(node) && kids.length === 0) { role = "asset"; format = "png"; }
    else if (screen) role = "screen";
    else if (type === "FRAME" || type === "GROUP" || type === "SECTION") role = "layout";
    else if (isVector(type) && /^(icon|illustration)\b/i.test(name)) { role = "asset"; format = "svg"; }
    else if (/^(RECTANGLE|ELLIPSE|LINE|POLYGON|STAR)$/i.test(type)) role = "decoration";

    if (role === "asset" && !format) format = /icon|vector/i.test(explicit + " " + type) ? "svg" : "png";
    if (role === "asset" && kids.length && type !== "INSTANCE") {
      role = "review"; format = undefined;
      issues.push({ code: "COMPOSITE_ASSET", severity: "warning", nodeId: id,
        message: "Composite layer marked as asset. Decide whether to export it whole or rebuild its children in HTML." });
    }
    if (role === "screen") screens++;
    if (role === "component") components++;
    if (role === "review") reviewLayers++;
    else if (role !== "asset") domLayers++;
    const layer: HandoffLayer = {
      id, name, type, parentId, page: currentPage, path: currentPath, role,
      implementation: role === "asset" ? "asset" : role === "review" ? "manual-review" : "dom",
      bounds: {},
    };
    if (typeof node.width === "number") layer.bounds.width = node.width;
    if (typeof node.height === "number") layer.bounds.height = node.height;
    if (role === "text" && (typeof node.characters === "string" || typeof node.text === "string"))
      layer.text = str(node.characters ?? node.text);
    if (role === "component") layer.component = str(node.mainComponentName) || name;
    if (role === "asset" && format) {
      const suffix = slug(id).slice(-20);
      const filename = slug(str(data["awsm.assetName"]) || name) + "-" + suffix + "." + format;
      if (used.has(filename)) throw new Error("Duplicate export filename: " + filename);
      used.add(filename);
      layer.asset = "/figcraft/" + filename;
      const nativeId = typeof node.id === "number" ? node.id : id;
      assets.push({
        nodeId: id, name, format, filename, publicPath: layer.asset, sourceLayer: currentPath,
        status: "needs-export",
        figcraftExport: { tool: "export", arguments: { ids: [nativeId], format,
          path: path.join(exportDir, filename), ...(format === "png" ? { scale: 2 } : {}) } },
      });
    }
    layers.push(layer);
    if (isGeneric(name) && role !== "decoration") issues.push({ code: "GENERIC_LAYER_NAME", severity: "info", nodeId: id,
      message: "Rename " + name + " to reflect its purpose (e.g. Header/Nav or Hero/Photo)." });
    if (node.truncated === true || (typeof node.childCount === "number" && node.childCount > kids.length))
      issues.push({ code: "INCOMPLETE_TREE", severity: "warning", nodeId: id,
        message: "The layer tree is truncated. Request get_node or inspect_document at greater depth before implementation." });
    if (role === "review") issues.push({ code: "AMBIGUOUS_LAYER", severity: "warning", nodeId: id,
      message: "Cannot safely classify " + name + " (" + type + "). Set pluginData awsm.kind or inspect it manually." });
    if (imageHint(node) && kids.length > 0 && role !== "asset")
      issues.push({ code: "BACKGROUND_IMAGE", severity: "warning", nodeId: id,
        message: "Layer has an image fill and children. Separate the image from the content before export." });
    for (const child of kids) walk(child, id, currentPage, currentPath, depth + 1, type);
  }

  for (const root of roots) walk(root, null, "Page", "", 0, "");
  if (!assets.length) issues.push({ code: "NO_EXPORTABLE_ASSETS", severity: "info",
    message: "No obvious exportable image/icon layers. Review inspect.assets; do not rasterize full frames as a shortcut." });
  return {
    schemaVersion: "awsm.figcraft-web-handoff/v1", source: "figcraft", layers, assets, issues,
    summary: { screens, components, domLayers, exportableAssets: assets.length, reviewLayers },
    workflow: [
      "Inspect design with FigCraft inspect_document (allPages:true, depth high enough) and run_command inspect.assets.",
      "Resolve AMBIGUOUS_LAYER, INCOMPLETE_TREE and BACKGROUND_IMAGE warnings in FigCraft first.",
      "For each assets[].figcraftExport call FigCraft's native export tool. Do not export layout frames or text as image files.",
      "Call AWSM sync_figcraft_assets with the saved handoff JSON and the same exportDir.",
      "Use FigCraft inspect.code (language:tailwind or react), inspect.properties and codeConnect for DOM components. Treat generated code as a starting point, not a production implementation.",
      "Implement responsive behavior, semantic HTML, real interactions and run visual QA against FigCraft screenshots.",
    ],
  };
}

async function loadJson(filename: string): Promise<unknown> {
  const data = await fs.readFile(path.resolve(filename), "utf8");
  if (Buffer.byteLength(data) > 20 * 1024 * 1024) throw new Error("JSON input exceeds 20 MB.");
  return JSON.parse(data) as unknown;
}

export async function prepareWebHandoff(input: {
  document?: unknown; documentPath?: string; inspectAssets?: unknown; inspectAssetsPath?: string;
  exportDir?: string; outputPath?: string; overwrite?: boolean;
}): Promise<WebHandoff & { savedTo?: string }> {
  if ((input.document === undefined) === (input.documentPath === undefined))
    throw new Error("Supply exactly one of document or documentPath.");
  if (input.inspectAssets !== undefined && input.inspectAssetsPath)
    throw new Error("Supply inspectAssets or inspectAssetsPath, not both.");
  const document = input.documentPath ? await loadJson(input.documentPath) : input.document;
  const inspectAssets = input.inspectAssetsPath ? await loadJson(input.inspectAssetsPath) : input.inspectAssets;
  const result = analyzeFigcraft({ document, inspectAssets, exportDir: input.exportDir });
  if (!input.outputPath) return result;
  const target = path.resolve(input.outputPath);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, JSON.stringify(result, null, 2) + "\n", { flag: input.overwrite ? "w" : "wx" });
  return { ...result, savedTo: target };
}

export async function syncFigcraftAssets(input: {
  handoff?: unknown; handoffPath?: string; exportDir?: string; publicDir?: string; overwrite?: boolean;
}) {
  if ((input.handoff === undefined) === (input.handoffPath === undefined))
    throw new Error("Supply exactly one of handoff or handoffPath.");
  const raw = input.handoffPath ? await loadJson(input.handoffPath) : input.handoff;
  const handoff = object(raw);
  if (handoff?.schemaVersion !== "awsm.figcraft-web-handoff/v1" || !Array.isArray(handoff.assets))
    throw new Error("Expected an AWSM FigCraft handoff v1 manifest.");
  const exportDir = await fs.realpath(path.resolve(input.exportDir ?? "./figcraft-exports"));
  const publicDir = path.resolve(input.publicDir ?? "./public");
  const outDir = path.resolve(publicDir, "figcraft");
  if (!inside(publicDir, outDir)) throw new Error("Invalid public asset directory.");
  const records: Array<{ nodeId: string; path: string; sha256: string; bytes: number; status: "copied" | "unchanged" }> = [];
  const missing: string[] = [];
  const conflicts: string[] = [];
  const seen = new Set<string>();
  for (const value of handoff.assets) {
    const asset = object(value);
    const filename = str(asset?.filename);
    const id = key(asset?.nodeId);
    if (!fileName(filename) || !id || seen.has(filename)) throw new Error("Invalid or duplicate asset manifest entry.");
    seen.add(filename);
    const source = path.resolve(exportDir, filename);
    if (!inside(exportDir, source)) throw new Error("Source path escapes export directory.");
    let realSource: string;
    try { realSource = await fs.realpath(source); }
    catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") { missing.push(filename); continue; }
      throw err;
    }
    if (!inside(exportDir, realSource)) throw new Error("Asset symlink escapes export directory: " + filename);
    const stat = await fs.stat(realSource);
    if (!stat.isFile() || stat.size > 30 * 1024 * 1024)
      throw new Error("Invalid asset or asset exceeds 30 MB: " + filename);
    const contents = await fs.readFile(realSource);
    if (filename.endsWith(".svg") && /<script\b|\bon\w+\s*=|javascript:/i.test(contents.toString("utf8")))
      throw new Error("Potential active content in SVG: " + filename);
    const sha256 = crypto.createHash("sha256").update(contents).digest("hex");
    const destination = path.resolve(outDir, filename);
    if (!inside(outDir, destination)) throw new Error("Destination path escapes asset directory.");
    await fs.mkdir(outDir, { recursive: true });
    try {
      const previous = await fs.readFile(destination);
      const previousHash = crypto.createHash("sha256").update(previous).digest("hex");
      if (previousHash === sha256) {
        records.push({ nodeId: id, path: "/figcraft/" + filename, sha256, bytes: stat.size, status: "unchanged" });
        continue;
      }
      if (!input.overwrite) { conflicts.push(filename); continue; }
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }
    await fs.writeFile(destination, contents, { flag: input.overwrite ? "w" : "wx" });
    records.push({ nodeId: id, path: "/figcraft/" + filename, sha256, bytes: stat.size, status: "copied" });
  }
  const manifestPath = path.join(outDir, "asset-manifest.json");
  const manifest = { schemaVersion: "awsm.figcraft-assets/v1", files: records, missing, conflicts };
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  return { ...manifest, manifestPath, complete: missing.length === 0 && conflicts.length === 0 };
}
