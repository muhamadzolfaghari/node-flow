import test from "node:test";
import assert from "node:assert/strict";
import {
  detectDiagramType,
  describeToDiagram,
  SUPPORTED_DIAGRAM_TYPES,
} from "../src/utils/importers/describe-to-diagram.js";

test("SUPPORTED_DIAGRAM_TYPES catalog covers 19 diagram types", () => {
  assert.ok(SUPPORTED_DIAGRAM_TYPES.length >= 19);
  assert.ok(SUPPORTED_DIAGRAM_TYPES.some((t) => t.id === "auto"));
  assert.ok(SUPPORTED_DIAGRAM_TYPES.some((t) => t.id === "architecture"));
  assert.ok(SUPPORTED_DIAGRAM_TYPES.some((t) => t.id === "packet"));
  assert.ok(SUPPORTED_DIAGRAM_TYPES.some((t) => t.id === "c4"));
});

test("detectDiagramType correctly classifies intent from prompt cues", () => {
  assert.equal(detectDiagramType("client sends request to api gateway and receives response"), "sequence");
  assert.equal(detectDiagramType("order lifecycle transitions from pending to approved or cancelled"), "state");
  assert.equal(detectDiagramType("database relational schema with primary key and foreign key tables"), "er");
  assert.equal(detectDiagramType("class diagram with interface and inheritance"), "class");
  assert.equal(detectDiagramType("brainstorming topic breakdown hierarchy mindmap"), "mindmap");
  assert.equal(detectDiagramType("customer journey experience map with persona scores"), "journey");
  assert.equal(detectDiagramType("gantt project schedule with milestone dates"), "gantt");
  assert.equal(detectDiagramType("historical chronology and timeline of events through 2026"), "timeline");
  assert.equal(detectDiagramType("git branching workflow with feature branch and merge commits"), "gitGraph");
  assert.equal(detectDiagramType("budget percentage breakdown pie chart distribution"), "pie");
  assert.equal(detectDiagramType("priority matrix with high impact low effort quadrants"), "quadrant");
  assert.equal(detectDiagramType("C4 software architecture context system boundary"), "c4");
  assert.equal(detectDiagramType("energy conversion sankey flow diagram"), "sankey");
  assert.equal(detectDiagramType("sprint task board with backlog in progress and done kanban"), "kanban");
  assert.equal(detectDiagramType("sysml systems engineering requirement diagram"), "requirement");
  assert.equal(detectDiagramType("network protocol bytefield packet header bit offsets"), "packet");
  assert.equal(detectDiagramType("cloud vpc architecture with gateway lambda and database"), "architecture");
  assert.equal(detectDiagramType(""), "flowchart");
});

test("describeToDiagram generates valid Mermaid code for all primary types", () => {
  const types = [
    { type: "flowchart", prompt: "Step A goes to Step B then Step C" },
    { type: "sequence", prompt: "Client calls Auth then Auth queries DB" },
    { type: "state", prompt: "Draft to Review to Published" },
    { type: "er", prompt: "User has many Orders and Order has Items" },
    { type: "class", prompt: "Shape is extended by Circle and Rectangle" },
    { type: "mindmap", prompt: "Product roadmap with Frontend and Backend" },
    { type: "journey", prompt: "User visits homepage, signs up, and buys product" },
    { type: "gantt", prompt: "Sprint 1 research, Sprint 2 implementation" },
    { type: "timeline", prompt: "2024 launch, 2025 growth, 2026 enterprise" },
    { type: "gitGraph", prompt: "Main branch with feature branch merged back" },
    { type: "pie", prompt: "Frontend 40%, Backend 35%, DevOps 25%" },
    { type: "quadrant", prompt: "Feature prioritization with effort and impact" },
    { type: "c4", prompt: "Customer uses Mobile App which connects to Banking API" },
    { type: "sankey", prompt: "Website Traffic to Leads to Sales" },
    { type: "kanban", prompt: "To Do, In Progress, QA, Done" },
    { type: "requirement", prompt: "System performance requirement REQ-101" },
    { type: "packet", prompt: "IPv4 header with version, TTL, and checksum" },
    { type: "architecture", prompt: "VPC cloud with API Gateway and Postgres" },
  ];

  for (const { type, prompt } of types) {
    const res = describeToDiagram(prompt, type);
    assert.ok(res, `Failed for type: ${type}`);
    const code = typeof res === "string" ? res : res.code;
    assert.ok(code.length > 10, `Code too short for type: ${type}`);
  }
});

test("describeToDiagram handles auto-detection and input validation", () => {
  // Empty or invalid input
  assert.throws(() => describeToDiagram(""), /Please enter a description/);
  assert.throws(() => describeToDiagram(null), /Please enter a description/);

  // Auto-detection mode
  const autoFlow = describeToDiagram("Process alpha transitions to Process beta", "auto", { orientation: "LR" });
  assert.equal(autoFlow.type, "flowchart");
  assert.ok(autoFlow.code.includes("Process alpha") && autoFlow.code.includes("flowchart LR"));

  // Persona cues
  assert.equal(detectDiagramType("User story map and backlog grooming for release slice"), "kanban");
  assert.equal(detectDiagramType("Defect lifecycle and bug triage lifecycle state transition"), "state");
  assert.equal(detectDiagramType("Doctoral thesis structure and literature review mindmap"), "mindmap");
  assert.equal(detectDiagramType("Semester plan and study schedule milestones"), "timeline");
});

