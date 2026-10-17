// Software Architecture templates.
// Combined registry and lookup live in src/components/templates.js.
export const TEMPLATES = [
  {
    id: "cloud-service-architecture",
    title: "Cloud Microservices & VPC (Architecture Diagram)",
    category: "Software Architecture",
    kind: "architecture",
    description: "Cloud microservice topology with VPC network boundaries, API gateway, authentication service, relational database, and distributed cache.",
    code: `architecture-beta
    group vpc(cloud)[Virtual Private Cloud]
    service client(internet)[Web Client]
    service gateway(server)[API Gateway] in vpc
    service auth(key)[Auth Service] in vpc
    service db(database)[Aurora DB] in vpc
    service cache(disk)[Redis Cluster] in vpc

    client:R -- L:gateway
    gateway:B -- T:auth
    gateway:R -- L:db
    auth:R -- L:cache
`,
  },
];
