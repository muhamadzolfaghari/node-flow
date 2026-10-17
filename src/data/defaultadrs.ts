export const DEFAULT_ADRS = [
  {
    id: "ADR-001",
    title: "Adopt Event-Driven Architecture with Apache Kafka",
    status: "Accepted",
    date: "2026-03-15",
    deciders: "Principal Architect, Lead Data Engineer",
    context:
      "Our core synchronous REST architecture suffers from cascading timeouts during peak traffic spikes. Microservices require resilient decoupling.",
    decision:
      "Adopt Apache Kafka as the enterprise event bus for all asynchronous inter-service domain events. Synchronous calls are reserved strictly for read-only queries.",
    consequences:
      "Eliminates blocking latency across payment and order services. Requires schema registry governance (Avro/Protobuf) and partition offset monitoring.",
    linkedNode: "kafka",
  },
  {
    id: "ADR-002",
    title: "PostgreSQL Multi-AZ Primary for Ledger Integrity",
    status: "Accepted",
    date: "2026-04-02",
    deciders: "Database Architect, Head of Security",
    context:
      "Financial transactions require strict ACID compliance and automated failover across availability zones.",
    decision:
      "Deploy AWS Aurora PostgreSQL Multi-AZ with synchronous replication and automated point-in-time recovery.",
    consequences:
      "Guarantees zero data loss (RPO=0) during single AZ outages. Increases monthly baseline infrastructure cost by ~$240/mo.",
    linkedNode: "rds",
  },
  {
    id: "ADR-003",
    title: "Stateless Token Authentication via Distributed Redis Cache",
    status: "Proposed",
    date: "2026-05-10",
    deciders: "Security Team, Backend Lead",
    context:
      "Session invalidation across multi-region clusters requires centralized revokable token store with sub-millisecond lookup.",
    decision:
      "Utilize Redis cluster with TLS in-transit and token TTL revocation lists.",
    consequences:
      "Sub-millisecond verification. Adds Redis cluster failover operational dependency.",
    linkedNode: "redis",
  },
];
// @ts-nocheck
