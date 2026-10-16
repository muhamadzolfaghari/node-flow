const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/Landing-BXm2z7gc.js","assets/vendor-react-DU96zfH8.js","assets/vendor-ui-Df4SqoBz.js","assets/ui-C1cUT9CP.js","assets/useDocumentPreview-ZqzticUH.js","assets/wasm-accelerator-nD7FZEZm.js","assets/card-EzTak5mG.js","assets/Studio-DfXo7aP0.js","assets/vendor-codemirror-DYIQkfHm.js","assets/exporter-C36sjFSC.js","assets/svg-metadata-DemCTHvq.js","assets/input-BgwyOuJV.js","assets/Templates-sn_QDrE2.js","assets/Saved--TDJ4IAD.js","assets/Compare-B4mevuQk.js","assets/NotFound-8zZCk6f5.js","assets/markdown-outline-Mv1rbcQq.js","assets/xmind-DRffFpmD.js","assets/jszip.min-LUl3-Zpl.js"])))=>i.map(i=>d[i]);
import{r as v,x as dt,j as n,S as Ge,X as Ue,c as mt,a3 as ut,i as pt,a4 as gt,a5 as ft,a6 as ht,a7 as bt,a8 as yt,a9 as vt,aa as xt,ab as wt,ac as St,ad as kt,ae as Pt,af as Ct,ag as At,P as Dt,ah as Et,ai as Ve,L as Y,N as Mt,aj as Ae,f as Tt,A as Rt,ak as It,al as Lt,am as _t,an as _,ao as Ot,ap as Nt,aq as ze,ar as jt,as as Ft}from"./vendor-react-DU96zfH8.js";import"./vendor-ui-Df4SqoBz.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function a(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(i){if(i.ep)return;i.ep=!0;const o=a(i);fetch(i.href,o)}})();const Gt="modulepreload",Ut=function(e){return"/node-flow/"+e},De={},h=function(t,a,r){let i=Promise.resolve();if(a&&a.length>0){let s=function(u){return Promise.all(u.map(x=>Promise.resolve(x).then(l=>({status:"fulfilled",value:l}),l=>({status:"rejected",reason:l}))))};document.getElementsByTagName("link");const c=document.querySelector("meta[property=csp-nonce]"),f=(c==null?void 0:c.nonce)||(c==null?void 0:c.getAttribute("nonce"));i=s(a.map(u=>{if(u=Ut(u),u in De)return;De[u]=!0;const x=u.endsWith(".css"),l=x?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${u}"]${l}`))return;const b=document.createElement("link");if(b.rel=x?"stylesheet":Gt,x||(b.as="script"),b.crossOrigin="",b.href=u,f&&b.setAttribute("nonce",f),document.head.appendChild(b),x)return new Promise((S,w)=>{b.addEventListener("load",S),b.addEventListener("error",()=>w(new Error(`Unable to preload CSS for ${u}`)))})}))}function o(s){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=s,window.dispatchEvent(c),!c.defaultPrevented)throw s}return i.then(s=>{for(const c of s||[])c.status==="rejected"&&o(c.reason);return t().catch(o)})},Ee=[{id:"class-diagram",title:"1. Class Diagram (UML Structure)",category:"UML Specification",kind:"class",description:"Object-oriented class hierarchies, private/public attributes, methods, inheritance, and composition.",code:`classDiagram
    class CanvasController {
        -Number zoom
        -Number panX
        -Number panY
        -HTMLElement canvas
        -HTMLElement stage
        +setZoom(val, anchorX, anchorY)
        +fit(animate)
        +reset(animate)
        +measure()
        +applyTransform()
    }

    class EditorController {
        -HTMLTextAreaElement textarea
        -HTMLElement lineNumbers
        -HTMLElement statusDot
        -HTMLElement stats
        +getValue() String
        +setValue(code)
        +formatCode()
        +setStatus(type, msg)
        +updateStats()
    }

    class Exporter {
        +exportSvg(container, filename)
        +exportPng(container, scale, filename)
        +exportPdf(container, mode, filename)
        +exportMarkdown(code, filename)
        -renderToCanvas(container, scale)
    }

    class StorageManager {
        +saveDraft(code, templateId)
        +getDraft() Object
        +saveNamedDiagram(name, code, templateId)
        +listSavedDiagrams() Array
        +deleteDiagram(id)
    }

    CanvasController <|-- InteractiveStage : inherits
    CanvasController *-- MiniMapController : owns
    EditorController ..> StorageManager : autosaves
    Exporter ..> CanvasController : captures
`},{id:"sequence-auth",title:"2. Sequence Diagram (UML Interaction)",category:"UML Specification",kind:"sequence",description:"Interactive message sequence with parallel activations, alt guards, and cryptographic token verification.",code:`sequenceDiagram
    autonumber
    actor User as User / Client
    participant App as DiagramAtlas SPA
    participant Auth as Auth Gateway (Wasm)
    participant OAuth as Identity Provider
    participant API as Backend Services

    User->>App: Click "Authorize via OAuth 2.1"
    App->>Auth: Generate PKCE code_verifier & challenge
    Auth-->>App: Hash verified (SHA-256)
    App->>OAuth: Redirect to /authorize?code_challenge
    OAuth->>User: Display consent prompt
    User->>OAuth: Grant permissions
    OAuth-->>App: Authorization Code redirect
    App->>Auth: Exchange Code + code_verifier
    Auth->>OAuth: POST /token (backchannel)
    OAuth-->>Auth: Access Token + Refresh Token (JWT)
    Auth-->>App: Secure HttpOnly Cookie session
    App->>API: GET /api/v1/projects (Bearer JWT)
    API-->>App: 200 OK (User Workspace Data)
    App-->>User: Render Canvas Dashboard
`},{id:"state-diagram",title:"3. State Machine Diagram (UML Behavior)",category:"UML Specification",kind:"state",description:"UML finite state machine with composite states, fork transitions, and error recovery lifecycles.",code:`stateDiagram-v2
    [*] --> Idle: Application Start

    state EditingSession {
        [*] --> Clean
        Clean --> Dirty: Keystroke detected
        Dirty --> Debouncing: 200ms debounce timer
        Debouncing --> Rendering: Trigger Parser
        
        state Rendering {
            [*] --> ValidatingSyntax
            ValidatingSyntax --> CompilingSVG: Syntax Valid
            ValidatingSyntax --> SyntaxError: Syntax Invalid
            CompilingSVG --> Clean: Render Success
        }
    }

    EditingSession --> PresentationMode: Press 'P' key
    PresentationMode --> EditingSession: Press 'ESC'

    EditingSession --> Exporting: Select Export (PNG / SVG / PDF)
    state Exporting {
        [*] --> HighDPIRasterize
        HighDPIRasterize --> WasmLinearMemoryComposite
        WasmLinearMemoryComposite --> BlobDownloadReady
    }
    Exporting --> EditingSession: Download complete

    EditingSession --> [*]: Close Tab
`},{id:"uml-usecase",title:"4. Use Case Diagram (UML Behavior)",category:"UML Specification",kind:"flowchart",description:"Actors, system boundaries, use case ovals, <<include>> dependencies, and <<extend>> extensions.",code:`flowchart LR
    Customer((fa:fa-user Customer))
    Admin((fa:fa-user-shield System Admin))
    BankSystem[(Core Banking Gateway)]

    subgraph SystemBoundary [Online Banking Portal]
        UC1([View Account Balances])
        UC2([Transfer Funds])
        UC3([2FA Biometric Check])
        UC4([Export PDF Statement])
        UC5([Manage Access Roles])
        UC6([Audit Incident Logs])
    end

    Customer --> UC1
    Customer --> UC2
    Customer --> UC4
    UC2 -.->|"<<include>>"| UC3
    UC4 -.->|"<<extend>>"| UC1
    UC2 --> BankSystem

    Admin --> UC5
    Admin --> UC6
    UC6 --> BankSystem
`},{id:"uml-activity",title:"5. Activity Diagram (UML Behavior)",category:"UML Specification",kind:"flowchart",description:"Initial node, decision diamonds, parallel fork & join synchronization bars, and activity final states.",code:`flowchart TD
    Start((*)) --> Init[Submit Order Request]
    Init --> CheckInventory{Inventory Available?}

    CheckInventory -->|No| Backorder[Queue Backorder Notification]
    Backorder --> NotifyUser[Send Email to Customer]
    NotifyUser --> CancelOrder((X))

    CheckInventory -->|Yes| Fork1[=================== Fork Parallel ===================]
    
    Fork1 --> DeductStock[Deduct Item from Warehouse]
    Fork1 --> ChargeCard[Charge Customer Credit Card]
    Fork1 --> GenerateInvoice[Generate PDF Tax Invoice]

    DeductStock --> Join1[=================== Join Synchronization ===================]
    ChargeCard --> Join1
    GenerateInvoice --> Join1

    Join1 --> Dispatch[Dispatch Logistics Shipping Label]
    Dispatch --> CompleteFinal((O))
`},{id:"uml-component",title:"6. Component Diagram (UML Structure)",category:"UML Specification",kind:"flowchart",description:"Component stereotypes, provided and required interfaces, ports, and inter-service dependencies.",code:`flowchart TD
    subgraph OrderSubsystem [Order Management Subsystem]
        OrderGateway[<<component>>\\nOrder API Gateway]
        PaymentEngine[<<component>>\\nPayment Processor Engine]
        StockController[<<component>>\\nInventory Stock Controller]
    end

    WebClient[<<component>>\\nNext.js Web Client]
    MobileApp[<<component>>\\nFlutter Mobile App]
    StripeAPI[(External Stripe Gateway)]
    WarehouseDB[(Warehouse Postgres DB)]

    WebClient -->|"REST / JSON"| OrderGateway
    MobileApp -->|"GraphQL"| OrderGateway
    
    OrderGateway -->|"gRPC Binary"| PaymentEngine
    OrderGateway -->|"gRPC Binary"| StockController

    PaymentEngine -->|"HTTPS / TLS 1.3"| StripeAPI
    StockController -->|"TCP / Port 5432"| WarehouseDB
`},{id:"uml-deployment",title:"7. Deployment Diagram (UML Structure)",category:"UML Specification",kind:"flowchart",description:"Hardware nodes, execution environments, artifact packages, communication protocols, and cloud topology.",code:`flowchart TB
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
`},{id:"uml-package",title:"8. Package Diagram (UML Structure)",category:"UML Specification",kind:"flowchart",description:"Namespace decomposition, layer modularization, import dependencies, and domain-driven design bounds.",code:`flowchart TD
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
`},{id:"uml-object",title:"9. Object Diagram (UML Structure)",category:"UML Specification",kind:"class",description:"Concrete runtime instance specifications, assigned state values, and instance link relationships.",code:`classDiagram
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
`},{id:"uml-composite-structure",title:"10. Composite Structure Diagram (UML Structure)",category:"UML Specification",kind:"flowchart",description:"Internal decomposition of complex classifiers, ports, parts, and connector bindings.",code:`flowchart LR
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
`},{id:"uml-timing",title:"11. Timing Diagram (UML Interaction)",category:"UML Specification",kind:"timeline",description:"Hardware and software state transitions across discrete clock cycles and latency windows.",code:`timeline
    title Ultra-Low Latency Inference & Cache Timing (Sub-Millisecond Pipeline)
    0.00ms - 0.05ms : Client : Cryptographic BLAKE2b State Fingerprinting
    0.05ms - 0.10ms : Rust Wasm Kernel : Tier-0 Fast-Path Memory Cache Probe
    0.10ms - 0.85ms : Cache HIT (P50) : Return Pre-compiled Binary Protobuf Buffer
    0.85ms - 1.20ms : Network Wire : Zstandard Dictionary Decompression
    1.20ms - 2.50ms : Client Browser : Wasm Memory Injection & Instant Vector Display
`},{id:"uml-communication",title:"12. Communication Diagram (UML Interaction)",category:"UML Specification",kind:"flowchart",description:"Collaboration diagram showing numbered inter-object messages and call dependencies.",code:`flowchart TD
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
`},{id:"uml-interaction-overview",title:"13. Interaction Overview Diagram (UML Interaction)",category:"UML Specification",kind:"flowchart",description:"Combines activity control flow with sequence interaction frames and decision guards.",code:`flowchart TD
    InitialNode((*)) --> FrameAuth[sd: User Authentication Flow]
    FrameAuth --> DecisionAuth{Is Authenticated?}

    DecisionAuth -->|Yes| FrameWorkspace[sd: Load Collaborative Workspace Flow]
    DecisionAuth -->|No| FrameChallenge[sd: Multi-Factor Biometric Challenge Flow]

    FrameChallenge --> DecisionMFA{MFA Verified?}
    DecisionMFA -->|Success| FrameWorkspace
    DecisionMFA -->|Failure| FrameLockout[sd: Incident Log & IP Lockout]

    FrameWorkspace --> FrameLiveEdit[sd: Real-Time Vector Canvas Sync]
    FrameLiveEdit --> TerminalNode((O))
    FrameLockout --> TerminalNode
`},{id:"uml-profile",title:"14. Profile Diagram (UML Extension)",category:"UML Specification",kind:"class",description:"Custom UML profile stereotypes, tagged values, and metaclass extensions for domain modeling.",code:`classDiagram
    class Metaclass_Class {
        <<metaclass>>
        Class
    }
    class Metaclass_Property {
        <<metaclass>>
        Property
    }

    class Microservice {
        <<stereotype>>
        +String serviceName
        +String runtimeLanguage
        +Integer replicas
        +Boolean isStateless
    }

    class FastPathCacheable {
        <<stereotype>>
        +Integer ttlSeconds
        +String hashAlgorithm
        +Boolean invalidateOnWrite
    }

    class EncryptedField {
        <<stereotype>>
        +String cipherAlgorithm
        +String keyVaultUri
    }

    Metaclass_Class <|-- Microservice : extends
    Metaclass_Class <|-- FastPathCacheable : extends
    Metaclass_Property <|-- EncryptedField : extends
`},{id:"user-journey-onboarding",title:"User Journey Map — Product Experience",category:"Product & Design",kind:"journey",description:"Customer experience stages, touchpoints, emotional scores (1-5), and cross-functional team actions.",code:`journey
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
`},{id:"kanban-sprint-board",title:"Agile Kanban Board — Sprint Planning",category:"Product & Design",kind:"kanban",description:"Agile sprint workflow columns with user story estimation badges and priority tags.",code:`kanban
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
`},{id:"prioritization-quadrant",title:"Feature Prioritization Matrix (Value vs Effort)",category:"Product & Design",kind:"quadrantChart",description:"Eisenhower and product management quadrant chart for strategic feature roadmapping.",code:`quadrantChart
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
`},{id:"delivery-gantt",title:"Gantt Delivery Sequence — Product Roadmap",category:"Product & Design",kind:"gantt",description:"Cross-functional delivery schedule with workstreams, critical paths, and milestone QA gates.",code:`---
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
`},{id:"mindmap-diagram",title:"Mindmap — Product Strategy & Architecture",category:"Product & Design",kind:"mindmap",description:"Hierarchical brainstorming mindmap of product capabilities, performance pillars, and formats.",code:`mindmap
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
`},{id:"sankey-funnel",title:"Conversion Funnel — User Acquisition (Sankey)",category:"Product & Design",kind:"sankey",description:"Sankey flow diagram tracking user acquisition, studio engagement, and export conversions.",code:`sankey-beta
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
`},{id:"ishikawa-root-cause",title:"Ishikawa Root-Cause Diagram (Fishbone)",category:"Product & Design",kind:"flowchart",description:"Quality engineering root-cause analysis across Method, Machine, Material, and People.",code:`flowchart LR
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
`},{id:"product-roadmap-timeline",title:"Multi-Quarter Product Roadmap — Timeline",category:"Product & Design",kind:"timeline",description:"Quarterly product roadmap with strategic milestones, platform expansions, and release targets.",code:`timeline
    title 2026-2027 Engineering & Product Roadmap
    2026 Q1 : Foundation Release : Dual Mermaid & Wasm Engine : 15 Universal Importers : 30 Templates
    2026 Q2 : Enterprise Intelligence : Local Qwen LLM Copilot : Sub-millisecond Fast Cache : Live Radar
    2026 Q3 : Native Desktop App : Electron & Tauri Offline Builds : Zero-Cloud Enterprise Deployment
    2026 Q4 : Plugin Ecosystem : Custom Wasm Layout Algorithms : Visual Extensions Marketplace
