// Product & Design templates (part 2 of 3).
// Combined registry and lookup live in src/components/templates.js.
export const TEMPLATES = [
  {
    id: "ishikawa-root-cause",
    title: "Ishikawa Root-Cause Diagram (Fishbone)",
    category: "Product & Design",
    kind: "flowchart",
    description: "Quality engineering root-cause analysis across Method, Machine, Material, and People.",
    code: `flowchart LR
    subgraph ProblemBox [Core Problem Statement]
        Defect["High API Latency & Payload Bloat\\n(p99 > 2,500ms / 50KB JSON)"]
    end

    subgraph CausesSpine [6M Root Cause Dimensions]
        direction TB
        subgraph Machine [Infrastructure & Hardware]
            M1[CPU Throttling on Shared Pods]
            M2[Unpooled Database Connections]
        end
        subgraph Method [Architecture & Protocol]
            M3[Missing Tier-0 In-Memory Cache]
            M4[Verbose Text JSON Protocol]
        end
        subgraph Material [Payloads & Inference]
            M5[Uncompressed 50KB Payloads]
            M6[LLM Preamble & Polite Filler]
        end
    end

    Machine --> Defect
    Method --> Defect
    Material --> Defect
`,
  },
  {
    id: "product-roadmap-timeline",
    title: "Multi-Quarter Product Roadmap — Timeline",
    category: "Product & Design",
    kind: "timeline",
    description: "Quarterly product roadmap with strategic milestones, platform expansions, and release targets.",
    code: `timeline
    title 2026-2027 Engineering & Product Roadmap
    2026 Q1 : Foundation Release : Dual Mermaid & Wasm Engine : 15 Universal Importers : 30 Templates
    2026 Q2 : Enterprise Intelligence : Local Qwen LLM Copilot : Sub-millisecond Fast Cache : Live Radar
    2026 Q3 : Native Desktop App : Electron & Tauri Offline Builds : Zero-Cloud Enterprise Deployment
    2026 Q4 : Plugin Ecosystem : Custom Wasm Layout Algorithms : Visual Extensions Marketplace
`,
  },
];
