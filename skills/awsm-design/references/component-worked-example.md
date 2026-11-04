# Worked example: invoice save action and field

Use this as a design-to-code contract, not a mandate to create a new library.
Reuse an accessible installed primitive and adapt its actual API after checking docs.

## Tokens -> states -> props

| Semantic role | Example mapping | Why |
| --- | --- | --- |
| action-primary | Existing brand accent | Primary operation, not all clickable text |
| text-on-action | Contrast-tested foreground | Legible across normal/pressed/loading |
| focus-ring | Distinct high-contrast indicator | Keyboard position differs from hover |
| field-invalid | Danger border + error text | Error survives color-vision differences |
| surface-disabled | Muted existing surface role | Availability is clear without hiding label |

Choose actual values after inspecting the theme. Never assume a swatch pair passes
contrast; check the pair in the real state. Do not rename established tokens unless
the migration is part of the request.

Button contract: intent (primary/secondary/danger), size (existing scale), disabled,
loading, label, onAction. Loading preserves the label/action identity and width;
it prevents duplicate submissions and exposes progress text. A destructive action
needs a distinct consequence and recovery/confirmation appropriate to the task.

Field contract: stable ID, visible label, value, help, error, required semantics,
onChange and appropriate input type. Label/help/error relationships stay connected
for assistive technology. Errors do not erase the entered value.

## One real usage

InvoiceForm owns values/errors/submitting. SaveButton consumes submitting rather
than managing a separate timer. On invalid submit focus the first failing field or
error summary using existing conventions; on server failure keep values and show
retry; on authoritative success show the detail record. Disabled is not a fake
loading state; a mock timer is not backend persistence.

## Design canvas and QA

In FigCraft, show the component's needed variants on one compact component/state
page and one real form frame. In code, map the variants to existing props and theme
roles; do not rasterize labels. Verify default, keyboard focus, invalid, loading,
failure and success with real text. Check 200% zoom, long labels and a narrow form.
A color-token table without this usage is not an implemented component system.
