---
name: awsm-design
description: One practical design-to-code skill for AWSM. Use for designing websites, admin dashboards, mobile UI, FigCraft handoff, responsive implementation, fonts, icons, assets, CADCraft architectural drafting, CADCraft-to-SolidCraft building modeling and visual quality checks.
---

# AWSM: route, execute, verify

## One intake, appropriate execution

Use design_brief automatic mode for ordinary product prompts. The agent researches
and owns routine color, typography, icon, imagery and motion decisions. Ask only
for missing domain facts or an ambiguous target; reuse answers already supplied.
Use guided mode only when the user wants to choose. It requires a displayed summary
and separate confirmation. Automatic mode resolves researched recommendations
without a visual-choice approval ceremony. Respect explicit constraints in both.

A resolved briefId connects the work; do not restart intake when loading another
phase. Load design_guidance for only the current phase and observed task intent.
The MCP returns instructions, not hidden reasoning or autonomous research. Use the
client's actual browsing, file editing and visual tools. Never claim a source was
inspected or a render verified merely because a guide was returned.

## Select the destination before tools

- Website or native app implementation: design_quickstart with briefId, then the
  relevant implementation phase. App output includes its actual platform. A mobile
  breakpoint does not make a website a native app.
- FigCraft-only design/edit: craft_prepare with craft figcraft and briefId. Use
  native editable frames/text/layout/components; do not generate a website.
- CAD drawing: craft_prepare with craft cadcraft, inspect real units/entities/layers.
- Requested CAD-to-3D: inspect authoritative CAD geometry, then model in SolidCraft;
  dimensions absent from the plan remain unknown or explicitly estimated.
- Handoff: set intent to-figcraft or from-figcraft only for the requested direction.
  Never let an optional preview imply editable 3D or a new website.

## Direct 3D: SolidCraft only

For standalone models, edits and renders, use SolidCraft and the resolved brief.
Do not connect CADCraft without a source-plan task; do not create a website or
FigCraft preview just because a model exists. A native model-only deliverable is
complete when the requested editable source and verification are provided.

Style-first 3D direction: inspect actual references and establish units, dimensions,
silhouette, feature hierarchy and material zones before detailed construction.
Use native skill_reference for modeling/editing/checking and actual command schemas.
Build staged, named parametric features. Inspect images and compare silhouette, ratio, edge treatment
against the reference. Re-measure after geometry edits. Keep unsaved work and the
original design safe; inspect after uncertain mutations instead of replaying them.
Load modeling-direction and modeling-worked-example through design_guidance.
They are workflows, not invented executable CAD commands or a fabrication guarantee.

## Focused guidance, not the whole library

Use routing for orchestration; research for sources/direction (audit or template
intent where relevant); screens for the smallest complete flow; components for
reusable state contracts; assets for sourcing or original simple SVG; implementation
for actual code/canvas changes; handoff for explicit direction; motion/modeling
only when relevant; validation for proportionate acceptance. Specialist content is
available through MCP even with a core-only client installation. Do not ask users
to name skills or explicitly enable the expanded library.

## Target and evidence boundaries

Inspect the actual document/project. Prefer its visible session for edits; never
silently replace it with headless work. Pass briefId with Craft mutation calls.
A brief target is intent, not a lock: reinspect after tab changes. Do not weaken
file-access policy or overwrite customized user files to make a task appear done.
Use native exports for independent artwork; retain functional text and controls.

Deliver the scoped working artifact with relevant source paths, inspected output,
working/simulated/blocked behaviors and material limits. For web use the real dev
server and review_ui when available; verify actions separately. For apps inspect
the actual runtime; for models check dimensions/features and views. A build, static
mockup, guide response or screenshot alone cannot prove every kind of completion.


## Visible native surface work

MaterialCraft material-only and TextureCraft texture-only requests end in those
native sessions; they do not imply a new mesh, website or another application.
Use craft_prepare for the selected provider. All Craft bridge entry points default
to visible attached operation, including direct bridge_call/list discovery with
connect enabled. No endpoint means a connection requirement, not silent headless
work. An explicitly requested separate session uses headless preparation or an
explicit sessionMode configuration. Do not restart unsaved apps automatically.

AWSM prepares missing official connectors and starts the selected installed app
visibly when it is closed. Call craft_prepare first; do not turn internal port,
CLI or bridge setup into homework for the user. Reuse open work. If a native app
was opened without automation and cannot enable it live, explain the single
reconnect needed, preserve unsaved changes, and let AWSM handle the next launch.
Do not promise that an unexposed native session can be attached without reconnecting.

Preparation returns matching materials/texturing guidance. Bridge results append
guidance once per brief/provider while retaining original native text/images/error
fields. Native SolidCraft skill_reference remains authoritative for its commands.
Use native selection and UI/viewport inspection to expose relevant work when
supported. FigCraft can display agent presence and changed-layer outlines; this is
not a promise of a moving mouse in every Craft. Never fake pointer activity.
