/**
 * Miro (.miro / Miro board JSON) Importer
 * Converts Miro board items, sticky notes, cards, shapes, and connector lines
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
    .replace(/<[^>]+>/g, " ")
    .replace(/[\[\]\(\)\{\}\"\\;]/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function parseMiroToMermaid(source) {
  if (!source || typeof source !== "string") {
    return "flowchart TD\n  Start[Miro Canvas]";
  }

  const trimmed = source.trim();

  // 1. JSON Board Format
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const data = JSON.parse(trimmed);
      const items = Array.isArray(data) ? data : data.items || data.widgets || [];
      const nodes = new Map();
      const edges = [];

      for (const it of items) {
        const id = sanitizeId(it.id || it.widgetId || `item_${nodes.size + 1}`);
        const type = (it.type || "").toLowerCase();
        const content = cleanLabel(
          it.data?.content ||
          it.data?.title ||
          it.data?.text ||
          it.plainText ||
          it.text ||
          ""
        );

        if (["connector", "line"].includes(type)) {
          const fromId = sanitizeId(it.startItem?.id || it.startWidget?.id || it.start?.item);
          const toId = sanitizeId(it.endItem?.id || it.endWidget?.id || it.end?.item);
          const caption = cleanLabel(it.caption || it.data?.caption || "");
          if (fromId && toId) {
            edges.push({ from: fromId, to: toId, label: caption });
          }
        } else if (content) {
          const shape = type === "sticky_note" ? `[/"${content}"/]`
            : type === "card" ? `[["${content}"]]`
            : `["${content}"]`;
          nodes.set(id, { id, label: content, shape });
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
            if (nodes.has(e.from) && nodes.has(e.to)) {
              if (e.label) out.push(`  ${e.from} -->|"${e.label}"| ${e.to}`);
              else out.push(`  ${e.from} --> ${e.to}`);
            }
          }
        } else {
          for (let i = 0; i < nodeList.length - 1; i++) {
            out.push(`  ${nodeList[i].id} --> ${nodeList[i + 1].id}`);
          }
        }
        return out.join("\n");
      }
    } catch (e) {
      // not JSON
    }
  }

  // 2. Text Outline: Miro Sticky / Card syntax
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

    const declMatch = line.match(/^(Sticky|Card|Shape|Frame)\s+["']?([^"']+)["']?/i);
    if (declMatch) {
      const type = declMatch[1].toUpperCase();
      const label = cleanLabel(declMatch[2]);
      const id = sanitizeId(label);
      const shape = type === "STICKY" ? `[/"${label}"/]`
        : type === "CARD" ? `[["${label}"]]`
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

  // 3. Default Miro Sample
  return `flowchart TD
  Sticky1[/"Sprint Backlog & Planning"/] --> Sticky2[/"In Progress & Architecture"/]
  Sticky2 --> Sticky3[/"Quality Review & QA"/]
  Sticky3 --> Sticky4[/"Production Release"/]`;
}
