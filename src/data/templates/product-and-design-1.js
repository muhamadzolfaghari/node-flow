// Product & Design templates (part 1 of 3).
// Combined registry and lookup live in src/components/templates.js.
export const TEMPLATES = [
  {
    id: "user-journey-onboarding",
    title: "User Journey Map — Product Experience",
    category: "Product & Design",
    kind: "journey",
    description: "Customer experience stages, touchpoints, emotional scores (1-5), and cross-functional team actions.",
    code: `journey
    title User Onboarding & Visual Studio Discovery Journey
    section Discovery & Landing
      Visit DiagramAtlas GitHub Repo: 5: Developer, Product Manager
      Read Interactive Pricing Matrix: 5: Product Manager
      Launch Studio in Web Browser: 5: Developer, Product Manager
    section Canvas & Editing
      Browse 30+ Diagram Templates: 5: Product Manager
      Type Code with Real-Time Debounce: 5: Developer
      Pan & Inertia Zoom on Infinite Canvas: 5: Product Manager
    section WebAssembly & Performance
      Click WASM Hardware Badge: 5: Developer
      Run Live Benchmark (3x-5x Speedup): 5: Developer
    section Export & Handoff
      Export 4K Retina PNG: 5: Product Manager
      Download Standalone Interactive HTML: 5: Developer
      Embed SVG in Documentation: 5: Developer
`,
  },
  {
    id: "kanban-sprint-board",
    title: "Agile Kanban Board — Sprint Planning",
    category: "Product & Design",
    kind: "kanban",
    description: "Agile sprint workflow columns with user story estimation badges and priority tags.",
    code: `kanban
  Backlog
    [User Persona Journey Generator - 5 pts]
    [Export to Lucidchart XML - 8 pts]
    [WebAssembly SIMD Vectorizer - 5 pts]
  In Progress
    [BPMN 2.0 Business Flow Importer - 5 pts]
    [Sub-millisecond Rust Cache Engine - 3 pts]
    [Interactive Node Inspector HUD - 3 pts]
  Code Review
    [Native Graphviz WebAssembly Engine - 8 pts]
    [Dual Deployment GitHub Actions - 2 pts]
  Done
    [Rebrand Studio to DiagramAtlas]
    [Complete 14 UML Diagrams Support]
    [Multi-Format Import & Export Matrix]
`,
  },
  {
    id: "prioritization-quadrant",
    title: "Feature Prioritization Matrix (Value vs Effort)",
    category: "Product & Design",
    kind: "quadrantChart",
    description: "Eisenhower and product management quadrant chart for strategic feature roadmapping.",
    code: `quadrantChart
    title Feature Prioritization Matrix (Value vs Effort)
    x-axis Low Engineering Effort --> High Engineering Effort
    y-axis Low Customer Value --> High Customer Value
    quadrant-1 Quick Wins
    quadrant-2 Major Strategic Bets
    quadrant-3 Fill-ins
    quadrant-4 Low Priority Deprecations
    WebAssembly Fast Hashing: [0.22, 0.85]
    14 UML Specification Templates: [0.30, 0.92]
    XMind Bi-directional Importer: [0.38, 0.88]
    Export to Multi-Format ZIP Archive: [0.25, 0.72]
    Real-Time Multi-User Collaboration: [0.88, 0.85]
    Native Desktop Tauri App: [0.75, 0.78]
    Custom Canvas Shader Effects: [0.70, 0.32]
    Dark Theme Palette Refinement: [0.15, 0.62]
`,
  },
  {
    id: "delivery-gantt",
    title: "Gantt Delivery Sequence — Product Roadmap",
    category: "Product & Design",
    kind: "gantt",
    description: "Cross-functional delivery schedule with workstreams, critical paths, and milestone QA gates.",
    code: `---
config:
  gantt:
    useWidth: 2200
    barHeight: 28
    barGap: 10
    topPadding: 60
    leftPadding: 200
    gridLineStartPadding: 45
  theme: dark
---
gantt
    title DiagramAtlas Enterprise Release Roadmap
    dateFormat YYYY-MM-DD
    axisFormat %d %b

    section Architecture & Wasm
    Design System & Tailwind v4 Tokens    :done, a1, 2026-09-01, 7d
    WebAssembly Turbo Kernel & Fast Hash  :done, a2, after a1, 10d
    Native Graphviz Wasm C Engine         :active, a3, after a2, 8d

    section Format Interop
    XMind ZEN & Draw.io Importers         :done, f1, 2026-09-12, 6d
    PlantUML, D2, SQL DDL Transpilers     :done, f2, after f1, 5d
    BPMN 2.0 & OpenAPI 3.1 Specs          :active, f3, after f2, 6d

    section Verification & Release
    End-to-End Test Suite (55 Checks)     :crit, v1, after a3, 4d
    GitHub Pages Automated Deploy         :crit, v2, after v1, 2d
    Enterprise GA v1.0 Launch             :milestone, m1, after v2, 0d
`,
  },
  {
    id: "mindmap-diagram",
    title: "Mindmap — Product Strategy & Architecture",
    category: "Product & Design",
    kind: "mindmap",
    description: "Hierarchical brainstorming mindmap of product capabilities, performance pillars, and formats.",
    code: `mindmap
  root((DiagramAtlas Studio))
    Wasm Acceleration
      Sub-millisecond FNV-1a Hashing
      Linear Memory Compositor
      Native Graphviz C Engine
      Zero-Cloud Offline Execution
    Universal Formats
      Full 14 UML Diagrams
      XMind ZEN & FreeMind
      Draw.io XML & Visio
      PlantUML & D2 Architecture
      SQL DDL & OpenAPI
    Visual Canvas Engine
      Kinetic Drag & Inertia
      Cursor-centered Zoom
      Interactive Minimap Radar
      Presentation & Laser Mode
    Enterprise Exporters
      Retina 4K / 8K PNG
      Crisp Scalable Vector SVG
      Vector PDF Document
      Standalone Interactive HTML
`,
  },
  {
    id: "sankey-funnel",
    title: "Conversion Funnel — User Acquisition (Sankey)",
    category: "Product & Design",
    kind: "sankey",
    description: "Sankey flow diagram tracking user acquisition, studio engagement, and export conversions.",
    code: `sankey-beta
    GitHub Repository,Landing Page Showcase,8500
    Google Organic Search,Landing Page Showcase,4200
    Developer Community,Landing Page Showcase,2300
    Landing Page Showcase,Interactive Studio Launch,12400
    Landing Page Showcase,Read Documentation,1800
    Landing Page Showcase,Dropoff,800
    Interactive Studio Launch,Create New Diagram,7800
    Interactive Studio Launch,Explore 30+ Templates,3600
    Interactive Studio Launch,Import Existing XMind / Drawio,1000
    Create New Diagram,Export High-Res PNG,5200
    Create New Diagram,Export Vector SVG,2100
    Create New Diagram,Export PDF Pro,500
`,
  },
];
