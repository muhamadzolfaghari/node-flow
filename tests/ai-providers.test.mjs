import test from "node:test";
import assert from "node:assert/strict";
import {
  buildUserPrompt,
  extractDiagramSource,
  aiProviders,
  assistantModeToProvider,
} from "../src/features/ai/providers.ts";

test("buildUserPrompt constructs comprehensive prompt with context and repair history", () => {
  const basic = buildUserPrompt("Create a login sequence diagram");
  assert.equal(basic, "Create a login sequence diagram");

  const withContext = buildUserPrompt("Add database cache", {
    contextSource: "flowchart TD\n  Client --> Server",
  });
  assert.ok(withContext.includes("Add database cache"));
  assert.ok(withContext.includes("flowchart TD\n  Client --> Server"));

  const withRepair = buildUserPrompt("Fix arrows", {
    repair: {
      error: "Parse error on line 2",
      previous: "A ->> B",
    },
  });
  assert.ok(withRepair.includes("failed Mermaid validation with: Parse error on line 2"));
  assert.ok(withRepair.includes("Previous answer:\nA ->> B"));
});

test("extractDiagramSource unwraps markdown fences and raw text", () => {
  assert.equal(extractDiagramSource("```mermaid\nflowchart TD\n  A --> B\n```"), "flowchart TD\n  A --> B");
  assert.equal(extractDiagramSource("```\nclassDiagram\n  class User\n```"), "classDiagram\n  class User");
  assert.equal(extractDiagramSource("flowchart LR\n  X --> Y"), "flowchart LR\n  X --> Y");
  assert.equal(extractDiagramSource(""), "");
});

test("aiProviders.instant generates deterministic diagram source", async () => {
  const result = await aiProviders.instant.generate({
    prompt: "A connects to B then B calls C",
    type: "flowchart",
  });
  assert.ok(typeof result === "string");
  assert.ok(result.includes("flowchart") || result.includes("-->"));
});

test("aiProviders.ollama queries local Ollama endpoint with mocked fetch", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url, options) => {
      assert.ok(url.includes("/api/generate"));
      const body = JSON.parse(options.body);
      assert.equal(body.model, "deepseek-coder");
      return {
        ok: true,
        json: async () => ({
          response: "```mermaid\nsequenceDiagram\n  A->>B: Ping\n```",
        }),
      };
    };

    let progressMsg = "";
    const result = await aiProviders.ollama.generate({
      prompt: "Ping pong sequence",
      type: "sequenceDiagram",
      options: { ollamaUrl: "http://localhost:11434", ollamaModel: "deepseek-coder" },
      onProgress: (msg) => { progressMsg = msg; },
    });
    assert.equal(result, "sequenceDiagram\n  A->>B: Ping");
    assert.ok(progressMsg.includes("Ollama"));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("aiProviders.ollama handles connection failures gracefully", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => {
      throw new Error("Connection refused");
    };

    await assert.rejects(
      async () => {
        await aiProviders.ollama.generate({
          prompt: "Test diagram",
          type: "flowchart",
          options: {},
          onProgress: () => {},
        });
      },
      /Could not connect to Ollama/
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("aiProviders.openaiCompatible handles query and API error statuses", async () => {
  const originalFetch = globalThis.fetch;
  try {
    // 1. Success path
    globalThis.fetch = async (url, options) => {
      assert.ok(url.includes("/chat/completions"));
      assert.ok(options.headers.Authorization.includes("test-key"));
      return {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "flowchart TD\n  A --> B" } }],
        }),
      };
    };

    const result = await aiProviders.openaiCompatible.generate({
      prompt: "Simple flowchart",
      type: "flowchart",
      options: { apiKey: "test-key", apiModel: "gpt-4o-mini" },
      onProgress: () => {},
    });
    assert.equal(result, "flowchart TD\n  A --> B");

    // 2. Error path
    globalThis.fetch = async () => {
      return {
        ok: false,
        status: 401,
        json: async () => ({ error: { message: "Invalid API key" } }),
      };
    };

    await assert.rejects(
      async () => {
        await aiProviders.openaiCompatible.generate({
          prompt: "Fail flowchart",
          type: "flowchart",
          options: {},
          onProgress: () => {},
        });
      },
      /Invalid API key/
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("assistantModeToProvider maps all modes correctly", () => {
  assert.equal(assistantModeToProvider.instant, "instant");
  assert.equal(assistantModeToProvider.ollama, "ollama");
  assert.equal(assistantModeToProvider.custom, "openaiCompatible");
  assert.equal(assistantModeToProvider.gemini, "gemini");
  assert.equal(assistantModeToProvider.qwen, "webllm");
});

test("aiProviders.gemini validates API key requirements", async () => {
  await assert.rejects(
    async () => {
      await aiProviders.gemini.generate({
        prompt: "test",
        type: "flowchart",
        options: { geminiApiKey: "" },
        onProgress: () => {},
      });
    },
    /Enter a Gemini API key to use Gemini/
  );

  await assert.rejects(
    async () => {
      await aiProviders.gemini.listModels("");
    },
    /Enter a Gemini API key before discovering models/
  );
});

test("aiProviders.webllm validates WebGPU and generates with local engine", async () => {
  // 1. Missing WebGPU (delete or set undefined)
  const hadGpu = "gpu" in globalThis.navigator;
  const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis.navigator, "gpu");

  try {
    Object.defineProperty(globalThis.navigator, "gpu", {
      value: undefined,
      configurable: true,
      writable: true,
    });

    await assert.rejects(
      async () => {
        await aiProviders.webllm.generate({
          prompt: "test",
          type: "flowchart",
          options: {},
          engineRef: { current: null },
          onProgress: () => {},
        });
      },
      /The local model needs WebGPU/
    );

    // 2. WebGPU present with preloaded engineRef
    Object.defineProperty(globalThis.navigator, "gpu", {
      value: { requestAdapter: async () => ({}) },
      configurable: true,
      writable: true,
    });

    const mockEngine = {
      chat: {
        completions: {
          create: async () => ({
            choices: [{ message: { content: "```mermaid\nflowchart LR\n  Local1 --> Local2\n```" } }],
          }),
        },
      },
    };

    let progressLogged = "";
    const res = await aiProviders.webllm.generate({
      prompt: "Local test",
      type: "flowchart",
      options: {},
      engineRef: { current: mockEngine },
      onProgress: (p) => { progressLogged = p; },
    });

    assert.equal(res, "flowchart LR\n  Local1 --> Local2");
    assert.ok(progressLogged.includes("device"));
  } finally {
    if (hadGpu && originalDescriptor) {
      Object.defineProperty(globalThis.navigator, "gpu", originalDescriptor);
    } else {
      delete globalThis.navigator.gpu;
    }
  }
});

