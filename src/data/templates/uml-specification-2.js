// UML Specification templates (part 2 of 3).
// Combined registry and lookup live in src/components/templates.js.
export const TEMPLATES = [
  {
    id: "uml-deployment",
    title: "7. Deployment Diagram (UML Structure)",
    category: "UML Specification",
    kind: "flowchart",
    description: "Hardware nodes, execution environments, artifact packages, communication protocols, and cloud topology.",
    code: `flowchart TB
    subgraph ClientDevice [Client Device: macOS / Linux / Windows]
        BrowserRuntime[<<execution environment>>\\nV8 / WebKit Runtime]
        SPAArtifact[<<artifact>>\\nDiagramAtlas WebAssembly SPA Bundle]
        BrowserRuntime --- SPAArtifact
    end

    subgraph AWSCloud [Cloud Infrastructure: AWS us-east-1]
        subgraph EdgeCluster [Edge Network: Cloudflare CDN]
            EdgeRouter[<<node>>\\nEdge TLS Termination & WAF]
        end

        subgraph K8sCluster [Kubernetes Production Cluster]
            IngressEnvoy[<<node>>\\nEnvoy Ingress Gateway]
            subgraph Pod1 [DiagramAtlas Pod: Replica 1]
                FastAPIServer[<<execution environment>>\\nFastAPI Python ASGI]
                WasmRustKernel[<<artifact>>\\nghostwire_core.so]
                FastAPIServer --- WasmRustKernel
            end
        end

        subgraph DataVPC [Isolated Data VPC: Private Subnet]
            PostgresNode[<<node>>\\nAmazon Aurora PostgreSQL Primary]
            RedisNode[<<node>>\\nAmazon ElastiCache Redis Cluster]
        end
    end

    SPAArtifact -->|"HTTPS / WSS (TLS 1.3)"| EdgeRouter
    EdgeRouter -->|"Internal Backplane"| IngressEnvoy
    IngressEnvoy -->|"Cluster IP"| FastAPIServer
    FastAPIServer -->|"TCP : 5432"| PostgresNode
    FastAPIServer -->|"TCP : 6379"| RedisNode
`,
  },
  {
    id: "uml-package",
    title: "8. Package Diagram (UML Structure)",
    category: "UML Specification",
    kind: "flowchart",
    description: "Namespace decomposition, layer modularization, import dependencies, and domain-driven design bounds.",
    code: `flowchart TD
    subgraph PresentationLayer [<<package>> Presentation Layer]
        Controllers[API Routing Controllers]
        Presenters[JSON & Protobuf Serializers]
        Middlewares[Auth & Rate Limit Middlewares]
    end

    subgraph ApplicationLayer [<<package>> Application Layer]
        UseCases[Application Use Cases]
        Commands["Command Handlers (CQRS)"]
        Queries[Query Handlers]
    end

    subgraph DomainLayer [<<package>> Core Domain Model]
        Entities[Domain Entities]
        ValueObjects[Immutable Value Objects]
        DomainEvents[Domain Event Subsystem]
        RepositoryInterfaces[Repository Interfaces]
    end

    subgraph InfrastructureLayer [<<package>> Infrastructure Layer]
        PostgresRepos[Postgres Repository Impls]
        RedisCacheAdapter[Redis Fast-Path Cache]
        ExternalAPIs[Third-Party Service Clients]
    end

    PresentationLayer -.->|imports| ApplicationLayer
    ApplicationLayer -.->|imports| DomainLayer
    InfrastructureLayer -.->|implements| DomainLayer
`,
  },
  {
    id: "uml-object",
    title: "9. Object Diagram (UML Structure)",
    category: "UML Specification",
    kind: "class",
    description: "Concrete runtime instance specifications, assigned state values, and instance link relationships.",
    code: `classDiagram
    class UserInstance_1042 {
        :User
        userId = 1042
        email = "lead.dev@enterprise.com"
        role = "OrganizationAdmin"
        isMfaVerified = true
    }

    class ProjectInstance_88 {
        :DiagramProject
        projectId = 88
        title = "Cloud Service Mesh Architecture"
        format = "nodeflow_native"
        activeVersion = "v2.4"
    }

    class WasmEngineInstance {
        :WasmTurboKernel
        memoryPages = 2
        simdActive = true
        hardwareHash = "0x30784cd7"
    }

    UserInstance_1042 "1" --> "1..*" ProjectInstance_88 : owns
    ProjectInstance_88 "1" --> "1" WasmEngineInstance : acceleratesWith
`,
  },
  {
    id: "uml-composite-structure",
    title: "10. Composite Structure Diagram (UML Structure)",
    category: "UML Specification",
    kind: "flowchart",
    description: "Internal decomposition of complex classifiers, ports, parts, and connector bindings.",
    code: `flowchart LR
    subgraph SmartVehicle [Smart Vehicle: Composite Classifier]
        PortGPS((p1: GPS Port))
        PortCAN((p2: CAN Bus Port))

        subgraph TelematicsControlUnit [Telematics Control Unit]
            CellularModem[4G / 5G Modem Part]
            SecurityCrypto[Hardware Security Module]
        end

        subgraph AutonomousDrivingSystem [Autonomous Driving Subsystem]
            SensorFusion[Sensor Fusion Engine]
            PathPlanner[Path Planning Neural Core]
            ActuatorInterface[Drive-by-Wire Interface]
        end

        subgraph PowerTrain [Electric Powertrain]
            BatteryMgmt[Battery Management System]
            Inverter[Dual AC Inverter]
            Motors[Front & Rear Traction Motors]
        end

        PortGPS --- CellularModem
        CellularModem --- SecurityCrypto
        SecurityCrypto -->|"Authenticated Telemetry"| SensorFusion
        PortCAN --- SensorFusion
        SensorFusion -->|"Fused Point Cloud"| PathPlanner
        PathPlanner -->|"Steering & Torque Vector"| ActuatorInterface
        ActuatorInterface --- Inverter
        Inverter --- Motors
        BatteryMgmt --- Inverter
    end
`,
  },
  {
    id: "uml-timing",
    title: "11. Timing Diagram (UML Interaction)",
    category: "UML Specification",
    kind: "timeline",
    description: "Hardware and software state transitions across discrete clock cycles and latency windows.",
    code: `timeline
    title Ultra-Low Latency Inference & Cache Timing (Sub-Millisecond Pipeline)
    0.00ms - 0.05ms : Client : Cryptographic BLAKE2b State Fingerprinting
    0.05ms - 0.10ms : Rust Wasm Kernel : Tier-0 Fast-Path Memory Cache Probe
    0.10ms - 0.85ms : Cache HIT (P50) : Return Pre-compiled Binary Protobuf Buffer
    0.85ms - 1.20ms : Network Wire : Zstandard Dictionary Decompression
    1.20ms - 2.50ms : Client Browser : Wasm Memory Injection & Instant Vector Display
`,
  },
  {
    id: "uml-communication",
    title: "12. Communication Diagram (UML Interaction)",
    category: "UML Specification",
    kind: "flowchart",
    description: "Collaboration diagram showing numbered inter-object messages and call dependencies.",
    code: `flowchart TD
    User([Actor: Checkout User])
    Controller["1.0: CheckoutController"]
    AuthGuard["1.1: AuthenticationGuard"]
    InventoryService["1.2: InventoryService"]
    PaymentGateway["1.3: PaymentGateway"]
    Notifier["1.4: NotificationService"]

    User -->|"1.0: submitOrder()"| Controller
    Controller -->|"1.1: verifySessionToken()"| AuthGuard
    Controller -->|"1.2: reserveStockItems()"| InventoryService
    Controller -->|"1.3: processTransaction()"| PaymentGateway
    Controller -->|"1.4: dispatchReceiptEmail()"| Notifier
`,
  },
];
