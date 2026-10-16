import test from "node:test";
import assert from "node:assert/strict";
import { buildUserPrompt, extractDiagramSource } from "../src/features/ai/providers.js";

test("buildUserPrompt returns the bare prompt without context", () => {
  assert.equal(buildUserPrompt("add a cache"), "add a cache");
});

test("buildUserPrompt includes existing source and repair feedback", () => {
  const out = buildUserPrompt("add a cache", {
    contextSource: "graph TD\n A-->B",
    repair: { error: "Parse error on line 2", previous: "graph TD A--" },
  });
  assert.match(out, /Existing diagram/);
  assert.match(out, /A-->B/);
  assert.match(out, /Parse error on line 2/);
});

test("extractDiagramSource strips fences", () => {
  assert.equal(extractDiagramSource("```mermaid\ngraph TD\n A-->B\n```"), "graph TD\n A-->B");
});
