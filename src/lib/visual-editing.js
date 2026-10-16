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
  doublecircle: { open: "(((", close: ")))", label: "Double circle" },
  diamond: { open: "{", close: "}", label: "Diamond / Decision" },
  hexagon: { open: "{{", close: "}}", label: "Hexagon" },
  parallelogram: { open: "[/", close: "/]", label: "Parallelogram (input/output)" },
  parallelogramAlt: { open: "[\\", close: "\\]", label: "Parallelogram (alt)" },
  trapezoid: { open: "[/", close: "\\]", label: "Trapezoid" },
  trapezoidAlt: { open: "[\\", close: "/]", label: "Trapezoid (alt)" },
  asymmetric: { open: ">", close: "]", label: "Asymmetric flag" },
};

const KEYWORD_IDS = new Set(["subgraph", "classDef", "style", "click", "linkStyle", "class", "flowchart", "graph", "end", "direction"]);
// Longest delimiters first so "(((" wins over "((" and "[(" over "[".
const SHAPE_ENTRIES = Object.entries(SHAPES).sort((a, b) => b[1].open.length - a[1].open.length);
const OPEN_ALT = [...new Set(SHAPE_ENTRIES.map(([, v]) => v.open))].map((o) => o.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
const CLOSE_ALT = [...new Set(Object.values(SHAPES).map((v) => v.close))]
  .sort((a, b) => b.length - a.length)
  .map((o) => o.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  .join("|");
const CONTENT = '"[^"\\n]*"|[^\\n]*?';

/**
 * Finds every node declaration (id + shape delimiters + label) in a flowchart.
 * One scanner for all shapes; at the same position the longest opener wins.
 */
export function scanNodeDeclarations(source, onlyId) {
  const found = new Map();
  for (const [key, shape] of SHAPE_ENTRIES) {
    const idPattern = onlyId ? escapeRegex(onlyId) : "[A-Za-z_][\\w-]*";
    const re = new RegExp(
      `(^|[^\\w-])(${idPattern})([ \\t]*)(${escapeRegex(shape.open)})(${CONTENT})(${escapeRegex(shape.close)})`,
      "gm",
    );
    for (const m of source.matchAll(re)) {
      const id = m[2];
      if (KEYWORD_IDS.has(id)) continue;
      const idStart = m.index + m[1].length;
      const lineStart = source.lastIndexOf("\n", idStart) + 1;
      if (/^\s*%%/.test(source.slice(lineStart, idStart))) continue;
      const prior = found.get(idStart);
      if (prior && prior.open.length >= shape.open.length) continue;
      const openStart = idStart + id.length + m[3].length;
      found.set(idStart, {
        id,
        shape: key,
        open: shape.open,
        close: shape.close,
        label: m[5].replace(/^"|"$/g, ""),
        idStart,
        openStart,
        contentStart: openStart + shape.open.length,
        contentEnd: openStart + shape.open.length + m[5].length,
        end: openStart + shape.open.length + m[5].length + shape.close.length,
      });
    }
  }
  return [...found.values()].sort((a, b) => a.idStart - b.idStart);
}

export const findNodeDeclaration = (source, id) => scanNodeDeclarations(source, id)[0] || null;

/** Declares an undeclared node at its first mention, e.g. `API --> B` → `API["API"] --> B`. */
function declareAtFirstMention(source, id, shapeType, label) {
  const shape = SHAPES[shapeType] || SHAPES.rectangle;
  const re = new RegExp(`(^|[^\\w-])(${escapeRegex(id)})(?![\\w-])`, "gm");
  for (const m of source.matchAll(re)) {
    const idStart = m.index + m[1].length;
    const lineStart = source.lastIndexOf("\n", idStart) + 1;
    const linePrefix = source.slice(lineStart, idStart);
    if (/^\s*(%%|flowchart|graph|subgraph|classDef|style|class|click|linkStyle|direction)\b/.test(source.slice(lineStart))) continue;
    if (/["']$/.test(linePrefix.trimEnd().slice(-1)) && (linePrefix.match(/"/g) || []).length % 2 === 1) continue;
    return `${source.slice(0, idStart + id.length)}${shape.open}"${safeLabel(label)}"${shape.close}${source.slice(idStart + id.length)}`;
  }
  return null;
}

export const FLOWCHART_DIRECTIONS = {
  TD: { id: "TD", label: "Top to bottom (TD)" },
  LR: { id: "LR", label: "Left to right (LR)" },
  BT: { id: "BT", label: "Bottom to top (BT)" },
  RL: { id: "RL", label: "Right to left (RL)" },
};

/**
 * Maps a rendered SVG node id (e.g. "mermaid-render-4-flowchart-Client-0" or
 * "flowchart-Client-0") back to the source id ("Client"). Non-flowchart ids
 * are returned unchanged.
 */
export const flowchartNodeId = (id) =>
  typeof id === "string"
    ? id.match(/(?:^|-)flowchart-(.+)-\d+$/)?.[1] || id
    : id;

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
  for (const decl of scanNodeDeclarations(source)) {
    if (!nodes.has(decl.id)) nodes.set(decl.id, { id: decl.id, label: decl.label, shape: decl.shape });
  }
  for (const edgeMatch of source.matchAll(
    /^\s*([A-Za-z_][\w-]*)\s*[-.=~]+(?:>|\b)(?:\|[^|]*\|)?\s*([A-Za-z_][\w-]*)/gm,
  )) {
    const fromId = edgeMatch[1];
    const toId = edgeMatch[2];
    if (fromId && !["subgraph", "classDef", "style", "flowchart", "graph"].includes(fromId) && !nodes.has(fromId)) {
      nodes.set(fromId, { id: fromId, label: fromId, shape: "rectangle" });
    }
    if (toId && !["subgraph", "classDef", "style", "flowchart", "graph", "end"].includes(toId) && !nodes.has(toId)) {
      nodes.set(toId, { id: toId, label: toId, shape: "rectangle" });
    }
  }
  return [...nodes.values()];
}

export function getFlowchartNodeShape(source, id) {
  return findNodeDeclaration(source, id)?.shape || "rectangle";
}

export function changeFlowchartNodeShape(source, id, shapeType) {
  const shape = SHAPES[shapeType];
  if (!shape) throw new Error("Unsupported shape.");
  const decl = findNodeDeclaration(source, id);
  if (!decl) {
    const declared = declareAtFirstMention(source, id, shapeType, id);
    if (!declared) throw new Error("Could not find this node in the source.");
    return declared;
  }
  const content = source.slice(decl.contentStart, decl.contentEnd);
  return `${source.slice(0, decl.openStart)}${shape.open}${content}${shape.close}${source.slice(decl.end)}`;
}

