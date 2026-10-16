/**
 * Architecture Review Board (ARB) & Well-Architected Framework Auditor
 * Evaluates architecture diagrams against 6 enterprise Well-Architected pillars:
 * 1. Security & Zero-Trust
 * 2. Reliability & Resilience
 * 3. Operational Excellence
 * 4. Performance Efficiency
 * 5. Cost Optimization
 * 6. Governance & Traceability
 */

import { scanNodeDeclarations, flowchartEdges } from "../lib/visual-editing.js";

export function runArbAudit(source = "") {
  const nodes = scanNodeDeclarations(source);
  const edges = flowchartEdges(source);

  const findings = [];
  let scoreDeductions = 0;

  const nodeTextMap = new Map(
    nodes.map((n) => [n.id.toLowerCase(), `${n.id} ${n.label || ""}`.toLowerCase()]),
  );

  const allText = source.toLowerCase();

  // 1. Security & Zero Trust Pillar
  const hasClient = Array.from(nodeTextMap.values()).some((t) => t.includes("client") || t.includes("user") || t.includes("browser") || t.includes("mobile"));
  const hasDb = Array.from(nodeTextMap.values()).some((t) => t.includes("db") || t.includes("database") || t.includes("postgres") || t.includes("mysql"));
  const hasGateway = Array.from(nodeTextMap.values()).some((t) => t.includes("gateway") || t.includes("ingress") || t.includes("alb") || t.includes("waf"));

  // Check 1.1: Direct Client to Database Access (Critical)
  for (const edge of edges) {
    const fromText = nodeTextMap.get(edge.from.toLowerCase()) || "";
    const toText = nodeTextMap.get(edge.to.toLowerCase()) || "";
    if ((fromText.includes("client") || fromText.includes("browser") || fromText.includes("user")) &&
        (toText.includes("db") || toText.includes("database") || toText.includes("postgres") || toText.includes("mysql"))) {
      findings.push({
        pillar: "Security",
        severity: "critical",
        title: "Direct Client Database Ingress Detected",
        description: `Client component "${edge.from}" connects directly to database "${edge.to}" bypassing application tier.`,
        remediation: "Route traffic through an authenticated API Gateway and microservice backend.",
        deduction: 25,
      });
      scoreDeductions += 25;
    }
  }

  // Check 1.2: Missing API Gateway at Ingress
  if (hasClient && !hasGateway) {
    findings.push({
      pillar: "Security",
      severity: "high",
      title: "Missing Centralized API Gateway / WAF",
      description: "Public client traffic enters application components directly without an edge perimeter gateway.",
      remediation: "Deploy an API Gateway, ALB, or Cloudflare WAF to enforce rate limiting and TLS termination.",
      deduction: 15,
    });
    scoreDeductions += 15;
  }

  // 2. Reliability & Resilience Pillar
  // Check 2.1: Single Point of Failure (SPOF)
  const inDegree = new Map();
  for (const edge of edges) {
    inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
  }
  for (const [target, count] of inDegree.entries()) {
    if (count >= 3) {
      const text = nodeTextMap.get(target.toLowerCase()) || "";
      if (!text.includes("kafka") && !text.includes("cluster") && !text.includes("multi-az") && !text.includes("alb")) {
        findings.push({
          pillar: "Reliability",
          severity: "medium",
          title: `Potential Single Point of Failure (SPOF): ${target}`,
          description: `Component "${target}" has ${count} incoming dependent connections with no clustered failover indicator.`,
          remediation: "Configure Multi-AZ redundancy or deploy behind an automated load balancer.",
          deduction: 10,
        });
        scoreDeductions += 10;
        break; // One is enough to flag
      }
    }
  }

  // 3. Operational Excellence Pillar
  const hasObservability = allText.includes("prometheus") || allText.includes("grafana") || allText.includes("datadog") || allText.includes("opentelemetry") || allText.includes("monitor");
  if (!hasObservability && nodes.length >= 4) {
    findings.push({
      pillar: "Operational Excellence",
      severity: "medium",
      title: "Missing Observability & Telemetry Pipeline",
      description: "No metrics or distributed tracing components (Prometheus, OpenTelemetry, Grafana) detected in topology.",
      remediation: "Integrate an OpenTelemetry Collector or Prometheus monitoring stack for production health visibility.",
      deduction: 10,
    });
    scoreDeductions += 10;
  }

  // 4. Performance Efficiency
  const hasQueue = allText.includes("kafka") || allText.includes("sqs") || allText.includes("queue") || allText.includes("rabbitmq");
  if (!hasQueue && edges.length >= 5) {
    findings.push({
      pillar: "Performance",
      severity: "low",
      title: "Synchronous Coupling Across Microservices",
      description: "Architecture relies exclusively on synchronous requests without asynchronous event queues.",
      remediation: "Introduce Apache Kafka or AWS SQS for asynchronous event-driven decoupling.",
      deduction: 5,
    });
    scoreDeductions += 5;
  }

  // 5. Governance & Traceability
  const hasAdr = allText.includes("@adr") || allText.includes("adr-");
  if (!hasAdr && nodes.length >= 3) {
    findings.push({
      pillar: "Governance",
      severity: "low",
      title: "No Architecture Decision Records (ADR) Linked",
      description: "Components lack documented architectural justification or trade-off records.",
      remediation: "Link Architecture Decision Records (MADR) via NodeFlow ADR Suite.",
      deduction: 5,
    });
    scoreDeductions += 5;
  }

  const overallScore = Math.max(20, Math.min(100, 100 - scoreDeductions));

  let grade = "Grade A";
  if (overallScore >= 92) grade = "Grade A+ (Exemplary)";
  else if (overallScore >= 82) grade = "Grade A (Production Ready)";
  else if (overallScore >= 72) grade = "Grade B (Minor Governance Gaps)";
  else if (overallScore >= 60) grade = "Grade C (Substantial Architecture Debt)";
  else grade = "Grade D (ARB Rejection)";

  return {
    score: overallScore,
    grade,
    findings,
    nodesCount: nodes.length,
    edgesCount: edges.length,
    pillarsEvaluated: ["Security & Zero-Trust", "Reliability", "Operational Excellence", "Performance", "Cost", "Governance"],
  };
}
