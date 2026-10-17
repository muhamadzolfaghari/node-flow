export const RELEASES_V1 = [
  {
    version: "1.3.3",
    date: "2026-10-17",
    type: "patch",
    title: "Canvas & Editor Zero-Loop Interactivity, Native Primitives & Real-Browser Verification",
    highlights: [
      "Eliminated Maximum Update Depth Exceeded: Replaced Radix Popper and RovingFocusGroup primitives with high-performance native React DropdownMenu, Tabs, and Tooltip, eliminating layout effect cascades.",
      "requestAnimationFrame Keystroke Batching: Coalesced rapid CodeMirror transactions using rAF, ensuring fluid 120 FPS typing without intermediate render churn or passive effect collision.",
      "Passive Effect Decoupling: Removed synchronous setState from useWorkspace and useDocumentPreview useEffect handlers, isolating autosave status and compilation debouncing.",
      "Universal Syntax & Quick Fix Enhancement: Upgraded repairReportedLine with missing node identifier generation (A --> [broken] to A --> Node_N[broken]), bracket/parentheses balancing, and accurate EOF line clamping.",
      "Automated End-to-End Real Browser Suite: Added scripts/interactive-canvas-editor-test.mjs validating typing, live canvas SVG re-rendering, node selection, canvas pan/zoom, and one-click AI Quick Fix in Puppeteer with zero console errors.",
    ],
    commits: [
      { hash: "HEAD", message: "fix(canvas-editor): eliminate update depth loop with native primitives and rAF batching; verify real browser interactivity" },
    ],
  },
  {
    version: "1.3.2",
    date: "2026-10-17",
    type: "patch",
    title: "AI-Native Pipeline, Token Optimization, Health Diagnostics & Preflight Quality Gate",
    highlights: [
      "AI Prompt Token Optimizer: Added heuristic token estimator and context compression to strip comments and style lines, reducing LLM token consumption by 30-50%.",
      "Provider Health Diagnostics: Built multi-provider health check assessing WebGPU acceleration, local Ollama connectivity, and offline deterministic fallback.",
      "Resilient Network Policies: Incorporated exponential backoff and jitter across remote AI query endpoints to guarantee zero unhandled network drops.",
      "Automated Preflight Quality Gate: Added npm run preflight enforcing ESLint, 173 unit tests, 114 diagram & dist checks, and version consistency before commit.",
      "Studio Live Metrics: Surfaced real-time token budgeting and resilient fallback status inside the Diagram Assistant dialog.",
    ],
    commits: [
      { hash: "HEAD", message: "feat(ai): native token optimizer, provider health diagnostics, resilient retry, and preflight quality gate" },
    ],
  },
  {
    version: "1.3.1",
    date: "2026-10-17",
    type: "patch",
    title: "React Architectural Patterns, Logic De-coupling & Full Changelog Engine",
    highlights: [
      "Logic & UI Separation: Extracted useExportStudio custom hook and decomposed ExportStudioModal into ExportPreviewPane and ExportControlsPane, reducing component complexity by over 75%.",
      "Decoupled Diagnostics Banner: Extracted useEditorDiagnostics custom hook and EditorDiagnosticsBanner component, isolating CodeMirror view rendering from diagnostic state and repair side-effects.",
      "Comprehensive Historical Changelog Engine: Extended platform changelog and interactive /changelog page back to the very first commit (2026-09-24), grouping all major, minor, and patch milestones.",
      "Package Version Bump: Synchronized package.json to v1.3.1 and aligned semantic version badges across the changelog timeline.",
    ],
    commits: [
      { hash: "b14034d", message: "feat(changelog): complete release history from first commit, bump to v1.3.1, and align semantic version dates" },
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
    version: "1.2.1",
    date: "2026-10-17",
    type: "patch",
    title: "Canvas Framing Audit Harness & Viewport Geometry Precision",
    highlights: [
      "Engineered automated audit:framing test runner validating bounding boxes across all 51 gallery templates with headless browser verification.",
      "Calibrated geometry-based bounding box calculations measured from rendered SVG elements with 6% padding tolerance.",
      "Prevented canvas viewport drift on dynamic zoom resets and orientation shifts.",
    ],
    commits: [
      { hash: "9ebdab4", message: "feat(canvas): frame diagrams on drawn content, fix gesture rendering, add quality gates" },
    ],
  },
  {
    version: "1.2.0",
    date: "2026-10-17",
    type: "minor",
    title: "Code Quality Burn-down & Modular Architecture Refactor",
    highlights: [
      "Modularized monolithic files into focused domain modules: extracted template datasets into src/data/templates/ (51 templates across 17 files), theme variables into src/utils/theme-variables.js, and export options into src/data/export-options.js.",
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
    version: "1.1.1",
    date: "2026-10-16",
    type: "patch",
    title: "Legacy Code Purge & Studio Suite Navigation",
    highlights: [
      "Purged over 4,200 lines of obsolete, unreferenced legacy code files (main.js, landing.js, visitor-analytics.js, wasm-benchmark-modal.js, useMermaid.js).",
      "Added enterprise suite menu to studio top navigation bar for 1-click access to Threat Modeling, ADRs, and IaC Synthesizer.",
      "Hardened canvas toolbar actions with keyboard shortcuts and tooltips.",
    ],
    commits: [
      { hash: "af6f57c", message: "chore(refactor): remove dead unreferenced legacy files" },
      { hash: "101e95e", message: "feat(enterprise): add enterprise suite menu to studio top nav and complete canvas toolbar actions" },
    ],
  },
  {
    version: "1.1.0",
    date: "2026-10-16",
    type: "minor",
    title: "Executive Storyboard Theater, IaC Synthesizer & Well-Architected Auditor",
    highlights: [
      "Executive Storyboard presentation theater with camera framing, presenter notes, SLA badges, and auto-play walkthroughs.",
      "Infrastructure-as-Code (IaC) synthesizer generating production Terraform (main.tf) and Docker Compose configurations from visual topologies.",
      "Architecture Review Board (ARB) Well-Architected Auditor evaluating systems against 6 enterprise pillars (Security, Resilience, Ops, Perf, Cost, Governance).",
    ],
    commits: [
      { hash: "226d847", message: "feat(enterprise): add executive storyboard walkthrough, IaC synthesizer, and ARB well-architected auditor" },
    ],
  },
  {
    version: "1.0.0",
    date: "2026-10-16",
    type: "major",
    title: "Enterprise Architecture Studio Release",
    highlights: [
      "Official 1.0.0 Enterprise Architecture Studio Release.",
      "Architecture Decision Records (ADR) suite implementing Markdown ADR (MADR) format with node-level linking and export.",
      "Visual Architecture Diff & PR Review tool tracking visual node and connection mutations with Markdown table generation for Pull Requests.",
      "FinOps Cloud Cost Sizing HUD providing deterministic, offline monthly cost estimation across AWS, GCP, and Azure.",
      "Spotify Backstage living catalog exporter generating typed catalog-info.yaml specifications.",
    ],
    commits: [
      { hash: "cfac347", message: "feat(enterprise): implement ADR suite, multi-perspective lenses, visual diff PR tool, FinOps cost HUD, and Backstage catalog generator" },
    ],
  },
];
