/**
 * Deterministic Client-Side FinOps Cloud Pricing Heuristics
 * Provides estimated baseline monthly infrastructure costs for common cloud stencils
 * without requiring external network API calls (preserving zero-trust air-gapped privacy).
 */

const COST_EC2_T3_LARGE = 60.5;
const COST_LAMBDA_10M = 20.0;
const COST_MANAGED_K8S_CLUSTER = 73.0;
const COST_ECS_FARGATE = 48.0;
const COST_CLOUD_RUN_BUSY = 35.0;
const COST_AZURE_VM = 70.0;
const COST_AZURE_FUNCTIONS = 18.0;

const COST_RDS_MULTI_AZ = 240.0;
const COST_POSTGRES_MANAGED = 180.0;
const COST_MYSQL_MANAGED = 160.0;
const COST_DYNAMODB_ON_DEMAND = 45.0;
const COST_REDIS_CLUSTER = 110.0;
const COST_MONGODB_ATLAS = 195.0;
const COST_ELASTICSEARCH_CLUSTER = 280.0;
const COST_SNOWFLAKE_STANDARD = 350.0;

const COST_S3_TERABYTE = 23.0;
const COST_GCS_TERABYTE = 20.0;
const COST_AZURE_BLOB_TERABYTE = 20.8;

const COST_API_GATEWAY_10M = 35.0;
const COST_ALB_STANDARD = 22.5;
const COST_CLOUDFRONT_STANDARD = 25.0;
const COST_NAT_GATEWAY = 32.85;
const COST_CLOUDFLARE_BIZ = 20.0;
const COST_ENVOY_MESH = 30.0;

const COST_KAFKA_MSK = 320.0;
const COST_SQS_STANDARD = 12.0;
const COST_PUBSUB_STANDARD = 15.0;
const COST_RABBITMQ_MANAGED = 65.0;

const COST_PROMETHEUS_STACK = 45.0;
const COST_GRAFANA_ENTERPRISE = 29.0;
const COST_VAULT_CLUSTER = 120.0;

export const CLOUD_PRICING_CATALOG = {
  // Compute & Containers
  ec2: { name: "AWS EC2 (t3.large baseline)", cost: COST_EC2_T3_LARGE, unit: "/mo", category: "compute" },
  lambda: { name: "AWS Lambda (10M invocations)", cost: COST_LAMBDA_10M, unit: "/mo", category: "compute" },
  eks: { name: "AWS EKS Cluster Management", cost: COST_MANAGED_K8S_CLUSTER, unit: "/mo", category: "compute" },
  ecs: { name: "AWS ECS Fargate (2 vCPU / 4GB)", cost: COST_ECS_FARGATE, unit: "/mo", category: "compute" },
  gke: { name: "GCP GKE Cluster", cost: COST_MANAGED_K8S_CLUSTER, unit: "/mo", category: "compute" },
  cloudrun: { name: "GCP Cloud Run (High Traffic)", cost: COST_CLOUD_RUN_BUSY, unit: "/mo", category: "compute" },
  vm: { name: "Azure Virtual Machine (Standard_D2s_v5)", cost: COST_AZURE_VM, unit: "/mo", category: "compute" },
  functions: { name: "Azure Functions", cost: COST_AZURE_FUNCTIONS, unit: "/mo", category: "compute" },

  // Databases & Caches
  rds: { name: "AWS RDS PostgreSQL Multi-AZ", cost: COST_RDS_MULTI_AZ, unit: "/mo", category: "database" },
  postgres: { name: "Managed PostgreSQL Instance", cost: COST_POSTGRES_MANAGED, unit: "/mo", category: "database" },
  mysql: { name: "Managed MySQL Instance", cost: COST_MYSQL_MANAGED, unit: "/mo", category: "database" },
  dynamodb: { name: "AWS DynamoDB (On-Demand baseline)", cost: COST_DYNAMODB_ON_DEMAND, unit: "/mo", category: "database" },
  redis: { name: "AWS ElastiCache Redis Cluster", cost: COST_REDIS_CLUSTER, unit: "/mo", category: "database" },
  mongodb: { name: "MongoDB Atlas Dedicated Cluster", cost: COST_MONGODB_ATLAS, unit: "/mo", category: "database" },
  elasticsearch: { name: "OpenSearch / Elastic Cluster", cost: COST_ELASTICSEARCH_CLUSTER, unit: "/mo", category: "database" },
  snowflake: { name: "Snowflake Warehouse (Standard)", cost: COST_SNOWFLAKE_STANDARD, unit: "/mo", category: "database" },

  // Storage & Object Stores
  s3: { name: "AWS S3 Standard (1 TB baseline)", cost: COST_S3_TERABYTE, unit: "/mo", category: "storage" },
  gcs: { name: "Google Cloud Storage (1 TB)", cost: COST_GCS_TERABYTE, unit: "/mo", category: "storage" },
  blob: { name: "Azure Blob Storage (1 TB)", cost: COST_AZURE_BLOB_TERABYTE, unit: "/mo", category: "storage" },

  // Networking, Gateways & Edge
  apigateway: { name: "AWS API Gateway (10M requests)", cost: COST_API_GATEWAY_10M, unit: "/mo", category: "network" },
  alb: { name: "AWS Application Load Balancer", cost: COST_ALB_STANDARD, unit: "/mo", category: "network" },
  cloudfront: { name: "AWS CloudFront CDN", cost: COST_CLOUDFRONT_STANDARD, unit: "/mo", category: "network" },
  natgateway: { name: "AWS NAT Gateway (Standard)", cost: COST_NAT_GATEWAY, unit: "/mo", category: "network" },
  cloudflare: { name: "Cloudflare Business Tier", cost: COST_CLOUDFLARE_BIZ, unit: "/mo", category: "network" },
  envoy: { name: "Envoy Proxy / Mesh Gateway", cost: COST_ENVOY_MESH, unit: "/mo", category: "network" },

  // Queues & Event Streaming
  kafka: { name: "Apache Kafka / AWS MSK Cluster", cost: COST_KAFKA_MSK, unit: "/mo", category: "messaging" },
  sqs: { name: "AWS SQS (Standard Queues)", cost: COST_SQS_STANDARD, unit: "/mo", category: "messaging" },
  pubsub: { name: "Google Cloud Pub/Sub", cost: COST_PUBSUB_STANDARD, unit: "/mo", category: "messaging" },
  rabbitmq: { name: "CloudAMQP RabbitMQ Instance", cost: COST_RABBITMQ_MANAGED, unit: "/mo", category: "messaging" },

  // Observability & Security
  prometheus: { name: "Prometheus Monitoring Stack", cost: COST_PROMETHEUS_STACK, unit: "/mo", category: "observability" },
  grafana: { name: "Grafana Cloud Enterprise", cost: COST_GRAFANA_ENTERPRISE, unit: "/mo", category: "observability" },
  vault: { name: "HashiCorp Vault Cluster", cost: COST_VAULT_CLUSTER, unit: "/mo", category: "security" },
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
