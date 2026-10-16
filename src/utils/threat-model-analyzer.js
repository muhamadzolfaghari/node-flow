/**
 * Enterprise STRIDE Threat Model & Security Compliance Analyzer
 * 100% Client-Side Engine for Architecture Topology Auditing
 */
import { scanNodeDeclarations, flowchartEdges } from "../lib/visual-editing.js";

export const STRIDE_CATEGORIES = {
  S: { name: "Spoofing", title: "Spoofing Identity", desc: "Pretending to be something or someone other than the intended identity." },
  T: { name: "Tampering", title: "Tampering with Data", desc: "Modifying data on disk, in memory, in transit, or across trust boundaries." },
  R: { name: "Repudiation", title: "Repudiation", desc: "Claiming to have not performed an action without verifiable audit trails." },
  I: { name: "Information Disclosure", title: "Information Disclosure", desc: "Exposing private data or system secrets to unauthorized actors." },
  D: { name: "Denial of Service", title: "Denial of Service", desc: "Degrading or denying service to authorized users through overload or resource exhaustion." },
  E: { name: "Elevation of Privilege", title: "Elevation of Privilege", desc: "Gaining unauthorized capabilities or administrative access." },
};

/**
 * Analyze diagram topology and generate STRIDE risks & compliance score
 */
