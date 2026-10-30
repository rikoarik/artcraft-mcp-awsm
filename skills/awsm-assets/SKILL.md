---
name: awsm-assets
description: Find relevant photos and icons for a page, dashboard, or prototype; verify licenses and attribution, maintain icon consistency, and save local assets. Use whenever the user asks for imagery, icons, visuals from a brief, or UI assets.
---

# Asset discovery from a brief

## Inputs and initial decisions

Identify the page context, audience, subject, each asset's role (hero, thumbnail, supporting illustration, control), aspect ratio, tone, placement, and brand constraints. If the subject is unclear, derive two or three queries from the actual content rather than assuming “modern” means abstract imagery. Make a small map: slot → purpose → query → aspect ratio → licensing requirements. Distinguish decorative images from images that convey information.

## Search workflow

1. For photos, call `find_images` with `provider: "openverse"` and a descriptive query such as `"barista pouring espresso natural window light"`. Its default results are filtered for commercial use, but that **does not automatically authorize every use**. Check `title`, `creator`, `license`, `attribution`, `page`, `width`, and `height`. If the results miss the brief, revise the subject, viewpoint, or context twice before switching providers.
2. Use `pexels` or `unsplash` only when the relevant API key is already available to the MCP process. Never request secrets in chat or commit them to the repository. `picsum` supplies random placeholders, not relevant search results. If the network fails, leave a labeled placeholder and report the limitation; do not invent a photo or license.
3. For icons, call `find_icons` with the actual action or object (for example, `delivery truck` or `upload`), choose one family such as `lucide`, and call `get_icon` for each chosen icon. Check the family's license at the Iconify source, stroke or fill weight, viewBox, and size. Give informative icons an accessible name; hide purely decorative icons from assistive technology.
4. Shortlist one to three candidates per slot based on semantic fit, safe cropping, resolution, and usage rights—not just appearance. Call `download_asset` only for a selected raster URL, and save it under a descriptive local filename. The tool refuses external SVGs, duplicate files, and images over 10 MB. For SVG icons, review the markup returned by `get_icon` instead of using `download_asset`.
5. Reference relative local paths in the implementation. Write meaningful alt text for informative images and `alt=""` for decorative ones. Do not hotlink API preview URLs in the final product.

## Asset ledger and validation

Record `file | slot | source page | creator | license | required attribution | date checked`. Put credit where required by the license. Inspect the rendered page: subjects must not be clipped on mobile, overlays need readable contrast, and every image and icon must load. If no candidate is suitable and safe to use, create a clearly labeled simple graphic with `awsm-asset-lab` rather than claiming to generate an AI image.

**Handoff:** selected files and paths, verified licenses and attribution, and unresolved slots. Example request: “Find a small café interior photo for a 16:9 hero and a reservation icon; avoid random images and include credits.”

For FigCraft targets, import assets using the available design-app tools and follow the FigCraft-specific workflow. This MCP does not edit the canvas.

## Icon files and app delivery

Icon discovery is not enough for implementation. When several icons are needed, build a semantic icon map and use awsm-iconography. Call save_icon_set with a single Iconify family to create consistent, named SVG files, or call draw_icon with original vector primitives for a genuinely custom concept. Inspect rendered output and verify icon meaning at production sizes. Keep an explicit file-to-component mapping and ensure icons follow platform conventions for the current web, Flutter, Compose or React Native project.

For FigCraft designs, use the document layer manifest to distinguish photos, decorative textures, icon vectors and ordinary CSS backgrounds. Export only the eligible nodes through FigCraft's own MCP, then sync them to the local project. Never treat a full screenshot as a source photo. Verify every intended asset appears at its final path before claiming that the UI is ready.
