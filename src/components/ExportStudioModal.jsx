import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Download,
  Copy,
  Check,
  Sparkles,
  Maximize2,
  FileImage,
  FileCode,
  FileText,
  Sliders,
  Palette,
  Layers,
  ZoomIn,
} from "lucide-react";
import { Exporter } from "./exporter.js";

const BACKGROUND_OPTIONS = [
  { id: "transparent", label: "Transparent", value: "transparent", color: "border-dashed border-muted-foreground/40 bg-transparent" },
  { id: "dark", label: "Studio Dark", value: "#080c14", color: "bg-[#080c14]" },
  { id: "slate", label: "Slate Navy", value: "#0f172a", color: "bg-[#0f172a]" },
  { id: "white", label: "Crisp Paper", value: "#ffffff", color: "bg-white border-slate-300" },
  { id: "blueprint", label: "Blueprint Grid", value: "#0b1e36", color: "bg-[#0b1e36] ring-1 ring-cyan-500/30" },
  { id: "ambient", label: "Ambient Glow", value: "radial-gradient(ellipse at 50% 50%, #172554 0%, #030712 100%)", color: "bg-gradient-to-br from-indigo-950 via-slate-900 to-black" },
];

const PADDING_OPTIONS = [
  { label: "0px", value: 0 },
  { label: "16px", value: 16 },
  { label: "32px", value: 32 },
  { label: "64px", value: 64 },
];

const SCALE_OPTIONS = [
  { label: "1× Standard", value: 1 },
  { label: "2× Retina (HD)", value: 2 },
  { label: "4× Ultra HD 4K", value: 4 },
];

