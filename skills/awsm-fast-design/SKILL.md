---
name: awsm-fast-design
description: Rapidly turn a product request or FigCraft design into a useful first UI render without wasteful research, repetitive tool calls, or long preliminary documents. Use when user says fast, quickly, immediately, prototype, or design a screen.
---

# Fast design loop: visible work before long analysis

Do not mistake speed for generic design. First infer the actual product, main user task, available content and expected output. Call AWSM design_quickstart once using the real brief, kind and project root (if there is an existing repo). When FigCraft JSON is already available, pass it to the same call; do not repeatedly inspect the same document without a reason.

## Fast first pass

Inspect only existing entry points, the current design tokens, and the relevant reusable component directory. Prefer using already-installed packages, existing branding, local fonts and local assets before network searches. Do not install new frameworks to do a simple redesign. Do not spend the first pass generating exhaustive moodboards, lengthy planning files, generic feature lists or unnecessary ASCII wireframes.

Choose one distinctive direction based on the product and references actually available. A restaurant, construction management system, financial admin and native attendance application should not default to the same three-card layout. Build the first priority section or screen, ideally with its major content and one real interaction. When details are ambiguous, make the smallest reversible interpretation and clearly identify it.

For marketing sites, first render the product value proposition and one strong supporting visual. For an admin interface, first render meaningful navigation, a data-rich screen and an actionable control. For mobile UI, first render a coherent navigation and screen state using native conventions. Source only the necessary images, icons and fonts for that pass. When several icons or images are missing, call find_design_assets once with specific search queries rather than making many sequential MCP calls. If the font, icon, or product screenshot is already in the repository, reuse it.

## Check quickly

Render one desktop and one mobile viewport. Look for the highest-impact problems: hierarchy, spacing, typography, content relevance, cropping, inaccessible controls and fake buttons. Fix these before adding extra decoration or advanced motion. When FigCraft is involved, preserve live text and components; export only necessary art assets and do not flatten the screen.

## Second pass

Only after a usable preview exists, expand the number of screens, refine motion and fill remaining UI states. Run comprehensive QA before production claims. Fast mode is not permission to ignore security, licensing, lost data, or destructive changes. Report real working UI and any missing areas, not generic promises.

## Fast feedback without skipping quality

After the first useful render, if Playwright is available, run audit_ui_page on mobile and desktop to detect broken image paths, page overflow, placeholder links, missing control names and errors before any broad redesign. Use screenshot capture only when an actual page is running, and avoid regenerating reference assets that already exist. Defer exhaustive full-page visual diff to the second pass when the user explicitly prioritizes speed. Never claim browser verification without a real capture.
