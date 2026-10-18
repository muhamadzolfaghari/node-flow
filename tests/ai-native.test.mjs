import test from "node:test";
import assert from "node:assert/strict";
import {
  estimateTokens,
  compressMermaidSource,
  optimizeAiPrompt,
} from "../src/utils/aiTokenOptimizer.ts";
import {
  checkInstantHealth,
  runAiHealthDiagnostics,
} from "../src/utils/aiHealthCheck.ts";
import { buildUserPrompt } from "../src/features/ai/providers.ts";

test("AI Token Optimizer: estimateTokens measures token counts", () => {
  assert.equal(estimateTokens(""), 0);
  assert.equal(estimateTokens("   "), 0);

  const samplePrompt = "Generate a flowchart for microservices authentication";
  const tokens = estimateTokens(samplePrompt);
  assert.ok(tokens > 4 && tokens < 40, `Unexpected token count: ${tokens}`);
});

test("AI Token Optimizer: compressMermaidSource strips comments and compacts whitespace", () => {
  const verboseSource = `
flowchart TD
  %% Top-level comment
  A[User Client] -->|Login| B[API Gateway]
  
  %% Middleware layer
  B --> C[(PostgreSQL)]

  style A fill:#f9f,stroke:#333
  classDef default fill:#fff;
`;

  const compressed = compressMermaidSource(verboseSource, { stripStyles: true, keepComments: false });

  assert.ok(!compressed.includes("%% Top-level comment"));
  assert.ok(!compressed.includes("style A fill:#f9f"));
  assert.ok(!compressed.includes("classDef default"));
  assert.ok(compressed.includes("A[User Client] -->|Login| B[API Gateway]"));
  assert.ok(compressed.includes("B --> C[(PostgreSQL)]"));
});

test("AI Token Optimizer: optimizeAiPrompt cuts token usage and reports stats", () => {
  const userPrompt = "Add redis cache between gateway and database";
  const contextDiagram = `
flowchart TD
  %% Section 1: Ingress
  Client --> Gateway
  %% Section 2: Persistence
  Gateway --> Database
  style Client fill:#222,stroke:#555,stroke-width:2px
  style Gateway fill:#333,stroke:#666,stroke-width:2px
  style Database fill:#444,stroke:#777,stroke-width:2px
  classDef default fill:#ffffff,stroke:#000000
`;

  const result = optimizeAiPrompt(userPrompt, { contextSource: contextDiagram, stripStyles: true });

  assert.ok(result.optimizedPrompt.includes("Add redis cache"));
  assert.ok(!result.optimizedPrompt.includes("%% Section 1"));
  assert.ok(!result.optimizedPrompt.includes("style Client fill"));
  assert.ok(result.stats.savedTokens > 0);
  assert.ok(result.stats.reductionPercent > 10);
});

test("AI Providers: buildUserPrompt uses token compression", () => {
  const prompt = "Build sequence diagram";
  const contextSource = `
sequenceDiagram
  %% comment
  Alice->>Bob: Hello
  style Alice fill:#000
`;

  const built = buildUserPrompt(prompt, { contextSource });
  assert.ok(built.includes("Build sequence diagram"));
  assert.ok(built.includes("Alice->>Bob: Hello"));
  assert.ok(!built.includes("%% comment"));
});

test("AI Health Check: checkInstantHealth confirms offline deterministic generator", async () => {
  const result = await checkInstantHealth();
  assert.equal(result.id, "instant");
  assert.equal(result.status, "online");
  assert.equal(result.local, true);
  assert.ok(typeof result.latencyMs === "number");
});

test("AI Health Check: runAiHealthDiagnostics reports overall health and offline fallback", async () => {
  const result = await runAiHealthDiagnostics();
  assert.ok(result.overall === "healthy" || result.overall === "degraded");
  assert.equal(result.fallbackReady, true);
  assert.ok(Array.isArray(result.providers));
  assert.ok(result.providers.length >= 3);
});