`},{id:"c4-system-context",title:"C4 Model — System Context & Containers",category:"Architecture & Cloud",kind:"c4",description:"C4 model architecture showing users, core software systems, and external banking mainframe boundaries.",code:`C4Context
    title System Context Diagram — Internet Banking System
    Person(customer, "Personal Banking Customer", "A customer of the bank with personal bank accounts.")
    System(bankingSystem, "Internet Banking System", "Allows customers to view account balances, make payments, and analyze transactions.")
    System_Ext(mailSystem, "E-mail Subsystem", "Internal Microsoft Exchange system for customer notifications.")
    System_Ext(mainframe, "Core Mainframe Banking Tier", "Stores all customer core accounts, ledgers, and transactions.")

    Rel(customer, bankingSystem, "Views account balances & initiates transfers using", "HTTPS / TLS 1.3")
    Rel_Back(customer, mailSystem, "Receives transaction verification emails from")
    Rel(bankingSystem, mailSystem, "Sends notifications using", "SMTP")
    Rel(bankingSystem, mainframe, "Queries balances & executes transactions using", "gRPC / Protobuf")
`},{id:"graphviz-k8s-mesh",title:"Kubernetes Cluster Topology (Native Graphviz Wasm)",category:"Architecture & Cloud",kind:"graphviz",description:"Cloud native service mesh and ingress clusters rendered directly using WebAssembly Graphviz C engine.",code:`digraph KubernetesMesh {
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
`},{id:"service-architecture",title:"Service Architecture & Dependency Graph",category:"Architecture & Cloud",kind:"flowchart",description:"Distributed microservice graph with shared core services, parallel domain pods, and telemetry monitoring.",code:`flowchart TD
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
`},{id:"dependency-overview",title:"Milestone Dependency Progression",category:"Architecture & Cloud",kind:"flowchart",description:"High-level milestone progression from infrastructure baseline to project completion with QA gates.",code:`---
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
`},{id:"hardware-system-block",title:"Hardware System Block & Bus Architecture",category:"Architecture & Cloud",kind:"block",description:"High-speed system architecture with CPU, memory bus, neural accelerator, and DMA controllers.",code:`block-beta
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
`},{id:"er-diagram",title:"Entity Relationship Schema (Data Model)",category:"Engineering & Data",kind:"er",description:"Relational database schema with Crow’s Foot cardinality notation, primary keys, and foreign keys.",code:`erDiagram
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
`},{id:"git-graph",title:"Git Trunk-Based Release & Hotfix Flow",category:"Engineering & Data",kind:"gitGraph",description:"Trunk-based source control branching strategy with PR merges, release tags, and hotfixes.",code:`gitGraph
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
`},{id:"sla-performance-metrics",title:"API Latency Percentiles & SLA Uptime (XY Chart)",category:"Engineering & Data",kind:"xychart",description:"Performance benchmark comparison comparing DiagramAtlas WebAssembly response times against legacy tools.",code:`xychart-beta
    title "p99 Execution Latency vs Concurrent Query Load"
    x-axis ["100 req/s", "500 req/s", "1,000 req/s", "5,000 req/s", "10,000 req/s"]
    y-axis "Latency (milliseconds)" 0 --> 250
    bar [12, 18, 26, 45, 68]
    line [110, 145, 185, 230, 290]
`},{id:"system-requirements-spec",title:"Systems Engineering Requirements & Traceability",category:"Architecture & Cloud",kind:"requirement",description:"System-level requirements specification with functional/performance criteria, risk levels, and traceability verification links.",code:`requirementDiagram
    requirement req_core_zero_trust {
        id: 1.1
        text: All network communications must be mutual TLS encrypted and strictly authenticated.
        risk: high
        verifymethod: test
    }
    functionalRequirement req_token_rotation {
        id: 1.2
        text: Access tokens must rotate automatically every 15 minutes with cryptographic replay protection.
        risk: medium
        verifymethod: test
    }
    performanceRequirement req_auth_sla {
        id: 2.1
        text: Authentication handshakes must complete within 50ms at p99 under 10k RPS load.
        risk: medium
        verifymethod: demonstration
    }
    interfaceRequirement req_oidc_federation {
        id: 3.1
        text: Support standard OIDC and SAML 2.0 identity providers for enterprise SSO.
        risk: low
        verifymethod: inspection
    }

    element identity_gateway {
        type: service
    }
    element vault_kms {
        type: subsystem
    }
    element redis_session_cache {
        type: storage
    }

    identity_gateway - satisfies -> req_core_zero_trust
    identity_gateway - satisfies -> req_token_rotation
    identity_gateway - traces -> req_oidc_federation
    vault_kms - satisfies -> req_token_rotation
    redis_session_cache - satisfies -> req_auth_sla
`},{id:"tcp-packet-bytefield",title:"TCP/IP Protocol Header (Packet Bytefield)",category:"Engineering & Data",kind:"packet",description:"Transmission Control Protocol (TCP) 32-bit word packet structure with port numbers, sequence flags, window size, and checksum fields.",code:`packet-beta
    0-15: "Source Port"
    16-31: "Destination Port"
    32-63: "Sequence Number"
    64-95: "Acknowledgment Number"
    96-99: "Data Offset"
    100-105: "Reserved"
    106: "URG"
    107: "ACK"
    108: "PSH"
    109: "RST"
    110: "SYN"
    111: "FIN"
    112-127: "Window Size"
    128-143: "Checksum"
    144-159: "Urgent Pointer"
    160-191: "Options & Padding"
`},{id:"cloud-service-architecture",title:"Cloud Microservices & VPC (Architecture Diagram)",category:"Software Architecture",kind:"architecture",description:"Cloud microservice topology with VPC network boundaries, API gateway, authentication service, relational database, and distributed cache.",code:`architecture-beta
    group vpc(cloud)[Virtual Private Cloud]
    service client(internet)[Web Client]
    service gateway(server)[API Gateway] in vpc
    service auth(key)[Auth Service] in vpc
    service db(database)[Aurora DB] in vpc
    service cache(disk)[Redis Cluster] in vpc

    client:R -- L:gateway
    gateway:B -- T:auth
    gateway:R -- L:db
    auth:R -- L:cache
`},{id:"company-org-chart",title:"Company Organizational Hierarchy (Org Chart)",category:"Business & Operations",kind:"flowchart",description:"Executive leadership, department heads, cross-functional squads, and operational reporting lines for corporate management.",code:`flowchart TD
    Board["Board of Directors"]
    CEO["Chief Executive Officer"]
    Board --> CEO

    CPO["Chief Product Officer"]
    CTO["Chief Technology Officer"]
    CMO["Chief Marketing Officer"]
    CFO["Chief Financial Officer"]

    CEO --> CPO
    CEO --> CTO
    CEO --> CMO
    CEO --> CFO

    subgraph ProductTeam["Product & Design"]
        PM["Product Managers"]
        UX["Product Designers"]
        UXR["User Researchers"]
        CPO --> PM
        CPO --> UX
        CPO --> UXR
    end

    subgraph EngineeringTeam["Engineering & Cloud"]
        FE["Frontend Engineers"]
        BE["Backend Engineers"]
        QA["QA Engineers"]
        CTO --> FE
        CTO --> BE
        CTO --> QA
    end

    subgraph GrowthTeam["Growth & Revenue"]
        Mktg["Digital Marketing"]
        Sales["Enterprise Sales"]
        CustSucc["Customer Success"]
        CMO --> Mktg
        CMO --> Sales
        CMO --> CustSucc
    end
`},{id:"swot-strategic-analysis",title:"SWOT Strategic Business Analysis",category:"Business & Operations",kind:"quadrantChart",description:"Strategic planning framework evaluating internal strengths/weaknesses and external market opportunities/threats.",code:`quadrantChart
    title SWOT Business Analysis Matrix
    x-axis "Internal Factors" --> "External Factors"
    y-axis "Harmful (Negative)" --> "Helpful (Positive)"
    quadrant-1 "Opportunities (External / Positive)"
    quadrant-2 "Strengths (Internal / Positive)"
    quadrant-3 "Weaknesses (Internal / Negative)"
    quadrant-4 "Threats (External / Negative)"
    "Proprietary IP": [0.25, 0.85]
    "Experienced Leadership": [0.35, 0.75]
    "Agile Culture": [0.20, 0.65]
    "Legacy Tech Debt": [0.30, 0.25]
    "Limited Marketing Budget": [0.40, 0.35]
    "Emerging Asian Market": [0.80, 0.85]
    "AI Automation Trends": [0.70, 0.75]
    "Regulatory Compliance Changes": [0.85, 0.20]
    "New Low-Cost Competitors": [0.75, 0.30]
`},{id:"recruitment-pipeline",title:"Talent Acquisition & Hiring Pipeline",category:"Business & Operations",kind:"flowchart",description:"End-to-end recruitment lifecycle from application screening, technical assessments, executive debriefs to formal offer.",code:`flowchart LR
    S1["1. Application Received"] --> S2["2. Resume & Portfolio Screen"]
    S2 --> D1{"Qualified?"}
    D1 -- "No" --> R1["Polite Rejection Notice"]
    D1 -- "Yes" --> S3["3. Recruiter Screening Call"]
    S3 --> S4["4. Skills & Practical Assessment"]
    S4 --> S5["5. Team Panel & Culture Fit"]
    S5 --> D2{"Hire Decision?"}
    D2 -- "No" --> R2["Constructive Feedback"]
    D2 -- "Yes" --> S6["6. Reference Check & Compensation Offer"]
    S6 --> S7["7. Onboarding & Day-One Welcome"]
`},{id:"customer-retention-journey",title:"Customer Retention & Lifecycle Journey",category:"Business & Operations",kind:"journey",description:"Omnichannel customer journey tracking discovery, product activation, value realization, expansion, and advocacy.",code:`journey
    title Customer Lifecycle & Retention Journey
    section Discovery & Trial
      Visit Homepage & Pricing: 5: Prospect
      Sign Up for Free Trial: 4: User
      Complete Guided Onboarding: 3: User
    section Value Realization
      Create First Project: 5: Active User
      Invite Team Collaborator: 4: Team Member
      Experience Aha Moment: 5: Champion
    section Expansion & Advocacy
      Upgrade to Enterprise Plan: 5: Customer
      Request Custom Integrations: 3: Admin
      Submit 5-Star Review & Referral: 5: Advocate
`},{id:"risk-assessment-matrix",title:"Risk Assessment & Mitigation Matrix",category:"Business & Operations",kind:"quadrantChart",description:"Enterprise risk management matrix plotting likelihood against business impact with severity tiers and mitigation actions.",code:`quadrantChart
    title Enterprise Risk Assessment Matrix
    x-axis "Low Likelihood" --> "High Likelihood"
    y-axis "Low Impact" --> "High Impact"
    quadrant-1 "Critical (Urgent Mitigation)"
    quadrant-2 "High Severity (Contingency Plan)"
    quadrant-3 "Low Severity (Routine Monitor)"
    quadrant-4 "Moderate (Operational Action)"
    "Server Infrastructure Outage": [0.25, 0.85]
    "Data Center Fiber Cut": [0.15, 0.90]
    "Key Staff Turnover": [0.65, 0.70]
    "Vendor Cloud Price Increase": [0.80, 0.75]
    "Minor UI Glitch": [0.75, 0.25]
    "Typo in Release Notes": [0.85, 0.15]
    "Office Wifi Fluctuation": [0.35, 0.20]
`},{id:"customer-refund-decision-tree",title:"Customer Refund & Resolution Policy",category:"Business & Operations",kind:"flowchart",description:"Standard operating procedure decision tree for customer support teams resolving refund requests, replacements, and store credits.",code:`flowchart TD
    Req["Customer Requests Refund"] --> CheckTime{"Purchase within 30 days?"}
    CheckTime -- "No" --> Exceed["Policy Window Exceeded"]
    Exceed --> StoreCredit["Offer 50% Store Credit Coupon"]
    CheckTime -- "Yes" --> CheckUsage{"Product Used or Damaged?"}
    CheckUsage -- "Unopened" --> AutoRefund["Approve Full Instant Refund"]
    CheckUsage -- "Opened/Used" --> Inspect{"Condition Verified by Support?"}
    Inspect -- "Minor wear" --> Partial["Issue 80% Partial Refund"]
    Inspect -- "Damaged by customer" --> Deny["Decline with Photographic Proof"]
    AutoRefund --> Notify["Send Confirmation Email"]
    Partial --> Notify
    StoreCredit --> Notify
    Deny --> Notify
`},{id:"strategic-okr-roadmap",title:"Strategic Quarterly OKR Roadmap",category:"Business & Operations",kind:"timeline",description:"Multi-quarter corporate vision, strategic milestones, key results, and organizational goals across 4 quarters.",code:`timeline
    title 2026 Corporate Strategic OKR Roadmap
    section Q1 Foundation & Discovery
        Customer Discovery : 50 Enterprise Interviews : Target ICP Defined
        Core Engine Overhaul : WebAssembly Pipeline : 60fps Canvas Render
    section Q2 Market Launch
        Public Beta Launch : Product Hunt #1 Milestone : First 10,000 Users
        Monetization V1 : Stripe Subscription Billing : Team Workspaces
    section Q3 Scale & Enterprise
        Security & Trust : SOC2 Type II Audit : SSO SAML Authentication
        Partner Ecosystem : VS Code Extension : Slack Bot Integration
    section Q4 Global Expansion
        Internationalization : 12 Languages Supported : Multi-Currency Billing
        AI Native Copilot : Natural Language to Architecture : Self-Healing Diagrams
`},{id:"sales-marketing-funnel",title:"Marketing & Sales Conversion Funnel",category:"Business & Operations",kind:"sankey",description:"Conversion flow from initial website visitors through qualified leads, trial activations, paid tiers, and enterprise deals.",code:`sankey-beta
Website Visitors, Sign Ups, 3500
Website Visitors, Direct Bounces, 16500
Sign Ups, Active Trial Users, 1800
Sign Ups, Inactive Free, 1700
Active Trial Users, Paid Pro Subscriptions, 650
Active Trial Users, Enterprise Contracts, 150
`},{id:"sprint-retrospective-mindmap",title:"Agile Team Sprint Retrospective",category:"Business & Operations",kind:"mindmap",description:"Structured retrospective mindmap categorizing what went well, growth areas, constructive action items, and team kudos.",code:`mindmap
  root((Sprint 24 Retrospective))
    What Went Well
      High Velocity
        Zero production bugs
        Completed all 14 user stories
      Great Collaboration
        Pair programming on tricky WASM logic
        Fast PR code review turnaround
    What Needs Improvement
      Meeting Fatigue
        Back-to-back grooming sessions
      Flaky Integration Tests
        CI pipeline took 18 minutes
      Specification Gaps
        Mobile drawer design unclear until mid-sprint
    Action Items
      Automate smoke tests in GitHub Actions
      Enforce 25-minute meeting caps with 5-minute breathers
      Require design sign-off 2 days before sprint kickoff
    Team Kudos
      Alex for rapid bug turnaround
      Sarah for the new slide deck exporter
`},{id:"qa-defect-lifecycle",title:"QA Defect Lifecycle & Bug Triage Workflow",category:"QA & Testing",role:"QA & Testing",kind:"flowchart",description:"Complete defect state machine from discovery and triage prioritization to developer fix, QA verification, and production closure.",code:`flowchart TD
    NewBug["New Bug Reported"] --> Triage{"Triage Review"}
    Triage -- "Invalid / Cannot Reproduce" --> Rejected["Rejected / Closed"]
    Triage -- "Duplicate" --> Dup["Closed as Duplicate"]
    Triage -- "Confirmed" --> Prioritize{"Severity Assessment"}
    Prioritize -- "P0 Blocker" --> Hotfix["Immediate Hotfix Squad"]
    Prioritize -- "P1 / P2" --> Backlog["Sprint Backlog"]
    Hotfix --> DevFix["Developer Fix & PR"]
    Backlog --> DevFix
    DevFix --> CodeReview["Peer Code Review"]
    CodeReview --> DeployQA["Deployed to QA Test Env"]
    DeployQA --> ReTest{"QA Verification"}
    ReTest -- "Failed" --> ReOpen["Reopened with Trace Logs"]
    ReOpen --> DevFix
    ReTest -- "Passed" --> PreProd["Staging Regression Pass"]
    PreProd --> ProdDeploy["Deploy to Production"]
    ProdDeploy --> Done["Closed & Verified in Prod"]
`},{id:"qa-cicd-quality-gate",title:"Automated CI/CD Quality Gate & Smoke Pipeline",category:"QA & Testing",role:"QA & Testing",kind:"flowchart",description:"Multi-stage continuous integration and release quality gates: unit tests, DB integration, headless browser E2E, and security scans.",code:`flowchart LR
    Commit["Code Commit"] --> Lint["Static Lint & Types"]
    Lint --> Unit["Unit Tests (100% Pass)"]
    Unit --> Gate1{"Gate 1: Fast Checks"}
    Gate1 -- "Pass" --> Integration["Integration & DB Tests"]
    Integration --> E2E["Headless Browser E2E"]
    E2E --> Gate2{"Gate 2: Smoke Gate"}
    Gate2 -- "Pass" --> SecurityScan["SAST & Dependency Audit"]
    SecurityScan --> StagingDeploy["Deploy to Staging"]
    StagingDeploy --> Perf["Load & Latency Benchmarks"]
    Perf --> ReleaseSignoff["QA Release Signoff"]
`},{id:"pm-story-mapping",title:"Product Feature Backlog & User Story Map",category:"Product & Design",role:"Product Manager",kind:"flowchart",description:"Visual user story mapping organizing feature epics across user journey milestones and release slices (MVP vs V2).",code:`flowchart TD
    subgraph Backbone["User Journey Backbone"]
        Discover["1. Discover Product"]
        Eval["2. Evaluate & Sign Up"]
        Onboard["3. First Diagram Created"]
        Collab["4. Team Collaboration"]
        Export["5. Presentation & Export"]
    end

    subgraph MVP["Release Slice 1: MVP"]
        S1["Browse Template Library"]
        S2["One-Click Workspace Launch"]
        S3["Real-Time Live Preview"]
        S4["Share Local File / URL"]
        S5["SVG & PNG Download"]
    end

    subgraph V2["Release Slice 2: Team Pro"]
        S6["Custom Theme Frontmatter"]
        S7["Multi-Tab Workspace"]
        S8["AI Quick-Fix Diagnostics"]
        S9["Real-Time P2P WebRTC"]
        S10["PowerPoint & PDF Export"]
    end

    Discover --> S1
    S1 --> S6
    Eval --> S2
    S2 --> S7
    Onboard --> S3
    S3 --> S8
    Collab --> S4
    S4 --> S9
    Export --> S5
    S5 --> S10
`},{id:"sop-approval-process",title:"Standard Operating Procedure (SOP) & Approval",category:"Business & Operations",role:"Operations & SOP",kind:"flowchart",description:"Corporate governance and operational workflow for drafting, compliance review, executive sign-off, and staff rollout.",code:`flowchart TD
    Start["Initiate New Operational SOP"] --> Author["Department SME Drafts Document"]
    Author --> Peer["Cross-Department Peer Review"]
    Peer --> Changes{"Feedback Received?"}
    Changes -- "Revisions Needed" --> Revise["Update Clauses & Risk Items"]
    Revise --> Peer
    Changes -- "Approved" --> Legal["Legal & Compliance Review"]
    Legal --> Risk{"Compliance Risks?"}
    Risk -- "High Risk" --> Mitigate["Remediate Compliance Clauses"]
    Mitigate --> Legal
    Risk -- "Compliant" --> VP["Executive / VP Final Sign-Off"]
    VP --> Publish["Publish to Corporate Knowledge Base"]
    Publish --> Training["Staff Training & Acknowledgment Log"]
    Training --> ReviewAnnual["Scheduled Annual Review"]
`},{id:"academic-research-thesis",title:"Academic Research Thesis & Literature Map",category:"Education & Research",role:"Student & Academic",kind:"mindmap",description:"Comprehensive research structure covering theoretical foundations, empirical methodology, qualitative benchmarks, and limitations.",code:`mindmap
  root((Doctoral / Master Thesis))
    Theoretical Foundation
      Primary Paradigms
        Distributed Systems Theory
        Vector Graphics Compilation
      Key Literature
        Lamport Time & Orderings
        Compiler Design Patterns
    Research Methodology
      Qualitative Analysis
        User Interviews (N=40)
        Observational Usability Labs
      Quantitative Benchmarks
        WASM vs JS Hash Speed
        Frame Rendering Latency (60fps)
    Empirical Results
      Zero Cloud Data Leakage
      3.7x Execution Acceleration
    Discussion & Limitations
      Browser Memory Boundaries
      Mobile Screen Real Estate
    Future Directions
      Local Multi-Agent Synthesis
      Hardware Accelerated WebGPU
`},{id:"scientific-method-lab",title:"Scientific Method & Lab Experiment Protocol",category:"Education & Research",role:"Student & Academic",kind:"flowchart",description:"Step-by-step scientific method protocol from observation and hypothesis testing to controlled experiment and peer-reviewed publication.",code:`flowchart TD
    Obs["1. Real-World Observation"] --> Question["2. Formulate Research Question"]
    Question --> LitReview["3. Literature Review & Prior Art"]
    LitReview --> Hypo["4. Formulate Testable Hypothesis"]
    Hypo --> Protocol["5. Design Controlled Experiment"]
    Protocol --> RunExp["6. Conduct Experiment & Gather Data"]
    RunExp --> Analyze{"7. Statistical Data Analysis"}
    Analyze -- "Hypothesis Supported" --> DrawConc["8. Draw Scientific Conclusions"]
    Analyze -- "Hypothesis Refuted" --> Refine["Refine or Formulate New Hypothesis"]
    Refine --> Protocol
    DrawConc --> PeerReview["9. Peer Review & Publication"]
    PeerReview --> Repeat["10. Independent Replication by Scientific Community"]
`},{id:"student-study-schedule",title:"Student Semester Course & Exam Plan",category:"Education & Research",role:"Student & Academic",kind:"timeline",description:"Semester timeline outlining foundation lectures, midterm review sessions, advanced topics, final projects, and exam blitz.",code:`timeline
    title Academic Semester & Exam Preparation Plan
    section Weeks 1-4 Foundation
        Orientation & Syllabus Review : Core Readings : Form Study Groups
        Lecture Modules 1-3 : Weekly Lab Assignments : Concept Summaries
    section Weeks 5-8 Midterm Sprint
        Midterm Review Sessions : Practice Exams : Submit Research Proposal
        Midterm Examinations : Grade Review & Office Hours : Adjust Study Habits
    section Weeks 9-12 Deep Dive
        Advanced Special Topics : Group Project Sprint : Draft Research Paper
        Final Project Deliverable : Peer Presentations : Instructor Feedback
    section Weeks 13-16 Finals
        Comprehensive Review : Mock Exam Blitz : Formula & Mindmap Synthesis
        Final Examinations : Semester Wrap-up & Project Portfolios
`},{id:"geospatial-vector-tile-pipeline",title:"GIS Vector Tile Pyramid & Spatial Data Pipeline",category:"Engineering & Data",role:"Developer",kind:"flowchart",description:"End-to-end geospatial processing architecture: raw Shapefile / GeoJSON ingestion, PostGIS indexing, Tippecanoe tiling, and Vector Tile (MVT) distribution.",code:`flowchart TD
    subgraph Ingestion["1. Spatial Data Ingestion"]
        SHP["Shapefile / GeoJSON Raw Archives"]
        GPS["Real-Time GPS Telemetry Stream"]
        OSM["OpenStreetMap Planet Dumps"]
    end

    subgraph Processing["2. Spatial Processing & Storage"]
        PostGIS[("PostgreSQL + PostGIS (H3 Spatial Indexes)")]
        Tippecanoe["Tippecanoe Vector Tile Compressor"]
        ProtobufGen["Mapbox Vector Tile (MVT / Protobuf) Encoder"]
    end

    subgraph Distribution["3. Global Vector Tile Distribution"]
        S3["Cloud Object Storage (PMTiles / MBTiles)"]
        CDN["Global Edge CDN Cache"]
        MapClient["Maplibre / Mapbox Vector Tile Renderer"]
    end

    SHP --> PostGIS
    GPS --> PostGIS
    OSM --> PostGIS
    PostGIS --> Tippecanoe
    Tippecanoe --> ProtobufGen
    ProtobufGen --> S3
    S3 --> CDN
    CDN --> MapClient
`},{id:"mvt-vector-tile-protobuf-spec",title:"Mapbox Vector Tile (MVT) Protobuf Specification",category:"Engineering & Data",role:"Developer",kind:"classDiagram",description:"Binary Protobuf encoding specification for Mapbox Vector Tiles (MVT): Tile layers, geometry commands, feature tags, and value dictionaries.",code:`classDiagram
    %% Mapbox Vector Tile (MVT) Protobuf Specification
    class Tile {
        +Layer[] layers
        +uint32 version
        +decodeTile(z, x, y)
    }
    class Layer {
        +string name
        +Feature[] features
        +string[] keys
        +Value[] values
        +uint32 extent
        +uint32 version
    }
    class Feature {
        +uint64 id
        +uint32[] tags
        +GeomType type
        +uint32[] geometry
    }
    class Value {
        +string string_value
        +float float_value
        +double double_value
        +int64 int_value
        +bool bool_value
    }
    class GeomType {
        <<enumeration>>
        UNKNOWN : 0
        POINT : 1
        LINESTRING : 2
        POLYGON : 3
    }
    Tile *-- Layer : contains
    Layer *-- Feature : encodes
    Layer *-- Value : dictionary
    Feature --> GeomType : classifies
`}];function Vt({open:e,onClose:t}){const[a,r]=v.useState(""),[i,o]=v.useState(0),s=v.useRef(null),c=v.useRef(null),f=dt(),u=v.useMemo(()=>{const l=a.toLowerCase().trim(),b=[{title:"New diagram",desc:"Start with a blank flowchart",to:"/studio?fresh=1"},{title:"Open studio",desc:"Continue your latest draft",to:"/studio"},{title:"Browse templates",desc:`${Ee.length} diagrams, models, and charts`,to:"/templates"},{title:"Projects",desc:"Your project files and snapshots",to:"/saved"},{title:"Formats & features",desc:"Explore supported diagram types",to:"/formats"}],S=Ee.filter(w=>!l||`${w.title} ${w.kind} ${w.description} ${w.category} ${w.code}`.toLowerCase().includes(l)).slice(0,l?10:5).map(w=>({title:w.title,desc:`${w.kind} · ${w.category}`,to:`/studio?template=${w.id}`,template:!0}));return[...b.filter(w=>!l||`${w.title} ${w.desc}`.toLowerCase().includes(l)),...S]},[a]);v.useEffect(()=>{var l,b,S;e?(r(""),o(0),(l=s.current)==null||l.showModal(),(b=c.current)==null||b.focus()):(S=s.current)==null||S.close()},[e]),v.useEffect(()=>{o(0)},[a]),v.useEffect(()=>{var l,b;(b=(l=s.current)==null?void 0:l.querySelector(`[data-index="${i}"]`))==null||b.scrollIntoView({block:"nearest"})},[i]);const x=l=>{l&&(f(l.to),t())};return n.jsxs("dialog",{ref:s,"aria-labelledby":"command-title",onCancel:t,onClick:l=>{l.target===s.current&&t()},className:"command-dialog",onKeyDown:l=>{(l.key==="ArrowDown"||l.key==="ArrowUp")&&(l.preventDefault(),o(b=>Math.max(0,Math.min(u.length-1,b+(l.key==="ArrowDown"?1:-1))))),l.key==="Enter"&&l.target===c.current&&(l.preventDefault(),x(u[i]))},children:[n.jsxs("div",{className:"flex items-center gap-3 border-b border-border px-4 py-4",children:[n.jsx(Ge,{className:"size-5 shrink-0 text-primary"}),n.jsx("label",{id:"command-title",htmlFor:"command-search",className:"sr-only",children:"Search diagrams and commands"}),n.jsx("input",{id:"command-search",ref:c,value:a,onChange:l=>r(l.target.value),placeholder:"Search diagrams and commands…",className:"min-w-0 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"}),n.jsx("button",{onClick:t,"aria-label":"Close search",className:"rounded-md p-1.5 text-muted-foreground hover:bg-white/10",children:n.jsx(Ue,{className:"size-4"})})]}),n.jsxs("div",{className:"max-h-[55vh] overflow-auto p-2",children:[u.map((l,b)=>n.jsxs("button",{"data-index":b,onClick:()=>x(l),onMouseEnter:()=>o(b),className:`flex w-full items-center gap-3 rounded-md px-3 py-3 text-left ${i===b?"bg-accent":"hover:bg-white/5"}`,children:[n.jsx("span",{className:"grid size-9 shrink-0 place-items-center rounded-md border border-border text-primary",children:l.template?n.jsx(mt,{className:"size-4"}):n.jsx(ut,{className:"size-4"})}),n.jsxs("span",{className:"min-w-0 flex-1",children:[n.jsx("span",{className:"block truncate text-sm font-medium text-foreground",children:l.title}),n.jsx("span",{className:"block truncate text-xs text-muted-foreground",children:l.desc})]}),i===b&&n.jsx(pt,{className:"size-4 text-primary"})]},l.to)),u.length===0&&n.jsx("div",{role:"status",className:"px-4 py-8 text-center text-sm text-muted-foreground",children:"No matches. Try UML, ER, or a chart type."})]}),n.jsx("div",{className:"border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground",children:"↑ ↓ navigate · Enter open · Esc close"})]})}function Be(e){var t,a,r="";if(typeof e=="string"||typeof e=="number")r+=e;else if(typeof e=="object")if(Array.isArray(e)){var i=e.length;for(t=0;t<i;t++)e[t]&&(a=Be(e[t]))&&(r&&(r+=" "),r+=a)}else for(a in e)e[a]&&(r&&(r+=" "),r+=a);return r}function zt(){for(var e,t,a=0,r="",i=arguments.length;a<i;a++)(e=arguments[a])&&(t=Be(e))&&(r&&(r+=" "),r+=t);return r}const Bt=(e,t)=>{const a=new Array(e.length+t.length);for(let r=0;r<e.length;r++)a[r]=e[r];for(let r=0;r<t.length;r++)a[e.length+r]=t[r];return a},Wt=(e,t)=>({classGroupId:e,validator:t}),We=(e=new Map,t=null,a)=>({nextPart:e,validators:t,classGroupId:a}),ne="-",Me=[],qt="arbitrary..",Ht=e=>{const t=Kt(e),{conflictingClassGroups:a,conflictingClassGroupModifiers:r}=e;return{getClassGroupId:s=>{if(s.startsWith("[")&&s.endsWith("]"))return Qt(s);const c=s.split(ne),f=c[0]===""&&c.length>1?1:0;return qe(c,f,t)},getConflictingClassGroupIds:(s,c)=>{if(c){const f=r[s],u=a[s];return f?u?Bt(u,f):f:u||Me}return a[s]||Me}}},qe=(e,t,a)=>{if(e.length-t===0)return a.classGroupId;const i=e[t],o=a.nextPart.get(i);if(o){const u=qe(e,t+1,o);if(u)return u}const s=a.validators;if(s===null)return;const c=t===0?e.join(ne):e.slice(t).join(ne),f=s.length;for(let u=0;u<f;u++){const x=s[u];if(x.validator(c))return x.classGroupId}},Qt=e=>e.slice(1,-1).indexOf(":")===-1?void 0:(()=>{const t=e.slice(1,-1),a=t.indexOf(":"),r=t.slice(0,a);return r?qt+r:void 0})(),Kt=e=>{const{theme:t,classGroups:a}=e;return $t(a,t)},$t=(e,t)=>{const a=We();for(const r in e){const i=e[r];fe(i,a,r,t)}return a},fe=(e,t,a,r)=>{const i=e.length;for(let o=0;o<i;o++){const s=e[o];Jt(s,t,a,r)}},Jt=(e,t,a,r)=>{if(typeof e=="string"){Xt(e,t,a);return}if(typeof e=="function"){Yt(e,t,a,r);return}Zt(e,t,a,r)},Xt=(e,t,a)=>{const r=e===""?t:He(t,e);r.classGroupId=a},Yt=(e,t,a,r)=>{if(er(e)){fe(e(r),t,a,r);return}t.validators===null&&(t.validators=[]),t.validators.push(Wt(a,e))},Zt=(e,t,a,r)=>{const i=Object.entries(e),o=i.length;for(let s=0;s<o;s++){const[c,f]=i[s];fe(f,He(t,c),a,r)}},He=(e,t)=>{let a=e;const r=t.split(ne),i=r.length;for(let o=0;o<i;o++){const s=r[o];let c=a.nextPart.get(s);c||(c=We(),a.nextPart.set(s,c)),a=c}return a},er=e=>"isThemeGetter"in e&&e.isThemeGetter===!0,tr=e=>{if(e<1)return{get:()=>{},set:()=>{}};let t=0,a=Object.create(null),r=Object.create(null);const i=(o,s)=>{a[o]=s,t++,t>e&&(t=0,r=a,a=Object.create(null))};return{get(o){let s=a[o];if(s!==void 0)return s;if((s=r[o])!==void 0)return i(o,s),s},set(o,s){o in a?a[o]=s:i(o,s)}}},pe="!",Te=":",rr=[],Re=(e,t,a,r,i)=>({modifiers:e,hasImportantModifier:t,baseClassName:a,maybePostfixModifierPosition:r,isExternal:i}),ar=e=>{const{prefix:t,experimentalParseClassName:a}=e;let r=i=>{const o=[];let s=0,c=0,f=0,u;const x=i.length;for(let k=0;k<x;k++){const T=i[k];if(s===0&&c===0){if(T===Te){o.push(i.slice(f,k)),f=k+1;continue}if(T==="/"){u=k;continue}}T==="["?s++:T==="]"?s--:T==="("?c++:T===")"&&c--}const l=o.length===0?i:i.slice(f);let b=l,S=!1;l.endsWith(pe)?(b=l.slice(0,-1),S=!0):l.startsWith(pe)&&(b=l.slice(1),S=!0);const w=u&&u>f?u-f:void 0;return Re(o,S,b,w)};if(t){const i=t+Te,o=r;r=s=>s.startsWith(i)?o(s.slice(i.length)):Re(rr,!1,s,void 0,!0)}if(a){const i=r;r=o=>a({className:o,parseClassName:i})}return r},or=e=>{const t=new Map;return e.orderSensitiveModifiers.forEach((a,r)=>{t.set(a,1e6+r)}),a=>{const r=[];let i=[];for(let o=0;o<a.length;o++){const s=a[o],c=s[0]==="[",f=t.has(s);c||f?(i.length>0&&(i.sort(),r.push(...i),i=[]),r.push(s)):i.push(s)}return i.length>0&&(i.sort(),r.push(...i)),r}},ir=e=>({cache:tr(e.cacheSize),parseClassName:ar(e),sortModifiers:or(e),postfixLookupClassGroupIds:nr(e),...Ht(e)}),nr=e=>{const t=Object.create(null),a=e.postfixLookupClassGroups;if(a)for(let r=0;r<a.length;r++)t[a[r]]=!0;return t},sr=/\s+/,cr=(e,t)=>{const{parseClassName:a,getClassGroupId:r,getConflictingClassGroupIds:i,sortModifiers:o,postfixLookupClassGroupIds:s}=t,c=[],f=e.trim().split(sr);let u="";for(let x=f.length-1;x>=0;x-=1){const l=f[x],{isExternal:b,modifiers:S,hasImportantModifier:w,baseClassName:k,maybePostfixModifierPosition:T}=a(l);if(b){u=l+(u.length>0?" "+u:u);continue}let F=!!T,E;if(F){const L=k.substring(0,T);E=r(L);const p=E&&s[E]?r(k):void 0;p&&p!==E&&(E=p,F=!1)}else E=r(k);if(!E){if(!F){u=l+(u.length>0?" "+u:u);continue}if(E=r(k),!E){u=l+(u.length>0?" "+u:u);continue}F=!1}const J=S.length===0?"":S.length===1?S[0]:o(S).join(":"),B=w?J+pe:J,W=B+E;if(c.indexOf(W)>-1)continue;c.push(W);const q=i(E,F);for(let L=0;L<q.length;++L){const p=q[L];c.push(B+p)}u=l+(u.length>0?" "+u:u)}return u},lr=(...e)=>{let t=0,a,r,i="";for(;t<e.length;)(a=e[t++])&&(r=Qe(a))&&(i&&(i+=" "),i+=r);return i},Qe=e=>{if(typeof e=="string")return e;let t,a="";for(let r=0;r<e.length;r++)e[r]&&(t=Qe(e[r]))&&(a&&(a+=" "),a+=t);return a},dr=(e,...t)=>{let a,r,i,o;const s=f=>{const u=t.reduce((x,l)=>l(x),e());return a=ir(u),r=a.cache.get,i=a.cache.set,o=c,c(f)},c=f=>{const u=r(f);if(u)return u;const x=cr(f,a);return i(f,x),x};return o=s,(...f)=>o(lr(...f))},mr=[],P=e=>{const t=a=>a[e]||mr;return t.isThemeGetter=!0,t.themeKey=e,t},Ke=/^\[(?:(\w[\w-]*):)?(.+)\]$/i,$e=/^\((?:(\w[\w-]*):)?(.+)\)$/i,ur=/^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/,pr=/^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/,gr=/\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/,fr=/^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix|color|light-dark)\(.+\)$/,hr=/^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/,br=/^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/,N=e=>ur.test(e),y=e=>!!e&&!Number.isNaN(Number(e)),I=e=>!!e&&Number.isInteger(Number(e)),ue=e=>e.endsWith("%")&&y(e.slice(0,-1)),O=e=>pr.test(e),Je=()=>!0,yr=e=>gr.test(e)&&!fr.test(e),he=()=>!1,vr=e=>hr.test(e),xr=e=>br.test(e),wr=e=>!d(e)&&!m(e),Sr=e=>e.startsWith("@container")&&(e[10]==="/"&&e[11]!==void 0||e[11]==="s"&&e[16]!==void 0&&e.startsWith("-size/",10)||e[11]==="n"&&e[18]!==void 0&&e.startsWith("-normal/",10)),kr=e=>j(e,Ze,he),d=e=>Ke.test(e),U=e=>j(e,et,yr),Ie=e=>j(e,Rr,y),Pr=e=>j(e,rt,Je),Cr=e=>j(e,tt,he),Le=e=>j(e,Xe,he),Ar=e=>j(e,Ye,xr),oe=e=>j(e,at,vr),m=e=>$e.test(e),X=e=>z(e,et),Dr=e=>z(e,tt),_e=e=>z(e,Xe),Er=e=>z(e,Ze),Mr=e=>z(e,Ye),ie=e=>z(e,at,!0),Tr=e=>z(e,rt,!0),j=(e,t,a)=>{const r=Ke.exec(e);return r?r[1]?t(r[1]):a(r[2]):!1},z=(e,t,a=!1)=>{const r=$e.exec(e);return r?r[1]?t(r[1]):a:!1},Xe=e=>e==="position"||e==="percentage",Ye=e=>e==="image"||e==="url",Ze=e=>e==="length"||e==="size"||e==="bg-size",et=e=>e==="length",Rr=e=>e==="number",tt=e=>e==="family-name",rt=e=>e==="number"||e==="weight",at=e=>e==="shadow",Ir=()=>{const e=P("color"),t=P("font"),a=P("text"),r=P("font-weight"),i=P("tracking"),o=P("leading"),s=P("breakpoint"),c=P("container"),f=P("spacing"),u=P("radius"),x=P("shadow"),l=P("inset-shadow"),b=P("text-shadow"),S=P("drop-shadow"),w=P("blur"),k=P("perspective"),T=P("aspect"),F=P("ease"),E=P("animate"),J=()=>["auto","avoid","all","avoid-page","page","left","right","column"],B=()=>["center","top","bottom","left","right","top-left","left-top","top-right","right-top","bottom-right","right-bottom","bottom-left","left-bottom"],W=()=>[...B(),m,d],q=()=>["auto","hidden","clip","visible","scroll"],L=()=>["auto","contain","none"],p=()=>[m,d,f],M=()=>[N,"full","auto",...p()],ye=()=>[I,"none","subgrid",m,d],ve=()=>["auto",{span:["full",I,m,d]},I,m,d],Z=()=>[I,"auto",m,d],xe=()=>["auto","min","max","fr",m,d],se=()=>["start","end","center","between","around","evenly","stretch","baseline","center-safe","end-safe"],H=()=>["start","end","center","stretch","center-safe","end-safe"],R=()=>["auto",...p()],G=()=>[N,"auto","full","dvw","dvh","lvw","lvh","svw","svh","min","max","fit",...p()],ce=()=>[c,N,"screen","full","dvw","lvw","svw","min","max","fit",...p()],le=()=>[N,"screen","full","lh","dvh","lvh","svh","min","max","fit",...p()],g=()=>[e,m,d],we=()=>[...B(),_e,Le,{position:[m,d]}],Se=()=>["no-repeat",{repeat:["","x","y","space","round"]}],ke=()=>["auto","cover","contain",Er,kr,{size:[m,d]}],de=()=>[ue,X,U],A=()=>["","none","full",u,m,d],D=()=>["",y,X,U],ee=()=>["solid","dashed","dotted","double"],Pe=()=>["normal","multiply","screen","overlay","darken","lighten","color-dodge","color-burn","hard-light","soft-light","difference","exclusion","hue","saturation","color","luminosity"],C=()=>[y,ue,_e,Le],Ce=()=>["","none",w,m,d],te=()=>["none",y,m,d],re=()=>["none",y,m,d],me=()=>[y,m,d],ae=()=>[N,"full",...p()];return{cacheSize:500,theme:{animate:["spin","ping","pulse","bounce"],aspect:["video"],blur:[O],breakpoint:[O],color:[Je],container:[O],"drop-shadow":[O],ease:["in","out","in-out"],font:[wr],"font-weight":["thin","extralight","light","normal","medium","semibold","bold","extrabold","black"],"inset-shadow":[O],leading:["none","tight","snug","normal","relaxed","loose"],perspective:["dramatic","near","normal","midrange","distant","none"],radius:[O],shadow:[O],spacing:["px",y],text:[O],"text-shadow":[O],tracking:["tighter","tight","normal","wide","wider","widest"]},classGroups:{aspect:[{aspect:["auto","square",N,d,m,T]}],container:["container"],"container-type":[{"@container":["","normal","size",m,d]}],"container-named":[Sr],columns:[{columns:[y,"auto",d,m,c]}],"break-after":[{"break-after":J()}],"break-before":[{"break-before":J()}],"break-inside":[{"break-inside":["auto","avoid","avoid-page","avoid-column"]}],"box-decoration":[{"box-decoration":["slice","clone"]}],box:[{box:["border","content"]}],display:["block","inline-block","inline","flex","inline-flex","table","inline-table","table-caption","table-cell","table-column","table-column-group","table-footer-group","table-header-group","table-row-group","table-row","flow-root","grid","inline-grid","contents","list-item","hidden"],sr:["sr-only","not-sr-only"],float:[{float:["right","left","none","start","end"]}],clear:[{clear:["left","right","both","none","start","end"]}],isolation:["isolate","isolation-auto"],"object-fit":[{object:["contain","cover","fill","none","scale-down"]}],"object-position":[{object:W()}],overflow:[{overflow:q()}],"overflow-x":[{"overflow-x":q()}],"overflow-y":[{"overflow-y":q()}],overscroll:[{overscroll:L()}],"overscroll-x":[{"overscroll-x":L()}],"overscroll-y":[{"overscroll-y":L()}],position:["static","fixed","absolute","relative","sticky"],inset:[{inset:M()}],"inset-x":[{"inset-x":M()}],"inset-y":[{"inset-y":M()}],start:[{"inset-s":M(),start:M()}],end:[{"inset-e":M(),end:M()}],"inset-bs":[{"inset-bs":M()}],"inset-be":[{"inset-be":M()}],top:[{top:M()}],right:[{right:M()}],bottom:[{bottom:M()}],left:[{left:M()}],visibility:["visible","invisible","collapse"],z:[{z:[I,"auto",m,d]}],basis:[{basis:[N,"full","auto",c,...p()]}],"flex-direction":[{flex:["row","row-reverse","col","col-reverse"]}],"flex-wrap":[{flex:["nowrap","wrap","wrap-reverse"]}],flex:[{flex:[y,N,"auto","initial","none",d]}],grow:[{grow:["",y,m,d]}],shrink:[{shrink:["",y,m,d]}],order:[{order:[I,"first","last","none",m,d]}],"grid-cols":[{"grid-cols":ye()}],"col-start-end":[{col:ve()}],"col-start":[{"col-start":Z()}],"col-end":[{"col-end":Z()}],"grid-rows":[{"grid-rows":ye()}],"row-start-end":[{row:ve()}],"row-start":[{"row-start":Z()}],"row-end":[{"row-end":Z()}],"grid-flow":[{"grid-flow":["row","col","dense","row-dense","col-dense"]}],"auto-cols":[{"auto-cols":xe()}],"auto-rows":[{"auto-rows":xe()}],gap:[{gap:p()}],"gap-x":[{"gap-x":p()}],"gap-y":[{"gap-y":p()}],"justify-content":[{justify:[...se(),"normal"]}],"justify-items":[{"justify-items":[...H(),"normal"]}],"justify-self":[{"justify-self":["auto",...H()]}],"align-content":[{content:["normal",...se()]}],"align-items":[{items:[...H(),{baseline:["","last"]}]}],"align-self":[{self:["auto",...H(),{baseline:["","last"]}]}],"place-content":[{"place-content":se()}],"place-items":[{"place-items":[...H(),"baseline"]}],"place-self":[{"place-self":["auto",...H()]}],p:[{p:p()}],px:[{px:p()}],py:[{py:p()}],ps:[{ps:p()}],pe:[{pe:p()}],pbs:[{pbs:p()}],pbe:[{pbe:p()}],pt:[{pt:p()}],pr:[{pr:p()}],pb:[{pb:p()}],pl:[{pl:p()}],m:[{m:R()}],mx:[{mx:R()}],my:[{my:R()}],ms:[{ms:R()}],me:[{me:R()}],mbs:[{mbs:R()}],mbe:[{mbe:R()}],mt:[{mt:R()}],mr:[{mr:R()}],mb:[{mb:R()}],ml:[{ml:R()}],"space-x":[{"space-x":p()}],"space-x-reverse":["space-x-reverse"],"space-y":[{"space-y":p()}],"space-y-reverse":["space-y-reverse"],size:[{size:G()}],"inline-size":[{inline:["auto",...ce()]}],"min-inline-size":[{"min-inline":["auto",...ce()]}],"max-inline-size":[{"max-inline":["none",...ce()]}],"block-size":[{block:["auto",...le()]}],"min-block-size":[{"min-block":["auto",...le()]}],"max-block-size":[{"max-block":["none",...le()]}],w:[{w:[c,"screen",...G()]}],"min-w":[{"min-w":[c,"screen","none",...G()]}],"max-w":[{"max-w":[c,"screen","none","prose",{screen:[s]},...G()]}],h:[{h:["screen","lh",...G()]}],"min-h":[{"min-h":["screen","lh","none",...G()]}],"max-h":[{"max-h":["screen","lh","none",...G()]}],"font-size":[{text:["base",a,X,U]}],"font-smoothing":["antialiased","subpixel-antialiased"],"font-style":["italic","not-italic"],"font-weight":[{font:[r,Tr,Pr]}],"font-stretch":[{"font-stretch":["ultra-condensed","extra-condensed","condensed","semi-condensed","normal","semi-expanded","expanded","extra-expanded","ultra-expanded",ue,d]}],"font-family":[{font:[Dr,Cr,t]}],"font-features":[{"font-features":[d]}],"fvn-normal":["normal-nums"],"fvn-ordinal":["ordinal"],"fvn-slashed-zero":["slashed-zero"],"fvn-figure":["lining-nums","oldstyle-nums"],"fvn-spacing":["proportional-nums","tabular-nums"],"fvn-fraction":["diagonal-fractions","stacked-fractions"],tracking:[{tracking:[i,m,d]}],"line-clamp":[{"line-clamp":[y,"none",m,Ie]}],leading:[{leading:["none",o,...p()]}],"list-image":[{"list-image":["none",m,d]}],"list-style-position":[{list:["inside","outside"]}],"list-style-type":[{list:["disc","decimal","none",m,d]}],"text-alignment":[{text:["left","center","right","justify","start","end"]}],"placeholder-color":[{placeholder:g()}],"text-color":[{text:g()}],"text-decoration":["underline","overline","line-through","no-underline"],"text-decoration-style":[{decoration:[...ee(),"wavy"]}],"text-decoration-thickness":[{decoration:[y,"from-font","auto",m,U]}],"text-decoration-color":[{decoration:g()}],"underline-offset":[{"underline-offset":[y,"auto",m,d]}],"text-transform":["uppercase","lowercase","capitalize","normal-case"],"text-overflow":["truncate","text-ellipsis","text-clip"],"text-wrap":[{text:["wrap","nowrap","balance","pretty"]}],indent:[{indent:p()}],"tab-size":[{tab:[I,m,d]}],"vertical-align":[{align:["baseline","top","middle","bottom","text-top","text-bottom","sub","super",m,d]}],whitespace:[{whitespace:["normal","nowrap","pre","pre-line","pre-wrap","break-spaces"]}],break:[{break:["normal","words","all","keep"]}],wrap:[{wrap:["break-word","anywhere","normal"]}],hyphens:[{hyphens:["none","manual","auto"]}],content:[{content:["none",m,d]}],"bg-attachment":[{bg:["fixed","local","scroll"]}],"bg-clip":[{"bg-clip":["border","padding","content","text"]}],"bg-origin":[{"bg-origin":["border","padding","content"]}],"bg-position":[{bg:we()}],"bg-repeat":[{bg:Se()}],"bg-size":[{bg:ke()}],"bg-image":[{bg:["none",{linear:[{to:["t","tr","r","br","b","bl","l","tl"]},I,m,d],radial:["",m,d],conic:["",I,m,d]},Mr,Ar]}],"bg-color":[{bg:g()}],"gradient-from-pos":[{from:de()}],"gradient-via-pos":[{via:de()}],"gradient-to-pos":[{to:de()}],"gradient-from":[{from:g()}],"gradient-via":[{via:g()}],"gradient-to":[{to:g()}],rounded:[{rounded:A()}],"rounded-s":[{"rounded-s":A()}],"rounded-e":[{"rounded-e":A()}],"rounded-t":[{"rounded-t":A()}],"rounded-r":[{"rounded-r":A()}],"rounded-b":[{"rounded-b":A()}],"rounded-l":[{"rounded-l":A()}],"rounded-ss":[{"rounded-ss":A()}],"rounded-se":[{"rounded-se":A()}],"rounded-ee":[{"rounded-ee":A()}],"rounded-es":[{"rounded-es":A()}],"rounded-tl":[{"rounded-tl":A()}],"rounded-tr":[{"rounded-tr":A()}],"rounded-br":[{"rounded-br":A()}],"rounded-bl":[{"rounded-bl":A()}],"border-w":[{border:D()}],"border-w-x":[{"border-x":D()}],"border-w-y":[{"border-y":D()}],"border-w-s":[{"border-s":D()}],"border-w-e":[{"border-e":D()}],"border-w-bs":[{"border-bs":D()}],"border-w-be":[{"border-be":D()}],"border-w-t":[{"border-t":D()}],"border-w-r":[{"border-r":D()}],"border-w-b":[{"border-b":D()}],"border-w-l":[{"border-l":D()}],"divide-x":[{"divide-x":D()}],"divide-x-reverse":["divide-x-reverse"],"divide-y":[{"divide-y":D()}],"divide-y-reverse":["divide-y-reverse"],"border-style":[{border:[...ee(),"hidden","none"]}],"divide-style":[{divide:[...ee(),"hidden","none"]}],"border-color":[{border:g()}],"border-color-x":[{"border-x":g()}],"border-color-y":[{"border-y":g()}],"border-color-s":[{"border-s":g()}],"border-color-e":[{"border-e":g()}],"border-color-bs":[{"border-bs":g()}],"border-color-be":[{"border-be":g()}],"border-color-t":[{"border-t":g()}],"border-color-r":[{"border-r":g()}],"border-color-b":[{"border-b":g()}],"border-color-l":[{"border-l":g()}],"divide-color":[{divide:g()}],"outline-style":[{outline:[...ee(),"none","hidden"]}],"outline-offset":[{"outline-offset":[y,m,d]}],"outline-w":[{outline:["",y,X,U]}],"outline-color":[{outline:g()}],shadow:[{shadow:["","inner","none",x,ie,oe]}],"shadow-color":[{shadow:g()}],"inset-shadow":[{"inset-shadow":["none",l,ie,oe]}],"inset-shadow-color":[{"inset-shadow":g()}],"ring-w":[{ring:D()}],"ring-w-inset":["ring-inset"],"ring-color":[{ring:g()}],"ring-offset-w":[{"ring-offset":[y,U]}],"ring-offset-color":[{"ring-offset":g()}],"inset-ring-w":[{"inset-ring":D()}],"inset-ring-color":[{"inset-ring":g()}],"text-shadow":[{"text-shadow":["none",b,ie,oe]}],"text-shadow-color":[{"text-shadow":g()}],opacity:[{opacity:[y,m,d]}],"mix-blend":[{"mix-blend":[...Pe(),"plus-darker","plus-lighter"]}],"bg-blend":[{"bg-blend":Pe()}],"mask-clip":[{"mask-clip":["border","padding","content","fill","stroke","view"]},"mask-no-clip"],"mask-composite":[{mask:["add","subtract","intersect","exclude"]}],"mask-image-linear-pos":[{"mask-linear":[y]}],"mask-image-linear-from-pos":[{"mask-linear-from":C()}],"mask-image-linear-to-pos":[{"mask-linear-to":C()}],"mask-image-linear-from-color":[{"mask-linear-from":g()}],"mask-image-linear-to-color":[{"mask-linear-to":g()}],"mask-image-t-from-pos":[{"mask-t-from":C()}],"mask-image-t-to-pos":[{"mask-t-to":C()}],"mask-image-t-from-color":[{"mask-t-from":g()}],"mask-image-t-to-color":[{"mask-t-to":g()}],"mask-image-r-from-pos":[{"mask-r-from":C()}],"mask-image-r-to-pos":[{"mask-r-to":C()}],"mask-image-r-from-color":[{"mask-r-from":g()}],"mask-image-r-to-color":[{"mask-r-to":g()}],"mask-image-b-from-pos":[{"mask-b-from":C()}],"mask-image-b-to-pos":[{"mask-b-to":C()}],"mask-image-b-from-color":[{"mask-b-from":g()}],"mask-image-b-to-color":[{"mask-b-to":g()}],"mask-image-l-from-pos":[{"mask-l-from":C()}],"mask-image-l-to-pos":[{"mask-l-to":C()}],"mask-image-l-from-color":[{"mask-l-from":g()}],"mask-image-l-to-color":[{"mask-l-to":g()}],"mask-image-x-from-pos":[{"mask-x-from":C()}],"mask-image-x-to-pos":[{"mask-x-to":C()}],"mask-image-x-from-color":[{"mask-x-from":g()}],"mask-image-x-to-color":[{"mask-x-to":g()}],"mask-image-y-from-pos":[{"mask-y-from":C()}],"mask-image-y-to-pos":[{"mask-y-to":C()}],"mask-image-y-from-color":[{"mask-y-from":g()}],"mask-image-y-to-color":[{"mask-y-to":g()}],"mask-image-radial":[{"mask-radial":[m,d]}],"mask-image-radial-from-pos":[{"mask-radial-from":C()}],"mask-image-radial-to-pos":[{"mask-radial-to":C()}],"mask-image-radial-from-color":[{"mask-radial-from":g()}],"mask-image-radial-to-color":[{"mask-radial-to":g()}],"mask-image-radial-shape":[{"mask-radial":["circle","ellipse"]}],"mask-image-radial-size":[{"mask-radial":[{closest:["side","corner"],farthest:["side","corner"]}]}],"mask-image-radial-pos":[{"mask-radial-at":B()}],"mask-image-conic-pos":[{"mask-conic":[y]}],"mask-image-conic-from-pos":[{"mask-conic-from":C()}],"mask-image-conic-to-pos":[{"mask-conic-to":C()}],"mask-image-conic-from-color":[{"mask-conic-from":g()}],"mask-image-conic-to-color":[{"mask-conic-to":g()}],"mask-mode":[{mask:["alpha","luminance","match"]}],"mask-origin":[{"mask-origin":["border","padding","content","fill","stroke","view"]}],"mask-position":[{mask:we()}],"mask-repeat":[{mask:Se()}],"mask-size":[{mask:ke()}],"mask-type":[{"mask-type":["alpha","luminance"]}],"mask-image":[{mask:["none",m,d]}],filter:[{filter:["","none",m,d]}],blur:[{blur:Ce()}],brightness:[{brightness:[y,m,d]}],contrast:[{contrast:[y,m,d]}],"drop-shadow":[{"drop-shadow":["","none",S,ie,oe]}],"drop-shadow-color":[{"drop-shadow":g()}],grayscale:[{grayscale:["",y,m,d]}],"hue-rotate":[{"hue-rotate":[y,m,d]}],invert:[{invert:["",y,m,d]}],saturate:[{saturate:[y,m,d]}],sepia:[{sepia:["",y,m,d]}],"backdrop-filter":[{"backdrop-filter":["","none",m,d]}],"backdrop-blur":[{"backdrop-blur":Ce()}],"backdrop-brightness":[{"backdrop-brightness":[y,m,d]}],"backdrop-contrast":[{"backdrop-contrast":[y,m,d]}],"backdrop-grayscale":[{"backdrop-grayscale":["",y,m,d]}],"backdrop-hue-rotate":[{"backdrop-hue-rotate":[y,m,d]}],"backdrop-invert":[{"backdrop-invert":["",y,m,d]}],"backdrop-opacity":[{"backdrop-opacity":[y,m,d]}],"backdrop-saturate":[{"backdrop-saturate":[y,m,d]}],"backdrop-sepia":[{"backdrop-sepia":["",y,m,d]}],"border-collapse":[{border:["collapse","separate"]}],"border-spacing":[{"border-spacing":p()}],"border-spacing-x":[{"border-spacing-x":p()}],"border-spacing-y":[{"border-spacing-y":p()}],"table-layout":[{table:["auto","fixed"]}],caption:[{caption:["top","bottom"]}],transition:[{transition:["","all","colors","opacity","shadow","transform","none",m,d]}],"transition-behavior":[{transition:["normal","discrete"]}],duration:[{duration:[y,"initial",m,d]}],ease:[{ease:["linear","initial",F,m,d]}],delay:[{delay:[y,m,d]}],animate:[{animate:["none",E,m,d]}],backface:[{backface:["hidden","visible"]}],perspective:[{perspective:[k,m,d]}],"perspective-origin":[{"perspective-origin":W()}],rotate:[{rotate:te()}],"rotate-x":[{"rotate-x":te()}],"rotate-y":[{"rotate-y":te()}],"rotate-z":[{"rotate-z":te()}],scale:[{scale:re()}],"scale-x":[{"scale-x":re()}],"scale-y":[{"scale-y":re()}],"scale-z":[{"scale-z":re()}],"scale-3d":["scale-3d"],skew:[{skew:me()}],"skew-x":[{"skew-x":me()}],"skew-y":[{"skew-y":me()}],transform:[{transform:[m,d,"","none","gpu","cpu"]}],"transform-origin":[{origin:W()}],"transform-style":[{transform:["3d","flat"]}],translate:[{translate:ae()}],"translate-x":[{"translate-x":ae()}],"translate-y":[{"translate-y":ae()}],"translate-z":[{"translate-z":ae()}],"translate-none":["translate-none"],zoom:[{zoom:[I,m,d]}],accent:[{accent:g()}],appearance:[{appearance:["none","auto"]}],"caret-color":[{caret:g()}],"color-scheme":[{scheme:["normal","dark","light","light-dark","only-dark","only-light"]}],cursor:[{cursor:["auto","default","pointer","wait","text","move","help","not-allowed","none","context-menu","progress","cell","crosshair","vertical-text","alias","copy","no-drop","grab","grabbing","all-scroll","col-resize","row-resize","n-resize","e-resize","s-resize","w-resize","ne-resize","nw-resize","se-resize","sw-resize","ew-resize","ns-resize","nesw-resize","nwse-resize","zoom-in","zoom-out",m,d]}],"field-sizing":[{"field-sizing":["fixed","content"]}],"pointer-events":[{"pointer-events":["auto","none"]}],resize:[{resize:["none","","y","x"]}],"scroll-behavior":[{scroll:["auto","smooth"]}],"scrollbar-thumb-color":[{"scrollbar-thumb":g()}],"scrollbar-track-color":[{"scrollbar-track":g()}],"scrollbar-gutter":[{"scrollbar-gutter":["auto","stable","both"]}],"scrollbar-w":[{scrollbar:["auto","thin","none"]}],"scroll-m":[{"scroll-m":p()}],"scroll-mx":[{"scroll-mx":p()}],"scroll-my":[{"scroll-my":p()}],"scroll-ms":[{"scroll-ms":p()}],"scroll-me":[{"scroll-me":p()}],"scroll-mbs":[{"scroll-mbs":p()}],"scroll-mbe":[{"scroll-mbe":p()}],"scroll-mt":[{"scroll-mt":p()}],"scroll-mr":[{"scroll-mr":p()}],"scroll-mb":[{"scroll-mb":p()}],"scroll-ml":[{"scroll-ml":p()}],"scroll-p":[{"scroll-p":p()}],"scroll-px":[{"scroll-px":p()}],"scroll-py":[{"scroll-py":p()}],"scroll-ps":[{"scroll-ps":p()}],"scroll-pe":[{"scroll-pe":p()}],"scroll-pbs":[{"scroll-pbs":p()}],"scroll-pbe":[{"scroll-pbe":p()}],"scroll-pt":[{"scroll-pt":p()}],"scroll-pr":[{"scroll-pr":p()}],"scroll-pb":[{"scroll-pb":p()}],"scroll-pl":[{"scroll-pl":p()}],"snap-align":[{snap:["start","end","center","align-none"]}],"snap-stop":[{snap:["normal","always"]}],"snap-type":[{snap:["none","x","y","both"]}],"snap-strictness":[{snap:["mandatory","proximity"]}],touch:[{touch:["auto","none","manipulation"]}],"touch-x":[{"touch-pan":["x","left","right"]}],"touch-y":[{"touch-pan":["y","up","down"]}],"touch-pz":["touch-pinch-zoom"],select:[{select:["none","text","all","auto"]}],"will-change":[{"will-change":["auto","scroll","contents","transform",m,d]}],fill:[{fill:["none",...g()]}],"stroke-w":[{stroke:[y,X,U,Ie]}],stroke:[{stroke:["none",...g()]}],"forced-color-adjust":[{"forced-color-adjust":["auto","none"]}]},conflictingClassGroups:{"container-named":["container-type"],overflow:["overflow-x","overflow-y"],overscroll:["overscroll-x","overscroll-y"],inset:["inset-x","inset-y","inset-bs","inset-be","start","end","top","right","bottom","left"],"inset-x":["start","end","right","left"],"inset-y":["inset-bs","inset-be","top","bottom"],flex:["basis","grow","shrink"],gap:["gap-x","gap-y"],p:["px","py","ps","pe","pbs","pbe","pt","pr","pb","pl"],px:["ps","pe","pr","pl"],py:["pbs","pbe","pt","pb"],m:["mx","my","ms","me","mbs","mbe","mt","mr","mb","ml"],mx:["ms","me","mr","ml"],my:["mbs","mbe","mt","mb"],size:["w","h"],"font-size":["leading"],"fvn-normal":["fvn-ordinal","fvn-slashed-zero","fvn-figure","fvn-spacing","fvn-fraction"],"fvn-ordinal":["fvn-normal"],"fvn-slashed-zero":["fvn-normal"],"fvn-figure":["fvn-normal"],"fvn-spacing":["fvn-normal"],"fvn-fraction":["fvn-normal"],"line-clamp":["display","overflow"],rounded:["rounded-s","rounded-e","rounded-t","rounded-r","rounded-b","rounded-l","rounded-ss","rounded-se","rounded-ee","rounded-es","rounded-tl","rounded-tr","rounded-br","rounded-bl"],"rounded-s":["rounded-ss","rounded-es"],"rounded-e":["rounded-se","rounded-ee"],"rounded-t":["rounded-tl","rounded-tr"],"rounded-r":["rounded-tr","rounded-br"],"rounded-b":["rounded-br","rounded-bl"],"rounded-l":["rounded-tl","rounded-bl"],"border-spacing":["border-spacing-x","border-spacing-y"],"border-w":["border-w-x","border-w-y","border-w-s","border-w-e","border-w-bs","border-w-be","border-w-t","border-w-r","border-w-b","border-w-l"],"border-w-x":["border-w-s","border-w-e","border-w-r","border-w-l"],"border-w-y":["border-w-bs","border-w-be","border-w-t","border-w-b"],"border-color":["border-color-x","border-color-y","border-color-s","border-color-e","border-color-bs","border-color-be","border-color-t","border-color-r","border-color-b","border-color-l"],"border-color-x":["border-color-s","border-color-e","border-color-r","border-color-l"],"border-color-y":["border-color-bs","border-color-be","border-color-t","border-color-b"],translate:["translate-x","translate-y","translate-none"],"translate-none":["translate","translate-x","translate-y","translate-z"],"scroll-m":["scroll-mx","scroll-my","scroll-ms","scroll-me","scroll-mbs","scroll-mbe","scroll-mt","scroll-mr","scroll-mb","scroll-ml"],"scroll-mx":["scroll-ms","scroll-me","scroll-mr","scroll-ml"],"scroll-my":["scroll-mbs","scroll-mbe","scroll-mt","scroll-mb"],"scroll-p":["scroll-px","scroll-py","scroll-ps","scroll-pe","scroll-pbs","scroll-pbe","scroll-pt","scroll-pr","scroll-pb","scroll-pl"],"scroll-px":["scroll-ps","scroll-pe","scroll-pr","scroll-pl"],"scroll-py":["scroll-pbs","scroll-pbe","scroll-pt","scroll-pb"],touch:["touch-x","touch-y","touch-pz"],"touch-x":["touch"],"touch-y":["touch"],"touch-pz":["touch"]},conflictingClassGroupModifiers:{"font-size":["leading"]},postfixLookupClassGroups:["container-type"],orderSensitiveModifiers:["*","**","after","backdrop","before","details-content","file","first-letter","first-line","marker","placeholder","selection"]}},Lr=dr(Ir);function $(...e){return Lr(zt(e))}function _r({...e}){return n.jsx(ft,{"data-slot":"dropdown-menu",...e})}function Or({...e}){return n.jsx(ht,{"data-slot":"dropdown-menu-trigger",...e})}function Nr({className:e,sideOffset:t=4,...a}){return n.jsx(bt,{children:n.jsx(yt,{"data-slot":"dropdown-menu-content",sideOffset:t,className:$("z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",e),...a})})}function jr({className:e,inset:t,variant:a="default",...r}){return n.jsx(xt,{"data-slot":"dropdown-menu-item","data-inset":t,"data-variant":a,className:$("relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!",e),...r})}function Fr({className:e,inset:t,...a}){return n.jsx(vt,{"data-slot":"dropdown-menu-label","data-inset":t,className:$("px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",e),...a})}function da({className:e,...t}){return n.jsx(gt,{"data-slot":"dropdown-menu-separator",className:$("-mx-1 my-1 h-px bg-border",e),...t})}function ma({className:e,...t}){return n.jsx("span",{"data-slot":"dropdown-menu-shortcut",className:$("ml-auto text-xs tracking-widest text-muted-foreground",e),...t})}function Gr({delayDuration:e=0,...t}){return n.jsx(At,{"data-slot":"tooltip-provider",delayDuration:e,...t})}function ua({...e}){return n.jsx(wt,{"data-slot":"tooltip",...e})}function pa({...e}){return n.jsx(St,{"data-slot":"tooltip-trigger",...e})}function ga({className:e,sideOffset:t=0,children:a,...r}){return n.jsx(kt,{children:n.jsxs(Pt,{"data-slot":"tooltip-content",sideOffset:t,className:$("z-50 w-fit origin-(--radix-tooltip-content-transform-origin) animate-in rounded-md bg-foreground px-3 py-1.5 text-xs text-balance text-background fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",e),...r,children:[a,n.jsx(Ct,{className:"z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground"})]})})}const ot="nodeflow_app_theme",it=[{id:"auto",label:"Match system",swatch:["#0c1017","#f6f8fb"],dark:null},{id:"studio",label:"Studio Dark",swatch:["#0c1017","#5e8cfa"],dark:!0},{id:"light",label:"Light",swatch:["#f6f8fb","#2f5fd8"],dark:!1},{id:"midnight",label:"Midnight",swatch:["#070a16","#8493ff"],dark:!0},{id:"nord",label:"Nord",swatch:["#2e3440","#88c0d0"],dark:!0},{id:"contrast",label:"High contrast",swatch:["#000000","#ffd400"],dark:!0}],fa={studio:"dark",light:"default",midnight:"tokyo-night",nord:"nord",contrast:"dark"};function Ur(){try{const e=localStorage.getItem(ot);return it.some(t=>t.id===e)?e:"auto"}catch{return"auto"}}function Vr(e){var t;return e!=="auto"?e:(t=window.matchMedia)!=null&&t.call(window,"(prefers-color-scheme: light)").matches?"light":"studio"}function ge(e){const t=Vr(e),a=document.documentElement;return t==="studio"?a.removeAttribute("data-app-theme"):a.setAttribute("data-app-theme",t),t}function zr(e){try{localStorage.setItem(ot,e)}catch{}const t=ge(e);return window.dispatchEvent(new CustomEvent("nodeflow-theme",{detail:{id:e,resolved:t}})),t}function Br(){const[e,t]=v.useState(Ur);return v.useEffect(()=>{if(ge(e),e!=="auto")return;const a=window.matchMedia("(prefers-color-scheme: light)"),r=()=>ge("auto");return a.addEventListener("change",r),()=>a.removeEventListener("change",r)},[e]),n.jsxs(_r,{children:[n.jsx(Or,{asChild:!0,children:n.jsxs("button",{className:"btn-ghost !px-2.5 !py-2","aria-label":"Change colour theme",title:"Colour theme",children:[n.jsx(Dt,{className:"size-4"}),n.jsx("span",{className:"hidden 2xl:inline text-xs",children:"Theme"})]})}),n.jsxs(Nr,{align:"end",className:"w-52",children:[n.jsx(Fr,{children:"Colour theme"}),it.map(a=>n.jsx(jr,{onSelect:()=>{zr(a.id),t(a.id)},children:n.jsxs("span",{className:"flex w-full items-center gap-2.5",children:[n.jsx("span",{"aria-hidden":"true",className:"size-4 shrink-0 rounded-full border border-border",style:{background:`linear-gradient(135deg, ${a.swatch[0]} 50%, ${a.swatch[1]} 50%)`}}),n.jsx("span",{className:"flex-1",children:a.label}),e===a.id&&n.jsx(Et,{className:"size-3.5 text-primary"})]})},a.id))]})]})}const Oe=[{to:"/studio",label:"Studio"},{to:"/templates",label:"Templates"},{to:"/saved",label:"Projects"},{to:"/formats",label:"Formats & features"}];function Wr(){const[e,t]=v.useState(!1),[a,r]=v.useState(!1),i=Ve(),o=i.pathname.startsWith("/studio");return v.useEffect(()=>{t(!1),r(!1)},[i]),v.useEffect(()=>{const s=c=>{(c.metaKey||c.ctrlKey)&&c.key.toLowerCase()==="k"&&(c.preventDefault(),r(f=>!f)),c.key==="Escape"&&t(!1)};return window.addEventListener("keydown",s),()=>window.removeEventListener("keydown",s)},[]),n.jsxs(n.Fragment,{children:[n.jsx("a",{href:"#main-content",onClick:s=>{var c;s.preventDefault(),(c=document.getElementById("main-content"))==null||c.focus()},className:"skip-link",children:"Skip to content"}),n.jsxs("header",{className:"sticky top-0 z-40 border-b border-border bg-background ",children:[n.jsxs("div",{className:"mx-auto flex h-14 max-w-none items-center gap-3 px-4 sm:px-6",children:[n.jsxs(Y,{to:"/","aria-label":"NodeFlow home",className:"flex shrink-0 items-center gap-2.5",children:[n.jsx("span",{className:"brand-mark",children:n.jsx(Mt,{className:"size-5"})}),n.jsxs("span",{className:"leading-none",children:[n.jsxs("span",{className:"block text-base font-bold tracking-tight text-foreground",children:["Node",n.jsx("span",{className:"text-primary",children:"Flow"})]}),n.jsx("span",{className:"mt-1.5 block text-[10px] font-medium tracking-widest text-muted-foreground uppercase",children:"Visual studio"})]})]}),n.jsx("nav",{"aria-label":"Main navigation",className:"ml-6 hidden items-center gap-1 lg:flex",children:Oe.map(s=>n.jsx(Ae,{to:s.to,className:({isActive:c})=>`rounded-md px-3 py-2 text-[13px] font-medium transition ${c?"bg-accent text-accent-foreground":"text-muted-foreground hover:bg-accent hover:text-foreground"}`,children:s.label},s.to))}),n.jsxs("div",{className:"ml-auto flex items-center gap-2",children:[n.jsxs("button",{onClick:()=>r(!0),className:"btn-ghost !px-2.5 !py-2","aria-label":"Search diagrams and commands",title:"Search (⌘K / Ctrl+K)",children:[n.jsx(Ge,{className:"size-4"}),n.jsx("span",{className:"hidden xl:inline text-xs",children:"Search"}),n.jsx("kbd",{className:"hidden sm:inline text-[10px] text-muted-foreground",children:"⌘K"})]}),n.jsx(Br,{}),n.jsx("a",{href:"https://github.com/muhamadzolfaghari/node-flow",target:"_blank",rel:"noreferrer",className:"hidden rounded-md p-2 text-muted-foreground hover:text-foreground sm:block","aria-label":"View GitHub repository",children:n.jsx(Tt,{className:"size-4"})}),!o&&n.jsx("div",{className:"hidden sm:block",children:n.jsxs(Y,{to:"/studio",className:"btn-primary !py-2 !text-xs",children:["Open studio ",n.jsx(Rt,{className:"size-4"})]})}),n.jsx("button",{onClick:()=>t(!e),"aria-label":e?"Close navigation":"Open navigation","aria-expanded":e,"aria-controls":"mobile-navigation",className:"grid size-10 place-items-center rounded-md border border-border bg-secondary lg:hidden",children:e?n.jsx(Ue,{className:"size-4"}):n.jsx(It,{className:"size-4"})})]})]}),e&&n.jsx("nav",{id:"mobile-navigation","aria-label":"Mobile navigation",className:"border-t border-border px-4 py-3 lg:hidden",children:n.jsx("div",{className:"grid gap-1",children:[{to:"/",label:"Home"},...Oe].map(s=>n.jsx(Ae,{to:s.to,end:!0,className:({isActive:c})=>`rounded-md px-3 py-3 text-sm ${c?"bg-accent text-accent-foreground":"text-muted-foreground hover:bg-accent hover:text-foreground"}`,children:s.label},s.to))})})]}),n.jsx(Vt,{open:a,onClose:()=>r(!1)})]})}function qr(){return n.jsx("footer",{className:"border-t",children:n.jsxs("div",{className:"mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-7 sm:px-8",children:[n.jsxs("div",{children:[n.jsx("p",{className:"text-sm font-semibold tracking-tight",children:"NodeFlow"}),n.jsxs("p",{className:"mt-1 text-xs text-muted-foreground",children:["Crafted by"," ",n.jsx("a",{href:"https://github.com/muhamadzolfaghari",target:"_blank",rel:"noreferrer",className:"font-medium text-foreground underline decoration-primary/40 underline-offset-4 hover:decoration-primary transition-colors",children:"Mohammad Zolfaghari"})," ","· Open source under MIT license"]})]}),n.jsxs("nav",{"aria-label":"Footer navigation",className:"flex flex-wrap gap-5 text-xs text-muted-foreground",children:[n.jsx(Y,{className:"hover:text-foreground",to:"/studio",children:"Workspace"}),n.jsx(Y,{className:"hover:text-foreground",to:"/templates",children:"Templates"}),n.jsx(Y,{className:"hover:text-foreground",to:"/formats",children:"Format support"}),n.jsx("a",{className:"hover:text-foreground",href:"https://github.com/muhamadzolfaghari/node-flow",target:"_blank",rel:"noreferrer",children:"GitHub ↗"}),n.jsx("a",{className:"hover:text-foreground",href:"https://mermaid.js.org/intro/syntax-reference.html",target:"_blank",rel:"noreferrer",children:"Mermaid docs ↗"})]})]})})}const Hr=v.lazy(()=>h(()=>import("./Landing-BXm2z7gc.js"),__vite__mapDeps([0,1,2,3,4,5,6]))),Qr=v.lazy(()=>h(()=>import("./Studio-DfXo7aP0.js"),__vite__mapDeps([7,1,2,3,8,9,10,4,5,11]))),Kr=v.lazy(()=>h(()=>import("./Templates-sn_QDrE2.js"),__vite__mapDeps([12,1,2,3,11]))),$r=v.lazy(()=>h(()=>import("./Saved--TDJ4IAD.js"),__vite__mapDeps([13,1,2,3,5,9,10,11]))),Jr=v.lazy(()=>h(()=>import("./Compare-B4mevuQk.js"),__vite__mapDeps([14,1,2,3,6,11]))),Ne=v.lazy(()=>h(()=>import("./NotFound-8zZCk6f5.js"),__vite__mapDeps([15,1,2,3]))),Xr={"/":"Visual workspace for diagrams and systems","/studio":"Studio","/templates":"Templates","/saved":"Projects","/formats":"Formats & features"};function Yr(){const{pathname:e}=Ve();return v.useEffect(()=>{document.title=`NodeFlow — ${Xr[e]||"Page not found"}`,window.scrollTo({top:0,left:0,behavior:"instant"})},[e]),n.jsxs("div",{className:"min-h-full flex flex-col",children:[n.jsx(Wr,{}),n.jsx("main",{id:"main-content",tabIndex:-1,className:"flex-1",children:n.jsx(v.Suspense,{fallback:n.jsx("div",{role:"status",className:"grid min-h-[50vh] place-items-center text-sm text-muted-foreground",children:"Opening workspace…"}),children:n.jsx(Nt,{})})}),e!=="/studio"&&n.jsx(qr,{})]})}function Zr(){return n.jsx(Lt,{children:n.jsx(_t,{children:n.jsxs(_,{element:n.jsx(Yr,{}),children:[n.jsx(_,{index:!0,element:n.jsx(Hr,{})}),n.jsx(_,{path:"studio",element:n.jsx(Qr,{})}),n.jsx(_,{path:"templates",element:n.jsx(Kr,{})}),n.jsx(_,{path:"saved",element:n.jsx($r,{})}),n.jsx(_,{path:"formats",element:n.jsx(Jr,{})}),n.jsx(_,{path:"compare",element:n.jsx(Ot,{to:"/formats",replace:!0})}),n.jsx(_,{path:"404",element:n.jsx(Ne,{})}),n.jsx(_,{path:"*",element:n.jsx(Ne,{})})]})})})}const V=[{id:"mermaid",name:"Mermaid",ext:"mmd",extensions:["mmd","mermaid"],language:"diagram",mode:"Native",family:"Diagrams",description:"Flowcharts, ER, UML, mindmaps, Gantt, charts, and C4.",sample:`flowchart LR
  Client[Web client] --> API[API gateway]
  API --> Service[Order service]
  Service --> DB[(Database)]`},{id:"graphviz",name:"Graphviz DOT",ext:"dot",extensions:["dot","gv"],language:"diagram",mode:"Native",family:"Architecture",description:"Native Graphviz layout through WebAssembly.",sample:`digraph Architecture {
  rankdir=LR;
  node [shape=box, style=rounded];
  Client -> Gateway -> Service -> Database;
}`},{id:"plantuml",name:"PlantUML",ext:"puml",extensions:["puml","plantuml"],language:"diagram",mode:"Derived",family:"UML",description:"Sequence, class, state, activity, usecase, deployment subsets; styling and macros are not preserved.",sample:`@startuml
participant Client
participant API
Client -> API: Create order
API --> Client: Order confirmed
@enduml`},{id:"d2",name:"D2",ext:"d2",extensions:["d2"],language:"diagram",mode:"Derived",family:"Architecture",description:"Basic nodes, connections, and containers; layout and styling are approximate.",sample:`client: Web Client
api: API Gateway
db: Database
client -> api: Request
api -> db: Query`},{id:"sql",name:"SQL DDL",ext:"sql",extensions:["sql"],language:"sql",mode:"Derived",family:"Data",description:"CREATE TABLE columns and foreign keys to ER schemas; dialect-specific syntax may need simplification.",sample:`CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100)
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER REFERENCES users(id)
);`},{id:"dbml",name:"DBML",ext:"dbml",extensions:["dbml"],language:"sql",mode:"Derived",family:"Data",description:"DBML Table blocks and Ref lines to ER schemas.",sample:`Table users {
  id int [pk]
  name varchar
}
Table orders {
  id int [pk]
  user_id int [ref: > users.id]
}`},{id:"prisma",name:"Prisma schema",ext:"prisma",extensions:["prisma"],language:"diagram",mode:"Derived",family:"Data",description:"Prisma model blocks and relations to ER schemas.",sample:`model User {
  id String @id
  email String @unique
  orders Order[]
}
model Order {
  id String @id
  user User @relation(fields: [userId], references: [id])
  userId String
}`},{id:"protobuf",name:"Protobuf",ext:"proto",extensions:["proto"],language:"diagram",mode:"Derived",family:"Data",description:"Proto3 message/enum blocks to class diagrams.",sample:`syntax = "proto3";
message User {
  string id = 1;
  string email = 2;
}
message Order {
  string id = 1;
  User user = 2;
}`},{id:"jsonschema",name:"JSON Schema",ext:"schema.json",extensions:["schema.json"],language:"json",mode:"Derived",family:"Data",description:"JSON-Schema properties/$defs to class diagrams. Content-detected for *.json.",sample:'{"title":"User","type":"object","properties":{"id":{"type":"string"},"email":{"type":"string"}},"required":["id"]}'},{id:"graphql",name:"GraphQL SDL",ext:"graphql",extensions:["graphql","gql"],language:"diagram",mode:"Derived",family:"Data",description:"Types, fields, and relationships to a class diagram.",sample:`type User {
  id: ID!
  name: String!
  orders: [Order!]!
}
type Order {
  id: ID!
  user: User!
}`},{id:"openapi",name:"OpenAPI / Swagger",ext:"yaml",extensions:[],language:"yaml",mode:"Derived",family:"APIs",description:"JSON or YAML paths to a request sequence. Preview shows the first 10 paths.",sample:`openapi: 3.0.3
info:
  title: Orders API
  version: 1.0.0
