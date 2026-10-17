// Business & Operations templates (part 3 of 3).
// Combined registry and lookup live in src/components/templates.js.
export const TEMPLATES = [
  {
    id: "sop-approval-process",
    title: "Standard Operating Procedure (SOP) & Approval",
    category: "Business & Operations",
    role: "Operations & SOP",
    kind: "flowchart",
    description: "Corporate governance and operational workflow for drafting, compliance review, executive sign-off, and staff rollout.",
    code: `flowchart TD
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
`,
  },
];
