export const CHANGELOG_ENTRIES = [
  {
    version: "1.3.1",
    date: "2026-10-17",
    type: "patch",
    title: "React Architectural Patterns, Logic De-coupling & Complete Historical Changelog",
    highlights: [
      "Logic & UI Separation: Extracted useExportStudio custom hook and decomposed ExportStudioModal into ExportPreviewPane and ExportControlsPane, reducing component complexity by over 75%.",
      "Decoupled Diagnostics Banner: Extracted useEditorDiagnostics custom hook and EditorDiagnosticsBanner component, isolating CodeMirror view rendering from diagnostic state and repair side-effects.",
      "Comprehensive Historical Changelog Engine: Extended platform changelog and interactive /changelog page back to the very first commit (2026-09-24), grouping all major, minor, and patch milestones.",
      "Package Version Bump: Synchronized package.json to v1.3.1 and aligned semantic version badges across the changelog timeline.",
    ],
    commits: [
      { hash: "1322a17", message: "refactor(react): separate logic from UI using custom hooks and presentational sub-components" },
    ],
  },
  {
    version: "1.3.0",
    date: "2026-10-17",
    type: "minor",
    title: "Editor Focus Reliability, Deterministic Quick Fix & Context-Aware Autocomplete",
    highlights: [
      "Editor Focus Retention: Preserved CodeMirror instance lifecycle across parent re-renders and keystrokes, eliminating focus loss and editor recreation.",
      "Click-to-Focus & End Selection: Clicking anywhere in the editor panel or empty space below code immediately focuses and positions cursor at the end of the document.",
      "Deterministic Quick Fix: Enhanced repairReportedLine to resolve line 1 headers, unclosed brackets/quotes before/after arrows, unquoted punctuation in labels, single arrows (-> to -->), and trailing semicolons.",
      "Line-Targeted Diagnostics: Upgraded explainError in syntax-error-db.js to prioritize the exact reported error line, providing high-precision cause explanations and 1-click line repair.",
      "Context-Aware Autocomplete: Suppressed keywords inside string literals and bracket labels, added node shape snippets, and scoped keywords to active diagram types.",
      "Canvas Content Framing: Extended CANVAS_CONTENT_SELECTOR to include pie charts, quadrant points, commits, block elements, and legends for 100% framing pass.",
    ],
    commits: [
      { hash: "9f33eab", message: "fix(editor): focus retention, deterministic line quick fix, contextual autocomplete, and framing selectors" },
    ],
  },
  {
    version: "1.2.0",
    date: "2026-10-17",
    type: "minor",
    title: "Code Quality Burn-down & Modular Architecture Refactor",
    highlights: [
      "Modularized monolithic files into focused domain modules: extracted template datasets into src/data/templates/, theme variables into src/utils/theme-variables.js, and export options into src/data/export-options.js.",
      "Decomposed geospatial parsers into dedicated binary (Shapefile/MVT Protobuf) and DSL (WKT/TilePyramid) engines under src/utils/importers/.",
      "Enforced strict parameter limits across all analyzers, refactoring STRIDE threat model findings to options objects.",
      "Extracted reusable ProjectDialog primitive from Saved.jsx to ensure single-responsibility and maintainable UI components.",
      "Achieved 100% pass across all unit, syntax, audit, and quality suites (npm run test:unit, npm test, audit:quality).",
    ],
    commits: [
      { hash: "584aa31", message: "feat(quality): modularize theme variables, geospatial engines, and export options" },
    ],
  },
  {
    version: "1.1.0",
    date: "2026-10-17",
    type: "minor",
    title: "Content-Aware Canvas Framing & Gesture Performance Optimization",
    highlights: [
      "Engineered content-aware framing that calculates bounding boxes directly from drawn SVG nodes rather than raw viewBox attributes.",
      "Decoupled pan and pinch-to-zoom gestures from the React render path using imperative transforms for fluid 60fps interaction.",
      "Added audit:quality, audit:framing, and audit:canvas automated test harnesses to the CI quality gate.",
      "Removed over 4,200 lines of obsolete, unreferenced legacy files (main.js, landing.js, visitor-analytics.js, wasm-benchmark-modal.js, useMermaid.js).",
      "Restructured Studio inspector into sleek collapsible groups with a sticky action dock.",
    ],
    commits: [
      { hash: "9ebdab4", message: "feat(canvas): frame diagrams on drawn content, fix gesture rendering, add quality gates" },
      { hash: "af6f57c", message: "chore(refactor): remove dead unreferenced legacy files" },
    ],
  },
  {
    version: "1.0.0",
    date: "2026-10-16",
    type: "major",
    title: "Enterprise Architecture Studio Release",
    highlights: [
      "Architecture Review Board (ARB) Well-Architected Auditor evaluating systems against 6 enterprise pillars (Security, Resilience, Ops, Perf, Cost, Governance).",
      "Architecture Decision Records (ADR) suite implementing Markdown ADR (MADR) format with node-level linking and export.",
      "Infrastructure-as-Code (IaC) synthesizer generating production Terraform (main.tf) and Docker Compose configurations from visual topologies.",
      "Executive Storyboard presentation theater with camera framing, presenter notes, SLA badges, and auto-play walkthroughs.",
      "Visual Architecture Diff & PR Review tool tracking visual node and connection mutations with Markdown table generation for Pull Requests.",
      "FinOps Cloud Cost Sizing HUD providing deterministic, offline monthly cost estimation across AWS, GCP, and Azure.",
      "Spotify Backstage living catalog exporter generating typed catalog-info.yaml specifications.",
    ],
    commits: [
      { hash: "101e95e", message: "feat(enterprise): add enterprise suite menu to studio top nav and complete canvas toolbar actions" },
      { hash: "226d847", message: "feat(enterprise): add executive storyboard walkthrough, IaC synthesizer, and ARB well-architected auditor" },
      { hash: "cfac347", message: "feat(enterprise): implement ADR suite, multi-perspective lenses, visual diff PR tool, FinOps cost HUD, and Backstage catalog generator" },
    ],
  },
  {
    version: "0.9.0",
    date: "2026-10-16",
    type: "minor",
    title: "Mobile Canva-Style UX & C4 Deep Drill-Down",
    highlights: [
      "Canva-style mobile canvas layout with touch-optimized bottom sheets, accessory bar, and responsive touch gestures.",
      "Hierarchical C4 diagram drill-down linking parent system context nodes to granular container and component diagrams.",
      "Interactive data flow simulator with glowing photon pulses along directed network connections.",
      "Cloud & architecture stencil palette drawer for rapid cloud topology diagramming.",
    ],
    commits: [
      { hash: "90182c7", message: "feat(mobile): implement Canva-style mobile canvas preview/edit modes, bottom node sheet, and editor accessory bar" },
      { hash: "fc88831", message: "feat(studio): add C4 hierarchical drill-down, live flow simulation debugger, cloud stencils drawer, and architecture metrics" },
    ],
  },
  {
    version: "0.8.0",
    date: "2026-10-16",
    type: "minor",
    title: "Universal Geospatial Engine & Binary Spatial Format Support",
    highlights: [
      "Native parsing and diagram synthesis for GeoJSON FeatureCollections, TopoJSON shared arcs, and WKT geometries.",
      "Binary decoder for Mapbox Vector Tile Protobuf (.mvt, .pbf) and ESRI Shapefiles (.shp, .dbf).",
      "Geospatial carto palette and high-contrast stage background for spatial data pipelines.",
    ],
    commits: [
      { hash: "cb4070e", message: "feat(canvas): harden content focus, add geospatial carto theme, and support binary MVT & Shapefile" },
      { hash: "57ec915", message: "feat(geospatial): add WKT geometries, ESRI Shapefile schema, and Vector Tile pyramid parsing" },
    ],
  },
  {
    version: "0.7.0",
    date: "2026-10-16",
    type: "minor",
    title: "React 19 Modernization & Network Resilience",
    highlights: [
      "Modernized state architecture using React 19 primitives: useActionState, useOptimistic, useTransition, and useDeferredValue.",
      "Universal network retry policy with exponential backoff and jitter, strictly enforcing offline-first resilience.",
      "Automated STRIDE threat modeling analyzer identifying unauthenticated gateways, cleartext connections, and exposed data stores.",
    ],
    commits: [
      { hash: "e24533a", message: "feat(react19): integrate useActionState, useOptimistic, and smooth canvas zoom" },
      { hash: "f753ede", message: "feat(resilience): implement universal network retry policy with exponential backoff & jitter" },
      { hash: "f64acce", message: "feat(enterprise): add STRIDE threat modeling analyzer" },
    ],
  },
  {
    version: "0.6.0",
    date: "2026-10-15",
    type: "minor",
    title: "14-Family Visual Modeling & Direct Canvas Editing",
    highlights: [
      "Interactive visual modeling across all 14 diagram families: Flowchart, Sequence, Class, State, ER, Mindmap, GitGraph, Pie, Journey, Kanban, Gantt, Quadrant, Timeline, and Sankey.",
      "Marquee lasso selection, dynamic node toolbar with shape and color selectors, and drag-to-connect handles.",
      "Radar minimap with interactive camera frustum tracking and viewport pan synchronization.",
      "Curated Palette Themes: Added Nord, Tokyo Night, Cyberpunk, and Catppuccin color palettes with ambient canvas lighting.",
    ],
    commits: [
      { hash: "7eb69c7", message: "feat(studio): add drag-to-connect handles, quick-search, export studio modal, batch operations, and radar frustum" },
      { hash: "9bf7775", message: "feat(themes): add Nord, Tokyo Night, Cyberpunk, and Catppuccin color palettes" },
      { hash: "55a33a4", message: "feat(canvas): interactive node selection ring, inline editing, floating toolbar" },
    ],
  },
  {
    version: "0.5.0",
    date: "2026-10-15",
    type: "minor",
    title: "Multi-Format Universal Converter Hub",
    highlights: [
      "Bi-directional import and export across 30+ diagram formats: PlantUML, Graphviz DOT, D2, SQL DDL, XMind, StarUML, Draw.io, Excalidraw, Figma, Miro, and Adobe Illustrator.",
      "Client-side vector and print exports: lossless SVG with roundtrip source metadata, 4× UHD PNG, PDF, and PPTX slide decks.",
      "Local-first privacy with IndexedDB encrypted persistent storage and zero telemetry.",
    ],
    commits: [
      { hash: "b1bc34d", message: "feat: add illustration and vector formats for Adobe Illustrator, Figma, OmniGraffle, and Miro" },
      { hash: "86e5e13", message: "feat: enterprise-grade canvas preview, harmonic vibrant palettes, and studio export engine" },
      { hash: "49b3ad8", message: "feat(universal): expand format engine to 30+ formats, reverse hub, and syntax fixer" },
    ],
  },
  {
    version: "0.4.0",
    date: "2026-09-28",
    type: "minor",
    title: "AI Synthesis & Enterprise Visual Design System",
    highlights: [
      "AI syntax error fixer, describe-to-diagram converter, codebase-to-UML generator, and UI screenshot gallery.",
      "Real-time online visitor presence and studio usage analytics dashboard.",
      "Global peer-to-peer presence mesh and live GeoIP location telemetry.",
      "Enterprise Visual System: obsidian glassmorphism, glowing micro-interactions, refined typography, and desktop menu bar.",
    ],
    commits: [
      { hash: "9d05072", message: "feat: add AI syntax error fixer, describe-to-diagram, codebase-to-UML and UI screenshot gallery" },
      { hash: "f9d1b59", message: "feat: connect real global P2P presence mesh and live GeoIP location telemetry" },
      { hash: "fe3611c", message: "style: elevate UI design system with obsidian glassmorphism, glowing micro-interactions, and refined typography" },
    ],
  },
  {
    version: "0.3.0",
    date: "2026-09-27",
    type: "minor",
    title: "Universal Importers Suite & WebAssembly Acceleration",
    highlights: [
      "Universal Importer: Added XMind read/write, PlantUML, Outline, CSV, Graphviz DOT, D2 Lang, and SQL DDL to ER converters.",
      "Extended format support for GraphQL, BPMN 2.0, C4 DSL, Terraform HCL, AsyncAPI, FreeMind (.mm), and OPML (.opml).",
      "WebAssembly acceleration suite: Graphviz Wasm C engine, inline fast kernel, hardware detection, and interactive benchmark suite.",
      "Rebranded to NodeFlow with SEO landing page and competitive expensive diagram matrix.",
    ],
    commits: [
      { hash: "f363f96", message: "feat(importers): add Universal Importer with XMind read/write, PlantUML, Outline, and CSV converters" },
      { hash: "d178e73", message: "feat(importers): add GraphQL, BPMN 2.0, C4 DSL, Terraform HCL, and AsyncAPI support" },
      { hash: "dd2c036", message: "feat(wasm): add WebAssembly acceleration suite (Graphviz Wasm C engine, inline fast kernel)" },
      { hash: "ec8b377", message: "feat(branding): rebrand to NodeFlow and add comprehensive expensive diagram format comparison" },
    ],
  },
  {
    version: "0.2.0",
    date: "2026-09-26",
    type: "minor",
    title: "Interactive Inspector, In-Browser AI & Pro Export Studio",
    highlights: [
      "Interactive node inspector, version snapshots, template filtering, and profile popover.",
      "Integrated in-browser Qwen2.5-Coder model via WebAssembly / WebGPU.",
      "Full Tailwind CSS v4 support with shadcn design tokens and CVA components.",
      "Pro Export Studio with vector PDF, standalone interactive HTML, presentation mode, and embed generator.",
    ],
    commits: [
      { hash: "ad09e51", message: "feat: complete interactive functionality with node inspector, version snapshots, template filtering" },
      { hash: "2b0c5d6", message: "feat(ai): integrate real in-browser Qwen2.5-Coder model via WebAssembly / WebGPU" },
      { hash: "ab50b1f", message: "feat(design-system): full Tailwind CSS v4 support with shadcn tokens and CVA components" },
      { hash: "ce91e88", message: "feat(export): add Pro Export Studio, vector PDF, standalone interactive HTML, presentation mode" },
    ],
  },
  {
    version: "0.1.0",
    date: "2026-09-24",
    type: "minor",
    title: "Platform Foundation & Interactive Mermaid Studio",
    highlights: [
      "Initial Vite + React studio architecture with live Mermaid preview and SVG export.",
      "Automated CI static build verification and regression test pipelines.",
      "Interactive studio layout matching modern diagramming editors.",
    ],
    commits: [
      { hash: "455c266", message: "chore: initialize repository and workspace foundation" },
      { hash: "2fbbc07", message: "fix(ci): build static site before running dist verification tests" },
      { hash: "a857bf8", message: "feat(ui): redesign studio to match Mermaid AI / Mermaid Chart editor" },
    ],
  },
];

export const UPCOMING_ROADMAP = [
  {
    version: "1.4.0",
    targetDate: "Q4 2026",
    title: "WebGPU Local LLM & Interactive Canvas Edge Routing",
    goals: [
      "In-browser WebGPU deterministic LLM execution for air-gapped AI diagram generation with zero cloud calls.",
      "Canvas edge re-routing handles with smart orthogonal avoidance around existing nodes.",
      "Peer-to-peer real-time collaborative editing via WebRTC CRDTs with zero centralized server data retention.",
    ],
  },
  {
    version: "2.0.0",
    targetDate: "Q1 2027",
    title: "Full AST Bi-directional Engine & Live Cloud Sync",
    goals: [
      "Complete Abstract Syntax Tree (AST) parser replacing regex-based string manipulation for lossless diagram round-tripping.",
      "Direct live infrastructure importing from AWS CloudFormation, GCP Terraform states, and Azure Resource Manager.",
      "Automated compliance policy drift detection comparing visual architecture against live cloud resources.",
    ],
  },
];
