/**
 * Lucidchart CSV and JSON (.lucid) importer for NodeFlow.
 * Converts Lucidchart shapes and line connections into valid Mermaid flowcharts.
 */

export function parseLucidchartToMermaid(input) {
  if (!input) throw new Error("Empty or missing Lucidchart input.");
  const text = typeof input === "string" ? input.trim() : JSON.stringify(input);

  // 1. JSON mode (Lucidchart JSON / .lucid export)
  if (text.startsWith("{") || text.startsWith("[")) {
    try {
      const data = JSON.parse(text);
      const nodes = new Map();
      const edges = [];
      const pages = Array.isArray(data.pages)
        ? data.pages
        : Array.isArray(data)
          ? data
          : [data];

      for (const page of pages) {
        const shapes = page.shapes || page.blocks || page.elements || [];
        for (const s of shapes) {
          const id = String(s.id || s._id || `node_${nodes.size + 1}`).replace(
            /[^A-Za-z0-9_]/g,
            "_",
          );
          const label = s.text || s.name || s.label || id;
          nodes.set(id, label);
        }
        const lines = page.lines || page.connections || page.edges || [];
        for (const l of lines) {
          const from = String(l.from || l.source || l.lineSource || "").replace(
            /[^A-Za-z0-9_]/g,
            "_",
          );
          const to = String(l.to || l.target || l.lineDestination || "").replace(
            /[^A-Za-z0-9_]/g,
            "_",
          );
          const label = l.text || l.label || "";
          if (from && to) edges.push({ from, to, label });
        }
      }

      if (nodes.size === 0) {
        throw new Error("No shapes found in Lucidchart JSON model.");
      }

      const linesOut = ["flowchart TD"];
      for (const [id, label] of nodes) {
        linesOut.push(`  ${id}["${label.replace(/"/g, "&quot;")}"]`);
      }
      for (const e of edges) {
        const lbl = e.label ? `|"${e.label.replace(/"/g, "&quot;")}"|` : "";
        linesOut.push(`  ${e.from} -->${lbl} ${e.to}`);
      }
      return linesOut.join("\n");
    } catch (err) {
      if (!text.includes(",")) throw err;
    }
  }

  // 2. CSV mode (Lucidchart CSV export)
  const rawLines = text
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0 && !l.trim().startsWith("#"));
  if (rawLines.length < 2) {
    throw new Error("Lucidchart CSV requires at least a header and one row.");
  }

  const splitRow = (line) => {
    const cells = [];
    let cur = "";
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        q = !q;
        continue;
      }
      if (ch === "," && !q) {
        cells.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    cells.push(cur.trim());
    return cells;
  };

  const headers = splitRow(rawLines[0]).map((h) => h.trim().toLowerCase());
  const idIdx = headers.findIndex((h) => h === "id" || h === "shape id");
  const textIdx = headers.findIndex(
    (h) => h.includes("text area") || h === "text" || h === "label",
  );
  const nameIdx = headers.findIndex((h) => h === "name");
  const srcIdx = headers.findIndex(
    (h) => h.includes("line source") || h === "source",
  );
  const dstIdx = headers.findIndex(
    (h) => h.includes("line destination") || h === "destination" || h === "target",
  );

  const nodes = new Map();
  const edges = [];

  for (let i = 1; i < rawLines.length; i++) {
    const cols = splitRow(rawLines[i]);
    const id = cols[idIdx];
    const src = cols[srcIdx];
    const dst = cols[dstIdx];
    const label =
      (textIdx >= 0 && cols[textIdx]) ||
      (nameIdx >= 0 && cols[nameIdx]) ||
      id;

    if (id && label && !src && !dst) {
      const cleanId = String(id).replace(/[^A-Za-z0-9_]/g, "_");
      nodes.set(cleanId, label);
    } else if (src && dst) {
      const from = String(src).replace(/[^A-Za-z0-9_]/g, "_");
      const to = String(dst).replace(/[^A-Za-z0-9_]/g, "_");
      edges.push({ from, to, label: (textIdx >= 0 && cols[textIdx]) || "" });
    }
  }

  if (nodes.size === 0) {
    throw new Error("No visual shapes or nodes extracted from Lucidchart CSV.");
  }

  const out = ["flowchart TD"];
  for (const [id, label] of nodes) {
    out.push(`  ${id}["${label.replace(/"/g, "&quot;")}"]`);
  }
  for (const e of edges) {
    const lbl = e.label ? `|"${e.label.replace(/"/g, "&quot;")}"|` : "";
    out.push(`  ${e.from} -->${lbl} ${e.to}`);
  }
  return out.join("\n");
}