paths:
  /orders:
    get:
      summary: List orders
      responses:
        "200":
          description: Order list`},{id:"asyncapi",name:"AsyncAPI",ext:"yaml",extensions:[],language:"yaml",mode:"Derived",family:"APIs",description:"JSON or YAML v2/v3 channels to event sequences. Preview shows the first 12 channels.",sample:`asyncapi: 2.6.0
info:
  title: Orders events
  version: 1.0.0
channels:
  orders.created:
    publish:
      message:
        name: OrderCreated`},{id:"yaml",name:"YAML structure",ext:"yaml",extensions:["yaml","yml"],language:"yaml",mode:"Derived",family:"Data",description:"Generic YAML mappings (Kubernetes, Compose) to mindmaps. Spec files auto-detect as OpenAPI/AsyncAPI.",sample:`apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  log_level: info`},{id:"erd",name:"ERD text",ext:"erd",extensions:["erd"],language:"diagram",mode:"Derived",family:"Data",description:"Crow's-foot text (||--o{) and TABLE blocks to ER diagrams.",sample:`USERS ||--o{ ORDERS : places
USERS {
  string id
}
ORDERS {
  string id
  string user_id
}`},{id:"xmi",name:"UML XMI",ext:"xmi",extensions:["xmi","uml"],language:"xml",mode:"Derived",family:"UML",description:"UML2 XMI classes/generalizations/associations and lifelines/messages to class/sequence.",sample:`<xmi:XMI xmlns:xmi="http://www.omg.org/XMI" xmlns:uml="http://www.omg.org/spec/UML/20131001">
  <uml:Class xmi:id="c1" name="User"/>
  <uml:Class xmi:id="c2" name="Order"/>
</xmi:XMI>`},{id:"sysml",name:"SysML v2",ext:"sysml",extensions:["sysml"],language:"diagram",mode:"Derived",family:"UML",description:"SysML v2 part/requirement/action declarations to block/requirement flowcharts.",sample:`part Vehicle
requirement Range
part Battery : Vehicle
action Drive`},{id:"archimate",name:"ArchiMate Exchange",ext:"xml",extensions:[],language:"xml",mode:"Derived",family:"Architecture",description:"ArchiMate Open Exchange elements/relationships to flowcharts. Content-detected for *.xml.",sample:'<model xmlns="http://www.opengroup.org/xsd/archimate/3"><elements><element identifier="a1" name="Customer" xsi:type="BusinessActor"/></elements></model>'},{id:"dmn",name:"DMN",ext:"dmn",extensions:["dmn"],language:"xml",mode:"Derived",family:"Processes",description:"DMN decision tables (XML or when/then text) to flowcharts.",sample:'<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"><decision id="d1" name="Approve loan"/></definitions>'},{id:"drawio",name:"Draw.io",ext:"drawio",extensions:["drawio"],language:"xml",mode:"Derived",family:"Diagrams",description:"Compressed or plain XML nodes and edges; first page preview, approximate shapes and layout.",sample:`<mxGraphModel><root>
  <mxCell id="0"/><mxCell id="1" parent="0"/>
  <mxCell id="a" value="Client" vertex="1" parent="1"/>
  <mxCell id="b" value="Service" vertex="1" parent="1"/>
  <mxCell id="e" edge="1" source="a" target="b" parent="1"/>
</root></mxGraphModel>`},{id:"bpmn",name:"BPMN 2.0",ext:"bpmn",extensions:["bpmn"],language:"xml",mode:"Derived",family:"Processes",description:"Tasks, events, gateways, lanes, data objects, message flows; no BPMN execution semantics.",sample:`<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL">
  <process id="orders">
    <startEvent id="start" name="Order received"/>
    <task id="check" name="Check inventory"/>
    <endEvent id="end" name="Confirmed"/>
    <sequenceFlow id="f1" sourceRef="start" targetRef="check"/>
    <sequenceFlow id="f2" sourceRef="check" targetRef="end"/>
  </process>
</definitions>`},{id:"c4",name:"C4 / Structurizr DSL",ext:"dsl",extensions:["dsl","c4"],language:"diagram",mode:"Derived",family:"Architecture",description:"People, systems, containers, components, code and dynamic views to C4 context.",sample:`workspace {
  model {
    customer = person "Customer"
    shop = softwareSystem "Online store"
    customer -> shop "Places orders"
  }
}`},{id:"terraform",name:"Terraform HCL",ext:"tf",extensions:["tf"],language:"diagram",mode:"Derived",family:"Architecture",description:"Resources and direct references; modules, dynamic blocks, and evaluated values are not resolved.",sample:`resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}
resource "aws_subnet" "app" {
  vpc_id = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
}`},{id:"markdown",name:"Markdown outline",ext:"md",extensions:["md","markdown","txt"],language:"markdown",mode:"Derived",family:"Mindmaps",description:"Indented lists to a mindmap. Embedded Mermaid fences can be rendered.",sample:`- Product strategy
  - Discovery
    - Interviews
    - Research
  - Delivery
    - Build
    - Test`},{id:"csv",name:"CSV relationships",ext:"csv",extensions:["csv","tsv"],language:"diagram",mode:"Derived",family:"Data",description:"Source,target rows (CSV/TSV/semicolon/pipe) to a relationship graph.",sample:`source,target,label
