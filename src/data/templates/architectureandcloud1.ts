// Architecture & Cloud templates (part 1 of 2).
// Combined registry and lookup live in src/components/templates.js.
export const TEMPLATES = [
  {
    id: "c4-system-context",
    title: "C4 Model — System Context & Containers",
    category: "Architecture & Cloud",
    kind: "c4",
    description: "C4 model architecture showing users, core software systems, and external banking mainframe boundaries.",
    code: `C4Context
    title System Context Diagram — Internet Banking System
    Person(customer, "Personal Banking Customer", "A customer of the bank with personal bank accounts.")
    System(bankingSystem, "Internet Banking System", "Allows customers to view account balances, make payments, and analyze transactions.")
    System_Ext(mailSystem, "E-mail Subsystem", "Internal Microsoft Exchange system for customer notifications.")
    System_Ext(mainframe, "Core Mainframe Banking Tier", "Stores all customer core accounts, ledgers, and transactions.")

    Rel(customer, bankingSystem, "Views account balances & initiates transfers using", "HTTPS / TLS 1.3")
    Rel_Back(customer, mailSystem, "Receives transaction verification emails from")
    Rel(bankingSystem, mailSystem, "Sends notifications using", "SMTP")
    Rel(bankingSystem, mainframe, "Queries balances & executes transactions using", "gRPC / Protobuf")
`,
  },
  {
    id: "graphviz-k8s-mesh",
    title: "Kubernetes Cluster Topology (Native Graphviz Wasm)",
    category: "Architecture & Cloud",
    kind: "graphviz",
    description: "Cloud native service mesh and ingress clusters rendered directly using WebAssembly Graphviz C engine.",
    code: `digraph KubernetesMesh {
  rankdir=TB;
  bgcolor="transparent";
  fontname="Helvetica,Arial,sans-serif";
  node [fontname="Helvetica,Arial,sans-serif", shape=box, style="filled,rounded", fillcolor="#1e293b", fontcolor="#f8fafc", color="#38bdf8", penwidth=1.5];
  edge [fontname="Helvetica,Arial,sans-serif", color="#94a3b8", fontcolor="#cbd5e1"];

  subgraph cluster_ingress {
    label = "Edge Ingress Gateway";
    style = "filled,dashed";
    fillcolor = "#0f172a";
    fontcolor = "#38bdf8";
    color = "#0284c7";

    CloudFlare [label="Cloudflare CDN\\n(Edge TLS 1.3)", fillcolor="#334155", shape=ellipse];
    EnvoyProxy [label="Envoy Proxy / Traefik\\n(Layer 7 Router)", fillcolor="#0369a1"];
  }

  subgraph cluster_services {
    label = "Kubernetes Pod Mesh";
    style = "filled";
    fillcolor = "#0f172a";
    fontcolor = "#a855f7";
    color = "#7e22ce";

    AuthService [label="Auth Service\\n(OAuth 2.1 / Wasm Guard)", fillcolor="#4c1d95"];
    DiagramEngine [label="DiagramAtlas Kernel\\n(WebAssembly Runner)", fillcolor="#065f46", color="#10b981"];
    ExportWorker [label="Rasterizer Worker\\n(SIMD Compositor)", fillcolor="#1e3a8a", color="#60a5fa"];
  }

  subgraph cluster_data {
    label = "Distributed Storage Tier";
    style = "filled";
    fillcolor = "#0f172a";
    fontcolor = "#f59e0b";
    color = "#b45309";

    RedisCache [label="Redis Cluster\\n(In-Memory State)", shape=cylinder, fillcolor="#7c2d12"];
    PostgresDB [label="PostgreSQL Primary\\n(Vector & Metadata)", shape=cylinder, fillcolor="#1e3a8a"];
  }

  CloudFlare -> EnvoyProxy [label="HTTPS / HTTP3"];
  EnvoyProxy -> AuthService [label="gRPC Verify"];
  EnvoyProxy -> DiagramEngine [label="WebSocket / SSE"];
  DiagramEngine -> ExportWorker [label="Task Queue"];
  DiagramEngine -> RedisCache [label="Fast Hash Key"];
  AuthService -> PostgresDB [label="User Schema"];
  ExportWorker -> RedisCache [label="Cache Snapshot"];
}
`,
  },
  {
    id: "service-architecture",
    title: "Service Architecture & Dependency Graph",
    category: "Architecture & Cloud",
    kind: "flowchart",
    description: "Distributed microservice graph with shared core services, parallel domain pods, and telemetry monitoring.",
    code: `flowchart TD
    subgraph IngressLayer [Edge Ingress Tier]
        Cloudflare[Cloudflare Edge CDN]
        Traefik[Traefik v3 API Gateway]
    end

    subgraph CoreServices [Shared Core Services]
        AuthService[Auth & Token Service]
        TenantService[Tenant Organization Service]
        AuditService[Audit Log Collector]
    end

    subgraph ProductServices [Parallel Product Microservices]
        CanvasService[Canvas Collaborative Service]
        ExportService[High-DPI Rasterize Worker]
        SearchService[Elastic Search Vector Node]
    end

    subgraph DataTier [Storage & Persistence Tier]
        Postgres[(Postgres Cloud Primary)]
        RedisCache[(Redis In-Memory State)]
        S3Bucket[(S3 Vector Asset Storage)]
    end

    Cloudflare --> Traefik
    Traefik --> AuthService
    Traefik --> CanvasService
    Traefik --> ExportService

    CanvasService --> AuthService
    CanvasService --> TenantService
    CanvasService --> RedisCache
    CanvasService --> Postgres

    ExportService --> S3Bucket
    ExportService --> AuditService
    TenantService --> Postgres
`,
  },
  {
    id: "dependency-overview",
    title: "Milestone Dependency Progression",
    category: "Architecture & Cloud",
    kind: "flowchart",
    description: "High-level milestone progression from infrastructure baseline to project completion with QA gates.",
    code: `---
config:
  theme: dark
  flowchart:
    useMaxWidth: false
    curve: basis
    nodeSpacing: 45
    rankSpacing: 75
---
flowchart LR
    INFRA[Infrastructure baseline]
    SPLP[Shared PLP]
    SPDP[Shared PDP]
    PASS[Passenger shared]
    PLP[Parallel service PLPs]
    PDP[Parallel service PDPs]
    REVIEW[Parallel service Reviews]
    TRIPS[My Trips by service]
    DONE{{All services complete}}

    INFRA --> SPLP --> PLP
    INFRA --> SPDP --> PDP
    INFRA --> PASS
    PLP -->|QA Gate| PDP
    PDP -->|QA Gate| REVIEW
    PASS --> REVIEW
    REVIEW -->|QA Gate| TRIPS -->|QA Gate| DONE

    classDef infra fill:#202a35,stroke:#94a3b8,color:#fff,stroke-width:3px
    classDef shared fill:#2e2050,stroke:#8b5cf6,color:#fff,stroke-width:2px
    classDef service fill:#123448,stroke:#0ea5e9,color:#fff,stroke-width:2px
    classDef milestone fill:#111827,stroke:#f8fafc,color:#fff,stroke-width:2px
    class INFRA infra
    class SPLP,SPDP,PASS shared
    class PLP,PDP,REVIEW,TRIPS service
    class DONE milestone
`,
  },
  {
    id: "hardware-system-block",
    title: "Hardware System Block & Bus Architecture",
    category: "Architecture & Cloud",
    kind: "block",
    description: "High-speed system architecture with CPU, memory bus, neural accelerator, and DMA controllers.",
    code: `block-beta
    columns 4
    CPU["High-Performance CPU Core"]:2 RAM["LPDDR5 Unified Memory"]:2
    block:bus:4
        SystemBus["256-bit Ultra-High Speed Interconnect Bus"]
    end
    NPU["Neural Processing Accelerator"]:2 NVMe["PCIe 5.0 NVMe Storage"]:2

    CPU --> SystemBus
    RAM --> SystemBus
    NPU --> SystemBus
    NVMe --> SystemBus
`,
  },
];
