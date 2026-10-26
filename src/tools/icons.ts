// Search Iconify for SVG icons without an API key.

import { fetchJson, fetchText } from "../util.js";

const ICONIFY = "https://api.iconify.design";

export async function findIcons(input: {
  query: string;
  limit?: number;
  /** Accepts comma-separated families, for example "lucide,tabler". */
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
        /** Icon name to pass to get_icon. */
        name,
        /** Keep one family consistent throughout the UI. */
        family,
        /** SVG preview URL. */
        svg: `${ICONIFY}/${family}/${icon}.svg?height=64`,
      };
    }),
    tip: "Use one icon family for a consistent UI. Retrieve the SVG markup with get_icon.",
  };
}

export async function getIcon(input: { name: string; height?: number }) {
  if (!/^[a-z0-9_.-]+:[a-z0-9_.-]+$/i.test(input.name)) {
    throw new Error(`Invalid icon name: "${input.name}". Use family:name format, such as "lucide:rocket".`);
  }
  const [family, name] = input.name.split(":");
  const height = input.height ?? 64;
  const svg = await fetchText(`${ICONIFY}/${family}/${name}.svg?height=${height}`);
  return {
    name: input.name,
    height,
    svg,
    note: "SVG normalized to the requested height. Many icons use currentColor and can be styled with CSS.",
  };
}
