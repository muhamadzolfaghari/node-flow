/**
 * Infrastructure-as-Code (IaC) Synthesis Engine
 * Automatically generates production-ready Terraform (main.tf), OpenTofu,
 * and Docker Compose (docker-compose.yml) configurations from architecture diagrams.
 */

import { scanNodeDeclarations } from "../lib/visualediting.ts";

function sanitizeIdentifier(id) {
  return (id || "resource")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48) || "resource";
}

function classifyNodeResource(id, label) {
  const text = `${id} ${label}`.toLowerCase();

  if (text.includes("postgres") || text.includes("postgresql")) {
    return { type: "rds_postgres", engine: "postgres", port: 5432, image: "postgres:16-alpine" };
  }
  if (text.includes("mysql")) {
    return { type: "rds_mysql", engine: "mysql", port: 3306, image: "mysql:8.0" };
  }
  if (text.includes("dynamodb") || text.includes("dynamo")) {
    return { type: "dynamodb", engine: "dynamodb", port: 8000, image: "amazon/dynamodb-local:latest" };
  }
  if (text.includes("redis") || text.includes("cache")) {
    return { type: "elasticache_redis", engine: "redis", port: 6379, image: "redis:7-alpine" };
  }
  if (text.includes("mongo") || text.includes("mongodb")) {
    return { type: "mongodb", engine: "mongodb", port: 27017, image: "mongo:7.0" };
  }
  if (text.includes("kafka")) {
    return { type: "msk_kafka", engine: "kafka", port: 9092, image: "confluentinc/cp-kafka:7.5.0" };
  }
  if (text.includes("rabbit") || text.includes("rabbitmq")) {
    return { type: "rabbitmq", engine: "rabbitmq", port: 5672, image: "rabbitmq:3-management-alpine" };
  }
  if (text.includes("sqs") || text.includes("queue")) {
    return { type: "sqs", engine: "sqs", port: 9324, image: "softwaremill/elasticmq:latest" };
  }
  if (text.includes("s3") || text.includes("bucket") || text.includes("storage")) {
    return { type: "s3_bucket", engine: "s3", port: 9000, image: "minio/minio:latest" };
  }
  if (text.includes("gateway") || text.includes("alb") || text.includes("ingress")) {
    return { type: "alb_ingress", engine: "alb", port: 80, image: "nginx:alpine" };
  }
  if (text.includes("eks") || text.includes("k8s") || text.includes("kubernetes")) {
    return { type: "eks_cluster", engine: "eks", port: 6443, image: null };
  }

  // Default microservice / web app
  return { type: "ecs_service", engine: "service", port: 8080, image: "node:20-alpine" };
}

/**
 * Generates AWS Terraform HCL Configuration
 */