export function renameFlowchartNode(source, id, label) {
  if (!label.trim()) throw new Error("Enter a node label.");
  const decl = findNodeDeclaration(source, id);
  if (!decl) {
    const declared = declareAtFirstMention(source, id, "rectangle", label);
    if (!declared) throw new Error("Could not find this node in the source.");
    return declared;
  }
  return `${source.slice(0, decl.contentStart)}"${safeLabel(label)}"${source.slice(decl.contentEnd)}`;
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

const NODE_DECL_PATTERN = `[A-Za-z_][\w-]*(?:\s*(?:${OPEN_ALT})[^\n]+?(?:${CLOSE_ALT}))?`;

export function flowchartEdges(source) {
  const edges = [];
  const lines = source.split("\n");
  const inlineRegex = new RegExp(
    `\\b([A-Za-z_][\\w-]*)(?:\\s*(?:${OPEN_ALT})[^\\n]+?(?:${CLOSE_ALT}))?\\s*(?:--|==|-\\.)\\s+(?:"([^"\\n]+)"|([^\\n-]+?))\\s+(-->|==>|\\.->|---|===)\\s*([A-Za-z_][\\w-]*)`,
  );
  const pipeRegex = new RegExp(
    `\\b([A-Za-z_][\\w-]*)(?:\\s*(?:${OPEN_ALT})[^\\n]+?(?:${CLOSE_ALT}))?\\s*([-.~=]+>|[-.~=]+)(?:\\|"?([^"|\\n]*?)"?\\|)?\\s*([A-Za-z_][\\w-]*)`,
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
    // A bare declaration line has no edge; lines with arrows are handled below.
    if (!/[-.=~]+>/.test(line) && scanNodeDeclarations(line, id).some((d) => d.idStart === line.search(/\S/) && d.end >= line.trimEnd().length)) {
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

export function batchStyleFlowchartNodes(source, ids, colorKey) {
  if (!Array.isArray(ids) || ids.length === 0) return source;
  let updated = source;
  for (const id of ids) {
    if (id) {
      updated = styleFlowchartNode(updated, id, colorKey);
    }
  }
  return updated;
}

export function wrapInSubgraph(source, ids, title = "Group") {
  if (!Array.isArray(ids) || ids.length === 0) return source;
  const safeId = "sub_" + Math.random().toString(36).slice(2, 6);
  const cleanTitle = safeLabel(title || "Group");
  const nodesBlock = ids.map((id) => `    ${id}`).join("\n");
  const subgraphStr = `\n  subgraph ${safeId} ["${cleanTitle}"]\n${nodesBlock}\n  end\n`;
  return `${source.trimEnd()}\n${subgraphStr}`;
}

export function batchDeleteFlowchartNodes(source, ids) {
  if (!Array.isArray(ids) || ids.length === 0) return source;
  let updated = source;
  for (const id of ids) {
    if (id) {
      updated = deleteFlowchartNode(updated, id);
    }
  }
  return updated;
}

export function batchDuplicateFlowchartNodes(source, ids) {
  if (!Array.isArray(ids) || ids.length === 0) return source;
  let updated = source;
  for (const id of ids) {
    if (id) {
      try {
        updated = duplicateFlowchartNode(updated, id);
      } catch {}
    }
  }
  return updated;
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

/* =========================================================================
   DIAGRAM LOOK & THEME FRONTMATTER CONFIGURATION
   ========================================================================= */

export const DIAGRAM_LOOKS = {
  classic: { id: "classic", label: "Classic (Vector)" },
  handDrawn: { id: "handDrawn", label: "Hand-drawn (Sketchy)" },
};

export const DIAGRAM_THEMES = {
  default: { id: "default", label: "Default" },
  neutral: { id: "neutral", label: "Neutral Slate" },
  dark: { id: "dark", label: "Midnight Dark" },
  forest: { id: "forest", label: "Forest Emerald" },
  base: { id: "base", label: "Minimal Base" },
};

export function getDiagramConfig(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { look: "classic", theme: "default" };
  const yaml = match[1];
  const lookM = yaml.match(/^\s*look:\s*([^\s\r\n]+)/m);
  const themeM = yaml.match(/^\s*theme:\s*([^\s\r\n]+)/m);
  return {
    look: lookM ? lookM[1] : "classic",
    theme: themeM ? themeM[1] : "default",
  };
}

export function updateDiagramConfig(source, { look, theme }) {
  const fmMatch = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const current = getDiagramConfig(source);
  const newLook = look !== undefined ? look : current.look;
  const newTheme = theme !== undefined ? theme : current.theme;

  const isDefaultLook = !newLook || newLook === "classic";
  const isDefaultTheme = !newTheme || newTheme === "default";

  if (!fmMatch) {
    if (isDefaultLook && isDefaultTheme) return source;
    const lines = ["---", "config:"];
    if (!isDefaultLook) lines.push(`  look: ${newLook}`);
    if (!isDefaultTheme) lines.push(`  theme: ${newTheme}`);
    lines.push("---", source.trimStart());
    return lines.join("\n");
  }

  let yaml = fmMatch[1];
  yaml = yaml.replace(/^\s*look:\s*.*$\n?/gm, "");
  yaml = yaml.replace(/^\s*theme:\s*.*$\n?/gm, "");

  const configEntries = [];
  if (!isDefaultLook) configEntries.push(`  look: ${newLook}`);
  if (!isDefaultTheme) configEntries.push(`  theme: ${newTheme}`);

  if (configEntries.length > 0) {
    if (/^\s*config:\s*$/m.test(yaml)) {
      yaml = yaml.replace(/^\s*config:\s*$/m, `config:\n${configEntries.join("\n")}`);
    } else {
      yaml = `${yaml.trimEnd()}\nconfig:\n${configEntries.join("\n")}`;
    }
  } else {
    yaml = yaml.replace(/^\s*config:\s*$\n?/gm, "");
  }

  const cleanYaml = yaml.trim();
  if (!cleanYaml) {
    return source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
  }
  return source.replace(/^---\r?\n[\s\S]*?\r?\n---/, `---\n${cleanYaml}\n---`);
}

/* =========================================================================
   SEQUENCE DIAGRAM VISUAL EDITING
   ========================================================================= */

export const isSequence = (doc) =>
  doc?.format === "mermaid" && /^\s*sequenceDiagram\b/m.test(doc.source);

export const SEQUENCE_ARROWS = {
  solid: { symbol: "->>", label: "Synchronous (->>)" },
  dotted: { symbol: "-->>", label: "Dotted reply (-->>)" },
  line: { symbol: "->", label: "Solid line (->)" },
  dottedLine: { symbol: "-->", label: "Dotted line (-->)" },
  cross: { symbol: "-x", label: "Failure (-x)" },
  async: { symbol: "-)", label: "Asynchronous (-))" },
};

export function sequenceParticipants(source) {
  const map = new Map();
  for (const line of source.split("\n")) {
    if (/^\s*%%/.test(line)) continue;
    const declMatch = line.match(
      /^\s*(participant|actor)\s+([A-Za-z0-9_]+)(?:\s+as\s+("?[^"\n]+"?))?/i,
    );
    if (declMatch) {
      const type = declMatch[1].toLowerCase();
      const id = declMatch[2];
      const label = declMatch[3] ? declMatch[3].replace(/^"|"$/g, "") : id;
      map.set(id, { id, label, type });
      continue;
    }
    const msgMatch = line.match(
      /^\s*([A-Za-z0-9_]+)\s*(?:->>|-->>|->|-->|-x|--x|-\)|--\))\s*([A-Za-z0-9_]+)\s*:/,
    );
    if (msgMatch) {
      const from = msgMatch[1];
      const to = msgMatch[2];
      if (!map.has(from)) map.set(from, { id: from, label: from, type: "participant" });
      if (!map.has(to)) map.set(to, { id: to, label: to, type: "participant" });
    }
  }
  return [...map.values()];
}

export function addSequenceParticipant(source, id, label = "", type = "participant") {
  if (!id.trim()) throw new Error("Participant ID is required.");
  const cleanId = id.trim().replace(/\s+/g, "_");
  const cleanLabel = label.trim() || cleanId;
  const decl =
    cleanLabel !== cleanId
      ? `  ${type} ${cleanId} as "${safeLabel(cleanLabel)}"`
      : `  ${type} ${cleanId}`;

  const lines = source.split("\n");
  const headerIdx = lines.findIndex((l) => /^\s*sequenceDiagram\b/i.test(l));
  if (headerIdx === -1) {
    return `${source.trimEnd()}\n${decl}\n`;
  }
  lines.splice(headerIdx + 1, 0, decl);
  return lines.join("\n");
}

export function addSequenceMessage(source, from, to, message = "call", arrow = "->>") {
  if (!from || !to) throw new Error("Select from and to participants.");
  return `${source.trimEnd()}\n  ${from}${arrow}${to}: ${safeLabel(message || "message")}\n`;
}

export function deleteSequenceParticipant(source, id) {
  if (!id) throw new Error("Select a participant to remove.");
  const lines = source.split("\n");
  const filtered = lines.filter((line) => {
    if (new RegExp(`^\\s*(?:participant|actor)\\s+${escapeRegex(id)}\\b`, "i").test(line))
      return false;
    if (
      new RegExp(
        `^\\s*${escapeRegex(id)}\\s*(?:->>|-->>|->|-->|-x|--x|-\\)|--\\))`,
        "i",
      ).test(line)
    )
      return false;
    if (
      new RegExp(
        `(?:->>|-->>|->|-->|-x|--x|-\\)|--\\))\\s*${escapeRegex(id)}\\s*:`,
        "i",
      ).test(line)
    )
      return false;
    return true;
  });
  return filtered.join("\n");
}

/* =========================================================================
   CLASS DIAGRAM VISUAL EDITING
   ========================================================================= */

export const isClassDiagram = (doc) =>
  doc?.format === "mermaid" && /^\s*classDiagram\b/m.test(doc.source);

export const CLASS_RELATIONS = {
  inheritance: { symbol: "<|--", label: "Inheritance (<|--)" },
  composition: { symbol: "*--", label: "Composition (*--)" },
  aggregation: { symbol: "o--", label: "Aggregation (o--)" },
  association: { symbol: "-->", label: "Association (-->)" },
  dependency: { symbol: "..>", label: "Dependency (..>)" },
  realization: { symbol: "..|>", label: "Realization (..|>)" },
};

export function classDiagramClasses(source) {
  const map = new Map();
  for (const line of source.split("\n")) {
    if (/^\s*%%/.test(line)) continue;
    const declMatch = line.match(/^\s*class\s+([A-Za-z0-9_]+)/i);
    if (declMatch) {
      const id = declMatch[1];
      map.set(id, { id, label: id });
    }
    const relMatch = line.match(
      /^\s*([A-Za-z0-9_]+)\s*(?:<\|--|\*--|o--|-->|\.\.>|\.\.\|>|--)\s*([A-Za-z0-9_]+)/,
    );
    if (relMatch) {
      if (!map.has(relMatch[1]))
        map.set(relMatch[1], { id: relMatch[1], label: relMatch[1] });
      if (!map.has(relMatch[2]))
        map.set(relMatch[2], { id: relMatch[2], label: relMatch[2] });
    }
  }
  return [...map.values()];
}

export function addClassDiagramClass(source, name) {
  if (!name.trim()) throw new Error("Class name is required.");
  const cleanName = name.trim().replace(/\s+/g, "_");
  return `${source.trimEnd()}\n  class ${cleanName} {\n  }\n`;
}

export function addClassDiagramMember(source, className, member) {
  if (!className || !member.trim())
    throw new Error("Select class and enter member declaration.");
  const cleanMember = member.trim();
  const blockRegex = new RegExp(
    `(^|\\n)([ \\t]*class\\s+${escapeRegex(className)}\\s*\\{[\\s\\S]*?\\})`,
    "m",
  );
  if (blockRegex.test(source)) {
    return source.replace(blockRegex, (_, prefix, block) => {
      const updatedBlock = block.replace(/\}[ \\t]*$/, `  ${cleanMember}\n  }`);
      return `${prefix}${updatedBlock}`;
    });
  }
  return `${source.trimEnd()}\n  ${className} : ${cleanMember}\n`;
}

export function connectClassDiagramClasses(
  source,
  from,
  to,
  relType = "<|--",
  label = "",
) {
  if (!from || !to) throw new Error("Select two classes to connect.");
  const lbl = label.trim() ? ` : ${safeLabel(label.trim())}` : "";
  return `${source.trimEnd()}\n  ${from} ${relType} ${to}${lbl}\n`;
}

export function deleteClassDiagramClass(source, className) {
  if (!className) throw new Error("Select a class to remove.");
  const escaped = escapeRegex(className);
  let updated = source.replace(
    new RegExp(`(^|\\n)[ \\t]*class\\s+${escaped}\\s*\\{[\\s\\S]*?\\}`, "g"),
    "",
  );
  const lines = updated.split("\n").filter((line) => {
    if (new RegExp(`^\\s*class\\s+${escaped}\\b`, "i").test(line)) return false;
    if (new RegExp(`^\\s*${escaped}\\s*[:<*o-]`, "i").test(line)) return false;
    if (
      new RegExp(
        `(?:<\\|--|\\*--|o--|-->|\\.\\.>|\\.\\.\\|>|--)\\s*${escaped}\\b`,
        "i",
      ).test(line)
    )
      return false;
    return true;
  });
  return lines.join("\n");
}

/* -------------------------------------------------------------------------- */
/* STATE DIAGRAM VISUAL MODELING                                               */
/* -------------------------------------------------------------------------- */

export const isState = (doc) =>
  doc?.format === "mermaid" &&
  /^\s*stateDiagram(?:-v2)?\b/m.test(doc.source);

export const STATE_TRANSITIONS = {
  normal: { symbol: "-->", label: "Transition (-->)" },
};

export function stateDiagramStates(source) {
  const map = new Map();
  map.set("[*]", { id: "[*]", label: "[*] (Start / End)" });
  for (const line of source.split("\n")) {
    if (/^\s*%%/.test(line)) continue;
    const aliasMatch = line.match(
      /^\s*state\s+"([^"]+)"\s+as\s+([A-Za-z0-9_]+)/i,
    );
    if (aliasMatch) {
      map.set(aliasMatch[2], {
        id: aliasMatch[2],
        label: `${aliasMatch[1]} (${aliasMatch[2]})`,
      });
      continue;
    }
    const stateMatch = line.match(/^\s*state\s+([A-Za-z0-9_]+)\b/i);
    if (stateMatch && stateMatch[1] !== "[*]") {
      if (!map.has(stateMatch[1])) {
        map.set(stateMatch[1], { id: stateMatch[1], label: stateMatch[1] });
      }
    }
    const transMatch = line.match(
      /^\s*(\[\*\]|[A-Za-z0-9_]+)\s*-->\s*(\[\*\]|[A-Za-z0-9_]+)/,
    );
    if (transMatch) {
      if (!map.has(transMatch[1]))
        map.set(transMatch[1], { id: transMatch[1], label: transMatch[1] });
      if (!map.has(transMatch[2]))
        map.set(transMatch[2], { id: transMatch[2], label: transMatch[2] });
    }
  }
  return [...map.values()];
}

export function addStateDiagramState(source, stateName, label = "") {
  if (!stateName.trim()) throw new Error("State identifier is required.");
  const id = stateName.trim().replace(/\s+/g, "_");
  const desc = label.trim();
  if (desc) {
    return `${source.trimEnd()}\n  state "${safeLabel(desc)}" as ${id}\n`;
  }
  return `${source.trimEnd()}\n  state ${id}\n`;
}

export function connectStateDiagramStates(source, from, to, label = "") {
  if (!from || !to) throw new Error("Select from and to states.");
  const lbl = label.trim() ? ` : ${safeLabel(label.trim())}` : "";
  return `${source.trimEnd()}\n  ${from} --> ${to}${lbl}\n`;
}

export function deleteStateDiagramState(source, stateId) {
  if (!stateId || stateId === "[*]")
    throw new Error("Select a valid state to remove.");
  const escaped = escapeRegex(stateId);
  let updated = source.replace(
    new RegExp(
      `(^|\\n)[ \\t]*state\\s+(?:"[^"]*"\\s+as\\s+)?${escaped}\\s*\\{[\\s\\S]*?\\}`,
      "g",
    ),
    "",
  );
  const lines = updated.split("\n").filter((line) => {
    if (
      new RegExp(`^\\s*state\\s+(?:"[^"]*"\\s+as\\s+)?${escaped}\\b`, "i").test(
        line,
      )
    )
      return false;
    if (new RegExp(`^\\s*${escaped}\\s*:`, "i").test(line)) return false;
    if (new RegExp(`(?:-->|--)\\s*${escaped}\\b`, "i").test(line)) return false;
    if (new RegExp(`^\\s*${escaped}\\s*-->`, "i").test(line)) return false;
    return true;
  });
  return lines.join("\n");
}

/* -------------------------------------------------------------------------- */
/* ENTITY-RELATIONSHIP (ER) DIAGRAM VISUAL MODELING                           */
/* -------------------------------------------------------------------------- */

export const isErDiagram = (doc) =>
  doc?.format === "mermaid" && /^\s*erDiagram\b/m.test(doc.source);

export const ER_RELATIONS = {
  oneToOne: { symbol: "||--||", label: "Exactly one to Exactly one (||--||)" },
  oneToMany: {
    symbol: "||--o{",
    label: "Zero or more to Exactly one (||--o{)",
  },
  oneOrMoreToMany: {
    symbol: "}|--|{",
    label: "One or more to One or more (}|--|{)",
  },
  zeroOrOneToOne: {
    symbol: "|o--||",
    label: "Zero or one to Exactly one (|o--||)",
  },
  zeroOrOneToMany: {
    symbol: "|o--o{",
    label: "Zero or one to Zero or more (|o--o{)",
  },
  manyToMany: { symbol: "}o--o{", label: "Zero or more to Zero or more (}o--o{)" },
};

export function erDiagramEntities(source) {
  const map = new Map();
  for (const line of source.split("\n")) {
    if (/^\s*%%/.test(line)) continue;
    const blockMatch = line.match(/^\s*([A-Za-z0-9_-]+)\s*\{/);
    if (blockMatch && blockMatch[1] !== "erDiagram") {
      map.set(blockMatch[1], { id: blockMatch[1], label: blockMatch[1] });
    }
    const relMatch = line.match(
      /^\s*([A-Za-z0-9_-]+)\s*([|{}o-]+)\s*([A-Za-z0-9_-]+)\s*:/,
    );
    if (relMatch) {
      if (!map.has(relMatch[1]))
        map.set(relMatch[1], { id: relMatch[1], label: relMatch[1] });
      if (!map.has(relMatch[3]))
        map.set(relMatch[3], { id: relMatch[3], label: relMatch[3] });
    }
  }
  return [...map.values()];
}

export function addErDiagramEntity(source, entityName) {
  if (!entityName.trim()) throw new Error("Entity name is required.");
  const id = entityName.trim().replace(/\s+/g, "_");
  return `${source.trimEnd()}\n  ${id} {\n  }\n`;
}

export function addErDiagramAttribute(
  source,
  entityName,
  type,
  name,
  key = "",
) {
  if (!entityName || !type.trim() || !name.trim()) {
    throw new Error("Entity, attribute type, and attribute name are required.");
  }
  const cleanType = type.trim();
  const cleanName = name.trim().replace(/\s+/g, "_");
  const cleanKey = key.trim() ? ` ${key.trim()}` : "";
  const attrLine = `    ${cleanType} ${cleanName}${cleanKey}`;
  const blockRegex = new RegExp(
    `(^|\\n)([ \\t]*${escapeRegex(entityName)}\\s*\\{[\\s\\S]*?\\})`,
    "m",
  );
  if (blockRegex.test(source)) {
    return source.replace(blockRegex, (_, prefix, block) => {
      const updatedBlock = block.replace(
        /\n?[ \t]*\}[ \t]*$/,
        `\n${attrLine}\n  }`,
      );
      return `${prefix}${updatedBlock}`;
    });
  }
  return `${source.trimEnd()}\n  ${entityName} {\n${attrLine}\n  }\n`;
}

export function connectErDiagramEntities(
  source,
  from,
  to,
  relType = "||--o{",
  label = "relates",
) {
  if (!from || !to) throw new Error("Select two entities to connect.");
  const lbl = label.trim() ? ` : "${safeLabel(label.trim())}"` : " : relates";
  return `${source.trimEnd()}\n  ${from} ${relType} ${to}${lbl}\n`;
}

export function deleteErDiagramEntity(source, entityName) {
  if (!entityName) throw new Error("Select an entity to remove.");
  const escaped = escapeRegex(entityName);
  let updated = source.replace(
    new RegExp(`(^|\\n)[ \\t]*${escaped}\\s*\\{[\\s\\S]*?\\}`, "g"),
    "",
  );
  const lines = updated.split("\n").filter((line) => {
    if (new RegExp(`^\\s*${escaped}\\s*\\{`, "i").test(line)) return false;
    if (new RegExp(`^\\s*${escaped}\\s*[|{}o-]+`, "i").test(line)) return false;
    if (new RegExp(`[|{}o-]+\\s*${escaped}\\s*:`, "i").test(line)) return false;
    return true;
  });
  return lines.join("\n");
}

/* -------------------------------------------------------------------------- */
/* MINDMAP VISUAL MODELING                                                    */
/* -------------------------------------------------------------------------- */

export const isMindmap = (doc) =>
  doc?.format === "mermaid" && /^\s*mindmap\b/m.test(doc.source);

export const MINDMAP_SHAPES = {
  default: { label: "Default text" },
  circle: { label: "Circle ((...))" },
  rounded: { label: "Rounded (...)" },
  square: { label: "Square [...]" },
  cloud: { label: "Cloud )...(" },
  bang: { label: "Bang ))!...!((" },
};

export function parseMindmapNode(raw) {
  const match = raw.match(
    /^([A-Za-z0-9_-]+)?(\(\(|\)\)|\)|\[|\()([^\n]+?)(\)\)|\(\(|\(|\]|\))$/,
  );
  if (match) {
    const id = match[1] || "";
    const open = match[2];
    const text = match[3];
    let shape = "rounded";
    if (open === "((") shape = "circle";
    else if (open === "))") shape = "bang";
    else if (open === ")") shape = "cloud";
    else if (open === "[") shape = "square";
    return { id, text, shape };
  }
  return { id: "", text: raw, shape: "default" };
}

export function mindmapNodes(source) {
  const lines = source.split("\n");
  const nodes = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*%%/.test(line) || /^\s*mindmap\b/.test(line) || !line.trim())
      continue;
    const indent = line.match(/^(\s*)/)[1].length;
    const raw = line.trim();
    const parsed = parseMindmapNode(raw);
    nodes.push({
      lineIndex: i,
      indent,
      text: parsed.text,
      id: parsed.id,
      shape: parsed.shape,
      raw,
    });
  }
  return nodes;
}

