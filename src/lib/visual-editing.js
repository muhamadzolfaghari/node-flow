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









