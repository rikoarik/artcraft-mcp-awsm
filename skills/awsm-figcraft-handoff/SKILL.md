---
name: awsm-figcraft-handoff
description: Prepare asset, token, frame-size, and interaction-state handoff for work in FigCraft. Use when the deliverable must be on the FigCraft canvas, and explain that AWSM MCP itself cannot edit design documents.
---

# Web prototype to FigCraft handoff

## Capability boundary

The AWSM MCP toolkit offers asset discovery, simple SVG creation, palettes, and web preview. It does **not** create frames or nodes, import assets, save design documents, or configure FigCraft prototypes. Use the separate FigCraft MCP tools and its applicable design workflow. If the app connection is unavailable, provide specifications rather than claiming to have edited the canvas.

## Specification package

1. From the brief or coded prototype, list screens and frames, target sizes, layer hierarchy, components, states (default/hover/focus/loading/error/success), and interaction-flow links. Distinguish real web behavior from a static FigCraft representation.
2. Export the actual tokens: semantic color roles and hex values, font family/size/weight/line height, grid and spacing, radii, and variants. Include a few concrete measurements, such as header-to-hero distance, so reproduction does not depend on guesswork.
3. Package local asset paths with source pages, creators, licenses, aspect ratios, and suggested crops. Assets returned through `awsm-assets` do not automatically enter FigCraft; import them through the design app. Review external SVG markup before embedding it.
4. If FigCraft tools are available, inspect the document before changing it, follow the app's design workflow, and build frames and layers there. Verify the finished work with a rendered PNG; check hierarchy, alignment, color, text, and imported assets. Do not replace a user's document beyond the agreed scope.
5. Record gaps: backend and JavaScript interactions, motion, states that exist only in the coded prototype, and items requiring manual design work. Without app access, deliver a frame/token/asset table, not a completion claim.

**Example:** “Bring this prototype landing page into FigCraft; prepare desktop and mobile frames and identify which form states are missing from the design.”
