# Worked score: desk speaker product story

Illustrative choreography, not a claim that a model or website was built. Keep this
example only when it fits the real brief. It is not Corn Revolution's measured
implementation. Values below are starting art direction to inspect and tune.

## Select technique and story

Goal: understand enclosure, internal assembly and the next purchase/inquiry action.
If only a product overview is needed, a still render plus DOM is sufficient. Use
an image sequence for a fixed cinematic view; use real 3D only if camera/object
interaction or assembly states add information. Build a native model only if the
requested deliverable needs it; do not make SolidCraft a prerequisite for all motion.

Assume a verified model and authorized assets already exist for this example.
Independent layers: environment/backdrop, speaker, a foreground detail/occluder and
semantic DOM copy. One progress authority drives camera/object and DOM state.

| Segment / local progress | User learns | Subject/camera | Copy / backdrop | Mobile / reduced motion |
| --- | --- | --- | --- | --- |
| Opening, 0–0.2 | What the object is | Stable 3/4 view; small dolly only if depth remains readable | Headline visible immediately; material field grounds object | Static art-directed crop, same headline |
| Exterior, 0.2–0.45 | Controls and material | Turn object about 25 degrees toward control face; avoid simultaneous large camera orbit | Hold feature copy while control face is readable; background separates silhouette | Smaller turn or second still; no long pin |
| Assembly, 0.45–0.75 | How enclosure and driver relate | Fixed camera; separate named parts along assembly axis within verified range | Labels anchored to parts; quieter background and explicit reading hold | Stacked detail stills with captions |
| Reassembly, 0.75–0.9 | Recognizable final product | Parts return to verified assembled positions before transition | Detail labels exit; product identity remains | Immediate assembled state |
| Action, 0.9–1 | What to do next | Subject settles; no motion under pointer | CTA is ordinary DOM, full contrast, no scroll lock | Same reachable CTA |

Use local section progress, not a single arbitrary document-wide fraction: map
start/end positions from the actual layout. For a property, use a clamped interval
and deliberate interpolation; e.g. exterior rotation is 0 before its start, blends
to the approved angle, then holds. Do not animate assembly translations past their
safe endpoint. Set text visibility from readable states, never a perpetually hidden
initial class. Tune timing in the real browser after fonts/images/layout settle.

## Integration recipe

1. Use the actual route's component lifecycle. Load only the needed model/media and
show a useful poster while loading. Keep DOM content available if scene loading fails.
2. Reuse existing scroll/animation infrastructure. If the repo uses a smooth-scroll
clock, attach the timeline to it; do not create a competing requestAnimationFrame
loop. If no library is needed, native sticky layout plus a small progress controller
may suffice. Fetch current docs before using GSAP/Motion/Three APIs.
3. Separate scene state (object transforms/camera) from business actions (form/CTA).
Bound resizing, DPR, offscreen work and model resources. On route exit, dispose
listeners, observers, timelines and graphics resources according to the framework.
4. React Bits is optional: inspect one relevant demo/source and adapt its matching
variant. A restrained text transition might support the exterior section; a noisy
background behind assembly labels would undermine it. Record what was used and why.

## Acceptance and failure correction

Capture each segment's entrance, hold and exit, then reverse scroll and jump rapidly.
If labels flash before their part is visible, change the ranges/hold; do not add a
longer global delay. If mobile text covers the object, recompose it rather than
scaling the desktop scene. If loading or reduced motion produces a blank canvas,
render the poster/static narrative and keep the CTA available. Measure the page on
target hardware before asserting smoothness. An .mjs screenshot helper is QA, not
the implemented experience.
