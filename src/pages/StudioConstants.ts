export const BLANK =
  "flowchart TD\n  Start([Start]) --> Process[Process task]\n  Process --> Done([Complete])";

export const AI_STARTERS = [
  // Developer & Architecture
  {
    label: "Auth & PKCE Flow",
    role: "Dev",
    type: "sequence",
    prompt: "Client initiates OAuth2 login with PKCE challenge to Auth0 server, receives authorization code, exchanges for JWT access token, and queries Protected Resource API",
  },
  {
    label: "Microservices VPC",
    role: "Dev",
    type: "architecture",
    prompt: "Public Internet connects via Cloudflare to API Gateway in VPC, routing traffic to User Service and Order Service backed by PostgreSQL and Redis cache",
  },
  {
    label: "E-Commerce DB",
    role: "Dev",
    type: "er",
    prompt: "Relational database schema with Users, Products, Categories, Orders, and OrderItems with foreign keys and total price calculations",
  },
  {
    label: "CI/CD Deployment",
    role: "Dev",
    type: "flowchart",
    prompt: "Developer pushes git commit, triggers unit tests and lint checks; if passed, builds docker container and deploys to Kubernetes staging, with canary promotion to production",
  },
  // QA & Quality Engineering
  {
    label: "QA Bug Triage & Defect State",
    role: "QA",
    type: "state",
    prompt: "Defect lifecycle transitioning from New to Triage, Confirmed to InDev, DeployedToQA to Verified or Reopened with trace logs, closing in Production",
  },
  {
    label: "CI/CD Quality Gate Pipeline",
    role: "QA",
    type: "flowchart",
    prompt: "Continuous integration quality gate pipeline: unit tests 100% pass, DB integration tests, headless browser E2E smoke tests, and production release signoff",
  },
  {
    label: "API Integration Test Flow",
    role: "QA",
    type: "sequence",
    prompt: "Automated test harness sends mock auth token to API Gateway, asserts 401 on expired signature, asserts 429 on rate limit threshold, and asserts 200 OK with payload on valid request",
  },
  // Product Manager (PM)
  {
    label: "User Story Map & MVP",
    role: "PM",
    type: "kanban",
    prompt: "Agile user story map organizing product backlog across user journey milestones: discovery, onboarding, core editor, and export with MVP release slice and V2 enhancements",
  },
  {
    label: "Product Conversion Funnel",
    role: "PM",
    type: "sankey",
    prompt: "Product conversion funnel tracking user dropoff from Organic Search (12000) and Referral (4000) to Signup (3500), Active Editor (2200), and Team Plan (450)",
  },
  {
    label: "Feature Priority 2x2 Matrix",
    role: "PM",
    type: "quadrant",
    prompt: "Feature prioritization matrix evaluating user value versus implementation effort for AI diagnostics, WebRTC sync, dark mode, and PDF exports",
  },
  {
    label: "Customer Onboarding Journey",
    role: "PM",
    type: "journey",
    prompt: "User journey mapping new customer experience from product discovery, first diagram created, template browsing, and exporting vector graphics with satisfaction scores",
  },
  // Business & Operations (General Workers / SOP)
  {
    label: "SOP Multi-Level Approval",
    role: "Operations",
    type: "flowchart",
    prompt: "Standard operating procedure workflow: document drafted by author, peer review, legal compliance risk check, executive VP sign-off, and staff training rollout",
  },
  {
    label: "Corporate Org Hierarchy",
    role: "Operations",
    type: "flowchart",
    prompt: "Corporate organization chart with CEO, VP Engineering, VP Product, Head of QA, Operations Lead, and cross-functional agile squads",
  },
  {
    label: "Support Refund Escalation",
    role: "Operations",
    type: "flowchart",
    prompt: "Customer refund policy process: verify purchase date, check warranty status, route to finance for payment gateway reversal, and email customer resolution",
  },
  {
    label: "Strategic OKR Roadmap",
    role: "Operations",
    type: "timeline",
    prompt: "Annual corporate OKRs broken into Q1 Market Research & Foundation, Q2 Core Engine & Beta, Q3 Enterprise Compliance & SOC2, and Q4 Global Expansion",
  },
  // Students & Academics
  {
    label: "Thesis & Research Literature Map",
    role: "Academic",
    type: "mindmap",
    prompt: "Doctoral research thesis structure covering theoretical foundations, empirical research methodology, quantitative latency benchmarks, and future WebGPU directions",
  },
  {
    label: "Scientific Method Protocol",
    role: "Academic",
    type: "flowchart",
    prompt: "Scientific experiment protocol from observation and hypothesis formulation to controlled lab testing, statistical data analysis, and peer-reviewed publication",
  },
  {
    label: "Semester Course & Exam Plan",
    role: "Academic",
    type: "timeline",
    prompt: "Semester academic plan across Foundation Weeks 1-4, Midterm Sprint Weeks 5-8, Advanced Research Weeks 9-12, and Final Exams Weeks 13-16",
  },
];