Client,Gateway,Request
Gateway,Service,Route
Service,Database,Query`},{id:"freemind",name:"FreeMind",ext:"mm",extensions:["mm"],language:"xml",mode:"Derived",family:"Mindmaps",description:"Topic hierarchy to a mindmap; styling and metadata remain in the original XML.",sample:`<map version="1.0.1">
  <node TEXT="Product">
    <node TEXT="Discovery"/>
    <node TEXT="Delivery"/>
  </node>
</map>`},{id:"opml",name:"OPML",ext:"opml",extensions:["opml"],language:"xml",mode:"Derived",family:"Mindmaps",description:"Outline hierarchy to a mindmap.",sample:`<opml version="2.0"><body>
  <outline text="Product">
    <outline text="Discovery"/>
    <outline text="Delivery"/>
  </outline>
</body></opml>`},{id:"xmind",name:"XMind",ext:"xmind",extensions:["xmind"],language:"diagram",mode:"Mindmap",family:"Mindmaps",description:"First sheet of ZEN or legacy workbooks to an editable Mermaid mindmap; original workbook retained, fresh workbook export supported.",sample:`mindmap
  root((Product))
    Discovery
      Research
    Delivery
      Build
      Test`},{id:"visio",name:"Visio VDX",ext:"vdx",extensions:["vdx"],language:"xml",mode:"Derived",family:"Diagrams",description:"Visio VDX Shape/Connect elements to flowcharts.",sample:'<VisioDocument><Pages><Page><Shapes><Shape ID="1" Name="Start"><Text>Start</Text></Shape><Shape ID="2" Name="Task"><Text>Review</Text></Shape></Shapes><Connects><Connect FromSheet="1" ToSheet="2"/></Connects></Page></Pages></VisioDocument>'},{id:"gliffy",name:"Gliffy JSON",ext:"gliffy",extensions:["gliffy"],language:"json",mode:"Derived",family:"Diagrams",description:"Gliffy stage objects/constraints to flowcharts. Content-detected for *.json.",sample:'{"stage":{"objects":[{"id":0,"text":"Start"},{"id":1,"text":"Review"}]}}'},{id:"excalidraw",name:"Excalidraw JSON",ext:"excalidraw",extensions:["excalidraw"],language:"json",mode:"Derived",family:"Diagrams",description:"Excalidraw elements (shapes/arrows) to flowcharts. Content-detected for *.json.",sample:'{"type":"excalidraw","elements":[{"type":"rectangle","id":"a","x":0,"y":0,"width":100,"height":50},{"type":"rectangle","id":"b","x":200,"y":0,"width":100,"height":50}]}'},{id:"code",name:"Source code → UML",ext:"ts",extensions:["ts","tsx","js","jsx","py","java","cs","go","rs","kt","kts","swift","php","rb","cpp","c","h"],language:"javascript",mode:"Derived",family:"UML",description:"Best-effort class/struct/enum extraction incl. Kotlin/Swift/PHP/Ruby/C++. Not a code execution environment.",sample:`class User {
  id: string;
  name: string;
}
class Admin extends User {
  permissions: string[];
}`},{id:"staruml",name:"StarUML",ext:"mdj",extensions:["mdj"],language:"json",mode:"Derived",family:"UML",description:"StarUML model JSON (.mdj) containing UMLClass, UMLAttribute, UMLOperation, and UMLGeneralization.",sample:`{
  "_type": "Project",
  "name": "AppModel",
  "ownedElements": [
    {
      "_type": "UMLClass",
      "_id": "c1",
      "name": "User",
      "attributes": [
        { "name": "id", "type": "string", "visibility": "private" }
      ],
      "operations": [
        { "name": "login", "parameters": [{ "direction": "return", "type": "boolean" }] }
      ]
    }
  ]
}`},{id:"lucid",name:"Lucidchart",ext:"lucid",extensions:["lucid","lucidchart"],language:"json",mode:"Derived",family:"Whiteboard",description:"Lucidchart CSV or JSON export converted to Mermaid flowchart nodes and connections.",sample:`{
  "pages": [
    {
      "shapes": [
        { "id": "1", "text": "Client App" },
        { "id": "2", "text": "API Server" }
      ],
      "lines": [
        { "from": "1", "to": "2", "text": "HTTP GET" }
      ]
    }
  ]
}`},{id:"illustrator",name:"Adobe Illustrator",ext:"ai",extensions:["ai","ait"],language:"diagram",mode:"Derived",family:"Design & Vector",description:"Adobe Illustrator artboards, vector layers, labeled groups, and path objects converted to structured visual diagrams.",sample:`Artboard "Architecture Overview"
  Layer "Frontend App" [rect]
  Layer "API Gateway" [rounded]
  Layer "Microservices" [box]
  Layer "Database" [cylinder]
  "Frontend App" -> "API Gateway" : HTTPS
  "API Gateway" -> "Microservices" : gRPC
  "Microservices" -> "Database" : SQL`},{id:"figma",name:"Figma / FigJam",ext:"fig",extensions:["fig","figjam"],language:"json",mode:"Derived",family:"Whiteboard",description:"Figma frames, component nodes, FigJam sticky notes, shapes, and connector lines converted to Mermaid flowchart.",sample:`{
  "document": {
    "children": [
      { "id": "1", "name": "UI Components", "type": "FRAME" },
      { "id": "2", "name": "Backend Services", "type": "FRAME" },
      { "id": "3", "type": "CONNECTOR", "connectorStart": { "endpointNodeId": "1" }, "connectorEnd": { "endpointNodeId": "2" }, "characters": "API" }
    ]
  }
}`},{id:"omnigraffle",name:"OmniGraffle",ext:"graffle",extensions:["graffle"],language:"xml",mode:"Derived",family:"Diagrams",description:"OmniGraffle graphics, shape sheets, and line connections converted to Mermaid flowchart.",sample:`<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0"><dict><key>GraphicsList</key><array><dict><key>ID</key><integer>1</integer><key>Text</key><dict><key>Text</key><string>Client</string></dict></dict><dict><key>ID</key><integer>2</integer><key>Text</key><dict><key>Text</key><string>Server</string></dict></dict><dict><key>Class</key><string>LineGraphic</string><key>Head</key><dict><key>ID</key><integer>2</integer></dict><key>Tail</key><dict><key>ID</key><integer>1</integer></dict></dict></array></dict></plist>`},{id:"miro",name:"Miro",ext:"miro",extensions:["miro"],language:"json",mode:"Derived",family:"Whiteboard",description:"Miro board items, sticky notes, cards, shapes, and connector lines converted to Mermaid flowchart.",sample:`{
  "items": [
    { "id": "1", "type": "sticky_note", "data": { "content": "Sprint Goal" } },
    { "id": "2", "type": "card", "data": { "title": "Architecture Refactoring" } },
    { "id": "3", "type": "connector", "startItem": { "id": "1" }, "endItem": { "id": "2" }, "caption": "Drives" }
  ]
}`},{id:"geojson",name:"GeoJSON / Geospatial (MVT, Shapefile, Protobuf)",ext:"geojson",extensions:["geojson","geo.json","mvt","pbf","shp","dbf","kml","topojson"],language:"json",mode:"Derived",family:"Geospatial & Maps",description:"GeoJSON FeatureCollections, Mapbox Vector Tile (MVT) Protobuf schemas, ESRI Shapefile attributes, and spatial topologies converted to visual diagrams.",sample:`{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "name": "Logistics Hub", "layer": "Distribution" },
      "geometry": { "type": "Point", "coordinates": [-122.4, 37.7] }
    },
    {
      "type": "Feature",
      "properties": { "name": "Retail Store", "layer": "Fulfillment", "connectsTo": "Logistics Hub", "routeType": "Fleet Truck" },
      "geometry": { "type": "Point", "coordinates": [-122.2, 37.8] }
    }
  ]
}`}],Q=e=>V.find(t=>t.id===e)||V[0],ea=[...new Set(V.flatMap(e=>e.extensions).concat(["json","yaml","yml","xml","atlas","svg"]))].map(e=>`.${e}`).join(",");function nt(e="",t=""){const r=e.toLowerCase().split(".").pop(),i=V.find(o=>o.extensions.includes(r)&&o.id!=="markdown");if(i&&!["openapi","asyncapi","archimate"].includes(i.id)&&!["yaml","jsonschema","gliffy","excalidraw","csv"].includes(i.id))return i.id;if(/^\s*(strict\s+)?(di)?graph\s*[^\n]*\{/i.test(t))return"graphviz";if(/^\s*(?:---[\s\S]*?---\s*)?(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|mindmap|gantt|pie|xychart|C4|gitGraph|journey|timeline|sankey|quadrantChart|kanban|block|requirementDiagram|packet|architecture)\b/m.test(t))return"mermaid";if(/(?:"openapi"|"swagger")\s*:|^\s*(openapi|swagger)\s*:/m.test(t))return"openapi";if(/"asyncapi"\s*:|^\s*asyncapi\s*:/m.test(t))return"asyncapi";if(/<mxfile\b|<mxGraphModel\b/.test(t))return"drawio";if(/<(?:\w+:)?definitions\b[^>]*BPMN|<bpmn:(?:definitions|process)\b/i.test(t))return"bpmn";if(/<definitions\b[^>]*DMN|<decision\b[^>]*name=/i.test(t)&&/DMN/i.test(t))return"dmn";if(/<opml\b/.test(t))return"opml";if(/<map\b/.test(t))return"freemind";if(/<xmi:XMI|xmlns:uml/i.test(t))return"xmi";if(/xsi:type="[^"]*(Business|Application|Technology|Motivation)/i.test(t)||/archimate/i.test(t))return"archimate";if(/<VisioDocument|<Shape\b[^>]*ID=/i.test(t))return"visio";if(/^\s*@startuml/m.test(t))return"plantuml";if(/^\s*Table\s+\w+\s*\{/m.test(t)&&/Ref\s*:/i.test(t))return"dbml";if(/^\s*model\s+\w+\s*\{/m.test(t)&&/@id|@relation/i.test(t))return"prisma";if(/^\s*syntax\s*=\s*"proto3"|^\s*message\s+\w+\s*\{/m.test(t))return"protobuf";if(/CREATE\s+TABLE/i.test(t))return"sql";if(/^\s*Table\s+\w+\s*\{/m.test(t))return"dbml";if(/^\s*(part|requirement|action)\s+\w+/m.test(t))return"sysml";if(/\|\|--o\{/.test(t))return"erd";if(/"elements"\s*:\s*\[|"type"\s*:\s*"excalidraw"|"type"\s*:\s*"rectangle"/.test(t))return"excalidraw";if(/"stage"\s*:\s*\{|"objects"\s*:\s*\[/.test(t))return"gliffy";if(/^\s*\{/.test(t)&&/"(properties|definitions|\$defs)"\s*:/.test(t))return"jsonschema";if(/"_type"\s*:\s*"Project"|"_type"\s*:\s*"UMLClass"/.test(t))return"staruml";if(/(?:Shape Library|Text Area 1|Line Source).*Line Destination/i.test(t)||/"pages"\s*:\s*\[|"shapes"\s*:\s*\[|"lines"\s*:\s*\[/.test(t)&&!/"elements"/.test(t))return"lucid";if(/(?:xmlns:i="http:\/\/ns\.adobe\.com\/AdobeIllustrator|<i:pgf\b|Artboard\s+["']|%AI5_BeginLayer)/i.test(t))return"illustrator";if(/(?:"document"\s*:\s*\{[^}]*"children"|"connectorStart"\s*:|"type"\s*:\s*"(?:FRAME|COMPONENT|STICKY)")/i.test(t))return"figma";if(/<plist\b[^>]*>[\s\S]*<key>GraphicsList<\/key>/i.test(t)||/OmniGraffle/i.test(t))return"omnigraffle";if(/\btype\s+\w+\s*\{[^}]*:/.test(t)&&/:\s*(String|ID|Int|Float|Boolean)/.test(t))return"graphql";if(["geojson","geo.json","mvt","pbf","shp","dbf","kml","topojson"].includes(r)||/"FeatureCollection"|"coordinates"\s*:|vector_tile|Topology|"objects"\s*:\s*\{|map_layer|shapefile/i.test(t))return"geojson";if(["md","markdown","txt"].includes(r))return"markdown";if(["yaml","yml"].includes(r)&&/^\s*[\w./-]+\s*:/m.test(t))return"yaml";if(i)return i.id;throw new Error(`Cannot identify ${e||"this source"}. Choose a format in the file inspector.`)}async function je(e){const{parse:t}=await h(async()=>{const{parse:r}=await import("./index-Des5vOtj.js");return{parse:r}},[]),a=t(e);if(!a||typeof a!="object"||Array.isArray(a))throw new Error("Expected a JSON or YAML specification object.");return JSON.stringify(a)}async function ta(e){const t=new DOMParser().parseFromString(e,"application/xml");if(t.querySelector("parsererror"))throw new Error("Invalid Draw.io XML. Check closing tags and attributes.");const a=[...t.querySelectorAll("diagram")];if(!a.length)return e;for(const r of a){const i=r.querySelector("mxGraphModel");if(i)return new XMLSerializer().serializeToString(i);const o=(r.textContent||"").trim();if(o.startsWith("<"))return o;if(o.length>8){const{inflateSync:s,strFromU8:c}=await h(async()=>{const{inflateSync:f,strFromU8:u}=await import("./browser-BBwbzHgn.js");return{inflateSync:f,strFromU8:u}},[]);try{const f=Uint8Array.from(atob(o),u=>u.charCodeAt(0));return decodeURIComponent(c(s(f)))}catch{continue}}}throw new Error("Unable to decode the first Draw.io page. Export an uncompressed XML file and retry.")}async function ra(e){const{format:t,source:a}=e;if(!a.trim())return{code:"",warnings:[]};let r;switch(t){case"mermaid":case"graphviz":case"xmind":r=a;break;case"plantuml":r=(await h(()=>import("./plantuml-Vij82pFC.js"),[])).parsePlantUmlToMermaid(a);break;case"d2":r=(await h(async()=>{const{parseD2ToMermaid:o}=await import("./d2-qiCFu5z0.js");return{parseD2ToMermaid:o}},[])).parseD2ToMermaid(a);break;case"sql":r=(await h(()=>import("./sql-ddl-tAzTLQCm.js"),[])).parseSqlDdlToMermaid(a);break;case"dbml":r=(await h(async()=>{const{parseDbmlToMermaid:o}=await import("./dbml-CmtaC2N2.js");return{parseDbmlToMermaid:o}},[])).parseDbmlToMermaid(a);break;case"prisma":r=(await h(async()=>{const{parsePrismaToMermaid:o}=await import("./prisma-BS4HnDce.js");return{parsePrismaToMermaid:o}},[])).parsePrismaToMermaid(a);break;case"protobuf":r=(await h(async()=>{const{parseProtoToMermaid:o}=await import("./protobuf-rHFP9n9x.js");return{parseProtoToMermaid:o}},[])).parseProtoToMermaid(a);break;case"jsonschema":r=(await h(async()=>{const{parseJsonSchemaToMermaid:o}=await import("./json-schema-AnNiTtLr.js");return{parseJsonSchemaToMermaid:o}},[])).parseJsonSchemaToMermaid(a);break;case"graphql":r=(await h(()=>import("./graphql-C5pVqCQt.js"),[])).parseGraphQLToMermaid(a);break;case"openapi":r=(await h(()=>import("./openapi-Cd7p4xSX.js"),[])).parseOpenApiToMermaid(await je(a));break;case"asyncapi":r=(await h(()=>import("./asyncapi-62IuuApo.js"),[])).parseAsyncApiToMermaid(await je(a));break;case"yaml":r=(await h(async()=>{const{parseYamlGenericToMermaid:o}=await import("./yaml-generic-_sEckDfR.js");return{parseYamlGenericToMermaid:o}},[])).parseYamlGenericToMermaid(a);break;case"erd":r=(await h(async()=>{const{parseErdTextToMermaid:o}=await import("./yaml-generic-_sEckDfR.js");return{parseErdTextToMermaid:o}},[])).parseErdTextToMermaid(a);break;case"xmi":r=(await h(async()=>{const{parseXmiToMermaid:o}=await import("./xmi-JdpwOv29.js");return{parseXmiToMermaid:o}},[])).parseXmiToMermaid(a);break;case"sysml":r=(await h(async()=>{const{parseSysmlToMermaid:o}=await import("./sysml-Dqk0FUZ8.js");return{parseSysmlToMermaid:o}},[])).parseSysmlToMermaid(a);break;case"archimate":r=(await h(async()=>{const{parseArchiMateToMermaid:o}=await import("./archimate-B9oW6FYi.js");return{parseArchiMateToMermaid:o}},[])).parseArchiMateToMermaid(a);break;case"dmn":r=(await h(async()=>{const{parseDmnToMermaid:o}=await import("./dmn-CLloOl_m.js");return{parseDmnToMermaid:o}},[])).parseDmnToMermaid(a);break;case"drawio":r=(await h(()=>import("./drawio-CD1V60J2.js"),[])).parseDrawioToMermaid(await ta(a));break;case"bpmn":r=(await h(async()=>{const{parseBpmnToMermaid:o}=await import("./bpmn-hl72zuFB.js");return{parseBpmnToMermaid:o}},[])).parseBpmnToMermaid(a);break;case"c4":r=(await h(async()=>{const{parseC4DslToMermaid:o}=await import("./c4-dsl-tU6XMrhE.js");return{parseC4DslToMermaid:o}},[])).parseC4DslToMermaid(a);break;case"terraform":r=(await h(()=>import("./terraform-C5omdlnR.js"),[])).parseTerraformToMermaid(a);break;case"markdown":{const o=a.match(/```mermaid\s*\n([\s\S]*?)```/i);r=o?o[1]:(await h(async()=>{const{parseOutline:s}=await import("./markdown-outline-Mv1rbcQq.js");return{parseOutline:s}},__vite__mapDeps([16,17,18,1,2]))).parseOutline(a,"mindmap");break}case"csv":r=(await h(()=>import("./csv-table-dwzudCtm.js"),[])).parseCsvToMermaid(a);break;case"visio":r=(await h(async()=>{const{parseVisioToMermaid:o}=await import("./visio-excalidraw-AofCeIpt.js");return{parseVisioToMermaid:o}},[])).parseVisioToMermaid(a);break;case"gliffy":r=(await h(async()=>{const{parseGliffyToMermaid:o}=await import("./visio-excalidraw-AofCeIpt.js");return{parseGliffyToMermaid:o}},[])).parseGliffyToMermaid(a);break;case"excalidraw":r=(await h(async()=>{const{parseExcalidrawToMermaid:o}=await import("./visio-excalidraw-AofCeIpt.js");return{parseExcalidrawToMermaid:o}},[])).parseExcalidrawToMermaid(a);break;case"freemind":case"opml":r=(await h(()=>import("./freemind-CSf8BFGj.js"),[])).parseFreeMindOrOpmlToMermaid(a);break;case"code":r=(await h(()=>import("./code-to-uml-CBehhWfh.js"),[])).parseCodeToClassDiagram(a);break;case"staruml":r=(await h(()=>import("./staruml-xQEp9c28.js"),[])).parseStarUmlToMermaid(a);break;case"lucid":r=(await h(()=>import("./lucidchart-CpoacBRh.js"),[])).parseLucidchartToMermaid(a);break;case"illustrator":r=(await h(()=>import("./illustrator-C8khu8Zn.js"),[])).parseIllustratorToMermaid(a);break;case"figma":r=(await h(()=>import("./figma-BZEhc9o_.js"),[])).parseFigmaToMermaid(a);break;case"omnigraffle":r=(await h(()=>import("./omnigraffle-CC2hDX-B.js"),[])).parseOmniGraffleToMermaid(a);break;case"miro":r=(await h(()=>import("./miro-BcbxDLLG.js"),[])).parseMiroToMermaid(a);break;case"geojson":r=(await h(()=>import("./geojson-o0Qx9sUn.js"),[])).parseGeoJsonToMermaid(a);break;default:throw new Error(`Unsupported format: ${t}`)}if(!r||r.trim().split(`
`).length<2)throw new Error(`No diagram elements found in ${Q(t).name}. Check the supported syntax.`);const i=Q(t).mode==="Derived";return{code:r,warnings:i?[Q(t).description+" Your original source stays editable."]:[]}}async function aa(e){var a;if(e.size>15*1024*1024)throw new Error(`${e.name} exceeds the 15 MB per-file limit.`);if(e.name.toLowerCase().endsWith(".xmind")){const r=await e.arrayBuffer(),{parseXmindToMermaid:i}=await h(async()=>{const{parseXmindToMermaid:f}=await import("./xmind-DRffFpmD.js");return{parseXmindToMermaid:f}},__vite__mapDeps([17,18,1,2])),o=await i(r),s=new Uint8Array(r);let c="";for(let f=0;f<s.length;f+=8192)c+=String.fromCharCode(...s.subarray(f,f+8192));return{name:e.name,source:o.mermaidCode,format:"xmind",original:{name:e.name,base64:btoa(c)}}}if(e.name.toLowerCase().endsWith(".svg")){const r=await e.text(),{extractSourceFromSvg:i}=await h(async()=>{const{extractSourceFromSvg:c}=await import("./svg-metadata-DemCTHvq.js");return{extractSourceFromSvg:c}},[]),o=i(r);if(!o)throw new Error(`${e.name} does not contain embedded NodeFlow or Mermaid source metadata. Check that the SVG was exported with source metadata, or import a diagram source file.`);const s=((a=Q(o.format))==null?void 0:a.ext)||"mmd";return{name:e.name.replace(/\.svg$/i,`.${s}`),source:o.source,format:o.format}}if(/\.(mvt|pbf|shp|dbf)$/i.test(e.name)){const r=await e.arrayBuffer(),{parseGeoJsonToMermaid:i}=await h(async()=>{const{parseGeoJsonToMermaid:s}=await import("./geojson-o0Qx9sUn.js");return{parseGeoJsonToMermaid:s}},[]),o=i(r,e.name);return{name:e.name,source:o,format:"geojson"}}const t=await e.text();return{name:e.webkitRelativePath||e.name,source:t,format:nt(e.name,t)}}const ha=Object.freeze(Object.defineProperty({__proto__:null,FILE_ACCEPT:ea,FORMATS:V,compileDocument:ra,detectFormat:nt,getFormat:Q,importDocument:aa},Symbol.toStringTag,{value:"Module"})),st="diagramatlas_workspace_v1",K=()=>{var e,t;return((t=(e=globalThis.crypto)==null?void 0:e.randomUUID)==null?void 0:t.call(e))||`atlas_${Date.now()}_${Math.random().toString(36).slice(2)}`};function be(e="mermaid",t,a){const r=Q(e);return{id:K(),name:t||`untitled.${r.ext}`,format:e,source:a??r.sample,updatedAt:new Date().toISOString()}}function oa(e="Untitled project",t=[be()]){var a;return{id:K(),name:e,documents:t,openIds:t.map(r=>r.id),activeId:((a=t[0])==null?void 0:a.id)||null,snapshots:[],updatedAt:new Date().toISOString()}}function ct(e){if(!e||typeof e.name!="string"||!Array.isArray(e.documents)||!e.documents.length||e.documents.length>100)throw new Error("A project must have a name and between 1 and 100 files.");const t=new Set,a=e.documents.map(r=>{if(!r||typeof r.name!="string"||typeof r.source!="string"||!V.some(s=>s.id===r.format))throw new Error("A project contains an invalid file or an unsupported format.");if(r.source.length>15*1024*1024)throw new Error("A project file exceeds 15 MB.");let i=typeof r.id=="string"?r.id:K();t.has(i)&&(i=K()),t.add(i);const o=r.original&&typeof r.original.name=="string"&&typeof r.original.base64=="string"?{name:r.original.name,base64:r.original.base64}:void 0;return{id:i,name:r.name,format:r.format,source:r.source,updatedAt:r.updatedAt||new Date().toISOString(),...o&&{original:o}}});return{id:typeof e.id=="string"?e.id:K(),name:e.name,documents:a,openIds:(Array.isArray(e.openIds)?e.openIds:a.map(r=>r.id)).filter(r=>t.has(r)),activeId:t.has(e.activeId)?e.activeId:a[0].id,snapshots:Array.isArray(e.snapshots)?e.snapshots.filter(r=>r&&typeof r.source=="string"&&r.source.length<=15*1024*1024&&typeof r.name=="string"&&V.some(i=>i.id===r.format)).slice(0,30):[],updatedAt:e.updatedAt||new Date().toISOString()}}function ia(e=localStorage){try{const r=JSON.parse(e.getItem(st)||"null");if((r==null?void 0:r.version)===1&&Array.isArray(r.projects)&&r.projects.length){const i=r.projects.map(ct);return{version:1,projects:i,activeProjectId:i.some(o=>o.id===r.activeProjectId)?r.activeProjectId:i[0].id}}}catch{}let t=null;try{t=e.getItem("nodeflow_draft_v1")}catch{}const a=oa("My first project",[be("mermaid","architecture.mmd",t||void 0)]);return{version:1,projects:[a],activeProjectId:a.id}}function Fe(e,t=localStorage){t.setItem(st,JSON.stringify(e))}function na(e,t){let a=t,r=2;const i=t.lastIndexOf("."),o=i>0?t.slice(0,i):t,s=i>0?t.slice(i):"";for(;e.documents.some(c=>c.name===a);)a=`${o}-${r++}${s}`;return a}function ba(e,t){const a={...e,documents:[...e.documents],openIds:[...e.openIds]};for(const r of t){const i={...be(r.format,r.name,r.source),...r,id:K(),name:na(a,r.name)};a.documents.push(i),a.openIds.push(i.id),a.activeId=i.id}return{...a,updatedAt:new Date().toISOString()}}function ya(e){return JSON.stringify({app:"NodeFlow",version:1,project:e},null,2)}function va(e){const t=JSON.parse(e);if(t.app!=="NodeFlow"&&t.app!=="DiagramAtlas"||t.version!==1)throw new Error("This is not a supported NodeFlow project backup.");return ct(t.project)}const lt=v.createContext(null);function sa({children:e}){var x;const[t,a]=v.useState(ia),[r,i]=v.useState("Saved locally"),o=v.useRef(t);o.current=t,v.useEffect(()=>{const l=()=>{try{Fe(o.current)}catch{}};return window.addEventListener("pagehide",l),()=>{l(),window.removeEventListener("pagehide",l)}},[]),v.useEffect(()=>{i("Saving…");const l=setTimeout(()=>{try{Fe(t),i("Saved locally")}catch{i("Storage full · download a project backup")}},500);return()=>clearTimeout(l)},[t]);const s=t.projects.some(l=>l.id===t.activeProjectId)?t.activeProjectId:(x=t.projects[0])==null?void 0:x.id,c=t.projects.find(l=>l.id===s)||t.projects[0],f=l=>a(b=>{var w;const S=b.projects.some(k=>k.id===b.activeProjectId)?b.activeProjectId:(c==null?void 0:c.id)||((w=b.projects[0])==null?void 0:w.id);return{...b,activeProjectId:S,projects:b.projects.map(k=>k.id===S?{...typeof l=="function"?l(k):{...k,...l},updatedAt:new Date().toISOString()}:k)}}),u=l=>a(b=>({...b,activeProjectId:l.id,projects:[l,...b.projects]}));return n.jsx(lt,{value:{workspace:t,project:c,saveStatus:r,updateProject:f,addProject:u,setWorkspace:a},children:e})}function xa(e){const t=v.use(lt);if(!t)throw new Error("WorkspaceProvider is required.");return v.useEffect(()=>{e&&t.setWorkspace(a=>a.projects.some(r=>r.id===e)&&a.activeProjectId!==e?{...a,activeProjectId:e}:a)},[e]),t}ze.preload("https://fonts.googleapis.com",{as:"style"});ze.preload("https://fonts.gstatic.com",{as:"font",crossOrigin:"anonymous"});jt.createRoot(document.getElementById("root")).render(n.jsx(Ft.StrictMode,{children:n.jsx(sa,{children:n.jsx(Gr,{children:n.jsx(Zr,{})})})}));export{Ee as D,V as F,ua as T,h as _,fa as a,ra as b,$ as c,oa as d,K as e,_r as f,Ur as g,Or as h,Nr as i,jr as j,zt as k,Q as l,pa as m,ga as n,ea as o,va as p,ma as q,Vr as r,ya as s,da as t,xa as u,Fr as v,be as w,ba as x,aa as y,ha as z};
