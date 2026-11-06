---
name: awsm-materials
description: Build and edit procedural material graphs in MaterialCraft with reference-based surface design, parameterized nodes, tiling checks and verified output maps. Use for a material-only job or an explicitly requested surface stage of a model.
---

# Deliberate materials in the active application

Use craft_prepare for materialcraft and the resolved briefId. Default to the attached
visible app, inspect session_inspect and ui_inspect where available, and preserve
the package/graph already open. Do not create or open another package implicitly.
A material task does not authorize modeling, texture painting or a website.

## Reference and surface contract

Inspect a relevant surface reference. Separate actual observations from estimates:
base substance, grain/pore scale, direction, coating, roughness variation, wear and
edge response. Own routine artistic choices unless constrained. State the intended
real-world or relative pattern scale; a small grain should not look like large rocks
when applied to the eventual object. Distinguish painted metal from exposed metal.
Do not randomize every channel to suggest complexity.

Use library_list and command_list to inspect supported nodes and parameters. Build
an understandable graph: base color/material response, primary pattern, controlled
variation and named exposed parameters. Node IDs, ports and batch schema come from
the connected provider, never from imagined cross-Craft APIs. Keep batches small
enough to diagnose failed steps; command_batch does not imply universal rollback.

## Preview and correction

For a brushed coated-metal example, begin with a clean base, directional scale and
controlled roughness variation. Evaluate on the actual intended shape where possible,
not only a sphere. If the finish reads like plastic, inspect metal/coating assignments
and lighting before raising contrast everywhere. If the grain swallows the silhouette,
reduce its amplitude or change scale. Reinspect the graph and supported viewport
preview after each meaningful stage. Use neutral light to judge map behavior and a
second view for presentation; do not hide seams in an attractive render.

Check channel meaning, tiling boundaries and repetition, texture size and exposed
parameter response. Color maps and data maps need the correct consumer color-space
interpretation. Normal orientation, height intensity and packed channels are export
contracts to verify, not assumptions from a filename. Keep editable native sources.

## Optional handoff, explicit bounds

Only export when requested to an authorized location with native file-access roots.
Use material_export / outputs_export and actual schemas. A .mcmat may be used by
TextureCraft when its installed version supports that workflow; verify the receiving
result. Attached and headless modes can expose different file tools. Do not bypass
provider restrictions by executing file commands or granting unrestricted access.
Web use requires its own requested integration and real shader/material inspection.

## Completion

Show which graph/material changed, preview evidence, parameters and map meanings,
source/output paths if saved/exported, and unverified limits. Native viewport changes
are visible when attached; a moving mouse is not evidence of correctness. Use native
selection/focus where supported only to show relevant work, without fake cursor motion.
