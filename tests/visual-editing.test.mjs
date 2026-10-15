import test from "node:test";
import assert from "node:assert/strict";
import {
  flowchartNodes,
  renameFlowchartNode,
  addFlowchartNode,
  connectFlowchartNodes,
  deleteFlowchartNode,
  changeFlowchartNodeShape,
  getFlowchartNodeShape,
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
  assert.throws(
    () => connectFlowchartNodes(next, "missing", "node2"),
    /existing nodes/,
  );
});
test("deleting a node removes declaration and connected edges", () => {
  const source = "flowchart LR\n  A[Client] --> B[Server]\n  B --> C[Database]\n  D[Standalone]";
  const next = deleteFlowchartNode(source, "B");
  assert.equal(next.includes("B[Server]"), false);
  assert.equal(next.includes("A --> B"), false);
  assert.equal(next.includes("B --> C"), false);
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


