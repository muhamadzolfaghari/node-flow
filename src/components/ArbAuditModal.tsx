import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Award,
  CheckCircle2,
  X,
  Copy,
  Check,
  Download,
  Layers,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui.tsx";
import { runArbAudit } from "../utils/arbAuditor.ts";

export default function ArbAuditModal({
  isOpen,
  onClose,
  source = "",
  projectName = "Architecture",
}) {
  const [copied, setCopied] = useState(false);

  const audit = useMemo(() => {
    return runArbAudit(source);
  }, [source]);

  if (!isOpen) return null;

  const generateMarkdownReport = () => {
    const reportDate = new Date().toISOString().split("T")[0];
    let md = `# Architecture Review Board (ARB) Well-Architected Audit Report\n\n`;
    md += `**Target System**: ${projectName}\n`;
    md += `**Audit Date**: ${reportDate}\n`;
    md += `**ARB Readiness Score**: ${audit.score}/100 (${audit.grade})\n`;
    md += `**Topology Inspected**: ${audit.nodesCount} Nodes, ${audit.edgesCount} Connections\n\n`;
    md += `## Executive Summary\n\n`;
    md += `The system architecture was audited against the 6 enterprise Well-Architected pillars (Security & Zero-Trust, Reliability, Operational Excellence, Performance, Cost, Governance).\n\n`;
    md += `## Findings & Remediation Plan\n\n`;

    if (audit.findings.length === 0) {
      md += `*No architectural violations detected. System meets 100% of Well-Architected criteria.*\n\n`;
    } else {
      audit.findings.forEach((f, idx) => {
        md += `### ${idx + 1}. [${f.severity.toUpperCase()}] ${f.title} (${f.pillar})\n`;
        md += `- **Finding**: ${f.description}\n`;
        md += `- **Remediation**: ${f.remediation}\n\n`;
      });
    }

    md += `---\n*Generated 100% locally by NodeFlow Architecture Studio ARB Audit Engine.*`;
    return md;
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generateMarkdownReport()], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `arb-audit-${projectName.toLowerCase().replace(/[^a-z0-9]/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const severityBadges = {
    critical: "border-rose-500/40 bg-rose-500/10 text-rose-400",
    high: "border-amber-500/40 bg-amber-500/10 text-amber-400",
    medium: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400",
    low: "border-blue-500/40 bg-blue-500/10 text-blue-400",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden bg-card/95 backdrop-blur-2xl border-border/80 shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-5 py-3.5 border-b border-border/80 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
              <Award className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Architecture Review Board (ARB) Auditor
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Automated 6-pillar enterprise Well-Architected compliance audit with letter grade scoring.
              </DialogDescription>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition"
          >
            <X className="size-4" />
          </button>
        </DialogHeader>

        {/* Score Card Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-secondary/30 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-4">
            <div className={`flex size-14 items-center justify-center rounded-2xl border-2 font-mono text-xl font-bold shadow-lg ${
              audit.score >= 80
                ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-400 shadow-emerald-500/20"
                : audit.score >= 65
                  ? "border-amber-500/60 bg-amber-500/15 text-amber-400 shadow-amber-500/20"
                  : "border-rose-500/60 bg-rose-500/15 text-rose-400 shadow-rose-500/20"
            }`}>
              {audit.score}
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                ARB Compliance Grade
              </div>
              <div className="text-base font-bold text-foreground">
                {audit.grade}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {audit.nodesCount} nodes, {audit.edgesCount} connections inspected
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition"
            >
              {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
              <span>{copied ? "Copied Report" : "Copy Report"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 transition"
            >
              <Download className="size-3.5" />
              <span>Download Audit (.md)</span>
            </button>
          </div>
        </div>

        {/* Findings List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Well-Architected Findings & Remediation Plan ({audit.findings.length})
          </span>

          {audit.findings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-56 text-center text-xs text-muted-foreground">
              <CheckCircle2 className="size-10 text-emerald-400 mb-2" />
              <span className="font-semibold text-foreground text-sm">Exemplary Architecture!</span>
              <span>All 6 Well-Architected governance pillars passed successfully with 0 violations.</span>
            </div>
          ) : (
            audit.findings.map((f, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-border/80 bg-background/60 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        severityBadges[f.severity] || severityBadges.medium
                      }`}
                    >
                      {f.severity}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {f.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {f.pillar}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {f.description}
                </p>

                <div className="flex items-start gap-1.5 pt-1 border-t border-border/50 text-xs text-emerald-400 font-medium">
                  <ArrowRight className="size-3.5 mt-0.5 shrink-0" />
                  <span>Remediation: {f.remediation}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
