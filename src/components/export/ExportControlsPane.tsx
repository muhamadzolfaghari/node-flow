import React from "react";
import {
  Palette,
  Sliders,
  ZoomIn,
  Check,
  Copy,
  FileCode,
  Download,
  FileText,
  Layers,
} from "lucide-react";
import {
  BACKGROUND_OPTIONS,
  PADDING_OPTIONS,
  SCALE_OPTIONS,
} from "../../data/exportoptions.ts";

export function ExportControlsPane({
  background,
  setBackground,
  padding,
  setPadding,
  scale,
  setScale,
  embedSource,
  setEmbedSource,
  copiedKind,
  isExporting,
  handleCopyPng,
  handleCopySvg,
  handleDownloadSvg,
  handleDownloadPng,
  handleDownloadPdf,
  handleDownloadBackstage,
}) {
  return (
    <div className="md:col-span-5 flex flex-col justify-between p-6 space-y-6">
      <div className="space-y-5">
        {/* Background Picker */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2.5">
            <Palette className="size-3.5 text-primary" /> Canvas Background
          </label>
          <div className="grid grid-cols-3 gap-2">
            {BACKGROUND_OPTIONS.map((bg) => (
              <button
                key={bg.id}
                type="button"
                onClick={() => setBackground(bg.value)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition cursor-pointer ${
                  background === bg.value
                    ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                    : "border-border/60 hover:bg-muted/40"
                }`}
              >
                <div className={`size-5 rounded-full border shadow-sm ${bg.color}`} />
                <span className="text-[11px] font-medium leading-tight">{bg.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Padding Selector */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
            <Sliders className="size-3.5 text-primary" /> Canvas Margins / Padding
          </label>
          <div className="grid grid-cols-4 gap-1.5 rounded-lg border border-border/60 bg-muted/30 p-1">
            {PADDING_OPTIONS.map((pad) => (
              <button
                key={pad.value}
                type="button"
                onClick={() => setPadding(pad.value)}
                className={`rounded-md py-1 text-xs font-medium transition cursor-pointer ${
                  padding === pad.value
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {pad.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resolution Scale */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
            <ZoomIn className="size-3.5 text-primary" /> Resolution & Scale
          </label>
          <div className="grid grid-cols-3 gap-1.5 rounded-lg border border-border/60 bg-muted/30 p-1">
            {SCALE_OPTIONS.map((sc) => (
              <button
                key={sc.value}
                type="button"
                onClick={() => setScale(sc.value)}
                className={`rounded-md py-1 text-xs font-medium transition cursor-pointer ${
                  scale === sc.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Embed Source Switch */}
        <label className="flex items-center gap-2.5 rounded-xl border border-border/60 p-3 hover:bg-muted/30 cursor-pointer transition">
          <input
            type="checkbox"
            checked={embedSource}
            onChange={(e) => setEmbedSource(e.target.checked)}
            className="rounded border-border text-primary focus:ring-primary size-4"
          />
          <div className="text-xs">
            <div className="font-medium text-foreground">Embed Diagram Source into SVG</div>
            <div className="text-muted-foreground text-[11px]">
              Allows exported .svg files to be dropped back in to resume editing.
            </div>
          </div>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-2 border-t border-border/60">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCopyPng}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground shadow-sm hover:bg-accent transition cursor-pointer disabled:opacity-50"
          >
            {copiedKind === "png" ? (
              <Check className="size-4 text-emerald-500" />
            ) : (
              <Copy className="size-4 text-primary" />
            )}
            {copiedKind === "png" ? "Copied PNG!" : "Copy PNG"}
          </button>
          <button
            type="button"
            onClick={handleCopySvg}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground shadow-sm hover:bg-accent transition cursor-pointer disabled:opacity-50"
          >
            {copiedKind === "svg" ? (
              <Check className="size-4 text-emerald-500" />
            ) : (
              <FileCode className="size-4 text-cyan-400" />
            )}
            {copiedKind === "svg" ? "Copied SVG!" : "Copy SVG"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={handleDownloadSvg}
            disabled={isExporting}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition cursor-pointer disabled:opacity-50"
          >
            <Download className="size-3.5" /> SVG
          </button>
          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={isExporting}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-cyan-600 px-3 py-2 text-xs font-semibold text-white shadow-md hover:bg-cyan-500 transition cursor-pointer disabled:opacity-50"
          >
            <Download className="size-3.5" /> PNG ({scale}×)
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition cursor-pointer disabled:opacity-50"
          >
            <FileText className="size-3.5 text-rose-400" /> PDF
          </button>
        </div>

        <button
          type="button"
          onClick={handleDownloadBackstage}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition w-full shadow-xs cursor-pointer disabled:opacity-50"
        >
          <Layers className="size-4" />
          <span>Export Backstage (catalog-info.yaml)</span>
        </button>
      </div>
    </div>
  );
}
