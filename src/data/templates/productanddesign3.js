// Product & Design templates (part 3 of 3).
// Combined registry and lookup live in src/components/templates.js.
export const TEMPLATES = [
  {
    id: "pm-story-mapping",
    title: "Product Feature Backlog & User Story Map",
    category: "Product & Design",
    role: "Product Manager",
    kind: "flowchart",
    description: "Visual user story mapping organizing feature epics across user journey milestones and release slices (MVP vs V2).",
    code: `flowchart TD
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
`,
  },
];
