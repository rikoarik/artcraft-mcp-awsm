# Worked example: a mobile service appointment

Illustrative flow, not a backend contract. Adapt it to the actual product and
platform identified in platform-patterns.md. Do not invent availability, price,
location or successful bookings.

## Three surfaces, one job

| Screen | Primary content | Interaction and recovery |
| --- | --- | --- |
| Appointments | Upcoming appointment or honest empty state | Open detail / start booking; preserve list position |
| Service detail | Real service information and available slots | Pick a slot; unavailable states stay explanatory |
| Booking form/result | Selected service/slot, required contact fields, summary | Validate -> submit -> confirmation or retry |

Keep form and result as states of the same route if that fits the existing app;
three surfaces need not mean three new navigation destinations. Add a login gate
only if the product requires one. Do not add a permission request for a task that
needs no camera/location access.

## Platform and component choice

Use the app's existing stack navigation and theme. A booking flow is usually a
nested task, not a new permanent bottom tab. A sheet may suit a short choice;
a long form needs enough scrolling and keyboard space. Use platform-compatible
buttons, inputs, selectors and progress feedback rather than browser-only widgets.
The detail title, slot selection and form errors remain native editable text/UI.

Example reusable contracts:
ServiceSummary(id, title, duration, priceLabel); SlotChoice(value, selected,
available, onSelect); ContactForm(values, errors, submitting, onSubmit);
ResultPanel(status, message, retry). These are conceptual APIs to adapt to the
repo, not ready-made framework components.

## Exact state story

User opens Service A -> selects an available slot -> enters an invalid phone ->
inline error with input preserved -> fixes it -> submits once -> connection fails
-> retry with same values -> authoritative success response -> confirmation.
Without a real API, show 'Demo booking' and do not promise the slot is reserved.
On back/cancel, follow platform conventions and protect unsaved edits where needed.

## Mobile composition and motion

Use the existing licensed body font, readable title/body/label roles, one primary
brand action color and consistent icons. Keep action hierarchy visible when the
keyboard appears; do not hide the submit button behind a fixed decorative footer.
Use the existing platform transition for navigation. Selection can crossfade or
change border/fill immediately; avoid scroll parallax in a form. Reduced motion
retains clear selected, submitting and result states.

## Evidence

Inspect list, selected slot, keyboard-open invalid form, failure and confirmation
on an actual supported emulator/device where available. Exercise system back,
font scaling, screen reader labels and long names. A responsive browser screenshot
of the concept is useful but is not native runtime proof.