export function generateTerraform(source = "", projectName = "core_platform") {
  const cleanProject = sanitizeIdentifier(projectName);
  const nodes = scanNodeDeclarations(source);

  let hcl = `# ==============================================================================
# Terraform AWS Architecture Specification
# Generated 100% locally by NodeFlow Architecture Studio
# ==============================================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "${cleanProject}"
      ManagedBy   = "Terraform"
      Generator   = "NodeFlow Studio"
    }
  }
}

variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "Primary deployment AWS region"
}

variable "environment" {
  type        = string
  default     = "production"
  description = "Deployment environment tier"
}

# ------------------------------------------------------------------------------
# Networking: Core VPC & Subnets
# ------------------------------------------------------------------------------
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${cleanProject}-vpc"
  }
}

resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "\${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "${cleanProject}-public-subnet-a"
  }
}

resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.10.0/24"
  availability_zone = "\${var.aws_region}a"

  tags = {
    Name = "${cleanProject}-private-subnet-a"
  }
}

# ------------------------------------------------------------------------------
# Architecture Components
# ------------------------------------------------------------------------------
`;

  for (const node of nodes) {
    const ident = sanitizeIdentifier(node.id);
    const classification = classifyNodeResource(node.id, node.label);

    if (classification.type === "rds_postgres" || classification.type === "rds_mysql") {
      hcl += `
# Database: ${node.label || node.id}
resource "aws_db_instance" "${ident}" {
  identifier           = "${cleanProject}-${ident}"
  allocated_storage    = 50
  max_allocated_storage = 500
  engine               = "${classification.engine}"
  engine_version       = "${classification.engine === "postgres" ? "16.1" : "8.0"}"
  instance_class       = "db.r6g.xlarge"
  multi_az             = true
  publicly_accessible  = false
  skip_final_snapshot  = false
  final_snapshot_identifier = "${cleanProject}-${ident}-final"

  vpc_security_group_ids = [aws_security_group.db_sg.id]
}
`;
    } else if (classification.type === "elasticache_redis") {
      hcl += `
# Cache Cluster: ${node.label || node.id}
resource "aws_elasticache_cluster" "${ident}" {
  cluster_id           = "${cleanProject}-${ident}"
  engine               = "redis"
  node_type            = "cache.r6g.large"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
}
`;
    } else if (classification.type === "s3_bucket") {
      hcl += `
# Object Storage: ${node.label || node.id}
resource "aws_s3_bucket" "${ident}" {
  bucket        = "${cleanProject}-${ident}-\${var.environment}"
  force_destroy = false
}

resource "aws_s3_bucket_server_side_encryption_configuration" "${ident}" {
  bucket = aws_s3_bucket.${ident}.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
`;
    } else if (classification.type === "sqs") {
      hcl += `
# Message Queue: ${node.label || node.id}
resource "aws_sqs_queue" "${ident}" {
  name                      = "${cleanProject}-${ident}"
  message_retention_seconds = 86400
  receive_wait_time_seconds = 20
}
`;
    } else if (classification.type === "alb_ingress") {
      hcl += `
# Ingress Load Balancer: ${node.label || node.id}
resource "aws_lb" "${ident}" {
  name               = "${cleanProject}-${ident}"
  internal           = false
  load_balancer_type = "application"
  subnets            = [aws_subnet.public_a.id]
}
`;
    } else {
      // Default Container Service (ECS Fargate)
      hcl += `
# Microservice: ${node.label || node.id}
resource "aws_ecs_task_definition" "${ident}" {
  family                   = "${cleanProject}-${ident}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "512"
  memory                   = "1024"

  container_definitions = jsonencode([
    {
      name      = "${ident}"
      image     = "public.ecr.aws/docker/library/node:20-alpine"
      essential = true
      portMappings = [
        {
          containerPort = ${classification.port}
          hostPort      = ${classification.port}
        }
      ]
    }
  ])
}
`;
    }
  }

  // Common security group
  hcl += `
resource "aws_security_group" "db_sg" {
  name        = "${cleanProject}-db-sg"
  description = "Allow inbound database traffic from application subnet"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [aws_subnet.private_a.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
`;

  return hcl;
}

/**
 * Generates Local Multi-Container Docker Compose specification
 */
export function generateDockerCompose(source = "", projectName = "core_platform") {
  const nodes = scanNodeDeclarations(source);
  let compose = `version: "3.8"

# ==============================================================================
# Docker Compose Local Stack
# Generated 100% locally by NodeFlow Architecture Studio
# Run: docker compose up -d
# ==============================================================================

services:
`;

  const volumes = new Set();

  for (const node of nodes) {
    const ident = sanitizeIdentifier(node.id);
    const classification = classifyNodeResource(node.id, node.label);

    if (classification.type === "rds_postgres") {
      volumes.add(`${ident}_data`);
      compose += `  ${ident}:
    image: ${classification.image}
    container_name: ${ident}
    restart: unless-stopped
    environment:
      POSTGRES_DB: app_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password123
    ports:
      - "${classification.port}:5432"
    volumes:
      - ${ident}_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

`;
    } else if (classification.type === "elasticache_redis") {
      volumes.add(`${ident}_data`);
      compose += `  ${ident}:
    image: ${classification.image}
    container_name: ${ident}
    restart: unless-stopped
    ports:
      - "${classification.port}:6379"
    volumes:
      - ${ident}_data:/data

`;
    } else if (classification.type === "msk_kafka") {
      compose += `  ${ident}:
    image: ${classification.image}
    container_name: ${ident}
    ports:
      - "${classification.port}:9092"
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT'
      KAFKA_ADVERTISED_LISTENERS: 'PLAINTEXT://${ident}:29092,PLAINTEXT_HOST://localhost:9092'
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

`;
    } else {
      // Default microservice
      compose += `  ${ident}:
    image: ${classification.image || "nginx:alpine"}
    container_name: ${ident}
    restart: unless-stopped
    ports:
      - "${classification.port}:${classification.port}"
    environment:
      NODE_ENV: development
      PORT: ${classification.port}

`;
    }
  }

  if (volumes.size > 0) {
    compose += `volumes:\n`;
    for (const v of volumes) {
      compose += `  ${v}:\n`;
    }
  }

  return compose;
}
