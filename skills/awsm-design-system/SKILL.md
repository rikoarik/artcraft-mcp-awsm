---
name: awsm-design-system
description: Build or refine reusable design tokens and components across multiple screens, including color roles, type, spacing, component states, dark mode, and documentation. Use when a project needs cross-screen consistency, not merely a single card.
---

# A pragmatic design system

## Define the scope

Audit the product's screens, repeating components, existing brand tokens, CSS conventions, and theme needs. For one small page, document a few tokens rather than introducing a large component library. If a system already exists, extend it compatibly and plan migrations before renaming semantic tokens.

## Three layers of tokens

1. **Primitive:** raw values such as `green-700`, font sizes, spacing scale, and radii. These are not component APIs; value-based names are appropriate.
2. **Semantic:** roles such as `surface`, `text-primary`, `border-subtle`, `action-primary`, `danger`, and `focus-ring`. Map these to primitives for light and dark modes. Never rely on red as the sole error signal.
3. **Component:** introduce stable overrides only when a component needs them, such as `button-primary-bg` or `input-error-border`. Avoid tokens for one-off details with no reuse.

Specify type roles (display/title/body/label), density and spacing, and breakpoints based on content. For each component, describe anatomy, variants, default/hover/focus/disabled/loading/error states, keyboard behavior, responsive rules, and copy conventions. Check contrast across states; disabled controls should still be recognizable.

## Implementation and validation

- Follow the project's existing stack and styling conventions. Include a working usage example, not just a table of tokens. If a theme library or generator is involved, consult documentation for the installed version before changing its API.
- Test at least one form, navigation element, and alert on mobile and desktop with long text and 200% zoom, plus dark mode if supported. Capture key screenshots. Ensure components use semantic tokens instead of a parallel set of hard-coded colors.
- Hand off token files, an old-to-new mapping, component examples, accessibility decisions, and uncovered items.

**Example:** “Unify four admin screens with three competing greens and six button shapes into reusable tokens without changing the brand.”
