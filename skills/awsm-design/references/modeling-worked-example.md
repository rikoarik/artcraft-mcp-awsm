# Worked example: a parametric desk speaker

Illustrative dimensions for practicing a modeling workflow, not measured product
facts, manufacturing advice or a claim that a native model was executed. Adapt the
geometry and native APIs to the actual references and installed SolidCraft version.

## Reference and parameter brief

Prompt intent: a compact desk speaker, rounded enclosure, visible front grille and
one top control. Inspect supplied front/side/3/4 references; record silhouette,
height/width ratio, grille inset, control position and finish. Research a creator/
product source if visual references are absent and relevant. Distinguish estimates
from measured functional dimensions; ask when fit/fabrication requires exact values.

For this illustrative exercise only: width 140 mm, height 200 mm, depth 120 mm,
wall 4 mm; Z is up, X width, Y depth, base on Z=0. Body center is (0,0,100), outer
bounds X=[-70,70], Y=[-60,60], Z=[0,200]. Initial interior envelope before edge
and opening details is 132×112×192 mm. Edge radii must fit the sketch/body and
wall design; do not assume a particular fillet radius remains valid after edits.
Name parameters and features so the user can revise proportions without a rebuild.

## Construction and independent checks

| Stage | Native intent (discover actual commands) | Check before continuing |
| --- | --- | --- |
| Envelope | Constrained rounded outline / primary body | Outer bounds and front/side ratio match parameter brief |
| Enclosure | Supported hollowing or explicit cavity | Wall/closed-back intent and opening direction; no unintended solid plug |
| Front | Separate grille/frame with intended seat | Front plane, inset and clearance; no floating or intersecting parts |
| Control | Parameterized recess/control at approved location | Top projection and sensible contact/fit; preserve wall where required |
| Edge/material | Apply supported edge treatment and coherent appearances | No feature failures, unexplained transparency or changed overall size |

Use native modeling/editing/checking skills and actual tool schemas. The table is
not executable command syntax. Do not copy invented sketch or boolean parameters.
Work in staged batches with rollback as supported; inspect after each stage.
A cavity reduces volume relative to its solid envelope, but rounded geometry means
simple cuboid volume arithmetic is only a sanity bound, not exact expected volume.

## Visual review and targeted revision

Inspect front, side, top and 3/4 views. Example finding: front grille occupies too
little height compared with the reference. Revise its named dimensions, not camera
zoom to disguise the error. Example finding: control floats above the enclosure.
Fix its placement/contact. Re-measure after either edit and check dependent features.
Use coherent metal/polymer material regions appropriate to the prompt; geometry
must be convincing before investing in lighting and render samples.

When parametric behavior is requested, change one independent dimension in an
isolated/undoable check, verify dependencies, then restore the requested value.
Do not perturb a live design without a recoverable operation. Save the editable
native model to the authorized target and state if it remains unsaved.

## Optional web handoff

Only for a requested website integration: verify scale, origin/pivot, tessellation,
normals, material loss and filesize. OBJ exports are not optimized/material-complete
GLB. Use an available trusted converter if appropriate, inspect the converted asset,
then implement the scene score in motion-worked-example.md with a static fallback.
A model-only job ends before this step. Report real validation and images separately
from estimates or untested manufacturing suitability.