export function addMindmapChild(source, parentText, childText, shape = "default") {
  if (!childText.trim()) throw new Error("Child node text is required.");
  const lines = source.split("\n");
  let parentIndex = -1;
  let parentIndent = 2;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes(parentText)) {
      parentIndex = i;
      parentIndent = line.match(/^(\s*)/)[1].length;
      break;
    }
  }
  if (parentIndex === -1)
    throw new Error("Parent node not found in mindmap.");
  let childIndent = parentIndent + 2;
  let cleanChild = safeLabel(childText.trim());
  if (shape === "circle") cleanChild = `((${cleanChild}))`;
  else if (shape === "square") cleanChild = `[${cleanChild}]`;
  else if (shape === "rounded") cleanChild = `(${cleanChild})`;
  else if (shape === "cloud") cleanChild = `)${cleanChild}(`;
  else if (shape === "bang") cleanChild = `))${cleanChild}((`;

  let insertAt = parentIndex + 1;
  while (insertAt < lines.length) {
    const l = lines[insertAt];
    if (!l.trim()) {
      let hasMoreChildren = false;
      for (let k = insertAt + 1; k < lines.length; k++) {
        if (lines[k].trim()) {
          const kInd = lines[k].match(/^(\s*)/)[1].length;
          if (kInd > parentIndent) hasMoreChildren = true;
          break;
        }
      }
      if (!hasMoreChildren) break;
      insertAt++;
      continue;
    }
    const ind = l.match(/^(\s*)/)[1].length;
    if (ind <= parentIndent) break;
    insertAt++;
  }
  lines.splice(insertAt, 0, " ".repeat(childIndent) + cleanChild);
  return lines.join("\n");
}

