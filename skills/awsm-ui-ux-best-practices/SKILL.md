---
name: awsm-ui-ux-best-practices
description: Apply and review web UI usability and accessibility across primary journeys, navigation, forms, error/loading/empty states, keyboard interaction, mobile layouts, and feedback. Use when designing or evaluating user experiences.
---

# UI/UX for real tasks

## Start with the user's job

Describe the user in practical terms—what they are trying to accomplish, not demographic stereotypes—their entry point, primary action, obstacles, and success signal. Map the shortest route to the main task and a recovery path for failures or missing data. Prioritize information architecture before surface decoration.

## Heuristics by area

- **Navigation:** use the user's vocabulary for labels; show the current location; make back and close behavior predictable. Do not hide essential actions behind hover alone.
- **Forms:** give inputs explicit labels and logical ordering, examples when formats are unfamiliar, field-specific validation, and preserved values after an error. A `Save` action must provide feedback. Without a backend, do not claim persistence.
- **States:** an empty state explains why nothing appears and what to do next; loading is clear and avoids jarring shifts; success confirms the result; an error offers a recovery step. Destructive actions need a working confirmation or undo path.
- **Semantics:** use a sensible heading hierarchy, landmarks, links for navigation, buttons for actions, and alt text for meaningful images. Test keyboard navigation end to end, visible focus, and Escape on overlays.
- **Visuals:** ensure readable text and status contrast; never convey status only through color. Make touch targets comfortable, text legible at 200% zoom, and line lengths manageable. Follow the project's WCAG target, but do not claim formal compliance without an audit.
- **Responsiveness:** test at 360px, 768px, and 1200px with long copy and a virtual keyboard where relevant. Prioritize mobile content rather than just stacking a desktop grid.
- **Motion:** animate feedback and spatial changes with purpose; respect reduced motion and offer control over autoplay when present.

## Audit output

Report `journey | friction | evidence | severity | recommendation | validation method`. Use browser tests and screenshots before declaring a problem solved. For implementation, see `awsm-auto-prototype`; for final QA, see `awsm-prototype-qa`.

**Example:** “Review this checkout form: users struggle with shipping costs. Improve field order, error handling, and the mobile keyboard flow, then explain how to test each change.”


## Decide the pages before polishing

Use awsm-design/references/screen-blueprints.md to select a small complete journey. For operations, prefer list -> detail -> edit/action; for mobile, home/list -> detail -> confirmation; for marketing, one clear conversion page can suffice. Do not add login/settings/billing simply because typical apps contain them.

Create a screen contract: purpose, primary action, input/data, transition, loading/empty/error/denied state and recovery. Derive component variants from those contracts rather than building a large arbitrary library. Inspect current platform guidelines and actual product references. Validate the smallest complete journey in real output, including back navigation and preserved form data after failure. The deliverable is usable screens and evidence, not only heuristic advice.


## Focused execution reference

Use admin-worked-example.md or mobile-worked-example.md when the job matches. Each shows pages that exist for a reason and states within those pages; do not add routes merely to display an empty/error state. Use component-worked-example.md for the actual control contract.
