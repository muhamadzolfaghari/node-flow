/**
 * Enterprise IndexedDB Storage & Showcase Engine
 * Provides resilient, unlimited client-side storage for:
 * 1. Enterprise Architecture Showcases (AWS, K8s, FinTech, C4, Event-Driven)
 * 2. Cloud Stencil Library (AWS, GCP, Azure, Kubernetes, CNCF, Databases)
 * 3. Large Workspace Backups (bypassing 5MB localStorage quotas)
 * 4. GitHub Sync cache
 */

const DB_NAME = "nodeflow_enterprise_db";
const DB_VERSION = 1;

export const SHOWCASE_CATALOG = [
  {
    id: "aws-serverless-fintech",
    title: "AWS Multi-Region Serverless Banking",
    category: "Cloud Architecture",
    tags: ["AWS", "Serverless", "FinTech", "PCI-DSS"],
    description: "Multi-region active-active payment processing system with Amazon API Gateway, AWS Lambda, DynamoDB Global Tables, and EventBridge.",
    format: "mermaid",
    source: `architecture-beta
    group vpc_us(cloud)[AWS US-East VPC]
    group vpc_eu(cloud)[AWS EU-West VPC]

    service apigw_us(internet)[API Gateway US] in vpc_us
    service lambda_auth_us(server)[Auth Lambda] in vpc_us
    service lambda_pay_us(server)[Payment Lambda] in vpc_us
    service ddb_us(database)[DynamoDB Global Table] in vpc_us

    service apigw_eu(internet)[API Gateway EU] in vpc_eu
    service lambda_auth_eu(server)[Auth Lambda] in vpc_eu
    service lambda_pay_eu(server)[Payment Lambda] in vpc_eu
    service ddb_eu(database)[DynamoDB Global Table] in vpc_eu

    apigw_us:R -- L:lambda_auth_us
    lambda_auth_us:B -- T:lambda_pay_us
    lambda_pay_us:R -- L:ddb_us

    apigw_eu:R -- L:lambda_auth_eu
    lambda_auth_eu:B -- T:lambda_pay_eu
    lambda_pay_eu:R -- L:ddb_eu

    ddb_us:B -- T:ddb_eu
`,
  },
  {
    id: "k8s-istio-mesh",
    title: "Kubernetes & Istio Service Mesh",
    category: "DevOps & Infrastructure",
    tags: ["Kubernetes", "Istio", "Envoy", "Microservices"],
    description: "Zero-trust service mesh with Envoy sidecar proxies, mTLS encryption, Prometheus observability, and distributed ingress routing.",
    format: "mermaid",
    source: `flowchart TD
    Client([Internet Users]) --> Ingress[Istio Ingress Gateway]

    subgraph Cluster ["☸️ Kubernetes Production Cluster (EKS)"]
        subgraph Mesh ["🔒 Istio Service Mesh (mTLS Enforced)"]
            subgraph Edge ["Frontend Namespace"]
                Proxy1[Envoy Sidecar] --- WebApp["Frontend WebApp (Next.js)"]
            end

            subgraph Core ["Core Microservices Namespace"]
                Proxy2[Envoy Sidecar] --- OrderSvc["Order Service (Go)"]
                Proxy3[Envoy Sidecar] --- UserSvc["User Service (Node.js)"]
                Proxy4[Envoy Sidecar] --- PaymentSvc["Payment Gateway (Rust)"]
            end
        end

        subgraph Data ["Data & Storage Layer"]
            DB[(PostgreSQL Aurora)]
            Cache[(Redis Cluster)]
            Queue>Apache Kafka]
        end
    end

    Ingress --> Proxy1
    Proxy1 --> Proxy2
    Proxy1 --> Proxy3
    Proxy2 --> Proxy4
    Proxy2 --> DB
    Proxy2 --> Cache
    Proxy4 --> Queue

    classDef mesh fill:#0f172a,stroke:#06b6d4,stroke-width:2px,color:#f8fafc;
    classDef svc fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#e0e7ff;
    classDef data fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#ecfdf5;

    class Proxy1,Proxy2,Proxy3,Proxy4 mesh;
    class WebApp,OrderSvc,UserSvc,PaymentSvc svc;
    class DB,Cache,Queue data;
`,
  },
  {
    id: "c4-enterprise-banking",
    title: "C4 Banking System (Context & Containers)",
    category: "Software Architecture",
    tags: ["C4 Model", "Context", "Banking", "Security"],
    description: "Hierarchical C4 model diagram detailing retail banking system boundary, single-page application, mobile client, and core mainframe.",
    format: "mermaid",
    source: `C4Context
    title Banking System - System Context Diagram (Level 1)
    
    Person(customer, "Personal Banking Customer", "A customer of the bank with personal bank accounts.")
    System(banking_system, "Internet Banking System", "Allows customers to view account info, balance, and make payments.")
    
    System_Ext(mail_system, "E-mail System", "The internal Microsoft Exchange e-mail system.")
    System_Ext(mainframe, "Mainframe Banking System", "Stores all core banking information: accounts, transactions, and ledger.")
    
    Rel(customer, banking_system, "Uses", "HTTPS / OAuth2")
    Rel(banking_system, mail_system, "Sends e-mails using", "SMTP")
    Rel(banking_system, mainframe, "Queries account data using", "gRPC / mTLS")
    Rel(mail_system, customer, "Delivers transactional notifications to", "POP3/IMAP")
`,
  },
  {
    id: "event-driven-kafka",
    title: "Global Event-Driven Streaming Data Lake",
    category: "Data Engineering",
    tags: ["Kafka", "CDC", "Debezium", "Flink", "Snowflake"],
    description: "Real-time change data capture (CDC) pipeline transforming transactional OLTP events into streaming analytics lake.",
    format: "mermaid",
    source: `flowchart LR
    subgraph Sources ["Transactional Sources (OLTP)"]
        PG[(PostgreSQL Users)] -->|CDC| Deb1[Debezium Connector]
        Mongo[(MongoDB Orders)] -->|CDC| Deb2[Debezium Connector]
    end

    subgraph Streaming ["Real-Time Event Hub"]
        Deb1 --> Topic1{{topic.users.v1}}
        Deb2 --> Topic2{{topic.orders.v1}}
        Topic1 & Topic2 --> Flink[Apache Flink Stream Processor]
        Flink --> EnrichTopic{{topic.enriched-orders.v1}}
    end

    subgraph Consumers ["Analytics & Operational Consumers"]
        EnrichTopic --> Sink1[Snowflake Data Lakehouse]
        EnrichTopic --> Sink2[Elasticsearch Search Index]
        EnrichTopic --> Sink3[Fraud Detection Realtime AI]
    end

    classDef stream fill:#3b0764,stroke:#c084fc,stroke-width:2px,color:#fdf4ff;
    classDef storage fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#f0fdf4;
    class Topic1,Topic2,EnrichTopic,Flink stream;
    class PG,Mongo,Sink1,Sink2 storage;
`,
  },
  {
    id: "zero-trust-identity",
    title: "Zero-Trust Identity & API Security",
    category: "Cybersecurity",
    tags: ["OAuth2", "PKCE", "Keycloak", "Vault", "WAF"],
    description: "End-to-end zero-trust architecture verifying client requests with cryptographic JWT claims and dynamic secrets.",
    format: "mermaid",
    source: `sequenceDiagram
    autonumber
    actor User as 👤 Developer
    participant Client as 💻 Single Page App
    participant IdP as 🛡️ Keycloak (IdP)
    participant WAF as 🧱 Cloudflare WAF
    participant Gateway as 🚪 Envoy API Gateway
    participant Vault as 🔐 HashiCorp Vault
    participant Svc as ⚙️ Microservice

    User->>Client: Click Login
    Client->>IdP: Authorization Code + PKCE Challenge
    IdP-->>User: Present MFA Prompt
    User->>IdP: Provide TOTP Token
    IdP-->>Client: Issue ID Token & Signed JWT Access Token
    
    User->>Client: Execute API Action
    Client->>WAF: HTTPS Request + Bearer JWT
    WAF->>Gateway: Layer-7 Inspected Traffic
    Gateway->>Vault: Verify Dynamic Token & mTLS Cert
    Vault-->>Gateway: Claims Validated
    Gateway->>Svc: Forward Sanitized Request + X-User-Identity
    Svc-->>Gateway: HTTP 200 OK Response
    Gateway-->>Client: Payload Rendered
`,
  },
];

