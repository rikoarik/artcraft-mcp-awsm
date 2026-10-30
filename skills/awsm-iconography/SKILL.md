---
name: awsm-iconography
description: Create, select, and integrate coherent icon systems for product websites, admin interfaces, and mobile apps. Use for missing icons, custom icon requirements, inconsistent sets, or icon assets from FigCraft.
---

# Iconography as a usable product system

Start from meaning and interaction, not decoration. Read the actual navigation, actions, statuses and empty states. Define a small semantic map, such as dashboard, users, invoices, settings, warning, export, and search. Avoid using the same icon for different operations. Distinguish icons with an accessible text label whenever their meaning might be ambiguous.

## Source or create

Search with find_icons by concrete action or object, usually within one family such as lucide, tabler or material-symbols. Inspect get_icon output and choose consistent stroke weight, optical size, viewBox and style. Use save_icon_set to place chosen Iconify SVG files in a local, named directory. Do not mix filled and outline sets arbitrarily. Verify the license and preserve attribution when required.

If a unique brand or domain-specific icon is needed, draw an original, minimal SVG path using the coding agent's file tools and verify the rendered result. Never pretend a template monogram or generic gradient from make_asset is a custom icon. For FigCraft, use its native layer export for actual vector shapes; keep the manifest and node IDs. Do not rasterize an entire UI control merely to retrieve the icon.

## Integration

For web projects, prefer an icon component with a controlled size and color contract. Inline SVG must respect currentColor; avoid CSS filters as a substitute for correct SVG markup. Decorative icons should be hidden from assistive technology, while icon-only buttons need descriptive accessible names. On React Native, Flutter or Compose use the platform's native vector/icon approach or a verified local SVG renderer, rather than assuming browser SVG works on every platform.

Check 16px, 20px, 24px and high-density rendering. Confirm that disabled, active, hover, and focus states are visible. Keep semantic color roles for destructive or status icons. Verify icons in actual screenshots, not only as raw SVG files. Do not ship placeholder squares, emojis or missing-image symbols as final product icons.

## Acceptance

Return the icon naming and file mapping, chosen family and license, implementation references, any genuinely custom SVGs, and states that were visually inspected. Report missing icons explicitly; never silently substitute an unrelated shape. The goal is a consistent, functional icon language across the whole product, not an impressive-looking collection of disconnected symbols.
