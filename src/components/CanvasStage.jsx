import {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
} from "react";
import {
  Minus,
  Plus,
  Maximize,
  Crosshair,
  RotateCcw,
  Grid3X3,
  Map as MapIcon,
  MousePointer2,
  Hand,
  Copy,
  Trash2,
  X,
  Pencil,
  Shapes,
  Palette,
  Check,
  ChevronDown,
} from "lucide-react";
import { Button, Tooltip, TooltipTrigger, TooltipContent } from "./ui.jsx";

export default function CanvasStage({
  ref,
  containerRef,
  grid = "dots",
  theme = "dark",
  status,
  documentId,
  selected,
  onSelect,
  onQuickAdd,
  onDeleteSelected,
  onDuplicateSelected,
  onRenameNode,
  onChangeShape,
  onStyleNode,
  onCanvasDoubleClick,
  onContextMenu,
  presentation = false,
}) {
  const stageRef = useRef(null),
    canvasRef = useRef(null),
    camera = useRef({ x: 30, y: 30, z: 1 }),
    shouldFit = useRef(true),
    editInputRef = useRef(null);
  const [position, setPosition] = useState(camera.current),
    [size, setSize] = useState({ w: 1000, h: 700 }),
    [thumbnail, setThumbnail] = useState(""),
    [minimap, setMinimap] = useState(true),
    [wheelMode, setWheelMode] = useState("zoom"),
    [laser, setLaser] = useState(null),
    [tool, setTool] = useState("pointer"),
    [isDragging, setIsDragging] = useState(false),
    [isEditing, setIsEditing] = useState(false),
    [editLabel, setEditLabel] = useState(""),
    [showShapes, setShowShapes] = useState(false),
    [showColors, setShowColors] = useState(false),
    [showZoomMenu, setShowZoomMenu] = useState(false);

  const callbacks = useRef({
    onSelect,
    onQuickAdd,
    onDeleteSelected,
    onDuplicateSelected,
    onRenameNode,
    onChangeShape,
    onStyleNode,
    onCanvasDoubleClick,
    onContextMenu,
    presentation,
    wheelMode,
    tool,
  });
  callbacks.current = {
    onSelect,
    onQuickAdd,
    onDeleteSelected,
    onDuplicateSelected,
    onRenameNode,
    onChangeShape,
    onStyleNode,
    onCanvasDoubleClick,
    onContextMenu,
    presentation,
    wheelMode,
    tool,
  };

  /**
   * Accurately determines content geometry bounding box.
   * Eliminates dead whitespace offsets and centers on the true diagram geometry
   * across all Mermaid, Graphviz, Mindmap, Architecture, Packet, and Sequence diagrams.
   */
  const getContentBounds = () => {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return { x: 0, y: 0, w: 1000, h: 700 };

    // 1. Check viewBox first: Mermaid and Graphviz calculate exact diagram coordinates in viewBox
    const vb = svg.viewBox?.baseVal;
    let viewBoxBounds = null;
    if (vb && vb.width > 5 && vb.height > 5) {
      viewBoxBounds = { x: vb.x, y: vb.y, w: vb.width, h: vb.height };
    }

    // 2. Try svg.getBBox() on root SVG element
    let geomBounds = null;
    try {
      if (typeof svg.getBBox === "function") {
        const b = svg.getBBox();
        if (b && b.width > 10 && b.height > 10 && Number.isFinite(b.x) && Number.isFinite(b.y)) {
          geomBounds = { x: b.x, y: b.y, w: b.width, h: b.height };
        }
      }
    } catch {}

    // 3. If svg.getBBox didn't work, compute the union bbox of all immediate top-level child groups
    if (!geomBounds) {
      try {
        const topGroups = svg.querySelectorAll(":scope > g:not([class*='marker']):not(defs)");
        if (topGroups.length > 0) {
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          let found = false;
          topGroups.forEach((g) => {
            if (typeof g.getBBox === "function") {
              const gb = g.getBBox();
              if (gb && gb.width > 0 && gb.height > 0) {
                minX = Math.min(minX, gb.x);
                minY = Math.min(minY, gb.y);
                maxX = Math.max(maxX, gb.x + gb.width);
                maxY = Math.max(maxY, gb.y + gb.height);
                found = true;
              }
            }
          });
          if (found && maxX > minX && maxY > minY) {
            geomBounds = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
          }
        }
      } catch {}
    }

    // Prefer geomBounds if valid and reasonable, otherwise fallback to viewBoxBounds
    let bbox = null;
    if (geomBounds && geomBounds.w > 10 && geomBounds.h > 10) {
      if (viewBoxBounds && (geomBounds.w < viewBoxBounds.w * 0.25 || geomBounds.h < viewBoxBounds.h * 0.25)) {
        bbox = viewBoxBounds;
      } else {
        bbox = geomBounds;
      }
    } else if (viewBoxBounds) {
      bbox = viewBoxBounds;
    }

    // Fallback to boundingClientRect if attached
    if (!bbox) {
      try {
        const rect = svg.getBoundingClientRect();
        if (rect && rect.width > 10 && rect.height > 10) {
          bbox = { x: 0, y: 0, w: rect.width, h: rect.height };
        }
      } catch {}
    }

    return bbox || { x: 0, y: 0, w: 1000, h: 700 };
  };

  const dimensions = () => {
    const b = getContentBounds();
    return { w: b.w, h: b.h };
  };

  const apply = () => {
    if (canvasRef.current)
      canvasRef.current.style.transform = `translate3d(${camera.current.x}px,${camera.current.y}px,0) scale(${camera.current.z})`;
    setPosition({ ...camera.current });
  };

  const fit = () => {
    const s = stageRef.current;
    if (!s || !containerRef.current?.querySelector("svg")) return;
    const b = getContentBounds();
    setSize({ w: b.w, h: b.h });
    const paddingX = Math.min(96, Math.max(36, s.clientWidth * 0.08));
    const paddingY = Math.min(100, Math.max(48, s.clientHeight * 0.1));
    const availW = Math.max(50, s.clientWidth - paddingX);
    const availH = Math.max(50, s.clientHeight - paddingY);
    const z = Math.max(
      0.04,
      Math.min(
        1.5,
        availW / Math.max(b.w, 10),
        availH / Math.max(b.h, 10),
      ),
    );
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    camera.current = {
      x: s.clientWidth / 2 - cx * z,
      y: s.clientHeight / 2 - cy * z,
      z,
    };
    apply();
  };

  const center = () => {
    const s = stageRef.current;
    if (!s) return;
    const b = getContentBounds();
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    camera.current.x = s.clientWidth / 2 - cx * camera.current.z;
    camera.current.y = s.clientHeight / 2 - cy * camera.current.z;
    apply();
  };
  const zoomBy = (factor, cx, cy) => {
    const s = stageRef.current;
    if (!s) return;
    const ax = cx ?? s.clientWidth / 2,
      ay = cy ?? s.clientHeight / 2;
    const old = camera.current;
    const z = Math.max(0.04, Math.min(6, old.z * factor));
    camera.current = {
      x: ax - ((ax - old.x) * z) / old.z,
      y: ay - ((ay - old.y) * z) / old.z,
      z,
    };
    apply();
  };
  const reset = () => {
    camera.current.z = 1;
    center();
  };
  useImperativeHandle(ref, () => ({
    fit,
    center,
    reset,
    zoomIn: () => zoomBy(1.25),
    zoomOut: () => zoomBy(0.8),
  }));
  useEffect(() => {
    shouldFit.current = true;
  }, [documentId]);
  useEffect(() => {
    if (status.state !== "ok") return;
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;
    setSize(dimensions());
    setThumbnail(
      `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`,
    );
    if (shouldFit.current) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          fit();
          shouldFit.current = false;
        });
      });
    }
  }, [status, documentId]);

  useEffect(() => {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;
    svg.querySelectorAll(".is-selected").forEach((el) => {
      el.classList.remove("is-selected");
    });
    if (selected?.id) {
      let target = null;
      try {
        target = svg.querySelector(`[id="${CSS.escape(selected.id)}"]`);
      } catch {}
      if (!target) {
        try {
          target = svg.querySelector(`#${CSS.escape(selected.id)}`);
        } catch {}
      }
      if (!target) {
        target = document.getElementById(selected.id);
      }
      if (target) {
        target.classList.add("is-selected");
      }
    }
  }, [selected, documentId, status]);

  useEffect(() => {
    if (selected) {
      setEditLabel(selected.label || selected.id);
    } else {
      setIsEditing(false);
      setShowShapes(false);
      setShowColors(false);
    }
  }, [selected]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const pointers = new Map();
    let drag = null,
      pinch = null,
      moved = false;
    const down = (e) => {
      if (e.button !== 0) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      stage.setPointerCapture(e.pointerId);
      moved = false;
      setIsDragging(true);
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch = { distance: Math.hypot(a.x - b.x, a.y - b.y) };
        drag = null;
      } else
        drag = {
          x: e.clientX,
          y: e.clientY,
          originX: camera.current.x,
          originY: camera.current.y,
        };
    };
    const move = (e) => {
      const rect = stage.getBoundingClientRect();
      if (callbacks.current.presentation)
        setLaser({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2 && pinch) {
        const [a, b] = [...pointers.values()];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        zoomBy(
          distance / pinch.distance,
          (a.x + b.x) / 2 - rect.left,
          (a.y + b.y) / 2 - rect.top,
        );
        pinch.distance = distance;
        moved = true;
      } else if (drag) {
        if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 4)
          moved = true;
        camera.current.x = drag.originX + e.clientX - drag.x;
        camera.current.y = drag.originY + e.clientY - drag.y;
        apply();
      }
    };
    const up = (e) => {
      setIsDragging(false);
      if (!moved && !callbacks.current.presentation) {
        if (callbacks.current.tool === "pointer") {
          const node = globalThis.document
            .elementFromPoint(e.clientX, e.clientY)
            ?.closest("g.node, g.entity, g.cluster, g.actor");
          if (node) {
            const label = node
              .querySelector(".nodeLabel, .label, text, title")
              ?.textContent?.trim();
            callbacks.current.onSelect?.({
              id: node.id,
              label: label || node.id,
            });
          }
        }
      }
      pointers.delete(e.pointerId);
      drag = null;
      pinch = null;
    };
    const dblclick = (e) => {
      if (callbacks.current.presentation) return;
      const node = globalThis.document
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest("g.node, g.entity, g.cluster, g.actor");
      if (node) {
        const label = node
          .querySelector(".nodeLabel, .label, text, title")
          ?.textContent?.trim();
        callbacks.current.onSelect?.({
          id: node.id,
          label: label || node.id,
        });
        setEditLabel(label || node.id);
        setIsEditing(true);
        setTimeout(() => editInputRef.current?.focus(), 50);
      } else {
        callbacks.current.onCanvasDoubleClick?.({
          clientX: e.clientX,
          clientY: e.clientY,
        });
      }
    };
    const wheel = (e) => {
      e.preventDefault();
      const rect = stage.getBoundingClientRect();
      if (
        e.ctrlKey ||
        e.metaKey ||
        (callbacks.current.wheelMode === "zoom" && Math.abs(e.deltaX) < 2)
      )
        zoomBy(
          Math.exp(-e.deltaY * 0.003),
          e.clientX - rect.left,
          e.clientY - rect.top,
        );
      else {
        camera.current.x -= e.shiftKey ? e.deltaY : e.deltaX;
        camera.current.y -= e.shiftKey ? 0 : e.deltaY;
        apply();
      }
    };
    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", up);
    stage.addEventListener("dblclick", dblclick);
    stage.addEventListener("wheel", wheel, { passive: false });
    const keys = (e) => {
      if (
        e.altKey ||
        e.target.closest(
          'input,textarea,select,button,[contenteditable], [role="dialog"]',
        )
      )
        return;
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && key === "d") {
        if (callbacks.current.onDuplicateSelected) {
          e.preventDefault();
          callbacks.current.onDuplicateSelected();
          return;
        }
      }
      if (e.ctrlKey || e.metaKey) return;
      if (key === "tab" || key === "enter") {
        if (callbacks.current.onQuickAdd) {
          e.preventDefault();
          callbacks.current.onQuickAdd();
          return;
        }
      }
      if (key === "delete" || key === "backspace") {
        if (callbacks.current.onDeleteSelected) {
          e.preventDefault();
          callbacks.current.onDeleteSelected();
          return;
        }
      }
      if (key === "v") {
        setTool("pointer");
        return;
      }
      if (key === "h") {
        setTool("hand");
        return;
      }
      if (key === "escape") {
        setIsEditing(false);
        setShowShapes(false);
        setShowColors(false);
        setShowZoomMenu(false);
        callbacks.current.onSelect?.(null);
        return;
      }
      if (
        [
          "f",
          "c",
          "0",
          "+",
          "=",
          "-",
          "arrowleft",
          "arrowright",
          "arrowup",
          "arrowdown",
        ].includes(key)
      )
        e.preventDefault();
      if (key === "f") fit();
      else if (key === "c") center();
      else if (key === "0") reset();
      else if (key === "+" || key === "=") zoomBy(1.25);
      else if (key === "-") zoomBy(0.8);
      else if (key.startsWith("arrow")) {
        const delta = e.shiftKey ? 100 : 30;
        camera.current.x +=
          key === "arrowleft" ? delta : key === "arrowright" ? -delta : 0;
        camera.current.y +=
          key === "arrowup" ? delta : key === "arrowdown" ? -delta : 0;
        apply();
      }
    };
    window.addEventListener("keydown", keys);
    const resize = new ResizeObserver(() => {
      if (shouldFit.current) fit();
    });
    resize.observe(stage);
    return () => {
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerup", up);
      stage.removeEventListener("pointercancel", up);
      stage.removeEventListener("dblclick", dblclick);
      stage.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", keys);
      resize.disconnect();
    };
  }, []);
  const isLight = theme === "default" || theme === "neutral";

  return (
    <div
      className={`studio-stage-wrap relative h-full min-h-[260px] w-full overflow-hidden transition-colors duration-300 ${
        isLight ? "theme-light" : ""
      }`}
      onContextMenu={(e) => {
        if (callbacks.current.onContextMenu) {
          e.preventDefault();
          let nodeInfo = null;
          try {
            const targetNode = globalThis.document
              ?.elementFromPoint(e.clientX, e.clientY)
              ?.closest("g.node, g.entity, g.cluster, g.actor");
            if (targetNode) {
              const label = targetNode
                .querySelector(".nodeLabel, .label, text, title")
                ?.textContent?.trim();
              nodeInfo = { id: targetNode.id, label: label || targetNode.id };
              callbacks.current.onSelect?.(nodeInfo);
            }
          } catch {}
          callbacks.current.onContextMenu(e, nodeInfo);
        }
      }}
    >
      <div
        ref={stageRef}
        className={`studio-canvas absolute inset-0 ${
          tool === "hand" ? "tool-hand" : "tool-pointer"
        } ${isDragging ? "is-dragging" : ""} ${
          grid === "dots"
            ? `dot-grid ${isLight ? "theme-light" : ""}`
            : grid === "lines"
              ? `line-grid ${isLight ? "theme-light" : ""}`
              : grid === "blueprint"
                ? `blueprint-grid ${isLight ? "theme-light" : ""}`
                : ""
        }`}
        style={{
          touchAction: "none",
          backgroundPosition: `${position.x}px ${position.y}px`,
        }}
        onPointerLeave={() => setLaser(null)}
      >
        <div
          ref={canvasRef}
          className="absolute left-0 top-0"
          style={{ transformOrigin: "0 0" }}
        >
          <div ref={containerRef} className="mermaid-stage" />
        </div>
      </div>

      {selected && (
        <div className="stage-floating-toolbar absolute top-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-primary/30 bg-card/95 px-3 py-1 shadow-2xl backdrop-blur animate-in fade-in slide-in-from-top-2 z-20 text-xs select-none">
          {isEditing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editLabel.trim()) {
                  callbacks.current.onRenameNode?.(editLabel.trim());
                }
                setIsEditing(false);
              }}
              className="inline-flex items-center gap-1.5"
            >
              <input
                ref={editInputRef}
                type="text"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.stopPropagation();
                    setIsEditing(false);
                    setEditLabel(selected.label || selected.id);
                  }
                }}
                className="h-6 rounded border border-primary/50 bg-background/95 px-2 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-36 font-medium"
                placeholder="Node label..."
                autoFocus
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded bg-primary/20 px-2 py-0.5 text-[11px] font-semibold text-primary hover:bg-primary/30 transition"
                title="Save label (Enter)"
              >
                <Check className="size-3" />
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditLabel(selected.label || selected.id);
                }}
                className="rounded p-1 text-muted-foreground hover:text-foreground transition"
                title="Cancel (Esc)"
              >
                <X className="size-3" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => {
                setIsEditing(true);
                setTimeout(() => editInputRef.current?.focus(), 50);
              }}
              className="font-semibold text-primary flex items-center gap-1.5 max-w-[160px] truncate hover:bg-primary/10 rounded px-1.5 py-0.5 transition"
              title="Click or double-click to rename"
            >
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              <span className="truncate">{selected.label || selected.id}</span>
              <Pencil className="size-2.5 opacity-60 ml-0.5" />
            </button>
          )}

          <span className="h-4 border-l border-border/80 mx-1" />

          {/* Shape Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowShapes(!showShapes);
                setShowColors(false);
              }}
              className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium text-foreground hover:bg-accent transition"
              title="Change node shape"
            >
              <Shapes className="size-3 text-sky-400" />
              <span>Shape</span>
              <ChevronDown className="size-2.5 opacity-70" />
            </button>
            {showShapes && (
              <div className="absolute left-0 top-full mt-2 z-30 min-w-[140px] rounded-lg border border-border/80 bg-popover/95 p-1 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95">
                {[
                  { id: "rectangle", label: "Rectangle [ ]" },
                  { id: "rounded", label: "Rounded ( )" },
                  { id: "stadium", label: "Stadium ([ ])" },
                  { id: "cylinder", label: "Cylinder [( )]" },
                  { id: "diamond", label: "Diamond { }" },
                  { id: "circle", label: "Circle (( ))" },
                  { id: "hexagon", label: "Hexagon {{ }}" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      callbacks.current.onChangeShape?.(s.id);
                      setShowShapes(false);
                    }}
                    className="w-full text-left rounded px-2 py-1 text-xs hover:bg-accent hover:text-accent-foreground transition flex items-center justify-between"
                  >
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Color Preset Palette */}
          <div className="relative">
            <button
              onClick={() => {
                setShowColors(!showColors);
                setShowShapes(false);
              }}
              className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium text-foreground hover:bg-accent transition"
              title="Change node style & color"
            >
              <Palette className="size-3 text-emerald-400" />
              <span>Color</span>
              <ChevronDown className="size-2.5 opacity-70" />
            </button>
            {showColors && (
              <div className="absolute left-0 top-full mt-2 z-30 min-w-[130px] rounded-lg border border-border/80 bg-popover/95 p-1.5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 grid grid-cols-4 gap-1.5">
                {[
                  { id: "default", bg: "#64748b", title: "Default" },
                  { id: "blue", bg: "#3b82f6", title: "Blue" },
                  { id: "emerald", bg: "#10b981", title: "Emerald" },
                  { id: "amber", bg: "#f59e0b", title: "Amber" },
                  { id: "rose", bg: "#f43f5e", title: "Rose" },
                  { id: "violet", bg: "#8b5cf6", title: "Violet" },
                  { id: "cyan", bg: "#06b6d4", title: "Cyan" },
                  { id: "slate", bg: "#334155", title: "Slate" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      callbacks.current.onStyleNode?.(c.id);
                      setShowColors(false);
                    }}
                    style={{ backgroundColor: c.bg }}
                    className="size-5 rounded-full border border-white/20 hover:scale-125 transition-transform shadow-sm"
                    title={c.title}
                  />
                ))}
              </div>
            )}
          </div>

          {callbacks.current.onQuickAdd && (
            <button
              onClick={callbacks.current.onQuickAdd}
              className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium text-foreground hover:bg-primary/20 hover:text-primary transition"
              title="Add connected child step (Tab)"
            >
              <Plus className="size-3" />
              <span>Add Step</span>
            </button>
          )}
          {callbacks.current.onDuplicateSelected && (
            <button
              onClick={callbacks.current.onDuplicateSelected}
              className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium text-foreground hover:bg-accent transition"
              title="Duplicate node (Cmd/Ctrl+D)"
            >
              <Copy className="size-3" />
              <span>Duplicate</span>
            </button>
          )}
          {callbacks.current.onDeleteSelected && (
            <button
              onClick={callbacks.current.onDeleteSelected}
              className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium text-rose-400 hover:bg-rose-500/20 transition"
              title="Delete node (Delete/Backspace)"
            >
              <Trash2 className="size-3" />
              <span>Delete</span>
            </button>
          )}
          <button
            onClick={() => callbacks.current.onSelect?.(null)}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground transition ml-1"
            title="Deselect (Escape)"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {status.state === "rendering" && (
        <span className="absolute left-4 top-4 rounded-md border bg-card px-3 py-1.5 text-xs text-muted-foreground">
          Building preview…
        </span>
      )}
      {presentation && laser && (
        <div
          className={`pointer-events-none absolute z-20 size-3 rounded-full ${
            isLight
              ? "bg-rose-600 shadow-[0_0_15px_4px_#e11d48]"
              : "bg-rose-400 shadow-[0_0_15px_4px_#fb7185]"
          }`}
          style={{ left: laser.x - 6, top: laser.y - 6 }}
        />
      )}
      {minimap && thumbnail && (
        <button
          aria-label="Minimap navigation"
          className="absolute bottom-16 right-3 hidden h-24 w-36 overflow-hidden rounded-md border bg-card/90 p-2 md:block shadow-2xl backdrop-blur-md"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const b = getContentBounds();
            const x = b.x + ((e.clientX - r.left) / r.width) * b.w,
              y = b.y + ((e.clientY - r.top) / r.height) * b.h;
            camera.current.x =
              stageRef.current.clientWidth / 2 - x * camera.current.z;
            camera.current.y =
              stageRef.current.clientHeight / 2 - y * camera.current.z;
            apply();
          }}
        >
          <img
            src={thumbnail}
            alt="Diagram minimap"
            className="size-full object-contain opacity-85"
          />
          <span className="absolute bottom-1 right-1 rounded bg-background/80 px-1 text-[9px] font-medium text-muted-foreground">
            MINIMAP
          </span>
        </button>
      )}

      <div className={`absolute bottom-3.5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border px-2.5 py-1 shadow-2xl backdrop-blur-xl ${
        isLight
          ? "border-slate-200/90 bg-white/95 text-slate-800 shadow-slate-300/50 ring-1 ring-black/5"
          : "border-slate-700/60 bg-slate-900/90 text-slate-200 shadow-black/60 ring-1 ring-white/10"
      }`}>
        {/* Tool Mode: Pointer (V) vs Hand (H) */}
        <div className="flex items-center rounded-full bg-muted/60 p-0.5 mr-1">
          <button
            onClick={() => setTool("pointer")}
            className={`rounded-full p-1 transition ${
              tool === "pointer"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Select tool (V)"
          >
            <MousePointer2 className="size-3.5" />
          </button>
          <button
            onClick={() => setTool("hand")}
            className={`rounded-full p-1 transition ${
              tool === "hand"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Hand / Pan tool (H)"
          >
            <Hand className="size-3.5" />
          </button>
        </div>

        <Tool title="Zoom out (-)" onClick={() => zoomBy(0.8)}>
          <Minus />
        </Tool>

        {/* Zoom Presets Popover */}
        <div className="relative">
          <button
            aria-label="Zoom preset menu"
            onClick={() => setShowZoomMenu(!showZoomMenu)}
            className="flex items-center justify-center gap-0.5 min-w-[52px] rounded px-1.5 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/40 transition"
          >
            <span>{Math.round(position.z * 100)}%</span>
            <ChevronDown className="size-2.5 opacity-60" />
          </button>
          {showZoomMenu && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-30 min-w-[110px] rounded-lg border border-border/80 bg-popover/95 p-1 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 text-xs">
              {[2, 1.5, 1.25, 1, 0.75, 0.5].map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    camera.current.z = level;
                    apply();
                    setShowZoomMenu(false);
                  }}
                  className={`w-full text-left rounded px-2 py-1 text-xs hover:bg-accent transition ${
                    Math.round(position.z * 100) === Math.round(level * 100)
                      ? "text-primary font-bold"
                      : "text-foreground"
                  }`}
                >
                  {Math.round(level * 100)}%
                </button>
              ))}
              <div className="my-1 border-t border-border/60" />
              <button
                onClick={() => {
                  fit();
                  setShowZoomMenu(false);
                }}
                className="w-full text-left rounded px-2 py-1 text-xs hover:bg-accent transition text-foreground"
              >
                Fit to View (F)
              </button>
              <button
                onClick={() => {
                  center();
                  setShowZoomMenu(false);
                }}
                className="w-full text-left rounded px-2 py-1 text-xs hover:bg-accent transition text-foreground"
              >
                Center (C)
              </button>
              <button
                onClick={() => {
                  reset();
                  setShowZoomMenu(false);
                }}
                className="w-full text-left rounded px-2 py-1 text-xs hover:bg-accent transition text-foreground"
              >
                Reset 100% (0)
              </button>
            </div>
          )}
        </div>

        <Tool title="Zoom in (+)" onClick={() => zoomBy(1.25)}>
          <Plus />
        </Tool>
        <span className="mx-1 h-4 border-l border-border/80" />
        <Tool title="Fit to view (F)" onClick={fit}>
          <Maximize />
        </Tool>
        <Tool title="Center (C)" onClick={center}>
          <Crosshair />
        </Tool>
        <Tool title="Reset view (0)" onClick={reset}>
          <RotateCcw />
        </Tool>
        <Tool title="Toggle minimap" onClick={() => setMinimap(!minimap)}>
          <MapIcon />
        </Tool>
        <Tool
          title={`Wheel mode: ${wheelMode}`}
          onClick={() => setWheelMode(wheelMode === "zoom" ? "pan" : "zoom")}
        >
          <MousePointer2 />
        </Tool>
      </div>
    </div>
  );
}
function Tool({ title, children, ...props }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={title} {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{title}</TooltipContent>
    </Tooltip>
  );
}
export function GridToggle({ grid, onChange }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={`Grid: ${grid}`}
      onClick={() =>
        onChange(
          grid === "dots"
            ? "lines"
            : grid === "lines"
              ? "blueprint"
              : grid === "blueprint"
                ? "none"
                : "dots",
        )
      }
    >
      <Grid3X3 className="size-4" />
      <span className="hidden lg:inline">{grid}</span>
    </Button>
  );
}
