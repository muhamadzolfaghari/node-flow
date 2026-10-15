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

export const isFlowchart = (doc) =>
  doc?.format === "mermaid" &&
  /^\s*(flowchart|graph)\s+(TD|TB|BT|LR|RL)\b/m.test(doc.source);

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
export function connectFlowchartNodes(source, from, to, label = "") {
  const nodes = flowchartNodes(source);
  if (!nodes.some((n) => n.id === from) || !nodes.some((n) => n.id === to))
    throw new Error("Choose two existing nodes.");
  return `${source.trimEnd()}\n  ${from} -->${label.trim() ? `|"${safeLabel(label)}"|` : ""} ${to}\n`;
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

