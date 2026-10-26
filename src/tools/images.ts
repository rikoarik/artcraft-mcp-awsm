// Multi-provider image search: openverse (default, no key), pexels, unsplash, picsum.

import { fetchJson } from "../util.js";

export type ImageProvider = "openverse" | "pexels" | "unsplash" | "picsum";

export async function findImages(input: {
  query: string;
  provider?: ImageProvider;
  limit?: number;
  width?: number;
  height?: number;
}) {
  const provider = input.provider ?? "openverse";
  const limit = Math.min(Math.max(input.limit ?? 8, 1), 20);

  switch (provider) {
    case "picsum": {
      const seed =
        input.query.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 40) || "seed";
      const w = input.width ?? 800;
      const h = input.height ?? 600;
      return {
        provider,
        count: limit,
        images: Array.from({ length: limit }, (_, i) => ({
          url: `https://picsum.photos/seed/${seed}-${i + 1}/${w}/${h}`,
          note: "Random photo; it may not match the search subject. Use only as a labeled placeholder.",
        })),
      };
    }

    case "pexels": {
      const key = process.env.PEXELS_API_KEY;
      if (!key) {
        throw new Error(
          "The pexels provider requires PEXELS_API_KEY in the MCP process environment. Do not store the key in a committed configuration file.",
        );
      }
      const data = await fetchJson<{ photos: Array<Record<string, unknown>> }>(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(input.query)}&per_page=${limit}`,
        { headers: { Authorization: key } },
      );
      return {
        provider,
        count: data.photos.length,
        images: data.photos.map((p) => ({
          url: (p.src as Record<string, string> | undefined)?.large,
          thumb: (p.src as Record<string, string> | undefined)?.small,
          alt: (p.alt as string) ?? "",
          creator: (p.photographer as string) ?? "",
          page: (p.url as string) ?? "",
        })),
      };
    }

    case "unsplash": {
      const key = process.env.UNSPLASH_ACCESS_KEY;
      if (!key) {
        throw new Error(
          "The unsplash provider requires UNSPLASH_ACCESS_KEY in the MCP process environment.",
        );
      }
      const data = await fetchJson<{ results: Array<Record<string, unknown>> }>(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(input.query)}&per_page=${limit}`,
        { headers: { Authorization: `Client-ID ${key}` } },
      );
      return {
        provider,
        count: data.results.length,
        images: data.results.map((r) => ({
          url: (r.urls as Record<string, string> | undefined)?.regular,
          thumb: (r.urls as Record<string, string> | undefined)?.small,
          alt: (r.description as string) ?? (r.alt_description as string) ?? "",
          creator: ((r.user as Record<string, unknown> | undefined)?.name as string) ?? "",
          page: (r.links as Record<string, string> | undefined)?.html,
        })),
      };
    }

    default: {
      // Openverse filters for commercial-use CC/PD results; verify individual licenses.
      const u = new URL("https://api.openverse.org/v1/images/");
      u.searchParams.set("q", input.query);
      u.searchParams.set("page_size", String(limit));
      u.searchParams.set("license_type", "commercial");
      const data = await fetchJson<{ results: Array<Record<string, unknown>> }>(u);
      return {
        provider: "openverse",
        count: data.results.length,
        images: data.results.map((r) => ({
          url: (r.url as string) ?? "",
          thumb: (r.thumbnail as string) ?? "",
          title: (r.title as string) ?? "",
          creator: (r.creator as string) ?? "",
          license: `${(r.license as string) ?? ""} ${(r.license_version as string) ?? ""}`.trim(),
          attribution: (r.attribution as string) ?? "",
          page: (r.foreign_landing_url as string) ?? "",
          width: (r.width as number) ?? null,
          height: (r.height as number) ?? null,
        })),
        licenseNote: "Results are filtered for commercial use. Verify each license and attribution requirement at the source before publishing.",
      };
    }
  }
}
