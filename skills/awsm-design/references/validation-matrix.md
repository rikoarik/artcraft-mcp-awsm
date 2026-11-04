# Proportionate acceptance checks

Choose checks from the changed behavior. Do not execute a whole-application matrix
for a one-icon change, or call a whole application complete from one screenshot.

| Scope | Required relevant evidence | Expand only when |
| --- | --- | --- |
| Icon/style tweak | Actual-size rendering, affected contrast/alignment and neighboring control | Shared token/component behavior changed |
| Component | Needed states, keyboard semantics and one real usage at narrow/wide size | Component affects multiple flows |
| Admin flow | Queue/detail/action, error recovery, retained context, long data | More roles/routes/data integration are in scope |
| Native app | Target runtime, system back, keyboard/insets, scaling, primary journey | Additional platform/tablet support is requested |
| Marketing page | Offer/proof/CTA, assets/fonts, complete responsive page | Motion or conversion integration adds states |
| Motion page | Entrance/hold/exit, fast/reverse scroll, load/fallback, mobile/reduced motion | Hardware/performance concerns remain |
| Native model | Bounds, features, relevant dimensions and inspected views | Fit, fabrication or parameter dependencies matter |

`review_ui` is a useful read-only local browser audit, not a functional test runner.
Its fresh browser context does not inherit the user's logged-in browser session.
For authenticated flows use the client's authorized browser/session tooling or a
properly scoped test fixture. Never claim protected-page coverage from a login-page
capture. The tool blocks external origins; inspect blocked assets/fonts/API calls
before interpreting screenshots. Do not weaken restrictions to hide a failed test.

For static visual diffs, match viewport/state/theme/fonts/data and capture settings.
For motion assessment, additionally inspect motion-enabled states; a reduced-motion
pixel match does not test scroll choreography. Report runtime, settings, evidence,
what passed/failed, and checks skipped. Test output is evidence only for the scenario
actually exercised. Structural skill validation is not design-quality validation.
