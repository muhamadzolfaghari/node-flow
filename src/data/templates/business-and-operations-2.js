// Business & Operations templates (part 2 of 3).
// Combined registry and lookup live in src/components/templates.js.
export const TEMPLATES = [
  {
    id: "strategic-okr-roadmap",
    title: "Strategic Quarterly OKR Roadmap",
    category: "Business & Operations",
    kind: "timeline",
    description: "Multi-quarter corporate vision, strategic milestones, key results, and organizational goals across 4 quarters.",
    code: `timeline
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
`,
  },
  {
    id: "sales-marketing-funnel",
    title: "Marketing & Sales Conversion Funnel",
    category: "Business & Operations",
    kind: "sankey",
    description: "Conversion flow from initial website visitors through qualified leads, trial activations, paid tiers, and enterprise deals.",
    code: `sankey-beta
Website Visitors, Sign Ups, 3500
Website Visitors, Direct Bounces, 16500
Sign Ups, Active Trial Users, 1800
Sign Ups, Inactive Free, 1700
Active Trial Users, Paid Pro Subscriptions, 650
Active Trial Users, Enterprise Contracts, 150
`,
  },
  {
    id: "sprint-retrospective-mindmap",
    title: "Agile Team Sprint Retrospective",
    category: "Business & Operations",
    kind: "mindmap",
    description: "Structured retrospective mindmap categorizing what went well, growth areas, constructive action items, and team kudos.",
    code: `mindmap
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
`,
  },
];
