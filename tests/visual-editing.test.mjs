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



