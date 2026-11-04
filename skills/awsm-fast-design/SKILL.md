---
name: awsm-fast-design
description: Rapidly turn a product request or FigCraft design into a useful first UI render without wasteful research, repetitive tool calls, or long preliminary documents. Use when user says fast, quickly, immediately, prototype, or design a screen.
---

# Fast execution of an already scoped task

This is the short implementation loop, not another intake or a replacement for
product reasoning. Use it after a brief is resolved when speed matters. The core
owns routing; prompt-to-prototype owns the end-to-end coordination; auto-prototype
owns ordinary web interaction implementation. Do not run all three coordinators.

## Route correctly

For website/app code use design_quickstart with the existing briefId. For a
FigCraft-only request use craft_prepare for FigCraft, not design_quickstart.
For native app code use its platform playbook and runtime. Never create web code
because the reference happens to be a design canvas.

## One useful first render

Inspect the relevant entry point, tokens, data shape and reusable components.
Read a matching domain/visual reference when the decision needs one. Own routine
font/color/icon choices; reuse licensed local assets before fetching replacements.
Do not produce a long speculative design document or arbitrary KPI-card layout.

Implement one meaningful screen and its primary interaction using the existing
stack. For a queue request, expose actionable records; for marketing, show the
actual offer and proof; for native mobile, preserve platform navigation and insets.
Use real content where available and label demo data. Batch purposeful missing
asset lookups rather than testing every tool.

## One review, then finish the scope

Prefer review_ui for a real local web page when Playwright is available; it captures
and audits in one browser pass. Use separate tools only to investigate a failed
step. Inspect the images and exercise the primary action; the audit does not click
through the journey. If unavailable, use the client's existing browser tools and
report what could not be checked. A FigCraft render needs native design inspection,
not a browser-only audit.

Fix the highest-impact hierarchy, font, crop, overflow or state defect first. Then
complete the requested small flow, its failure recovery and relevant mobile states.
Do not stop permanently at the first screen when the user requested a whole flow.
Use validation-matrix.md through design_guidance to scale checks to the change.
Hand off actual artifacts, inspected evidence and remaining boundaries. Speed means
less redundant discovery, not skipped correctness or fabricated verification.
