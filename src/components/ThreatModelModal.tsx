import React, { useState, useMemo } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  AlertTriangle,
  Download,
  Copy,
  Check,
  X,
  FileText,
  Filter,
  Layers,
  ArrowRight,
  Server,
  Database,
  Globe,
} from "lucide-react";
import { Button, Badge, Input } from "./ui.tsx";

import { STRIDE_CATEGORIES, analyzeDiagramThreats } from "../utils/threat-model-analyzer.js";

export default function ThreatModelModal({ isOpen, onClose, diagramSource, diagramName = "Architecture" }) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedSeverity, setSelectedSeverity] = useState("ALL");
  const [copied, setCopied] = useState(false);

  const analysis = useMemo(() => {
    return analyzeDiagramThreats(diagramSource || "");
  }, [diagramSource]);

  const filteredFindings = useMemo(() => {
    return analysis.findings.filter((f) => {
      const matchCat = selectedCategory === "ALL" || f.categoryKey === selectedCategory;
      const matchSev = selectedSeverity === "ALL" || f.severity === selectedSeverity;
      return matchCat && matchSev;
    });
  }, [analysis.findings, selectedCategory, selectedSeverity]);

  if (!isOpen) return null;

  // Export full markdown audit report
  const generateMarkdownReport = () => {
    const reportDate = new Date().toISOString().split("T")[0];
    let md = `# Enterprise Threat Model & STRIDE Compliance Report\n\n`;
    md += `**Target System**: ${diagramName}\n`;
    md += `**Audit Date**: ${reportDate}\n`;
    md += `**Compliance Score**: ${analysis.score}/100\n`;
    md += `**Topology Inspected**: ${analysis.nodesCount} Nodes, ${analysis.edgesCount} Connections, ${analysis.subgraphsCount} Trust Boundaries\n\n`;
    md += `## Executive Summary\n\n`;
    md += `- **Critical Risks**: ${analysis.summary.critical}\n`;
    md += `- **High Risks**: ${analysis.summary.high}\n`;
    md += `- **Medium Risks**: ${analysis.summary.medium}\n`;
    md += `- **Low Risks**: ${analysis.summary.low}\n\n`;
    md += `## STRIDE Findings & Remediation Plan\n\n`;

    analysis.findings.forEach((f, idx) => {
      md += `### ${idx + 1}. [${f.severity.toUpperCase()}] ${f.title} (${f.category.name})\n`;
      md += `- **Target Component**: \`${f.target}\`\n`;
      md += `- **Potential Impact**: ${f.impact}\n`;
      md += `- **Recommended Mitigation**: ${f.mitigation}\n\n`;
    });

    md += `---\n*Generated 100% locally by NodeFlow Architecture Studio Enterprise Threat Modeling Suite.*`;
    return md;
  };

  const handleCopyReport = () => {
    navigator.clipboard?.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const blob = new Blob([generateMarkdownReport()], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `threat-model-${diagramName.toLowerCase().replace(/[^a-z0-9]/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div className="flex h-full max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-border/80 bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
              <Shield className="size-5" />
            </div>
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                STRIDE Threat Model & Compliance Analyzer
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-emerald-500 border-emerald-500/30">
                  Enterprise
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">
                Automated security architecture review based on OWASP & Microsoft STRIDE threat matrices.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close threat model"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Score & Topology Bar */}
        <div className="grid grid-cols-2 gap-4 border-b border-border/60 bg-secondary/20 p-5 sm:grid-cols-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Compliance Score
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold ${
                  analysis.score >= 80
                    ? "text-emerald-500"
                    : analysis.score >= 60
                    ? "text-amber-500"
                    : "text-rose-500"
                }`}
              >
                {analysis.score}%
              </span>
              <span className="text-xs text-muted-foreground">
                {analysis.score >= 80 ? "SOC2 Ready" : "Remediation Advised"}
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Critical & High Risks
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {analysis.summary.critical + analysis.summary.high}
              </span>
              <span className="text-xs text-rose-500 font-medium">
                ({analysis.summary.critical} Critical, {analysis.summary.high} High)
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Medium & Low Risks
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {analysis.summary.medium + analysis.summary.low}
              </span>
              <span className="text-xs text-muted-foreground">
                ({analysis.summary.medium} Med, {analysis.summary.low} Low)
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Inspected Topology
            </span>
            <div className="mt-1 flex items-baseline gap-2 text-xs text-muted-foreground">
              <span className="text-sm font-semibold text-foreground">
                {analysis.nodesCount}
              </span>{" "}
              nodes ·{" "}
              <span className="text-sm font-semibold text-foreground">
                {analysis.edgesCount}
              </span>{" "}
              links
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-6 py-2.5 bg-muted/10 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-muted-foreground font-medium flex items-center gap-1">
              <Filter className="size-3" /> STRIDE:
            </span>
            {["ALL", "S", "T", "R", "I", "D", "E"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded px-2 py-0.5 font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {cat === "ALL" ? "All" : `${cat} (${STRIDE_CATEGORIES[cat].name})`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="mr-1 text-muted-foreground font-medium">Severity:</span>
            {["ALL", "Critical", "High", "Medium", "Low"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`rounded px-2 py-0.5 font-medium transition-colors ${
                  selectedSeverity === sev
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Findings List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredFindings.map((finding) => (
            <div
              key={finding.id}
              className="rounded-lg border border-border/70 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`font-semibold text-[10px] ${
                      finding.severity === "Critical"
                        ? "border-rose-500/40 bg-rose-500/10 text-rose-500"
                        : finding.severity === "High"
                        ? "border-orange-500/40 bg-orange-500/10 text-orange-500"
                        : finding.severity === "Medium"
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-500"
                        : "border-sky-500/40 bg-sky-500/10 text-sky-500"
                    }`}
                  >
                    {finding.severity}
                  </Badge>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    [{finding.categoryKey}] {finding.category.title}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-muted-foreground/80 bg-muted/60 px-2 py-0.5 rounded">
                  Target: <span className="text-foreground font-semibold">{finding.target}</span>
                </div>
              </div>

              <h3 className="mt-2 text-sm font-semibold text-foreground">
                {finding.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {finding.impact}
              </p>

              <div className="mt-3 flex items-start gap-2 rounded-md bg-emerald-500/5 border border-emerald-500/20 p-2.5 text-xs text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="size-4 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <span className="font-semibold text-foreground">Recommended Mitigation: </span>
                  {finding.mitigation}
                </div>
              </div>
            </div>
          ))}

          {filteredFindings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <ShieldCheck className="size-12 text-emerald-500/60 mb-3" />
              <p className="text-sm font-medium text-foreground">No matching threat vectors detected</p>
              <p className="text-xs mt-1">The filtered topology adheres to baseline security criteria.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-6 py-3.5">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Lock className="size-3.5 text-emerald-500" />
            <span>100% Client-Side Privacy: No diagram data sent to external servers.</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyReport} className="text-xs gap-1.5">
              {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              {copied ? "Copied Report" : "Copy Markdown"}
            </Button>
            <Button size="sm" onClick={handleDownloadReport} className="text-xs gap-1.5">
              <Download className="size-3.5" />
              Download Audit Report (.md)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
