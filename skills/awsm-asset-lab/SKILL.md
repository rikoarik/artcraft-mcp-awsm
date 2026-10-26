---
name: awsm-asset-lab
description: Create text-based SVG Open Graph cards, banners, monogram badges, and placeholders from a brief and color palette. Use for original, simple graphic assets when photography is inappropriate or a social card is needed; this is not AI photo generation or final logo design.
---

# Asset lab: editable SVG templates

## Before creating an asset

Identify its purpose, platform and dimensions, short title and subtitle, brand colors in hex, output location, and licensing constraints. If the request needs a complex logo, photo, or illustration, explain that `make_asset` only produces a text-based SVG template and propose a suitable alternative. For social graphics, consider the safe area and target platform's preview. Default sizes are 1200×630 for `og-card`, 1600×500 for `banner`, 512×512 for `badge`, and 800×600 for `placeholder`.

## Workflow

1. Review existing brand colors first. If none exist, choose colors appropriate to the subject. `palette({color:"#176F57",scheme:"complete"})` returns hue variants, tints, and shades; it does not certify accessibility. Check actual contrast for small and large text. Do not apply every swatch simply because it was returned.
2. Write concise copy: one main idea, a supporting subtitle, and a label only if useful. `make_asset` does not wrap long lines; a lengthy title can overflow the SVG. Do not add unsourced statistics or quotes.
3. Call `make_asset` with `kind`, `title`, `subtitle`, `label`, `colors` (up to three hex values), and `dir`/`filename`. Use `og-card` for link sharing, `banner` for a hero strip, `badge` for a temporary monogram, and `placeholder` for an unfinished slot. The tool refuses to overwrite an existing SVG. Give revisions new filenames; do not delete user assets without permission.
4. Open the result in an SVG renderer or browser. Inspect clipping, font substitution, readability at thumbnail size, contrast, and line length. If it fails, shorten the copy or adjust the palette or dimensions and create a new revision. A successful file write is not visual approval.
5. Test Open Graph output on the target platform and convert to PNG if raster is required. Keep the editable `.svg`, document the variants, and provide an integration example such as `<img src="assets/card.svg" alt="...">`. An SVG card is not a universal social thumbnail.

## Limits and handoff

Do not describe a badge as a finished brand identity or a template graphic as an “AI-generated photo.” This package contains no image model. Hand off the path, type, dimensions, colors, preview, and target-format notes. If the user needs relevant photography, use `awsm-assets`.

**Example:** “Create a short-title Open Graph card for Kopi Pagi in dark green, inspect the preview, and provide the SVG and colors used.”
