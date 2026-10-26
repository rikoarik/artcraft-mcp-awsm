// Asset lokal: unduh gambar, generate SVG dari teks, dan palet warna.

import fs from "node:fs/promises";
import path from "node:path";
import { esc, normalizeHex, hexToHsl, hslToHex, request } from "../util.js";

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|svg|avif|bmp)$/i;

async function ensureDir(dir?: string): Promise<string> {
  const base = path.resolve(dir ?? "./assets");
  await fs.mkdir(base, { recursive: true });
  return base;
}

function sanitizeName(name: string, fallbackExt = ""): string {
  let base = path.basename(name).replace(/[^A-Za-z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^[-._]+|[-._]+$/g, "");
  if (!base) base = "asset";
  if (fallbackExt && !IMAGE_EXT.test(base)) base += fallbackExt;
  return base;
}

export async function downloadAsset(input: { url: string; filename?: string; dir?: string }) {
  let parsed: URL;
  try {
    parsed = new URL(input.url);
  } catch {
    throw new Error(`URL tidak valid: ${input.url}`);
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Hanya http/https yang didukung.");
  }

  const res = await request(parsed);
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("image/")) {
    throw new Error(`URL bukan gambar (content-type: ${contentType || "tidak diketahui"}).`);
  }
  const maxBytes = 10 * 1024 * 1024;
  if (Number(res.headers.get("content-length") ?? 0) > maxBytes) {
    throw new Error("Gambar terlalu besar (maksimal 10 MB).");
  }

  const extFromType = contentType.includes("svg") ? ".svg" :
    contentType.includes("jpeg") ? ".jpg" :
    contentType.includes("png") ? ".png" :
    contentType.includes("gif") ? ".gif" :
    contentType.includes("webp") ? ".webp" : "";

  const base = await ensureDir(input.dir);
  const name = sanitizeName(input.filename ?? parsed.pathname.split("/").pop() ?? "asset", extFromType || ".img");
  const file = path.join(base, name);
  if (contentType.includes("svg") || name.toLowerCase().endsWith(".svg")) {
    throw new Error("Download SVG eksternal dinonaktifkan; pakai awsm_get_icon untuk markup tepercaya atau simpan manual setelah review.");
  }
  const reader = res.body?.getReader();
  if (!reader) throw new Error("Respons gambar kosong.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) throw new Error("Gambar terlalu besar (maksimal 10 MB).");
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  const buf = Buffer.concat(chunks);
  await fs.writeFile(file, buf, { flag: "wx" });
  return {
    path: file,
    bytes: buf.length,
    contentType: contentType || "unknown",
    note: "Asset tersimpan lokal — referensikan via path relatif dari project (mis. assets/<file>) supaya reliabel.",
  };
}

type AssetKind = "og-card" | "banner" | "badge" | "placeholder";

const DEFAULTS: Record<AssetKind, { w: number; h: number }> = {
  "og-card": { w: 1200, h: 630 },
  banner: { w: 1600, h: 500 },
  badge: { w: 512, h: 512 },
  placeholder: { w: 800, h: 600 },
};

function initialsOf(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "A";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export async function makeAsset(input: {
  kind: AssetKind;
  title?: string;
  subtitle?: string;
  label?: string;
  colors?: string[];
  width?: number;
  height?: number;
  dir?: string;
  filename?: string;
}) {
  const kind = input.kind;
  const d = DEFAULTS[kind];
  const w = Math.min(Math.max(input.width ?? d.w, 120), 4096);
  const h = Math.min(Math.max(input.height ?? d.h, 120), 4096);
  const colors = (input.colors ?? []).map(normalizeHex);
  const c1 = colors[0] ?? "#101014";
  const c2 = colors[1] ?? "#39434f";
  const accent = colors[2] ?? "#8fb1cf";
  const title = input.title ?? (kind === "badge" ? "" : kind);
  const subtitle = input.subtitle ?? "";
  const label = input.label ?? "";

  const gradId = "g" + Math.abs(w * 31 + h * 7 + c1.length).toString(36);
  const PARK = "font-family='Inter, -apple-system, Helvetica, Arial, sans-serif'";

  let svg: string;
  if (kind === "badge") {
    const ini = esc(initialsOf(input.title ?? "a"));
    svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
  <rect width="${w}" height="${h}" rx="${Math.round(h * 0.22)}" fill="url(#${gradId})"/>
  <text x="50%" y="${subtitle ? "46%" : "54%"}" text-anchor="middle" dominant-baseline="middle" font-size="${Math.round(h * 0.42)}" font-weight="800" fill="#ffffff" ${PARK}>${ini}</text>
  ${subtitle ? `<text x="50%" y="72%" text-anchor="middle" font-size="${Math.round(h * 0.07)}" fill="${accent}" font-weight="600" letter-spacing="4" text-transform="uppercase" ${PARK}>${esc(subtitle.toUpperCase().slice(0, 24))}</text>` : ""}
</svg>`;
  } else if (kind === "placeholder") {
    const line1 = esc((title || "PLACEHOLDER").toUpperCase().slice(0, 24));
    svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#${gradId})"/>
  <rect x="24" y="24" width="${w - 48}" height="${h - 48}" fill="none" stroke="${accent}" stroke-opacity="0.5" stroke-dasharray="10 8"/>
  <text x="50%" y="46%" text-anchor="middle" dominant-baseline="middle" font-size="${Math.round(w * 0.05) + 14}" font-weight="700" fill="#ffffff" ${PARK}>${line1}</text>
  <text x="50%" y="60%" text-anchor="middle" font-size="${Math.round(w * 0.028) + 10}" fill="${accent}" ${PARK}>${esc(`${w} × ${h}`)}</text>
</svg>`;
  } else {
    // og-card & banner: bar anggun berbasis tipe
    const titleSize = kind === "og-card" ? Math.round(w * 0.075) : Math.round(h * 0.24);
    const subSize = Math.round(titleSize * 0.38);
    const xPad = Math.round(w * 0.06);
    svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#${gradId})"/>
  <rect x="0" y="0" width="${Math.round(w * 0.008)}" height="${h}" fill="${accent}"/>
  ${label ? `<text x="${xPad}" y="${Math.round(h * 0.28)}" font-size="${Math.round(subSize * 0.8)}" font-weight="700" letter-spacing="6" fill="${accent}" ${PARK}>${esc(label.toUpperCase().slice(0, 30))}</text>` : ""}
  <text x="${xPad}" y="${label ? Math.round(h * 0.58) : Math.round(h * 0.52)}" font-size="${titleSize}" font-weight="800" fill="#ffffff" ${PARK}>${esc((title || "").slice(0, 42))}</text>
  ${subtitle ? `<text x="${xPad}" y="${(label ? Math.round(h * 0.58) : Math.round(h * 0.52)) + Math.round(titleSize * 0.85)}" font-size="${subSize}" fill="#c9ced7" ${PARK}>${esc(subtitle.slice(0, 60))}</text>` : ""}
</svg>`;
  }

  const base = await ensureDir(input.dir);
  const name = sanitizeName(input.filename ?? `${kind}-${Date.now()}`, ".svg");
  if (!name.toLowerCase().endsWith(".svg")) throw new Error("Asset hasil generate harus berekstensi .svg.");
  const file = path.join(base, name);
  await fs.writeFile(file, Buffer.from(svg, "utf8"), { flag: "wx" });
  return {
    path: file,
    kind,
    size: `${w}×${h}`,
    bytes: Buffer.byteLength(svg),
    note: "SVG vector, bebas lisensi, bisa di-edit langsung. Untuk OG image platform sosial yang butuh raster, convert ke PNG dulu.",
  };
}

export type PaletteScheme = "analogous" | "complementary" | "triadic" | "complete";

export async function makePalette(input: { color: string; scheme?: PaletteScheme }) {
  const base = normalizeHex(input.color);
  const { h, s, l } = hexToHsl(base);
  const scheme = input.scheme ?? "complete";

  const family: Array<{ name: string; hex: string }> = [{ name: "base", hex: base }];
  const push = (name: string, hh: number, ss = s, ll = l) => family.push({ name, hex: hslToHex(hh, ss, ll) });

  if (scheme === "analogous" || scheme === "complete") {
    push("analog-a", h - 30);
    push("analog-b", h + 30);
  }
  if (scheme === "complementary" || scheme === "complete") {
    push("complement", h + 180);
  }
  if (scheme === "triadic" || scheme === "complete") {
    push("triad-a", h + 120);
    push("triad-b", h + 240);
  }
  if (scheme === "complete") {
    family.push({ name: "tint", hex: hslToHex(h, Math.max(s - 10, 8), Math.min(l + 28, 92)) });
    family.push({ name: "shade", hex: hslToHex(h, s, Math.max(l - 16, 6)) });
  }

  const cssVars = family
    // biar stabil di bulatkan
    .map(
      ({ name, hex }, i) => `--awsm-${String(i + 1).padStart(2, "0")}-${name.replace(/[^\w-]/g, "")}: ${hex};`,
    )
    .join("\n");

  return {
    base,
    scheme,
    palette: family,
    cssVars,
    note: "Ganti hue dari base — sat dan lightness dipertahankan, jadi paletnya konsisten. Padukan base+tint untuk surface dan shade untuk teks.",
  };
}
