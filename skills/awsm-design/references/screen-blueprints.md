# Small complete screen sets

Choose the smallest set that completes the requested user job. These are patterns,
not mandatory pages. Adapt the domain, permissions and navigation to the real brief.
Write `screen -> entry -> primary action -> resulting state -> back/recovery`.
When only a component is requested, implement its host context and states rather
than generating an unrelated application. For FigCraft, create a clearly named
flow page plus a compact component/state sheet only when useful; avoid a sprawling
library for a small task. Website routes and design-canvas pages are distinct.

## Admin / operations

Start from an entity lifecycle, not KPI cards. Example for invoice operations:
1. Invoice queue/list: search by invoice/customer, status and date filters, clear
filter, useful columns (number, customer, due date, amount/currency, status), sorting,
pagination and row action. Prioritize overdue work only if data supports it.
2. Detail: identity and status, line items/totals, due information, activity/history,
and the next permitted action. Preserve the user's list filters on return.
3. Create/edit: grouped fields, inline validation, calculated totals, save/cancel,
unsaved-change handling and explicit loading/failure/retry. Never imply a simulated
payment or approval actually occurred.
A dashboard overview is optional: every metric needs a unit, period, source and a
link to the actionable filtered list. Add settings, roles or reporting only when
in scope. A persistent app shell plus these 2–3 task surfaces usually explains
more than six placeholder navigation pages.

Use Carbon's data-table guidance as a research starting point
(https://carbondesignsystem.com/components/data-table/usage/) and the existing
component library's actual docs. Inspect current sources before applying specifics.
Do not force immersive parallax into operational tables.

## Web application

Use workspace/list -> detail/work area -> create/edit or complete action. Define
one real object with believable data shapes, a selected state and a completed task.
Authentication, onboarding, billing and a settings maze are not default additions.
If access is part of the request, add its necessary login/access/error states.
URL state should make sense for filters, deep links, refresh and browser back.

## Native mobile

A compact journey can be home/list -> detail -> action/confirmation, plus state
variants on those screens. Navigation hierarchy must fit the platform, with safe
areas, keyboard accommodation, accessible touch targets and predictable back.
Map permission denied, offline, retry, loading and text scaling to the actual task.
Use Apple HIG (https://developer.apple.com/design/human-interface-guidelines/)
or Material (https://m3.material.io/) for the target platform, then inspect the
installed framework's current docs. Do not transplant web hover behavior to touch.

## Marketing website

One page may be enough: clear offer -> product/experience proof -> how it works or
specific benefits -> objections/pricing when known -> concrete next action.
Separate pages only when the user's content/journey warrants them. Vary section
composition and information density rather than repeating centered heading/card grids.
Provide meaningful anchors, navigation, contact/form outcomes and footer information.
Do not fabricate pricing, claims, customer logos or contact details to fill a template.

## Component/state sheet

Build only components needed by the selected flow: buttons/links; input/select;
feedback; table/list row; dialog/sheet; navigation; domain-specific card.
For each define anatomy, variants, size, default/hover/focus/pressed/disabled/loading,
error and empty states where meaningful. Tie props to real state and accessible
semantics. A gallery of disconnected components is not an implemented user flow.

## Acceptance

Trace the primary task end to end with keyboard and pointer/touch. Check sparse
and long content, permission errors, absent images and slow data. Capture a main
screen, a detail/action state and a failure state where relevant. List unimplemented
routes honestly; do not count placeholder pages as finished design.