export const CLOUD_STENCILS = [
  // AWS
  { id: "aws-lambda", label: "AWS Lambda", category: "AWS", icon: "⚡", codeSnippet: '    Lambda["⚡ AWS Lambda"]\n' },
  { id: "aws-s3", label: "Amazon S3", category: "AWS", icon: "🪣", codeSnippet: '    S3[("🪣 Amazon S3 Bucket")]\n' },
  { id: "aws-dynamodb", label: "DynamoDB", category: "AWS", icon: "⚡", codeSnippet: '    DDB[("⚡ Amazon DynamoDB")]\n' },
  { id: "aws-apigw", label: "API Gateway", category: "AWS", icon: "🚪", codeSnippet: '    APIGW["🚪 Amazon API Gateway"]\n' },
  { id: "aws-sqs", label: "AWS SQS", category: "AWS", icon: "📨", codeSnippet: '    SQS>"📨 Amazon SQS Queue"]\n' },
  { id: "aws-ecs", label: "Amazon ECS/Fargate", category: "AWS", icon: "📦", codeSnippet: '    ECS["📦 Amazon ECS Fargate"]\n' },
  // GCP
  { id: "gcp-cloudrun", label: "Cloud Run", category: "GCP", icon: "🏃", codeSnippet: '    CloudRun["🏃 GCP Cloud Run"]\n' },
  { id: "gcp-bigquery", label: "BigQuery", category: "GCP", icon: "📊", codeSnippet: '    BQ[("📊 Google BigQuery")]\n' },
  { id: "gcp-pubsub", label: "Pub/Sub", category: "GCP", icon: "📢", codeSnippet: '    PubSub>"📢 Google Cloud Pub/Sub"]\n' },
  { id: "gcp-gcs", label: "Cloud Storage", category: "GCP", icon: "🗄️", codeSnippet: '    GCS[("🗄️ Google Cloud Storage")]\n' },
  // Azure
  { id: "azure-functions", label: "Azure Functions", category: "Azure", icon: "⚡", codeSnippet: '    AzFunc["⚡ Azure Functions"]\n' },
  { id: "azure-cosmos", label: "Cosmos DB", category: "Azure", icon: "🌐", codeSnippet: '    Cosmos[("🌐 Azure Cosmos DB")]\n' },
  { id: "azure-aks", label: "Azure AKS", category: "Azure", icon: "☸️", codeSnippet: '    AKS["☸️ Azure Kubernetes Service"]\n' },
  // Kubernetes & CNCF
  { id: "k8s-pod", label: "Kubernetes Pod", category: "Kubernetes", icon: "☸️", codeSnippet: '    Pod["☸️ K8s Pod Container"]\n' },
  { id: "k8s-ingress", label: "K8s Ingress", category: "Kubernetes", icon: "🌐", codeSnippet: '    Ingress["🌐 K8s Ingress Controller"]\n' },
  { id: "k8s-service", label: "ClusterIP Service", category: "Kubernetes", icon: "🔌", codeSnippet: '    Svc["🔌 K8s Service"]\n' },
  // Databases & Caching
  { id: "db-postgres", label: "PostgreSQL", category: "Databases", icon: "🐘", codeSnippet: '    Postgres[("🐘 PostgreSQL Database")]\n' },
  { id: "db-redis", label: "Redis Cluster", category: "Databases", icon: "⚡", codeSnippet: '    Redis[("⚡ Redis In-Memory Cache")]\n' },
  { id: "db-kafka", label: "Apache Kafka", category: "Databases", icon: "📨", codeSnippet: '    Kafka>"📨 Apache Kafka Event Hub"]\n' },
  { id: "db-snowflake", label: "Snowflake", category: "Databases", icon: "❄️", codeSnippet: '    Snowflake[("❄️ Snowflake Warehouse")]\n' },
  // Security & Edge
  { id: "sec-cloudflare", label: "Cloudflare WAF", category: "Security", icon: "🛡️", codeSnippet: '    WAF["🛡️ Cloudflare DDoS / WAF"]\n' },
  { id: "sec-vault", label: "HashiCorp Vault", category: "Security", icon: "🔐", codeSnippet: '    Vault[("🔐 HashiCorp Vault Secrets")]\n' },
  { id: "sec-keycloak", label: "Keycloak / OIDC", category: "Security", icon: "👤", codeSnippet: '    IdP["👤 Keycloak Identity Provider"]\n' },
];

