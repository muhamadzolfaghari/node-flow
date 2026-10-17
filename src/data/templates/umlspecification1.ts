// UML Specification templates (part 1 of 3).
// Combined registry and lookup live in src/components/templates.js.
export const TEMPLATES = [
  {
    id: "class-diagram",
    title: "1. Class Diagram (UML Structure)",
    category: "UML Specification",
    kind: "class",
    description: "Object-oriented class hierarchies, private/public attributes, methods, inheritance, and composition.",
    code: `classDiagram
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
`,
  },
  {
    id: "sequence-auth",
    title: "2. Sequence Diagram (UML Interaction)",
    category: "UML Specification",
    kind: "sequence",
    description: "Interactive message sequence with parallel activations, alt guards, and cryptographic token verification.",
    code: `sequenceDiagram
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
`,
  },
  {
    id: "state-diagram",
    title: "3. State Machine Diagram (UML Behavior)",
    category: "UML Specification",
    kind: "state",
    description: "UML finite state machine with composite states, fork transitions, and error recovery lifecycles.",
    code: `stateDiagram-v2
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
`,
  },
  {
    id: "uml-usecase",
    title: "4. Use Case Diagram (UML Behavior)",
    category: "UML Specification",
    kind: "flowchart",
    description: "Actors, system boundaries, use case ovals, <<include>> dependencies, and <<extend>> extensions.",
    code: `flowchart LR
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
`,
  },
  {
    id: "uml-activity",
    title: "5. Activity Diagram (UML Behavior)",
    category: "UML Specification",
    kind: "flowchart",
    description: "Initial node, decision diamonds, parallel fork & join synchronization bars, and activity final states.",
    code: `flowchart TD
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
`,
  },
  {
    id: "uml-component",
    title: "6. Component Diagram (UML Structure)",
    category: "UML Specification",
    kind: "flowchart",
    description: "Component stereotypes, provided and required interfaces, ports, and inter-service dependencies.",
    code: `flowchart TD
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
`,
  },
];
