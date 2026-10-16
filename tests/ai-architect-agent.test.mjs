import test from "node:test";
import assert from "node:assert/strict";
import {
  analyzeArchitecture,
  generateArchitectureDoc,
} from "../src/utils/ai-architect-agent.js";

test("analyzeArchitecture handles empty or invalid source inputs", () => {
  const empty = analyzeArchitecture("");
  assert.equal(empty.topology, "Empty");
  assert.equal(empty.score, 100);
  assert.equal(empty.complexity, "Zero");
  assert.equal(empty.components.length, 0);

  const nullInput = analyzeArchitecture(null);
  assert.equal(nullInput.topology, "Empty");
});

test("analyzeArchitecture classifies layered N-Tier system and detects tiers", () => {
  const diagram = `flowchart TD
  Client[Web Client Application] --> Gateway[API Gateway Service]
  Gateway --> Svc[Order Microservice]
  Svc --> DB[(PostgreSQL Database)]
  Svc --> Ext[Stripe Payment API]`;

  const analysis = analyzeArchitecture(diagram);
  assert.ok(analysis.components.length >= 5);
  assert.ok(analysis.tiers.presentation.some((c) => c.id === "Client"));
  assert.ok(analysis.tiers.persistence.some((c) => c.id === "DB"));
  assert.ok(analysis.tiers.external.some((c) => c.id === "Ext"));
  assert.ok(analysis.score > 70);
});

test("analyzeArchitecture detects direct client-to-database bypass anti-pattern", () => {
  const insecure = `flowchart TD
  Client[Web Browser App] --> DB[(User PostgreSQL DB)]`;

  const analysis = analyzeArchitecture(insecure);
  assert.ok(analysis.bottlenecks.some((b) => b.reason.includes("Direct Client-to-Database bypass")));
  assert.ok(analysis.score < 90);
});

test("analyzeArchitecture detects component hotspots and bottlenecks", () => {
  const hotspot = `flowchart TD
  A --> Hub[Central Dispatcher]
  B --> Hub
  C --> Hub
  Hub --> D
  Hub --> E`;

  const analysis = analyzeArchitecture(hotspot);
  assert.ok(analysis.bottlenecks.some((b) => b.id === "Hub" && b.severity === "Critical"));
});

test("analyzeArchitecture detects sequence, streaming, and architecture topologies", () => {
  const seq = "sequenceDiagram\n  User->>API: Login";
  assert.equal(analyzeArchitecture(seq).topology, "Synchronous Message Flow");

  const arch = "architecture-beta\n  service web(server)[Web App]";
  assert.equal(analyzeArchitecture(arch).topology, "Cloud Infrastructure & VPC");

  const er = "erDiagram\n  USER ||--o{ ORDER : places";
  assert.equal(analyzeArchitecture(er).topology, "Relational Data Model");

  const stream = "flowchart LR\n  Kafka[Kafka Event Topic] --> Worker";
  assert.equal(analyzeArchitecture(stream).topology, "Event-Driven Streaming Architecture");
});

test("generateArchitectureDoc produces Markdown specification", () => {
  const diagram = `flowchart TD
  Client[Web Frontend] --> API[Node.js Backend]
  API --> DB[(Mongo Storage)]`;

  const doc = generateArchitectureDoc(diagram);
  assert.ok(doc.includes("# Technical Architecture Specification & Design Record"));
  assert.ok(doc.includes("Executive Summary"));
  assert.ok(doc.includes("Presentation Tier"));
  assert.ok(doc.includes("Data & Persistence Tier"));
});

test("analyzeArchitecture covers external resilience recommendations and balanced topologies", () => {
  // External service without retry or gateway
  const externalDiag = `flowchart TD
  Worker[Background Worker] --> StripeAPI[Stripe Third-Party Integration]`;
  const extAnalysis = analyzeArchitecture(externalDiag);
  assert.ok(extAnalysis.recommendations.some((r) => r.includes("Circuit Breaker")));

  // Perfectly balanced architecture
  const balanced = `flowchart TD
  A[Service Alpha] --> B[Service Beta]`;
  const balancedAnalysis = analyzeArchitecture(balanced);
  assert.ok(balancedAnalysis.recommendations.some((r) => r.includes("balanced coupling")));
  assert.equal(balancedAnalysis.complexity, "Low");

  // Moderate and High complexity topologies
  const highComplexityNodes = Array.from({ length: 18 }, (_, i) => `Node${i}[Service ${i}] --> Node${(i + 1) % 18}`).join("\n");
  const highDiag = `flowchart TD\n${highComplexityNodes}`;
  const highAnalysis = analyzeArchitecture(highDiag);
  assert.equal(highAnalysis.complexity, "High");

  // Fallback scanner on unstructured source
  const unstructured = "ServiceAlpha calls ServiceBeta and persists to ServiceGamma";
  const unstructAnalysis = analyzeArchitecture(unstructured);
  assert.ok(unstructAnalysis.components.length >= 3);
});