export function analyzeDiagramThreats(source = "") {
  if (!source || !source.trim()) {
    return {
      nodesCount: 0,
      edgesCount: 0,
      subgraphsCount: 0,
      findings: [],
      score: 100,
      summary: { critical: 0, high: 0, medium: 0, low: 0 },
    };
  }

  const declaredNodes = scanNodeDeclarations(source);
  const edges = flowchartEdges(source);

  // Discover all unique node IDs
  const nodeMap = new Map();
  for (const n of declaredNodes) {
    nodeMap.set(n.id, n.label || n.id);
  }
  for (const e of edges) {
    if (!nodeMap.has(e.from)) nodeMap.set(e.from, e.from);
    if (!nodeMap.has(e.to)) nodeMap.set(e.to, e.to);
  }

  const nodes = Array.from(nodeMap.keys());

  // Count subgraphs (trust boundaries)
  const subgraphsMatch = source.match(/subgraph\s+/gi);
  const subgraphsCount = subgraphsMatch ? subgraphsMatch.length : 0;

  const findings = [];

  const addFinding = (finding) => {
    const { categoryKey, target, severity, title, impact, mitigation } = finding;
    findings.push({
      id: `${categoryKey}-${target}-${findings.length}`,
      categoryKey,
      category: STRIDE_CATEGORIES[categoryKey],
      target,
      severity,
      title,
      impact,
      mitigation,
    });
  };

  // Helper to check text
  const isMatch = (id, pattern) => {
    const label = nodeMap.get(id) || id;
    return pattern.test(id) || pattern.test(label);
  };

  // Rule 1: Public Entrypoint & Spoofing
  const publicNodes = nodes.filter((n) => isMatch(n, /client|web|browser|mobile|user|frontend|public|internet/i));
  const gatewayNodes = nodes.filter((n) => isMatch(n, /gateway|api|ingress|proxy|alb|nlb|envoy|nginx/i));

  if (publicNodes.length > 0 && gatewayNodes.length === 0) {
    addFinding({
      categoryKey: "S",
      target: publicNodes[0],
      severity: "High",
      title: "Public Client Direct Access without API Gateway",
      impact: "Attackers can spoof client identities and bypass unified authentication / rate-limiting barriers.",
      mitigation: "Place an API Gateway or Ingress Controller enforcing mTLS, OAuth 2.1 PKCE, or OIDC tokens between public clients and services.",
    });
  } else if (gatewayNodes.length > 0) {
    addFinding({
      categoryKey: "S",
      target: gatewayNodes[0],
      severity: "Low",
      title: "Gateway Token Validation & Signature Verification",
      impact: "Compromised or expired JWT tokens might be accepted if cryptographic signatures and revocation lists are not checked.",
      mitigation: "Enforce strict RS256/ES256 asymmetric signature verification, check issuer/audience, and maintain short token lifespans (15 min).",
    });
  }

  // Rule 2: Database Direct Access & Information Disclosure
  const dbNodes = nodes.filter((n) => isMatch(n, /db|database|postgres|mysql|sql|mongo|redis|dynamo|s3|storage/i));
  for (const db of dbNodes) {
    const directPublicAccess = edges.some(
      (e) => (publicNodes.includes(e.from) || publicNodes.includes(e.to)) && (e.from === db || e.to === db)
    );
    if (directPublicAccess) {
      addFinding({
        categoryKey: "I",
        target: db,
        severity: "Critical",
        title: `Direct Public Access to Data Store (${db})`,
        impact: "Direct connection from public internet / client layers to database risks mass data exfiltration and credential stuffing.",
        mitigation: `Isolate ${db} within an isolated private VPC subnet with strict security groups allowing inbound traffic only from trusted backend services.`,
      });
    } else {
      addFinding({
        categoryKey: "I",
        target: db,
        severity: "Low",
        title: `Data-at-Rest & In-Transit Encryption for ${db}`,
        impact: "Unencrypted storage volumes or plaintext TLS database connections can expose customer PII to snooping.",
        mitigation: `Enable AES-256 transparent data encryption (TDE) at rest with customer-managed keys (KMS) and enforce TLS 1.3 for all database sessions.`,
      });
    }
  }

  // Rule 3: Message Queues & Repudiation
  const queueNodes = nodes.filter((n) => isMatch(n, /queue|kafka|rabbitmq|sqs|pubsub|event|stream/i));
  if (queueNodes.length > 0) {
    addFinding({
      categoryKey: "R",
      target: queueNodes[0],
      severity: "Low",
      title: "Event Sourcing Audit Trail & Non-Repudiation",
      impact: "Message tampering or unacknowledged message loss can prevent forensic audits in financial or healthcare compliance.",
      mitigation: "Store immutable event ledgers with cryptographic message signatures and configure dead-letter queues (DLQ) with alert monitoring.",
    });
  } else if (nodes.length > 6) {
    addFinding({
      categoryKey: "R",
      target: "Architecture Core",
      severity: "Low",
      title: "Centralized Audit Logging & Observability",
      impact: "Absence of distributed tracing makes detecting unauthorized access or identifying compromised sessions difficult.",
      mitigation: "Implement OpenTelemetry distributed tracing across all microservices with tamper-evident centralized log aggregation (SOC2 CC7.2).",
    });
  }

  // Rule 4: Denial of Service (DoS) on Ingress Points
  if (publicNodes.length > 0 && gatewayNodes.length === 0) {
    addFinding({
      categoryKey: "D",
      target: publicNodes[0],
      severity: "High",
      title: "Denial of Service (DoS) Vulnerability on Entrypoint",
      impact: "Layer 7 HTTP floods or volumetric SYN attacks can exhaust system memory, compute, and thread pools.",
      mitigation: "Deploy DDoS mitigation (AWS Shield / Cloudflare) and enforce sliding-window IP rate limiting (e.g. 100 req/min per IP).",
    });
  }

  // Rule 5: Tampering on In-Transit Connections
  const unencryptedEdges = edges.filter((e) => !/https|tls|grpc|secure|mTLS/i.test(e.label || ""));
  if (unencryptedEdges.length > 3) {
    addFinding({
      categoryKey: "T",
      target: "Service Mesh",
      severity: "Low",
      title: "Inter-Service Cleartext Communication",
      impact: "Internal network traffic between microservices without mutual authentication is susceptible to Man-In-The-Middle (MITM) attacks.",
      mitigation: "Implement a service mesh (Istio, Linkerd, or Envoy) with automatic mTLS encryption and SPIFFE/SPIRE workload identities.",
    });
  }

  // Rule 6: Elevation of Privilege
  const authNodes = nodes.filter((n) => isMatch(n, /auth|oauth|iam|vault|keycloak|cognito/i));
  if (authNodes.length === 0 && nodes.length > 4) {
    addFinding({
      categoryKey: "E",
      target: "Access Control",
      severity: "Medium",
      title: "Missing Centralized Identity & Authorization Layer",
      impact: "Services operating without centralized Role-Based Access Control (RBAC) risk horizontal or vertical privilege escalation.",
      mitigation: "Integrate an OAuth 2.1 / OIDC identity provider and enforce granular Attribute-Based Access Control (ABAC) on all administrative actions.",
    });
  } else if (authNodes.length > 0) {
    addFinding({
      categoryKey: "E",
      target: authNodes[0],
      severity: "Low",
      title: "Least-Privilege IAM & Scope Enforcement",
      impact: "Overly permissive API scopes may allow compromised sub-tokens to perform unauthorized modifications.",
      mitigation: "Adhere to the principle of least privilege: issue short-lived scopes specifically constrained to the required operation.",
    });
  }

  // Calculate compliance score
  const criticalCount = findings.filter((f) => f.severity === "Critical").length;
  const highCount = findings.filter((f) => f.severity === "High").length;
  const mediumCount = findings.filter((f) => f.severity === "Medium").length;
  const lowCount = findings.filter((f) => f.severity === "Low").length;

  let score = 100 - criticalCount * 30 - highCount * 15 - mediumCount * 5 - lowCount * 2;
  score = Math.max(35, Math.min(100, score));

  return {
    nodesCount: nodes.length,
    edgesCount: edges.length,
    subgraphsCount,
    findings,
    score,
    summary: {
      critical: criticalCount,
      high: highCount,
      medium: mediumCount,
      low: lowCount,
    },
  };
}
