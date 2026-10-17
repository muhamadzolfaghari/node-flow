// Engineering & Data templates (part 1 of 3).
// Combined registry and lookup live in src/components/templates.js.
export const TEMPLATES = [
  {
    id: "er-diagram",
    title: "Entity Relationship Schema (Data Model)",
    category: "Engineering & Data",
    kind: "er",
    description: "Relational database schema with Crow’s Foot cardinality notation, primary keys, and foreign keys.",
    code: `erDiagram
    ORGANIZATION ||--o{ USER : contains
    ORGANIZATION ||--o{ PROJECT : owns
    USER ||--o{ PROJECT_MEMBER : participates
    PROJECT ||--o{ PROJECT_MEMBER : assigns
    PROJECT ||--o{ DIAGRAM : stores
    DIAGRAM ||--o{ DIAGRAM_VERSION : tracks
    USER ||--o{ AUDIT_LOG : triggers

    ORGANIZATION {
        uuid id PK
        string name
        string plan_tier
        timestamp created_at
    }

    USER {
        uuid id PK
        string email
        string full_name
        string role
        boolean is_active
    }

    PROJECT {
        uuid id PK
        uuid organization_id FK
        string title
        string visibility
        timestamp updated_at
    }

    DIAGRAM {
        uuid id PK
        uuid project_id FK
        string name
        string format
        text current_source
        string checksum_hash
    }

    DIAGRAM_VERSION {
        uuid id PK
        uuid diagram_id FK
        integer version_number
        text source_snapshot
        string author_id
        timestamp snapshot_at
    }
`,
  },
  {
    id: "git-graph",
    title: "Git Trunk-Based Release & Hotfix Flow",
    category: "Engineering & Data",
    kind: "gitGraph",
    description: "Trunk-based source control branching strategy with PR merges, release tags, and hotfixes.",
    code: `gitGraph
    commit id: "Initial Architecture"
    commit id: "Core Engine Setup"
    branch feature/wasm-turbo
    checkout feature/wasm-turbo
    commit id: "Fast FNV-1a Wasm Kernel"
    commit id: "Graphviz C Engine Binding"
    checkout main
    merge feature/wasm-turbo id: "PR #1: WebAssembly Turbo" tag: "v0.9.0"
    branch feature/14-uml-templates
    checkout feature/14-uml-templates
    commit id: "Add Full UML Specification"
    commit id: "Product & Architecture Templates"
    checkout main
    merge feature/14-uml-templates id: "PR #2: 30 Universal Templates" tag: "v1.0.0"
    branch hotfix/safari-canvas-retina
    checkout hotfix/safari-canvas-retina
    commit id: "Fix High-DPI Canvas Scaling"
    checkout main
    merge hotfix/safari-canvas-retina id: "PR #3: Hotfix Safari Scale" tag: "v1.0.1"
`,
  },
  {
    id: "sla-performance-metrics",
    title: "API Latency Percentiles & SLA Uptime (XY Chart)",
    category: "Engineering & Data",
    kind: "xychart",
    description: "Performance benchmark comparison comparing DiagramAtlas WebAssembly response times against legacy tools.",
    code: `xychart-beta
    title "p99 Execution Latency vs Concurrent Query Load"
    x-axis ["100 req/s", "500 req/s", "1,000 req/s", "5,000 req/s", "10,000 req/s"]
    y-axis "Latency (milliseconds)" 0 --> 250
    bar [12, 18, 26, 45, 68]
    line [110, 145, 185, 230, 290]
`,
  },
];
