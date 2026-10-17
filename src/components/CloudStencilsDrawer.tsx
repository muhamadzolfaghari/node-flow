import React, { useState } from "react";
import {
  Cloud,
  Search,
  X,
  Plus,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { CLOUD_STENCILS } from "../lib/indexedDBStorage.ts";

const CATEGORIES = ["All", "AWS", "GCP", "Azure", "Kubernetes", "Databases", "Observability", "Security"];

export default function CloudStencilsDrawer({
  isOpen,
  onClose,
  onInsert,
}) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  if (!isOpen) return null;

  const filtered = (CLOUD_STENCILS || []).filter((s) => {
    const matchesCat = selectedCategory === "All" || s.category === selectedCategory;
    const matchesQuery =
      !searchQuery ||
      s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleInsert = (stencil) => {
    onInsert?.(stencil.codeSnippet);
    setCopiedId(stencil.id);
    setTimeout(() => setCopiedId(null), 1000);
  };

  const handleCopy = (e, stencil) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(stencil.codeSnippet);
    setCopiedId(stencil.id);
    setTimeout(() => setCopiedId(null), 1000);
  };

  return (
    <div className="absolute top-3 right-3 z-40 flex h-[calc(100%-24px)] max-h-[580px] w-80 flex-col overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-950/95 text-slate-100 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-800/80 px-3.5 py-3 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400">
            <Cloud className="size-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
              <span>Cloud & Tech Stencils</span>
              <span className="rounded-full bg-sky-500/20 px-1.5 py-0.2 text-[9px] font-mono text-sky-300">
                {filtered.length}
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">1-click insert architecture nodes</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          title="Close drawer"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="border-b border-slate-800/80 p-2.5 bg-slate-900/40">
        <div className="flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-900/90 px-2.5 py-1.5 text-xs">
          <Search className="size-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search Lambda, Kafka, GKE, Redis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-slate-400 hover:text-white text-[10px]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pt-2 pb-0.5 no-scrollbar text-[10px]">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-full px-2 py-0.5 font-medium transition ${
                selectedCategory === cat
                  ? "bg-sky-500 text-white shadow-sm font-semibold"
                  : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stencils List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filtered.map((stencil) => {
          const isCopied = copiedId === stencil.id;
          return (
            <div
              key={stencil.id}
              onClick={() => handleInsert(stencil)}
              className="group flex items-center justify-between gap-2 rounded-xl border border-slate-800/80 bg-slate-900/50 p-2 hover:bg-slate-800/80 hover:border-sky-500/40 transition cursor-pointer select-none"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-lg leading-none shrink-0">{stencil.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                    {stencil.label}
                  </p>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                    {stencil.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleCopy(e, stencil)}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-750 hover:text-slate-200 transition"
                  title="Copy snippet"
                >
                  {isCopied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInsert(stencil);
                  }}
                  className="inline-flex items-center gap-0.5 rounded-md bg-sky-500/20 px-2 py-1 text-[10px] font-semibold text-sky-300 hover:bg-sky-500/30 transition"
                  title="Insert into diagram"
                >
                  <Plus className="size-3" />
                  <span>Insert</span>
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-500">
            No stencils matching &quot;{searchQuery}&quot;
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-800/80 px-3 py-2 bg-slate-900/60 text-[10px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Sparkles className="size-3 text-sky-400" />
          Click any stencil to append to diagram
        </span>
      </div>
    </div>
  );
}
