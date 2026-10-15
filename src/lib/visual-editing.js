const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const safeLabel = (label) =>
  label
    .trim()
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/[\r\n]/g, " ");
export const SHAPES = {
  rectangle: { open: "[", close: "]", label: "Rectangle" },
  rounded: { open: "(", close: ")", label: "Rounded" },
  stadium: { open: "([", close: "])", label: "Stadium / Pill" },
  subroutine: { open: "[[", close: "]]", label: "Subroutine" },
  cylinder: { open: "[(", close: ")]", label: "Cylinder / DB" },
  circle: { open: "((", close: "))", label: "Circle" },
  diamond: { open: "{", close: "}", label: "Diamond / Decision" },
  hexagon: { open: "{{", close: "}}", label: "Hexagon" },
};

export const FLOWCHART_DIRECTIONS = {
  TD: { id: "TD", label: "Top to bottom (TD)" },
  LR: { id: "LR", label: "Left to right (LR)" },
  BT: { id: "BT", label: "Bottom to top (BT)" },
  RL: { id: "RL", label: "Right to left (RL)" },
};

export const isFlowchart = (doc) =>
  doc?.format === "mermaid" &&
  /^\s*(flowchart|graph)\s+(TD|TB|BT|LR|RL)\b/m.test(doc.source);

export function getFlowchartDirection(source) {
  const match = source.match(/^\s*(?:flowchart|graph)\s+(TD|TB|BT|LR|RL)\b/m);
  if (!match) return "TD";
  const dir = match[1].toUpperCase();
  return dir === "TB" ? "TD" : dir;
}

export function changeFlowchartDirection(source, newDir) {
  const targetDir = newDir?.toUpperCase();
  const valid = ["TD", "TB", "BT", "LR", "RL"].includes(targetDir);
  if (!valid) throw new Error("Invalid flowchart direction.");
  const pattern = /^(\s*(?:flowchart|graph)\s+)(TD|TB|BT|LR|RL)\b/m;
  if (!pattern.test(source)) {
    throw new Error("No flowchart direction directive found.");
  }
  return source.replace(pattern, `$1${targetDir}`);
}

export function flowchartNodes(source) {
  const nodes = new Map();
  for (const match of source.matchAll(
    /\b([A-Za-z_][\w-]*)\s*(\[\[|\(\(|\(\[|\[\(|\{\{|\{|\(|\[)([^\n]*?)(\]\]|\)\)|\]\)|\)\]|\}\}|\}|\)|\])/g,
  )) {
    if (!["subgraph", "classDef", "style"].includes(match[1])) {
      const open = match[2];
      let shape = "rectangle";
      for (const [key, val] of Object.entries(SHAPES)) {
        if (val.open === open) {
          shape = key;
          break;
        }
      }
      nodes.set(match[1], {
        id: match[1],
        label: match[3].replace(/^"|"$/g, ""),
        shape,
      });
    }
  }
  return [...nodes.values()];
}

export function getFlowchartNodeShape(source, id) {
  const pattern = new RegExp(
    `\\b${escapeRegex(id)}\\s*(\\[\\[|\\(\\(|\\(\\[|\\[\\(|\\{\\{|\\{|\\[|\\()`,
  );
  const match = source.match(pattern);
  if (!match) return "rectangle";
  const open = match[1];
  for (const [key, val] of Object.entries(SHAPES)) {
    if (val.open === open) return key;
  }
  return "rectangle";
}

export function changeFlowchartNodeShape(source, id, shapeType) {
  const shape = SHAPES[shapeType];
  if (!shape) throw new Error("Unsupported shape.");
  const pattern = new RegExp(
    `(\\b${escapeRegex(id)}\\s*)(\\[\\[|\\(\\(|\\(\\[|\\[\\(|\\{\\{|\\{|\\[|\\()([^\\n]*?)(\\]\\]|\\)\\)|\\]\\)|\\)\\]|\\}\\}|\\}|\\]|\\))`,
  );
  if (!pattern.test(source)) {
    throw new Error("This node is not declared with an editable shape.");
  }
  return source.replace(
    pattern,
    (_, prefix, _open, content) =>
      `${prefix}${shape.open}${content}${shape.close}`,
  );
}

