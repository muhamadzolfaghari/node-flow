import { useMemo, useState } from "react";
import { fixAnySyntax } from "../utils/universalFixer.ts";
import { explainError } from "../utils/syntaxErrorDB.ts";

function DiagnosticExplanationList({ explanations }) {
  return (
    <>
      {explanations.slice(0, 4).map((e) => (
        <details key={e.id} className="mt-2 rounded border p-2">
          <summary className="cursor-pointer font-medium">{e.symptom}</summary>
          <p className="mt-1 leading-5 text-muted-foreground">Cause: {e.cause}</p>
          <p className="mt-1 leading-5">Fix: {e.fix}</p>
          <pre className="mt-1 overflow-auto rounded bg-muted p-2 text-[10px] leading-4">
            {"✗ " + e.exampleBad + "\n✓ " + e.exampleGood}
          </pre>
        </details>
      ))}
    </>
  );
}

function DiagnosticFixResult({ result }) {
  if (!result) return null;
  return (
    <>
      {!result.success && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          {(result.fixes || []).join(" · ") || result.error || "No automatic fix found — see hints above."}
        </p>
      )}
      {result.success && (
        <p className="mt-2 text-[11px] text-emerald-500">
          Fixed via {result.method || "deterministic"}: {(result.fixes || []).join(" · ")}
        </p>
      )}
      {result.previewFix && (
        <pre className="mt-2 max-h-32 overflow-auto rounded bg-muted p-2 text-[10px]">
          {result.previewFix}
        </pre>
      )}
    </>
  );
}

export default function DiagnosticsPanel({ document, error, onApplyFix }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const explanations = useMemo(
    () => explainError(document?.source || "", document?.format || "mermaid", error || ""),
    [document?.source, document?.format, error],
  );

  async function runFix() {
    if (!document) return;
    setBusy(true);
    try {
      const r = await fixAnySyntax(document.source, document.format, error || "");
      setResult(r);
      if (r.success && r.fixedCode && onApplyFix) onApplyFix(r.fixedCode);
    } finally {
      setBusy(false);
    }
  }

  if (!error && explanations.length === 0 && !result) return null;

  return (
    <div className="mt-3 rounded-md border p-3 text-xs" data-testid="diagnostics-panel">
      <p className="font-medium">Diagnostics — syntax-error database</p>
      {error && <p className="mt-2 leading-5 text-destructive">{error}</p>}
      <DiagnosticExplanationList explanations={explanations} />
      <div className="mt-2 flex gap-2">
        <button
          className="rounded-md border px-2 py-1 text-[11px] hover:bg-accent disabled:opacity-50"
          disabled={busy || !document}
          onClick={runFix}
        >
          {busy ? "Fixing…" : result?.success ? "Fix applied" : "Auto-fix with universal fixer"}
        </button>
      </div>
      <DiagnosticFixResult result={result} />
    </div>
  );
}
