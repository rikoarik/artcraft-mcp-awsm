---
name: awsm-app-ui
description: Build product-grade mobile or desktop app UI flows in Flutter, React Native/Expo, Kotlin/Jetpack Compose, or a web app shell, using platform patterns and complete interaction states.
---

# Application UI, not a mobile website screenshot

Read the target platform, navigation structure, source repository, data and state management patterns before building anything. A Flutter BLoC project, Kotlin Compose app and Expo app require different primitives; do not transplant CSS or browser SVG directly into native widgets. Respect existing MVVM, clean architecture and application navigation decisions where they already work.

## Flows and screens

Map core journeys before drawing isolated pages: entry and onboarding, authenticated home, discovery or list, detail, creation, edit, confirmation, permission handling and failure recovery. Specify a screen graph with deep links and back navigation. Design a coherent density, spacing and type scale for the target device. Use native safe areas, system bars, keyboard insets, touch targets, and accessibility semantics.

Make design choices specific to the product. Payment and POS screens prioritize transaction state and irreversible actions; attendance apps prioritize location, camera permissions and clear time feedback; shopping apps prioritize catalog discovery and conversion. Avoid generic large-gradient headers and repeated cards that conceal actual data.

## Assets and icons

Use awsm-iconography for one consistent icon language and produce platform-compatible vectors and density-aware raster assets. If the source comes from FigCraft, inspect and classify its layers first; export standalone visual assets and keep text, form controls and layout as native widgets. Respect existing light and dark semantic tokens. Do not confuse a FigCraft render with an implemented screen.

## Implementation and verification

Build working transitions, validation, loading skeletons, empty/error/offline states and accessible feedback using the app's real state mechanism. Connect to provided repositories and APIs when authorized; otherwise mark fake data and simulated calls clearly. Verify scroll and keyboard interactions, long translated strings, font scaling, focus order, system back, landscape or tablet when relevant, and permission denials.

Deliver working source files with routes, reusable widgets, assets and screenshots or previews when tools permit. Never claim emulator validation without launching an emulator or real device. Quality is measured by usable task completion and reliable behavior, not by the number of screens produced.