export function deleteMindmapNode(source, targetText) {
  if (!targetText.trim()) throw new Error("Select node to delete.");
  const lines = source.split("\n");
  let targetIndex = -1;
  let targetIndent = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes(targetText)) {
      targetIndex = i;
      targetIndent = line.match(/^(\s*)/)[1].length;
      break;
    }
  }
  if (targetIndex === -1) throw new Error("Node not found.");
  let countToRemove = 1;
  while (targetIndex + countToRemove < lines.length) {
    const nextLine = lines[targetIndex + countToRemove];
    if (!nextLine.trim()) {
      countToRemove++;
      continue;
    }
    const nextIndent = nextLine.match(/^(\s*)/)[1].length;
    if (nextIndent <= targetIndent) break;
    countToRemove++;
  }
  lines.splice(targetIndex, countToRemove);
  return lines.join("\n");
}

/* -------------------------------------------------------------------------- */
/* GITGRAPH VISUAL MODELING                                                   */
/* -------------------------------------------------------------------------- */

export const isGitGraph = (doc) =>
  doc?.format === "mermaid" && /^\s*gitGraph\b/m.test(doc.source);

export const GIT_COMMIT_TYPES = {
  NORMAL: { label: "Normal commit" },
  HIGHLIGHT: { label: "Highlight commit" },
  REVERSE: { label: "Reverse commit" },
};

export function gitGraphBranches(source) {
  const branches = new Set(["main"]);
  for (const line of source.split("\n")) {
    if (/^\s*%%/.test(line)) continue;
    const match = line.match(/^\s*branch\s+([A-Za-z0-9_/-]+)/);
    if (match) {
      branches.add(match[1]);
    }
  }
  return [...branches].map((b) => ({ id: b, label: b }));
}

export function addGitCommit(source, msg = "", tag = "", type = "NORMAL") {
  let line = "  commit";
  if (msg.trim()) line += ` id: "${safeLabel(msg.trim())}"`;
  if (tag.trim()) line += ` tag: "${safeLabel(tag.trim())}"`;
  if (type && type !== "NORMAL") line += ` type: ${type}`;
  return `${source.trimEnd()}\n${line}\n`;
}

export function addGitBranch(source, branchName) {
  if (!branchName.trim()) throw new Error("Branch name is required.");
  const name = branchName.trim().replace(/\s+/g, "-");
  return `${source.trimEnd()}\n  branch ${name}\n`;
}

export function checkoutGitBranch(source, branchName) {
  if (!branchName.trim()) throw new Error("Branch name is required.");
  return `${source.trimEnd()}\n  checkout ${branchName.trim()}\n`;
}

export function mergeGitBranch(source, branchName, tag = "") {
  if (!branchName.trim()) throw new Error("Select branch to merge.");
  const tagPart = tag.trim() ? ` tag: "${safeLabel(tag.trim())}"` : "";
  return `${source.trimEnd()}\n  merge ${branchName.trim()}${tagPart}\n`;
}

/* -------------------------------------------------------------------------- */
/* PIE CHART VISUAL MODELING                                                  */
/* -------------------------------------------------------------------------- */

export const isPie = (doc) =>
  doc?.format === "mermaid" && /^\s*pie\b/m.test(doc.source);

export function pieData(source) {
  const lines = source.split("\n");
  let title = "";
  const slices = [];
  for (const line of lines) {
    if (/^\s*%%/.test(line)) continue;
    const inlineTitleMatch = line.match(/^\s*pie\s+title\s+(.+)$/i);
    if (inlineTitleMatch) title = inlineTitleMatch[1].trim();
    const titleMatch = line.match(/^\s*title\s+(.+)$/i);
    if (titleMatch) title = titleMatch[1].trim();
    const sliceMatch = line.match(/^\s*"([^"]+)"\s*:\s*([0-9.]+)/);
    if (sliceMatch) {
      slices.push({ label: sliceMatch[1], value: Number(sliceMatch[2]) });
    }
  }
  return { title, slices };
}

export function addPieSlice(source, label, value) {
  if (!label.trim()) throw new Error("Slice label required.");
  const val = Number(value);
  if (isNaN(val) || val <= 0)
    throw new Error("Slice value must be a positive number.");
  return `${source.trimEnd()}\n  "${safeLabel(label.trim())}" : ${val}\n`;
}

export function deletePieSlice(source, label) {
  const lines = source
    .split("\n")
    .filter((l) => !l.includes(`"${label.trim()}"`));
  return lines.join("\n");
}

export function setPieTitle(source, title) {
  const cleanTitle = safeLabel(title.trim());
  if (/^\s*pie\s+title\b/i.test(source)) {
    return source.replace(/^\s*pie\s+title\s+.*$/m, `pie title ${cleanTitle}`);
  }
  if (/^\s*title\s+/im.test(source)) {
    return source.replace(/^\s*title\s+.*$/m, `  title ${cleanTitle}`);
  }
  if (/^\s*pie\b/im.test(source)) {
    return source.replace(/^(\s*pie\b.*)$/m, `$1\n  title ${cleanTitle}`);
  }
  return `pie\n  title ${cleanTitle}\n${source}`;
}

/* -------------------------------------------------------------------------- */
/* USER JOURNEY MAP VISUAL MODELING                                           */
/* -------------------------------------------------------------------------- */

export const isJourney = (doc) =>
  doc?.format === "mermaid" && /^\s*journey\b/m.test(doc.source);

export function journeySections(source) {
  const sections = [];
  let currentSection = { name: "General", tasks: [] };
  sections.push(currentSection);

  for (const line of source.split("\n")) {
    if (/^\s*%%/.test(line)) continue;
    const secMatch = line.match(/^\s*section\s+(.+)$/i);
    if (secMatch) {
      currentSection = { name: secMatch[1].trim(), tasks: [] };
      sections.push(currentSection);
      continue;
    }
    const taskMatch = line.match(
      /^\s*([^:]+)\s*:\s*([1-5])\s*(?::\s*([^:]+))?$/,
    );
    if (taskMatch) {
      currentSection.tasks.push({
        name: taskMatch[1].trim(),
        score: Number(taskMatch[2]),
        actors: (taskMatch[3] || "User").trim(),
      });
    }
  }
  return sections.filter((s) => s.name !== "General" || s.tasks.length > 0);
}

export function addJourneySection(source, sectionName) {
  if (!sectionName.trim()) throw new Error("Section name required.");
  return `${source.trimEnd()}\n  section ${safeLabel(sectionName.trim())}\n`;
}

export function addJourneyTask(
  source,
  sectionName,
  taskName,
  score = 5,
  actors = "User",
) {
  if (!taskName.trim()) throw new Error("Task name required.");
  const cleanScore = Math.max(1, Math.min(5, Number(score) || 5));
  const cleanActors = safeLabel(actors.trim() || "User");
  const taskLine = `    ${safeLabel(taskName.trim())}: ${cleanScore}: ${cleanActors}`;

  const lines = source.split("\n");
  if (!sectionName) {
    return `${source.trimEnd()}\n${taskLine}\n`;
  }

  let secIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (new RegExp(`^\\s*section\\s+${escapeRegex(sectionName.trim())}\\b`, "i").test(l)) {
      secIdx = i;
      break;
    }
  }

  if (secIdx === -1) {
    return `${source.trimEnd()}\n  section ${safeLabel(sectionName.trim())}\n${taskLine}\n`;
  }

  let insertAt = secIdx + 1;
  while (insertAt < lines.length) {
    const l = lines[insertAt];
    if (/^\s*section\b/i.test(l)) break;
    insertAt++;
  }
  while (insertAt > secIdx + 1 && !lines[insertAt - 1].trim()) {
    insertAt--;
  }
  lines.splice(insertAt, 0, taskLine);
  return lines.join("\n");
}

export function deleteJourneyTask(source, taskName) {
  if (!taskName.trim()) throw new Error("Task name required.");
  const lines = source
    .split("\n")
    .filter(
      (l) => !new RegExp(`^\\s*${escapeRegex(taskName.trim())}\\s*:`, "i").test(l),
    );
  return lines.join("\n");
}

/* -------------------------------------------------------------------------- */
/* KANBAN BOARD VISUAL MODELING                                               */
/* -------------------------------------------------------------------------- */

