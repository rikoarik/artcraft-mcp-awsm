import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { confirmedBrief, briefContext } from "./design-brief.js";

export const phases = ["routing", "research", "screens", "components", "assets", "implementation", "handoff", "motion", "modeling", "validation"] as const;
export type Phase = typeof phases[number];
export const intents = ["create", "edit", "audit", "adapt-template", "to-figcraft", "from-figcraft"] as const;
export type Intent = typeof intents[number];
const cache = new Map<string, Promise<string>>();
function read(relative: string) {
  let value = cache.get(relative);
  if (!value) {
    value = fs.readFile(fileURLToPath(new URL("../../skills/" + relative, import.meta.url)), "utf8");
    cache.set(relative, value);
    void value.catch(() => cache.delete(relative));
  }
  return value;
}
export async function designGuidance(input: {
  phase: Phase; briefId?: string; intent?: Intent; speed?: "fast" | "balanced"; assetKind?: "source" | "svg";
}) {
  const { phase } = input;
  const intent = input.intent ?? "create";
  const context = input.briefId ? briefContext(input.briefId) : undefined;
  const preliminary = ["routing", "research", "screens"].includes(phase);
  const choice = input.briefId && (context?.confirmed || !preliminary) ? confirmedBrief(input.briefId) : undefined;
  if (!choice && !preliminary) throw new Error("Complete design_brief before loading execution guidance.");
  if (choice && phase === "modeling" && !choice.route.crafts.includes("solidcraft")) throw new Error("3D is not part of this task.");
  if (choice && phase === "motion" && choice.motion === "none") throw new Error("Motion was explicitly excluded.");
  if (choice && intent === "to-figcraft" && choice.outcome !== "figcraft") throw new Error("FigCraft output was not selected.");
  if (choice && intent === "from-figcraft" && !["website", "app"].includes(choice.outcome!)) throw new Error("Code output was not selected.");
  const uiSkill = choice?.route.uiSkill ?? "awsm-ui-ux-best-practices";
  const outcome=choice?.outcome??context?.answers.outcome;
  const native = outcome === "app";
  const canvas=outcome==="figcraft";
  const geometry=outcome==="model-3d"||outcome==="cad";
  if(geometry && phase==="components")throw new Error("Geometry-only work uses the native modeling/drafting guide, not UI components.");
  if(geometry && phase==="motion")throw new Error("A model/drawing request does not select web motion. Use its native workflow.");
  let names: string[] = [];
  let references: string[] = [];
  switch (phase) {
    case "routing":
      names = ["awsm-design"];
      if (intent === "create" && outcome==="website") names.push("awsm-prompt-to-prototype");
      break;
    case "research":
      if(geometry) {references=[outcome==="cad"?"cad-workflow":"modeling-direction"];break;}
      names = [intent === "audit" ? "awsm-antislop-ui" : "awsm-taste-ui"];
      if (intent === "adapt-template") names.push("awsm-template-adapter");
      references = ["research-direction", "visual-decisions"];
      break;
    case "screens":
      if(geometry){references=[outcome==="cad"?"cad-workflow":"modeling-direction"];break;}
      names = [uiSkill];
      references = ["screen-blueprints"];
      if (choice?.category === "admin") references.push("admin-worked-example");
      if (native || choice?.category === "mobile") references.push("platform-patterns", "mobile-worked-example");
      break;
    case "components":
      names = ["awsm-design-system", "awsm-typography", "awsm-iconography"];
      references = ["component-worked-example"];
      break;
    case "assets":
      if(geometry){references=[outcome==="cad"?"cad-workflow":"modeling-direction"];break;}
      names = ["awsm-assets"];
      if (input.assetKind === "svg") names.push("awsm-asset-lab");
      references = ["visual-decisions"];
      break;
    case "implementation":
      if(geometry){references=outcome==="cad"?["cad-workflow"]:["modeling-direction","modeling-worked-example"];break;}
      if(canvas){names=["awsm-figcraft-handoff"];references=["canvas-workflow"];break;}
      names = native ? ["awsm-app-ui"] : [input.speed === "fast" ? "awsm-fast-design" : "awsm-auto-prototype"];
      if (intent === "adapt-template") names.push("awsm-template-adapter");
      if (intent === "from-figcraft") names.push("awsm-figcraft-to-web");
      if (intent === "to-figcraft") names = ["awsm-figcraft-handoff"];
      if (native) references = ["platform-patterns", "mobile-worked-example"];
      break;
    case "handoff":
      if (!["from-figcraft", "to-figcraft"].includes(intent)) throw new Error("Choose an explicit handoff direction.");
      names = [intent === "to-figcraft" ? "awsm-figcraft-handoff" : "awsm-figcraft-to-web"];
      break;
    case "motion":
      if(canvas){references=["canvas-workflow"];break;}
      names = [native ? "awsm-app-ui" : "awsm-motion-storyboard"];
      references = native ? ["platform-patterns", "mobile-worked-example"] : ["motion-direction", "motion-worked-example"];
      break;
    case "modeling":
      references = ["modeling-direction", "modeling-worked-example"];
      break;
    case "validation":
      if(geometry){references=[outcome==="cad"?"cad-workflow":"modeling-direction","validation-matrix"];break;}
      if(canvas){references=["canvas-workflow","validation-matrix"];break;}
      names = native ? ["awsm-app-ui"] : ["awsm-visual-qa", "awsm-prototype-qa", "awsm-responsive-audit"];
      references = ["validation-matrix"];
      break;
  }
  const files = [...new Set([...names.map(n => n + "/SKILL.md"), ...references.map(n => "awsm-design/references/" + n + ".md")])];
  return {
    phase, intent, choices: choice, draft: context?.answers,
    guides: await Promise.all(files.map(async file => ({ file, content: await read(file) }))),
    instruction: "Execute the current phase; do not restart the intake or load every phase. Use real source and rendered evidence. Guidance loading is not research, implementation or QA proof.",
  };
}
