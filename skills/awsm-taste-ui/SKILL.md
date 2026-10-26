---
name: awsm-taste-ui
description: Define a distinctive visual direction before choosing layout, color, typography, and imagery for a web UI. Use for landing pages, dashboards, components, redesigns, or requests for a more characterful, less templated interface.
---

# Taste UI: visual decisions you can defend

## Read the context, not a generic moodboard

Identify the product, audience, primary task, brand language, real content, platform, and accessibility constraints. For a redesign, capture the current UI and mark what should be preserved: brand elements, flows, and familiar components. Do not discard a recognizable identity merely to make it look new. If the brief is vague, propose one specific interpretation and name your assumptions.

## Form a concept before writing markup

When exploration is requested, sketch three genuinely different directions; otherwise choose one and explain the intended feeling, dominant element, visual materials, and connection to the subject. Define initial tokens: four to six named color roles, display and body font families with fallbacks, a spacing scale, radius policy, and image rules. Do not reflexively choose Inter/system fonts or a serif-on-cream palette; simplicity is fine when intentional.

Create an ASCII wireframe for key screens: first impression, reading sequence, action location, and differences between sections. Choose **one** memorable visual gesture—typography, imagery, rhythm, data display, or interaction—and keep the rest restrained. Not every piece of information needs a card; borders, numbering, and section labels should encode useful structure.

## Implement and critique

1. Write specific, truthful copy and name the outcome of each CTA. Never fabricate metrics or testimonials. For photography or icons, follow `awsm-assets` and keep licensing records.
2. Establish typography hierarchy (heading, support, body, metadata), comfortable line lengths, contrast, and functional whitespace. Reprioritize content for mobile instead of shrinking the whole desktop layout.
3. Use motion to provide feedback or orientation; `awsm-motion-storyboard` handles details. Visible focus, reduced-motion support, and empty/error states belong in the design.
4. Render and inspect screenshots at 360px and desktop widths. Check the first viewport, cropping, wrapping, and alignment. Evaluate the work against the brief: identify two decisions that help and one thing to simplify. Revise before handoff.

## Deliverable

Provide a concept paragraph, core tokens, a compact wireframe when useful, screenshot or output paths, and rationale for non-generic choices. Do not call a design “premium” without visual and functional evidence.

**Example:** “Design a small stationery catalog that feels like a physical archive instead of a SaaS template; keep our existing logo and explain the type system and mobile layout.”

These instructions are original. If learning from another repository or template, cite it and respect its license rather than copying code or assets unchecked.