export const isKanban = (doc) =>
  doc?.format === "mermaid" && /^\s*kanban\b/m.test(doc.source);

export function kanbanColumns(source) {
  const columns = [];
  let currentColumn = null;

  for (const line of source.split("\n")) {
    if (/^\s*%%/.test(line) || /^\s*kanban\b/i.test(line)) continue;
    const cardMatch = line.match(/^\s*\[(.*?)\]\s*$/);
    if (cardMatch) {
      if (!currentColumn) {
        currentColumn = { name: "Backlog", cards: [] };
        columns.push(currentColumn);
      }
      currentColumn.cards.push(cardMatch[1].trim());
      continue;
    }
    const colMatch = line.match(/^\s{1,4}([\w\s-]+?)\s*$/);
    if (colMatch && !line.includes("[") && !line.includes("]")) {
      const colName = colMatch[1].trim();
      currentColumn = { name: colName, cards: [] };
      columns.push(currentColumn);
    }
  }

  return columns;
}

export function addKanbanColumn(source, columnName) {
  if (!columnName.trim()) throw new Error("Column name required.");
  return `${source.trimEnd()}\n  ${safeLabel(columnName.trim())}\n`;
}

export function addKanbanCard(source, columnName, cardText) {
  if (!cardText.trim()) throw new Error("Card text required.");
  const safeCard = `    [${safeLabel(cardText.trim())}]`;
  const lines = source.split("\n");

  if (!columnName) {
    return `${source.trimEnd()}\n${safeCard}\n`;
  }

  let colIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (new RegExp(`^\\s{1,4}${escapeRegex(columnName.trim())}\\s*$`, "i").test(l)) {
      colIdx = i;
      break;
    }
  }

  if (colIdx === -1) {
    return `${source.trimEnd()}\n  ${safeLabel(columnName.trim())}\n${safeCard}\n`;
  }

  let insertAt = colIdx + 1;
  while (insertAt < lines.length) {
    const l = lines[insertAt];
    if (/^\s{1,4}[\w\s-]+?\s*$/.test(l) && !l.includes("[") && !l.includes("]")) break;
    insertAt++;
  }
  while (insertAt > colIdx + 1 && !lines[insertAt - 1].trim()) {
    insertAt--;
  }

  lines.splice(insertAt, 0, safeCard);
  return lines.join("\n");
}

export function deleteKanbanCard(source, cardText) {
  if (!cardText.trim()) throw new Error("Card text required.");
  const lines = source
    .split("\n")
    .filter((l) => !l.includes(`[${cardText.trim()}]`));
  return lines.join("\n");
}

/* -------------------------------------------------------------------------- */
/* GANTT CHART VISUAL MODELING                                                */
/* -------------------------------------------------------------------------- */

export const isGantt = (doc) =>
  doc?.format === "mermaid" && /^\s*gantt\b/m.test(doc.source);

export function ganttSections(source) {
  const sections = [];
  let currentSection = { name: "General", tasks: [] };
  sections.push(currentSection);
  let inFrontmatter = false;

  for (const line of source.split("\n")) {
    if (/^---\s*$/.test(line)) {
      inFrontmatter = !inFrontmatter;
      continue;
    }
    if (inFrontmatter || /^\s*%%/.test(line)) continue;
    const secMatch = line.match(/^\s*section\s+(.+)$/i);
    if (secMatch) {
      currentSection = { name: secMatch[1].trim(), tasks: [] };
      sections.push(currentSection);
      continue;
    }
    const taskMatch = line.match(/^\s*([^:]+?)\s*:\s*(.+)$/);
    if (
      taskMatch &&
      !/^(title|dateFormat|axisFormat|excludes|todayMarker)\b/i.test(
        taskMatch[1].trim(),
      )
    ) {
      const taskName = taskMatch[1].trim();
      const details = taskMatch[2].trim();
      const tags = details.split(",").map((s) => s.trim());
      currentSection.tasks.push({
        name: taskName,
        details,
        status:
          tags.find((t) =>
            ["done", "active", "crit", "milestone"].includes(t),
          ) || "active",
      });
    }
  }

  return sections.filter((s) => s.name !== "General" || s.tasks.length > 0);
}

export function addGanttSection(source, sectionName) {
  if (!sectionName.trim()) throw new Error("Section name required.");
  return `${source.trimEnd()}\n\n    section ${safeLabel(sectionName.trim())}\n`;
}

export function addGanttTask(
  source,
  sectionName,
  taskName,
  status = "active",
  duration = "5d",
) {
  if (!taskName.trim()) throw new Error("Task name required.");
  const cleanStatus = ["done", "active", "crit", "milestone"].includes(status)
    ? status
    : "active";
  const cleanDuration = safeLabel(duration.trim() || "5d");
  const taskId = "t" + Math.random().toString(36).substring(2, 6);
  const taskLine = `    ${safeLabel(taskName.trim())} :${cleanStatus}, ${taskId}, ${cleanDuration}`;

  const lines = source.split("\n");
  if (!sectionName) {
    return `${source.trimEnd()}\n${taskLine}\n`;
  }

  let secIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (
      new RegExp(
        `^\\s*section\\s+${escapeRegex(sectionName.trim())}\\b`,
        "i",
      ).test(l)
    ) {
      secIdx = i;
      break;
    }
  }

  if (secIdx === -1) {
    return `${source.trimEnd()}\n\n    section ${safeLabel(sectionName.trim())}\n${taskLine}\n`;
  }

  let insertAt = secIdx + 1;
  while (insertAt < lines.length) {
    const l = lines[insertAt];
    if (/^\s*section\b/i.test(l)) break;
    insertAt++;
  }
  while (insertAt > secIdx + 1 && !lines[insertAt - 1].trim()) {
    insertAt--;
  }

  lines.splice(insertAt, 0, taskLine);
  return lines.join("\n");
}

export function deleteGanttTask(source, taskName) {
  if (!taskName.trim()) throw new Error("Task name required.");
  const lines = source
    .split("\n")
    .filter(
      (l) =>
        !new RegExp(`^\\s*${escapeRegex(taskName.trim())}\\s*:`, "i").test(l),
    );
  return lines.join("\n");
}

/* -------------------------------------------------------------------------- */
/* QUADRANT CHART VISUAL MODELING                                             */
/* -------------------------------------------------------------------------- */

export const isQuadrantChart = (doc) =>
  doc?.format === "mermaid" && /^\s*quadrantChart\b/m.test(doc.source);

export function quadrantPoints(source) {
  const points = [];
  for (const line of source.split("\n")) {
    if (/^\s*%%/.test(line)) continue;
    const match = line.match(
      /^\s*([^:]+?)\s*:\s*\[\s*([0-9.]+)\s*,\s*([0-9.]+)\s*\]\s*$/,
    );
    if (match) {
      points.push({
        label: match[1].trim(),
        x: parseFloat(match[2]),
        y: parseFloat(match[3]),
      });
    }
  }
  return points;
}

export function addQuadrantPoint(source, label, x = 0.5, y = 0.5) {
  if (!label.trim()) throw new Error("Point label required.");
  const xVal = Math.max(0, Math.min(1, parseFloat(x) || 0.5));
  const yVal = Math.max(0, Math.min(1, parseFloat(y) || 0.5));
  return `${source.trimEnd()}\n    ${safeLabel(label.trim())}: [${xVal}, ${yVal}]\n`;
}

export function deleteQuadrantPoint(source, label) {
  if (!label.trim()) throw new Error("Point label required.");
  const lines = source
    .split("\n")
    .filter(
      (l) =>
        !new RegExp(`^\\s*${escapeRegex(label.trim())}\\s*:`, "i").test(l),
    );
  return lines.join("\n");
}

/* -------------------------------------------------------------------------- */
/* TIMELINE & TIMING DIAGRAM VISUAL MODELING                                  */
/* -------------------------------------------------------------------------- */

export const isTimeline = (doc) =>
  doc?.format === "mermaid" && /^\s*timeline\b/m.test(doc.source);

export function timelineSections(source) {
  const sections = [];
  let currentSection = { name: "General", events: [] };
  sections.push(currentSection);

  for (const line of source.split("\n")) {
    if (/^\s*%%/.test(line)) continue;
    const secMatch = line.match(/^\s*section\s+(.+)$/i);
    if (secMatch) {
      currentSection = { name: secMatch[1].trim(), events: [] };
      sections.push(currentSection);
      continue;
    }
    const evtMatch = line.match(/^\s{4,8}([^:\n]+?)(?:\s*:\s*(.+))?$/);
    if (
      evtMatch &&
      !/^(title|accTitle|accDescr)\b/i.test(evtMatch[1].trim())
    ) {
      currentSection.events.push({
        title: evtMatch[1].trim(),
        description: (evtMatch[2] || "").trim(),
      });
    }
  }
  return sections.filter((s) => s.name !== "General" || s.events.length > 0);
}

export function addTimelineSection(source, sectionName) {
  if (!sectionName.trim()) throw new Error("Section name required.");
  return `${source.trimEnd()}\n\n    section ${safeLabel(sectionName.trim())}\n`;
}

export function addTimelineEvent(source, sectionName, eventName, desc = "") {
  if (!eventName.trim()) throw new Error("Event title required.");
  const descPart = desc.trim() ? ` : ${safeLabel(desc.trim())}` : "";
  const eventLine = `        ${safeLabel(eventName.trim())}${descPart}`;

  const lines = source.split("\n");
  if (!sectionName) {
    return `${source.trimEnd()}\n${eventLine}\n`;
  }

  let secIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (
      new RegExp(
        `^\\s*section\\s+${escapeRegex(sectionName.trim())}\\b`,
        "i",
      ).test(l)
    ) {
      secIdx = i;
      break;
    }
  }

  if (secIdx === -1) {
    return `${source.trimEnd()}\n\n    section ${safeLabel(sectionName.trim())}\n${eventLine}\n`;
  }

  let insertAt = secIdx + 1;
  while (insertAt < lines.length) {
    const l = lines[insertAt];
    if (/^\s*section\b/i.test(l)) break;
    insertAt++;
  }
  while (insertAt > secIdx + 1 && !lines[insertAt - 1].trim()) {
    insertAt--;
  }

  lines.splice(insertAt, 0, eventLine);
  return lines.join("\n");
}

