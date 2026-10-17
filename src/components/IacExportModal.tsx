import React, { useState, useMemo } from "react";
import {
  Code2,
  Copy,
  Check,
  Download,
  X,
  FileCode,
  Layers,
  Terminal,
  Cloud,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui.tsx";
import { generateTerraform, generateDockerCompose } from "../utils/iacSynthesizer.ts";

export default function IacExportModal({
  isOpen,
  onClose,
  source = "",
  projectName = "Architecture",
}) {
  const [activeTab, setActiveTab] = useState("terraform"); // 'terraform' | 'opentofu' | 'compose'
  const [copied, setCopied] = useState(false);

  const terraformCode = useMemo(() => {
    return generateTerraform(source, projectName);
  }, [source, projectName]);

  const dockerComposeCode = useMemo(() => {
    return generateDockerCompose(source, projectName);
  }, [source, projectName]);

  if (!isOpen) return null;

  const currentCode = activeTab === "compose" ? dockerComposeCode : terraformCode;
  const currentFilename = activeTab === "compose" ? "docker-compose.yml" : "main.tf";

  const handleCopy = () => {
    navigator.clipboard?.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = currentFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden bg-card/95 backdrop-blur-2xl border-border/80 shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-5 py-3.5 border-b border-border/80 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
              <Terminal className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Infrastructure-as-Code (IaC) Synthesis
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Synthesize production Terraform, OpenTofu, and Docker Compose configurations from your architecture.
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

        {/* Tab & Action Toolbar */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-secondary/30 border-b border-border/60 text-xs shrink-0">
          <div className="flex rounded-lg border border-border/80 bg-background/80 p-0.5">
            {[
              { id: "terraform", label: "Terraform (main.tf)" },
              { id: "opentofu", label: "OpenTofu HCL" },
              { id: "compose", label: "Docker Compose (.yml)" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`rounded-md px-3 py-1 font-medium transition ${
                  activeTab === t.id
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 font-medium text-foreground hover:bg-accent transition"
            >
              {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
              <span>{copied ? "Copied!" : "Copy Code"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 font-semibold text-primary-foreground shadow hover:bg-primary/90 transition"
            >
              <Download className="size-3.5" />
              <span>Download {currentFilename}</span>
            </button>
          </div>
        </div>

        {/* Code Viewer */}
        <div className="flex-1 min-h-0 p-4 bg-[#0a0f18] overflow-auto font-mono text-xs text-slate-200 select-text leading-relaxed">
          <pre className="m-0 p-0 whitespace-pre-wrap">{currentCode}</pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}
