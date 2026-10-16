import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateArchitectureCost,
  matchNodePricing,
  CLOUD_PRICING_CATALOG,
} from "../src/lib/finops-pricing.js";
import { generateBackstageCatalog } from "../src/utils/backstage-exporter.js";
import { generateTerraform, generateDockerCompose } from "../src/utils/iac-synthesizer.js";
import { runArbAudit } from "../src/utils/arb-auditor.js";

test("FinOps: matchNodePricing recognizes cloud compute, database, and storage", () => {
  const eksPrice = matchNodePricing("eks_cluster", "Production EKS");
  assert.ok(eksPrice);
  assert.equal(eksPrice.cost, 73.0);
  assert.equal(eksPrice.category, "compute");

  const rdsPrice = matchNodePricing("primary_db", "AWS RDS PostgreSQL");
  assert.ok(rdsPrice);
  assert.equal(rdsPrice.category, "database");

  const s3Price = matchNodePricing("assets_bucket", "S3 Storage");
  assert.ok(s3Price);
  assert.equal(s3Price.category, "storage");

  const unknown = matchNodePricing("generic_box", "Random Node");
  assert.equal(unknown, null);
});

test("FinOps: calculateArchitectureCost aggregates totals and categorizes items", () => {
  const sampleNodes = [
    { id: "eks", label: "AWS EKS Cluster" },
    { id: "rds", label: "PostgreSQL Database" },
    { id: "kafka", label: "Event Bus Kafka" },
    { id: "s3", label: "Static Bucket" },
  ];

  const result = calculateArchitectureCost(sampleNodes);
  assert.ok(result.totalMonthly > 500);
  assert.equal(result.breakdown.length, 4);
  assert.ok(result.categorized.compute > 0);
  assert.ok(result.categorized.database > 0);
  assert.ok(result.categorized.messaging > 0);
  assert.ok(result.categorized.storage > 0);
});

test("Backstage Generator: produces valid catalog-info.yaml with components and dependencies", () => {
  const sampleMermaid = `flowchart TD
    client["Web App"] --> gateway["API Gateway"]
    gateway --> auth["Auth Service"]
    gateway --> orders["Order Service"]
    orders --> orderDb[("PostgreSQL DB")]
    orders --> eventBus["Kafka Queue"]
  `;

  const yaml = generateBackstageCatalog(sampleMermaid, "OrderPlatform");
  assert.ok(yaml.includes("apiVersion: backstage.io/v1alpha1"));
  assert.ok(yaml.includes("kind: System"));
  assert.ok(yaml.includes("name: orderplatform"));
  assert.ok(yaml.includes("kind: Component"));
  assert.ok(yaml.includes("kind: Resource"));
  assert.ok(yaml.includes("dependsOn:"));
  assert.ok(yaml.includes("component:default/"));
});

test("IaC Synthesizer: generates compliant AWS Terraform and Docker Compose", () => {
  const sampleMermaid = `flowchart TD
    gateway["API Gateway"] --> auth["Auth Service"]
    auth --> sessionCache["Redis Cache"]
    auth --> userDb[("PostgreSQL Database")]
    auth --> storage["S3 Bucket"]
  `;

  const tf = generateTerraform(sampleMermaid, "auth_system");
  assert.ok(tf.includes("terraform {"));
  assert.ok(tf.includes("resource \"aws_vpc\" \"main\""));
  assert.ok(tf.includes("resource \"aws_db_instance\""));
  assert.ok(tf.includes("resource \"aws_elasticache_cluster\""));
  assert.ok(tf.includes("resource \"aws_s3_bucket\""));

  const compose = generateDockerCompose(sampleMermaid, "auth_system");
  assert.ok(compose.includes("version: \"3.8\""));
  assert.ok(compose.includes("services:"));
  assert.ok(compose.includes("image: postgres:16-alpine"));
  assert.ok(compose.includes("image: redis:7-alpine"));
  assert.ok(compose.includes("volumes:"));
});

test("ARB Auditor: evaluates architecture against Well-Architected governance pillars", () => {
  const badTopology = `flowchart TD
    client["Public Web Client"] --> db[("Production PostgreSQL DB")]
  `;
  const badAudit = runArbAudit(badTopology);
  assert.ok(badAudit.score < 90);
  assert.ok(badAudit.findings.some((f) => f.title.includes("Direct Client Database Ingress")));

  const goodTopology = `flowchart TD
    client["Public Web Client"] --> gateway["Cloudflare WAF / API Gateway"]
    gateway --> auth["Auth Service"]
    auth --> db[("Aurora PostgreSQL Multi-AZ")]
    auth --> prometheus["Prometheus Metrics"]
    auth --> queue["Kafka Event Bus"]
  `;
  const goodAudit = runArbAudit(goodTopology);
  assert.ok(goodAudit.score >= 80);
  assert.ok(goodAudit.grade.includes("Grade A"));
});

