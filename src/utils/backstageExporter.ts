/**
 * Spotify Backstage Software Catalog Generator
 * Converts Mermaid, C4, Architecture, and Flowchart topologies
 * into standard Spotify Backstage `catalog-info.yaml` enterprise specifications.
 */

import { scanNodeDeclarations } from "../lib/visualEditing.ts";

function sanitizeEntityName(str) {
  return (str || "entity")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63) || "entity";
}

function classifyBackstageType(name, label) {
  const text = `${name} ${label}`.toLowerCase();
  if (text.includes("database") || text.includes("db") || text.includes("postgres") || text.includes("mysql") || text.includes("redis") || text.includes("s3") || text.includes("bucket")) {
    return { kind: "Resource", type: "database" };
  }
  if (text.includes("queue") || text.includes("kafka") || text.includes("sqs") || text.includes("pubsub") || text.includes("rabbitmq")) {
    return { kind: "Resource", type: "queue" };
  }
  if (text.includes("gateway") || text.includes("api") || text.includes("ingress")) {
    return { kind: "API", type: "openapi" };
  }
  return { kind: "Component", type: "service" };
}

/**
 * Generates valid multi-document Backstage catalog-info.yaml
 */
export function generateBackstageCatalog(source = "", systemName = "CoreSystem") {
  const cleanSystem = sanitizeEntityName(systemName);
  const nodes = scanNodeDeclarations(source);

  // Extract edges (A --> B)
  const edgeRegex = /([a-zA-Z0-9_-]+)\s*(?:-->|-.->|==>|-->>|->>|--)\s*(?:\|[^|\n]*\|\s*)?([a-zA-Z0-9_-]+)/g;
  const dependencies = new Map(); // target -> list of sources

  let match;
  while ((match = edgeRegex.exec(source)) !== null) {
    const from = sanitizeEntityName(match[1]);
    const to = sanitizeEntityName(match[2]);
    if (from && to && from !== to) {
      if (!dependencies.has(from)) dependencies.set(from, new Set());
      dependencies.get(from).add(to);
    }
  }

  const documents = [];

  // 1. System Descriptor
  documents.push(`apiVersion: backstage.io/v1alpha1
kind: System
metadata:
  name: ${cleanSystem}
  description: Architecture topology exported from NodeFlow Studio
  tags:
    - architecture
    - nodeflow
    - cloud
spec:
  owner: architecture-council
  domain: core`);

  // 2. Individual Components & Resources
  for (const node of nodes) {
    const name = sanitizeEntityName(node.id);
    const label = node.label || node.id;
    const { kind, type } = classifyBackstageType(name, label);
    const deps = dependencies.has(name) ? Array.from(dependencies.get(name)) : [];

    let doc = `---
apiVersion: backstage.io/v1alpha1
kind: ${kind}
metadata:
  name: ${name}
  title: "${label.replace(/"/g, '\\"')}"
  description: "${label.replace(/"/g, '\\"')} service node"
  tags:
    - ${type}
    - generated
spec:
  type: ${type}
  lifecycle: production
  owner: platform-engineering
  system: ${cleanSystem}`;

    if (deps.length > 0) {
      doc += `\n  dependsOn:\n` + deps.map((d) => `    - component:default/${d}`).join("\n");
    }

    documents.push(doc);
  }

  return documents.join("\n\n");
}
