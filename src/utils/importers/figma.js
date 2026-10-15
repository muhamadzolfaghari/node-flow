/**
 * Figma / FigJam (.fig / .figjam / Figma JSON) Importer
 * Converts Figma frames, components, FigJam sticky notes, shapes, and connector lines
 * into structured visual diagrams (Mermaid flowchart).
 */

function sanitizeId(str) {
  return String(str)
    .trim()
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "") || "node";
}

function cleanLabel(str) {
  return String(str)
    .replace(/[\[\]\(\)\{\}\"\\;]/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function parseFigmaToMermaid(source) {
  if (!source || typeof source !== "string") {
    return "flowchart TD\n  Start[Figma Canvas]";
  }

  const trimmed = source.trim();

  // 1. Try parsing JSON (Figma REST Document or FigJam Board)
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const data = JSON.parse(trimmed);
      const nodes = new Map();
      const edges = [];

      function traverse(obj) {
        if (!obj || typeof obj !== "object") return;

        // Figma Node Detection
        if (obj.id && (obj.name || obj.characters || obj.type)) {
          const rawId = String(obj.id);
          const id = sanitizeId(rawId);
          const type = (obj.type || "").toUpperCase();
          const label = cleanLabel(obj.characters || obj.name || `${type} ${id}`);

          if (["FRAME", "COMPONENT", "INSTANCE", "GROUP", "RECTANGLE", "STICKY", "SHAPE_WITH_TEXT"].includes(type)) {
            const shape = type === "STICKY" ? `[/"${label}"/]`
              : type === "COMPONENT" ? `[["${label}"]]`
              : `["${label}"]`;
            nodes.set(id, { id, label, shape });
          } else if (type === "CONNECTOR") {
            const startId = obj.connectorStart?.endpointNodeId;
            const endId = obj.connectorEnd?.endpointNodeId;
            const text = cleanLabel(obj.characters || "");
            if (startId && endId) {
              edges.push({ from: sanitizeId(startId), to: sanitizeId(endId), label: text });
            }
          }
        }

        // Recursive traversal
        if (Array.isArray(obj.children)) {
          for (const child of obj.children) traverse(child);
        }
        if (Array.isArray(obj.nodes)) {
          for (const child of obj.nodes) traverse(child);
        }
        if (obj.document) traverse(obj.document);
        if (Array.isArray(obj.elements)) {
          for (const child of obj.elements) traverse(child);
        }
      }

      traverse(data);

      if (nodes.size >= 2) {
        const out = ["flowchart TD"];
        const nodeList = [...nodes.values()];
        for (const n of nodeList) {
          out.push(`  ${n.id}${n.shape}`);
        }

        if (edges.length > 0) {
          for (const e of edges) {
            if (nodes.has(e.from) && nodes.has(e.to)) {
              if (e.label) out.push(`  ${e.from} -->|"${e.label}"| ${e.to}`);
              else out.push(`  ${e.from} --> ${e.to}`);
            }
          }
        } else {
          // Sequential fallback connection
          for (let i = 0; i < nodeList.length - 1; i++) {
            out.push(`  ${nodeList[i].id} --> ${nodeList[i + 1].id}`);
          }
        }

        return out.join("\n");
      }
    } catch (e) {
      // not JSON or parse error, fall through to text outline
    }
  }

  // 2. Text Outline: Frame / Component / Sticky Syntax
  const lines = trimmed.split("\n");
  const nodes = new Map();
  const edges = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line.startsWith("//")) continue;

    // A -> B : Label
    const connMatch = line.match(/^["']?([^"'-]+?)["']?\s*(?:-->|->)\s*["']?([^"':]+?)["']?(?:\s*:\s*(.+))?$/);
    if (connMatch) {
      const fromLabel = cleanLabel(connMatch[1]);
      const toLabel = cleanLabel(connMatch[2]);
      const edgeText = connMatch[3] ? cleanLabel(connMatch[3]) : "";
      const fromId = sanitizeId(fromLabel);
      const toId = sanitizeId(toLabel);
      if (!nodes.has(fromId)) nodes.set(fromId, { id: fromId, label: fromLabel, shape: `["${fromLabel}"]` });
      if (!nodes.has(toId)) nodes.set(toId, { id: toId, label: toLabel, shape: `["${toLabel}"]` });
      edges.push({ from: fromId, to: toId, label: edgeText });
      continue;
    }

    // Frame "Home" or Component "Button" or Sticky "Idea"
    const declMatch = line.match(/^(Frame|Component|Sticky|Section)\s+["']?([^"']+)["']?/i);
    if (declMatch) {
      const type = declMatch[1].toUpperCase();
      const label = cleanLabel(declMatch[2]);
      const id = sanitizeId(label);
      const shape = type === "STICKY" ? `[/"${label}"/]`
        : type === "COMPONENT" ? `[["${label}"]]`
        : `["${label}"]`;
      nodes.set(id, { id, label, shape });
    }
  }

  if (nodes.size >= 2) {
    const out = ["flowchart TD"];
    const nodeList = [...nodes.values()];
    for (const n of nodeList) {
      out.push(`  ${n.id}${n.shape}`);
    }
    if (edges.length > 0) {
      for (const e of edges) {
        if (e.label) out.push(`  ${e.from} -->|"${e.label}"| ${e.to}`);
        else out.push(`  ${e.from} --> ${e.to}`);
      }
    } else {
      for (let i = 0; i < nodeList.length - 1; i++) {
        out.push(`  ${nodeList[i].id} --> ${nodeList[i + 1].id}`);
      }
    }
    return out.join("\n");
  }

  // Default sample
  return `flowchart TD
  Frame1["Design Tokens & Variables"] --> Frame2["UI Component Library"]
  Frame2 --> Frame3["Interactive Prototype"]
  Frame3 --> Sticky1[/"Handoff & Design Specs"/]`;
}
