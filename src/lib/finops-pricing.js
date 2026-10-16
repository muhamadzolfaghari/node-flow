/**
 * Deterministic Client-Side FinOps Cloud Pricing Heuristics
 * Provides estimated baseline monthly infrastructure costs for common cloud stencils
 * without requiring external network API calls (preserving zero-trust air-gapped privacy).
 */

export const CLOUD_PRICING_CATALOG = {
  // Compute & Containers
  ec2: { name: "AWS EC2 (t3.large baseline)", cost: 60.50, unit: "/mo", category: "compute" },
  lambda: { name: "AWS Lambda (10M invocations)", cost: 20.00, unit: "/mo", category: "compute" },
  eks: { name: "AWS EKS Cluster Management", cost: 73.00, unit: "/mo", category: "compute" },
  ecs: { name: "AWS ECS Fargate (2 vCPU / 4GB)", cost: 48.00, unit: "/mo", category: "compute" },
  gke: { name: "GCP GKE Cluster", cost: 73.00, unit: "/mo", category: "compute" },
  cloudrun: { name: "GCP Cloud Run (High Traffic)", cost: 35.00, unit: "/mo", category: "compute" },
  vm: { name: "Azure Virtual Machine (Standard_D2s_v5)", cost: 70.00, unit: "/mo", category: "compute" },
  functions: { name: "Azure Functions", cost: 18.00, unit: "/mo", category: "compute" },

  // Databases & Caches
  rds: { name: "AWS RDS PostgreSQL Multi-AZ", cost: 240.00, unit: "/mo", category: "database" },
  postgres: { name: "Managed PostgreSQL Instance", cost: 180.00, unit: "/mo", category: "database" },
  mysql: { name: "Managed MySQL Instance", cost: 160.00, unit: "/mo", category: "database" },
  dynamodb: { name: "AWS DynamoDB (On-Demand baseline)", cost: 45.00, unit: "/mo", category: "database" },
  redis: { name: "AWS ElastiCache Redis Cluster", cost: 110.00, unit: "/mo", category: "database" },
  mongodb: { name: "MongoDB Atlas Dedicated Cluster", cost: 195.00, unit: "/mo", category: "database" },
  elasticsearch: { name: "OpenSearch / Elastic Cluster", cost: 280.00, unit: "/mo", category: "database" },
  snowflake: { name: "Snowflake Warehouse (Standard)", cost: 350.00, unit: "/mo", category: "database" },

  // Storage & Object Stores
  s3: { name: "AWS S3 Standard (1 TB baseline)", cost: 23.00, unit: "/mo", category: "storage" },
  gcs: { name: "Google Cloud Storage (1 TB)", cost: 20.00, unit: "/mo", category: "storage" },
  blob: { name: "Azure Blob Storage (1 TB)", cost: 20.80, unit: "/mo", category: "storage" },

  // Networking, Gateways & Edge
  apigateway: { name: "AWS API Gateway (10M requests)", cost: 35.00, unit: "/mo", category: "network" },
  alb: { name: "AWS Application Load Balancer", cost: 22.50, unit: "/mo", category: "network" },
  cloudfront: { name: "AWS CloudFront CDN", cost: 25.00, unit: "/mo", category: "network" },
  natgateway: { name: "AWS NAT Gateway (Standard)", cost: 32.85, unit: "/mo", category: "network" },
  cloudflare: { name: "Cloudflare Business Tier", cost: 20.00, unit: "/mo", category: "network" },
  envoy: { name: "Envoy Proxy / Mesh Gateway", cost: 30.00, unit: "/mo", category: "network" },

  // Queues & Event Streaming
  kafka: { name: "Apache Kafka / AWS MSK Cluster", cost: 320.00, unit: "/mo", category: "messaging" },
  sqs: { name: "AWS SQS (Standard Queues)", cost: 12.00, unit: "/mo", category: "messaging" },
  pubsub: { name: "Google Cloud Pub/Sub", cost: 15.00, unit: "/mo", category: "messaging" },
  rabbitmq: { name: "CloudAMQP RabbitMQ Instance", cost: 65.00, unit: "/mo", category: "messaging" },

  // Observability & Security
  prometheus: { name: "Prometheus Monitoring Stack", cost: 45.00, unit: "/mo", category: "observability" },
  grafana: { name: "Grafana Cloud Enterprise", cost: 29.00, unit: "/mo", category: "observability" },
  vault: { name: "HashiCorp Vault Cluster", cost: 120.00, unit: "/mo", category: "security" },
};

/**
 * Matches a diagram node id or label to cloud pricing catalog
 */
export function matchNodePricing(nodeId, label = "") {
  const text = `${nodeId} ${label}`.toLowerCase();

  for (const [key, item] of Object.entries(CLOUD_PRICING_CATALOG)) {
    if (text.includes(key)) {
      return item;
    }
  }

  // Common synonyms
  if (text.includes("database") || text.includes("db")) return CLOUD_PRICING_CATALOG.postgres;
  if (text.includes("queue")) return CLOUD_PRICING_CATALOG.sqs;
  if (text.includes("cache")) return CLOUD_PRICING_CATALOG.redis;
  if (text.includes("gateway")) return CLOUD_PRICING_CATALOG.apigateway;
  if (text.includes("storage") || text.includes("bucket")) return CLOUD_PRICING_CATALOG.s3;
  if (text.includes("service") || text.includes("api") || text.includes("server")) {
    return CLOUD_PRICING_CATALOG.ecs;
  }

  return null;
}

/**
 * Calculates aggregate monthly architecture cost estimate from node collection
 */
export function calculateArchitectureCost(nodes = []) {
  let totalMonthly = 0;
  const breakdown = [];
  const categorized = { compute: 0, database: 0, storage: 0, network: 0, messaging: 0, observability: 0, security: 0 };

  for (const node of nodes) {
    const pricing = matchNodePricing(node.id, node.label);
    if (pricing) {
      totalMonthly += pricing.cost;
      categorized[pricing.category] = (categorized[pricing.category] || 0) + pricing.cost;
      breakdown.push({
        nodeId: node.id,
        nodeLabel: node.label || node.id,
        serviceName: pricing.name,
        cost: pricing.cost,
        category: pricing.category,
      });
    }
  }

  return {
    totalMonthly: Math.round(totalMonthly * 100) / 100,
    breakdown,
    categorized,
  };
}
