---
name: awsm-design
description: One practical design-to-code skill for AWSM. Use for designing websites, admin dashboards, mobile UI, FigCraft handoff, responsive implementation, fonts, icons, assets, SolidCraft parametric 3D modeling and visual quality checks.
---

# AWSM — design, implement, verify

Use **one** workflow rather than loading overlapping design skills. First understand the product, its user, the actual task and target stack. Prioritize a useful rendered result, not an elaborate planning document. Reuse the project's established UI components, assets, tokens, fonts, icons and dependencies.

## First usable design

For a brief or existing project, call `design_quickstart` once with the actual brief and project root. Respect its context, but do not treat its inferred visual direction as proof of design quality. Choose a layout and hierarchy appropriate to the product: administrative systems need operable tables, filters and states; mobile apps need native navigation, safe areas and accessible controls; landing pages need meaningful copy, product proof and deliberate composition.

Implement the first useful screen or section using the existing stack, including real content and the primary interaction. Render and review it early. Avoid generic gradient hero templates, arbitrary icon sets, excessive decorative cards, dead controls and long speculative planning.

## One connection to other MCP servers

AWSM can be the **only configured MCP entry in the coding agent** while forwarding to explicitly configured downstream MCP servers. Discover available integrations with `bridge_list({connect:true})` and call a named tool using `bridge_call({server,tool,arguments})`. Read each tool's input schema before invoking it.

A project owner configures downstream stdio servers in `.awsm/bridges.json` with command, args and an explicit `allowedTools` list. Never invent credentials, command paths or tool names; a missing bridge is not an available integration. Do not assume the AWSM bridge automatically discovers or installs third-party servers. Use native FigCraft through this bridge if configured; otherwise the project must connect FigCraft separately. Calls to downstream tools can modify documents or files, so respect the user's permissions and avoid destructive actions without authorization.

## SolidCraft: high-quality parametric 3D (only when relevant)

For CAD, product modeling, enclosures, mechanical parts or 3D asset requests, check `bridge_list({server:"solidcraft"})`. AWSM automatically discovers an **already installed** `solidcraft-cli` on PATH, but does not download software or launch it at startup. Connect only when the user requests SolidCraft work: `bridge_list({server:"solidcraft",connect:true})`, then use `bridge_call` with discovered tool schemas. If not found, state that SolidCraft must be installed or explicitly configured; do not fake a result. User config `.awsm/bridges.json` overrides autodiscovery. Never invoke SolidCraft for ordinary UI designs.

**Use the official SolidCraft skills rather than replicating its CAD engine.** Start with `skill_reference({skill:"solidcraft-modeling"})` and `inspect_design({measure:false,sketches:false})` through `bridge_call`. Also read `solidcraft-checking` for validation and `solidcraft-editing` when modifying existing models. The official source of truth is https://github.com/tangency-labs/solidcraft/tree/main/skills. Call `list_commands` with a filter or `describe_command` for any unknown API shape; never invent CAD commands or copy an exhaustive command catalog into context.

**Style-first 3D direction (before building geometry):** The user's requested style or supplied reference image is the source of truth for the *look*, not an excuse to apply a default "premium" appearance. If a reference image is available to the coding agent, inspect it before CAD calls. Translate it into a short internal style specification with: (1) silhouette and recognizable proportions, (2) surface language—flat/faceted vs rounded, edge radii and detail density, (3) primary/secondary color placement, (4) opaque material character and roughness, (5) desired composition, camera angle, framing and background, and (6) non-negotiable functional dimensions. Prioritize silhouette/proportions before color and lighting. For text-only briefs, infer a coherent direction from the requested style and intended use instead of falling back to generic gray CAD. Do not claim an image/reference was analyzed if it was not accessible.

Treat visual direction as constraints on the **actual model**, not only post-processing: create a matching parametric shape vocabulary (bevels/fillets, repeated motifs, negative space, body segmentation and thickness), with purposeful named features. Use a small number of coherent opaque materials. "Soft toy", "low-poly", "hard-surface industrial", and "minimal product" imply different geometry and finish; they are not interchangeable presets. Do not add ornamental details that depart from the reference. Keep real dimensions and manufacturability authoritative for engineering tasks; visually interpret stylistic briefs when no fabrication accuracy is requested. SolidCraft is a parametric CAD system, **not** a freeform sculptor or full cinematic renderer: explain limitations for organic characters, true soft deformation, transparent glass, textured fabrics or other unsupported effects instead of inventing capabilities.

