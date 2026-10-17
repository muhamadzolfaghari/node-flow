import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Pencil,
  Check,
  Shapes,
  Palette,
  Plus,
  Copy,
  Trash2,
  ArrowUpRight,
  ChevronDown,
  Layers,
  Sparkles,
} from "lucide-react";
import { SHAPES, flowchartNodeId } from "../lib/visualEditing.ts";

const MOBILE_COLOR_PRESETS = [
  { id: "default", name: "Default", bg: "#64748b", ring: "ring-slate-400" },
  { id: "blue", name: "Sky Blue", bg: "#3b82f6", ring: "ring-blue-400" },
  { id: "emerald", name: "Emerald", bg: "#10b981", ring: "ring-emerald-400" },
  { id: "amber", name: "Amber", bg: "#f59e0b", ring: "ring-amber-400" },
  { id: "rose", name: "Rose", bg: "#f43f5e", ring: "ring-rose-400" },
  { id: "violet", name: "Violet", bg: "#8b5cf6", ring: "ring-violet-400" },
  { id: "cyan", name: "Cyan", bg: "#06b6d4", ring: "ring-cyan-400" },
  { id: "slate", name: "Dark Slate", bg: "#1e293b", ring: "ring-slate-300" },
];

const QUICK_SHAPES = [
  { id: "rectangle", name: "Rect", icon: "▢" },
  { id: "rounded", name: "Rounded", icon: "⌢" },
  { id: "diamond", name: "Decision", icon: "◇" },
  { id: "cylinder", name: "Database", icon: "⌗" },
  { id: "circle", name: "Circle", icon: "○" },
  { id: "hexagon", name: "Hexagon", icon: "⬡" },
];

export default function MobileNodeSheet({
  isOpen,
  node,
  onClose,
  onRename,
  onChangeShape,
  onStyleNode,
  onAddChild,
  onDuplicate,
  onDelete,
  onDrillDown,
  drillDownDocId = null,
  isFlowchart = true,
}) {
  const [activeTab, setActiveTab] = useState("rename"); // 'rename' | 'style' | 'connect'
  const [label, setLabel] = useState("");
  const [connectLabel, setConnectLabel] = useState("Next step");
  const [arrowType, setArrowType] = useState("-->");
  const inputRef = useRef(null);

  useEffect(() => {
    if (node) {
      setLabel(node.label || node.id || "");
    }
  }, [node]);

  if (!isOpen || !node) return null;

  const rawNodeId = flowchartNodeId(node.id);

  const handleSaveRename = (e) => {
    e?.preventDefault();
    if (label.trim()) {
      onRename?.(label.trim());
      onClose?.();
    }
  };

  const handleAddConnected = () => {
    if (connectLabel.trim()) {
      onAddChild?.(connectLabel.trim(), arrowType);
      onClose?.();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Edit node ${node.label || node.id}`}
      className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl border-t border-border/80 bg-popover/98 p-4 shadow-2xl backdrop-blur-2xl transition-all animate-in slide-in-from-bottom duration-200 select-none max-h-[85vh] overflow-y-auto"
      style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Drag handle */}
      <div className="mx-auto mb-2.5 h-1.5 w-12 rounded-full bg-muted-foreground/30" />

      {/* Sheet Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex size-2 rounded-full bg-primary shrink-0 animate-pulse" />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {node.label || `Node: ${rawNodeId}`}
            </h3>
            <span className="text-[10px] text-muted-foreground font-mono">
              ID: {rawNodeId}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition touch-manipulation"
          aria-label="Close sheet"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Segmented Sub-Tabs */}
      <div className="flex rounded-lg border border-border/80 bg-secondary/30 p-1 my-3">
        {[
          { id: "rename", label: "Edit Label", icon: Pencil },
          { id: "style", label: "Shape & Color", icon: Palette },
          { id: "connect", label: "Connect", icon: Plus },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition touch-manipulation ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Rename */}
      {activeTab === "rename" && (
        <form onSubmit={handleSaveRename} className="flex flex-col gap-3 py-1">
          <label className="text-xs font-medium text-muted-foreground">
            Node Label / Text
          </label>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter node text..."
              autoFocus
            />
            <button
              type="submit"
              disabled={!label.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow transition active:scale-95 disabled:opacity-50 touch-manipulation"
            >
              <Check className="size-4" />
              <span>Save</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab: Shape & Color */}
      {activeTab === "style" && (
        <div className="flex flex-col gap-3 py-1">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Node Shape
            </label>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_SHAPES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    onChangeShape?.(s.id);
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background/60 p-2 text-xs font-medium text-foreground hover:border-primary/60 hover:bg-accent transition active:scale-95 touch-manipulation"
                >
                  <span className="text-base leading-none text-primary">{s.icon}</span>
                  <span className="truncate">{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Color Preset
            </label>
            <div className="grid grid-cols-4 gap-2">
              {MOBILE_COLOR_PRESETS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onStyleNode?.(c.id);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-border bg-background/60 p-2 text-xs font-medium hover:bg-accent transition active:scale-95 touch-manipulation"
                >
                  <span
                    style={{ backgroundColor: c.bg }}
                    className="size-4 rounded-full border border-white/20 shadow-sm shrink-0"
                  />
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Connect Step */}
      {activeTab === "connect" && (
        <div className="flex flex-col gap-3 py-1">
          <label className="text-xs font-medium text-muted-foreground">
            Connect Next Node Step
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={connectLabel}
              onChange={(e) => setConnectLabel(e.target.value)}
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Child node label..."
            />
            <select
              value={arrowType}
              onChange={(e) => setArrowType(e.target.value)}
              className="rounded-xl border border-border bg-background px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="-->">Solid (---&gt;)</option>
              <option value="-.->">Dotted (-.-&gt;)</option>
              <option value="==>">Thick (===&gt;)</option>
              <option value="--o">Circle (--o)</option>
              <option value="--x">Cross (--x)</option>
            </select>
          </div>
          <button
            onClick={handleAddConnected}
            disabled={!connectLabel.trim()}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow transition active:scale-95 disabled:opacity-50 touch-manipulation"
          >
            <Plus className="size-4" />
            <span>Add Connected Step</span>
          </button>
        </div>
      )}

      {/* C4 Drill-Down Button (if available) */}
      {drillDownDocId && (
        <button
          onClick={() => {
            onDrillDown?.(rawNodeId);
            onClose?.();
          }}
          className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-2.5 text-xs font-semibold text-cyan-400 hover:bg-cyan-500/20 transition active:scale-95 touch-manipulation"
        >
          <ArrowUpRight className="size-4" />
          <span>Drill Down into Child Diagram</span>
        </button>
      )}

      {/* Bottom Action Row: Duplicate & Delete */}
      <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
        <button
          onClick={() => {
            onDuplicate?.();
            onClose?.();
          }}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/30 p-2.5 text-xs font-medium text-foreground hover:bg-accent transition active:scale-95 touch-manipulation"
        >
          <Copy className="size-3.5 text-muted-foreground" />
          <span>Duplicate Node</span>
        </button>

        <button
          onClick={() => {
            onDelete?.();
            onClose?.();
          }}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 p-2.5 text-xs font-medium text-destructive hover:bg-destructive/20 transition active:scale-95 touch-manipulation"
        >
          <Trash2 className="size-3.5" />
          <span>Delete Node</span>
        </button>
      </div>
    </div>
  );
}
