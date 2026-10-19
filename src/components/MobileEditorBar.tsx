import React from "react";
import {
  Undo2,
  Redo2,
  Wand2,
  Sparkles,
  AlignLeft,
  ChevronRight,
} from "lucide-react";

const QUICK_SNIPPETS = [
  { label: "-->", snippet: " --> ", title: "Solid Arrow" },
  { label: "-.->", snippet: " -.-> ", title: "Dotted Arrow" },
  { label: "==>", snippet: " ==> ", title: "Thick Arrow" },
  { label: "|text|", snippet: "|text| ", title: "Edge Label" },
  { label: "[ ]", snippet: "[\"text\"]", title: "Rectangle" },
  { label: "( )", snippet: "(\"text\")", title: "Rounded" },
  { label: "{ }", snippet: "{\"text\"}", title: "Diamond" },
  { label: "[( )]", snippet: "[(\"text\")]", title: "Cylinder / DB" },
  { label: "(( ))", snippet: "((\"text\"))", title: "Circle" },
  { label: "subgraph", snippet: "\nsubgraph Title\n    \nend\n", title: "Subgraph Container" },
  { label: "end", snippet: "end", title: "End block" },
];

export default function MobileEditorBar({
  onInsertText,
  onUndo,
  onRedo,
  onFormat,
  onAiFix,
}) {
  return (
    <div
      role="toolbar"
      aria-label="Mobile Editor Accessory Bar"
      className="sticky bottom-0 inset-x-0 z-40 flex items-center gap-1.5 border-t border-border/80 bg-card/95 px-2 py-1.5 shadow-lg backdrop-blur-xl select-none overflow-x-auto text-xs"
      style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Editor Quick Action Controls */}
      <div className="flex items-center gap-1 pr-1.5 border-r border-border shrink-0">
        <button
          onClick={onUndo}
          className="flex size-9 items-center justify-center rounded-lg border border-border/70 bg-background text-foreground hover:bg-accent active:scale-90 transition touch-manipulation"
          title="Undo"
          aria-label="Undo"
        >
          <Undo2 className="size-3.5" />
        </button>
        <button
          onClick={onRedo}
          className="flex size-9 items-center justify-center rounded-lg border border-border/70 bg-background text-foreground hover:bg-accent active:scale-90 transition touch-manipulation"
          title="Redo"
          aria-label="Redo"
        >
          <Redo2 className="size-3.5" />
        </button>
        <button
          onClick={onFormat}
          className="flex size-9 items-center justify-center rounded-lg border border-border/70 bg-background text-foreground hover:bg-accent active:scale-90 transition touch-manipulation"
          title="Format Mermaid Source"
          aria-label="Format source"
        >
          <AlignLeft className="size-3.5 text-primary" />
        </button>
        <button
          onClick={onAiFix}
          className="flex size-9 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 active:scale-90 transition touch-manipulation"
          title="AI Syntax Repair"
          aria-label="AI Syntax Fix"
        >
          <Sparkles className="size-3.5 text-amber-400" />
        </button>
      </div>

      {/* Quick Snippet Keys */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
        {QUICK_SNIPPETS.map((item) => (
          <button
            key={item.label}
            onClick={() => onInsertText?.(item.snippet)}
            title={item.title}
            className="flex h-7 items-center justify-center rounded-lg border border-border/60 bg-secondary/60 px-2.5 font-mono text-[11px] font-semibold text-foreground hover:bg-accent hover:border-primary/50 active:scale-90 transition shrink-0 touch-manipulation shadow-xs"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
