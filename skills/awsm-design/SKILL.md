---
name: awsm-design
description: One practical design-to-code skill for AWSM. Use for designing websites, admin dashboards, mobile UI, FigCraft handoff, responsive implementation, fonts, icons, assets and visual quality checks.
---

# AWSM — design, implement, verify

Use **one** workflow rather than loading overlapping design skills. First understand the product, its user, the actual task and target stack. Prioritize a useful rendered result, not an elaborate planning document. Reuse the project's established UI components, assets, tokens, fonts, icons and dependencies.

## First usable design

For a brief or existing project, call `design_quickstart` once with the actual brief and project root. Respect its context, but do not treat its inferred visual direction as proof of design quality. Choose a layout and hierarchy appropriate to the product: administrative systems need operable tables, filters and states; mobile apps need native navigation, safe areas and accessible controls; landing pages need meaningful copy, product proof and deliberate composition.

Implement the first useful screen or section using the existing stack, including real content and the primary interaction. Render and review it early. Avoid generic gradient hero templates, arbitrary icon sets, excessive decorative cards, dead controls and long speculative planning.

## When a FigCraft source exists

Inspect the source document through **FigCraft's own MCP**. Call AWSM `prepare_web_handoff` with a complete layer tree and optional asset inventory; review ambiguous layers. Use FigCraft's native export for individual artwork, then `sync_figcraft_assets` for file paths and a verified asset manifest. Keep text, buttons, tables, layouts and application components as editable HTML or native widgets. Never flatten a full functional screen to a single image.

## Visual assets and typography

Use local assets first. For missing images or icons, call `find_design_assets` with a small batch of purposeful queries. Prefer a single icon family; use `save_icon_set` or `draw_icon` only for genuine missing icon assets. Inspect licensing and attribution. Use `extract_design_tokens` when FigCraft layer data exists. For fonts, reuse project fonts or `google_font` and integrate via the target framework. Check glyph coverage, font weights and license before release.

## Review and fix

Run the actual app. When project-local Playwright is available, prefer `review_ui` for a single-pass browser audit, screenshots and optional matching-size FigCraft comparison. Fix major hierarchy, typography, overflow, broken images, inaccessible controls and bad responsive layout before decorative polish. The coding agent makes code changes; AWSM only provides evidence and utilities. Verify working navigation, interactions and relevant loading, empty and error states separately. Do not claim browser/device verification when none occurred.

## Boundaries

AWSM is a **local, free stdio MCP**, not a second autonomous coding agent. Do not automatically install browser binaries, change frameworks, replace user-customized files, or create a VPS. Load additional specialized skills only when the user explicitly wants the expanded library. Keep the implementation maintainable and report unverified areas clearly.
