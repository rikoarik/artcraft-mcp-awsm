// Icon search via Iconify (gratis, tanpa API key).

import { fetchJson, fetchText } from "../util.js";

const ICONIFY = "https://api.iconify.design";

export async function findIcons(input: {
  query: string;
  limit?: number;
  /** Bisa beberapa family dipisah koma, contoh "lucide,tabler". */
  prefix?: string;
}) {
  const limit = Math.min(Math.max(input.limit ?? 20, 1), 50);
  const u = new URL(`${ICONIFY}/search`);
  u.searchParams.set("query", input.query);
  u.searchParams.set("limit", String(limit));
  if (input.prefix) u.searchParams.set("prefix", input.prefix);

  const data = await fetchJson<{ icons?: string[]; total?: number }>(u);
  const names = (data.icons ?? []).slice(0, limit);
  return {
    query: input.query,
    total: data.total ?? names.length,
    count: names.length,
    icons: names.map((name) => {
      const [family, icon] = name.split(":");
      return {
        /** Nama ikon untuk awsm_get_icon. */
        name,
        /** Keluarga ikon — pakai SATU family yang sama dalam 1 UI biar konsisten. */
        family,
        /** URL preview SVG. */
        svg: `${ICONIFY}/${family}/${icon}.svg?height=64`,
      };
    }),
    tip: "Pilih keluarga ikon yang sama untuk semua ikon dalam satu UI. Ambil markup-nya lewat awsm_get_icon.",
  };
}

export async function getIcon(input: { name: string; height?: number }) {
  if (!/^[a-z0-9_.-]+:[a-z0-9_.-]+$/i.test(input.name)) {
    throw new Error(`Nama ikon tidak valid: "${input.name}". Format: "family:name", contoh "lucide:rocket".`);
  }
  const [family, name] = input.name.split(":");
  const height = input.height ?? 64;
  const svg = await fetchText(`${ICONIFY}/${family}/${name}.svg?height=${height}`);
  return {
    name: input.name,
    height,
    svg,
    note: "SVG sudah normalisasi ke height yang diminta. Untuk styling, override .svg path via CSS — banyak ikon ikut currentColor.",
  };
}
