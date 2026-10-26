---
name: awsm-auto-prototype
description: Implement interactive web prototypes and motion using the project's existing stack, based on mapped screens or a brief. Use for clickable navigation, menus, forms, state transitions, and previews with reduced-motion support.
---

# A working prototype, not a clickable-looking screenshot

## Interaction contract

Before coding, make a table: `control | action | state change | feedback | keyboard behavior | fallback`. For a reservation form, cover required fields → validation → loading → confirmation. Without a backend, never imply that data has been saved remotely. Links must point to real destinations. An external CTA may lead to a working URL or be clearly labeled unavailable; do not ship dead buttons.

## Implement in context

- Inspect the project's dependencies and conventions. Reuse its component, router, and state patterns. For small greenfield projects, progressive HTML/CSS/JS can suffice. Do not add React or GSAP just to animate one button.
- Preserve useful core content when JavaScript is unavailable where feasible. Use native `button`, `a`, and `form` semantics and interactions that work with mouse, touch, and keyboard. Add ARIA only when native semantics are insufficient.
- Design empty, error, and loading states, invalid input, long text, and narrow screens. Source imagery through `awsm-assets`; a missing photo API should not block the main flow.

## Motion with a purpose

1. Choose transitions that communicate change: a menu opens, an item enters, or a submission processes. Define the trigger, approximate duration, easing, and final state. CSS transforms and opacity are often sufficient.
2. If using GSAP or Motion, check documentation for the installed version before calling library-specific APIs. Clean up listeners and timelines on unmount. Avoid layout thrashing and animating every element for decoration.
3. Respect `prefers-reduced-motion: reduce`: remove nonessential movement while keeping the state legible. Main content must not remain hidden when JavaScript fails. Keep visible focus indicators, not just hover styles.

## Preview and acceptance

Use `serve` only for a safe static HTML directory; it is not deployment. For framework applications, use the project's development server. In a browser, test the primary journey on mobile and desktop, check JS and network errors, exercise Tab/Enter/Escape, and test reduced motion. Follow `awsm-prototype-qa`. Hand off an interaction list marked `working / simulated / blocked` with screenshot evidence, not a vague completion claim.

**Example:** “Turn these three wireframes into real navigation and a booking form with state changes, a short menu animation, and a 360px screenshot.”
