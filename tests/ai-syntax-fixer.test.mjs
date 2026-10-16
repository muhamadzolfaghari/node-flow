import test from "node:test";
import assert from "node:assert/strict";
import {
  fixMermaidSyntax,
  repairReportedLine,
  testMermaidSyntax,
  applyMermaidIfValid,
  parseErrorDetails,
} from "../src/utils/ai-syntax-fixer.js";

test("parseErrorDetails parses line numbers, column carats, and clean error messages", () => {
  const err1 = `Parse error on line 4:
...Client --> Server
-------------------^
Expecting 'EOF', 'SOLID_OPEN', got 'ALPHA'`;
  const parsed1 = parseErrorDetails(err1);
  assert.equal(parsed1.line, 4);
  assert.equal(parsed1.column, 19);
  assert.ok(parsed1.message.includes("Expecting"));

  const err2 = "Error: at line 12: unrecognized syntax";
  const parsed2 = parseErrorDetails(err2);
  assert.equal(parsed2.line, 12);
  assert.ok(parsed2.message.includes("unrecognized syntax"));

  assert.equal(parseErrorDetails(null), null);
  assert.equal(parseErrorDetails(""), null);
});

test("testMermaidSyntax verifies valid syntax and catches syntax errors", async () => {
  const empty = await testMermaidSyntax("");
  assert.equal(empty.valid, false);

  const valid = await testMermaidSyntax("flowchart TD\n  A --> B");
  assert.equal(valid.valid, true);

  const invalid = await testMermaidSyntax("flowchart TD\n  A --->>>> B ???");
  assert.equal(invalid.valid, false);
  assert.ok(invalid.error);
});

test("applyMermaidIfValid executes callback only when diagram syntax is valid", async () => {
  let applied = false;
  const resValid = await applyMermaidIfValid("flowchart LR\n  A --> B", async () => {
    applied = true;
  });
  assert.equal(resValid.valid, true);
  assert.equal(resValid.applied, true);
  assert.equal(applied, true);

  applied = false;
  const resInvalid = await applyMermaidIfValid("invalid diagram header\n  foo", async () => {
    applied = true;
  });
  assert.equal(resInvalid.valid, false);
  assert.equal(resInvalid.applied, false);
  assert.equal(applied, false);
});

// The contract a generated diagram must pass before it can replace the user's work:
// a rejected candidate reports why and never reaches the apply callback, and an accepted
// candidate reaches it once with the validated source.
test("a rejected candidate reports the reason and a valid one applies exactly once", async () => {
  const appliedCandidates = [];
  const onApply = async (code) => appliedCandidates.push(code);

  const rejected = await applyMermaidIfValid("flowchart TD\n  A --> [broken", onApply);
  assert.equal(rejected.applied, false);
  assert.equal(rejected.valid, false);
  assert.ok(rejected.error, "a rejected candidate must explain why");
  assert.equal(appliedCandidates.length, 0, "a rejected candidate must not be applied");

  const validCandidate = "flowchart TD\n  A --> B";
  const accepted = await applyMermaidIfValid(validCandidate, onApply);
  assert.equal(accepted.applied, true);
  assert.deepEqual(appliedCandidates, [validCandidate]);
});

test("fixMermaidSyntax automatically adds missing headers based on diagram contents", async () => {
  // Sequence contents without header
  const seq = "autonumber\nAlice->>Bob: Hello";
  const fixedSeq = await fixMermaidSyntax(seq);
  assert.ok(fixedSeq.success);
  assert.ok(fixedSeq.fixedCode.includes("sequenceDiagram"));

  // Flowchart contents without header
  const flow = "A[Client] --> B[Server]";
  const fixedFlow = await fixMermaidSyntax(flow);
  assert.ok(fixedFlow.success);
  assert.ok(fixedFlow.fixedCode.includes("flowchart TD"));

  // Empty code
  const empty = await fixMermaidSyntax("");
  assert.equal(empty.success, false);
});

test("fixMermaidSyntax automatically closes unclosed subgraph blocks", async () => {
  const broken = `flowchart TD
  subgraph Cluster
    A --> B
`;
  const fixed = await fixMermaidSyntax(broken);
  assert.ok(fixed.success);
  assert.ok(fixed.fixedCode.includes("end"));
});

test("fixMermaidSyntax normalizes legacy graph and beta diagram headers", async () => {
  const legacyGraph = "graph LR\n  A --> B";
  const fixedGraph = await fixMermaidSyntax(legacyGraph);
  assert.ok(fixedGraph.success);
  assert.ok(fixedGraph.fixedCode.includes("flowchart LR"));

  const legacySankey = "sankey\nA,B,10";
  const fixedSankey = await fixMermaidSyntax(legacySankey);
  assert.ok(fixedSankey.fixedCode.includes("sankey-beta"));

  const legacyState = "stateDiagram\n[*] --> Active";
  const fixedState = await fixMermaidSyntax(legacyState);
  assert.ok(fixedState.fixedCode.includes("stateDiagram-v2"));
});

test("repairReportedLine tests targeted edits on the reported error line", async () => {
  const code = `flowchart TD
  A[Client] --> B[Server] stray
  B --> C`;
  const repaired = await repairReportedLine(code, "Parse error on line 2: unexpected text");
  assert.ok(repaired);
  assert.ok(repaired.code.includes("A[Client] --> B[Server]"));
  assert.ok(!repaired.code.includes("stray"));

  const nonExistent = await repairReportedLine(code, "Parse error on line 99: invalid");
  assert.equal(nonExistent, null);
});

test("fixMermaidSyntax supports AI Assistant engine invocation", async () => {
  const mockAi = {
    engineMode: "ollama",
    ollamaConnected: true,
    ollamaUrl: "http://localhost:11434",
    ollamaModel: "qwen",
    extractMermaidCode: (text) => text.trim(),
  };
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({ message: { content: "flowchart TD\n  A --> B" } }),
    });
    const broken = "flowchart TD\n  A ???\n  B ???";
    const res = await fixMermaidSyntax(broken, "Parse error on line 2: unclosed", { aiAssistant: mockAi });
    assert.equal(res.method, "llm");
    assert.ok(res.success);
    assert.ok(res.fixedCode.includes("flowchart TD"));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

