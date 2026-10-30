---
name: awsm-visual-qa
description: Compare real rendered web UI against FigCraft frames or reference screenshots, diagnose visual regressions, and iterate with evidence instead of unverified design claims.
---

# Visual QA and implementation fidelity

Visual QA is a repeatable comparison, not a generic aesthetic score. Determine which source screen or FigCraft frame represents the target UI, its viewport size, target platform, theme, font availability, and relevant UI state. Never compare arbitrary screenshots with different dimensions and conclude that the code is wrong.

## One-call review when available

Prefer `review_ui` for a new UI or design-to-code comparison: it audits DOM issues and captures screenshots in a single browser session, optionally compares matching FigCraft PNGs, and returns prioritized issues with the largest visual difference regions. Only use the separate capture, audit and compare tools when troubleshooting an individual step. A clean screenshot alone cannot prove functional UX or data correctness.

## Capture

Render the actual local project in a browser. When project-local Playwright is available, use `capture_ui_screenshots` with a local HTTP URL, project root, named viewports and a dedicated .awsm/visual directory. Browser capture intentionally rejects remote URLs and blocks requests to external origins: review reported blocked fonts or images, since a screenshot missing them cannot be considered visually faithful.

If Playwright is absent, use the agent's existing browser automation tool. Do not automatically install large browser binaries without user intent. For framework projects, use the real dev server rather than AWSM's static serve tool. Use stable data, a consistent theme and reduced-motion screenshots for comparison.

## Compare

Export the corresponding FigCraft frame to PNG through FigCraft's native MCP and make its physical pixel dimensions match the browser capture. Call `compare_ui_screenshots` with reference, actual, a meaningful color threshold and a heatmap filename. Inspect changed bounding boxes, the grouped regions sorted by changed pixels, changed pixel percentage, mean absolute error, and generated heatmap. Pixel comparison alone cannot tell whether a changed region is a font, intentional content update, spacing issue or broken feature.

Do not ignore false differences caused by antialiasing, non-deterministic data, missing image fonts, scrollbars, animation frames or a mismatch between CSS pixels and device pixels. Re-capture correctly before altering source code. Do not flatten text or controls into screenshots to artificially increase image similarity.

## DOM and behavior diagnostics

Run `audit_ui_page` against the same localhost URL before relying on visual judgement. It opens controlled browser contexts and returns viewport-specific issues with suggested fixes: page overflow, offscreen elements, broken images, missing labels, placeholder links, unusually small buttons and console errors. It does not click links, submit forms or inspect authenticated routes unless a local session already provides access.

Prioritize high-severity issues, then medium. Review reported CSS selectors in the real code rather than blindly applying fixes. The audit is heuristic: false positives are possible, and a clean report does not prove WCAG compliance or functional correctness. Browser resources outside the local origin are intentionally blocked and reported; missing remote fonts can change screenshot fidelity.

## Critique and repair

Use the coding agent's available image-reading/vision to interpret the reference, actual screenshot and heatmap. Report the 2–5 largest actionable mismatches with location, plausible cause and proposed code change. Prioritize layout hierarchy, assets, text styles, alignment, crop and responsive overflow. Make targeted changes; preserve the working component structure and the project's existing conventions.

Re-render both major viewports, recompare and confirm that new changes did not break neighboring areas. For serious apps and admin interfaces also test navigation, keyboard and form interactions separately; pixel match never proves that those controls work.

## Handoff

Provide screenshot paths, comparison thresholds, changed percentage, unresolved regions, and any blocked resources or missing tools. Clearly distinguish measured pixel difference from visual judgement. A QA pass requires both adequate design fidelity and successful functional checks relevant to the product.

This skill orchestrates existing tools; it does not automatically create or modify the FigCraft canvas, interpret images inside the MCP tool itself, or guarantee perfect fidelity.
