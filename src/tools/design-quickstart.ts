import { designGuidance } from "./design-guidance.js";
import { confirmedBrief } from "./design-brief.js";
import { inspectUiProject } from "./project-scan.js";
import { analyzeFigcraft } from "./handoff.js";
import { extractDesignTokens } from "./design-tokens.js";

type Kind="auto"|"marketing"|"admin"|"mobile"|"web-app";
type Speed="fast"|"balanced"|"thorough";
export async function designQuickstart(input:{
  brief:string;briefId?:string;kind?:Kind;speed?:Speed;root?:string;document?:unknown;inspectAssets?:unknown;
}) {
  const brief=input.brief.trim();
  if(brief.length<8 || brief.length>8000)throw new Error("Brief must be 8..8000 characters.");
  const speed=input.speed??"fast";
  const choices=confirmedBrief(input.briefId);
  if(!["website","app"].includes(choices.outcome!))throw new Error("Website or app implementation was not selected.");
  const kind=choices.outcome==="app"?"mobile":choices.category!;
  if(input.kind && input.kind!=="auto" && input.kind!==kind)throw new Error("UI kind conflicts with the confirmed brief.");
  if(input.root && input.root!==choices.target)throw new Error("Project root conflicts with the confirmed target.");
  const project=choices.projectMode==="existing"?await inspectUiProject({root:choices.target}):undefined;
  const figcraft=input.document===undefined ? undefined : analyzeFigcraft({document:input.document,inspectAssets:input.inspectAssets});
  const tokens=input.document===undefined ? undefined : extractDesignTokens({document:input.document});
  const workflowByKind:{
    [K in Exclude<Kind,"auto">]: { firstScreen:string; check:string[];skills:string[] }
  }={
    marketing: {firstScreen:"First viewport with real value proposition, navigation, visual proof, primary action; then one differentiated continuation section",
      check:["Does hero explain what product does?","Is imagery relevant and legally sourced?","Does mobile hierarchy preserve CTA?"],
      skills:["awsm-taste-ui","awsm-product-ui","awsm-assets"]},
    admin:{firstScreen:"Primary operational screen with sidebar or navigation, context toolbar, realistic data table and one working action",
      check:["Does navigation follow operator tasks?","Are filters/table actions real?","Do empty/loading/error states make sense?"],
      skills:["awsm-admin-dashboard","awsm-design-system","awsm-iconography"]},
    mobile:{firstScreen:"One high-priority native app journey (home/list → detail → action) with safe areas and real state transitions",
      check:["Does navigation match platform?","Does the keyboard or system bar overlap controls?","Are loading/permission/error states covered?"],
      skills:["awsm-app-ui","awsm-iconography","awsm-design-system"]},
    "web-app":{firstScreen:"One complete web task flow, including navigation, realistic content and actionable components",
      check:["Can a user finish a task?","Is state feedback correct?","Is layout usable at mobile size?"],
      skills:["awsm-auto-prototype","awsm-design-system","awsm-prototype-qa"]},
  };
  const plan=workflowByKind[kind];
  const existing=project?.reuseFirst??[];
  const blockers=figcraft?.issues.filter(i=>i.severity==="warning")??[];
  const actions=[
    "Inspect only the relevant app entry point, design tokens, and existing reusable components; avoid a full-repository inventory before first render.",
    figcraft?"Use prepared FigCraft node roles: DOM for text/controls, export plan for independent photo/vector assets; resolve ambiguous critical layers.":"Follow the user-selected visual direction: "+choices.style,
    "Reuse available framework, icons and font files before fetching new assets; batch any missing icon/photo/font lookups.",
    "Implement first priority screen with real text and data shapes. Do not write a large speculative design document first.",
    choices.outcome==="app"?"Run the target app and inspect its primary device journey, keyboard and system back. A browser image is not native-device validation.":"Render and inspect one desktop and one mobile viewport; correct the three most consequential visual/usability defects.",
  ];
  if(speed!=="fast")actions.push("Expand to the remaining required screens and validate navigation and component variants.");
  if(speed==="thorough")actions.push("Run accessibility, performance, functional journey and viewport regressions before handoff.");
  return {
    schemaVersion:"awsm.design-quickstart/v2", choices,kind,platform:choices.platform,
    guidance:await designGuidance({phase:"screens",briefId:input.briefId}),
    implementationIntent:figcraft?"from-figcraft":"create",
    implementationGuide:figcraft?await designGuidance({phase:"handoff",intent:"from-figcraft",briefId:input.briefId}):undefined,
    nextPhases:["components",...(choices.motion && choices.motion!=="none"?["motion"]:[]),...(choices.route.crafts.includes("solidcraft")?["modeling"]:[]),"validation"],speed,brief,framework:project?.framework??"unspecified",
    project:project && {root:project.root,existingDirs:existing,uiPackages:project.uiPackages, scripts:project.scripts},
    firstDeliverable:plan.firstScreen,
    inspectBudget:{maxInitialFiles:6,initialViewports:[375,1440],noMandatoryMoodboard:true},
    reusableSkills:[...new Set([...plan.skills,...(figcraft?["awsm-figcraft-to-web"]:[])])],
    figcraft:figcraft&&{summary:figcraft.summary,blockingIssues:blockers,exportPlan:figcraft.assets},
    observedTypography:tokens?.tokenCandidates && { families:tokens.tokenCandidates.fontFamilies.slice(0,5),sizes:tokens.tokenCandidates.fontSizes.slice(0,8)},
    actions,firstPassChecks:plan.check,
    deferUntilAfterPreview:speed==="fast"?["large component inventory","animation polish","multi-viewport regression","full accessibility audit"]:[],
    doneWhen:"A first useful screen is implemented and visually inspected; deferred checks must be completed before claiming production readiness.",
    note:"Fast mode accelerates the first usable render; it does not omit safeguards for destructive operations or claim a complete application.",
  };
}
