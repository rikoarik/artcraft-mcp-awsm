---
name: awsm-figcraft-to-web
description: Convert messy FigCraft layers into a structured, asset-aware web implementation without flattening UI into screenshots.
---

# FigCraft to web implementation

Use FigCraft's native MCP to inspect, export and render designs; AWSM cannot edit the canvas.

## Inspect and classify
1. Inspect all relevant pages, nested layers, assets and IDs using FigCraft MCP. Ensure nested layer trees are complete.
2. Invoke AWSM prepare_web_handoff with raw inspect_document JSON as document, optional inspect.assets JSON as inspectAssets, exportDir and outputPath. Screenshot images are not layer trees.
3. Review layers, assets and issues. Fix ambiguous or truncated layers. Explicit pluginData awsm.kind can be asset, image, photo, illustration, icon, layout, component, text or decoration.
4. Keep page hierarchy semantic: Header, Hero/Copy, Hero/Media, Features, Footer. Name layers by purpose, not Frame 23 or Rectangle 9. Preserve reusable components and text layers.

## Export actual assets
- Treat text, buttons, cards, grids and backgrounds as DOM/CSS, not images.
- Export photographic image layers to PNG, icon/vector art to SVG when standalone. Export complex illustrations as a single asset only when appropriate.
- Inspect the generated assets list and adapt proposed figcraftExport arguments to the FigCraft MCP version actually connected. AWSM prepares a plan but cannot perform the native FigCraft export.
- Export each source layer into ./figcraft-exports using the filename supplied in the manifest.
- Call sync_figcraft_assets with handoffPath, exportDir and the web project's publicDir.
- Verify complete is true and inspect conflicts, missing and copied records. Never assume assets are exported just because a handoff exists.
- Keep source, licensing and attribution for third-party photography.

## Implement into code
Map screen to route, group to layout, text to HTML, component to reusable code, photo/icon to /figcraft/<filename>, and uncertain roles to an explicit manual decision. Use inspect.code or component mappings when available, but independently check semantics and responsive behavior. Avoid absolute-position recreation of the desktop canvas on mobile.

Keep assets under public/figcraft and handoff JSON under design-handoff. Do not flatten full sections into a single PNG. Implement live actions and states, not inert visual lookalikes.

## Validate
Compare real browser screenshots at equivalent widths with FigCraft renders. Inspect typography, spacing, clipping, cropping, missing image requests, keyboard behavior, long copy, mobile layout and reduced motion. Use browser automation provided by the coding agent; AWSM serve only starts a static HTTP preview.

Stop and report limitations when no complete layer data exists or native export is unavailable. This skill does not promise that every shape can be classified automatically; review items remain explicit until resolved.
