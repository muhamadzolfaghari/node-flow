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
  isSankey,
  sankeyLinks,
  addSankeyLink,
  deleteSankeyLink,
  isXyChart,
  xyChartData,
  updateXyChartTitle,
  addXyChartSeries,
  deleteXyChartSeries,
  isBlock,
  getBlockColumns,
  setBlockColumns,
  blockItems,
  addBlockItem,
  deleteBlockItem,
  isC4,
  c4Elements,
  c4Relations,
  addC4Element,
  deleteC4Element,
  addC4Relation,
  deleteC4Relation,
  isRequirement,
  requirementItems,
  requirementRelations,
  addRequirement,
  addRequirementElement,
  deleteRequirement,
  addRequirementRelation,
  deleteRequirementRelation,
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

test("sankey diagram visual modeling: links, addition, deletion, validation", () => {
  let sk = `sankey-beta
    Agricultural Energy, Bio-conversion, 124.729
    Bio-conversion, Liquid, 0.597
    Bio-conversion, Solid, 110.252
    Electricity grid, Thermal generation, 52.5`;

  assert.equal(isSankey({ format: "mermaid", source: sk }), true);
  let links = sankeyLinks(sk);
  assert.equal(links.length, 4);
  assert.equal(links[0].source, "Agricultural Energy");
  assert.equal(links[0].target, "Bio-conversion");
  assert.equal(links[0].value, 124.729);

  sk = addSankeyLink(sk, "Solar", "Electricity grid", 45.8);
  assert.match(sk, /Solar, Electricity grid, 45.8/);

  sk = deleteSankeyLink(sk, "Bio-conversion", "Liquid");
  assert.doesNotMatch(sk, /Bio-conversion, Liquid/);

  links = sankeyLinks(sk);
  assert.equal(links.length, 4);
  assert.equal(links.some((l) => l.source === "Solar"), true);
  assert.equal(links.some((l) => l.target === "Liquid"), false);

  assert.throws(() => addSankeyLink(sk, "", "Target", 10), /Source node required/);
  assert.throws(() => addSankeyLink(sk, "Source", "", 10), /Target node required/);
  assert.throws(() => addSankeyLink(sk, "Source", "Target", -5), /positive number/);
  assert.throws(() => addSankeyLink(sk, "Source", "Target", "invalid"), /positive number/);
});

test("xy chart visual modeling: title, series addition, deletion, validation", () => {
  let xy = `xychart-beta
    title "System Latency vs Request Rate"
    x-axis ["100 req/s", "500 req/s", "1000 req/s"]
    y-axis "Latency (ms)" 0 --> 300
    bar [15, 28, 55]
    line [120, 160, 210]`;

  assert.equal(isXyChart({ format: "mermaid", source: xy }), true);
  let data = xyChartData(xy);
  assert.equal(data.title, "System Latency vs Request Rate");
  assert.deepEqual(data.xAxis, ["100 req/s", "500 req/s", "1000 req/s"]);
  assert.equal(data.yAxis.label, "Latency (ms)");
  assert.equal(data.yAxis.min, 0);
  assert.equal(data.yAxis.max, 300);
  assert.equal(data.series.length, 2);
  assert.equal(data.series[0].type, "bar");
  assert.deepEqual(data.series[0].values, [15, 28, 55]);
  assert.equal(data.series[1].type, "line");

  xy = updateXyChartTitle(xy, "Benchmark Latency Profile");
  assert.match(xy, /title "Benchmark Latency Profile"/);

  xy = addXyChartSeries(xy, "bar", [20, 35, 70]);
  assert.match(xy, /bar \[20, 35, 70\]/);

  xy = deleteXyChartSeries(xy, 1); // remove line series
  data = xyChartData(xy);
  assert.equal(data.series.length, 2);
  assert.equal(data.series.every((s) => s.type === "bar"), true);

  assert.throws(() => updateXyChartTitle(xy, ""), /Title required/);
  assert.throws(() => addXyChartSeries(xy, "bar", []), /numerical value required/);
  assert.throws(() => addXyChartSeries(xy, "bar", ["invalid"]), /numerical value required/);
});

