---
name: awsm-prototype-qa
description: Test a new or updated web prototype for interactions, responsiveness, basic accessibility, console and network errors, asset licenses, and reduced motion. Use before handing off a UI or prototype; a passing build is not enough.
---

# Evidence-based prototype QA

## Prepare the test matrix

Get the URL or local run command and the developer's primary journeys. Record 360px, 768px, and 1200px viewports, adding widths where a layout breaks; note the available browser and relevant `default / loading / empty / error / success` states. Do not claim browser or screenshot testing if those tools were unavailable.

## Execute

1. Run the project's existing lint, build, and tests where available. A passing build only proves compilation. Open the UI with browser automation. `serve` can provide a local URL for static pages, but never serve a directory containing secrets.
2. Take screenshots at each viewport and inspect overflow, clipping, cramped or long text, image crops, hidden calls to action, sticky headers, and mobile keyboard effects where possible. Read the images; HTTP 200 alone is not visual QA.
3. Run every journey: opening and closing menus, anchors, calls to action, empty and valid form submissions, submit status, and back navigation. Check keyboard order, visible focus, Enter/Space, Escape for overlays, and input labels. Hover behavior does not prove touch support.
4. Inspect the console and network for JS exceptions, 404s, and failed images or fonts. If a third-party provider is unavailable, the fallback should leave the main flow understandable.
5. Emulate `prefers-reduced-motion: reduce`, test 200% zoom, inspect text and status contrast, meaningful alt text, comfortable touch targets, and layouts with long copy. Verify the source, license, and attribution of images and icons selected through `awsm-assets`.
6. Fix critical issues and rerun affected viewports and journeys. Record anything you could not verify, such as a real backend or physical device.

## Report format

| Severity | Location / viewport | Reproduction steps | Expected vs actual | Evidence | Fix / status |
| --- | --- | --- | --- | --- | --- |

Conclude with pass/fail status per journey, build and test commands, screenshot paths, and explicitly simulated behavior. Block handoff for blank screens, dead primary CTAs, fake persistence claims, or unlicensed assets.

**Example:** “QA checkout from 360–1200px, including empty and valid form states, keyboard, console, and reduced motion; report reproducible findings.”