export default function ExportStudioModal({
  isOpen,
  onClose,
  containerRef,
  title = "diagram",
  source = "",
  format = "mermaid",
  currentTheme = "dark",
}) {
  const [background, setBackground] = useState("transparent");
  const [padding, setPadding] = useState(32);
  const [scale, setScale] = useState(2);
  const [embedSource, setEmbedSource] = useState(true);
  const [copiedKind, setCopiedKind] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [previewSvg, setPreviewSvg] = useState("");
  const previewRef = useRef(null);

  // Generate real-time preview SVG
  useEffect(() => {
    if (!isOpen || !containerRef?.current) return;
    try {
      const svgEl = containerRef.current.querySelector("svg");
      if (!svgEl) return;
      const cleanSvg = Exporter.getCleanSvgString(svgEl, {
        background: background === "transparent" ? "transparent" : background.startsWith("radial") ? "#080c14" : background,
        padding,
        source: embedSource ? source : null,
        format,
      });
      setPreviewSvg(cleanSvg);
    } catch (err) {
      console.warn("Failed to generate preview SVG:", err);
    }
  }, [isOpen, background, padding, embedSource, source, format, containerRef]);

  if (!isOpen) return null;

  const handleCopyPng = async () => {
    if (!containerRef?.current) return;
    try {
      setIsExporting(true);
      await Exporter.copyImageToClipboard(containerRef.current, {
        scale,
        background: background === "transparent" ? "transparent" : background.startsWith("radial") ? "#080c14" : background,
        padding,
      });
      setCopiedKind("png");
      setTimeout(() => setCopiedKind(null), 2000);
    } catch (e) {
      alert(e.message || "Failed to copy image to clipboard");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopySvg = async () => {
    if (!containerRef?.current) return;
    try {
      setIsExporting(true);
      const svgEl = containerRef.current.querySelector("svg");
      if (!svgEl) throw new Error("No diagram SVG found");
      const cleanSvg = Exporter.getCleanSvgString(svgEl, {
        background: background === "transparent" ? "transparent" : background.startsWith("radial") ? "#080c14" : background,
        padding,
        source: embedSource ? source : null,
        format,
      });
      await navigator.clipboard.writeText(cleanSvg);
      setCopiedKind("svg");
      setTimeout(() => setCopiedKind(null), 2000);
    } catch (e) {
      alert(e.message || "Failed to copy SVG to clipboard");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPng = async () => {
    if (!containerRef?.current) return;
    try {
      setIsExporting(true);
      await Exporter.downloadPng(containerRef.current, title, {
        scale,
        background: background === "transparent" ? "transparent" : background.startsWith("radial") ? "#080c14" : background,
        padding,
      });
    } catch (e) {
      alert(e.message || "Failed to export PNG");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadSvg = () => {
    if (!containerRef?.current) return;
    try {
      Exporter.downloadSvg(containerRef.current, title, {
        background: background === "transparent" ? "transparent" : background.startsWith("radial") ? "#080c14" : background,
        padding,
        source: embedSource ? source : null,
        format,
      });
    } catch (e) {
      alert(e.message || "Failed to export SVG");
    }
  };

  const handleDownloadPdf = async () => {
    if (!containerRef?.current) return;
    try {
      setIsExporting(true);
      await Exporter.downloadPdf(containerRef.current, title, {
        background: background === "transparent" ? "#ffffff" : background.startsWith("radial") ? "#080c14" : background,
      });
    } catch (e) {
      alert(e.message || "Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

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
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition"
            title="Close (Esc)"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="grid flex-1 grid-cols-1 md:grid-cols-12 overflow-y-auto min-h-0">
          {/* Live Preview Column */}
          <div className="md:col-span-7 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border/60 bg-muted/20 p-6 min-h-[300px]">
            <div
              className="relative flex size-full max-h-[460px] items-center justify-center overflow-hidden rounded-xl border border-border/50 shadow-inner"
              style={{
                background:
                  background === "transparent"
                    ? "radial-gradient(#94a3b8 1px, transparent 1px) 0 0 / 16px 16px, #0b0f17"
                    : background,
              }}
            >
              {previewSvg ? (
                <div
                  ref={previewRef}
                  className="flex size-full items-center justify-center p-4 [&>svg]:max-h-full [&>svg]:max-w-full [&>svg]:object-contain"
                  dangerouslySetInnerHTML={{ __html: previewSvg }}
                />
              ) : (
                <span className="text-xs text-muted-foreground">No active diagram preview</span>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between w-full px-1 text-[11px] text-muted-foreground font-mono">
              <span>{title}</span>
              <span>Scale: {scale}× • Pad: {padding}px</span>
            </div>
          </div>

          {/* Settings Column */}
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
                      onClick={() => setBackground(bg.value)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition ${
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
                      onClick={() => setPadding(pad.value)}
                      className={`rounded-md py-1 text-xs font-medium transition ${
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
                      onClick={() => setScale(sc.value)}
                      className={`rounded-md py-1 text-xs font-medium transition ${
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
                  onClick={handleCopyPng}
                  disabled={isExporting}
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground shadow-sm hover:bg-accent transition"
                >
                  {copiedKind === "png" ? (
                    <Check className="size-4 text-emerald-500" />
                  ) : (
                    <Copy className="size-4 text-primary" />
                  )}
                  {copiedKind === "png" ? "Copied PNG!" : "Copy PNG"}
                </button>
                <button
                  onClick={handleCopySvg}
                  disabled={isExporting}
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground shadow-sm hover:bg-accent transition"
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
                  onClick={handleDownloadSvg}
                  disabled={isExporting}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition"
                >
                  <Download className="size-3.5" /> SVG
                </button>
                <button
                  onClick={handleDownloadPng}
                  disabled={isExporting}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-cyan-600 px-3 py-2 text-xs font-semibold text-white shadow-md hover:bg-cyan-500 transition"
                >
                  <Download className="size-3.5" /> PNG ({scale}×)
                </button>
                <button
                  onClick={handleDownloadPdf}
                  disabled={isExporting}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
                >
                  <FileText className="size-3.5 text-rose-400" /> PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