test("block diagram visual modeling: columns, items, addition, deletion, validation", () => {
  let blk = `block-beta
    columns 4
    CPU["High-Performance CPU"]:2 RAM["DDR5 Memory"]:2
    NPU["Neural Accelerator"]:2 NVMe["NVMe SSD"]:2
    CPU --> RAM
    NPU --> NVMe`;

  assert.equal(isBlock({ format: "mermaid", source: blk }), true);
  assert.equal(getBlockColumns(blk), 4);

  let items = blockItems(blk);
  assert.equal(items.length, 4);
  assert.equal(items[0].id, "CPU");
  assert.equal(items[0].label, "High-Performance CPU");
  assert.equal(items[0].span, 2);
  assert.equal(items[1].id, "RAM");

  blk = setBlockColumns(blk, 6);
  assert.equal(getBlockColumns(blk), 6);
  assert.match(blk, /columns 6/);

  blk = addBlockItem(blk, "GPU", "Graphics Engine", 2);
  assert.match(blk, /GPU\["Graphics Engine"\]:2/);

  items = blockItems(blk);
  assert.equal(items.length, 5);
  assert.equal(items.some((i) => i.id === "GPU"), true);

  blk = deleteBlockItem(blk, "NPU");
  assert.doesNotMatch(blk, /NPU\[/);
  assert.doesNotMatch(blk, /NPU -->/);

  items = blockItems(blk);
  assert.equal(items.length, 4);
  assert.equal(items.some((i) => i.id === "NPU"), false);

  assert.throws(() => addBlockItem(blk, ""), /Block ID required/);
  assert.throws(() => deleteBlockItem(blk, ""), /Block ID required/);
});

test("c4 architecture visual modeling: elements, relations, addition, deletion, validation", () => {
  let c4 = `C4Context
    title Banking System Context
    Person(customer, "Personal Banking Customer", "Customer of bank")
    System(bankingSystem, "Internet Banking", "Allows account operations")
    System_Ext(mailSystem, "E-mail Subsystem", "Notification service")

    Rel(customer, bankingSystem, "Transfers funds", "HTTPS")
    Rel(bankingSystem, mailSystem, "Sends alerts", "SMTP")`;

  assert.equal(isC4({ format: "mermaid", source: c4 }), true);

  let els = c4Elements(c4);
  assert.equal(els.length, 3);
  assert.equal(els[0].id, "customer");
  assert.equal(els[0].type, "Person");
  assert.equal(els[0].label, "Personal Banking Customer");
  assert.equal(els[1].id, "bankingSystem");
  assert.equal(els[1].type, "System");

  let rels = c4Relations(c4);
  assert.equal(rels.length, 2);
  assert.equal(rels[0].from, "customer");
  assert.equal(rels[0].to, "bankingSystem");
  assert.equal(rels[0].label, "Transfers funds");
  assert.equal(rels[0].tech, "HTTPS");

  c4 = addC4Element(c4, "ContainerDb", "db", "Main Database", "Relational store", "PostgreSQL");
  assert.match(c4, /ContainerDb\(db, "Main Database", "PostgreSQL", "Relational store"\)/);

  c4 = addC4Relation(c4, "bankingSystem", "db", "Reads and writes", "TCP/5432");
  assert.match(c4, /Rel\(bankingSystem, db, "Reads and writes", "TCP\/5432"\)/);

  c4 = deleteC4Element(c4, "mailSystem");
  assert.doesNotMatch(c4, /mailSystem/);
  assert.doesNotMatch(c4, /Sends alerts/);

  c4 = deleteC4Relation(c4, "customer", "bankingSystem");
  assert.doesNotMatch(c4, /Transfers funds/);

  els = c4Elements(c4);
  assert.equal(els.some((e) => e.id === "db"), true);
  assert.equal(els.some((e) => e.id === "mailSystem"), false);

  assert.throws(() => addC4Element(c4, "System", "", "Label"), /Element ID required/);
  assert.throws(() => addC4Element(c4, "System", "id", ""), /Element label required/);
  assert.throws(() => addC4Relation(c4, "", "to", "label"), /Source element required/);
  assert.throws(() => addC4Relation(c4, "from", "", "label"), /Target element required/);
});

test("Requirement Diagram visual modeling: parsing, additions, relationships, and deletions", () => {
  let reqDoc = `requirementDiagram
    functionalRequirement req_security {
        id: 1.0
        text: User passwords must be salted and hashed
        risk: high
        verifymethod: test
    }
    performanceRequirement req_latency {
        id: 2.0
        text: Response time under 200ms
        risk: medium
        verifymethod: demonstration
    }
    element auth_service {
        type: microservice
    }
    element cache {
        type: redis
    }
    auth_service - satisfies -> req_security
    cache - satisfies -> req_latency`;

  assert.equal(isRequirement({ format: "mermaid", source: reqDoc }), true);
  assert.equal(isRequirement({ format: "mermaid", source: "flowchart TD\n A-->B" }), false);
  assert.equal(isRequirement({ format: "d2", source: reqDoc }), false);

  let items = requirementItems(reqDoc);
  assert.equal(items.length, 4);
  const req1 = items.find((i) => i.name === "req_security");
  assert.equal(req1.type, "functionalRequirement");
  assert.equal(req1.id, "1.0");
  assert.equal(req1.risk, "high");
  assert.equal(req1.verify, "test");
  assert.equal(req1.text, "User passwords must be salted and hashed");

  const el1 = items.find((i) => i.name === "auth_service");
  assert.equal(el1.category, "element");
  assert.equal(el1.elementType, "microservice");

  let rels = requirementRelations(reqDoc);
  assert.equal(rels.length, 2);
  assert.equal(rels[0].from, "auth_service");
  assert.equal(rels[0].type, "satisfies");
  assert.equal(rels[0].to, "req_security");

  reqDoc = addRequirement(
    reqDoc,
    "interfaceRequirement",
    "req_api",
    "3.0",
    "RESTful endpoints for all actions",
    "low",
    "inspection",
  );
  assert.match(reqDoc, /interfaceRequirement req_api/);
  assert.match(reqDoc, /id: 3\.0/);

  reqDoc = addRequirementElement(reqDoc, "gateway", "proxy");
  assert.match(reqDoc, /element gateway/);
  assert.match(reqDoc, /type: proxy/);

  reqDoc = addRequirementRelation(reqDoc, "gateway", "req_api", "traces");
  assert.match(reqDoc, /gateway - traces -> req_api/);

  reqDoc = deleteRequirement(reqDoc, "req_security");
  assert.doesNotMatch(reqDoc, /req_security/);
  assert.doesNotMatch(reqDoc, /User passwords must be salted/);
  assert.doesNotMatch(reqDoc, /auth_service - satisfies -> req_security/);

  reqDoc = deleteRequirementRelation(reqDoc, "cache", "req_latency");
  assert.doesNotMatch(reqDoc, /cache - satisfies -> req_latency/);

  items = requirementItems(reqDoc);
  assert.equal(items.some((i) => i.name === "req_api"), true);
  assert.equal(items.some((i) => i.name === "gateway"), true);
  assert.equal(items.some((i) => i.name === "req_security"), false);

  assert.throws(() => addRequirement(reqDoc, "functionalRequirement", ""), /Requirement name required/);
  assert.throws(() => addRequirementElement(reqDoc, ""), /Element name required/);
  assert.throws(() => deleteRequirement(reqDoc, ""), /Name required/);
  assert.throws(() => addRequirementRelation(reqDoc, "", "to"), /Source element required/);
  assert.throws(() => addRequirementRelation(reqDoc, "from", ""), /Target requirement required/);
  assert.throws(() => deleteRequirementRelation(reqDoc, "", "to"), /From and To required/);
});












