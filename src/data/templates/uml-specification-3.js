// UML Specification templates (part 3 of 3).
// Combined registry and lookup live in src/components/templates.js.
export const TEMPLATES = [
  {
    id: "uml-interaction-overview",
    title: "13. Interaction Overview Diagram (UML Interaction)",
    category: "UML Specification",
    kind: "flowchart",
    description: "Combines activity control flow with sequence interaction frames and decision guards.",
    code: `flowchart TD
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
`,
  },
  {
    id: "uml-profile",
    title: "14. Profile Diagram (UML Extension)",
    category: "UML Specification",
    kind: "class",
    description: "Custom UML profile stereotypes, tagged values, and metaclass extensions for domain modeling.",
    code: `classDiagram
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
`,
  },
];
