/**
 * AI Architecture Engine & System Reasoning Agent
 * 100% Client-Side, Zero-Telemetry, Deterministic & AI-Native.
 *
 * Provides:
 * 1. Architecture Topology & Structural Topology Analysis
 * 2. Automated Non-Functional Complexity & Reliability Scoring
 * 3. Markdown Technical Architecture Design Document Generator
 * 4. Anti-Pattern Detection & One-Click AI Refactor Suggestions
 */
import { scanNodeDeclarations, flowchartEdges } from "../lib/visual-editing.js";

/**
 * Analyzes architectural components, topology, and graph complexity
 */
export function analyzeArchitecture(source = "", format = "mermaid") {
  if (!source || typeof source !== "string") {
    return {
      topology: "Empty",
      score: 100,
      complexity: "Zero",
      components: [],
      edges: [],
      bottlenecks: [],
      tiers: { presentation: [], application: [], persistence: [], external: [] },
      recommendations: ["Create or load a diagram to start architectural analysis."],
    };
  }

  // Extract nodes and edges using resilient scanners
  let nodes = [];
  try {
    const declMap = scanNodeDeclarations(source);
    nodes = Array.from(declMap.values()).map((d) => ({
      id: d.id,
      label: d.label || d.id,
      shape: d.shape,
    }));
  } catch {
    nodes = [];
  }

  // Fallback node extraction for non-flowchart formats or unstructured text
  if (nodes.length === 0) {
    const seen = new Set();
    for (const match of source.matchAll(/\b([A-Za-z_][\w-]*)\b/g)) {
      const id = match[1];
      if (id.length >= 2 && !seen.has(id) && !/^(flowchart|graph|sequenceDiagram|classDiagram|subgraph|end|service|group)$/i.test(id)) {
        seen.add(id);
        nodes.push({ id, label: id, shape: "rectangle" });
      }
    }
  }

  let edges = [];
  try {
    edges = flowchartEdges(source);
  } catch {
    edges = [];
  }

  // Degree analysis (Fan-in & Fan-out)
  const inDegree = new Map();
  const outDegree = new Map();
  nodes.forEach((n) => {
    inDegree.set(n.id, 0);
    outDegree.set(n.id, 0);
  });

  edges.forEach((e) => {
    outDegree.set(e.from, (outDegree.get(e.from) || 0) + 1);
    inDegree.set(e.to, (inDegree.get(e.to) || 0) + 1);
  });

  // Bottleneck & Single Point of Failure (SPOF) detection
  const bottlenecks = [];
  nodes.forEach((n) => {
    const totalConnections = (inDegree.get(n.id) || 0) + (outDegree.get(n.id) || 0);
    if (totalConnections >= 4) {
      bottlenecks.push({
        id: n.id,
        label: n.label,
        inDegree: inDegree.get(n.id) || 0,
        outDegree: outDegree.get(n.id) || 0,
        severity: totalConnections >= 5 ? "Critical" : "Warning",
        reason: `High coupling (${totalConnections} connections). Component is an architectural hotspot.`,
      });
    }
  });

  // Classify tiers based on component semantic clues
  const tiers = {
    presentation: [],
    application: [],
    persistence: [],
    external: [],
  };

  nodes.forEach((n) => {
    const text = (n.label + " " + n.id).toLowerCase();
    if (n.shape === "cylinder" || /(db|database|storage|sql|postgres|mongo|redis|s3|lake|table|bucket)/i.test(text)) {
      tiers.persistence.push(n);
    } else if (/(client|ui|frontend|browser|user|mobile|app|portal|web)/i.test(text)) {
      tiers.presentation.push(n);
    } else if (/(thirdparty|stripe|auth0|github|external|partner|vendor|api_ext)/i.test(text)) {
      tiers.external.push(n);
    } else {
      tiers.application.push(n);
    }
  });

  // Topology Classification
  let topology = "Distributed Microservices";
  const sourceLower = source.toLowerCase();
  if (sourceLower.includes("sequencediagram") || sourceLower.includes("->>")) {
    topology = "Synchronous Message Flow";
  } else if (sourceLower.includes("architecture-beta") || sourceLower.includes("service ")) {
    topology = "Cloud Infrastructure & VPC";
  } else if (sourceLower.includes("erdiagram") || sourceLower.includes("||--")) {
    topology = "Relational Data Model";
  } else if (sourceLower.includes("topic") || sourceLower.includes("kafka") || sourceLower.includes("stream")) {
    topology = "Event-Driven Streaming Architecture";
  } else if (tiers.presentation.length > 0 && tiers.application.length > 0 && tiers.persistence.length > 0) {
    topology = "Layered N-Tier Enterprise System";
  }

  // Calculate Health & Complexity Score (0 - 100)
  let healthScore = 95;
  if (bottlenecks.length > 0) healthScore -= bottlenecks.length * 8;
  if (nodes.length > 15 && edges.length > nodes.length * 2) healthScore -= 10;
  // Anti-pattern: Direct client to database access
  edges.forEach((e) => {
    const isClient = tiers.presentation.some((p) => p.id === e.from);
    const isDb = tiers.persistence.some((d) => d.id === e.to);
    if (isClient && isDb) {
      healthScore -= 15;
      bottlenecks.push({
        id: `${e.from}->${e.to}`,
        label: `${e.from} → ${e.to}`,
        severity: "Critical",
        reason: "Direct Client-to-Database bypass detected. Missing API Gateway or Authorization Layer.",
      });
    }
  });

  healthScore = Math.max(20, Math.min(100, healthScore));

  const recommendations = [];
  if (bottlenecks.length > 0) {
    recommendations.push("Decouple hotspots using asynchronous message queues or event topics.");
  }
  if (tiers.external.length > 0 && !sourceLower.includes("retry") && !sourceLower.includes("gateway")) {
    recommendations.push("Introduce Circuit Breaker and Resilient Retries on external service integrations.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Architecture satisfies balanced coupling and modular tier separation principles.");
  }

  return {
    topology,
    score: healthScore,
    complexity: nodes.length <= 5 ? "Low" : nodes.length <= 15 ? "Moderate" : "High",
    components: nodes,
    edges,
    bottlenecks,
    tiers,
    recommendations,
  };
}

