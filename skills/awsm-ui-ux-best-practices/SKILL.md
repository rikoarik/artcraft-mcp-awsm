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
