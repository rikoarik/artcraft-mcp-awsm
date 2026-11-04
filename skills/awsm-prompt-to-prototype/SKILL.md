---
name: awsm-prompt-to-prototype
description: "Turn a written brief into an end-to-end web prototype: plan screens and states, source relevant assets, implement interactions, add purposeful motion, preview, and run QA. Use for “build a prototype from this prompt,” complete UIs, or interactive landing pages."
---

# Prompt to web prototype

This skill coordinates a coding agent's work. It is **not** an automatic UI generator or a FigCraft canvas controller. Preserve the existing project's stack and brand; do not replace its scaffolding or break working features.

## Ownership and stopping condition

This is an end-to-end coordinator for a new scoped prototype. Resolve the brief once,
load research/screens and pass execution to auto-prototype (ordinary web), fast-design
(speed priority), app-ui (native) or native FigCraft. Do not invoke all coordinators
or start another interview after a phase handoff. Stop coordinating when the scoped
artifact and relevant acceptance checks are delivered; do not grow a product roadmap.

## Brief to blueprint

1. Summarize the audience, user's primary job, content and brand, conversion goal, platform, existing technology, and scope. Ask questions only when an unanswered choice would change the architecture or identity; state smaller assumptions clearly.
2. Map one to three important journeys: entry → action → outcome. List pages or sections, navigation, required data, and `default / loading / empty / error / success` states. Each call to action needs a testable destination. If there is no backend, identify local simulations rather than claiming to store data.
3. Write a paragraph explaining the visual direction in terms of the brief and review it with `awsm-taste-ui` or `awsm-antislop-ui`. Do not default to a templated hero, three feature cards, or an arbitrary gradient.
4. Build an asset map: slot, query, aspect ratio, and license. Use `awsm-assets` for photos and icons; use `awsm-asset-lab` only for simple SVG graphics. When no relevant licensed image can be found, label the placeholder honestly.

## Build, motion, and verification

5. Implement within the project's framework. For a small greenfield prototype, HTML/CSS/JS may be enough; use React only when requested or already present. Separate copy and data from reusable components and styles. Design responsiveness around content priorities.
6. Add affordances, form feedback, keyboard and focus handling, alt text, understandable errors, and reduced-motion support. Use `awsm-motion-storyboard` for purposeful animations. Avoid dead buttons and content that remains invisible when JavaScript fails.
7. Run the available build and tests. For static output, call `serve({root:"prototype-folder"})` and open the local URL; for a framework, use its development server. Follow `awsm-prototype-qa` and `awsm-responsive-audit`: exercise interactions, inspect the console, check mobile/tablet/desktop, and revise from screenshots. The `serve` preview lives only while the MCP process runs.

## Required handoff

Provide the file paths, run instructions, working pages and interactions, a preview URL only if still active, asset sources and licenses, QA evidence, backend or demo limitations, and remaining fixes. Do not call it “production-ready” without real verification.

**Example:** “Build a studio-booking prototype from this brief, make navigation and the form work, use licensed photos and minimal motion, then show a mobile screenshot.”

If the deliverable belongs on a FigCraft or Figma canvas, stop assuming a web output: use the corresponding design-app integration, inspect its document, and verify its rendered result. `awsm-figcraft-handoff` prepares specifications; it does not replace canvas tools.


## From ordinary prompt to a complete small flow

Treat the user's product request as the brief. Own typography, palette, icons and asset sourcing through research-direction.md in awsm-design. Ask only for missing domain facts or ambiguous write targets. When the user delegates choices, recommend them with reference-based reasons rather than inventing unsupported product capabilities.

Use screen-blueprints.md to propose the smallest useful set, then implement it. A café landing page and an invoice console require different hierarchy, controls and evidence. Keep a short screen/state map and asset plan; do not delay the first meaningful screen with a long speculative document. Finish the actual scoped flow and inspect it in runtime, not only the design plan.
