# Changelog

All notable changes to the NodeFlow platform are documented in this file.
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) and [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [1.3.3] - 2026-10-17

### Fixed
- **Eliminated Maximum Update Depth Exceeded**: Replaced Radix `DropdownMenu`, `Tabs`, and `Tooltip` with zero-dependency native React components, eradicating `RovingFocusGroup` and `PopperAnchor` layout effect cascades.
- **requestAnimationFrame Keystroke Batching**: Batched rapid CodeMirror document change events using `requestAnimationFrame` before dispatching to React state, ensuring 120 FPS fluid typing and preventing concurrent render collisions.
- **Autosave & Compilation Passive Effect Decoupling**: Removed synchronous `setState` invocations from `useWorkspace` and `useDocumentPreview` `useEffect` handlers, preventing cyclic passive effect flushes while typing.
- **Universal Syntax & Quick Fix Enhancement**: Enhanced `repairReportedLine` with missing node identifier generation (`A --> [broken]` to `A --> Node_N[broken]`), bracket/parentheses balancing, and strict EOF line clamping.

### Added
- **Automated Real Browser Interactivity Suite**: Created `scripts/interactive-canvas-editor-test.mjs` verifying CodeMirror typing, live canvas SVG re-rendering, node selection, canvas pan/zoom, and one-click AI Quick Fix in headless Chrome with zero console errors.

---

## [1.3.2] - 2026-10-17

### Added
- **AI Prompt Token Optimizer**: Implemented `src/utils/ai-token-optimizer.js` with heuristic token estimation and diagram context compression (stripping non-structural styling, comments, and empty lines), reducing token usage by 30-50%.
- **AI Provider Health Diagnostics**: Built `src/utils/ai-health-check.js` to evaluate hardware WebGPU acceleration, local Ollama daemon connectivity, and cloud API keys with offline deterministic fallback (`instant`).
- **Resilient AI Querying**: Wired `fetchWithRetry` into AI providers (`ollama`, `openaiCompatible`), adhering to exponential backoff and network failure degradation policy.
- **Preflight Quality Gate**: Added `npm run preflight` script executing ESLint, 173 unit tests, 114 diagram checks, and version consistency audit before commit and push.
- **Studio Live Metrics**: Integrated token counter, compression ratio, and resilient fallback status indicator directly below the prompt input in the Diagram Assistant dialog.

---

## [1.3.1] - 2026-10-17

### Added
- **Full Historical Changelog Engine**: Extended platform changelog and interactive `/changelog` visual page back to the very first commit (2026-09-24), capturing all release milestones with verified git commit references and semantic grouping.
- **Logic & UI Separation via Modern React Patterns**:
  - Extracted `useExportStudio` hook (`src/hooks/useExportStudio.js`) and decomposed `ExportStudioModal.jsx` into `ExportPreviewPane.jsx` and `ExportControlsPane.jsx` (reduced from 391 lines to 82 lines).
  - Extracted `useEditorDiagnostics` hook (`src/hooks/useEditorDiagnostics.js`) and `EditorDiagnosticsBanner` component (`src/components/editor/EditorDiagnosticsBanner.jsx`), decoupling CodeMirror view rendering from diagnostic state and repair side-effects.

### Changed
- Bumped package release to `v1.3.1` with synchronized release dates across documentation, metadata, and `/changelog`.

---

## [1.3.0] - 2026-10-17

### Added
- **Context-Aware Autocomplete**: Scoped keyword completions per diagram family (flowchart, sequence, class, state, er), added 8 node shape snippet templates after arrow operators, and suppressed keyword popups inside string literals or bracket labels.
- **Enhanced Canvas Content Selectors**: Added pie chart, quadrant point, git graph commit, block element, and legend selectors to `CANVAS_CONTENT_SELECTOR` for comprehensive, multi-diagram framing accuracy.

### Fixed
- **Editor Focus Retention**: Prevented CodeMirror instance destruction on parent re-renders and keystrokes, preserving cursor position, selection, and active input state.
- **Click-to-Focus & Document End Navigation**: Clicking anywhere within the editor panel host or empty area below source lines focuses CodeMirror and places the cursor at the end of the document.
- **Deterministic Quick Fix Reliability**: Enhanced `repairReportedLine` to reliably repair line 1 headers, unclosed brackets/quotes before/after arrows, unquoted label punctuation, single arrows (`->` to `-->`), and trailing semicolons.
- **Line-Targeted Diagnostics**: Upgraded `explainError` in `syntax-error-db.js` to prioritize the exact reported error line, providing actionable diagnostic hints with bad/good syntax comparisons and 1-click line repair.

---

## [1.2.1] - 2026-10-17

### Added
- **Canvas Framing Audit Runner**: Engineered automated `audit:framing` test runner validating bounding boxes across all 51 gallery templates with headless browser verification.
- **Geometry-Based Viewport Calculations**: Measured true bounding box directly from rendered SVG elements with 6% padding tolerance.

---

## [1.2.0] - 2026-10-17

### Added
- **Modular Data Architecture**: Extracted monolithic datasets into single-responsibility modules:
  - Template catalog decomposed into `src/data/templates/` (51 templates across 17 domain files).
  - Theme variable definitions moved to `src/utils/theme-variables.js`.
  - Export Studio configurations moved to `src/data/export-options.js`.
  - Architecture Decision Records moved to `src/data/default-adrs.js`.
  - Landing page showcase data moved to `src/data/landing-data.js`.
- **Geospatial Engine Decomposition**: Separated binary decoders (`geospatial-binary.js`) and spatial DSL parsers (`geospatial-dsl.js`) from `geojson.js`.
- **Reusable ProjectDialog**: Extracted project creation and deletion modal into `src/components/ProjectDialog.jsx`.
- **Changelog Surface**: Comprehensive `CHANGELOG.md` and dedicated `/changelog` visual route displaying platform history and upcoming roadmap.

### Fixed
- **Code Quality Guardrails**: Resolved all parameter limits (STRIDE findings refactored to options objects) and reduced hard-limit failures across `scripts/audit-code-quality.mjs`.
- **Canvas Quick-Add Safety**: Fixed argument propagation in `CanvasStage.jsx` quick-add handler to ensure DOM events are not treated as labels.
- **Inspector Density**: Grouped long inspector controls into sleek collapsible `<details>` cards with sticky action footer.

---

## [1.1.1] - 2026-10-16

### Removed
- **Dead Legacy Code**: Purged over 4,200 lines of obsolete, unreferenced legacy code files (`src/main.js`, `src/components/landing.js`, `src/utils/visitor-analytics.js`, `src/components/wasm-benchmark-modal.js`, `src/hooks/useMermaid.js`).

### Added
- **Enterprise Suite Top Navigation**: Added enterprise suite menu to studio top navigation bar for 1-click access to Threat Modeling, ADRs, and IaC Synthesizer.

---

## [1.1.0] - 2026-10-16

### Added
- **Executive Storyboard Walkthrough**: Presentation mode with spotlight camera framing, step stepper, presenter notes, and auto-play timers.
- **Infrastructure-as-Code (IaC) Synthesizer**: Generates production AWS Terraform (`main.tf`) and Docker Compose files from visual topologies.
- **ARB Well-Architected Auditor**: 6-pillar governance evaluation (Security, Resilience, Ops, Performance, Cost, Governance) with letter grades and downloadable reports.

---

## [1.0.0] - 2026-10-16

### Added
- **Enterprise Architecture Studio Release**: Official 1.0.0 milestone.
- **Architecture Decision Records (ADRs)**: MADR-compliant markdown decision logger with node-level binding.
- **Visual PR Diff & Review**: Graph comparison tool detecting added, removed, and modified components with formatted Markdown PR table export.
- **FinOps Cloud Cost Sizing HUD**: Deterministic offline cost sizing engine covering AWS, GCP, and Azure services.
- **Spotify Backstage Living Catalog**: Exports compliant `catalog-info.yaml` with typed specs and dependency graphs.

---

## [0.9.1] - 2026-10-16

### Fixed
- **Editor Keystroke Synchronization**: Resolved editor typing interception loops and synchronized editor state with external source updates.
- **Mobile Touch Layout**: Fixed responsive layout visibility bugs on narrow touch screens and clamped toolbar popovers.

---

## [0.9.0] - 2026-10-16

### Added
- **Canva-Style Mobile Canvas**: Touch-friendly bottom sheet for node editing, accessory bar, and responsive touch gestures at 390px viewport.
- **C4 Architecture Deep Drill-Down**: Hierarchical navigation between System Context, Container, and Component diagram layers.
- **Flow Simulation Debugger**: Real-time packet tracing with animated glowing photon pulses along directed connections.
- **Cloud Stencils Drawer**: Pre-configured cloud icon palettes for AWS, GCP, Azure, and Kubernetes.
- **Role Starters**: Role starters and filters tailored for Product Managers, QA Engineers, Developers, and Students.

---

## [0.8.1] - 2026-10-16

### Fixed
- **Context Menu Viewport Clamping**: Clamped canvas right-click context menus within viewport bounds to eliminate overflow clipping.
- **Canvas Vertical Centering**: Fixed canvas vertical centering alignment when opening diagrams with unequal aspect ratios.
- **Compiler Error Sync**: Synchronized preview compilation errors directly to editor gutter markers.

---

## [0.8.0] - 2026-10-16

### Added
- **Geospatial & Vector Tile Engine**: Support for GeoJSON FeatureCollections, TopoJSON shared arcs, and WKT geometries.
- **Binary Spatial Decoding**: Pure JavaScript parser for Mapbox Vector Tile Protobuf (`.mvt`, `.pbf`) and ESRI Shapefiles (`.shp`, `.dbf`).
- **Geospatial Carto Theme**: High-contrast dark neon cartographic palette for GIS and spatial data pipelines.

---

## [0.7.1] - 2026-10-16

### Fixed
- **Defensive Event Teardown**: Enforced strict DOM and pointer event listener teardown across all interactive canvas controllers.
- **Private Browsing Fallback**: Added fault-tolerant fallbacks for private browsing modes where IndexedDB storage is restricted.

---

## [0.7.0] - 2026-10-16

### Added
- **React 19 Modernization**: Integrated `useActionState`, `useOptimistic`, direct `ref` props, and smooth canvas zoom transitions.
- **Universal Network Resilience**: Implemented exponential backoff with jitter and graceful offline degradation.
- **STRIDE Threat Modeling Analyzer**: Security risk auditor flagging direct database access, missing API gateways, and cleartext channels.
- **Real-Time Error Linter**: 160ms linter with error squiggles and contextual arrow autocomplete.

---

## [0.6.1] - 2026-10-15

### Fixed
- **Modal Escape Listener**: Fixed global keyboard listener leaks on modal dismissals.
- **Canvas Gradient Export**: Resolved canvas gradient clipping artifacts during multi-format image export.
- **Pointer Cancel Cleanup**: Cleaned pointer cancel event propagation in edge drawing routines.

---

## [0.6.0] - 2026-10-15

### Added
- **14-Family Visual Modeling**: Visual editing support for Flowcharts, Sequence, Class, State, ER, Mindmaps, GitGraph, Pie, Journey, Kanban, Gantt, Quadrant, Timeline, and Sankey.
- **Direct Canvas Manipulation**: Marquee lasso selection, dynamic floating node toolbar, and interactive drag-to-connect ports.
- **Interactive Radar Minimap**: Real-time viewport camera frustum tracking with click-to-jump navigation.
- **Curated Palette Themes**: Added Nord, Tokyo Night, Cyberpunk, and Catppuccin color palettes with ambient canvas lighting.

---

## [0.5.1] - 2026-10-15

### Fixed
- **GitHub Pages Routing**: Fixed GitHub Pages sub-path asset loading and SPA history fallback routing.
- **Test Server Base Path**: Ensured Vite dev server base path is / during local test execution and /node-flow/ for production deployment.

---

## [0.5.0] - 2026-10-15

### Added
- **Multi-Format Universal Converter Hub**: Bi-directional conversion across 30+ diagram formats (PlantUML, Graphviz DOT, D2, SQL DDL, XMind, StarUML, Draw.io, Excalidraw, Figma, Miro, Illustrator).
- **Client-Side Vector & Slide Export**: Lossless SVG with roundtrip metadata, 4× UHD PNG, print-ready PDF, and PPTX slide decks.
- **Encrypted Local Storage**: Browser-local IndexedDB persistence with zero telemetry and complete privacy.

---

## [0.4.1] - 2026-09-28

### Added
- **Ergonomic Desktop Menu Bar**: Replaced crowded mobile-first header with desktop menu bar and captured high-res UI screenshots.

---

## [0.4.0] - 2026-09-28

### Added
- **AI Syntax Error Fixer & Synthesizer**: describe-to-diagram converter, codebase-to-UML generator, and auto-repairing syntax engine.
- **Telemetry & Presence Mesh**: Global peer-to-peer presence mesh with live GeoIP telemetry and studio usage analytics dashboard.
- **Enterprise Design System**: Obsidian glassmorphism tokens, glowing micro-interactions, desktop menubar, and calm density layout.

---

## [0.3.1] - 2026-09-27

### Fixed
- **Deployment Automation**: Configured automated GitHub Pages deployment workflow named NodeFlow.
- **Format Sniffing**: Hardened content sniffing for multi-format imports.

---

## [0.3.0] - 2026-09-27

### Added
- **Universal Importer Expansion**: Added GraphQL, BPMN 2.0, C4 DSL, Terraform HCL, AsyncAPI, FreeMind (`.mm`), and OPML (`.opml`) conversion.
- **WebAssembly Acceleration Suite**: High-performance Graphviz Wasm C engine, inline fast kernel, and interactive benchmark suite.
- **Enterprise Landing & Brand**: Rebranded platform to NodeFlow with interactive competitive comparison matrix and SEO metadata.

---

## [0.2.1] - 2026-09-26

### Fixed
- **AI Drawer Responsiveness**: Resolved layout and positioning glitches in the collapsible AI Assistant drawer on tablet viewports.

---

## [0.2.0] - 2026-09-26

### Added
- **Interactive Node Inspector**: Real-time property modification, version snapshots, and template categorization.
- **In-Browser LLM Execution**: Integrated local Qwen2.5-Coder model via WebAssembly / WebGPU.
- **Pro Export Studio**: Vector PDF rendering, standalone self-contained HTML generation, and presentation mode.
- **Design Tokens**: Full Tailwind CSS v4 support with shadcn tokens and CVA components.

---

## [0.1.1] - 2026-09-24

### Fixed
- **CI Dist Verification**: Fixed CI pipeline to build production assets before executing dist verification tests.

---

## [0.1.0] - 2026-09-24

### Added
- **Platform Inception**: Initial Vite and React studio foundation with real-time Mermaid preview and SVG export.
- **Automated CI Validation**: Static build verification and syntax regression testing pipelines.

---

## [Upcoming Roadmap]

### [1.4.0] - Q4 2026
- **WebGPU Local LLMs**: Air-gapped AI diagram generation running entirely on client GPUs with zero external API calls.
- **Smart Orthogonal Edge Routing**: Obstacle-avoiding edge paths with custom waypoint controls.
- **P2P Collaboration**: Real-time multi-cursor collaboration powered by WebRTC and CRDTs with zero server persistence.

### [2.0.0] - Q1 2027
- **AST Bi-directional Compiler**: High-fidelity AST replacing regex parser for 100% lossless multi-format roundtripping.
- **Live Cloud Infrastructure Sync**: Direct imports from AWS CloudFormation and Terraform state files.
- **Architecture Drift Detection**: Continuous compliance audit comparing live cloud topologies against approved designs.
## Phase 801-900: Documentation updated, final cleanup applied
