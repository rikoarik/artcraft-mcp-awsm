---
name: awsm-figcraft-handoff
description: Prepare asset, token, frame-size, and interaction-state handoff for work in FigCraft. Use when the deliverable must be on the FigCraft canvas, and explain that AWSM MCP itself cannot edit design documents.
---

# Explicit handoff into FigCraft

Use this skill only for to-figcraft work: a coded prototype, supplied brief or
external design specification must become an editable native canvas. The reverse
path belongs to awsm-figcraft-to-web. Do not mix the two directions in one implicit
workflow or create a website merely because a design is being edited.

## Connect and inspect

Resolve the actual target document/page and use craft_prepare with its briefId.
AWSM forwards calls through the configured native FigCraft provider; the native
provider performs canvas edits. Inspect the current document, reusable styles and
components before changing it. Preserve existing work; do not reset the document
or silently work in a different headless session. If no provider is available,
report the connection requirement and provide a specification without claiming
canvas completion.

## Map and build editable structure

From the requested source, map only relevant screens/sections to frames and their
states. Record frame sizes, hierarchy, text roles, grid/spacing, responsive intent
and interaction links. Reuse brand/type/color tokens; a full screenshot is evidence,
not a substitute for editable buttons, tables and text.

Prepare genuine independent art assets with local paths, source/license, aspect
ratio and crop intent. Inspect the actual exports before native placement. Build
frames, live text, layout and reusable components with the actual provider schemas.
Separate variants only where the scoped flow needs them; avoid a giant component
library for a small request. Inspect a native render after each meaningful batch.

## Distinguish design from behavior

Translate the source's visual states and navigation intent, but do not claim the
canvas executes backend calls or JavaScript motion. Document transitions as intent
when the provider cannot implement them. A 3D render placed as an image is 2D art;
editable geometry remains in the modeling application.

## Acceptance

Verify the requested frames, text, assets and state variants in the intended
native document. Check a main frame and an action/error state at appropriate
sizes, including long text and mobile composition where in scope. Deliver the
native document location, relevant frame IDs, source/asset mapping, inspected
renders and any behavior not represented. Use design_guidance handoff with intent
to-figcraft; do not call website implementation complete from a canvas render.