**Modeling standard:** interpret real functional intent and dimensions before choosing geometry. Establish millimeter units, parameters, origin, symmetry, constraints and named features. Prefer editable sketches and a meaningful feature timeline to disconnected primitives. Build in a few purposeful `batch` calls with rollback enabled, stage risky boolean operations separately, and use `verbose:false` for large results. Respect existing unsaved designs: never reset or open another file without user approval. Changing a model is not approval to overwrite an existing file.

**Geometric verification:** after meaningful features, use `measure` and compare bounding box, volume, centers and body count with independently expected dimensions. Check `inspect_design` for feature errors and sketch constraints; never equate a successful command response with a correct solid. Test at least one meaningful parameter change when parametric behavior matters, then re-measure to verify dependent geometry updates. Use `body_topology` selectively, not as default context. Check clearance, wall thickness, fillets, intersections, symmetry and intended manufacturability when relevant.

**Visual presentation and style fidelity:** Once geometry is valid, assign a small set of intentional body/face appearances based on the style specification. For opaque product finishes SolidCraft supports `appearance.assign` with PBR values (metallic, roughness, dielectric IOR), independent from the physical material/density. Check command schema with `describe_command`; don't guess material names or renderer settings. Test the *actual* model using `screenshot({source:"model",view:"iso",width:960,height:720,grid:false,axes:false})` or a camera matched to the reference, plus a top/front/detail view when needed. The MCP screenshot returns image content: the coding agent should **inspect that image**, compare silhouette, ratio, edge treatment, component hierarchy, palette and angle against the user's reference, identify the 2–3 biggest visible mismatches, and make targeted edits. Re-measure after geometry edits. Repeat only as needed (typically up to 2–3 visual iterations); do not stop solely because `batch` returned success. Pixel-diff alone is not a semantic style comparison; don't claim exact style matching without visual examination.

For an intentionally polished product image, use native `render.preflight`, `render.start`, `render.status` and `render.export` through `execute` with the full returned job ID, preserving the model's finish and a deliberate composition. Consult https://github.com/tangency-labs/solidcraft/blob/main/docs/render-jobs.md and docs/render-opaque-pbr.md. Match supported camera, material and framing choices to the brief. A clean model preview is valid when native product rendering is unavailable; never fabricate a "final render" or claim unsupported glass/refraction, HDRI, texture mapping or photorealism.

**Deliverable:** save the editable `.sc` model when requested, export STEP or 3MF/STL for the actual downstream need, and provide representative image previews. Clearly separate verified geometry from visual-only polish. Calls to `execute`, `batch`, `save`, `export` and rendering can mutate state or write files; apply user approvals and file-scoping rules. Avoid `--allow-any-path` unless explicitly approved. If SolidCraft reports a running operation or a timeout, inspect state before repeating a mutation.

## When a FigCraft source exists

Inspect the source document through **FigCraft's own MCP**, either directly when already connected or through the AWSM gateway when configured. Call AWSM `prepare_web_handoff` with a complete layer tree and optional asset inventory; review ambiguous layers. Use FigCraft's native export for individual artwork, then `sync_figcraft_assets` for file paths and a verified asset manifest. Keep text, buttons, tables, layouts and application components as editable HTML or native widgets. Never flatten a full functional screen to a single image.

## Visual assets and typography

Use local assets first. For missing images or icons, call `find_design_assets` with a small batch of purposeful queries. Prefer a single icon family; use `save_icon_set` or `draw_icon` only for genuine missing icon assets. Inspect licensing and attribution. Use `extract_design_tokens` when FigCraft layer data exists. For fonts, reuse project fonts or `google_font` and integrate via the target framework. Check glyph coverage, font weights and license before release.

## Review and fix

Run the actual app. When project-local Playwright is available, prefer `review_ui` for a single-pass browser audit, screenshots and optional matching-size FigCraft comparison. Fix major hierarchy, typography, overflow, broken images, inaccessible controls and bad responsive layout before decorative polish. The coding agent makes code changes; AWSM only provides evidence and utilities. Verify working navigation, interactions and relevant loading, empty and error states separately. Do not claim browser/device verification when none occurred.

## Boundaries

AWSM is a **local, free stdio MCP**, not a second autonomous coding agent. Do not automatically install browser binaries, change frameworks, replace user-customized files, or create a VPS. Load additional specialized skills only when the user explicitly wants the expanded library. Keep the implementation maintainable and report unverified areas clearly.