export function renameFlowchartNode(source, id, label) {
  const pattern = new RegExp(
    `(\\b${escapeRegex(id)}\\s*)(\\[\\[|\\(\\(|\\(\\[|\\[\\(|\\{\\{|\\{|\\[|\\()([^\\n]*?)(\\]\\]|\\)\\)|\\]\\)|\\)\\]|\\}\\}|\\}|\\]|\\))`,
  );
  if (!pattern.test(source))
    throw new Error(
      "This node is not declared with an editable label. Edit its declaration in the source.",
    );
  return source.replace(
    pattern,
    (_, prefix, open, old, close) =>
      `${prefix}${open}"${safeLabel(label)}"${close}`,
  );
}

export function addFlowchartNode(source, label, shapeType = "rectangle") {
  if (!label.trim()) throw new Error("Enter a node label.");
  const shape = SHAPES[shapeType] || SHAPES.rectangle;
  let number = 1;
  while (new RegExp(`\\bnode${number}\\b`).test(source)) number++;
  return `${source.trimEnd()}\n  node${number}${shape.open}"${safeLabel(label)}"${shape.close}\n`;
}
export const ARROW_STYLES = {
  solid: { symbol: "-->", label: "Solid arrow (-->)" },
  dotted: { symbol: "-.->", label: "Dotted arrow (-.->)" },
  thick: { symbol: "==>", label: "Thick arrow (==>)" },
  open: { symbol: "---", label: "Open line (---)" },
  dottedOpen: { symbol: "-.-", label: "Dotted line (-.-)" },
  thickOpen: { symbol: "===", label: "Thick line (===)" },
};

export function connectFlowchartNodes(source, from, to, label = "", arrowType = "solid") {
  const nodes = flowchartNodes(source);
  if (!nodes.some((n) => n.id === from) || !nodes.some((n) => n.id === to))
    throw new Error("Choose two existing nodes.");
  const arrow = ARROW_STYLES[arrowType]?.symbol || "-->";
  return `${source.trimEnd()}\n  ${from} ${arrow}${label.trim() ? `|"${safeLabel(label)}"|` : ""} ${to}\n`;
}

const NODE_DECL_PATTERN =
  "[A-Za-z_][\\w-]*(?:\\s*(?:\\[\\[|\\(\\(|\\(\\[|\\[\\(|\\{\\{|\\{|\\[|\\()[^\\n\\]\\)\\}]+(?:\\]\\]|\\)\\)|\\]\\)|\\)\\]|\\}\\}|\\}|\\]|\\)))?";

export function flowchartEdges(source) {
  const edges = [];
  const lines = source.split("\n");
  const inlineRegex = new RegExp(
    `\\b([A-Za-z_][\\w-]*)(?:\\s*(?:\\[\\[|\\(\\(|\\(\\[|\\[\\(|\\{\\{|\\{|\\[|\\()[^\\n\\]\\)\\}]+(?:\\]\\]|\\)\\)|\\]\\)|\\)\\]|\\}\\}|\\}|\\]|\\)))?\\s*(?:--|==|-\\.)\\s+(?:"([^"\\n]+)"|([^\\n-]+?))\\s+(-->|==>|\\.->|---|===)\\s*([A-Za-z_][\\w-]*)`,
  );
  const pipeRegex = new RegExp(
    `\\b([A-Za-z_][\\w-]*)(?:\\s*(?:\\[\\[|\\(\\(|\\(\\[|\\[\\(|\\{\\{|\\{|\\[|\\()[^\\n\\]\\)\\}]+(?:\\]\\]|\\)\\)|\\]\\)|\\)\\]|\\}\\}|\\}|\\]|\\)))?\\s*([-.~=]+>|[-.~=]+)(?:\\|"?([^"|\\n]*?)"?\\|)?\\s*([A-Za-z_][\\w-]*)`,
  );

  for (const line of lines) {
    if (/^\s*(?:flowchart|graph|subgraph|classDef|style|click)\b/i.test(line)) continue;
    const inlineMatch = line.match(inlineRegex);
    if (inlineMatch) {
      const from = inlineMatch[1];
      const label = (inlineMatch[2] || inlineMatch[3] || "").trim();
      const symbol = inlineMatch[4];
      const to = inlineMatch[5];
      if (from && to && !["subgraph", "classDef", "style"].includes(from)) {
        edges.push({ from, to, label, symbol });
        continue;
      }
    }
    const match = line.match(pipeRegex);
    if (match) {
      const from = match[1];
      const symbol = match[2];
      const label = (match[3] || "").trim();
      const to = match[4];
      if (from && to && !["subgraph", "classDef", "style"].includes(from)) {
        edges.push({ from, to, label, symbol });
      }
    }
  }
  return edges;
}

