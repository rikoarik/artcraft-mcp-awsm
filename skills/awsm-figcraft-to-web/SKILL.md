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

## Component and asset boundary for applications

Do not equate a FigCraft node type with an implementation technology. Use an explicit mapping table per screen: visual node, intended role, native/web implementation component, export decision and source file. For desktop dashboards, map sidebar, toolbar, data grid, filters, modals and content panels to functional UI components. For mobile apps, map headers, bottom navigation, cards, form fields and sheets into Flutter, React Native or Compose widgets; browser markup from inspect.code is only a reference.

When image fills are mixed with text in a group, separate the background-image layer and the live content. Use a naming convention: Page / Region / Component / Role. Typical roles include HeroPhoto, BrandIllustration, NavIcon, DecorativeTexture, DataVisualization, Copy and PrimaryAction. Export visual assets only when they cannot be recreated safely using primitives or native widgets. Retain source layer ID, meaningful alt text, crop intent, file type and licensing data.

Before code implementation, inventory every screen and every asset with unresolved role. Validate that the handoff does not contain duplicate filenames, missing page roots or fully rasterized functional sections. Reusable FigCraft components are not automatically reusable code components; decide variants, props and state transitions using the application's actual data model. Confirm whether a chart is decorative or driven by data; data-driven charts belong in code, not an exported bitmap.

After the UI is implemented, use browser or device screenshots for a design-to-code comparison. Review primary navigation, text accessibility, all real controls, image cropping and empty/loading/error states before accepting the handoff. A correct screenshot with dead interactions is not a completed application.

## Verify the exported design as a working UI

Once source layers and assets are mapped, capture the local app at the source FigCraft frame's physical pixel dimensions. Use compare_ui_screenshots to find the largest changed regions, then let the coding agent interpret them against the source design and fix real components. Run audit_ui_page to check overflow, broken assets, link destinations, control names and runtime errors. This separates visual parity from functional and accessibility requirements; a pixel-perfect rasterized screen is never an acceptable substitute for a working application.
