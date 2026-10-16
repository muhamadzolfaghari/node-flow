// QA & Testing templates.
// Combined registry and lookup live in src/components/templates.js.
export const TEMPLATES = [
  {
    id: "qa-defect-lifecycle",
    title: "QA Defect Lifecycle & Bug Triage Workflow",
    category: "QA & Testing",
    role: "QA & Testing",
    kind: "flowchart",
    description: "Complete defect state machine from discovery and triage prioritization to developer fix, QA verification, and production closure.",
    code: `flowchart TD
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
`,
  },
  {
    id: "qa-cicd-quality-gate",
    title: "Automated CI/CD Quality Gate & Smoke Pipeline",
    category: "QA & Testing",
    role: "QA & Testing",
    kind: "flowchart",
    description: "Multi-stage continuous integration and release quality gates: unit tests, DB integration, headless browser E2E, and security scans.",
    code: `flowchart LR
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
`,
  },
];