export function deleteTimelineEvent(source, eventName) {
  if (!eventName.trim()) throw new Error("Event title required.");
  const lines = source
    .split("\n")
    .filter(
      (l) =>
        !new RegExp(
          `^\\s{4,8}${escapeRegex(eventName.trim())}\\b`,
          "i",
        ).test(l),
    );
  return lines.join("\n");
}

/* -------------------------------------------------------------------------- */
/* SANKEY DIAGRAM VISUAL MODELING                                             */
/* -------------------------------------------------------------------------- */

export const isSankey = (doc) =>
  doc?.format === "mermaid" && /^\s*sankey(?:-beta)?\b/m.test(doc.source);

export function sankeyLinks(source) {
  const links = [];
  for (const line of source.split("\n")) {
    if (/^\s*%%/.test(line) || /^\s*sankey/i.test(line)) continue;
    const parts = line.split(",").map((s) => s.trim());
    if (parts.length >= 3 && !isNaN(parseFloat(parts[2]))) {
      links.push({
        source: parts[0],
        target: parts[1],
        value: parseFloat(parts[2]),
      });
    }
  }
  return links;
}

export function addSankeyLink(source, srcNode, dstNode, value) {
  if (!srcNode.trim()) throw new Error("Source node required.");
  if (!dstNode.trim()) throw new Error("Target node required.");
  const val = parseFloat(value);
  if (isNaN(val) || val <= 0)
    throw new Error("Flow value must be a positive number.");
  const linkLine = `    ${safeLabel(srcNode.trim())}, ${safeLabel(dstNode.trim())}, ${val}`;
  return `${source.trimEnd()}\n${linkLine}\n`;
}

export function deleteSankeyLink(source, srcNode, dstNode) {
  if (!srcNode.trim() || !dstNode.trim())
    throw new Error("Source and target required.");
  const lines = source.split("\n").filter((line) => {
    const parts = line.split(",").map((s) => s.trim());
    if (parts.length >= 2) {
      if (
        parts[0].toLowerCase() === srcNode.trim().toLowerCase() &&
        parts[1].toLowerCase() === dstNode.trim().toLowerCase()
      ) {
        return false;
      }
    }
    return true;
  });
  return lines.join("\n");
}

/* -------------------------------------------------------------------------- */
/* XY CHART VISUAL MODELING                                                   */
/* -------------------------------------------------------------------------- */

export const isXyChart = (doc) =>
  doc?.format === "mermaid" && /^\s*xychart(?:-beta)?\b/m.test(doc.source);

export function xyChartData(source) {
  let title = "";
  let xAxis = [];
  let yAxis = { label: "", min: 0, max: 100 };
  const series = [];

  for (const line of source.split("\n")) {
    if (/^\s*%%/.test(line)) continue;
    const tMatch = line.match(/^\s*title\s+"?(.*?)"?\s*$/i);
    if (tMatch) {
      title = tMatch[1].trim();
      continue;
    }
    const xMatch = line.match(/^\s*x-axis\s+\[(.*?)\]/i);
    if (xMatch) {
      xAxis = xMatch[1]
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, "").trim())
        .filter(Boolean);
      continue;
    }
    const yMatch = line.match(
      /^\s*y-axis\s*(?:"(.*?)"\s*)?([0-9.]+)\s*-->\s*([0-9.]+)/i,
    );
    if (yMatch) {
      yAxis = {
        label: (yMatch[1] || "").trim(),
        min: parseFloat(yMatch[2]) || 0,
        max: parseFloat(yMatch[3]) || 100,
      };
      continue;
    }
    const sMatch = line.match(/^\s*(bar|line)\s*\[(.*?)\]/i);
    if (sMatch) {
      const type = sMatch[1].toLowerCase();
      const values = sMatch[2]
        .split(",")
        .map((v) => parseFloat(v.trim()))
        .filter((n) => !isNaN(n));
      series.push({ type, values });
    }
  }

  return { title, xAxis, yAxis, series };
}

export function updateXyChartTitle(source, title) {
  if (!title.trim()) throw new Error("Title required.");
  const safeTitle = `"${title.replace(/"/g, "'").trim()}"`;
  const lines = source.split("\n");
  let found = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*title\b/i.test(lines[i])) {
      lines[i] = `    title ${safeTitle}`;
      found = true;
      break;
    }
  }
  if (!found) {
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*xychart(?:-beta)?/i.test(lines[i])) {
        lines.splice(i + 1, 0, `    title ${safeTitle}`);
        found = true;
        break;
      }
    }
  }
  return lines.join("\n");
}

export function addXyChartSeries(source, type = "bar", values = []) {
  const cleanType = type.toLowerCase() === "line" ? "line" : "bar";
  const nums = (Array.isArray(values) ? values : String(values).split(","))
    .map((v) => parseFloat(String(v).trim()))
    .filter((n) => !isNaN(n));
  if (nums.length === 0)
    throw new Error("At least one numerical value required.");
  const seriesLine = `    ${cleanType} [${nums.join(", ")}]`;
  return `${source.trimEnd()}\n${seriesLine}\n`;
}

export function deleteXyChartSeries(source, index) {
  const lines = source.split("\n");
  let sCount = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*(bar|line)\s*\[/i.test(lines[i])) {
      if (sCount === index) {
        lines.splice(i, 1);
        return lines.join("\n");
      }
      sCount++;
    }
  }
  return lines.join("\n");
}

/* -------------------------------------------------------------------------- */
/* BLOCK DIAGRAM VISUAL MODELING                                              */
/* -------------------------------------------------------------------------- */

export const isBlock = (doc) =>
  doc?.format === "mermaid" && /^\s*block(?:-beta)?\b/m.test(doc.source);

export function getBlockColumns(source) {
  const match = source.match(/^\s*columns\s+(\d+)/m);
  return match ? parseInt(match[1], 10) : 1;
}

export function setBlockColumns(source, columns) {
  const cols = Math.max(1, parseInt(columns, 10) || 1);
  const lines = source.split("\n");
  let found = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*columns\s+\d+/i.test(lines[i])) {
      lines[i] = `    columns ${cols}`;
      found = true;
      break;
    }
  }
  if (!found) {
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*block(?:-beta)?/i.test(lines[i])) {
        lines.splice(i + 1, 0, `    columns ${cols}`);
        found = true;
        break;
      }
    }
  }
  return lines.join("\n");
}

export function blockItems(source) {
  const items = [];
  for (const line of source.split("\n")) {
    const trimmed = line.trim();
    if (
      !trimmed ||
      /^\s*%%/.test(trimmed) ||
      /^\s*block(?:-beta)?/i.test(trimmed) ||
      /^\s*columns\b/i.test(trimmed) ||
      /^\s*end\b/i.test(trimmed) ||
      trimmed.includes("-->") ||
      trimmed.includes("---")
    ) {
      continue;
    }

    const itemRegex = /([A-Za-z0-9_-]+)(?:\["?(.*?)"?\])?(?::(\d+))?/g;
    let match;
    while ((match = itemRegex.exec(trimmed)) !== null) {
      const id = match[1];
      if (
        ["block", "columns", "end", "style", "class"].includes(
          id.toLowerCase(),
        )
      )
        continue;
      const label = match[2] !== undefined ? match[2] : id;
      const span = match[3] ? parseInt(match[3], 10) : 1;
      items.push({ id, label, span });
    }
  }
  return items;
}

export function addBlockItem(source, id, label = "", span = 1) {
  if (!id || !id.trim()) throw new Error("Block ID required.");
  const cleanId = id.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
  const cleanLabel = (label || id).trim().replace(/"/g, "'");
  const numSpan = Math.max(1, parseInt(span, 10) || 1);
  const itemLine = `    ${cleanId}["${cleanLabel}"]${numSpan > 1 ? `:${numSpan}` : ""}`;

  const lines = source.split("\n");
  let insertIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("-->") || lines[i].includes("---")) {
      insertIdx = i;
      break;
    }
  }
  if (insertIdx !== -1) {
    lines.splice(insertIdx, 0, itemLine);
    return lines.join("\n");
  }
  return `${source.trimEnd()}\n${itemLine}\n`;
}

export function deleteBlockItem(source, id) {
  if (!id || !id.trim()) throw new Error("Block ID required.");
  const targetId = id.trim();
  const tokenRegex = new RegExp(
    `\\b${escapeRegex(targetId)}(?:\\["?[^"\\]]*"?\\])?(?::\\d+)?`,
    "g",
  );

  const lines = [];
  for (const line of source.split("\n")) {
    if (line.includes("-->") || line.includes("---")) {
      const tokens = line.split(/-->|---|==>/).map((s) => s.trim());
      if (tokens.some((t) => t.startsWith(targetId))) continue;
      lines.push(line);
      continue;
    }

    if (new RegExp(`\\b${escapeRegex(targetId)}\\b`).test(line)) {
      const cleaned = line.replace(tokenRegex, "").trim();
      if (cleaned) {
        lines.push("    " + cleaned);
      }
      continue;
    }

    lines.push(line);
  }
  return lines.join("\n");
}

/* -------------------------------------------------------------------------- */
/* C4 ARCHITECTURE VISUAL MODELING                                            */
/* -------------------------------------------------------------------------- */

export const isC4 = (doc) =>
  doc?.format === "mermaid" &&
  /^\s*C4(?:Context|Container|Component|Dynamic|Deployment)\b/m.test(
    doc.source,
  );

