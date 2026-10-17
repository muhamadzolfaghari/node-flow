// Business & Operations templates (part 1 of 3).
// Combined registry and lookup live in src/components/templates.js.
export const TEMPLATES = [
  {
    id: "company-org-chart",
    title: "Company Organizational Hierarchy (Org Chart)",
    category: "Business & Operations",
    kind: "flowchart",
    description: "Executive leadership, department heads, cross-functional squads, and operational reporting lines for corporate management.",
    code: `flowchart TD
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
`,
  },
  {
    id: "swot-strategic-analysis",
    title: "SWOT Strategic Business Analysis",
    category: "Business & Operations",
    kind: "quadrantChart",
    description: "Strategic planning framework evaluating internal strengths/weaknesses and external market opportunities/threats.",
    code: `quadrantChart
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
`,
  },
  {
    id: "recruitment-pipeline",
    title: "Talent Acquisition & Hiring Pipeline",
    category: "Business & Operations",
    kind: "flowchart",
    description: "End-to-end recruitment lifecycle from application screening, technical assessments, executive debriefs to formal offer.",
    code: `flowchart LR
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
`,
  },
  {
    id: "customer-retention-journey",
    title: "Customer Retention & Lifecycle Journey",
    category: "Business & Operations",
    kind: "journey",
    description: "Omnichannel customer journey tracking discovery, product activation, value realization, expansion, and advocacy.",
    code: `journey
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
`,
  },
  {
    id: "risk-assessment-matrix",
    title: "Risk Assessment & Mitigation Matrix",
    category: "Business & Operations",
    kind: "quadrantChart",
    description: "Enterprise risk management matrix plotting likelihood against business impact with severity tiers and mitigation actions.",
    code: `quadrantChart
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
`,
  },
  {
    id: "customer-refund-decision-tree",
    title: "Customer Refund & Resolution Policy",
    category: "Business & Operations",
    kind: "flowchart",
    description: "Standard operating procedure decision tree for customer support teams resolving refund requests, replacements, and store credits.",
    code: `flowchart TD
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
`,
  },
];
