import { useRef, useState } from "react";
import { fixMermaidSyntax, testMermaidSyntax } from "../utils/ai-syntax-fixer.js";
import { aiProviders, assistantModeToProvider } from "../features/ai/providers.js";

export function useDiagramAssistant() {
  const engine = useRef(null);
  const [progress, setProgress] = useState("");
  const [busy, setBusy] = useState(false);

  const generate = async (prompt, type = "auto", mode = "instant", options = {}) => {
    if (!prompt.trim()) throw new Error("Describe the diagram you want to create.");
    const providerId = assistantModeToProvider[mode] || "instant";
    const provider = aiProviders[providerId];
    setBusy(true);
    try {
      const run = (extra = {}) =>
        provider.generate({ prompt, type, options: { ...options, ...extra }, engineRef: engine, onProgress: setProgress });
      const repairLocally = async (source) => {
        const fixed = await fixMermaidSyntax(source).catch(() => null);
        return fixed?.success && fixed.fixedCode ? fixed.fixedCode : source;
      };

      let source = await repairLocally(await run());
      if (!source) throw new Error("No diagram source was generated.");

      setProgress("Verifying diagram syntax…");
      let check = await testMermaidSyntax(source);
      // Model engines get one repair round with the parser error; the
      // deterministic engine cannot improve on a retry.
      if (!check.valid && providerId !== "instant") {
        setProgress("Asking the model to repair its output…");
        source = await repairLocally(await run({ repair: { error: check.error, previous: source } }));
        check = await testMermaidSyntax(source);
      }
      return source;
    } finally {
      setBusy(false);
      setProgress("");
    }
  };

  const listModels = async (providerId, apiKey) => {
    const provider = aiProviders[providerId];
    if (!provider?.listModels) throw new Error("This provider does not support model discovery.");
    return provider.listModels(apiKey);
  };

  return { generate, listModels, busy, progress };
}
