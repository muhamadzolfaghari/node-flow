import test from "node:test";
import assert from "node:assert/strict";
import {
  flowchartNodes,
  renameFlowchartNode,
  addFlowchartNode,
  connectFlowchartNodes,
  addFlowchartChild,
  deleteFlowchartNode,
  changeFlowchartNodeShape,
  getFlowchartNodeShape,
  styleFlowchartNode,
  removeFlowchartNodeStyle,
  getFlowchartDirection,
  changeFlowchartDirection,
  duplicateFlowchartNode,
  flowchartEdges,
  deleteFlowchartEdge,
  getDiagramConfig,
  updateDiagramConfig,
  isSequence,
  sequenceParticipants,
  addSequenceParticipant,
  addSequenceMessage,
  deleteSequenceParticipant,
  isClassDiagram,
  classDiagramClasses,
  addClassDiagramClass,
  addClassDiagramMember,
  connectClassDiagramClasses,
  deleteClassDiagramClass,
  isState,
  stateDiagramStates,
  addStateDiagramState,
  connectStateDiagramStates,
  deleteStateDiagramState,
  isErDiagram,
  erDiagramEntities,
  addErDiagramEntity,
  addErDiagramAttribute,
  connectErDiagramEntities,
  deleteErDiagramEntity,
  isMindmap,
  mindmapNodes,
  addMindmapChild,
  deleteMindmapNode,
  isGitGraph,
  gitGraphBranches,
  addGitCommit,
  addGitBranch,
  checkoutGitBranch,
  mergeGitBranch,
  isPie,
  pieData,
  addPieSlice,
  deletePieSlice,
  setPieTitle,
  isJourney,
  journeySections,
  addJourneySection,
  addJourneyTask,
  deleteJourneyTask,
  isKanban,
  kanbanColumns,
  addKanbanColumn,
  addKanbanCard,
  deleteKanbanCard,
  isGantt,
  ganttSections,
  addGanttSection,
  addGanttTask,
  deleteGanttTask,
  isQuadrantChart,
  quadrantPoints,
  addQuadrantPoint,
  deleteQuadrantPoint,
  isTimeline,
  timelineSections,
  addTimelineSection,
  addTimelineEvent,
  deleteTimelineEvent,
} from "../src/lib/visual-editing.js";
test("canvas label edits preserve unrelated source and shape", () => {
  const source =
    "flowchart LR\n A[Client] --> B([Service])\n %% Keep this comment";
  const next = renameFlowchartNode(source, "B", "New service");
  assert.match(next, /B\(\["New service"\]\)/);
  assert.match(next, /Keep this comment/);
  assert.equal(flowchartNodes(next).length, 2);
});
test("adding and connecting nodes use unique ids and escaped labels", () => {
  const source = "flowchart TD\n node1[Existing]";
  const next = addFlowchartNode(source, 'Review "order"');
  assert.match(next, /node2\["Review &quot;order&quot;"\]/);
  assert.match(
    connectFlowchartNodes(next, "node1", "node2", "continue"),
    /node1 -->\|"continue"\| node2/,
  );
  assert.match(
    connectFlowchartNodes(next, "node1", "node2", "async", "dotted"),
    /node1 -\.->\|"async"\| node2/,
  );
  assert.match(
    connectFlowchartNodes(next, "node1", "node2", "", "thick"),
    /node1 ==> node2/,
  );
  assert.throws(
    () => connectFlowchartNodes(next, "missing", "node2"),
    /existing nodes/,
  );

  const childResult = addFlowchartChild(next, "node1", "Validate token", "thick", "rounded");
  assert.equal(childResult.childId, "node3");
  assert.equal(childResult.childLabel, "Validate token");
  assert.match(childResult.source, /node1 ==> node3\("Validate token"\)/);
});
test("deleting a node removes declaration, connected edges, and styles", () => {
  const source = "flowchart LR\n  A[Client] --> B[Server]\n  B --> C[Database]\n  D[Standalone]\n  style B fill:#064e3b";
  const next = deleteFlowchartNode(source, "B");
  assert.equal(next.includes("B[Server]"), false);
  assert.equal(next.includes("A --> B"), false);
  assert.equal(next.includes("B --> C"), false);
  assert.equal(next.includes("style B"), false);
  assert.equal(next.includes("A[Client]"), true);
  assert.equal(next.includes("D[Standalone]"), true);
});
test("changing node shape updates brackets and preserves label", () => {
  const source = 'flowchart TD\n  A["Start Process"] --> B["Decision"]';
  assert.equal(getFlowchartNodeShape(source, "B"), "rectangle");
  const diamond = changeFlowchartNodeShape(source, "B", "diamond");
  assert.match(diamond, /B\{"Decision"\}/);
  assert.equal(getFlowchartNodeShape(diamond, "B"), "diamond");
  const cylinder = changeFlowchartNodeShape(diamond, "B", "cylinder");
  assert.match(cylinder, /B\[\("Decision"\)\]/);
  assert.equal(getFlowchartNodeShape(cylinder, "B"), "cylinder");
});
test("styling a node applies or replaces style directives", () => {
  const source = "flowchart TD\n  A[Client] --> B[Server]";
  const styled = styleFlowchartNode(source, "B", "emerald");
  assert.match(styled, /style B fill:#064e3b/);
  const updated = styleFlowchartNode(styled, "B", "rose");
  assert.match(updated, /style B fill:#881337/);
  assert.equal(updated.includes("fill:#064e3b"), false);
  const unstyled = removeFlowchartNodeStyle(updated, "B");
  assert.equal(unstyled.includes("style B"), false);
});

test("detecting and changing flowchart layout direction", () => {
  const source = "flowchart TD\n  A --> B";
  assert.equal(getFlowchartDirection(source), "TD");
  const changedLR = changeFlowchartDirection(source, "LR");
  assert.match(changedLR, /^flowchart LR/);
  assert.equal(getFlowchartDirection(changedLR), "LR");

  const changedBT = changeFlowchartDirection(changedLR, "BT");
  assert.match(changedBT, /^flowchart BT/);

  assert.throws(() => changeFlowchartDirection(source, "INVALID"), /Invalid flowchart direction/);
});

test("duplicating a node preserves shape and clones styles", () => {
  const source = "flowchart LR\n  A([Start]) --> B[(Database)]\n  style B fill:#064e3b";
  const { source: updated, duplicateId, duplicateLabel } = duplicateFlowchartNode(source, "B");
  assert.equal(duplicateId, "node3");
  assert.equal(duplicateLabel, "Copy of Database");
  assert.match(updated, /node3\[\("Copy of Database"\)\]/);
  assert.match(updated, /style node3 fill:#064e3b/);
});

test("listing and deleting flowchart edges", () => {
  const source = "flowchart LR\n  A[Client] --> B[Server]\n  B ==>|\"sync\"| C[(Database)]";
  const edges = flowchartEdges(source);
  assert.equal(edges.length, 2);
  assert.equal(edges[0].from, "A");
  assert.equal(edges[0].to, "B");
  assert.equal(edges[1].from, "B");
  assert.equal(edges[1].to, "C");
  assert.equal(edges[1].label, "sync");
  assert.equal(edges[1].symbol, "==>");

  const severed = deleteFlowchartEdge(source, "A", "B");
  assert.match(severed, /A\[Client\]/);
  assert.match(severed, /B\[Server\]/);
  assert.equal(flowchartEdges(severed).length, 1);
  assert.equal(flowchartNodes(severed).length, 3);
});

test("supports inline labeled edges (-- text -->) and disconnecting them", () => {
  const source = `flowchart TD
  A[Client] -- "Yes, proceed" --> B[Auth]
  B == sync ==> C[(DB)]`;
  const edges = flowchartEdges(source);
  assert.equal(edges.length, 2);
  assert.equal(edges[0].from, "A");
  assert.equal(edges[0].to, "B");
  assert.equal(edges[0].label, "Yes, proceed");
  assert.equal(edges[0].symbol, "-->");

  const severed = deleteFlowchartEdge(source, "A", "B");
  assert.match(severed, /A\[Client\]/);
  assert.match(severed, /B\[Auth\]/);
  assert.equal(flowchartEdges(severed).length, 1);
});

test("reading and updating diagram look and theme frontmatter", () => {
  let source = "flowchart TD\n  A --> B";
  assert.deepEqual(getDiagramConfig(source), { look: "classic", theme: "default" });

  source = updateDiagramConfig(source, { look: "handDrawn", theme: "forest" });
  assert.deepEqual(getDiagramConfig(source), { look: "handDrawn", theme: "forest" });
  assert.match(source, /look: handDrawn/);
  assert.match(source, /theme: forest/);

  source = updateDiagramConfig(source, { look: "classic" });
  assert.deepEqual(getDiagramConfig(source), { look: "classic", theme: "forest" });
  assert.doesNotMatch(source, /look:/);

  source = updateDiagramConfig(source, { theme: "default" });
  assert.deepEqual(getDiagramConfig(source), { look: "classic", theme: "default" });
  assert.doesNotMatch(source, /^---/m);
});

test("sequence diagram visual modeling: participants, messages, deletion", () => {
  let seq = `sequenceDiagram
  autonumber
  actor User as "Mobile User"
  participant API
  User->>API: POST /login
  API-->>User: 200 OK`;

  assert.equal(isSequence({ format: "mermaid", source: seq }), true);
  const parts = sequenceParticipants(seq);
  assert.equal(parts.length, 2);
  assert.equal(parts[0].id, "User");
  assert.equal(parts[0].label, "Mobile User");
  assert.equal(parts[0].type, "actor");
  assert.equal(parts[1].id, "API");

  seq = addSequenceParticipant(seq, "DB", "PostgreSQL Database", "participant");
  assert.match(seq, /participant DB as "PostgreSQL Database"/);

  seq = addSequenceMessage(seq, "API", "DB", "SELECT users", "->>");
  assert.match(seq, /API->>DB: SELECT users/);

  seq = deleteSequenceParticipant(seq, "DB");
  assert.doesNotMatch(seq, /PostgreSQL Database/);
  assert.doesNotMatch(seq, /API->>DB/);
});

test("class diagram visual modeling: classes, members, connections, deletion", () => {
  let cls = `classDiagram
  class User {
    +String email
  }
  class Admin
  User <|-- Admin : inherits`;

  assert.equal(isClassDiagram({ format: "mermaid", source: cls }), true);
  const classes = classDiagramClasses(cls);
  assert.equal(classes.length, 2);
  assert.equal(classes.some((c) => c.id === "User"), true);
  assert.equal(classes.some((c) => c.id === "Admin"), true);

  cls = addClassDiagramClass(cls, "Profile");
  assert.match(cls, /class Profile \{/);

  cls = addClassDiagramMember(cls, "User", "+checkPassword(): bool");
  assert.match(cls, /\+checkPassword\(\): bool/);

  cls = connectClassDiagramClasses(cls, "User", "Profile", "*--", "has");
  assert.match(cls, /User \*-- Profile : has/);

  cls = deleteClassDiagramClass(cls, "Admin");
  assert.doesNotMatch(cls, /class Admin\b/);
  assert.doesNotMatch(cls, /User <\|-- Admin/);
});

test("state diagram visual modeling: states, transitions, deletion", () => {
  let stateDoc = `stateDiagram-v2
  [*] --> Still
  Still --> [*]
  state "Crash Recovery" as Crash
  Still --> Moving : evMove`;

  assert.equal(isState({ format: "mermaid", source: stateDoc }), true);
  const states = stateDiagramStates(stateDoc);
  assert.equal(states.length >= 4, true);
  assert.equal(states.some((s) => s.id === "Still"), true);
  assert.equal(states.some((s) => s.id === "Crash"), true);
  assert.equal(states.some((s) => s.id === "Moving"), true);

  stateDoc = addStateDiagramState(stateDoc, "Paused", "Paused Execution");
  assert.match(stateDoc, /state "Paused Execution" as Paused/);

  stateDoc = connectStateDiagramStates(stateDoc, "Moving", "Paused", "evPause");
  assert.match(stateDoc, /Moving --> Paused : evPause/);

  stateDoc = deleteStateDiagramState(stateDoc, "Crash");
  assert.doesNotMatch(stateDoc, /Crash Recovery/);
});

test("er diagram visual modeling: entities, attributes, relations, deletion", () => {
  let erDoc = `erDiagram
  CUSTOMER ||--o{ ORDER : places
  CUSTOMER {
    string id PK
  }`;

  assert.equal(isErDiagram({ format: "mermaid", source: erDoc }), true);
  const entities = erDiagramEntities(erDoc);
  assert.equal(entities.length, 2);
  assert.equal(entities.some((e) => e.id === "CUSTOMER"), true);
  assert.equal(entities.some((e) => e.id === "ORDER"), true);

  erDoc = addErDiagramEntity(erDoc, "INVOICE");
  assert.match(erDoc, /INVOICE \{/);

  erDoc = addErDiagramAttribute(erDoc, "CUSTOMER", "string", "email");
  assert.match(erDoc, /string email/);

  erDoc = connectErDiagramEntities(erDoc, "ORDER", "INVOICE", "||--||", "generates");
  assert.match(erDoc, /ORDER \|\|--\|\| INVOICE : "generates"/);

  erDoc = deleteErDiagramEntity(erDoc, "INVOICE");
  assert.doesNotMatch(erDoc, /INVOICE/);
});

test("mindmap visual modeling: topic hierarchy, child addition, and branch deletion", () => {
  let mm = `mindmap
  root((Core Architecture))
    Backend
      API
      Database
    Frontend
      React UI`;

  assert.equal(isMindmap({ format: "mermaid", source: mm }), true);
  const nodes = mindmapNodes(mm);
  assert.equal(nodes.length, 6);
  assert.equal(nodes[0].text, "Core Architecture");
  assert.equal(nodes[0].shape, "circle");

  mm = addMindmapChild(mm, "Frontend", "Tailwind CSS", "rounded");
  assert.match(mm, /\(Tailwind CSS\)/);

  mm = deleteMindmapNode(mm, "Backend");
  assert.doesNotMatch(mm, /Backend/);
  assert.doesNotMatch(mm, /Database/);
  assert.match(mm, /React UI/);
});

test("gitGraph visual modeling: branches, commits, checkout, merge", () => {
  let git = `gitGraph
  commit id: "Initial commit"`;

  assert.equal(isGitGraph({ format: "mermaid", source: git }), true);
  let branches = gitGraphBranches(git);
  assert.equal(branches.some((b) => b.id === "main"), true);

  git = addGitBranch(git, "feature/auth");
  assert.match(git, /branch feature\/auth/);

  git = checkoutGitBranch(git, "feature/auth");
  assert.match(git, /checkout feature\/auth/);

  git = addGitCommit(git, "Implement JWT", "v0.1", "HIGHLIGHT");
  assert.match(git, /commit id: "Implement JWT" tag: "v0.1" type: HIGHLIGHT/);

  git = checkoutGitBranch(git, "main");
  git = mergeGitBranch(git, "feature/auth", "v1.0");
  assert.match(git, /merge feature\/auth tag: "v1.0"/);

  branches = gitGraphBranches(git);
  assert.equal(branches.some((b) => b.id === "feature/auth"), true);
});

test("pie chart visual modeling: title, add/delete slices, parsing", () => {
  let pie = `pie title Key Metrics
  "Desktop" : 45
  "Mobile" : 35
  "Tablet" : 20`;

  assert.equal(isPie({ format: "mermaid", source: pie }), true);
  let data = pieData(pie);
  assert.equal(data.title, "Key Metrics");
  assert.equal(data.slices.length, 3);
  assert.equal(data.slices[0].label, "Desktop");
  assert.equal(data.slices[0].value, 45);

  pie = setPieTitle(pie, "Platform Breakdown");
  assert.match(pie, /pie title Platform Breakdown/);

  pie = addPieSlice(pie, "Smart TV", 10);
  assert.match(pie, /"Smart TV" : 10/);

  pie = deletePieSlice(pie, "Tablet");
  assert.doesNotMatch(pie, /"Tablet"/);

  data = pieData(pie);
  assert.equal(data.slices.length, 3);
  assert.equal(data.slices.some((s) => s.label === "Smart TV"), true);
  assert.equal(data.slices.some((s) => s.label === "Tablet"), false);
});

test("journey map visual modeling: sections, add/delete tasks, scores", () => {
  let journey = `journey
  title Customer Journey
  section Onboarding
    Visit site: 5: User
    Sign up: 3: User, Auth`;

  assert.equal(isJourney({ format: "mermaid", source: journey }), true);
  let secs = journeySections(journey);
  assert.equal(secs.length, 1);
  assert.equal(secs[0].name, "Onboarding");
  assert.equal(secs[0].tasks.length, 2);
  assert.equal(secs[0].tasks[0].name, "Visit site");
  assert.equal(secs[0].tasks[0].score, 5);

  journey = addJourneySection(journey, "Checkout");
  assert.match(journey, /section Checkout/);

  journey = addJourneyTask(
    journey,
    "Checkout",
    "Enter credit card",
    2,
    "User, Stripe",
  );
  assert.match(journey, /Enter credit card: 2: User, Stripe/);

  journey = deleteJourneyTask(journey, "Sign up");
  assert.doesNotMatch(journey, /Sign up:/);

  secs = journeySections(journey);
  assert.equal(secs.length, 2);
  const checkoutSec = secs.find((s) => s.name === "Checkout");
  assert.ok(checkoutSec);
  assert.equal(checkoutSec.tasks.length, 1);
  assert.equal(checkoutSec.tasks[0].name, "Enter credit card");
});

test("kanban board visual modeling: columns, cards, deletion", () => {
  let kb = `kanban
  Backlog
    [User Persona Journey]
    [Export to Lucidchart]
  In Progress
    [BPMN 2.0 Business Flow]`;

  assert.equal(isKanban({ format: "mermaid", source: kb }), true);
  let cols = kanbanColumns(kb);
  assert.equal(cols.length, 2);
  assert.equal(cols[0].name, "Backlog");
  assert.equal(cols[0].cards.length, 2);
  assert.equal(cols[1].name, "In Progress");

  kb = addKanbanColumn(kb, "Done");
  assert.match(kb, /Done/);

  kb = addKanbanCard(kb, "Done", "Rebrand Studio");
  assert.match(kb, /\[Rebrand Studio\]/);

  kb = deleteKanbanCard(kb, "User Persona Journey");
  assert.doesNotMatch(kb, /User Persona Journey/);

  cols = kanbanColumns(kb);
  assert.equal(cols.length, 3);
  const doneCol = cols.find((c) => c.name === "Done");
  assert.ok(doneCol);
  assert.equal(doneCol.cards.includes("Rebrand Studio"), true);
});

test("gantt chart visual modeling: sections, tasks, status, deletion", () => {
  let gt = `gantt
    title Release Roadmap
    dateFormat YYYY-MM-DD
    section Core Wasm
    Turbo Kernel :done, a1, 7d
    Graphviz Engine :active, a2, 10d`;

  assert.equal(isGantt({ format: "mermaid", source: gt }), true);
  let secs = ganttSections(gt);
  assert.equal(secs.length, 1);
  assert.equal(secs[0].name, "Core Wasm");
  assert.equal(secs[0].tasks.length, 2);
  assert.equal(secs[0].tasks[0].name, "Turbo Kernel");
  assert.equal(secs[0].tasks[0].status, "done");

  gt = addGanttSection(gt, "Verification");
  assert.match(gt, /section Verification/);

  gt = addGanttTask(gt, "Verification", "Browser E2E Suite", "crit", "4d");
  assert.match(gt, /Browser E2E Suite :crit,/);

  gt = deleteGanttTask(gt, "Graphviz Engine");
  assert.doesNotMatch(gt, /Graphviz Engine/);

  secs = ganttSections(gt);
  assert.equal(secs.length, 2);
  const verSec = secs.find((s) => s.name === "Verification");
  assert.ok(verSec);
  assert.equal(verSec.tasks.length, 1);
  assert.equal(verSec.tasks[0].name, "Browser E2E Suite");
});

test("quadrant chart visual modeling: points, coordinates, deletion", () => {
  let q = `quadrantChart
    title Prioritization Matrix
    x-axis Low Effort --> High Effort
    y-axis Low Value --> High Value
    Fast Hashing: [0.22, 0.85]
    UML Templates: [0.30, 0.92]`;

  assert.equal(isQuadrantChart({ format: "mermaid", source: q }), true);
  let pts = quadrantPoints(q);
  assert.equal(pts.length, 2);
  assert.equal(pts[0].label, "Fast Hashing");
  assert.equal(pts[0].x, 0.22);
  assert.equal(pts[0].y, 0.85);

  q = addQuadrantPoint(q, "Real-Time Sync", 0.75, 0.88);
  assert.match(q, /Real-Time Sync: \[0.75, 0.88\]/);

  q = deleteQuadrantPoint(q, "UML Templates");
  assert.doesNotMatch(q, /UML Templates/);

  pts = quadrantPoints(q);
  assert.equal(pts.length, 2);
  assert.equal(pts.some((p) => p.label === "Real-Time Sync"), true);
  assert.equal(pts.some((p) => p.label === "UML Templates"), false);
});

test("timeline visual modeling: sections, events, descriptions, deletion", () => {
  let tl = `timeline
    title Multi-Quarter Roadmap
    section Q1 2026 : Foundation
        Core architecture : MVP specs
        Security review : Threat modeling
    section Q2 2026 : Scale
        Backend API : Database migration`;

  assert.equal(isTimeline({ format: "mermaid", source: tl }), true);
  let secs = timelineSections(tl);
  assert.equal(secs.length, 2);
  assert.equal(secs[0].name, "Q1 2026 : Foundation");
  assert.equal(secs[0].events.length, 2);
  assert.equal(secs[0].events[0].title, "Core architecture");
  assert.equal(secs[0].events[0].description, "MVP specs");

  tl = addTimelineSection(tl, "Q3 2026 : Launch");
  assert.match(tl, /section Q3 2026 : Launch/);

  tl = addTimelineEvent(
    tl,
    "Q3 2026 : Launch",
    "Public Beta",
    "Worldwide rollout",
  );
  assert.match(tl, /Public Beta : Worldwide rollout/);

  tl = deleteTimelineEvent(tl, "Security review");
  assert.doesNotMatch(tl, /Security review/);

  secs = timelineSections(tl);
  assert.equal(secs.length, 3);
  const launchSec = secs.find((s) => s.name.includes("Q3 2026"));
  assert.ok(launchSec);
  assert.equal(launchSec.events.length, 1);
  assert.equal(launchSec.events[0].title, "Public Beta");
});








