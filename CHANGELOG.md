# Changelog

All notable changes to the NodeFlow platform are documented in this file.
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) and [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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

## [1.1.0] - 2026-10-17

### Added
- **Content-Aware Canvas Framing**: Implemented geometry-based bounding box calculations measured from rendered SVG nodes rather than uncalibrated `viewBox` coordinates.
- **Automated Quality Gates**: Added `audit:framing`, `audit:quality`, and `audit:canvas` test scripts to the CI pipeline.

### Changed
- **Gesture Performance**: Decoupled pan and zoom rendering from the React state cycle using direct transform updates.

### Removed
- **Dead Legacy Code**: Purged 4,200+ lines of unreferenced legacy files (`src/main.js`, `src/components/landing.js`, `src/utils/visitor-analytics.js`, `src/components/wasm-benchmark-modal.js`, `src/hooks/useMermaid.js`).

---

## [1.0.0] - 2026-10-16

### Added
- **ARB Well-Architected Auditor**: 6-pillar governance evaluation (Security, Resilience, Ops, Performance, Cost, Governance) with letter grades and downloadable reports.
- **Architecture Decision Records (ADRs)**: MADR-compliant markdown decision logger with node-level binding.
- **Infrastructure-as-Code (IaC) Synthesizer**: Generates production AWS Terraform (`main.tf`) and Docker Compose files from visual topologies.
- **Executive Storyboard Walkthrough**: Presentation mode with spotlight camera framing, step stepper, presenter notes, and auto-play timers.
- **Visual PR Diff & Review**: Graph comparison tool detecting added, removed, and modified components with formatted Markdown PR table export.
- **FinOps Cloud Cost Sizing HUD**: Deterministic offline cost sizing engine covering AWS, GCP, and Azure services.
- **Spotify Backstage Living Catalog**: Exports compliant `catalog-info.yaml` with typed specs and dependency graphs.

---

## [0.9.0] - 2026-10-16

### Added
- **Canva-Style Mobile Canvas**: Touch-friendly bottom sheet for node editing, accessory bar, and responsive touch gestures at 390px viewport.
- **C4 Architecture Deep Drill-Down**: Hierarchical navigation between System Context, Container, and Component diagram layers.
- **Flow Simulation Debugger**: Real-time packet tracing with animated glowing photon pulses along directed connections.
- **Cloud Stencils Drawer**: Pre-configured cloud icon palettes for AWS, GCP, Azure, and Kubernetes.

---

## [0.8.0] - 2026-10-16

### Added
- **Geospatial & Vector Tile Engine**: Support for GeoJSON FeatureCollections, TopoJSON shared arcs, and WKT geometries.
- **Binary Spatial Decoding**: Pure JavaScript parser for Mapbox Vector Tile Protobuf (`.mvt`, `.pbf`) and ESRI Shapefiles (`.shp`, `.dbf`).
- **Geospatial Carto Theme**: High-contrast dark neon cartographic palette for GIS and spatial data pipelines.

---

## [0.7.0] - 2026-10-16

### Added
- **React 19 Modernization**: Integrated `useActionState`, `useOptimistic`, direct `ref` props, and smooth canvas zoom transitions.
- **Universal Network Resilience**: Implemented exponential backoff with jitter and graceful offline degradation.
- **STRIDE Threat Modeling Analyzer**: Security risk auditor flagging direct database access, missing API gateways, and cleartext channels.

---

## [0.6.0] - 2026-10-15

### Added
- **14-Family Visual Modeling**: Visual editing support for Flowcharts, Sequence, Class, State, ER, Mindmaps, GitGraph, Pie, Journey, Kanban, Gantt, Quadrant, Timeline, and Sankey.
- **Direct Canvas Manipulation**: Marquee lasso selection, dynamic floating node toolbar, and interactive drag-to-connect ports.
- **Interactive Radar Minimap**: Real-time viewport camera frustum tracking with click-to-jump navigation.
- **Curated Palette Themes**: Added Nord, Tokyo Night, Cyberpunk, and Catppuccin color palettes with ambient canvas lighting.

---

## [0.5.0] - 2026-10-15

### Added
- **Multi-Format Universal Converter Hub**: Bi-directional conversion across 30+ diagram formats (PlantUML, Graphviz DOT, D2, SQL DDL, XMind, StarUML, Draw.io, Excalidraw, Figma, Miro, Illustrator).
- **Client-Side Vector & Slide Export**: Lossless SVG with roundtrip metadata, 4× UHD PNG, print-ready PDF, and PPTX slide decks.
- **Encrypted Local Storage**: Browser-local IndexedDB persistence with zero telemetry and complete privacy.

---

## [0.4.0] - 2026-09-28

### Added
- **AI Syntax Error Fixer & Synthesizer**: describe-to-diagram converter, codebase-to-UML generator, and auto-repairing syntax engine.
- **Telemetry & Presence Mesh**: Global peer-to-peer presence mesh with live GeoIP telemetry and studio usage analytics dashboard.
- **Enterprise Design System**: Obsidian glassmorphism tokens, glowing micro-interactions, desktop menubar, and calm density layout.

---

## [0.3.0] - 2026-09-27

### Added
- **Universal Importer Expansion**: Added GraphQL, BPMN 2.0, C4 DSL, Terraform HCL, AsyncAPI, FreeMind (`.mm`), and OPML (`.opml`) conversion.
- **WebAssembly Acceleration Suite**: High-performance Graphviz Wasm C engine, inline fast kernel, and interactive benchmark suite.
- **Enterprise Landing & Brand**: Rebranded platform to NodeFlow with interactive competitive comparison matrix and SEO metadata.

---

## [0.2.0] - 2026-09-26

### Added
- **Interactive Node Inspector**: Real-time property modification, version snapshots, and template categorization.
- **In-Browser LLM Execution**: Integrated local Qwen2.5-Coder model via WebAssembly / WebGPU.
- **Pro Export Studio**: Vector PDF rendering, standalone self-contained HTML generation, and presentation mode.
- **Design Tokens**: Full Tailwind CSS v4 support with shadcn tokens and CVA components.

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
