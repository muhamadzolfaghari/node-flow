import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateArchitectureCost,
  matchNodePricing,
  CLOUD_PRICING_CATALOG,
} from "../src/lib/finops-pricing.js";
import { generateBackstageCatalog } from "../src/utils/backstage-exporter.js";

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
