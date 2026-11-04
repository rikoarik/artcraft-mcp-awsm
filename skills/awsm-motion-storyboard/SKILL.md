---
name: awsm-motion-storyboard
description: Plan and implement purposeful web motion for screen transitions, control feedback, and scroll storytelling, with reduced-motion behavior and performance testing. Use when a brief mentions GSAP, animations, microinteractions, or motion prototypes.
---

# A cause-and-effect motion storyboard

## Prioritize signals

List interaction events, not merely elements that could move. Describe each animation as `trigger | before → after | properties | approximate duration | end condition | reduced-motion behavior`. Classify it as feedback (click/submit), orientation (menu/modal), or content narrative. Do not delay the appearance of every section simply because the page scrolls.

## Implementation rules

1. Start with native CSS transitions for simple cases. Animating `transform` and `opacity` is usually less costly than repeatedly animating layout, `height`, or `left`. Every state change should remain understandable without animation.
2. If the project uses GSAP or Motion, check documentation for its installed version while implementing. Tie timelines to component lifecycles, clean up listeners and ScrollTriggers when leaving a route, and prevent duplicate triggers after hot reload. Do not install a large library for a single fade.
3. Entrances should be brief and have a reachable final state even if JavaScript fails. Do not leave the heading or main CTA at permanent opacity zero. Avoid scroll-jacking, fast parallax, constant movement, and controls that move under the pointer.
4. With `prefers-reduced-motion: reduce`, remove nonessential movement or switch states instantly. Preserve content and feedback that animation would otherwise reveal. Ensure movement does not interfere with keyboard focus.

## Validate

Capture before/after states or a recording. Test on slower mobile hardware where possible and with reduced motion. Inspect clipping, layout shifts, and input latency. Shorten or remove motion if it makes content harder to read. Hand off the storyboard and list of working animations; if the deliverable is only a static mockup, state that no actual animation exists.

**Example:** “Add a slide-in menu and submission feedback to the booking prototype without distracting form users or people who prefer reduced motion.”

## Worked choreography and technique choice

Load motion-direction.md and motion-worked-example.md through design_guidance
motion. The worked speaker story specifies entrance/hold/exit, object/camera changes,
copy, background, mobile and reduced-motion alternatives for every segment. Adapt
the intervals to the actual content; do not copy a global scroll fraction blindly.

Inspect a chosen React Bits demo/source only when it fits the story, use the repo's
matching variant and lifecycle, and fetch current library docs before API use.
Implement in actual app components; .mjs preview/QA helpers are not the website.
Report implemented versus proposed motion separately. Native app motion uses its
platform playbook, not a browser scroll library.
