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
  Copy,
  Trash2,
  X,
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
  onContextMenu,
  presentation = false,
}) {
  const stageRef = useRef(null),
    canvasRef = useRef(null),
    camera = useRef({ x: 30, y: 30, z: 1 }),
    shouldFit = useRef(true);
  const [position, setPosition] = useState(camera.current),
    [size, setSize] = useState({ w: 1000, h: 700 }),
    [thumbnail, setThumbnail] = useState(""),
    [minimap, setMinimap] = useState(true),
    [wheelMode, setWheelMode] = useState("zoom"),
    [laser, setLaser] = useState(null);
  const callbacks = useRef({
    onSelect,
    onQuickAdd,
    onDeleteSelected,
    onDuplicateSelected,
    onContextMenu,
    presentation,
    wheelMode,
  });
  callbacks.current = {
    onSelect,
    onQuickAdd,
    onDeleteSelected,
    onDuplicateSelected,
    onContextMenu,
    presentation,
    wheelMode,
  };

  /**
   * Accurately determines content geometry bounding box.
   * Eliminates dead whitespace offsets in charts by prioritizing actual node geometry.
   */
  const getContentBounds = () => {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return { x: 0, y: 0, w: 1000, h: 700 };

    let bbox = null;
    try {
      // Find main graphics container or nodes group for accurate bounds
      const mainGroup =
        svg.querySelector("g.output, g.root, g.nodes, g.clusters, g#my-svg, g") || svg;
      if (typeof mainGroup.getBBox === "function") {
        const b = mainGroup.getBBox();
        if (b && b.width > 5 && b.height > 5) {
          bbox = { x: b.x, y: b.y, w: b.width, h: b.height };
        }
      }
    } catch {
      // Fallback if SVG not yet attached in test runner
    }

    const box = svg.viewBox?.baseVal;
    if (!bbox) {
      if (box && box.width > 5 && box.height > 5) {
        bbox = { x: box.x, y: box.y, w: box.width, h: box.height };
      } else {
        const rect = svg.getBoundingClientRect();
        bbox = { x: 0, y: 0, w: rect.width || 1000, h: rect.height || 700 };
      }
    }

    return bbox;
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
    const paddingX = 48;
    const paddingY = 60;
    const z = Math.max(
      0.04,
      Math.min(
        1.25,
        (s.clientWidth - paddingX) / Math.max(b.w, 10),
        (s.clientHeight - paddingY) / Math.max(b.h, 10),
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
      requestAnimationFrame(fit);
      shouldFit.current = false;
    }
  }, [status, documentId]);
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
      if (!moved && !callbacks.current.presentation) {
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
      pointers.delete(e.pointerId);
      drag = null;
      pinch = null;
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
          grid === "dots"
            ? `dot-grid ${isLight ? "theme-light" : ""}`
            : grid === "lines"
              ? `line-grid ${isLight ? "theme-light" : ""}`
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
        <div className="absolute top-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-primary/30 bg-card/95 px-3 py-1 shadow-2xl backdrop-blur animate-in fade-in slide-in-from-top-2 z-20 text-xs select-none">
          <span className="font-semibold text-primary flex items-center gap-1.5 max-w-[150px] truncate">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            <span className="truncate">{selected.label || selected.id}</span>
          </span>
          <span className="h-4 border-l border-border/80 mx-1" />
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
      <div className={`absolute bottom-3.5 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-full border px-2.5 py-1 shadow-2xl backdrop-blur-xl ${
        isLight
          ? "border-slate-200/90 bg-white/95 text-slate-800 shadow-slate-300/50 ring-1 ring-black/5"
          : "border-slate-700/60 bg-slate-900/90 text-slate-200 shadow-black/60 ring-1 ring-white/10"
      }`}>
        <Tool title="Zoom out" onClick={() => zoomBy(0.8)}>
          <Minus />
        </Tool>
        <button
          aria-label="Reset zoom to 100%"
          onClick={reset}
          className="w-12 rounded px-1 py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition"
        >
          {Math.round(position.z * 100)}%
        </button>
        <Tool title="Zoom in" onClick={() => zoomBy(1.25)}>
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
        onChange(grid === "dots" ? "lines" : grid === "lines" ? "none" : "dots")
      }
    >
      <Grid3X3 className="size-4" />
      <span className="hidden lg:inline">{grid}</span>
    </Button>
  );
}
