import { describeToDiagram } from "../../utils/importers/describe-to-diagram.js";
import { optimizeAiPrompt } from "../../utils/ai-token-optimizer.js";
import { fetchWithRetry } from "../../utils/network-retry.js";

const DEFAULT_TEMPERATURE = 0.2;
const MAX_LOCAL_TOKENS = 2048;

const diagramPrompt = (type) =>
  `You are an expert systems architect and Mermaid diagram author. Generate clean, syntactically valid Mermaid source for ${type === "auto" ? "the most suitable diagram type" : type}. Return only Mermaid source code, without Markdown fences or explanation.`;

/**
 * Builds token-optimized user prompt with compressed diagram context.
 */
export function buildUserPrompt(prompt, options = {}) {
  const { optimizedPrompt } = optimizeAiPrompt(prompt, options);
  return optimizedPrompt;
}

export function extractDiagramSource(text = "") {
  return text.match(/```(?:mermaid)?\s*\n?([\s\S]*?)```/i)?.[1]?.trim() || text.trim();
}

export const aiProviders = {
  instant: {
    id: "instant",
    label: "Deterministic",
    async generate({ prompt, type }) {
      const result = describeToDiagram(prompt, type);
      return typeof result === "string" ? result : result.code;
    },
  },
  ollama: {
    id: "ollama",
    label: "Ollama",
    async generate({ prompt, type, options, onProgress }) {
      const baseUrl = (options.ollamaUrl || "http://localhost:11434").replace(/\/+$/, "");
      onProgress("Querying local Ollama model (token optimized)…");
      let response;
      try {
        response = await fetchWithRetry(`${baseUrl}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: options.ollamaModel || "deepseek-coder",
            prompt: `${diagramPrompt(type)}\n\n${buildUserPrompt(prompt, options)}`,
            stream: false,
          }),
        }, { maxRetries: 2, initialDelayMs: 400 });
      } catch {
        throw new Error(`Could not connect to Ollama at ${baseUrl}. Ensure Ollama is running or switch to offline mode.`);
      }
      if (!response.ok) throw new Error(`Ollama request failed (${response.status}) at ${baseUrl}`);
      return extractDiagramSource((await response.json()).response || "");
    },
  },
  openaiCompatible: {
    id: "openaiCompatible",
    label: "OpenAI-compatible",
    async generate({ prompt, type, options, onProgress }) {
      onProgress("Querying AI model (token optimized)…");
      const baseUrl = (options.apiUrl || "https://api.openai.com/v1").replace(/\/+$/, "");
      const response = await fetchWithRetry(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(options.apiKey ? { Authorization: `Bearer ${options.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: options.apiModel || "gpt-4o-mini",
          messages: [
            { role: "system", content: diagramPrompt(type) },
            { role: "user", content: buildUserPrompt(prompt, options) },
          ],
          temperature: DEFAULT_TEMPERATURE,
        }),
      }, { maxRetries: 2, initialDelayMs: 500 });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error?.message || `API request failed with status ${response.status}`);
      }
      return extractDiagramSource((await response.json()).choices?.[0]?.message?.content || "");
    },
  },
  gemini: {
    id: "gemini",
    label: "Gemini",
    async generate({ prompt, type, options, onProgress }) {
      if (!options.geminiApiKey?.trim()) throw new Error("Enter a Gemini API key to use Gemini.");
      onProgress("Generating with Gemini (token optimized)…");
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: options.geminiApiKey.trim() });
      const response = await ai.models.generateContent({
        model: options.geminiModel || "gemini-3.8-flash",
        contents: buildUserPrompt(prompt, options),
        config: { systemInstruction: diagramPrompt(type), temperature: DEFAULT_TEMPERATURE },
      });
      return extractDiagramSource(response.text || "");
    },
    async listModels(apiKey) {
      if (!apiKey?.trim()) throw new Error("Enter a Gemini API key before discovering models.");
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
      const models = await ai.models.list();
      const result = [];
      for await (const model of models) {
        if (model.name?.includes("gemini") && model.supportedActions?.includes("generateContent")) {
          result.push({ id: model.name.replace(/^models\//, ""), label: model.displayName || model.name });
        }
      }
      return result;
    },
  },
  webllm: {
    id: "webllm",
    label: "WebGPU local model",
    async generate({ prompt, type, options, engineRef, onProgress }) {
      if (!navigator.gpu) throw new Error("The local model needs WebGPU. Use Instant mode, Ollama, or a browser with WebGPU enabled.");
      if (!engineRef.current) {
        onProgress("Downloading local Qwen model. This runs completely on your device.");
        const { CreateMLCEngine } = await import("@mlc-ai/web-llm");
        engineRef.current = await CreateMLCEngine("Qwen2.5-Coder-0.5B-Instruct-q4f16_1-MLC", {
          initProgressCallback: (progress) => onProgress(progress.text),
        });
      }
      onProgress("Generating on your device…");
      const result = await engineRef.current.chat.completions.create({
        messages: [
          { role: "system", content: diagramPrompt(type) },
          { role: "user", content: buildUserPrompt(prompt, options) },
        ],
        temperature: DEFAULT_TEMPERATURE,
        max_tokens: MAX_LOCAL_TOKENS,
      });
      return extractDiagramSource(result.choices[0]?.message.content || "");
    },
  },
};

export const assistantModeToProvider = {
  instant: "instant",
  ollama: "ollama",
  custom: "openaiCompatible",
  gemini: "gemini",
  qwen: "webllm",
};
