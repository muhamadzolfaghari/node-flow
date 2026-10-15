import { useRef, useState } from "react";
import { describeToDiagram } from "../utils/importers/describe-to-diagram.js";
import { fixMermaidSyntax } from "../utils/ai-syntax-fixer.js";

export function useDiagramAssistant() {
  const engine = useRef(null),
    [progress, setProgress] = useState(""),
    [busy, setBusy] = useState(false);

  const generate = async (prompt, type = "auto", mode = "instant", options = {}) => {
    if (!prompt.trim())
      throw new Error("Describe the diagram you want to create.");
    setBusy(true);
    try {
      let rawSource = "";

      if (mode === "instant") {
        const result = describeToDiagram(prompt, type);
        rawSource = typeof result === "string" ? result : result.code;
      } else if (mode === "ollama") {
        setProgress("Querying local Ollama model…");
        const baseUrl = options.ollamaUrl || "http://localhost:11434";
        const model = options.ollamaModel || "deepseek-coder";
        try {
          const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model,
              prompt: `You are an expert Mermaid diagram creator. Output ONLY valid Mermaid source code for a ${type === "auto" ? "diagram" : type} based on this description: ${prompt}. Output only the code enclosed in a \`\`\`mermaid code block. Do not provide explanations.`,
              stream: false,
            }),
          });
          if (!res.ok) {
            throw new Error(`Ollama request failed (${res.status}): Make sure Ollama is running at ${baseUrl}`);
          }
          const data = await res.json();
          const text = data.response || "";
          rawSource = text.match(/```(?:mermaid)?\s*\n([\s\S]*?)```/)?.[1]?.trim() || text.trim();
        } catch (fetchErr) {
          throw new Error(
            fetchErr.message.includes("failed") || fetchErr.message.includes("fetch")
              ? `Could not connect to Ollama at ${baseUrl}. Ensure Ollama is running ('ollama serve') or switch to Instant mode.`
              : fetchErr.message
          );
        }
      } else if (mode === "custom") {
        setProgress("Querying AI model…");
        const baseUrl = options.apiUrl || "https://api.openai.com/v1";
        const apiKey = options.apiKey || "";
        const model = options.apiModel || "gpt-4o-mini";
        try {
          const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
            },
            body: JSON.stringify({
              model,
              messages: [
                {
                  role: "system",
                  content: `You are an expert systems architect and Mermaid diagram author. Generate clean, syntactically valid Mermaid diagram source code for a ${type === "auto" ? "suitable diagram type" : type}. Output ONLY raw Mermaid code inside \`\`\`mermaid code fence. No explanations.`,
                },
                { role: "user", content: prompt },
              ],
              temperature: 0.2,
            }),
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData?.error?.message || `API request failed with status ${res.status}`);
          }
          const data = await res.json();
          const text = data.choices?.[0]?.message?.content || "";
          rawSource = text.match(/```(?:mermaid)?\s*\n([\s\S]*?)```/)?.[1]?.trim() || text.trim();
        } catch (apiErr) {
          throw new Error(`Custom AI request failed: ${apiErr.message}`);
        }
      } else if (mode === "qwen") {
        if (!navigator.gpu)
          throw new Error(
            "The local model needs WebGPU. Use Instant mode, Ollama, or a browser with WebGPU enabled.",
          );
        if (!engine.current) {
          setProgress(
            "Downloading local Qwen model. This runs completely on your device.",
          );
          const { CreateMLCEngine } = await import("@mlc-ai/web-llm");
          engine.current = await CreateMLCEngine(
            "Qwen2.5-Coder-0.5B-Instruct-q4f16_1-MLC",
            { initProgressCallback: (p) => setProgress(p.text) },
          );
        }
        setProgress("Generating on your device…");
        const result = await engine.current.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `Return only valid Mermaid diagram source. Use ${type === "auto" ? "the most appropriate diagram type" : type}. No explanation.`,
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 2048,
        });
        const answer = result.choices[0]?.message.content || "";
        rawSource = (
          answer.match(/```(?:mermaid)?\s*\n([\s\S]*?)```/)?.[1]?.trim() ||
          answer.trim()
        );
      } else {
        const result = describeToDiagram(prompt, type);
        rawSource = typeof result === "string" ? result : result.code;
      }

      if (!rawSource) throw new Error("No diagram source was generated.");

      // Automatically validate & repair any syntax imperfections from LLMs
      setProgress("Verifying diagram syntax…");
      const fixResult = await fixMermaidSyntax(rawSource).catch(() => null);
      if (fixResult && fixResult.success && fixResult.fixedCode) {
        return fixResult.fixedCode;
      }

      return rawSource;
    } finally {
      setBusy(false);
      setProgress("");
    }
  };

  return { generate, progress, busy };
}
