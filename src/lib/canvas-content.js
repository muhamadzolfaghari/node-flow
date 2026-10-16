// Content the user actually reads on the canvas: nodes and clusters, their labels,
// and the edges that join them.
//
// Bare shapes are excluded on purpose. Timeline, gantt and roadmap renderers draw
// axis lines, bands and scaffolding as stray `rect` / `path.node-bkg` elements well
// outside the drawing; counting those dragged the framing centre off the diagram
// (measured: 40px off on the product-roadmap template).
//
// Shared by the canvas fit (components/CanvasStage.jsx) and the framing audit
// (scripts/audit-canvas-framing.mjs) so the definition cannot drift between the
// implementation and the check that verifies it.
export const CANVAS_CONTENT_SELECTOR = [
  "g.node",
  "g.cluster",
  "g.entity",
  "g.actor",
  "g.classGroup",
  "g.taskWrapper",
  "g.eventWrapper",
  "g.lineWrapper",
  "g.edgePaths path",
  "path.flowchart-link",
  "path.relation",
  "path.pieCircle",
  "path.pie-slice",
  "g.pieCircle",
  "g.slice",
  "circle.commit",
  "circle.point",
  "circle.quadrant-point",
  "rect.block",
  "g.block",
  "g.quadrant",
  "foreignObject",
  "text",
  ".nodeLabel",
  ".edgeLabel",
  ".legend",
].join(", ");
