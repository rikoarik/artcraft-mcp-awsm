import { randomUUID } from "node:crypto";
import { z } from "zod";

export const answersSchema = z.object({
  outcome: z.enum(["website", "app", "figcraft", "model-3d", "cad"]).optional(),
  platform:z.enum(["flutter","react-native","compose"]).optional(),
  category: z.enum(["marketing", "admin", "mobile", "web-app"]).optional(),
  projectMode: z.enum(["existing", "new"]).optional(),
  target: z.string().trim().min(1).max(2000).optional(),
  style: z.string().trim().min(1).max(2000).optional(),
  threeD: z.enum(["none", "render", "interactive"]).optional(),
  scope: z.string().trim().min(1).max(4000).optional(),
  source: z.enum(["direct", "cadcraft"]).optional(),
  preview: z.enum(["none", "figcraft"]).optional(),
  motion: z.enum(["none", "feedback", "scroll", "immersive-3d"]).optional(),
  session: z.enum(["visible", "separate"]).optional(),
}).strict();
export type Answers = z.infer<typeof answersSchema>;
type Draft = { answers: Answers; mode:"automatic"|"guided"; summaryShown: boolean; confirmed: boolean; updated: number };
const drafts = new Map<string, Draft>();
const TTL = 60 * 60 * 1000;
const MAX_DRAFTS = 100;
function prune() {
  for (const [id, draft] of drafts) if (Date.now() - draft.updated > TTL) drafts.delete(id);
}
function get(id?: string): Draft {
  prune();
  const draft = id ? drafts.get(id) : undefined;
  if (!draft) throw new Error("Brief missing or expired. Use design_brief and collect the user's choices first.");
  return draft;
}
export function designBrief(input: { briefId?: string; answers?: Answers; confirm?: boolean; mode?:"automatic"|"guided"; recommendations?:Answers }) {
  prune();
  const briefId = input.briefId ?? randomUUID();
  if (!input.briefId && drafts.size >= MAX_DRAFTS) throw new Error("Too many active briefs.");
  const draft = input.briefId ? get(input.briefId) : { answers: {}, mode:input.mode??"automatic", summaryShown: false, confirmed: false, updated: Date.now() };
  if(input.mode && input.mode!==draft.mode){draft.mode=input.mode;draft.confirmed=false;draft.summaryShown=false;}
  const proposal=answersSchema.parse(input.recommendations??{});
  const creative=["category","style","threeD","scope","motion","platform"];
  if(Object.keys(proposal).some(k=>!creative.includes(k)))throw new Error("Recommendations cannot choose the output, project or document target.");
  if(draft.mode==="guided" && Object.keys(proposal).length)throw new Error("Guided mode requires user answers.");
  for(const [key,value] of Object.entries(proposal)) {
    const existing=draft.answers[key as keyof Answers];
    if(existing!==undefined && existing!==value)throw new Error("Recommendation conflicts with an existing choice: "+key);
  }
  const patch = answersSchema.parse({...proposal,...(input.answers??{})});
  const changed = Object.entries(patch).some(([k, v]) => draft.answers[k as keyof Answers] !== v);
  if (changed) {
    // Changing the deliverable invalidates downstream choices rather than silently reusing them.
    if (patch.outcome && patch.outcome !== draft.answers.outcome) draft.answers = {};
    if(patch.threeD==="none" && draft.answers.outcome==="website") {
      delete draft.answers.preview;
      delete draft.answers.session;
    }
    draft.answers = { ...draft.answers, ...patch };
    draft.summaryShown = false;
    draft.confirmed = false;
  }
  draft.updated = Date.now();
  drafts.set(briefId, draft);
  const a = draft.answers;
  const recommend: Array<keyof Answers>=[];
  const questions: Array<{ field: keyof Answers; question: string; options?: string[] }> = [];
  const ask = (field: keyof Answers, question: string, options?: string[]) => {
    if(!a[field] && draft.mode==="automatic" && creative.includes(field)){recommend.push(field);return;}
    if (!a[field]) questions.push({ field, question, ...(options ? { options } : {}) });
  };
  ask("outcome", "Mau menghasilkan apa?", ["website", "app", "figcraft", "model-3d", "cad"]);
  if (a.outcome) {
    if(a.outcome==="app") {ask("platform", "Platform aplikasi", ["flutter","react-native","compose"]);if(draft.mode==="automatic")ask("motion", "Arah motion", ["none","feedback"]);}
    if(a.outcome==="model-3d")ask("source", "Model 3D dibuat langsung atau berdasarkan gambar CADCraft?", ["direct", "cadcraft"]);
    if (a.outcome === "website" || a.outcome === "figcraft") {
      ask("category", "Jenis tampilan apa yang kamu butuhkan?", ["marketing", "admin", "mobile", "web-app"]);
      if(draft.mode==="automatic")ask("motion", "Arah motion", ["none","feedback","scroll","immersive-3d"]);
      ask("threeD", "Visual 3D-nya seperti apa?", a.outcome==="figcraft"?["none", "render"]:["none", "render", "interactive"]);
    }
    if(a.outcome==="figcraft" && a.threeD==="interactive")throw new Error("Interactive 3D is a website output; FigCraft supports a rendered image preview. Ask the user to choose render or change the output.");
    if(a.outcome==="website" && a.threeD && a.threeD!=="none")ask("preview", "Selain website, perlu menaruh preview di FigCraft?", ["none", "figcraft"]);
    ask("projectMode", "Edit pekerjaan yang sudah ada atau buat baru?", ["existing", "new"]);
    ask("target", "Dokumen atau folder proyek mana yang ingin dipakai? Untuk yang baru, tentukan tujuan pembuatannya.");
    ask("style", "Gaya visual atau referensi mana yang dipilih? Bisa juga mempertahankan gaya yang ada.");
    ask("scope", "Halaman, objek, atau bagian apa saja yang perlu dibuat atau diubah?");
    if (!["website","app"].includes(a.outcome) || (a.threeD && a.threeD !== "none")) {
      ask("session", "Kerjakan di aplikasi yang terlihat atau sesi terpisah?", ["visible", "separate"]);
    }
  }
  if(recommend.length && !questions.length) {
    if(input.confirm)throw new Error("Research and complete the recommendations before proceeding.");
    return {status:"needs-recommendations",briefId,answers:a,fields:recommend,
      instruction:"Do not ask the user to choose fonts, colors, icons, assets or routine motion. Read design_guidance research and screen phases, inspect relevant references, recommend missing creative fields using recommendations, and proceed in automatic mode. Respect explicit user constraints. Ask only for missing domain facts or an ambiguous target."};
  }
  if (questions.length) {
    if (input.confirm) throw new Error("Cannot confirm an incomplete brief.");
    return { status: "needs-answers", briefId, answers: a, recommendationsNeeded:recommend, mode:draft.mode, questions: questions.slice(0, 3), remaining: questions.length,
      instruction: "Ask these questions using the host's question UI or chat. Record only explicit user answers; do not infer choices from keywords. Do not start implementation." };
  }
  if(draft.mode==="automatic")draft.confirmed=true;
  if (input.confirm && draft.mode==="guided") {
    if (!draft.summaryShown || changed) throw new Error("Show the summary first, then confirm in a separate call after the user's approval.");
    draft.confirmed = true;
  }
  draft.summaryShown = true;
  return { status: draft.confirmed ? "ready" : "needs-confirmation", briefId, summary: a, mode:draft.mode,
    ...(draft.confirmed ? { route: route(a) } : { question: "Pilihan ini sudah sesuai dan boleh mulai dikerjakan?", instruction: "Show the summary to the user. Call confirm:true only after their approval; do not supply new answers in that call." }) };
}
function route(a: Answers) {
  const crafts = a.outcome === "model-3d" ? [...(a.source==="cadcraft"?["cadcraft"]:[]),"solidcraft"] : a.outcome === "cad" ? ["cadcraft"] : a.outcome==="app"?[]:
    [...(a.outcome === "figcraft" || (a.threeD!=="none" && a.preview === "figcraft") ? ["figcraft"] : []), ...(a.threeD && a.threeD !== "none" ? ["solidcraft"] : [])];
  const uiSkill = a.outcome==="app"?"awsm-app-ui":a.category === "marketing" ? "awsm-product-ui" : a.category === "admin" ? "awsm-admin-dashboard" :
    a.category === "mobile" ? "awsm-app-ui" : "awsm-ui-ux-best-practices";
  return { crafts, uiSkill, website: a.outcome === "website", threeD: a.outcome === "model-3d" ? "native-model" : a.threeD ?? "none" };
}
export function confirmedBrief(id?: string) {
  const draft = get(id);
  if (!draft.confirmed) throw new Error("The user must approve the design_brief summary before implementation.");
  return { ...draft.answers, route: route(draft.answers) };
}

export function authorizeCraft(server:string,briefId?:string) {
  const choices=confirmedBrief(briefId);
  if(!choices.route.crafts.includes(server))throw new Error("This Craft is not part of the user's confirmed choices.");
  return choices;
}

export function briefContext(id:string) {
  const draft=get(id);
  return {answers:{...draft.answers},confirmed:draft.confirmed};
}
