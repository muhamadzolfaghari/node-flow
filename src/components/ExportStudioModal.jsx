import React from "react";
import { X, Sparkles } from "lucide-react";
import { useExportStudio } from "../hooks/useExportStudio.js";
import { ExportPreviewPane } from "./export/ExportPreviewPane.jsx";
import { ExportControlsPane } from "./export/ExportControlsPane.jsx";

export default function ExportStudioModal({
  isOpen,
  onClose,
  containerRef,
  title = "diagram",
  source = "",
  format = "mermaid",
}) {
  const exportStudio = useExportStudio({
    isOpen,
    onClose,
    containerRef,
    title,
    source,
    format,
  });

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-700/60 bg-card text-card-foreground shadow-2xl ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Export Studio
              </h2>
              <p className="text-xs text-muted-foreground">
                Customize canvas styling, resolution, and padding for publication-ready diagrams
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition cursor-pointer"
            title="Close (Esc)"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body: Composed Presentational Panes */}
        <div className="grid flex-1 grid-cols-1 md:grid-cols-12 overflow-y-auto min-h-0">
          <ExportPreviewPane
            background={exportStudio.background}
            previewSvg={exportStudio.previewSvg}
            previewRef={exportStudio.previewRef}
            title={title}
            scale={exportStudio.scale}
            padding={exportStudio.padding}
          />
          <ExportControlsPane
            background={exportStudio.background}
            setBackground={exportStudio.setBackground}
            padding={exportStudio.padding}
            setPadding={exportStudio.setPadding}
            scale={exportStudio.scale}
            setScale={exportStudio.setScale}
            embedSource={exportStudio.embedSource}
            setEmbedSource={exportStudio.setEmbedSource}
            copiedKind={exportStudio.copiedKind}
            isExporting={exportStudio.isExporting}
            handleCopyPng={exportStudio.handleCopyPng}
            handleCopySvg={exportStudio.handleCopySvg}
            handleDownloadSvg={exportStudio.handleDownloadSvg}
            handleDownloadPng={exportStudio.handleDownloadPng}
            handleDownloadPdf={exportStudio.handleDownloadPdf}
            handleDownloadBackstage={exportStudio.handleDownloadBackstage}
          />
        </div>
      </div>
    </div>
  );
}
