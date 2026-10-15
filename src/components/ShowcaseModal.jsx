import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Layers,
  ArrowRight,
  Database,
  Cloud,
  Shield,
  Activity,
  Check,
} from "lucide-react";
import { enterpriseStorage, SHOWCASE_CATALOG } from "../lib/indexeddb-storage.js";

export default function ShowcaseModal({
  isOpen,
  onClose,
  onLoadShowcase,
}) {
  const [showcases, setShowcases] = useState(SHOWCASE_CATALOG);
  const [selectedId, setSelectedId] = useState(SHOWCASE_CATALOG[0].id);

  useEffect(() => {
    if (!isOpen) return;
    enterpriseStorage.getShowcases().then((list) => {
      if (list?.length) setShowcases(list);
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const currentShowcase = showcases.find((s) => s.id === selectedId) || showcases[0];

  const handleOpen = () => {
    if (!currentShowcase) return;
    onLoadShowcase?.({
      name: `${currentShowcase.id}.mmd`,
      format: currentShowcase.format || "mermaid",
      source: currentShowcase.source,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md animate-in fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex h-[580px] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border/80 bg-card text-card-foreground shadow-2xl ring-1 ring-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Enterprise Reference Architectures
              </h2>
              <p className="text-xs text-muted-foreground">
                Battle-tested production architectures and industry blueprints
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

        {/* 2-Column Split: List + Preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left List */}
          <div className="md:col-span-5 border-r border-border/60 overflow-y-auto p-3 space-y-2 bg-muted/10">
            {showcases.map((sc) => {
              const isSelected = sc.id === selectedId;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedId(sc.id)}
                  className={`flex w-full flex-col rounded-xl border p-3 text-left transition ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/40"
                      : "border-border/60 hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                      {sc.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {sc.format}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-foreground line-clamp-1">
                    {sc.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                    {sc.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {sc.tags?.map((t) => (
                      <span
                        key={t}
                        className="rounded bg-muted/60 px-1.5 py-0.5 text-[9px] text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Details & Code Preview */}
          <div className="md:col-span-7 flex flex-col justify-between p-6 bg-muted/5 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  {currentShowcase.category}
                </span>
                <h3 className="text-base font-bold text-foreground mt-0.5">
                  {currentShowcase.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentShowcase.description}
                </p>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Architecture Source Preview
                </label>
                <pre className="max-h-56 overflow-y-auto rounded-xl border border-border/60 bg-black/60 p-3 font-mono text-[11px] text-emerald-400 select-all leading-relaxed">
                  {currentShowcase.source}
                </pre>
              </div>
            </div>

            <div className="pt-4 border-t border-border/60 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Opens as an editable document in your active project
              </span>
              <button
                onClick={handleOpen}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition"
              >
                <span>Load Architecture</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
