# Changelog

All notable changes to the NodeFlow platform are documented in this file.
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) and [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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

---

## [0.5.0] - 2026-10-15

### Added
- **Multi-Format Universal Converter Hub**: Bi-directional conversion across 30+ diagram formats (PlantUML, Graphviz DOT, D2, SQL DDL, XMind, StarUML, Draw.io, Excalidraw, Figma, Miro, Illustrator).
- **Client-Side Vector & Slide Export**: Lossless SVG with roundtrip metadata, 4× UHD PNG, print-ready PDF, and PPTX slide decks.
- **Encrypted Local Storage**: Browser-local IndexedDB persistence with zero telemetry and complete privacy.

---

## [Upcoming Roadmap]

### [1.3.0] - Q4 2026
- **WebGPU Local LLMs**: Air-gapped AI diagram generation running entirely on client GPUs with zero external API calls.
- **Smart Orthogonal Edge Routing**: Obstacle-avoiding edge paths with custom waypoint controls.
- **P2P Collaboration**: Real-time multi-cursor collaboration powered by WebRTC and CRDTs with zero server persistence.

### [1.4.0] - Q1 2027
- **AST Bi-directional Compiler**: High-fidelity AST replacing regex parser for 100% lossless multi-format roundtripping.
- **Live Cloud Infrastructure Sync**: Direct imports from AWS CloudFormation and Terraform state files.
- **Architecture Drift Detection**: Continuous compliance audit comparing live cloud topologies against approved designs.
