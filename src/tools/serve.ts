// Local static server for prototype previews: http://127.0.0.1:<port>/

import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
};

let active: { base: string; port: number; server: http.Server } | undefined;

function startServer(base: string, wantPort: number): Promise<{ server: http.Server; port: number }> {
  const handler: http.RequestListener = (req, res) => {
    try {
      const rel = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
      const relative = rel.replace(/^\/+/, "");
      if (relative.split(/[\\/]/).some((part) => part.startsWith(".") || part === "node_modules")) {
        res.writeHead(403).end("Forbidden");
        return;
      }
      let file = path.resolve(base, relative);
      if (file !== base && !file.startsWith(base + path.sep)) {
        res.writeHead(403).end("Forbidden");
        return;
      }
      // Prevent project-directory symlinks from exposing files outside the root.
      const real = fs.existsSync(file) ? fs.realpathSync(file) : file;
      const realBase = fs.realpathSync(base);
      if (real !== realBase && !real.startsWith(realBase + path.sep)) {
        res.writeHead(403).end("Forbidden");
        return;
      }
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
        const idx = path.join(file, "index.html");
        if (fs.existsSync(idx)) file = idx;
      }
      if (fs.existsSync(file)) {
        const target = fs.realpathSync(file);
        if (target !== realBase && !target.startsWith(realBase + path.sep)) {
          res.writeHead(403).end("Forbidden");
          return;
        }
      }
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
        res.writeHead(404).end("Not found");
        return;
      }
      res.writeHead(200, { "Content-Type": MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream" });
      fs.createReadStream(file)
        .on("error", () => res.destroy())
        .pipe(res);
    } catch {
      res.writeHead(500).end("Error");
    }
  };

  return new Promise((resolve, reject) => {
    const server = http.createServer(handler);
    const onError = (err: NodeJS.ErrnoException) => {
      server.close();
      if (err.code === "EADDRINUSE") reject(Object.assign(new Error("port is in use"), { code: "EADDRINUSE" }));
      else reject(err);
    };
    server.once("error", onError);
    server.listen(wantPort, "127.0.0.1", () => {
      server.off("error", onError);
      // Let the MCP process exit when the stdin/stdout transport closes.
      server.unref();
      resolve({ server, port: wantPort });
    });
  });
}

export async function serve(input: { root?: string; port?: number; action?: "start" | "stop" }) {
  if (input.action === "stop") {
    if (!active) return { note: "No static preview server is running." };
    const url = `http://127.0.0.1:${active.port}/`;
    active.server.close();
    active.server.closeIdleConnections?.();
    active = undefined;
    return { stopped: true, url };
  }

  const base = path.resolve(input.root ?? ".");
  if (base === path.parse(base).root || base === process.env.HOME) {
    throw new Error("Choose a dedicated prototype folder; do not serve the filesystem root or home directory.");
  }
  if (!fs.existsSync(base) || !fs.statSync(base).isDirectory()) {
    throw new Error(`Folder not found: ${base}`);
  }
  if (active && active.base === base) {
    return { url: `http://127.0.0.1:${active.port}/`, root: base, note: "A preview server for this folder is already running." };
  }
  if (active) {
    active.server.close();
    active.server.closeIdleConnections?.();
  }

  let started: { server: http.Server; port: number } | undefined;
  let lastError: unknown;
  for (let attempt = 0; attempt < 10 && !started; attempt++) {
    try {
      started = await startServer(base, (input.port ?? 4321) + attempt);
    } catch (err) {
      if ((err as NodeJS.ErrnoException)?.code !== "EADDRINUSE") throw err;
      lastError = err;
    }
  }
  if (!started) {
    throw new Error(`No available port starting at ${input.port ?? 4321}: ${String(lastError)}`);
  }

  active = { base, port: started.port, server: started.server };
  return {
    url: `http://127.0.0.1:${started.port}/`,
    root: base,
    note: "Bound to localhost only (127.0.0.1). This is a preview; the entry page should be index.html.",
  };
}
