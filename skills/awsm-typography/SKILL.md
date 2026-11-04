---
name: awsm-typography
description: Find, choose, locally install and integrate fonts, and translate FigCraft typography into real website or application text styles with accessible scaling and predictable glyph coverage.
---

# Typography that survives design-to-code

Read the product's visual tone, language coverage, existing type stack and target platform. Extract actual font families, sizes and weights from FigCraft with extract_design_tokens when layer data exists. If there is no design source, select a restrained, context-specific type hierarchy rather than applying trendy serif-plus-sans pairings by default.

## Source and integrate

Prefer local fonts and existing typography tokens already present in the application. Use google_font in inspect mode to verify a named Google Fonts family is served and which WOFF2 face URLs exist. For chosen families use google_font in install mode to fetch exact weights into public/fonts; do not request dozens of unused weights. Record family, style, weight, local paths, subset and source page. The tool does not automatically establish the source font's legal license; verify that separately. Check language requirements, especially Indonesian punctuation and any non-Latin glyphs needed. A downloaded Latin subset does not guarantee coverage for other scripts.

For Next.js, prefer next/font/local or next/font/google as appropriate for the existing project. For CSS-only stacks, define font-face declarations with font-display swap and appropriate fallback metrics. For Flutter, declare local asset families in pubspec.yaml; for React Native or Expo follow the existing font loader and asset pipeline; for Compose apply a platform typography set and local font resources. Do not assume web CSS can be copied into a native app.

## Scale and visual verification

Define semantic roles (display, title, body, label, numerical/tabular data) before assigning raw sizes. Keep consistent weight mappings and line heights, consider compact admin density separately from expressive marketing typography, and support font scaling and responsive wrapping. For tables, invoices and financial dashboards, verify number alignment and locale formatting.

Compare actual browser/device text against FigCraft render at equivalent size. Check fallback jumps, clipping, truncation, variable-weight behavior, contrast, long Indonesian words and all required scripts. Report licensing, unsupported glyphs and incomplete font mapping. Do not claim visual parity from a CSS declaration alone.


## Choose and test without outsourcing the decision

Read research-direction.md in awsm-design. Recommend the type system from audience, language, content density and brand references. Establish display/title/body/label/numeric roles and the actual weights needed. For admin interfaces, compare ambiguous characters, tabular alignment and compact labels; for expressive marketing, test headline shape and section rhythm.

Use the actual headline, a long name, money/date strings and a dense paragraph in the real renderer before committing. Verify wrapping at intermediate widths, fallback shifts during font loading, italic/weight availability and locale glyphs. Document licensing and local integration. Do not ask the user to pick from a giant font list or load many families in the final page just to show possibilities.


## Focused execution reference

Use visual-decisions.md for contrasting console/product-story type decisions and component-worked-example.md for roles in a real form. Test one candidate against actual content before adding another font. The worked examples specify evaluation criteria, not a universal prescribed font pair.