export function deleteFlowchartEdge(source, from, to) {
  if (!from || !to) throw new Error("Choose two connected nodes.");
  const lines = source.split("\n");
  const result = [];
  let deleted = false;

  const pipePattern = new RegExp(
    `^(\\s*)(${NODE_DECL_PATTERN})\\s*([-.~=]+>|[-.~=]+)(?:\\|[^|\\n]*\\|)?\\s*(${NODE_DECL_PATTERN})\\s*$`,
  );
  const inlinePattern = new RegExp(
    `^(\\s*)(${NODE_DECL_PATTERN})\\s*(?:--|==|-\\.)\\s+(?:"[^"\\n]+"|[^\\n-]+?)\\s+(?:-->|==>|\\.->|---|===)\\s*(${NODE_DECL_PATTERN})\\s*$`,
  );

  for (const line of lines) {
    const pipeMatch = line.match(pipePattern);
    const inlineMatch = line.match(inlinePattern);
    const match = pipeMatch || inlineMatch;
    if (!deleted && match) {
      const fromPart = match[2].trim();
      const toPart = (pipeMatch ? match[4] : match[3]).trim();
      const fromId = fromPart.match(/^([A-Za-z_][\w-]*)/)?.[1];
      const toId = toPart.match(/^([A-Za-z_][\w-]*)/)?.[1];
      if (fromId === from && toId === to) {
        deleted = true;
        const hasFromDecl = /[\[\(\{]/.test(fromPart);
        const hasToDecl = /[\[\(\{]/.test(toPart);
        if (hasFromDecl) result.push(`  ${fromPart}`);
        if (hasToDecl) result.push(`  ${toPart}`);
        continue;
      }
    }
    result.push(line);
  }

  if (!deleted) {
    throw new Error(`No connection found from ${from} to ${to}.`);
  }
  return result.join("\n");
}

export function addFlowchartChild(
  source,
  parentId,
  label = "New step",
  arrowType = "solid",
  shapeType = "rectangle",
) {
  const nodes = flowchartNodes(source);
  if (!nodes.some((n) => n.id === parentId)) {
    throw new Error(`Node ${parentId} does not exist.`);
  }
  let number = nodes.length + 1;
  while (new RegExp(`\\bnode${number}\\b`).test(source)) number++;
  const childId = `node${number}`;
  const arrow = ARROW_STYLES[arrowType]?.symbol || "-->";
  const shape = SHAPES[shapeType] || SHAPES.rectangle;
  const childDecl = `${childId}${shape.open}"${safeLabel(label)}"${shape.close}`;
  const updated = `${source.trimEnd()}\n  ${parentId} ${arrow} ${childDecl}\n`;
  return { source: updated, childId, childLabel: label };
}

export function deleteFlowchartNode(source, id) {
  if (!id) throw new Error("Choose a node to delete.");
  const escaped = escapeRegex(id);
  const lines = source.split("\n");
  const result = [];

  for (const line of lines) {
    if (new RegExp(`^\\s*${escaped}\\s*(\\[\\[|\\(\\(|\\(\\[|\\{|\\[|\\().*(\\]\\]|\\)\\)|\\]\\)|\\}|\\)|\\])\\s*$`).test(line)) {
      continue;
    }
    if (new RegExp(`^\\s*style\\s+${escaped}\\b`).test(line)) {
      continue;
    }
    if (/[-.=~]+>/.test(line)) {
      if (new RegExp(`^\\s*${escaped}\\b`).test(line)) {
        const toMatch = line.match(/[-.=~]+>(?:\|[^|]*\|)?\s*([A-Za-z_][\w-]*\s*(?:\[\[|\(\(|\(\[|\{|\(|\[).*?(?:\]\]|\)\)|\)|\]\)|\}|\]))/);
        if (toMatch && !new RegExp(`^${escaped}\\b`).test(toMatch[1])) {
          result.push(`  ${toMatch[1]}`);
        }
        continue;
      }
      if (new RegExp(`[-.=~]+>.*\\b${escaped}\\b`).test(line)) {
        const fromMatch = line.match(/^(\s*[A-Za-z_][\w-]*\s*(?:\[\[|\(\(|\(\[|\{|\(|\[).*?(?:\]\]|\)\)|\)|\]\)|\}|\]))\s*[-.=~]+>/);
        if (fromMatch && !new RegExp(`\\b${escaped}\\b`).test(fromMatch[1])) {
          result.push(fromMatch[1]);
        }
        continue;
      }
    }
    result.push(line);
  }
  return result.join("\n");
}

export const COLOR_PRESETS = {
  default: { label: "Default", color: "#3b82f6" },
  blue: { label: "Blue", style: "fill:#1e3a8a,stroke:#3b82f6,stroke-width:2px,color:#ffffff", color: "#3b82f6" },
  emerald: { label: "Emerald", style: "fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#ffffff", color: "#10b981" },
  amber: { label: "Amber", style: "fill:#78350f,stroke:#f59e0b,stroke-width:2px,color:#ffffff", color: "#f59e0b" },
  rose: { label: "Rose", style: "fill:#881337,stroke:#f43f5e,stroke-width:2px,color:#ffffff", color: "#f43f5e" },
  violet: { label: "Violet", style: "fill:#4c1d95,stroke:#8b5cf6,stroke-width:2px,color:#ffffff", color: "#8b5cf6" },
  cyan: { label: "Cyan", style: "fill:#164e63,stroke:#06b6d4,stroke-width:2px,color:#ffffff", color: "#06b6d4" },
  slate: { label: "Slate", style: "fill:#1e293b,stroke:#64748b,stroke-width:2px,color:#ffffff", color: "#64748b" },
};

export function styleFlowchartNode(source, id, colorKey) {
  if (!id) throw new Error("Choose a node to style.");
  if (colorKey === "default") {
    return removeFlowchartNodeStyle(source, id);
  }
  const preset = COLOR_PRESETS[colorKey];
  if (!preset || !preset.style) throw new Error("Unsupported color preset.");
  const escaped = escapeRegex(id);
  const stylePattern = new RegExp(`^\\s*style\\s+${escaped}\\s+.*$`, "m");
  const newStyleLine = `  style ${id} ${preset.style}`;
  if (stylePattern.test(source)) {
    return source.replace(stylePattern, newStyleLine);
  }
  return `${source.trimEnd()}\n${newStyleLine}\n`;
}

export function removeFlowchartNodeStyle(source, id) {
  if (!id) throw new Error("Choose a node.");
  const escaped = escapeRegex(id);
  const lines = source.split("\n").filter((line) => !new RegExp(`^\\s*style\\s+${escaped}\\b`).test(line));
  return lines.join("\n");
}

export function duplicateFlowchartNode(source, id) {
  const nodes = flowchartNodes(source);
  const existing = nodes.find((n) => n.id === id);
  if (!existing) throw new Error("Node does not exist.");

  let number = nodes.length + 1;
  while (new RegExp(`\\bnode${number}\\b`).test(source)) number++;
  const duplicateId = `node${number}`;
  const shape = SHAPES[existing.shape] || SHAPES.rectangle;
  const duplicateLabel = `Copy of ${existing.label}`;
  const decl = `  ${duplicateId}${shape.open}"${safeLabel(duplicateLabel)}"${shape.close}`;

  let updated = `${source.trimEnd()}\n${decl}\n`;

  const escaped = escapeRegex(id);
  const styleMatch = source.match(new RegExp(`^\\s*style\\s+${escaped}\\s+(.*)$`, "m"));
  if (styleMatch) {
    updated += `  style ${duplicateId} ${styleMatch[1]}\n`;
  }

  return { source: updated, duplicateId, duplicateLabel };
}