export function c4Elements(source) {
  const elements = [];
  const elRegex =
    /^\s*(Person(?:_Ext)?|System(?:_Ext|_Db|Db)?|Container(?:_Ext|_Db|Db)?|Component(?:_Ext|_Db|Db)?)\s*\(\s*([A-Za-z0-9_-]+)\s*,\s*"([^"]*)"(?:\s*,\s*"([^"]*)")?(?:\s*,\s*"([^"]*)")?\s*\)/;

  for (const line of source.split("\n")) {
    if (/^\s*%%/.test(line)) continue;
    const match = line.match(elRegex);
    if (match) {
      const type = match[1];
      const id = match[2];
      const label = match[3];
      const arg3 = match[4] || "";
      const arg4 = match[5] || "";

      let tech = "";
      let desc = arg3;
      if (type.startsWith("Container") || type.startsWith("Component")) {
        tech = arg3;
        desc = arg4 || arg3;
      }
      elements.push({ type, id, label, tech, desc });
    }
  }
  return elements;
}

export function c4Relations(source) {
  const rels = [];
  const relRegex =
    /^\s*(Rel(?:_Back|_Neighbor|_D|_U|_L|_R)?)\s*\(\s*([A-Za-z0-9_-]+)\s*,\s*([A-Za-z0-9_-]+)\s*,\s*"([^"]*)"(?:\s*,\s*"([^"]*)")?\s*\)/;

  for (const line of source.split("\n")) {
    if (/^\s*%%/.test(line)) continue;
    const match = line.match(relRegex);
    if (match) {
      rels.push({
        type: match[1],
        from: match[2],
        to: match[3],
        label: match[4],
        tech: match[5] || "",
      });
    }
  }
  return rels;
}

export function addC4Element(
  source,
  type = "System",
  id,
  label,
  desc = "",
  tech = "",
) {
  if (!id || !id.trim()) throw new Error("Element ID required.");
  if (!label || !label.trim()) throw new Error("Element label required.");

  const cleanType = [
    "Person",
    "Person_Ext",
    "System",
    "System_Ext",
    "Container",
    "ContainerDb",
    "Component",
  ].includes(type)
    ? type
    : "System";

  const cleanId = id.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
  const cleanLabel = label.trim().replace(/"/g, "'");
  const cleanDesc = (desc || "").trim().replace(/"/g, "'");
  const cleanTech = (tech || "").trim().replace(/"/g, "'");

  let line = "";
  if (cleanType.startsWith("Container") || cleanType.startsWith("Component")) {
    line = `    ${cleanType}(${cleanId}, "${cleanLabel}", "${cleanTech}", "${cleanDesc}")`;
  } else {
    line = `    ${cleanType}(${cleanId}, "${cleanLabel}", "${cleanDesc}")`;
  }

  const lines = source.split("\n");
  let insertIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*Rel\w*\s*\(/i.test(lines[i])) {
      insertIdx = i;
      break;
    }
  }

  if (insertIdx !== -1) {
    lines.splice(insertIdx, 0, line);
    return lines.join("\n");
  }
  return `${source.trimEnd()}\n${line}\n`;
}

export function deleteC4Element(source, id) {
  if (!id || !id.trim()) throw new Error("Element ID required.");
  const targetId = id.trim();
  const lines = source.split("\n").filter((line) => {
    if (
      new RegExp(
        `^\\s*\\w+\\s*\\(\\s*${escapeRegex(targetId)}\\s*,`,
        "i",
      ).test(line)
    ) {
      return false;
    }
    if (
      new RegExp(
        `^\\s*Rel\\w*\\s*\\(\\s*${escapeRegex(targetId)}\\s*,`,
        "i",
      ).test(line) ||
      new RegExp(
        `^\\s*Rel\\w*\\s*\\([^,]+,\\s*${escapeRegex(targetId)}\\s*,`,
        "i",
      ).test(line)
    ) {
      return false;
    }
    return true;
  });
  return lines.join("\n");
}

export function addC4Relation(source, from, to, label, tech = "") {
  if (!from || !from.trim()) throw new Error("Source element required.");
  if (!to || !to.trim()) throw new Error("Target element required.");
  const cleanFrom = from.trim();
  const cleanTo = to.trim();
  const cleanLabel = (label || "Uses").trim().replace(/"/g, "'");
  const cleanTech = (tech || "").trim().replace(/"/g, "'");

  const relLine = cleanTech
    ? `    Rel(${cleanFrom}, ${cleanTo}, "${cleanLabel}", "${cleanTech}")`
    : `    Rel(${cleanFrom}, ${cleanTo}, "${cleanLabel}")`;

  return `${source.trimEnd()}\n${relLine}\n`;
}

export function deleteC4Relation(source, from, to) {
  if (!from || !to) throw new Error("From and To required.");
  const cleanFrom = from.trim();
  const cleanTo = to.trim();
  const lines = source.split("\n").filter((line) => {
    return !new RegExp(
      `^\\s*Rel\\w*\\s*\\(\\s*${escapeRegex(cleanFrom)}\\s*,\\s*${escapeRegex(cleanTo)}\\s*,`,
      "i",
    ).test(line);
  });
  return lines.join("\n");
}

/* -------------------------------------------------------------------------- */
/* REQUIREMENT DIAGRAM VISUAL MODELING                                        */
/* -------------------------------------------------------------------------- */

export const isRequirement = (doc) =>
  doc?.format === "mermaid" &&
  /^\s*requirementDiagram\b/m.test(doc.source);

export function requirementItems(source) {
  const items = [];
  const reqBlockRegex =
    /(requirement|functionalRequirement|interfaceRequirement|performanceRequirement|physicalRequirement|designConstraint)\s+([A-Za-z0-9_-]+)\s*\{([^}]*)\}/gi;
  let match;
  while ((match = reqBlockRegex.exec(source)) !== null) {
    const type = match[1];
    const name = match[2];
    const body = match[3];

    const idMatch = body.match(/^\s*id\s*:\s*(.+)$/im);
    const textMatch = body.match(/^\s*text\s*:\s*(.+)$/im);
    const riskMatch = body.match(/^\s*risk\s*:\s*(\w+)/im);
    const verifyMatch = body.match(/^\s*verifymethod\s*:\s*(\w+)/im);

    items.push({
      category: "requirement",
      type,
      name,
      id: idMatch ? idMatch[1].trim() : "",
      text: textMatch ? textMatch[1].trim() : "",
      risk: riskMatch ? riskMatch[1].trim() : "low",
      verify: verifyMatch ? verifyMatch[1].trim() : "test",
    });
  }

  const elBlockRegex = /element\s+([A-Za-z0-9_-]+)\s*\{([^}]*)\}/gi;
  while ((match = elBlockRegex.exec(source)) !== null) {
    const name = match[1];
    const body = match[2];
    const typeMatch = body.match(/^\s*type\s*:\s*(.+)$/im);
    const docrefMatch = body.match(/^\s*docref\s*:\s*(.+)$/im);
    items.push({
      category: "element",
      type: "element",
      name,
      elementType: typeMatch ? typeMatch[1].trim() : "module",
      docref: docrefMatch ? docrefMatch[1].trim() : "",
    });
  }

  return items;
}

export function requirementRelations(source) {
  const rels = [];
  const relRegex =
    /^\s*([A-Za-z0-9_-]+)\s*-\s*(satisfies|traces|derives|refines|copies|contains)\s*->\s*([A-Za-z0-9_-]+)/gm;
  let match;
  while ((match = relRegex.exec(source)) !== null) {
    rels.push({
      from: match[1].trim(),
      type: match[2].trim(),
      to: match[3].trim(),
    });
  }
  return rels;
}

export function addRequirement(
  source,
  type = "functionalRequirement",
  name,
  id,
  text,
  risk = "low",
  verify = "test",
) {
  if (!name || !name.trim()) throw new Error("Requirement name required.");
  const cleanName = name.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
  const cleanId = (id || "1").trim();
  const cleanText = (text || cleanName).trim().replace(/"/g, "'");
  const cleanRisk = ["low", "medium", "high"].includes(risk) ? risk : "low";
  const cleanVerify = [
    "test",
    "inspection",
    "analysis",
    "demonstration",
  ].includes(verify)
    ? verify
    : "test";

  const block = `
    ${type} ${cleanName} {
        id: ${cleanId}
        text: ${cleanText}
        risk: ${cleanRisk}
        verifymethod: ${cleanVerify}
    }`;

  const lines = source.split("\n");
  let insertIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(" - ") && lines[i].includes(" -> ")) {
      insertIdx = i;
      break;
    }
  }

  if (insertIdx !== -1) {
    lines.splice(insertIdx, 0, block);
    return lines.join("\n");
  }
  return `${source.trimEnd()}\n${block}\n`;
}

export function addRequirementElement(source, name, elType = "module") {
  if (!name || !name.trim()) throw new Error("Element name required.");
  const cleanName = name.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
  const cleanType = (elType || "module").trim();
  const block = `
    element ${cleanName} {
        type: ${cleanType}
    }`;

  const lines = source.split("\n");
  let insertIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(" - ") && lines[i].includes(" -> ")) {
      insertIdx = i;
      break;
    }
  }

  if (insertIdx !== -1) {
    lines.splice(insertIdx, 0, block);
    return lines.join("\n");
  }
  return `${source.trimEnd()}\n${block}\n`;
}

export function deleteRequirement(source, name) {
  if (!name || !name.trim()) throw new Error("Name required.");
  const target = name.trim();

  const blockRegex = new RegExp(
    `(?:requirement|functionalRequirement|interfaceRequirement|performanceRequirement|physicalRequirement|designConstraint|element)\\s+${escapeRegex(target)}\\s*\\{[^}]*\\}`,
    "gi",
  );
  let updated = source.replace(blockRegex, "");

  const lines = updated.split("\n").filter((line) => {
    if (line.includes(" - ") && line.includes(" -> ")) {
      const parts = line.split(/->|-/).map((s) => s.trim());
      if (parts.some((p) => p === target)) return false;
    }
    return true;
  });

  return lines.join("\n").replace(/\n{3,}/g, "\n\n");
}

