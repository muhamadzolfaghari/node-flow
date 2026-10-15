/**
 * StarUML (.mdj) JSON model parser for NodeFlow
 * Converts StarUML UMLClass, UMLAttribute, UMLOperation, and UMLGeneralization / UMLAssociation
 * into valid Mermaid classDiagram definitions.
 */

export function parseStarUmlToMermaid(input) {
  let project;
  try {
    project = typeof input === "string" ? JSON.parse(input) : input;
  } catch (err) {
    throw new Error(`Failed to parse StarUML JSON: ${err.message}`);
  }

  if (!project || typeof project !== "object") {
    throw new Error("Invalid StarUML file: missing root project object.");
  }

  const classes = [];
  const relations = [];
  const classById = new Map();

  function traverse(node) {
    if (!node || typeof node !== "object") return;

    if (node._type === "UMLClass" && node.name) {
      classById.set(node._id, node.name);
      const attrs = (node.attributes || []).map((a) => {
        const vis =
          a.visibility === "private"
            ? "-"
            : a.visibility === "protected"
              ? "#"
              : "+";
        const typeStr = a.type || "string";
        return `    ${vis}${typeStr} ${a.name}`;
      });

      const ops = (node.operations || []).map((o) => {
        const vis =
          o.visibility === "private"
            ? "-"
            : o.visibility === "protected"
              ? "#"
              : "+";
        const retParam = (o.parameters || []).find(
          (p) => p.direction === "return",
        );
        const inParams = (o.parameters || [])
          .filter((p) => p.direction !== "return")
          .map((p) => `${p.name}: ${p.type || "any"}`)
          .join(", ");
        const retStr = retParam?.type ? `: ${retParam.type}` : "";
        return `    ${vis}${o.name}(${inParams})${retStr}`;
      });

      classes.push({ name: node.name, attrs, ops });
    }

    if (node._type === "UMLGeneralization") {
      relations.push({
        fromId: node.source?.$ref,
        toId: node.target?.$ref,
        type: "<|--",
      });
    }

    if (node._type === "UMLAssociation") {
      const end1 = node.end1;
      const end2 = node.end2;
      const fromId = end1?.reference?.$ref;
      const toId = end2?.reference?.$ref;
      let symbol = "-->";
      if (end1?.aggregation === "composite" || end2?.aggregation === "composite") {
        symbol = "*--";
      } else if (
        end1?.aggregation === "shared" ||
        end2?.aggregation === "shared"
      ) {
        symbol = "o--";
      }
      relations.push({ fromId, toId, type: symbol, label: node.name });
    }

    for (const val of Object.values(node)) {
      if (Array.isArray(val)) {
        val.forEach(traverse);
      } else if (typeof val === "object") {
        traverse(val);
      }
    }
  }

  traverse(project);

  if (classes.length === 0) {
    throw new Error(
      "No UML classes found in StarUML project. Ensure your project contains UMLClass definitions.",
    );
  }

  const lines = ["classDiagram"];
  for (const c of classes) {
    lines.push(`  class ${c.name} {`);
    for (const a of c.attrs) lines.push(a);
    for (const o of c.ops) lines.push(o);
    lines.push("  }");
  }

  for (const r of relations) {
    const fromName = classById.get(r.fromId);
    const toName = classById.get(r.toId);
    if (fromName && toName) {
      lines.push(
        `  ${fromName} ${r.type} ${toName}${r.label ? ` : ${r.label}` : ""}`,
      );
    }
  }

  return lines.join("\n");
}
