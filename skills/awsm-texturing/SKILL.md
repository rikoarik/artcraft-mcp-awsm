---
name: awsm-texturing
description: Edit TextureCraft texture sets, layers, masks and paint with mesh-aware reference analysis, bake checks and verified export contracts. Use for texture-only tasks or an explicitly requested texturing stage; preserve the open model and project.
---

# Texture the requested object in its visible session

Use craft_prepare for texturecraft with the resolved briefId. Inspect session_inspect,
ui_inspect and viewport_screenshot where supported. Preserve the existing mesh,
texture sets, layers and unsaved work; do not invoke project_new/mesh_import merely
because a tutorial begins that way. A texture task does not request a new geometric
model, MaterialCraft graph or website. Use extra tools only when explicitly selected.

## Analyze the mesh and finish

Inspect the actual model and a surface reference. Identify UV coverage, texture sets,
seams, scale/direction, overlapping areas where detectable and the semantic material
regions. Distinguish missing UVs from a bad texture and a lighting problem from a
roughness problem. State any blocked requirement instead of promising painting on
an unusable mesh. Existing project resolution and target delivery determine the
budget; do not raise every texture to the maximum size.

Plan a small layer stack: base material, named surface variation, intentional paint
or labels, masks and localized wear only where reference/context justifies it.
For a painted enclosure, keep coating and exposed substrate distinct; do not add
grime and edge wear indiscriminately. Preserve layer editability rather than baking
all work destructively into one image. Inspect actual command_list and tool schemas
for layers, generators and batch behavior. A partial batch is not an atomic rollback.

## Painting and baking

Before a stroke, inspect the current viewport, camera, selected texture set, tool
and visible region. paint_stroke coordinates are viewport pixels; never reuse
coordinates from a resized image or an old camera. Keep the camera stable for the
stroke, then inspect the result. Prefer semantic native commands when painting by
coordinates adds no value. Do not fabricate pointer motion to appear active.

Bake only maps the selected generators need, with supported settings and appropriate
resolution/cage assumptions. Inspect artifacts around seams, thin parts and nearby
surfaces; a successful bake response is not clean AO or curvature. Recheck both 3D
and UV views. Test normal orientation, roughness/metallic boundaries, texel consistency
and visible repetition. Verify reference fidelity under understandable lighting.

## Delivery and optional integration

Use native project_save/material_save/textures_export only as supported in the
current attached/headless mode and authorized roots. Some bridge path tools are
unavailable; report that limitation instead of bypassing it through command_run.
Record template/preset, map channels, resolution, padding and normal convention.
Verify actual exported files and reapplication when an engine/web consumer is in
scope. Keep the editable source and avoid silently overwriting an existing package.

Conclude with the changed texture set/layers, inspected views, source/export locations
and material limits. A viewport screenshot is a preview, not proof of web integration
or manufacturing accuracy. Loading this skill alone does not mean any painting ran.
