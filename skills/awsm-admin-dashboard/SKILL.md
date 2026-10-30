---
name: awsm-admin-dashboard
description: Design and implement serious data-heavy admin dashboards, operations consoles, and SaaS back offices with clear navigation, dense tables, role-aware UI, and realistic interaction states.
---

# Admin interfaces built around actual operations

Understand the domain model, operator roles, business decisions, primary daily actions and sensitive operations before deciding the layout. A finance dashboard, HR administration system and construction project console should not share one generic card template. Identify the overview, master data, transactions, approvals, reporting, configuration and audit tasks relevant to this specific product.

## Information architecture

Build navigation from user jobs, not arbitrary feature groups. Define page identity, breadcrumbs, contextual filters, toolbar actions and the relationship between list, detail, edit and audit history. Use an appropriate desktop density with responsive alternatives; wide data grids often need column priority and horizontal scrolling, not a forced stack of unrelated cards.

Metrics must have units, periods and data provenance. Tables need purposeful columns, sort, filter, search, pagination or virtualization when warranted, bulk selection rules and row actions. Support realistic empty, loading, error, permission-denied and partial-data states. Avoid pretending that every statistic is live when the data is illustrative.

## Implementation

Reuse the repo's component system, route conventions, auth state and query patterns. Define a consistent design system with semantic tokens for information, success, warning, danger, selection and focus. Primary/destructive actions must be visibly distinct. Model confirmation dialogs, mutation feedback, optimistic updates, refreshes, invalid states, and unsaved forms. UI role gating is for usability only: security must be enforced by the backend.

For FigCraft sources, inspect the entire layer tree and use prepare_web_handoff followed by native asset export and sync_figcraft_assets. Build text and controls as DOM; do not export table screenshots or whole sidebars as images. Use awsm-iconography for coherent navigation and toolbar icons and awsm-prototype-qa for actual validation.

## Quality bar

Test with sparse and large datasets, extreme labels, long numbers, unknown values, constrained screens, keyboard-only users, dark and light modes if supported, and high zoom. Ensure destructive changes display consequences. Compare list-to-detail journeys and permission transitions, not merely the home page.

Deliver implemented pages and working interactions with the actual project stack. Explain what is simulated, missing or blocked. A dashboard full of polished cards is not complete if the operator cannot finish a real task.
