# Deliberate 3D from reference to validation

Use native SolidCraft modeling, editing and checking references when available.
Do not confuse a gateway with a geometric reasoning engine: the agent translates
a design intent into measured native operations and examines the result.

## Define the object

Read supplied images/plans from front, side and three-quarter views where available.
Identify silhouette, dominant proportions, negative space, seams, edge treatment,
material zones and grounding. Label measured values separately from estimates.
Find a relevant reference from an attributable product/creator source if none was
supplied and the task needs one. Never invent dimensions as reference facts.

Write a concise modeling brief: purpose; coordinate system/units; envelope dimensions;
primary/secondary forms; parameters; joins/openings; material assignment; intended
camera and output. Ask for missing functional dimensions when correctness depends
on them; choose reversible visual proportions when the prompt delegates design.
A user should not have to specify every bevel or roughness value.

## Construct in reviewable stages

Inspect the active design and protect existing features. Build the primary silhouette
first; check front/side/top projections before adding details. Use constrained
sketches and named dimensions/features. Model meaningful thickness, clearances and
connections. Add secondary forms, openings, then edge treatment; avoid burying a
bad silhouette under decorative grooves or many unrelated primitive solids.
Use staged native batches with supported rollback. Validate batch schemas from the
actual provider; never invent engine commands or assume all apps share an API.

After each stage inspect feature errors, bounds, body count and relevant measures.
Check the render too: verify proportions, floating/intersecting parts, reversed
faces where detectable, noisy tessellation and unexpected transparency. Re-measure
after geometry changes. A visually attractive screenshot is not dimensional proof.

## Material and presentation

Assign coherent material regions rather than arbitrary per-body colors. Use plausible
roughness/metal treatment only within the installed renderer's supported capabilities.
Check edge highlights, contact shadows, silhouette separation, camera focal length
and framing. A polished render cannot fix inaccurate geometry. For organic/cloth or
photoreal requirements outside the engine's strengths, explain the limitation and
use an appropriate existing tool when available; do not claim unsupported fidelity.

## Web handoff only when requested

A model-only task ends with the editable native model and relevant verification.
For a website, choose static render, image sequence or interactive geometry from the
story's need, not from what is easiest to export. Preserve the native source.
Inspect scale, orientation, pivot, triangulation, normals, material loss, filesize
and loading. OBJ is geometry interchange; do not call it optimized GLB or preserved
PBR. Convert only through an available trusted converter and verify the result.
Map camera/object states to the section score in motion-direction.md; include a
poster for loading, unavailable WebGL and reduced motion. A PNG placed in FigCraft
is a 2D preview, not editable 3D geometry.

## Exit evidence

Deliver source location, dimensions/units, validation result, inspected views,
material/camera choices and known limits. Explicitly identify unsaved changes or
uncertain mutation results. Do not automatically replay a timed-out modeling batch.
