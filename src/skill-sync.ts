import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/**
 * Update only AWSM-managed SKILL.md files. A user edit always wins.
 * A file not previously recorded as managed is never overwritten.
 */
export function syncSkills(sourceDir: string, targetDir: string, force = false) {
  const statePath = path.join(targetDir, ".awsm-managed.json");
  const state: { version: number; files: Record<string, string> } = { version: 1, files: {} };
  try {
    const old = JSON.parse(fs.readFileSync(statePath, "utf8")) as { version?: number; files?: Record<string, string> };
    if (old.version === 1 && old.files && typeof old.files === "object") state.files = old.files;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT")
      throw new Error("Invalid AWSM skills state file; refusing to overwrite managed skills.");
  }
  const sha = (text: string) => crypto.createHash("sha256").update(text).digest("hex");
  let added = 0, updated = 0, preserved = 0, unchanged = 0;
  fs.mkdirSync(targetDir, { recursive: true });
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory() || !/^awsm-[a-z0-9-]+$/.test(entry.name)) continue;
    const key = entry.name + "/SKILL.md";
    const upstreamFile = path.join(sourceDir, key);
    if (!fs.existsSync(upstreamFile)) continue;
    const targetFolder = path.join(targetDir, entry.name);
    const target = path.join(targetFolder, "SKILL.md");
    const contents = fs.readFileSync(upstreamFile, "utf8");
    const upstreamHash = sha(contents);
    let current: string | undefined;
    try { current = fs.readFileSync(target, "utf8"); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    if (current !== undefined && sha(current) === upstreamHash) {
      state.files[key] = upstreamHash; unchanged++; continue;
    }
    if (current !== undefined && !force && state.files[key] !== sha(current)) {
      preserved++; continue;
    }
    fs.mkdirSync(targetFolder, { recursive: true });
    // Atomic per-file replacement; do not overwrite user-customized versions.
    const temp = path.join(targetFolder, ".SKILL.md.awsm-" + process.pid);
    try {
      fs.writeFileSync(temp, contents, { flag: "wx" });
      fs.renameSync(temp, target);
    } finally {
      try { fs.unlinkSync(temp); } catch { /* renamed */ }
    }
    state.files[key] = upstreamHash;
    if (current === undefined) added++; else updated++;
  }
  const tmpState = statePath + "." + process.pid + ".tmp";
  try {
    fs.writeFileSync(tmpState, JSON.stringify(state, null, 2) + "\n", { flag: "wx" });
    fs.renameSync(tmpState, statePath);
  } finally {
    try { fs.unlinkSync(tmpState); } catch { /* renamed */ }
  }
  return { added, updated, preserved, unchanged, targetDir };
}
