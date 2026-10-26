---
name: awsm-template-adapter
description: Adapt a legally usable UI template to a product brief and brand instead of copying an arbitrary design. Use when the user provides a template or repository, or asks to start from one.
---

# From a template to a product-specific interface

## Select the source

Inspect any template supplied by the user first: structure, framework version, dependencies, documentation, license, assets, components, and feature flags. If asked to find one online, shortlist candidates with clear licensing and compatible stacks. Do not copy a repository or download copyrighted content without permission. Record sources, licenses, and attribution obligations. If there is no safe candidate, design a new layout from general principles rather than cloning pixels.

## Map the work

Build a table: `template slot → brief requirement → keep/adapt/remove → risk`. Decide what remains, such as navigation, accessible components, typography tokens, and routes. Identify what must go: dummy CTAs, fake testimonials, lorem ipsum, and irrelevant stock imagery. List missing loading, empty, and error states, then define acceptance criteria for each section's function.

## Adapt in stages

1. Run the template unchanged and screenshot desktop and mobile. Document broken builds, dependencies, and placeholder content before editing.
2. Apply the existing brand through color, type, and spacing tokens—not only a gradient swap. Rewrite copy for the actual product and obtain photos or icons through `awsm-assets` with a license ledger.
3. Connect navigation and CTAs to real destinations. Clearly label fake or simulated data. Keep the project's architecture where sensible; do not discard useful state management or tests.
4. Test layout and behavior after each batch of changes. Check CSS conflicts, keyboard access, responsiveness, and reduced motion. Complete `awsm-prototype-qa` before handoff.

## Handoff

Provide the source link and version, licenses and attribution, reused sections, visual and functional changes, QA results, and any remaining template artifacts. Do not claim a design is wholly original if it builds on someone else's work.

**Example:** “Use the landing-page template already in this repository for a dental clinic without breaking the booking form, and check the photo licenses.”
