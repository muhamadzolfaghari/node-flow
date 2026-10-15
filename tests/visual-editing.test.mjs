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



