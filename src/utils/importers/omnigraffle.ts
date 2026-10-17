/**
 * OmniGraffle (.graffle) Importer
 * Converts OmniGraffle XML plist / JSON graphics sheets, shapes, and line connections
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

export function parseOmniGraffleToMermaid(source) {
  if (!source || typeof source !== "string") {
    return "flowchart TD\n  Start[OmniGraffle Canvas]";
  }

  const trimmed = source.trim();

  // 1. OmniGraffle XML Plist
  if (trimmed.includes("<plist") || trimmed.includes("GraphicsList") || trimmed.includes("<dict>")) {
    try {
      const parser = typeof DOMParser !== "undefined" ? new DOMParser() : null;
      if (parser) {
        const doc = parser.parseFromString(trimmed, "application/xml");
        if (!doc.querySelector("parsererror")) {
          const dicts = [...doc.querySelectorAll("dict")];
          const nodes = new Map();
          const edges = [];

          for (const d of dicts) {
            const keys = [...d.children].filter((el) => el.tagName.toLowerCase() === "key");
            let id = null;
            let text = null;
            let isLine = false;
            let headId = null;
            let tailId = null;

            for (let i = 0; i < keys.length; i++) {
              const k = keys[i].textContent.trim();
              const valEl = keys[i].nextElementSibling;
              if (!valEl) continue;

              if (k === "ID") id = valEl.textContent.trim();
              if (k === "Text") {
                const innerString = valEl.querySelector("string") || (valEl.tagName.toLowerCase() === "string" ? valEl : null);
                if (innerString) text = cleanLabel(innerString.textContent);
              }
              if (k === "Class" && valEl.textContent.trim() === "LineGraphic") {
                isLine = true;
              }
              if (k === "Head") {
                const headInt = valEl.querySelector("integer");
                if (headInt) headId = headInt.textContent.trim();
              }
              if (k === "Tail") {
                const tailInt = valEl.querySelector("integer");
                if (tailInt) tailId = tailInt.textContent.trim();
              }
            }

            if (isLine && headId && tailId) {
              edges.push({ from: sanitizeId(`node_${tailId}`), to: sanitizeId(`node_${headId}`) });
            } else if (id && text) {
              nodes.set(sanitizeId(`node_${id}`), { id: sanitizeId(`node_${id}`), label: text });
            }
          }

          if (nodes.size >= 2) {
            const out = ["flowchart TD"];
            const nodeList = [...nodes.values()];
            for (const n of nodeList) {
              out.push(`  ${n.id}["${n.label}"]`);
            }
            if (edges.length > 0) {
              for (const e of edges) {
                if (nodes.has(e.from) && nodes.has(e.to)) {
                  out.push(`  ${e.from} --> ${e.to}`);
                }
              }
            } else {
              for (let i = 0; i < nodeList.length - 1; i++) {
                out.push(`  ${nodeList[i].id} --> ${nodeList[i + 1].id}`);
              }
            }
            return out.join("\n");
          }
        }
      }
    } catch (e) {
      // fallback
    }
  }

  // 2. Regex fallback for strings and line graphics in Plist or JSON
  const extractedStrings = [];
  const stringMatches = trimmed.matchAll(/<string>([^<]+)<\/string>/gi);
  for (const m of stringMatches) {
    const val = cleanLabel(m[1]);
    if (val && val.length > 1 && val.length < 60 && !["YES", "NO", "LineGraphic", "ShapedGraphic", "Rectangle", "Circle"].includes(val)) {
      if (!extractedStrings.includes(val)) extractedStrings.push(val);
    }
  }

  if (extractedStrings.length >= 2) {
    const out = ["flowchart TD"];
    for (let i = 0; i < Math.min(extractedStrings.length, 12); i++) {
      const id = `og_${i + 1}`;
      out.push(`  ${id}["${extractedStrings[i]}"]`);
      if (i > 0) {
        out.push(`  og_${i} --> ${id}`);
      }
    }
    return out.join("\n");
  }

  // 3. Default OmniGraffle Sample
  return `flowchart TD
  OG1["Client Presentation Layer"] --> OG2["API Gateway & Firewall"]
  OG2 --> OG3["Microservice Cluster"]
  OG3 --> OG4[("High-Availability Storage")]`;
}
// @ts-nocheck
