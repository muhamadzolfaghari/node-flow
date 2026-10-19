import test from "node:test";
import assert from "node:assert/strict";
import {
  persistedCanvasSchema,
  parseProviderResponse,
  ollamaResponseSchema,
  openaiResponseSchema,
} from "../src/lib/schemas.ts";
import { aiProviders } from "../src/features/ai/providers.ts";

test("persistedCanvasSchema keeps valid fields and defaults only the corrupt ones", () => {
  const out = persistedCanvasSchema.parse({ grid: "lines", tool: "laser", minimap: "yes", wheelMode: "pan" });
  assert.equal(out.grid, "lines");
  assert.equal(out.wheelMode, "pan");
  assert.equal(out.tool, "pointer");
  assert.equal(out.minimap, true);
  assert.equal(out.activeLens, "standard");
  assert.deepEqual(persistedCanvasSchema.parse({}), persistedCanvasSchema.parse(undefined ?? {}));
});

test("parseProviderResponse names the provider and the bad field", () => {
  assert.equal(parseProviderResponse(ollamaResponseSchema, { response: "ok" }, "Ollama").response, "ok");
  assert.throws(() => parseProviderResponse(ollamaResponseSchema, { response: 5 }, "Ollama"), /Ollama returned an unexpected response \(response/);
  assert.throws(() => parseProviderResponse(openaiResponseSchema, { choices: [] }, "The API"), /The API returned an unexpected response/);
  assert.throws(() => parseProviderResponse(ollamaResponseSchema, null, "Ollama"), /unexpected response/);
});

function mockFetch(body, { ok = true, status = 200 } = {}) {
  globalThis.fetch = async () => ({ ok, status, json: async () => body });
}
const run = (id, options = {}) =>
  aiProviders[id].generate({ prompt: "x", type: "auto", options, onProgress() {} });

test("ollama and OpenAI-compatible providers parse valid replies and reject malformed ones", async () => {
  const real = globalThis.fetch;
  try {
    mockFetch({ response: "```mermaid\nflowchart TD\n  A --> B\n```" });
    assert.equal(await run("ollama"), "flowchart TD\n  A --> B");

    mockFetch({ nope: true });
    await assert.rejects(run("ollama"), /Ollama returned an unexpected response/);

    mockFetch({ choices: [{ message: { content: "flowchart TD\n  A --> B" } }] });
    assert.equal(await run("openaiCompatible", { apiKey: "k" }), "flowchart TD\n  A --> B");

    mockFetch({ choices: [] });
    await assert.rejects(run("openaiCompatible", { apiKey: "k" }), /unexpected response/);

    mockFetch({ error: { message: "Invalid API key" } }, { ok: false, status: 401 });
    await assert.rejects(run("openaiCompatible", { apiKey: "k" }), /Invalid API key/);

    mockFetch("<html>", { ok: false, status: 502 });
    await assert.rejects(run("openaiCompatible", { apiKey: "k" }), /status 502/);
  } finally {
    globalThis.fetch = real;
  }
});