/**
 * Generates technical architecture documentation in Markdown
 */
export function generateArchitectureDoc(source, format = "mermaid") {
  const analysis = analyzeArchitecture(source, format);

  return `# Technical Architecture Specification & Design Record

## 1. Executive Summary
- **Architecture Topology**: ${analysis.topology}
- **Structural Health Index**: ${analysis.score}/100 (${analysis.score >= 80 ? "Production Ready" : "Requires Attention"})
- **System Complexity**: ${analysis.complexity} (${analysis.components.length} components, ${analysis.edges.length} communication links)

## 2. Component Inventory & Tiers

### Presentation Tier (${analysis.tiers.presentation.length} components)
${analysis.tiers.presentation.map((c) => `- **${c.label}** (\`${c.id}\`)`).join("\n") || "- *None explicitly declared*"}

### Application & Processing Tier (${analysis.tiers.application.length} components)
${analysis.tiers.application.map((c) => `- **${c.label}** (\`${c.id}\`)`).join("\n") || "- *None explicitly declared*"}

### Data & Persistence Tier (${analysis.tiers.persistence.length} components)
${analysis.tiers.persistence.map((c) => `- **${c.label}** (\`${c.id}\`)`).join("\n") || "- *None explicitly declared*"}

### External Integrations (${analysis.tiers.external.length} components)
${analysis.tiers.external.map((c) => `- **${c.label}** (\`${c.id}\`)`).join("\n") || "- *None explicitly declared*"}

## 3. Coupling & Resilience Findings
${analysis.bottlenecks.length === 0 ? "✅ No critical bottlenecks or single points of failure detected." : analysis.bottlenecks.map((b) => `- **[${b.severity}] ${b.label}**: ${b.reason}`).join("\n")}

## 4. Architectural Recommendations
${analysis.recommendations.map((r) => `- ${r}`).join("\n")}

---
*Generated deterministically by NodeFlow AI Architecture Engine. Local-First & Zero-Telemetry.*
`;
}
