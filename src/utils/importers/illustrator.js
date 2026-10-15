/**
 * Adobe Illustrator (.ai / .ait / Illustrator SVG) Importer
 * Converts Adobe Illustrator artboards, vector layers, labeled groups, and path objects
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

export function parseIllustratorToMermaid(source) {
  if (!source || typeof source !== "string") {
    return "flowchart TD\n  Start[Illustrator Artboard]";
  }

  const trimmed = source.trim();

  // 1. Text-based Layer / Artboard Specification (AI Layer Outline)
  if (
    /^(?:Artboard|Layer|Group)\b/im.test(trimmed) ||
    /->|-->/.test(trimmed)
  ) {
    const lines = trimmed.split("\n");
    const nodes = new Map();
    const edges = [];
    let currentGroup = null;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#") || line.startsWith("%")) continue;

      // Group / Artboard start
      const artboardMatch = line.match(/^(?:Artboard|Group)\s+["']?([^"']+)["']?/i);
      if (artboardMatch) {
        currentGroup = cleanLabel(artboardMatch[1]);
        continue;
      }

      // Connection: A -> B : Label
      const connMatch = line.match(/^["']?([^"'-]+?)["']?\s*(?:-->|->)\s*["']?([^"':]+?)["']?(?:\s*:\s*(.+))?$/);
      if (connMatch) {
        const fromLabel = cleanLabel(connMatch[1]);
        const toLabel = cleanLabel(connMatch[2]);
        const edgeText = connMatch[3] ? cleanLabel(connMatch[3]) : "";
        const fromId = sanitizeId(fromLabel);
        const toId = sanitizeId(toLabel);

        if (!nodes.has(fromId)) nodes.set(fromId, { id: fromId, label: fromLabel });
        if (!nodes.has(toId)) nodes.set(toId, { id: toId, label: toLabel });

        edges.push({ from: fromId, to: toId, label: edgeText });
        continue;
      }

      // Layer declaration: Layer "Frontend" [rect]
      const layerMatch = line.match(/^Layer\s+["']?([^"']+)["']?(?:\s*\[(\w+)\])?/i);
      if (layerMatch) {
        const label = cleanLabel(layerMatch[1]);
        const id = sanitizeId(label);
        const shape = (layerMatch[2] || "rect").toLowerCase();
        nodes.set(id, { id, label, shape, group: currentGroup });
      }
    }

    if (nodes.size > 0 || edges.length > 0) {
      const out = ["flowchart TD"];
      const renderedGroups = new Set();

      for (const node of nodes.values()) {
        const shapeBracket = node.shape === "cylinder" ? `[(${node.label})]`
          : node.shape === "circle" ? `((${node.label}))`
          : node.shape === "rounded" ? `(${node.label})`
          : `[${node.label}]`;
        out.push(`  ${node.id}${shapeBracket}`);
      }

      for (const edge of edges) {
        if (edge.label) {
          out.push(`  ${edge.from} -->|"${edge.label}"| ${edge.to}`);
        } else {
          out.push(`  ${edge.from} --> ${edge.to}`);
        }
      }

      return out.join("\n");
    }
  }

  // 2. Adobe Illustrator SVG / XML Parser
  try {
    const parser = typeof DOMParser !== "undefined" ? new DOMParser() : null;
    if (parser) {
      const doc = parser.parseFromString(trimmed, "image/svg+xml");
      if (!doc.querySelector("parsererror")) {
        const nodes = [];
        const edges = [];
        const textElements = [...doc.querySelectorAll("text")];
        const groupElements = [...doc.querySelectorAll("g[id]")];
        const rectElements = [...doc.querySelectorAll("rect, circle, ellipse, polygon, path")];
        const lineElements = [...doc.querySelectorAll("line, polyline")];

        // Gather text labels
        const labels = textElements
          .map((t) => (t.textContent || "").trim())
          .filter((t) => t.length > 0 && t.length < 80);

        if (labels.length >= 2) {
          for (let i = 0; i < labels.length; i++) {
            const id = `node_${i + 1}`;
            nodes.push({ id, label: cleanLabel(labels[i]) });
            if (i > 0) {
              edges.push({ from: `node_${i}`, to: id });
            }
          }
        } else if (groupElements.length >= 2) {
          for (let i = 0; i < groupElements.length; i++) {
            const g = groupElements[i];
            const rawId = g.getAttribute("id") || `layer_${i + 1}`;
            const id = sanitizeId(rawId);
            const textChild = g.querySelector("text");
            const label = cleanLabel(textChild?.textContent || rawId.replace(/_/g, " "));
            nodes.push({ id, label });
            if (i > 0) {
              edges.push({ from: nodes[i - 1].id, to: id });
            }
          }
        } else if (rectElements.length >= 2) {
          for (let i = 0; i < Math.min(rectElements.length, 12); i++) {
            const el = rectElements[i];
            const rawId = el.getAttribute("id") || `shape_${i + 1}`;
            const id = sanitizeId(rawId);
            const label = cleanLabel(rawId.replace(/_/g, " "));
            nodes.push({ id, label });
            if (i > 0) {
              edges.push({ from: nodes[i - 1].id, to: id });
            }
          }
        }

        if (nodes.length >= 2) {
          const out = ["flowchart TD"];
          for (const n of nodes) {
            out.push(`  ${n.id}["${n.label}"]`);
          }
          for (const e of edges) {
            out.push(`  ${e.from} --> ${e.to}`);
          }
          return out.join("\n");
        }
      }
    }
  } catch (err) {
    // fallback to regex extraction
  }

  // 3. Fallback: Extract labels from XML tags or PostScript comments
  const extractedLabels = [];
  const textMatches = trimmed.matchAll(/<text\b[^>]*>(.*?)<\/text>/gi);
  for (const match of textMatches) {
    const t = cleanLabel(match[1].replace(/<[^>]+>/g, ""));
    if (t && !extractedLabels.includes(t)) extractedLabels.push(t);
  }

  const layerMatches = trimmed.matchAll(/(?:%AI5_BeginLayer|Layer|id=)["']([^"'\n]+)["']/gi);
  for (const match of layerMatches) {
    const l = cleanLabel(match[1]);
    if (l && !extractedLabels.includes(l) && l.length < 50) extractedLabels.push(l);
  }

  if (extractedLabels.length >= 2) {
    const out = ["flowchart TD"];
    for (let i = 0; i < Math.min(extractedLabels.length, 10); i++) {
      const id = `ai_${i + 1}`;
      out.push(`  ${id}["${extractedLabels[i]}"]`);
      if (i > 0) {
        out.push(`  ai_${i} --> ${id}`);
      }
    }
    return out.join("\n");
  }

  // Default sample conversion
  return `flowchart TD
  Artboard["Illustrator Artboard"] --> Layer1["Vector Graphics Layer"]
  Layer1 --> Layer2["Object Components & Paths"]
  Layer2 --> Export["SVG / Vector Asset"]`;
}