class IndexedDbStorage {
  constructor() {
    this.dbPromise = null;
  }

  getDb() {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        if (typeof window === "undefined" || !window.indexedDB) {
          resolve(null);
          return;
        }
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains("showcases")) {
            db.createObjectStore("showcases", { keyPath: "id" });
          }
          if (!db.objectStoreNames.contains("projects")) {
            db.createObjectStore("projects", { keyPath: "id" });
          }
          if (!db.objectStoreNames.contains("github_cache")) {
            db.createObjectStore("github_cache", { keyPath: "key" });
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    return this.dbPromise;
  }

  async initShowcases() {
    const db = await this.getDb();
    if (!db) return SHOWCASE_CATALOG;
    return new Promise((resolve, reject) => {
      const tx = db.transaction("showcases", "readwrite");
      const store = tx.objectStore("showcases");
      for (const item of SHOWCASE_CATALOG) {
        store.put(item);
      }
      tx.oncomplete = () => resolve(SHOWCASE_CATALOG);
      tx.onerror = () => reject(tx.error);
    });
  }

  async getShowcases() {
    const db = await this.getDb();
    if (!db) return SHOWCASE_CATALOG;
    return new Promise((resolve) => {
      const tx = db.transaction("showcases", "readonly");
      const store = tx.objectStore("showcases");
      const req = store.getAll();
      req.onsuccess = () => {
        if (!req.result || req.result.length === 0) {
          this.initShowcases().then(resolve);
        } else {
          resolve(req.result);
        }
      };
      req.onerror = () => resolve(SHOWCASE_CATALOG);
    });
  }

  async saveProjectBackup(project) {
    const db = await this.getDb();
    if (!db || !project?.id) return;
    return new Promise((resolve, reject) => {
      const tx = db.transaction("projects", "readwrite");
      const store = tx.objectStore("projects");
      store.put({ ...project, savedAt: new Date().toISOString() });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  async getProjectBackups() {
    const db = await this.getDb();
    if (!db) return [];
    return new Promise((resolve) => {
      const tx = db.transaction("projects", "readonly");
      const store = tx.objectStore("projects");
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }
}

export const enterpriseStorage = new IndexedDbStorage();
