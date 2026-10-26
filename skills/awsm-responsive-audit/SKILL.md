---
name: awsm-responsive-audit
description: Test and repair web layouts across mobile, tablet, desktop, zoom, and long content. Use when a UI overflows, navigation breaks, images crop poorly, or a responsive prototype is nearing handoff.
---

# Responsive auditing beyond three screenshots

## Initial audit

Start with 360px, 768px, and 1200px viewports, then add intermediate widths wherever the layout changes or fails. Include 320px if smaller target devices matter. Test at 200% browser zoom or larger font scaling when possible. Prepare stress content: long names, form errors, many menu items, slow or missing images, and unbroken URLs.

## Inspect, fix, recheck

1. Capture screenshots and scroll through the whole page at each viewport. Check horizontal overflow, headers and navigation, tap targets, reading order, heading wraps, line length, photography and crops, text overlays, fixed/sticky elements, the footer, and content hidden behind a mobile keyboard.
2. Run the same journey on mobile and desktop. Menus, search, forms, dialogs, and CTAs may behave differently even when the page looks correct. Test portrait and landscape when important to the flow.
3. Fix for the content: use sensible `max-width`, fluid widths and spacing, image `object-fit` with a meaningful focal point, and breakpoints where the composition actually fails. Do not add one breakpoint per device model. Prioritize hierarchy and content.
4. Recapture failed widths and one width between breakpoints to catch regressions. Repeat long-text and zoom checks after the fix.

## Output

Report `viewport | issue | evidence | change | retest status`. Include screenshot paths or a preview URL, and note testing limits if no browser or device was available. A few CSS media queries do not prove that a page is responsive.

**Example:** “The pricing page breaks at 390px. Audit mobile, tablet, and desktop plus 200% zoom; repair the table and retake screenshots.”
