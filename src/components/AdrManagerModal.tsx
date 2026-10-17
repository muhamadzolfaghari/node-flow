import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Check,
  X,
  Search,
  ExternalLink,
  Copy,
  Download,
  Link2,
  ChevronRight,
  ShieldAlert,
  Calendar,
  Users,
  Tag,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui.tsx";
import { DEFAULT_ADRS } from "../data/defaultadrs.ts";

export default function AdrManagerModal({
  isOpen,
  onClose,
  documentSource = "",
  onLinkAdrToNode,
  initialSelectedId = null,
}) {
  const [adrs, setAdrs] = useState(() => {
    try {
      const saved = localStorage.getItem("nodeflow_adrs");
      return saved ? JSON.parse(saved) : DEFAULT_ADRS;
    } catch {
      return DEFAULT_ADRS;
    }
  });

  const [selectedId, setSelectedId] = useState(initialSelectedId || "ADR-001");
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("nodeflow_adrs", JSON.stringify(adrs));
    } catch (e) {
      console.warn("Failed to persist ADRs:", e);
    }
  }, [adrs]);

  useEffect(() => {
    if (initialSelectedId && adrs.some((a) => a.id === initialSelectedId)) {
      setSelectedId(initialSelectedId);
    }
  }, [initialSelectedId, adrs]);

  if (!isOpen) return null;

  const currentAdr = adrs.find((a) => a.id === selectedId) || adrs[0];

  const handleUpdateCurrent = (field, value) => {
    setAdrs((prev) =>
      prev.map((a) => (a.id === selectedId ? { ...a, [field]: value } : a)),
    );
  };

  const handleCreateNew = () => {
    const nextNum = adrs.length + 1;
    const newId = `ADR-${String(nextNum).padStart(3, "0")}`;
    const newAdr = {
      id: newId,
      title: "New Architectural Decision",
      status: "Proposed",
      date: new Date().toISOString().split("T")[0],
      deciders: "Engineering Team",
      context: "Describe the architectural challenge or context...",
      decision: "Describe the decision and design pattern adopted...",
      consequences: "Document positive and negative consequences...",
      linkedNode: "",
    };
    setAdrs([newAdr, ...adrs]);
    setSelectedId(newId);
    setIsEditing(true);
  };

  const handleDeleteCurrent = () => {
    if (adrs.length <= 1) return;
    const nextAdrs = adrs.filter((a) => a.id !== selectedId);
    setAdrs(nextAdrs);
    setSelectedId(nextAdrs[0].id);
  };

  const handleExportMarkdown = () => {
    if (!currentAdr) return;
    const md = `# ${currentAdr.id}: ${currentAdr.title}

**Status**: ${currentAdr.status}  
**Date**: ${currentAdr.date}  
**Deciders**: ${currentAdr.deciders}  
**Linked Diagram Component**: ${currentAdr.linkedNode || "None"}  

## Context & Problem Statement
${currentAdr.context}

## Decision Outcome
${currentAdr.decision}

## Consequences
${currentAdr.consequences}
`;
    navigator.clipboard?.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusColors = {
    Accepted: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    Proposed: "border-blue-500/40 bg-blue-500/10 text-blue-400",
    Deprecated: "border-amber-500/40 bg-amber-500/10 text-amber-400",
    Rejected: "border-rose-500/40 bg-rose-500/10 text-rose-400",
  };

  const filteredAdrs = adrs.filter(
    (a) =>
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.context.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[82vh] flex flex-col p-0 overflow-hidden bg-card/95 backdrop-blur-2xl border-border/80 shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-5 py-3.5 border-b border-border/80 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
              <FileText className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Architecture Decision Records (ADRs)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Document and track architectural governance linked directly to diagram components.
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

        {/* Body Split */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border/70 overflow-hidden">
          {/* Left Panel: ADR List */}
          <div className="md:col-span-4 flex flex-col min-h-0 bg-secondary/15">
            <div className="p-3 border-b border-border/60 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search ADRs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background/80 pl-8 pr-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition shrink-0"
                title="Create new ADR"
              >
                <Plus className="size-3.5" />
                <span>New</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {filteredAdrs.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedId(item.id);
                    setIsEditing(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition flex flex-col gap-1.5 ${
                    item.id === selectedId
                      ? "border-primary/60 bg-primary/10 shadow-xs"
                      : "border-border/60 bg-background/60 hover:bg-accent/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-foreground">
                      {item.id}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        statusColors[item.status] || statusColors.Proposed
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-medium text-foreground line-clamp-1">
                    {item.title}
                  </h4>
                  {item.linkedNode && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Link2 className="size-2.5 text-cyan-400" />
                      <span>Linked: {item.linkedNode}</span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right Panel: Selected ADR Details / Editor */}
          <div className="md:col-span-8 flex flex-col min-h-0 overflow-y-auto p-5">
            {currentAdr ? (
              <div className="space-y-4">
                {/* Title & Status Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/70">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-primary">
                      {currentAdr.id}
                    </span>
                    <select
                      value={currentAdr.status}
                      onChange={(e) => handleUpdateCurrent("status", e.target.value)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                        statusColors[currentAdr.status] || statusColors.Proposed
                      } bg-background focus:outline-none`}
                    >
                      <option value="Proposed">Proposed</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Deprecated">Deprecated</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleExportMarkdown}
                      className="flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent transition"
                    >
                      {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                      <span>{copied ? "Copied" : "Copy MD"}</span>
                    </button>
                    {onLinkAdrToNode && (
                      <button
                        onClick={() => {
                          onLinkAdrToNode(currentAdr.id, currentAdr.linkedNode);
                          onClose();
                        }}
                        className="flex items-center gap-1 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-400 hover:bg-cyan-500/20 transition"
                      >
                        <Link2 className="size-3" />
                        <span>Link to Diagram</span>
                      </button>
                    )}
                    <button
                      onClick={handleDeleteCurrent}
                      className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete this ADR"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title Input */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                    Decision Title
                  </label>
                  <input
                    type="text"
                    value={currentAdr.title}
                    onChange={(e) => handleUpdateCurrent("title", e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Metadata Row: Deciders & Linked Node */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                      Deciders / Stakeholders
                    </label>
                    <input
                      type="text"
                      value={currentAdr.deciders}
                      onChange={(e) => handleUpdateCurrent("deciders", e.target.value)}
                      placeholder="e.g. Principal Architect, Tech Leads"
                      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                      Linked Diagram Node ID
                    </label>
                    <input
                      type="text"
                      value={currentAdr.linkedNode || ""}
                      onChange={(e) => handleUpdateCurrent("linkedNode", e.target.value)}
                      placeholder="e.g. kafka, auth-service"
                      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Section: Context & Problem */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                    1. Context & Problem Statement
                  </label>
                  <textarea
                    rows={3}
                    value={currentAdr.context}
                    onChange={(e) => handleUpdateCurrent("context", e.target.value)}
                    className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Section: Decision Outcome */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                    2. Decision Outcome & Chosen Architecture
                  </label>
                  <textarea
                    rows={3}
                    value={currentAdr.decision}
                    onChange={(e) => handleUpdateCurrent("decision", e.target.value)}
                    className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Section: Consequences */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                    3. Consequences (Trade-offs & Operational Impact)
                  </label>
                  <textarea
                    rows={3}
                    value={currentAdr.consequences}
                    onChange={(e) => handleUpdateCurrent("consequences", e.target.value)}
                    className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs">
                Select an ADR to view details or click New.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
