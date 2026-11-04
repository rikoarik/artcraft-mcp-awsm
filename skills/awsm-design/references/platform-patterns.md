# Platform routing for application work

Choose from the existing repository/dependencies and requested destination. Ask
only when the destination cannot be established. Do not ask the user to choose
font weights, animation packages or component APIs. Fetch installed-version docs
when implementing actual framework APIs; these rules are architectural guidance.

| Target | Reuse | Components / navigation | Validation |
| --- | --- | --- | --- |
| Flutter | Existing theme, router, state/repository layers | Native widgets and semantic theme; keep router lifecycle stable | Run app/analyzer and the affected widget/journey tests; inspect emulator/device |
| React Native | Existing navigator, safe-area, keyboard and data patterns | Native controls and installed component system; browser CSS/SVG requires a supported adapter | Target platform build/runtime, back, keyboard, font scaling |
| Compose | Existing navigation/state and Material/platform conventions | Composables with hoisted state and existing tokens | Android runtime, system back, IME/insets and accessibility |
| Responsive web | Existing router, CSS/tokens and semantic DOM | Real links/forms/buttons; responsive reflow and URL state | Browser, keyboard, responsive and reduced-motion states |
| FigCraft app concept | Actual document/layout/components | Editable frames/text/variants; map platform states explicitly | Native design render; report that implementation is not running |

Do not route a FigCraft-only request through design_quickstart, which plans code.
Use craft_prepare for its native canvas. Code app output uses outcome app and its
platform; website output remains website even when it has a mobile breakpoint.
Do not add a browser animation library to a native app merely because a reference
uses React Bits. Translate the interaction principle using existing native APIs.

For platform motion: preserve the system navigation transition and match feedback
to state. Cancel pending work on unmount where the repo pattern requires it;
loading must not disable back indefinitely. Test with reduced-motion/accessibility
settings. The exact library syntax comes from current official docs, not this table.
