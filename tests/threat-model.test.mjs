import test from "node:test";
import assert from "node:assert/strict";
import { analyzeDiagramThreats } from "../src/utils/threat-model-analyzer.js";

test("STRIDE: detects direct database access from public client as Critical risk", () => {
  const source = `
flowchart LR
  Client[Public Web Client] --> DB[(User Database)]
`;
  const result = analyzeDiagramThreats(source);
  assert.equal(result.nodesCount, 2);
  const critical = result.findings.find((f) => f.severity === "Critical");
  assert.ok(critical, "Should find critical risk");
  assert.equal(critical.categoryKey, "I");
  assert.match(critical.title, /Direct Public Access to Data Store/);
  assert.ok(result.score < 80, "Score should be penalised for critical risk");
});

test("STRIDE: detects missing API gateway when public client connects to backend services", () => {
  const source = `
flowchart TD
  User[Public Mobile App] --> OrderService[Order Microservice]
  OrderService --> PaymentService[Payment Processor]
`;
  const result = analyzeDiagramThreats(source);
  const spoofing = result.findings.find((f) => f.categoryKey === "S");
  assert.ok(spoofing, "Should detect spoofing risk for direct service access");
  assert.match(spoofing.title, /Direct Access without API Gateway/);
});

test("STRIDE: evaluates well-architected secure topology with high compliance score", () => {
  const source = `
flowchart LR
  subgraph Public_Internet [Public Zone]
    Browser[Web Browser]
  end
  subgraph DMZ [Ingress DMZ]
    Gateway[API Gateway / Ingress]
    Auth[OAuth2 / OIDC Auth0]
  end
  subgraph Private_VPC [Secure Private VPC]
    Orders[Order Service]
    Queue[Kafka Event Queue]
    DB[(PostgreSQL Database)]
  end
  Browser -->|HTTPS TLS 1.3| Gateway
  Gateway -->|mTLS| Auth
  Gateway -->|mTLS| Orders
  Orders -->|mTLS| Queue
  Orders -->|TLS| DB
`;
  const result = analyzeDiagramThreats(source);
  assert.ok(result.nodesCount >= 5);
  assert.ok(result.subgraphsCount >= 3);
  // No critical risks
  const critical = result.findings.filter((f) => f.severity === "Critical");
  assert.equal(critical.length, 0);
  assert.ok(result.score >= 80, `Expected score >= 80, got ${result.score}`);
});

test("STRIDE: handles empty or trivial diagram gracefully", () => {
  const result = analyzeDiagramThreats("");
  assert.equal(result.nodesCount, 0);
  assert.equal(result.edgesCount, 0);
  assert.equal(result.score, 100);
});

test("STRIDE: detects cleartext inter-service edges and missing audit logging in large topologies", () => {
  const source = `
flowchart TD
  SvcA[Service A] --> SvcB[Service B]
  SvcB --> SvcC[Service C]
  SvcC --> SvcD[Service D]
  SvcD --> SvcE[Service E]
  SvcE --> SvcF[Service F]
  SvcF --> SvcG[Service G]
  SvcG --> SvcH[Service H]
`;
  const result = analyzeDiagramThreats(source);
  assert.ok(result.nodesCount >= 7);
  // Repudiation finding for absence of central logging
  assert.ok(result.findings.some((f) => f.categoryKey === "R"));
  // Tampering finding for cleartext inter-service traffic
  assert.ok(result.findings.some((f) => f.categoryKey === "T"));
  // Elevation of privilege finding
  assert.ok(result.findings.some((f) => f.categoryKey === "E"));
});

