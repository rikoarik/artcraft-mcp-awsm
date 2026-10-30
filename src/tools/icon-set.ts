import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { getIcon } from "./icons.js";
import { fetchJson } from "../util.js";

const valid = /^[a-z0-9_.-]+:[a-z0-9_.-]+$/i;
const safe = /^[a-z0-9_.-]+$/i;

export async function saveIconSet(input: {
  icons: string[]; dir?: string; height?: number; overwrite?: boolean;
}) {
  if (!input.icons.length || input.icons.length > 40) throw new Error("Provide 1 to 40 icons.");
  const names = [...new Set(input.icons)];
  if (!names.every(name => valid.test(name))) throw new Error("Use iconify family:name IDs.");
  const families = new Set(names.map(name => name.split(":")[0]));
  if (families.size > 1) throw new Error("Use a single icon family for visual consistency.");
  const family = [...families][0];
  const target = path.resolve(input.dir ?? "./public/icons");
  const height = input.height ?? 24;
  if (!Number.isInteger(height) || height < 16 || height > 512) throw new Error("Icon height must be 16-512.");
  await fs.mkdir(target, { recursive: true });
  const files: Array<{ name: string; file: string; sha256: string; status: "created" | "unchanged" | "conflict" | "updated" }> = [];
  for (const name of names) {
    const short = name.split(":")[1];
    if (!safe.test(short)) throw new Error("Invalid icon name.");
    const filename = short + ".svg";
    const file = path.resolve(target, filename);
    const result = await getIcon({ name, height });
    const svg = result.svg;
    if (!/^\s*<svg\b/i.test(svg) || /<script\b|<foreignObject\b|\bon\w+\s*=|javascript:|<iframe\b/i.test(svg))
      throw new Error("Unsafe or unexpected icon markup for " + name);
    const sha256 = crypto.createHash("sha256").update(svg).digest("hex");
    let status: "created" | "unchanged" | "conflict" | "updated" = "created";
    try {
      const prev = await fs.readFile(file, "utf8");
      if (prev === svg) status = "unchanged";
      else if (!input.overwrite) status = "conflict";
      else status = "updated";
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }
    if (status === "created" || status === "updated") {
      await fs.writeFile(file, svg, { flag: status === "created" ? "wx" : "w" });
    }
    files.push({ name, file, sha256, status });
  }
  let license: string | undefined;
  try {
    const data = await fetchJson<{ license?: { title?: string; spdx?: string; url?: string } }>(
      "https://api.iconify.design/collections?prefix=" + encodeURIComponent(family)
    );
    license = data.license?.spdx ?? data.license?.title;
  } catch { /* Icon downloads remain valid if license metadata API is unavailable. */ }
  return { family, license: license ?? "Verify the icon family's license at Iconify before publishing.",
    directory: target, files, complete: files.every(f => f.status !== "conflict"),
    note: "Local SVG icons use a single family; files are not overwritten unless overwrite=true." };
}