export function addRequirementRelation(
  source,
  from,
  to,
  relType = "satisfies",
) {
  if (!from || !from.trim()) throw new Error("Source element required.");
  if (!to || !to.trim()) throw new Error("Target requirement required.");
  const cleanFrom = from.trim();
  const cleanTo = to.trim();
  const cleanRel = [
    "satisfies",
    "traces",
    "derives",
    "refines",
    "copies",
    "contains",
  ].includes(relType)
    ? relType
    : "satisfies";

  const relLine = `    ${cleanFrom} - ${cleanRel} -> ${cleanTo}`;
  return `${source.trimEnd()}\n${relLine}\n`;
}

export function deleteRequirementRelation(source, from, to) {
  if (!from || !to) throw new Error("From and To required.");
  const cleanFrom = from.trim();
  const cleanTo = to.trim();
  const lines = source.split("\n").filter((line) => {
    return !new RegExp(
      `^\\s*${escapeRegex(cleanFrom)}\\s*-\\s*\\w+\\s*->\\s*${escapeRegex(cleanTo)}`,
      "i",
    ).test(line);
  });
  return lines.join("\n");
}

/* -------------------------------------------------------------------------- */
/* PACKET / BYTEFIELD DIAGRAM VISUAL MODELING                                 */
/* -------------------------------------------------------------------------- */

export const isPacket = (doc) =>
  doc?.format === "mermaid" &&
  /^\s*packet(?:-beta)?\b/m.test(doc.source);

export function packetFields(source) {
  const fields = [];
  const lines = source.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith("%%") || /^\s*packet(?:-beta)?\b/i.test(line)) continue;
    const match = line.match(/^(\d+)(?:-(\d+))?\s*:\s*(.+)$/);
    if (match) {
      const start = parseInt(match[1], 10);
      const end = match[2] ? parseInt(match[2], 10) : start;
      const label = match[3].replace(/^["']|["']$/g, "").trim();
      fields.push({
        start,
        end,
        label,
        bits: end - start + 1,
      });
    }
  }
  return fields;
}

export function addPacketField(source, start, end, label) {
  if (start === undefined || start === null || start === "" || isNaN(Number(start))) {
    throw new Error("Start bit required.");
  }
  const s = parseInt(start, 10);
  const e =
    end !== undefined && end !== null && end !== "" && !isNaN(Number(end))
      ? parseInt(end, 10)
      : s;
  if (e < s) throw new Error("End bit cannot be less than start bit.");
  const cleanLabel = (label || `Field ${s}`).trim().replace(/"/g, "'");

  const line =
    s === e ? `    ${s}: "${cleanLabel}"` : `    ${s}-${e}: "${cleanLabel}"`;
  return `${source.trimEnd()}\n${line}\n`;
}

export function deletePacketField(source, start, end) {
  if (start === undefined || start === null || start === "" || isNaN(Number(start))) {
    throw new Error("Start bit required.");
  }
  const s = parseInt(start, 10);
  const e =
    end !== undefined && end !== null && end !== "" && !isNaN(Number(end))
      ? parseInt(end, 10)
      : s;

  const lines = source.split("\n").filter((line) => {
    const trimmed = line.trim();
    const match = trimmed.match(/^(\d+)(?:-(\d+))?\s*:/);
    if (match) {
      const lineStart = parseInt(match[1], 10);
      const lineEnd = match[2] ? parseInt(match[2], 10) : lineStart;
      if (lineStart === s && lineEnd === e) return false;
    }
    return true;
  });

  return lines.join("\n");
}

/* -------------------------------------------------------------------------- */
/* ARCHITECTURE DIAGRAM (architecture-beta) VISUAL MODELING                   */
/* -------------------------------------------------------------------------- */

export const isArchitecture = (doc) =>
  doc?.format === "mermaid" &&
  /^\s*architecture(?:-beta)?\b/m.test(doc.source);

export function architectureGroups(source) {
  const groups = [];
  const groupRegex =
    /^\s*group\s+([A-Za-z0-9_-]+)(?:\(([^)]*)\))?(?:\[([^\]]*)\])?/gm;
  let match;
  while ((match = groupRegex.exec(source)) !== null) {
    groups.push({
      id: match[1],
      icon: match[2] || "cloud",
      title: match[3] || match[1],
    });
  }
  return groups;
}

export function architectureServices(source) {
  const services = [];
  const serviceRegex =
    /^\s*service\s+([A-Za-z0-9_-]+)(?:\(([^)]*)\))?(?:\[([^\]]*)\])?(?:\s+in\s+([A-Za-z0-9_-]+))?/gm;
  let match;
  while ((match = serviceRegex.exec(source)) !== null) {
    services.push({
      id: match[1],
      icon: match[2] || "server",
      title: match[3] || match[1],
      inGroup: match[4] || null,
    });
  }
  return services;
}

export function architectureEdges(source) {
  const edges = [];
  const edgeRegex =
    /^\s*([A-Za-z0-9_-]+):([LRTB])\s*(--|-->)\s*([LRTB]):([A-Za-z0-9_-]+)/gm;
  let match;
  while ((match = edgeRegex.exec(source)) !== null) {
    edges.push({
      from: match[1],
      fromSide: match[2],
      toSide: match[4],
      to: match[5],
      directed: match[3] === "-->",
    });
  }
  return edges;
}

export function addArchitectureGroup(source, id, title, icon = "cloud") {
  if (!id || !id.trim()) throw new Error("Group ID required.");
  const cleanId = id.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
  const cleanTitle = (title || cleanId).trim().replace(/[\[\]]/g, "");
  const cleanIcon = (icon || "cloud").trim().replace(/[()]/g, "");

  const line = `    group ${cleanId}(${cleanIcon})[${cleanTitle}]`;
  const lines = source.split("\n");
  let insertIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*(service|junction|[A-Za-z0-9_-]+:[LRTB])\b/.test(lines[i])) {
      insertIdx = i;
      break;
    }
  }

  if (insertIdx !== -1) {
    lines.splice(insertIdx, 0, line);
    return lines.join("\n");
  }
  return `${source.trimEnd()}\n${line}\n`;
}

export function deleteArchitectureGroup(source, id) {
  if (!id || !id.trim()) throw new Error("Group ID required.");
  const target = id.trim();
  const groupLineRegex = new RegExp(
    `^\\s*group\\s+${escapeRegex(target)}(?:\\([^)]*\\))?(?:\\[[^\\]]*\\])?`,
    "i",
  );
  const inGroupRegex = new RegExp(`\\s+in\\s+${escapeRegex(target)}\\b`, "i");

  const lines = source.split("\n").filter((line) => !groupLineRegex.test(line));
  return lines.map((line) => line.replace(inGroupRegex, "")).join("\n");
}

export function addArchitectureService(
  source,
  id,
  title,
  icon = "server",
  inGroup = null,
) {
  if (!id || !id.trim()) throw new Error("Service ID required.");
  const cleanId = id.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
  const cleanTitle = (title || cleanId).trim().replace(/[\[\]]/g, "");
  const cleanIcon = (icon || "server").trim().replace(/[()]/g, "");
  const groupSuffix = inGroup && inGroup.trim() ? ` in ${inGroup.trim()}` : "";

  const line = `    service ${cleanId}(${cleanIcon})[${cleanTitle}]${groupSuffix}`;
  const lines = source.split("\n");
  let insertIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*[A-Za-z0-9_-]+:[LRTB]\s*(--|-->)/.test(lines[i])) {
      insertIdx = i;
      break;
    }
  }

  if (insertIdx !== -1) {
    lines.splice(insertIdx, 0, line);
    return lines.join("\n");
  }
  return `${source.trimEnd()}\n${line}\n`;
}

export function deleteArchitectureService(source, id) {
  if (!id || !id.trim()) throw new Error("Service ID required.");
  const target = id.trim();
  const serviceLineRegex = new RegExp(
    `^\\s*service\\s+${escapeRegex(target)}(?:\\([^)]*\\))?(?:\\[[^\\]]*\\])?(?:\\s+in\\s+\\w+)?`,
    "i",
  );

  const lines = source.split("\n").filter((line) => {
    if (serviceLineRegex.test(line)) return false;
    if (
      new RegExp(`^\\s*${escapeRegex(target)}:[LRTB]`, "i").test(line) ||
      new RegExp(`[LRTB]:${escapeRegex(target)}\\s*$`, "i").test(line)
    ) {
      return false;
    }
    return true;
  });

  return lines.join("\n");
}

export function addArchitectureEdge(
  source,
  from,
  fromSide = "R",
  to,
  toSide = "L",
  directed = false,
) {
  if (!from || !from.trim()) throw new Error("Source service required.");
  if (!to || !to.trim()) throw new Error("Target service required.");
  const cleanFrom = from.trim();
  const cleanTo = to.trim();
  const fSide = ["L", "R", "T", "B"].includes(fromSide) ? fromSide : "R";
  const tSide = ["L", "R", "T", "B"].includes(toSide) ? toSide : "L";
  const connector = directed ? "-->" : "--";

  const line = `    ${cleanFrom}:${fSide} ${connector} ${tSide}:${cleanTo}`;
  return `${source.trimEnd()}\n${line}\n`;
}

export function deleteArchitectureEdge(source, from, to) {
  if (!from || !to) throw new Error("From and To required.");
  const cleanFrom = from.trim();
  const cleanTo = to.trim();

  const lines = source.split("\n").filter((line) => {
    return !(
      new RegExp(
        `^\\s*${escapeRegex(cleanFrom)}:[LRTB]\\s*(?:--|-->)\\s*[LRTB]:${escapeRegex(cleanTo)}`,
        "i",
      ).test(line) ||
      new RegExp(
        `^\\s*${escapeRegex(cleanTo)}:[LRTB]\\s*(?:--|-->)\\s*[LRTB]:${escapeRegex(cleanFrom)}`,
        "i",
      ).test(line)
    );
  });
  return lines.join("\n");
}
