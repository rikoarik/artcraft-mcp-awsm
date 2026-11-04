# Motion as authored interaction

A helper .mjs file, a list of animation names or a storyboard alone is not the
website deliverable. Implement the behavior inside the real framework's components,
styles and lifecycle, then run and inspect the actual page. Helpers may assist QA.

## Research and choreography

Read the local Scroll Craft skill when available for journey, page grammar,
emotional curve, dimensional layering and a signature move. Its scripts are helpers,
not a mandatory output format. Do not assume it is installed in another harness;
this guide supplies the transferable decisions without relying on local paths.

Study a supplied motion reference at several states. Record trigger, information
revealed, subject/camera relationship, foreground/background layers, exit and mobile
alternative. Separate observed behavior from implementation inference.
Corn Revolution (https://cornrevolution.resn.global/) is an inspiration for connected
subject matter and depth, not a license to copy its imagery or a recipe for every
site. Creator case study: https://www.shawnholpfer.com/pioneer-corn-revolutionized .
The live page returned a browser-compatibility fallback during text inspection on
2026-11-04; its precise live scroll choreography was not verified in that inspection.
Use that limitation, not invented measurements, in any reference-derived claim.

Write a section score before implementing complex scroll:
`section | user learns | visual planes | trigger/range | object/camera change |
text entrance/hold/exit | next-section transition | mobile | reduced motion`.
Every moving object needs a reason and a final state. Use one memorable narrative
peak, quieter reading intervals and deliberate transitions. Avoid identical fades
for every section, endless camera flight or pinning every block by default.

## Choose the simplest adequate technique

- State feedback: CSS or existing motion primitives; preserve focus and input.
- Layer parallax: independent background/subject/foreground transforms with shared
anchors and occlusion; keep copy stable enough to read. This is 2.5D, not real 3D.
- Image sequence/video: an art-directed pre-rendered subject when real-time object
interaction is unnecessary. Plan decoding, loading, poster and unavailable-media states.
- Real-time 3D: only when object/camera control or lighting materially helps the
chosen story. Use supported geometry, camera states and restrained draw calls.
Do not load a 3D engine simply to tilt a card.

React Bits (https://reactbits.dev/) is a component/reference source, not the design
system. Inspect the actual chosen demo, source and current dependencies. Pick its
matching JS/TS and CSS/Tailwind variant; adapt it to the repo. Record what is used
and why; check its license at that version. Do not install an entire catalog.
Backgrounds, text reveals and interaction components must fit the product story;
a visually busy demo can be wrong behind an invoice table. Check current docs via
Context7 or official source when implementing library-specific APIs.

## Lifecycle and performance

Retain one scroll authority; integrate an existing smooth-scroll clock rather than
adding a second animation loop. Derive camera and DOM timelines from shared progress.
Set explicit reading holds and release points. Clean up observers, raf callbacks,
timelines, ScrollTriggers, GPU resources and event listeners on route exit.
Handle resizing and late font/image loads; avoid layout reads in every animation
frame. Use offscreen pause, bounded pixel ratio, lazy scene initialization and a
static fallback. Establish an asset/frame budget against target devices, measure it
and simplify when it misses; do not promise 60fps from a desktop preview.

## Acceptance evidence

Inspect opening, 25/50/75% and end states plus each transition. Test reverse scroll,
fast scrolling, refresh mid-page, mobile composition, keyboard navigation and reduced
motion. Reduced motion keeps the story and CTA available without scrubbed camera
travel. Check clipping, text contrast over all background states and loading without
blank canvases. Record the implemented page, not just a rendered animation clip.
