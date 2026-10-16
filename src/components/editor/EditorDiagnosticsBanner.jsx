import React from "react";
import { AlertTriangle, Sparkles, Lightbulb, ChevronDown, Check } from "lucide-react";

export function EditorDiagnosticsBanner({
  document,
  syntaxStatus,
  fixBusy,
  fixSuccessMsg,
  fixFailMsg,
  showSuggestions,
  setShowSuggestions,
  explanations,
  goToLine,
  runAiFix,
  applyLineRepair,
  commentOutLine,
}) {
  return (
    <>
      {/* Floating AI Diagnostic, Fix & Autocomplete Status Bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-card/95 px-3 py-1.5 text-[11px] backdrop-blur select-none z-10">
        <div className="flex items-center gap-2 overflow-hidden">
          {syntaxStatus.valid ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium truncate">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Valid syntax</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground uppercase tracking-wider text-[10px]">
                {document?.format || "mermaid"}
              </span>
            </span>
          ) : (
            <div className="flex items-center gap-2 overflow-hidden">
              <button
                type="button"
                onClick={() => goToLine(syntaxStatus.line)}
                className="inline-flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-medium truncate group text-left cursor-pointer"
                title={`Jump to line ${syntaxStatus.line || 1}`}
              >
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-500 animate-pulse" />
                <span className="truncate group-hover:underline">
                  Line {syntaxStatus.line || 1}: {syntaxStatus.error || "Syntax error detected"}
                </span>
              </button>

              {/* ⚡ One-Click AI Quick Fix Button */}
              <button
                type="button"
                onClick={runAiFix}
                disabled={fixBusy}
                className="inline-flex items-center gap-1 rounded bg-gradient-to-r from-blue-600 to-indigo-600 px-2 py-0.5 text-[11px] font-semibold text-white shadow hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                title="Instant repair with AI & universal fixer (Alt+F)"
              >
                {fixBusy ? (
                  <>
                    <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Fixing…</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 text-amber-300" />
                    <span>AI Quick Fix</span>
                  </>
                )}
              </button>

              {/* 💡 Suggestion Dropdown Button */}
              {explanations.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowSuggestions((prev) => !prev)}
                  className="inline-flex items-center gap-1 rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
                  title="View cause and solution hints"
                >
                  <Lightbulb className="h-3 w-3 text-amber-400" />
                  <span>Hints ({explanations.length})</span>
                  <ChevronDown className={`h-2.5 w-2.5 transition-transform ${showSuggestions ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>
          )}

          {fixFailMsg && (
            <span role="status" className="inline-flex items-center gap-1 text-amber-400 font-medium">
              <span>{fixFailMsg}</span>
            </span>
          )}
          {fixSuccessMsg && (
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium animate-fadeIn">
              <Check className="h-3 w-3" />
              <span>{fixSuccessMsg}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-muted-foreground text-[10px]">
          <span className="hidden sm:inline text-muted-foreground">
            <kbd className="rounded bg-secondary px-1 py-0.5 text-[9px] text-foreground/80">Tab</kbd> Autocomplete
          </span>
          <span className="hidden md:inline text-muted-foreground">
            <kbd className="rounded bg-secondary px-1 py-0.5 text-[9px] text-foreground/80">Alt+F</kbd> AI Fix
          </span>
        </div>
      </div>

      {/* Suggestion Dropdown Popover */}
      {showSuggestions && explanations.length > 0 && (
        <div className="border-b border-[#334155] bg-[#111827] p-3 text-xs shadow-xl animate-fadeIn z-20 max-h-60 overflow-auto">
          <div className="flex items-center justify-between pb-1.5 mb-2.5 border-b border-slate-800">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
              <span>Diagnostic Hints & Syntax Fixes</span>
            </span>
            <button
              type="button"
              onClick={() => setShowSuggestions(false)}
              className="text-muted-foreground hover:text-white text-[11px] cursor-pointer"
            >
              ✕ Close
            </button>
          </div>
          <div className="space-y-2.5">
            {explanations.slice(0, 3).map((e) => (
              <div key={e.id} className="rounded border border-slate-700 bg-slate-900/80 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-amber-300 text-[11px]">{e.symptom}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={applyLineRepair}
                      disabled={fixBusy}
                      className="rounded bg-emerald-600/30 border border-emerald-500/50 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-600/50 transition disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                      title="Apply AI repair to current error"
                    >
                      <Sparkles className="h-2.5 w-2.5 text-emerald-400" />
                      <span>Repair Line {syntaxStatus.line || 1}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => commentOutLine(syntaxStatus.line)}
                      className="rounded bg-slate-800 border border-slate-600 px-1.5 py-0.5 text-[10px] text-slate-300 hover:bg-slate-700 transition cursor-pointer"
                      title="Comment out this line with %%"
                    >
                      Comment Out
                    </button>
                  </div>
                </div>
                <p className="text-foreground/80 mt-1 text-[11px] leading-relaxed">
                  <span className="text-muted-foreground font-medium">Cause:</span> {e.cause}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="rounded bg-rose-950/40 border border-rose-900/50 p-1.5 text-rose-300">
                    <span className="text-rose-500 font-bold block mb-0.5">✗ Incorrect:</span>
                    {e.exampleBad}
                  </div>
                  <div className="rounded bg-emerald-950/40 border border-emerald-900/50 p-1.5 text-emerald-300">
                    <span className="text-emerald-500 font-bold block mb-0.5">✓ Correct:</span>
                    {e.exampleGood}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
