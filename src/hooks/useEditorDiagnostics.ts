import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { EditorView } from "@codemirror/view";
import { fixAnySyntax, parseErrorDetails } from "../utils/universal-fixer.js";
import { repairReportedLine } from "../utils/ai-syntax-fixer.js";
import { explainError } from "../utils/syntax-error-db.js";

/**
 * Custom hook to separate syntax diagnostics, error explanations,
 * and AI quick-fix execution from CodeMirror view rendering.
 */
export function useEditorDiagnostics({
  editorRef,
  document,
  previewError,
  onChange,
  currentIdRef,
}) {
  const [syntaxStatus, setSyntaxStatus] = useState({
    valid: true,
    error: null,
    line: null,
    raw: null,
  });
  const [fixBusy, setFixBusy] = useState(false);
  const [fixSuccessMsg, setFixSuccessMsg] = useState(null);
  const [fixFailMsg, setFixFailMsg] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const syntaxStatusRef = useRef(syntaxStatus);
  syntaxStatusRef.current = syntaxStatus;

  const setSyntaxStatusSafe = useCallback((newStatusOrFn) => {
    setSyntaxStatus((prev) => {
      const next = typeof newStatusOrFn === "function" ? newStatusOrFn(prev) : newStatusOrFn;
      if (
        prev.valid === next.valid &&
        prev.error === next.error &&
        prev.line === next.line &&
        prev.raw === next.raw
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  // Synchronize live preview render errors to editor syntax status
  useEffect(() => {
    if (previewError) {
      const details = parseErrorDetails(previewError, document?.source || "");
      setSyntaxStatusSafe({
        valid: false,
        error: details?.message || previewError,
        line: details?.line || 1,
        raw: details?.raw || previewError,
      });
    } else if (!previewError && !syntaxStatusRef.current.valid && !syntaxStatusRef.current.error) {
      setSyntaxStatusSafe({ valid: true, error: null, line: null, raw: null });
    }
  }, [previewError, document?.source, setSyntaxStatusSafe]);

  // Explanations from the syntax error database
  const explanations = useMemo(() => {
    if (syntaxStatus.valid || !document?.source) return [];
    return explainError(
      document.source,
      document.format || "mermaid",
      syntaxStatus.raw || syntaxStatus.error || "",
    );
  }, [syntaxStatus, document?.source, document?.format]);

  // Jump to error line in CodeMirror
  const goToLine = useCallback(
    (line) => {
      const v = editorRef.current;
      if (v && line) {
        const at = v.state.doc.line(
          Math.max(1, Math.min(line, v.state.doc.lines)),
        ).from;
        v.dispatch({
          selection: { anchor: at },
          effects: EditorView.scrollIntoView(at, { y: "center" }),
        });
        v.focus();
      }
    },
    [editorRef],
  );

  // Comment out offending line
  const commentOutLine = useCallback(
    (lineNum) => {
      if (!editorRef.current) return;
      const view = editorRef.current;
      const l = Math.max(1, Math.min(lineNum || 1, view.state.doc.lines));
      const lineObj = view.state.doc.line(l);
      view.dispatch({
        changes: { from: lineObj.from, to: lineObj.from, insert: "%% " },
      });
      if (onChange) {
        onChange(currentIdRef.current, view.state.doc.toString());
      }
    },
    [editorRef, onChange, currentIdRef],
  );

  // Run AI Quick Fix
  const runAiFix = useCallback(async () => {
    if (!editorRef.current || !document) return;
    const view = editorRef.current;
    const docText = view.state.doc.toString();
    const docFmt = document.format || "mermaid";
    setFixBusy(true);

    try {
      const status = syntaxStatusRef.current;
      setFixFailMsg(null);
      const reportedError = status.raw || status.error || previewError || "";
      const result = await fixAnySyntax(docText, docFmt, reportedError);
      if (result.success && result.fixedCode && result.fixedCode !== docText) {
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: result.fixedCode },
        });
        if (onChange) {
          onChange(currentIdRef.current, result.fixedCode);
        }
        const fixSummary =
          result.fixes && result.fixes.length > 0 ? result.fixes[0] : "Repaired syntax";
        setFixSuccessMsg(fixSummary);
        setSyntaxStatus({ valid: true, error: null, line: null, raw: null });
        setShowSuggestions(false);
        setTimeout(() => setFixSuccessMsg(null), 4000);
      } else {
        setFixFailMsg("Couldn't repair this automatically. Check the highlighted line or use the Diagram assistant.");
        setTimeout(() => setFixFailMsg(null), 6000);
      }
    } catch (e) {
      console.warn("AI Quick Fix execution error:", e);
      setFixFailMsg("AI Quick Fix failed. Try again or edit the highlighted line.");
      setTimeout(() => setFixFailMsg(null), 6000);
    } finally {
      setFixBusy(false);
    }
  }, [editorRef, document, previewError, onChange, currentIdRef]);

  // Apply single line repair
  const applyLineRepair = useCallback(async () => {
    if (!editorRef.current) return;
    const view = editorRef.current;
    const docText = view.state.doc.toString();
    const status = syntaxStatusRef.current;
    setFixBusy(true);
    try {
      const lineRepair = await repairReportedLine(docText, status.raw || status.error || "");
      if (lineRepair && lineRepair.code && lineRepair.code !== docText) {
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: lineRepair.code },
        });
        if (onChange) {
          onChange(currentIdRef.current, lineRepair.code);
        }
        setFixSuccessMsg(lineRepair.fix);
        setSyntaxStatus({ valid: true, error: null, line: null, raw: null });
        setShowSuggestions(false);
        setTimeout(() => setFixSuccessMsg(null), 4000);
      } else {
        await runAiFix();
      }
    } catch (e) {
      console.warn("Line repair error:", e);
      await runAiFix();
    } finally {
      setFixBusy(false);
    }
  }, [editorRef, onChange, currentIdRef, runAiFix]);

  return {
    syntaxStatus,
    setSyntaxStatus: setSyntaxStatusSafe,
    fixBusy,
    fixSuccessMsg,
    fixFailMsg,
    showSuggestions,
    setShowSuggestions,
    explanations,
    goToLine,
    commentOutLine,
    runAiFix,
    applyLineRepair,
  };
}
// @ts-nocheck
