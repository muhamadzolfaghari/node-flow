import {
  Network,
  Database,
  Code2,
  Files,
  GitBranch,
  Layers,
  Shield,
  Sparkles,
  Palette,
  MousePointerClick,
  Download,
  FileInput,
  Activity,
  Cloud,
} from "lucide-react";

export const DEMOS = [
  {
    id: "architecture",
    title: "Architecture",
    file: "architecture.mmd",
    format: "mermaid",
    template: "service-architecture",
    source:
      "flowchart LR\n  Web[Web client] --> API[API gateway]\n  API --> Orders[Order service]\n  Orders --> DB[(Database)]\n  Orders --> Queue[Event queue]",
  },
  {
    id: "data",
    title: "Database",
    file: "schema.sql",
    format: "sql",
    template: "er-diagram",
    source:
      "CREATE TABLE users (\n  id INTEGER PRIMARY KEY,\n  name VARCHAR(100)\n);\nCREATE TABLE orders (\n  id INTEGER PRIMARY KEY,\n  user_id INTEGER REFERENCES users(id)\n);",
  },
  {
    id: "uml",
    title: "UML sequence",
    file: "checkout.mmd",
    format: "mermaid",
    template: "sequence-auth",
    source:
      "sequenceDiagram\n  participant Client\n  participant API\n  participant Orders\n  Client->>API: Create order\n  API->>Orders: Validate inventory\n  Orders-->>API: Confirmed\n  API-->>Client: Order created",
  },
];

export const QUICK_STARTS = [
  { icon: Network, label: "UML & Architecture", detail: "Structure, behavior, interactions", link: "/templates?category=UML%20Specification" },
  { icon: Database, label: "Entity Relationships", detail: "Tables, keys, and data models", link: "/templates?category=Engineering%20%26%20Data" },
  { icon: Layers, label: "Charts & Planning", detail: "Gantt, timelines, and data charts", link: "/templates?category=Product%20%26%20Design" },
  { icon: GitBranch, label: "Flows & Mindmaps", detail: "Processes and connected ideas", link: "/templates?q=mindmap" },
];

export const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Architecture Engine & ADRs",
    description: "Automated topology classification, coupling & bottleneck analysis, single point of failure (SPOF) detection, and Markdown tech specs.",
  },
  {
    icon: Code2,
    title: "High-speed editor & live linting",
    description: "160ms debounced linter with column squiggles, AI quick-fix hover actions, line jumps, and contextual arrow autocompletion.",
  },
  {
    icon: MousePointerClick,
    title: "Direct visual canvas modeling",
    description: "Marquee lasso selection, interactive drag-to-connect ports, dynamic node toolbar, radar minimap, and multi-node batch styling.",
  },
  {
    icon: Shield,
    title: "STRIDE Threat Modeling & Audit",
    description: "Automated architecture security audits detecting trust boundaries, cleartext channels, and exposed databases for SOC2 / ISO 27001.",
  },
  {
    icon: Activity,
    title: "Interactive Flow Simulation",
    description: "Trace request packets and glowing photon pulses along directed connections to visually debug microservice lifecycles.",
  },
  {
    icon: Files,
    title: "Multi-role workspace suite",
    description: "Tailored starter kits and workflows for Product Managers, QA & Test Engineers, Developers, Operations SOP, and Academics.",
  },
  {
    icon: Palette,
    title: "8 Curated designer themes",
    description: "Studio Dark Neon, Light Paper, Nord Arctic, Tokyo Night Indigo, Cyberpunk Gold, Catppuccin Mocha, and Forest Pine.",
  },
  {
    icon: Download,
    title: "Lossless vector & portable exports",
    description: "Export SVG with embedded roundtrip source metadata, 4× UHD PNG, print-ready PDF, PPTX slides, standalone HTML, and .atlas backups.",
  },
  {
    icon: Cloud,
    title: "100% Client-Side Privacy & AI",
    description: "Zero telemetry, browser-local IndexedDB storage, WebGPU local LLMs, and air-gapped deterministic generation.",
  },
];

export const STEPS = [
  { icon: FileInput, title: "Start", description: "Pick a template, import a file, describe it to the assistant, or write source." },
  { icon: MousePointerClick, title: "Refine", description: "Edit the source and the canvas side by side. Errors are marked as you type." },
  { icon: Download, title: "Ship", description: "Export for docs and decks, or keep the project and its checkpoints in your browser." },
];
