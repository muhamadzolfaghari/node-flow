import React, { useState } from "react";
import {
  X,
  Search,
  Cloud,
  Server,
  Database,
  Shield,
  Layers,
  Plus,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { CLOUD_STENCILS } from "../lib/indexeddb-storage.js";

const CATEGORIES = ["All", "AWS", "GCP", "Azure", "Kubernetes", "Databases", "Observability", "Security"];

export default function CloudStencilModal({
  isOpen,
  onClose,
  onInsertStencil,
}) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  if (!isOpen) return null;

  const filteredStencils = CLOUD_STENCILS.filter((s) => {
    const matchesCat = selectedCategory === "All" || s.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleInsert = (stencil) => {
    onInsertStencil?.(stencil.codeSnippet);
    setCopiedId(stencil.id);
    setTimeout(() => {
      setCopiedId(null);
      onClose();
    }, 400);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex h-[560px] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border/80 bg-card text-card-foreground shadow-2xl ring-1 ring-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Cloud className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Cloud & Architecture Stencils</h2>
              <p className="text-xs text-muted-foreground">
                One-click cloud provider and infrastructure components for diagrams
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="border-b border-border/60 p-3 space-y-2 bg-muted/20">
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-1.5">
            <Search className="size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search cloud stencils (e.g. Lambda, S3, Kubernetes, BigQuery)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              autoFocus
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-2.5 py-1 font-medium transition ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Stencils Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {filteredStencils.map((stencil) => (
              <button
                key={stencil.id}
                onClick={() => handleInsert(stencil)}
                className="group flex flex-col justify-between rounded-xl border border-border/60 bg-muted/20 p-3 text-left hover:border-primary/50 hover:bg-primary/5 hover:shadow-md transition text-xs relative"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xl leading-none mb-2">{stencil.icon}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground uppercase">
                    {stencil.category}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-foreground group-hover:text-primary transition block">
                    {stencil.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate block">
                    {stencil.codeSnippet.trim()}
                  </span>
                </div>
                <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-border/40 text-[10px] text-primary font-medium">
                  <span>{copiedId === stencil.id ? "Inserted!" : "Insert into diagram"}</span>
                  {copiedId === stencil.id ? (
                    <Check className="size-3 text-emerald-400" />
                  ) : (
                    <Plus className="size-3 group-hover:translate-x-0.5 transition" />
                  )}
                </div>
              </button>
            ))}
          </div>
          {filteredStencils.length === 0 && (
            <div className="py-16 text-center text-xs text-muted-foreground">
              No matching cloud stencils found for "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
