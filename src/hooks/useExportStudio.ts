import { useState, useEffect, useRef, useCallback } from "react";
import { Exporter } from "../components/exporter.ts";
import { generateBackstageCatalog } from "../utils/backstageExporter.ts";

/**
 * Custom hook encapsulating export studio state, live preview generation,
 * clipboard interactions, and file downloads.
 */
export function useExportStudio({
  isOpen,
  onClose,
  containerRef,
  title = "diagram",
  source = "",
  format = "mermaid",
}) {
  const [background, setBackground] = useState("transparent");
  const [padding, setPadding] = useState(32);
  const [scale, setScale] = useState(2);
  const [embedSource, setEmbedSource] = useState(true);
  const [copiedKind, setCopiedKind] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [previewSvg, setPreviewSvg] = useState("");
  const previewRef = useRef(null);

  // Helper to normalize background color for exporter
  const getExportBg = useCallback((bg) => {
    if (bg === "transparent") return "transparent";
    if (bg.startsWith("radial")) return "#080c14";
    return bg;
  }, []);

  // Generate real-time preview SVG
  useEffect(() => {
    if (!isOpen || !containerRef?.current) return;
    try {
      const svgEl = containerRef.current.querySelector("svg");
      if (!svgEl) return;
      const cleanSvg = Exporter.getCleanSvgString(svgEl, {
        background: getExportBg(background),
        padding,
        source: embedSource ? source : null,
        format,
      });
      setPreviewSvg(cleanSvg);
    } catch (err) {
      console.warn("Failed to generate preview SVG:", err);
    }
  }, [isOpen, background, padding, embedSource, source, format, containerRef, getExportBg]);

  // Close modal on Escape key
  useEffect(() => {
    if (!isOpen || !onClose) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopyPng = useCallback(async () => {
    if (!containerRef?.current) return;
    try {
      setIsExporting(true);
      await Exporter.copyImageToClipboard(containerRef.current, {
        scale,
        background: getExportBg(background),
        padding,
      });
      setCopiedKind("png");
      setTimeout(() => setCopiedKind(null), 2000);
    } catch (e) {
      alert(e.message || "Failed to copy image to clipboard");
    } finally {
      setIsExporting(false);
    }
  }, [containerRef, scale, background, padding, getExportBg]);

  const handleCopySvg = useCallback(async () => {
    if (!containerRef?.current) return;
    try {
      setIsExporting(true);
      const svgEl = containerRef.current.querySelector("svg");
      if (!svgEl) throw new Error("No diagram SVG found");
      const cleanSvg = Exporter.getCleanSvgString(svgEl, {
        background: getExportBg(background),
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
  }, [containerRef, background, padding, embedSource, source, format, getExportBg]);

  const handleDownloadPng = useCallback(async () => {
    if (!containerRef?.current) return;
    try {
      setIsExporting(true);
      await Exporter.downloadPng(containerRef.current, title, {
        scale,
        background: getExportBg(background),
        padding,
      });
    } catch (e) {
      alert(e.message || "Failed to export PNG");
    } finally {
      setIsExporting(false);
    }
  }, [containerRef, title, scale, background, padding, getExportBg]);

  const handleDownloadSvg = useCallback(() => {
    if (!containerRef?.current) return;
    try {
      Exporter.downloadSvg(containerRef.current, title, {
        background: getExportBg(background),
        padding,
        source: embedSource ? source : null,
        format,
      });
    } catch (e) {
      alert(e.message || "Failed to export SVG");
    }
  }, [containerRef, title, background, padding, embedSource, source, format, getExportBg]);

  const handleDownloadPdf = useCallback(async () => {
    if (!containerRef?.current) return;
    try {
      setIsExporting(true);
      await Exporter.downloadPdf(containerRef.current, title, {
        background: background === "transparent" ? "#ffffff" : getExportBg(background),
      });
    } catch (e) {
      alert(e.message || "Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  }, [containerRef, title, background, getExportBg]);

  const handleDownloadBackstage = useCallback(() => {
    try {
      const yaml = generateBackstageCatalog(source, title);
      const blob = new Blob([yaml], { type: "text/yaml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "catalog-info.yaml";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e.message || "Failed to export Backstage catalog");
    }
  }, [source, title]);

  return {
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
    previewSvg,
    previewRef,
    handleCopyPng,
    handleCopySvg,
    handleDownloadPng,
    handleDownloadSvg,
    handleDownloadPdf,
    handleDownloadBackstage,
  };
}
// @ts-nocheck
