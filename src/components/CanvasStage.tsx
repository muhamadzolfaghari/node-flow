import React, {
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
  ChevronRight,
  Link2,
  Globe,
  Search,
  FolderPlus,
  FolderTree,
  Sparkles,
  ArrowUpRight,
  Activity,
  Mouse,
  Download,
  Cloud,
  BarChart2,
  Layers,
  FileText,
  GitCompare,
  DollarSign,
  Shield,
  Database,
  Zap,
  Eye,
  Terminal,
  Award,
  Compass,
  MoreHorizontal,
} from "lucide-react";
import { flowchartNodeId, SHAPES } from "../lib/visualEditing";
import { CANVAS_CONTENT_SELECTOR } from "../lib/canvasContent";
import { useLensEffect } from "./CanvasStageLens.ts";
import { Button, Tooltip, TooltipTrigger, TooltipContent } from "./ui.tsx";
import FlowSimulatorOverlay from "./FlowSimulatorOverlay.tsx";
import CloudStencilsDrawer from "./CloudStencilsDrawer.tsx";
import ArchitectureMetricsModal from "./ArchitectureMetricsModal.tsx";
import MobileNodeSheet from "./MobileNodeSheet.tsx";
import AdrManagerModal from "./AdrManagerModal.tsx";
import ArchitectureDiffModal from "./ArchitectureDiffModal.tsx";
import IacExportModal from "./IacExportModal.tsx";
import ArbAuditModal from "./ArbAuditModal.tsx";
import StoryboardPresentationModal from "./StoryboardPresentationModal.tsx";
import { calculateArchitectureCost } from "../lib/finopsPricing.ts";

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
  onConnectNodes,
  onBatchSelect,
  onBatchStyleNodes,
  onWrapInSubgraph,
  onBatchDeleteNodes,
  onBatchDuplicateNodes,
  onOpenExportStudio,
  onCanvasDoubleClick,
  onContextMenu,
  presentation = false,
  isGeospatial = false,
  breadcrumbs = [],
  onBreadcrumbClick,
  onDrillDown,
  drillDownLinks = new Map(),
  onInsertStencil,
  documentSource = "",
  documentFormat = "mermaid",
  currentDocName = "",
  mobileMode = "preview",
  isMobile = false,
}) {
  const stageRef = useRef(null),
    canvasRef = useRef(null),
    camera = useRef({ x: 30, y: 30, z: 1 }),
    shouldFit = useRef(true),
    autoFit = useRef(false),
    editInputRef = useRef(null),
    spaceHeld = useRef(false),
    marqueeRef = useRef(null),
    connectDragRef = useRef(null),
    minimapRef = useRef(null),
    contentBoundsRef = useRef(null),
    rafRef = useRef(0);
  const [position, setPosition] = useState(camera.current),
    [size, setSize] = useState({ w: 1000, h: 700 }),
    [thumbnail, setThumbnail] = useState(""),
    [minimap, setMinimap] = useState(true),
    [wheelMode, setWheelMode] = useState("zoom"),
    [laser, setLaser] = useState(null),
    [tool, setTool] = useState("pointer"),
    [spacePanning, setSpacePanning] = useState(false),
    [nodeAnchor, setNodeAnchor] = useState(null),
    [isDragging, setIsDragging] = useState(false),
    [isEditing, setIsEditing] = useState(false),
    [editLabel, setEditLabel] = useState(""),
    [showShapes, setShowShapes] = useState(false),
    [showColors, setShowColors] = useState(false),
    [showConnect, setShowConnect] = useState(false),
    [showZoomMenu, setShowZoomMenu] = useState(false),
    [marquee, setMarquee] = useState(null),
    [batchSelected, setBatchSelected] = useState(null),
    [showBatchColors, setShowBatchColors] = useState(false),
    [connectDrag, setConnectDrag] = useState(null),
    [searchOpen, setSearchOpen] = useState(false),
    [searchQuery, setSearchQuery] = useState(""),
    [searchIndex, setSearchIndex] = useState(0),
    [minimapViewport, setMinimapViewport] = useState(null),
    [isSimulating, setIsSimulating] = useState(false),
    [showStencilsDrawer, setShowStencilsDrawer] = useState(false),
    [showMetricsModal, setShowMetricsModal] = useState(false),
    [showAdrModal, setShowAdrModal] = useState(false),
    [showDiffModal, setShowDiffModal] = useState(false),
    [showFinOps, setShowFinOps] = useState(false),
    [activeLens, setActiveLens] = useState("standard"),
    [selectedAdrId, setSelectedAdrId] = useState(null),
    [showIacModal, setShowIacModal] = useState(false),
    [showArbModal, setShowArbModal] = useState(false),
    [showStoryboard, setShowStoryboard] = useState(false),
    [showMoreTools, setShowMoreTools] = useState(false);

  const [mobileViewport, setMobileViewport] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768,
  );
  useEffect(() => {
    const handleResize = () => setMobileViewport(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const activeIsMobile = isMobile || mobileViewport;

  // Real-time FinOps Cloud Cost Sizing
  const costEstimate = React.useMemo(() => {
    if (!showFinOps) return { totalMonthly: 0, breakdown: [] };
    const svg = containerRef.current?.querySelector("svg");
    const nodes = [];
    if (svg) {
      svg.querySelectorAll("g.node, g.entity, g.cluster, g.actor").forEach((el) => {
        const l = el.querySelector(".nodeLabel, .label, text, title")?.textContent?.trim();
        nodes.push({ id: flowchartNodeId(el.id), label: l || el.id });
      });
    }
    return calculateArchitectureCost(nodes);
  }, [showFinOps, status, documentId, containerRef]);

  // Apply Multi-Perspective Architectural Lenses to SVG elements
  useLensEffect(containerRef, activeLens, status, documentId);

  const callbacks = useRef({
    onSelect,
    onQuickAdd,
    onDeleteSelected,
    onDuplicateSelected,
    onRenameNode,
    onChangeShape,
    onStyleNode,
    onConnectNodes,
    onBatchSelect,
    onBatchStyleNodes,
    onWrapInSubgraph,
    onBatchDeleteNodes,
    onBatchDuplicateNodes,
    onOpenExportStudio,
    onCanvasDoubleClick,
    onContextMenu,
    presentation,
    wheelMode,
    tool,
    spacePanning,
    mobileMode,
    activeIsMobile,
  });
  callbacks.current = {
    onSelect,
    onQuickAdd,
    onDeleteSelected,
    onDuplicateSelected,
    onRenameNode,
    onChangeShape,
    onStyleNode,
    onConnectNodes,
    onBatchSelect,
    onBatchStyleNodes,
    onWrapInSubgraph,
    onBatchDeleteNodes,
    onBatchDuplicateNodes,
    onOpenExportStudio,
    onCanvasDoubleClick,
    onContextMenu,
    presentation,
    wheelMode,
    tool,
    spacePanning,
    mobileMode,
    activeIsMobile,
  };

  /**
   * Accurately determines content geometry bounding box.
   * Eliminates dead whitespace offsets and centers on the true diagram geometry
   * across all Mermaid, Graphviz, Mindmap, Architecture, Packet, Gantt, Pie, and Sequence diagrams.
   */
  /**
   * Measures the visible content box from what is actually rendered and converts it
   * back to user units.
   *
   * Mermaid wraps content in translated groups, so the per-child getBBox/CTM route
   * below mis-measured whole families (timing, user journey, C4 reported boxes far
   * larger or smaller than the drawing) — the fit then zoomed far out, pushed the
   * chart off-centre, or clipped it. Measuring on screen is exact for every family
   * because it does not depend on how the renderer nested its groups.
   */
  // Screen-space union of the drawn content, clipped to the SVG's own box (the SVG
  // renders exactly the viewBox area, so anything outside it is not visible).
  const contentScreenRect = (svg) => {
    if (!svg || typeof svg.getBoundingClientRect !== "function") return null;
    const sr = svg.getBoundingClientRect();
    if (!(sr.width > 1 && sr.height > 1)) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, found = false;
    svg.querySelectorAll(CANVAS_CONTENT_SELECTOR).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (!(r.width > 0.5 || r.height > 0.5)) return;
      // Skip anything spanning (almost) the whole rendered canvas: that is a
      // background or defs artefact, not content.
      if (r.width >= sr.width * 0.995 && r.height >= sr.height * 0.995) return;
      minX = Math.min(minX, Math.max(r.left, sr.left));
      minY = Math.min(minY, Math.max(r.top, sr.top));
      maxX = Math.max(maxX, Math.min(r.right, sr.right));
      maxY = Math.max(maxY, Math.min(r.bottom, sr.bottom));
      found = true;
    });
    if (!found || !(maxX > minX) || !(maxY > minY)) return null;
    return { left: minX, top: minY, right: maxX, bottom: maxY, sr };
  };

  const measureContentBounds = (svg, viewBoxBounds) => {
    if (!viewBoxBounds) return null;
    const screen = contentScreenRect(svg);
    if (!screen) return null;
    const sr = screen.sr;
    // Screen pixels per user unit, taken from the element itself rather than from
    // the camera, so this stays correct even mid-gesture or before a fit runs.
    const scale = sr.width / viewBoxBounds.w;
    if (!(scale > 0) || !Number.isFinite(scale)) return null;
    return {
      x: viewBoxBounds.x + (screen.left - sr.left) / scale,
      y: viewBoxBounds.y + (screen.top - sr.top) / scale,
      w: (screen.right - screen.left) / scale,
      h: (screen.bottom - screen.top) / scale,
    };
  };

  /**
   * Chooses the box the canvas should frame.
   *
   * Prefers the scanned content bounds over the raw viewBox (which often carries large
   * empty margins, e.g. Gantt/timeline canvases), never steps outside the SVG's own
   * visible area, and never clamps padded bounds to 0: content with a negative or
   * non-zero origin (mindmaps, C4, custom viewBox origins) was framed off-centre by the
   * old `Math.max(0, …)` clamp.
   */
  const selectFrameTarget = ({ measuredBox, elementsBBox, viewBoxBounds, rootBBox }) => {
    const CONTENT_PADDING_RATIO = 0.04;
    const MIN_CONTENT_PADDING = 12;
    const MAX_CONTENT_PADDING = 64;
    const MIN_USABLE_BOX = 10;
    const VIEWBOX_IS_TIGHT_ENOUGH = 0.98;
    const contentBox =
      measuredBox && measuredBox.w > MIN_USABLE_BOX && measuredBox.h > MIN_USABLE_BOX
        ? measuredBox
        : elementsBBox;
    if (!contentBox || contentBox.w <= MIN_USABLE_BOX || contentBox.h <= MIN_USABLE_BOX) {
      return viewBoxBounds || rootBBox || null;
    }

    const pad = Math.min(
      MAX_CONTENT_PADDING,
      Math.max(MIN_CONTENT_PADDING, Math.max(contentBox.w, contentBox.h) * CONTENT_PADDING_RATIO),
    );
    let contentTarget = {
      x: contentBox.x - pad,
      y: contentBox.y - pad,
      w: contentBox.w + pad * 2,
      h: contentBox.h + pad * 2,
    };
    if (!viewBoxBounds) return contentTarget;

    // The SVG element renders exactly the viewBox area, so intersecting the two keeps
    // the frame on visible content while still dropping empty margins.
    const x0 = Math.max(contentTarget.x, viewBoxBounds.x);
    const y0 = Math.max(contentTarget.y, viewBoxBounds.y);
    const x1 = Math.min(contentTarget.x + contentTarget.w, viewBoxBounds.x + viewBoxBounds.w);
    const y1 = Math.min(contentTarget.y + contentTarget.h, viewBoxBounds.y + viewBoxBounds.h);
    const w = x1 - x0;
    const h = y1 - y0;
    if (w <= MIN_USABLE_BOX || h <= MIN_USABLE_BOX) {
      // Content sits almost entirely outside the visible viewBox.
      return viewBoxBounds;
    }
    contentTarget = { x: x0, y: y0, w, h };
    // Content already fills the visible area: the viewBox is the tighter box, and using
    // it avoids a pointless 1.05x zoom-in.
    const fillsViewBox =
      contentTarget.w >= viewBoxBounds.w * VIEWBOX_IS_TIGHT_ENOUGH &&
      contentTarget.h >= viewBoxBounds.h * VIEWBOX_IS_TIGHT_ENOUGH;
    return fillsViewBox ? viewBoxBounds : contentTarget;
  };

  /**
   * Screen-space correction after a fit.
   *
   * The first measurement can be taken a frame before web fonts or late-rendered labels
   * settle, which left some diagrams slightly off-centre. Re-measuring what is actually
   * drawn and translating by the delta (never re-scaling, so it cannot oscillate) makes
   * the frame self-correcting.
   */
  const nudgeToDrawnContent = (stage, topInset, bottomInset) => {
    const MIN_NOTICEABLE_SHIFT = 1;
    const drawn = contentScreenRect(containerRef.current?.querySelector("svg"));
    if (!drawn) return;
    const stageRect = stage.getBoundingClientRect();
    const expectedCx = stageRect.left + stageRect.width / 2;
    const expectedCy = stageRect.top + topInset + (stageRect.height - topInset - bottomInset) / 2;
    const dx = expectedCx - (drawn.left + drawn.right) / 2;
    const dy = expectedCy - (drawn.top + drawn.bottom) / 2;
    if (Math.abs(dx) <= MIN_NOTICEABLE_SHIFT && Math.abs(dy) <= MIN_NOTICEABLE_SHIFT) return;
    camera.current.x += dx;
    camera.current.y += dy;
    apply();
  };

  /**
   * Fallback measurement: unions the bounding boxes of the SVG's direct content groups,
   * mapped into the outer SVG's user space. Used when nothing is rendered on screen yet.
   */
  const scanChildBounds = (svg) => {
    try {
      const contentNodes = svg.querySelectorAll(
        ":scope > g:not(defs):not([class*='marker']), :scope > svg:not(defs)",
      );
      if (!contentNodes.length) return null;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, found = false;
      contentNodes.forEach((node) => {
        if (typeof node.getBBox !== "function") return;
        const nb = node.getBBox();
        if (!nb || !(nb.width > 0) || !(nb.height > 0)) return;
        if (!Number.isFinite(nb.x) || !Number.isFinite(nb.y)) return;
        const box = mapToOuterUserSpace(svg, node, nb);
        minX = Math.min(minX, box.x0);
        minY = Math.min(minY, box.y0);
        maxX = Math.max(maxX, box.x1);
        maxY = Math.max(maxY, box.y1);
        found = true;
      });

      // Chromium excludes HTML foreignObject children from SVG getBBox, so add them here.
      svg.querySelectorAll("foreignObject").forEach((fo) => {
        const fx = parseFloat(fo.getAttribute("x") || "0");
        const fy = parseFloat(fo.getAttribute("y") || "0");
        const fw = parseFloat(fo.getAttribute("width") || "0");
        const fh = parseFloat(fo.getAttribute("height") || "0");
        if (!(fw > 0 && fh > 0) || !Number.isFinite(fx) || !Number.isFinite(fy)) return;
        minX = Math.min(minX, fx);
        minY = Math.min(minY, fy);
        maxX = Math.max(maxX, fx + fw);
        maxY = Math.max(maxY, fy + fh);
        found = true;
      });

      if (!found || !(maxX > minX) || !(maxY > minY)) return null;
      return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    } catch {
      return null;
    }
  };

  // Maps a node's own bounding box into the outer SVG's user space.
  const mapToOuterUserSpace = (svg, node, nodeBox) => {
    const box = {
      x0: nodeBox.x,
      y0: nodeBox.y,
      x1: nodeBox.x + nodeBox.width,
      y1: nodeBox.y + nodeBox.height,
    };
    const ctm = node.getCTM ? node.getCTM() : null;
    const svgCtm = svg.getCTM ? svg.getCTM() : null;
    if (!ctm || !svgCtm || typeof svg.createSVGPoint !== "function") return box;
    try {
      const matrix = svgCtm.inverse().multiply(ctm);
      const p0 = svg.createSVGPoint();
      const p1 = svg.createSVGPoint();
      p0.x = box.x0;
      p0.y = box.y0;
      p1.x = box.x1;
      p1.y = box.y1;
      const t0 = p0.matrixTransform(matrix);
      const t1 = p1.matrixTransform(matrix);
      return {
        x0: Math.min(t0.x, t1.x),
        y0: Math.min(t0.y, t1.y),
        x1: Math.max(t0.x, t1.x),
        y1: Math.max(t0.y, t1.y),
      };
    } catch {
      return box;
    }
  };

  const rootSvgBounds = (svg) => {
    const MIN_ROOT_BOX = 10;
    try {
      if (typeof svg.getBBox !== "function") return null;
      const b = svg.getBBox();
      if (!b || b.width <= MIN_ROOT_BOX || b.height <= MIN_ROOT_BOX) return null;
      if (!Number.isFinite(b.x) || !Number.isFinite(b.y)) return null;
      return { x: b.x, y: b.y, w: b.width, h: b.height };
    } catch {
      return null;
    }
  };

  // Reads the viewBox and gives the SVG explicit pixel dimensions matching it, so one
  // user unit equals one screen pixel — the assumption the screen-space measurement
  // converts back through.
  const readViewBoxBounds = (svg) => {
    const MIN_VIEWBOX_SIZE = 5;
    const base = svg.viewBox?.baseVal;
    if (base && base.width > MIN_VIEWBOX_SIZE && base.height > MIN_VIEWBOX_SIZE) {
      return { x: base.x, y: base.y, w: base.width, h: base.height };
    }
    const raw = svg.getAttribute("viewBox");
    if (!raw) return null;
    const parts = raw.trim().split(/[\s,]+/).map(Number);
    const usable = parts.length === 4 && parts.every(Number.isFinite);
    if (!usable || parts[2] <= MIN_VIEWBOX_SIZE || parts[3] <= MIN_VIEWBOX_SIZE) return null;
    return { x: parts[0], y: parts[1], w: parts[2], h: parts[3] };
  };

  const primeSvgPixelSize = (svg, viewBoxBounds) => {
    if (!viewBoxBounds) return;
    if (!svg.style.width || svg.style.width.includes("%")) {
      svg.style.width = `${viewBoxBounds.w}px`;
    }
    if (!svg.style.height || svg.style.height.includes("%")) {
      svg.style.height = `${viewBoxBounds.h}px`;
    }
  };

  const getContentBounds = () => {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return { x: 0, y: 0, w: 1000, h: 700 };

    const viewBoxBounds = readViewBoxBounds(svg);
    primeSvgPixelSize(svg, viewBoxBounds);

    // Prefer the on-screen measurement; fall back to the child scan when the SVG is not
    // laid out yet (first paint, hidden pane).
    const measuredBox = measureContentBounds(svg, viewBoxBounds);
    const elementsBBox = scanChildBounds(svg);
    const rootBBox = rootSvgBounds(svg);
    const target = selectFrameTarget({ measuredBox, elementsBBox, viewBoxBounds, rootBBox });

    if (target) {
      const vbOriginX = viewBoxBounds && Number.isFinite(viewBoxBounds.x) ? viewBoxBounds.x : 0;
      const vbOriginY = viewBoxBounds && Number.isFinite(viewBoxBounds.y) ? viewBoxBounds.y : 0;
      return {
        x: target.x - vbOriginX,
        y: target.y - vbOriginY,
        w: target.w,
        h: target.h,
      };
    }

    // Fallback to boundingClientRect if attached
    try {
      const rect = svg.getBoundingClientRect();
      if (rect && rect.width > 10 && rect.height > 10) {
        return { x: 0, y: 0, w: rect.width, h: rect.height };
      }
    } catch {}

    return { x: 0, y: 0, w: 1000, h: 700 };
  };

  const dimensions = () => {
    const b = getContentBounds();
    return { w: b.w, h: b.h };
  };

  // Zoom/pan runs on every wheel and pointermove event. The transform and the grid
  // background are written straight to the DOM so a gesture stays off the React
  // render path, and the React state sync (grid fallback, zoom HUD, zoom-level
  // highlight) is coalesced to at most one update per frame. Previously every wheel
  // event queued a re-render of this whole component, which is what made zooming
  // feel steppy on large diagrams.
  const apply = () => {
    const cam = camera.current;
    if (canvasRef.current)
      canvasRef.current.style.transform = `translate3d(${cam.x}px,${cam.y}px,0) scale(${cam.z})`;
    if (stageRef.current)
      stageRef.current.style.backgroundPosition = `${cam.x}px ${cam.y}px`;
    if (rafRef.current) return;
    if (typeof requestAnimationFrame !== "function") {
      setPosition({ ...camera.current });
      return;
    }
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      setPosition({ ...camera.current });
    });
  };

  useEffect(() => {
    // Prime the imperatively-managed grid background to match the initial camera,
    // and drop any pending frame on unmount so a gesture cannot set state after it.
    if (stageRef.current)
      stageRef.current.style.backgroundPosition = `${camera.current.x}px ${camera.current.y}px`;
    return () => {
      if (rafRef.current && typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, []);

  const fit = () => {
    const s = stageRef.current;
    if (!s || !containerRef.current?.querySelector("svg")) return false;
    // Stage not laid out yet; fitting now would produce a tiny zoom. The
    // ResizeObserver retries while shouldFit is still set.
    if (s.clientWidth < 100 || s.clientHeight < 100) return false;
    const b = getContentBounds();
    contentBoundsRef.current = b;
    setSize({ w: b.w, h: b.h });
    const paddingX = Math.min(96, Math.max(36, s.clientWidth * 0.08));
    const topInset = 54;
    const bottomInset = 64;
    const availW = Math.max(50, s.clientWidth - paddingX);
    const availH = Math.max(50, s.clientHeight - topInset - bottomInset);
    // Keep small diagrams crisp and naturally sized (max 1.1x) while allowing larger diagrams to scale nicely
    const maxZ = b.w < 380 && b.h < 280 ? 1.1 : 1.35;
    const z = Math.max(
      0.04,
      Math.min(
        maxZ,
        availW / Math.max(b.w, 10),
        availH / Math.max(b.h, 10),
      ),
    );
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    camera.current = {
      x: s.clientWidth / 2 - cx * z,
      y: topInset + (s.clientHeight - topInset - bottomInset) / 2 - cy * z,
      z,
    };
    apply();
    nudgeToDrawnContent(s, topInset, bottomInset);
    return true;
  };

  const center = () => {
    const s = stageRef.current;
    if (!s) return;
    const b = contentBoundsRef.current || getContentBounds();
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    const topInset = 54;
    const bottomInset = 64;
    camera.current.x = s.clientWidth / 2 - cx * camera.current.z;
    camera.current.y = topInset + (s.clientHeight - topInset - bottomInset) / 2 - cy * camera.current.z;
    apply();
  };
  const zoomBy = (factor, cx, cy) => {
    const s = stageRef.current;
    if (!s) return;
    autoFit.current = false;
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
    jumpToNode: (id) => jumpToNode({ id, rawId: id, label: id }),
    openSearch: () => setSearchOpen(true),
    openAdr: () => setShowAdrModal(true),
    openDiff: () => setShowDiffModal(true),
    openIac: () => setShowIacModal(true),
    openArb: () => setShowArbModal(true),
    openStoryboard: () => setShowStoryboard(true),
    toggleFinOps: () => setShowFinOps((v) => !v),
    setLens: (lens) => setActiveLens(lens),
  }));
  const lastRenderSig = useRef("");
  useEffect(() => {
    shouldFit.current = true;
  }, [documentId]);
  useEffect(() => {
    if (status.state !== "ok") return;
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;
    const currentSig = `${documentId}:${svg.getAttribute("id") || ""}:${svg.children.length}`;
    const needsFit = shouldFit.current || (lastRenderSig.current !== "" && lastRenderSig.current !== currentSig);
    lastRenderSig.current = currentSig;
    // Measure once per rendered diagram and cache it: getContentBounds reads layout
    // for every content element, so calling it per frame while panning or zooming
    // would cost more than the render it replaced.
    const bounds = getContentBounds();
    contentBoundsRef.current = bounds;
    setSize((prev) => (prev.w === bounds.w && prev.h === bounds.h ? prev : { w: bounds.w, h: bounds.h }));
    setThumbnail((prev) => {
      const next = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
      return prev === next ? prev : next;
    });
    if (needsFit) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (fit()) {
            shouldFit.current = false;
            autoFit.current = true;
          }
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

  const updateNodeAnchor = () => {
    if (!selected?.id || !stageRef.current) {
      setNodeAnchor(null);
      return;
    }
    const svg = containerRef.current?.querySelector("svg");
    let target = svg?.querySelector(".is-selected");
    if (!target && selected?.id) {
      try {
        target = svg?.querySelector(`[id="${CSS.escape(selected.id)}"]`);
      } catch {}
      if (!target) target = document.getElementById(selected.id);
    }
    if (target && stageRef.current) {
      try {
        const elRect = target.getBoundingClientRect();
        const stageRect = stageRef.current.getBoundingClientRect();
        if (
          elRect.width > 0 &&
          elRect.bottom > stageRect.top &&
          elRect.top < stageRect.bottom &&
          elRect.right > stageRect.left &&
          elRect.left < stageRect.right
        ) {
          const x = Math.max(180, Math.min(stageRect.width - 180, elRect.left - stageRect.left + elRect.width / 2));
          const above = elRect.top - stageRect.top - 52;
          const below = elRect.bottom - stageRect.top + 12;
          // Sit above the node; flip underneath when the top edge has no room.
          const y = above >= 8 ? above : Math.min(below, stageRect.height - 56);
          setNodeAnchor((prev) => {
            if (
              prev &&
              Math.abs(prev.x - x) < 0.5 &&
              Math.abs(prev.y - y) < 0.5 &&
              Math.abs(prev.elLeft - (elRect.left - stageRect.left)) < 0.5 &&
              Math.abs(prev.elTop - (elRect.top - stageRect.top)) < 0.5 &&
              Math.abs(prev.elWidth - elRect.width) < 0.5 &&
              Math.abs(prev.elHeight - elRect.height) < 0.5
            ) {
              return prev;
            }
            return {
              x,
              y,
              elLeft: elRect.left - stageRect.left,
              elTop: elRect.top - stageRect.top,
              elWidth: elRect.width,
              elHeight: elRect.height,
            };
          });
          return;
        }
      } catch {}
    }
    setNodeAnchor((prev) => (prev === null ? prev : null));
  };

  useEffect(() => {
    updateNodeAnchor();
  }, [selected, position]);

  // Calculate viewport boundary for interactive radar minimap
  useEffect(() => {
    if (!stageRef.current) return;
    const b = contentBoundsRef.current || getContentBounds();
    contentBoundsRef.current = b;
    const totalW = Math.max(b.w, 100);
    const totalH = Math.max(b.h, 100);
    const stageW = stageRef.current.clientWidth || 1000;
    const stageH = stageRef.current.clientHeight || 700;

    const viewX = (0 - camera.current.x) / camera.current.z;
    const viewY = (0 - camera.current.y) / camera.current.z;
    const viewW = stageW / camera.current.z;
    const viewH = stageH / camera.current.z;

    const left = Math.max(0, Math.min(95, ((viewX - b.x) / totalW) * 100));
    const top = Math.max(0, Math.min(95, ((viewY - b.y) / totalH) * 100));
    const width = Math.max(5, Math.min(100 - left, (viewW / totalW) * 100));
    const height = Math.max(5, Math.min(100 - top, (viewH / totalH) * 100));

    setMinimapViewport((prev) => {
      if (
        prev &&
        Math.abs(prev.left - left) < 0.1 &&
        Math.abs(prev.top - top) < 0.1 &&
        Math.abs(prev.width - width) < 0.1 &&
        Math.abs(prev.height - height) < 0.1
      ) {
        return prev;
      }
      return { left, top, width, height };
    });
  }, [position, status, documentId]);

  const handleMinimapPointerDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const minimapEl = minimapRef.current || e.currentTarget;
    const updatePan = (evt) => {
      const rect = minimapEl.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(rect.width, evt.clientX - rect.left));
      const clickY = Math.max(0, Math.min(rect.height, evt.clientY - rect.top));
      const b = getContentBounds();
      const targetDiagramX = b.x + (clickX / rect.width) * b.w;
      const targetDiagramY = b.y + (clickY / rect.height) * b.h;
      if (stageRef.current) {
        camera.current.x = stageRef.current.clientWidth / 2 - targetDiagramX * camera.current.z;
        camera.current.y = stageRef.current.clientHeight / 2 - targetDiagramY * camera.current.z;
        apply();
      }
    };
    updatePan(e);
    const onUp = () => {
      window.removeEventListener("pointermove", updatePan);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    window.addEventListener("pointermove", updatePan);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const startConnectDrag = (e, portSide) => {
    e.stopPropagation();
    e.preventDefault();
    if (!selected?.id || !stageRef.current) return;
    const stageRect = stageRef.current.getBoundingClientRect();
    const startX = e.clientX - stageRect.left;
    const startY = e.clientY - stageRect.top;
    const dragData = {
      fromId: selected.id,
      startX,
      startY,
      currentX: startX,
      currentY: startY,
    };
    connectDragRef.current = dragData;
    setConnectDrag(dragData);

    let lastTargetEl = null;
    const clearHighlight = () => {
      if (lastTargetEl) {
        lastTargetEl.classList.remove("is-connect-target");
        lastTargetEl = null;
      }
      containerRef.current?.querySelectorAll(".is-connect-target")?.forEach((el) => {
        el.classList.remove("is-connect-target");
      });
    };

    const onPointerMove = (evt) => {
      if (!connectDragRef.current || !stageRef.current) return;
      const curRect = stageRef.current.getBoundingClientRect();
      const updated = {
        ...connectDragRef.current,
        currentX: evt.clientX - curRect.left,
        currentY: evt.clientY - curRect.top,
      };
      connectDragRef.current = updated;
      setConnectDrag(updated);

      const targetEl = document.elementFromPoint(evt.clientX, evt.clientY)?.closest("g.node, g.actor, g.entity, g.cluster");
      if (targetEl && targetEl.id) {
        let cleanTargetId = flowchartNodeId(targetEl.id);
        let cleanFromId = flowchartNodeId(connectDragRef.current.fromId);
        if (cleanTargetId !== cleanFromId) {
          if (lastTargetEl !== targetEl) {
            clearHighlight();
            targetEl.classList.add("is-connect-target");
            lastTargetEl = targetEl;
          }
        } else {
          clearHighlight();
        }
      } else {
        clearHighlight();
      }
    };

    const onPointerUp = (evt) => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      clearHighlight();
      if (!connectDragRef.current) return;
      const fromId = connectDragRef.current.fromId;
      setConnectDrag(null);
      connectDragRef.current = null;

      const targetEl = document.elementFromPoint(evt.clientX, evt.clientY)?.closest("g.node, g.actor, g.entity, g.cluster");
      if (targetEl && targetEl.id) {
        let cleanTargetId = flowchartNodeId(targetEl.id);
        let cleanFromId = flowchartNodeId(fromId);
        if (cleanTargetId !== cleanFromId) {
          callbacks.current.onConnectNodes?.(cleanFromId, cleanTargetId);
        }
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  const getDiagramNodes = () => {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return [];
    const nodes = [];
    const seen = new Set();
    svg.querySelectorAll("g.node, g.actor, g.entity").forEach((el) => {
      const rawId = el.id || "";
      let cleanId = flowchartNodeId(rawId);
      if (!cleanId || seen.has(cleanId)) return;
      seen.add(cleanId);
      const label = el.querySelector(".nodeLabel, .label, text, title")?.textContent?.trim() || cleanId;
      nodes.push({ id: cleanId, rawId, label });
    });
    return nodes;
  };

  const jumpToNode = (node) => {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg || !stageRef.current || !node) return;
    let target = null;
    try {
      if (node.rawId) {
        target = svg.querySelector(`[id="${CSS.escape(node.rawId)}"]`);
      }
      if (!target && node.id) {
        target = svg.querySelector(`[id="${CSS.escape(node.id)}"]`) ||
                 svg.querySelector(`[id^="flowchart-${CSS.escape(node.id)}-"]`) ||
                 document.getElementById(node.id);
      }
    } catch {}
    if (target) {
      const b = target.getBoundingClientRect();
      const stageRect = stageRef.current.getBoundingClientRect();
      const nodeCenterX = (b.left + b.width / 2 - stageRect.left - camera.current.x) / camera.current.z;
      const nodeCenterY = (b.top + b.height / 2 - stageRect.top - camera.current.y) / camera.current.z;

      camera.current.x = stageRef.current.clientWidth / 2 - nodeCenterX * camera.current.z;
      camera.current.y = stageRef.current.clientHeight / 2 - nodeCenterY * camera.current.z;
      apply();

      callbacks.current.onSelect?.({ id: node.id, label: node.label });
      setSearchOpen(false);
      setSearchQuery("");
      setSearchIndex(0);
    }
  };

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const pointers = new Map();
    let drag = null,
      pinch = null,
      moved = false;
    const down = (e) => {
      autoFit.current = false;
      if (e.button !== 0) return;
      if (e.target.closest?.(".stage-floating-toolbar, .stage-batch-toolbar, .studio-canvas-controls, button, input, select, form")) {
        return;
      }
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      stage.setPointerCapture(e.pointerId);
      moved = false;
      setIsDragging(true);

      // Shift + Drag in Pointer mode triggers Marquee box selection
      if (e.shiftKey && callbacks.current.tool === "pointer" && !spaceHeld.current) {
        marqueeRef.current = {
          startX: e.clientX,
          startY: e.clientY,
          currentX: e.clientX,
          currentY: e.clientY,
        };
        const sRect = stage.getBoundingClientRect();
        setMarquee({
          left: e.clientX - sRect.left,
          top: e.clientY - sRect.top,
          width: 0,
          height: 0,
        });
        drag = null;
        return;
      }

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

      // Handle active Marquee box drag
      if (marqueeRef.current) {
        marqueeRef.current.currentX = e.clientX;
        marqueeRef.current.currentY = e.clientY;
        const left = Math.min(marqueeRef.current.startX, e.clientX) - rect.left;
        const top = Math.min(marqueeRef.current.startY, e.clientY) - rect.top;
        const width = Math.abs(e.clientX - marqueeRef.current.startX);
        const height = Math.abs(e.clientY - marqueeRef.current.startY);
        setMarquee({ left, top, width, height });
        if (width > 4 || height > 4) moved = true;
        return;
      }

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

      // Finish Marquee selection if active
      if (marqueeRef.current) {
        const m = marqueeRef.current;
        const minX = Math.min(m.startX, m.currentX);
        const maxX = Math.max(m.startX, m.currentX);
        const minY = Math.min(m.startY, m.currentY);
        const maxY = Math.max(m.startY, m.currentY);
        const boxWidth = maxX - minX;
        const boxHeight = maxY - minY;

        if (boxWidth > 8 || boxHeight > 8) {
          const svg = containerRef.current?.querySelector("svg");
          if (svg) {
            const nodes = svg.querySelectorAll("g.node, g.entity, g.cluster, g.actor");
            const foundNodes = [];
            for (const n of nodes) {
              const b = n.getBoundingClientRect();
              if (
                b.left < maxX &&
                b.right > minX &&
                b.top < maxY &&
                b.bottom > minY
              ) {
                const label = n
                  .querySelector(".nodeLabel, .label, text, title")
                  ?.textContent?.trim();
                let cleanId = flowchartNodeId(n.id);
                foundNodes.push({ id: cleanId, rawId: n.id, label: label || cleanId });
              }
            }
            if (foundNodes.length === 1) {
              callbacks.current.onSelect?.(foundNodes[0]);
              setBatchSelected(null);
            } else if (foundNodes.length > 1) {
              setBatchSelected(foundNodes);
              callbacks.current.onSelect?.(null);
              // highlight all found nodes with .is-selected
              svg.querySelectorAll(".is-selected").forEach((el) => el.classList.remove("is-selected"));
              foundNodes.forEach((fn) => {
                const target = svg.querySelector(`[id="${CSS.escape(fn.rawId)}"]`) || svg.querySelector(`[id="${CSS.escape(fn.id)}"]`);
                target?.classList?.add("is-selected");
              });
              callbacks.current.onBatchSelect?.(foundNodes);
            } else {
              callbacks.current.onSelect?.(null);
              setBatchSelected(null);
            }
          }
        }
        marqueeRef.current = null;
        setMarquee(null);
        pointers.delete(e.pointerId);
        drag = null;
        pinch = null;
        return;
      }

      if (!moved && !callbacks.current.presentation && !spaceHeld.current) {
        // In mobile preview mode, tap does not select or edit nodes, ensuring uninterrupted panning and viewing
        if (callbacks.current.mobileMode === "preview") {
          pointers.delete(e.pointerId);
          drag = null;
          pinch = null;
          return;
        }

        if (callbacks.current.tool === "pointer") {
          if (e.target.closest?.(".stage-floating-toolbar, .stage-batch-toolbar, .studio-canvas-controls, button, input, select, form, [role='dialog']")) {
            pointers.delete(e.pointerId);
            drag = null;
            pinch = null;
            return;
          }
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
            setBatchSelected(null);
          } else {
            // Clicking empty canvas deselects active node & batch
            callbacks.current.onSelect?.(null);
            setBatchSelected(null);
          }
        }
      }
      pointers.delete(e.pointerId);
      drag = null;
      pinch = null;
    };
    const dblclick = (e) => {
      if (callbacks.current.presentation || callbacks.current.mobileMode === "preview") return;
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
      autoFit.current = false;
      const rect = stage.getBoundingClientRect();
      const rawDelta = e.deltaMode === 1 ? e.deltaY * 18 : e.deltaMode === 2 ? e.deltaY * 80 : e.deltaY;
      const clampedDelta = Math.max(-80, Math.min(80, rawDelta));
      const zoomFactor = Math.exp(-clampedDelta * 0.0022);
      if (
        e.ctrlKey ||
        e.metaKey ||
        (callbacks.current.wheelMode === "zoom" && Math.abs(e.deltaX) < 2)
      ) {
        zoomBy(
          zoomFactor,
          e.clientX - rect.left,
          e.clientY - rect.top,
        );
      } else {
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
      // Guard against intercepting keys when user is typing in code editor, inputs, or textareas
      const isInput =
        e.altKey ||
        e.target?.closest?.(
          'input,textarea,select,button,[contenteditable],.cm-editor,.cm-scroller,.cm-content,.code-mirror,[role="dialog"]',
        ) ||
        globalThis.document?.activeElement?.closest?.(
          'input,textarea,select,button,[contenteditable],.cm-editor,.cm-scroller,.cm-content,.code-mirror,[role="dialog"]',
        );
      if (isInput) return;

      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && (key === "p" || (e.shiftKey && key === "o"))) {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
        return;
      }
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
        setSearchOpen(false);
        setBatchSelected(null);
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
    const handleSpaceDown = (e) => {
      const isInput =
        e.target?.closest?.(
          'input,textarea,select,button,[contenteditable],.cm-editor,.cm-scroller,.cm-content,.code-mirror,[role="dialog"]',
        ) ||
        globalThis.document?.activeElement?.closest?.(
          'input,textarea,select,button,[contenteditable],.cm-editor,.cm-scroller,.cm-content,.code-mirror,[role="dialog"]',
        );
      if (isInput) return;

      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        if (!spaceHeld.current) {
          spaceHeld.current = true;
          setSpacePanning(true);
        }
      }
    };
    const handleSpaceUp = (e) => {
      if (e.code === "Space" || e.key === " ") {
        spaceHeld.current = false;
        setSpacePanning(false);
      }
    };
    window.addEventListener("keydown", handleSpaceDown);
    window.addEventListener("keyup", handleSpaceUp);

    const resize = new ResizeObserver(() => {
      if (shouldFit.current && fit()) {
        shouldFit.current = false;
        autoFit.current = true;
      } else if (autoFit.current) fit();
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
      window.removeEventListener("keydown", handleSpaceDown);
      window.removeEventListener("keyup", handleSpaceUp);
      resize.disconnect();
    };
  }, []);
  const isLight = theme === "default" || theme === "neutral";
  const themeClass = isLight ? "theme-light" : `theme-${theme}`;

  return (
    <div
      className={`studio-stage-wrap relative h-full min-h-[260px] w-full overflow-hidden transition-colors duration-300 ${themeClass}`}
      onContextMenu={(e) => {
        if (callbacks.current.onContextMenu) {
          e.preventDefault();
          let nodeInfo = null;
          let edgeInfo = null;
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
            } else {
              const targetEdge = globalThis.document
                ?.elementFromPoint(e.clientX, e.clientY)
                ?.closest("g.edgePath, g.edgePaths, g.edgeLabel, path.path");
              if (targetEdge) {
                const edgeGroup = targetEdge.closest("g.edgePath") || targetEdge;
                const cls = (typeof edgeGroup.className === "string" ? edgeGroup.className : edgeGroup.className?.baseVal) || "";
                const match = cls.match(/\bLS-([^\s]+)\s+LE-([^\s]+)\b/) || edgeGroup.id?.match(/^L[-_]([^-]+)[-_]([^-]+)/);
                if (match) {
                  edgeInfo = { from: match[1], to: match[2], id: edgeGroup.id };
                }
              }
            }
          } catch {}
          callbacks.current.onContextMenu(e, nodeInfo, edgeInfo);
        }
      }}
    >
      <div
        ref={stageRef}
        className={`studio-canvas absolute inset-0 ${
          tool === "hand" || spacePanning ? "tool-hand" : "tool-pointer"
        } ${isDragging ? "is-dragging" : ""} ${
          grid === "dots"
            ? `dot-grid ${isLight ? "theme-light" : ""}`
            : grid === "lines"
              ? `line-grid ${isLight ? "theme-light" : ""}`
              : grid === "blueprint"
                ? `blueprint-grid ${isLight ? "theme-light" : ""}`
                : ""
        }`}
        style={{ touchAction: "none" }}
        onPointerLeave={() => setLaser(null)}
      >
        <div
          ref={canvasRef}
          className="absolute left-0 top-0 will-change-transform"
          style={{ transformOrigin: "0 0", willChange: "transform" }}
        >
          <div ref={containerRef} className="mermaid-stage" />
        </div>
        {marquee && (
          <div
            className="pointer-events-none absolute border-2 border-sky-400 bg-sky-500/15 shadow-[0_0_15px_rgba(56,189,248,0.35)] rounded-sm z-30"
            style={{
              left: `${marquee.left}px`,
              top: `${marquee.top}px`,
              width: `${marquee.width}px`,
              height: `${marquee.height}px`,
            }}
          />
        )}
      </div>

      {/* C4 Architecture Multi-Level Hierarchical Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 rounded-full border border-indigo-500/40 bg-slate-950/90 px-3 py-1.5 text-xs text-slate-200 shadow-2xl backdrop-blur-xl ring-1 ring-indigo-400/20 select-none animate-in fade-in slide-in-from-top-1">
          <Layers className="size-3.5 text-indigo-400 shrink-0" />
          <span className="font-semibold text-indigo-300 text-[10px] uppercase tracking-wider pr-1.5 border-r border-slate-700">C4 Hierarchy</span>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.id || idx}>
              <button
                type="button"
                onClick={() => onBreadcrumbClick?.(crumb.id, idx)}
                className="text-xs text-slate-300 hover:text-white hover:underline flex items-center gap-1 transition"
                title={`Navigate back up to ${crumb.name}`}
              >
                {crumb.name}
              </button>
              <ChevronRight className="size-3 text-slate-500" />
            </React.Fragment>
          ))}
          <span className="font-semibold text-white text-xs">{currentDocName || "Child Diagram"}</span>
        </div>
      )}

      {isGeospatial && !breadcrumbs?.length && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-full border border-sky-500/30 bg-slate-950/85 px-3 py-1.5 text-xs text-sky-200 shadow-xl backdrop-blur-md select-none animate-in fade-in slide-in-from-top-1">
          <Globe className="size-3.5 text-sky-400 animate-spin" style={{ animationDuration: "14s" }} />
          <span className="font-semibold text-slate-100">Geospatial Engine</span>
          <span className="h-3 w-px bg-slate-700" />
          <span className="text-[11px] text-sky-300 font-mono">MVT • GeoJSON • Shapefile • TopoJSON</span>
        </div>
      )}

      {/* Multi-Perspective Architectural Lens Switcher */}
      {!breadcrumbs?.length && !isGeospatial && (
        <div className="absolute top-4 left-4 z-20 hidden md:flex items-center gap-1 rounded-full border border-border/80 bg-card/95 p-1 text-xs shadow-2xl backdrop-blur-xl ring-1 ring-white/10 select-none animate-in fade-in slide-in-from-top-1">
          {[
            { id: "standard", label: "Standard", icon: Eye, title: "Standard unfiltered view" },
            { id: "security", label: "Security", icon: Shield, title: "Highlight perimeter, auth, and trust boundaries" },
            { id: "data", label: "Data Stores", icon: Database, title: "Highlight databases, queues, and caches" },
            { id: "resilience", label: "Resilience", icon: Zap, title: "Highlight single points of failure" },
          ].map((l) => {
            const Icon = l.icon;
            const isActive = activeLens === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setActiveLens(l.id)}
                title={l.title}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-3" />
                <span>{l.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* FinOps Cloud Architecture Cost HUD */}
      {showFinOps && (
        <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-1 select-none animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/40 bg-card/95 px-3 py-1.5 text-xs shadow-2xl backdrop-blur-xl ring-1 ring-emerald-400/20">
            <DollarSign className="size-3.5 text-emerald-400" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Est. Monthly Cloud:</span>
            <span className="font-mono font-bold text-emerald-400 text-xs">
              ~${costEstimate.totalMonthly.toFixed(2)}/mo
            </span>
            <button
              onClick={() => setShowFinOps(false)}
              className="rounded-full p-0.5 text-muted-foreground hover:text-foreground ml-1"
            >
              <X className="size-3" />
            </button>
          </div>
          {costEstimate.breakdown.length > 0 && (
            <div className="rounded-xl border border-border/80 bg-card/95 p-2.5 shadow-2xl backdrop-blur-xl text-[11px] max-w-[260px] space-y-1">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pb-1 border-b border-border/60 flex items-center justify-between">
                <span>Infrastructure Footprint</span>
                <span className="text-emerald-400 font-mono">{costEstimate.breakdown.length} items</span>
              </div>
              {costEstimate.breakdown.slice(0, 5).map((b, i) => (
                <div key={i} className="flex items-center justify-between gap-3 text-muted-foreground">
                  <span className="truncate">{b.serviceName}</span>
                  <span className="font-mono font-medium text-foreground shrink-0">${b.cost}/mo</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Direct Drag-to-Connect Handles around selected node */}
      {selected && nodeAnchor?.elWidth && !isEditing && (
        <div className="pointer-events-none absolute inset-0 z-20 overflow-visible">
          {/* Top Port */}
          <button
            type="button"
            className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 size-4 rounded-full border-2 border-cyan-400 bg-slate-950 shadow-[0_0_8px_#06b6d4] hover:scale-125 hover:bg-cyan-400 transition cursor-crosshair flex items-center justify-center text-[10px] text-white"
            style={{ left: nodeAnchor.elLeft + nodeAnchor.elWidth / 2, top: nodeAnchor.elTop }}
            onPointerDown={(e) => startConnectDrag(e, "top")}
            title="Drag to connect"
          >
            <Plus className="size-2.5 text-cyan-300" />
          </button>
          {/* Right Port */}
          <button
            type="button"
            className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 size-4 rounded-full border-2 border-cyan-400 bg-slate-950 shadow-[0_0_8px_#06b6d4] hover:scale-125 hover:bg-cyan-400 transition cursor-crosshair flex items-center justify-center text-[10px] text-white"
            style={{ left: nodeAnchor.elLeft + nodeAnchor.elWidth, top: nodeAnchor.elTop + nodeAnchor.elHeight / 2 }}
            onPointerDown={(e) => startConnectDrag(e, "right")}
            title="Drag to connect"
          >
            <Plus className="size-2.5 text-cyan-300" />
          </button>
          {/* Bottom Port */}
          <button
            type="button"
            className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 size-4 rounded-full border-2 border-cyan-400 bg-slate-950 shadow-[0_0_8px_#06b6d4] hover:scale-125 hover:bg-cyan-400 transition cursor-crosshair flex items-center justify-center text-[10px] text-white"
            style={{ left: nodeAnchor.elLeft + nodeAnchor.elWidth / 2, top: nodeAnchor.elTop + nodeAnchor.elHeight }}
            onPointerDown={(e) => startConnectDrag(e, "bottom")}
            title="Drag to connect"
          >
            <Plus className="size-2.5 text-cyan-300" />
          </button>
          {/* Left Port */}
          <button
            type="button"
            className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 size-4 rounded-full border-2 border-cyan-400 bg-slate-950 shadow-[0_0_8px_#06b6d4] hover:scale-125 hover:bg-cyan-400 transition cursor-crosshair flex items-center justify-center text-[10px] text-white"
            style={{ left: nodeAnchor.elLeft, top: nodeAnchor.elTop + nodeAnchor.elHeight / 2 }}
            onPointerDown={(e) => startConnectDrag(e, "left")}
            title="Drag to connect"
          >
            <Plus className="size-2.5 text-cyan-300" />
          </button>
        </div>
      )}

      {/* Active Connecting Wire Overlay */}
      {connectDrag && (
        <svg className="pointer-events-none absolute inset-0 size-full z-30 overflow-visible">
          <defs>
            <marker
              id="drag-arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#38bdf8" />
            </marker>
          </defs>
          <path
            d={`M ${connectDrag.startX} ${connectDrag.startY} C ${connectDrag.startX + (connectDrag.currentX - connectDrag.startX) / 2} ${connectDrag.startY}, ${connectDrag.startX + (connectDrag.currentX - connectDrag.startX) / 2} ${connectDrag.currentY}, ${connectDrag.currentX} ${connectDrag.currentY}`}
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            fill="none"
            markerEnd="url(#drag-arrowhead)"
            className="animate-pulse"
          />
        </svg>
      )}

      {/* Floating Multi-Select Batch Action Bar */}
      {batchSelected && batchSelected.length > 1 && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="stage-batch-toolbar absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full border border-primary/40 bg-card/95 px-4 py-1.5 shadow-2xl backdrop-blur-xl ring-1 ring-white/10 text-xs select-none animate-in fade-in slide-in-from-top-3"
        >
          <div className="flex items-center gap-1.5 font-semibold text-foreground pr-2 border-r border-border">
            <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
              {batchSelected.length}
            </span>
            <span>Nodes Selected</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowBatchColors(!showBatchColors)}
              className="flex items-center gap-1.5 rounded-lg border border-border px-2 py-1 font-medium hover:bg-accent transition"
            >
              <Palette className="size-3.5 text-primary" />
              <span>Color</span>
              <ChevronDown className="size-3 text-muted-foreground" />
            </button>
            {showBatchColors && (
              <div className="absolute left-0 top-full mt-2 grid grid-cols-4 gap-1.5 rounded-xl border border-border bg-card p-2 shadow-xl z-40 min-w-[140px]">
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
                      callbacks.current.onBatchStyleNodes?.(batchSelected.map((n) => n.id), c.id);
                      setShowBatchColors(false);
                    }}
                    style={{ backgroundColor: c.bg }}
                    className="size-5 rounded-full border border-white/20 hover:scale-125 transition-transform shadow-sm"
                    title={c.title}
                  />
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              const title = prompt("Enter Group / Subgraph Title:", "Module");
              if (title !== null) {
                callbacks.current.onWrapInSubgraph?.(batchSelected.map((n) => n.id), title || "Group");
                setBatchSelected(null);
              }
            }}
            className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 font-medium text-foreground hover:bg-accent transition"
            title="Wrap selected nodes in a Subgraph container"
          >
            <FolderPlus className="size-3.5 text-cyan-400" />
            <span>Group</span>
          </button>

          <button
            onClick={() => {
              callbacks.current.onBatchDuplicateNodes?.(batchSelected.map((n) => n.id));
              setBatchSelected(null);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 font-medium text-foreground hover:bg-accent transition"
            title="Duplicate selected nodes"
          >
            <Copy className="size-3.5 text-emerald-400" />
            <span>Duplicate</span>
          </button>

          <button
            onClick={() => {
              if (confirm(`Delete ${batchSelected.length} selected nodes?`)) {
                callbacks.current.onBatchDeleteNodes?.(batchSelected.map((n) => n.id));
                setBatchSelected(null);
              }
            }}
            className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1 font-medium text-rose-400 hover:bg-rose-500/20 transition"
            title="Delete all selected nodes"
          >
            <Trash2 className="size-3.5" />
            <span>Delete</span>
          </button>

          <button
            onClick={() => {
              setBatchSelected(null);
              callbacks.current.onSelect?.(null);
            }}
            className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition ml-1"
            title="Deselect all (Esc)"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {!activeIsMobile && selected && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="stage-floating-toolbar absolute z-20 flex max-w-[calc(100%-16px)] items-center gap-0.5 rounded-xl border border-border/70 bg-popover/95 p-1 text-xs shadow-2xl ring-1 ring-black/5 backdrop-blur-xl animate-in fade-in zoom-in-95 select-none transition-[left,top] duration-150"
          style={
            nodeAnchor
              ? {
                  // Keep the toolbar fully inside the stage (it is ~440px wide).
                  left: `${Math.max(
                    Math.min(220, (stageRef.current?.clientWidth || 0) / 2),
                    Math.min(nodeAnchor.x, (stageRef.current?.clientWidth || Infinity) - 220),
                  )}px`,
                  top: `${Math.max(8, nodeAnchor.y)}px`,
                  transform: "translateX(-50%)",
                }
              : { left: "50%", top: "16px", transform: "translateX(-50%)" }
          }
        >
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
              className="flex h-7 max-w-[150px] items-center gap-1.5 truncate rounded-md px-2 text-[11px] font-semibold text-foreground transition hover:bg-accent"
              title="Click or double-click to rename"
            >
              <span className="size-1.5 shrink-0 rounded-full bg-primary" />
              <span className="truncate">{selected.label || selected.id}</span>
              <Pencil className="size-2.5 opacity-60 ml-0.5" />
            </button>
          )}

          {/* C4 Drill Down Button */}
          {(() => {
            const rawId = selected?.id ? flowchartNodeId(selected.id) : null;
            const targetDocId = rawId ? drillDownLinks?.get(rawId) || drillDownLinks?.get(selected.id) : null;
            if (!targetDocId) return null;
            return (
              <button
                type="button"
                onClick={() => onDrillDown?.(targetDocId)}
                className="inline-flex items-center gap-1 rounded bg-indigo-500/20 border border-indigo-500/40 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 hover:bg-indigo-500/30 transition shadow-sm ml-0.5"
                title="Drill down into child diagram (C4 Component view)"
              >
                <FolderTree className="size-3 text-indigo-400" />
                <span>Drill Down ↗</span>
              </button>
            );
          })()}

          <span className="h-4 border-l border-border/80 mx-1" />

          {/* Shape Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowShapes(!showShapes);
                setShowColors(false);
              }}
              className="inline-flex size-7 items-center justify-center rounded-md text-foreground/80 transition hover:bg-accent hover:text-foreground"
              title="Change node shape"
            >
              <Shapes className="size-4 text-sky-400" />
              <span className="sr-only">Shape</span>
              
            </button>
            {showShapes && (
              <div className="absolute left-0 top-full mt-2 z-30 min-w-[140px] rounded-lg border border-border/80 bg-popover/95 p-1 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95">
                {Object.entries(SHAPES).map(([id, shape]) => ({ id, label: `${shape.label}  ${shape.open} ${shape.close}` })).map((s) => (
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
              className="inline-flex size-7 items-center justify-center rounded-md text-foreground/80 transition hover:bg-accent hover:text-foreground"
              title="Change node style & color"
            >
              <Palette className="size-4 text-emerald-400" />
              <span className="sr-only">Color</span>
              
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
              onClick={() => callbacks.current.onQuickAdd?.()}
              className="inline-flex size-7 items-center justify-center rounded-md text-foreground/80 transition hover:bg-accent hover:text-foreground hover:!bg-primary/15 hover:!text-primary"
              title="Add connected child step (Tab)"
            >
              <Plus className="size-4" />
              <span className="sr-only">Add Step</span>
            </button>
          )}

          {callbacks.current.onConnectNodes && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowConnect(!showConnect);
                  setShowShapes(false);
                  setShowColors(false);
                }}
                className={`inline-flex size-7 items-center justify-center rounded-md transition ${
                  showConnect
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/80 hover:bg-accent hover:text-foreground"
                }`}
                title="Connect to another node"
              >
                <Link2 className="size-4 text-cyan-400" />
                <span className="sr-only">Connect</span>
                
              </button>
              {showConnect && (
                <div className="absolute left-0 top-full mt-2 z-30 min-w-[170px] max-h-52 overflow-y-auto rounded-lg border border-border/80 bg-popover/95 p-1 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Connect To Node
                  </div>
                  {(() => {
                    const svg = containerRef.current?.querySelector("svg");
                    const otherNodes = [];
                    if (svg && selected?.id) {
                      svg.querySelectorAll("g.node, g.entity, g.cluster, g.actor").forEach((el) => {
                        if (el.id && el.id !== selected.id) {
                          const l = el.querySelector(".nodeLabel, .label, text, title")?.textContent?.trim();
                          otherNodes.push({ id: el.id, label: l || el.id });
                        }
                      });
                    }
                    if (otherNodes.length === 0) {
                      return (
                        <div className="px-2 py-1.5 text-xs text-muted-foreground italic">
                          No other target nodes found
                        </div>
                      );
                    }
                    return otherNodes.map((target) => (
                      <button
                        key={target.id}
                        onClick={() => {
                          callbacks.current.onConnectNodes?.(target.id);
                          setShowConnect(false);
                        }}
                        className="w-full text-left rounded px-2 py-1 text-xs hover:bg-accent hover:text-accent-foreground transition flex items-center justify-between truncate"
                        title={`Connect to ${target.label}`}
                      >
                        <span className="truncate">{target.label}</span>
                        <Plus className="size-3 text-muted-foreground ml-1 shrink-0" />
                      </button>
                    ));
                  })()}
                </div>
              )}
            </div>
          )}
          {callbacks.current.onDuplicateSelected && (
            <button
              onClick={callbacks.current.onDuplicateSelected}
              className="inline-flex size-7 items-center justify-center rounded-md text-foreground/80 transition hover:bg-accent hover:text-foreground"
              title="Duplicate node (Cmd/Ctrl+D)"
            >
              <Copy className="size-4" />
              <span className="sr-only">Duplicate</span>
            </button>
          )}
          {callbacks.current.onDeleteSelected && (
            <button
              onClick={callbacks.current.onDeleteSelected}
              className="inline-flex size-7 items-center justify-center rounded-md text-rose-400 transition hover:bg-rose-500/15"
              title="Delete node (Delete/Backspace)"
            >
              <Trash2 className="size-4" />
              <span className="sr-only">Delete</span>
            </button>
          )}
          <button
            onClick={() => callbacks.current.onSelect?.(null)}
            className="ml-0.5 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
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
        <div
          ref={minimapRef}
          aria-label="Minimap navigation"
          onPointerDown={handleMinimapPointerDown}
          className="absolute bottom-16 right-3 hidden h-28 w-44 overflow-hidden rounded-xl border border-slate-700/60 bg-card/95 p-2 md:block shadow-2xl backdrop-blur-xl ring-1 ring-white/10 select-none cursor-pointer"
        >
          <div className="relative size-full overflow-hidden rounded-lg bg-black/40">
            <img
              src={thumbnail}
              alt="Diagram minimap"
              className="size-full object-contain opacity-75 pointer-events-none"
            />
            {minimapViewport && (
              <div
                className="absolute border-2 border-cyan-400 bg-cyan-500/25 rounded shadow-[0_0_10px_rgba(6,182,212,0.5)] cursor-grab active:cursor-grabbing pointer-events-none transition-transform"
                style={{
                  left: `${minimapViewport.left}%`,
                  top: `${minimapViewport.top}%`,
                  width: `${minimapViewport.width}%`,
                  height: `${minimapViewport.height}%`,
                }}
              />
            )}
          </div>
          <div className="absolute bottom-2.5 right-3 flex items-center gap-1 rounded bg-background/90 px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground uppercase tracking-widest pointer-events-none">
            <MapIcon className="size-2.5 text-primary" /> RADAR
          </div>
        </div>
      )}

      {/* Node Quick Search Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-border/80 bg-card text-card-foreground shadow-2xl ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
              <Search className="size-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchIndex(0);
                }}
                placeholder="Search diagram nodes by ID or label..."
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                autoFocus
                onKeyDown={(e) => {
                  const filtered = getDiagramNodes().filter(
                    (n) =>
                      !searchQuery ||
                      n.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      n.label.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                  if (e.key === "Escape") {
                    setSearchOpen(false);
                  } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    if (filtered.length > 0) {
                      setSearchIndex((prev) => (prev + 1) % filtered.length);
                    }
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    if (filtered.length > 0) {
                      setSearchIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
                    }
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    if (filtered.length > 0) {
                      const target = filtered[searchIndex] || filtered[0];
                      jumpToNode(target);
                    }
                  }
                }}
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-accent"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto p-2 space-y-1">
              {getDiagramNodes()
                .filter(
                  (n) =>
                    !searchQuery ||
                    n.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    n.label.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((node, idx) => {
                  const isSelected = idx === searchIndex;
                  return (
                    <button
                      key={node.id}
                      onClick={() => jumpToNode(node)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition ${
                        isSelected
                          ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                          : "hover:bg-accent text-foreground"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold">{node.label}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{node.id}</span>
                      </div>
                      <span className="text-[10px] text-primary font-medium flex items-center gap-1">
                        Jump <ArrowUpRight className="size-3" />
                      </span>
                    </button>
                  );
                })}
              {getDiagramNodes().filter(
                (n) =>
                  !searchQuery ||
                  n.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  n.label.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 && (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No matching nodes found
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div role="toolbar" aria-label="Canvas controls" className={`hidden md:flex absolute bottom-3.5 left-1/2 -translate-x-1/2 items-center gap-0.5 rounded-2xl border p-1 shadow-2xl backdrop-blur-xl ${
        isLight
          ? "border-slate-200/90 bg-white/95 text-slate-800 shadow-slate-300/50 ring-1 ring-black/5"
          : "border-slate-700/60 bg-slate-900/90 text-slate-200 shadow-black/60 ring-1 ring-white/10"
      }`}>
        {/* Tool Mode: Pointer (V) vs Hand (H) */}
        <div className="mr-1 flex items-center rounded-lg bg-muted/60 p-0.5">
          <button
            onClick={() => setTool("pointer")}
            className={`inline-flex size-7 items-center justify-center rounded-md transition ${
              tool === "pointer"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Select tool (V)"
            aria-pressed={tool === "pointer"}
          >
            <MousePointer2 className="size-4" />
          </button>
          <button
            onClick={() => setTool("hand")}
            className={`inline-flex size-7 items-center justify-center rounded-md transition ${
              tool === "hand"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Hand / Pan tool (H)"
            aria-pressed={tool === "hand"}
          >
            <Hand className="size-4" />
          </button>
        </div>

        <span className="mx-1 h-4 border-l border-border/80" />
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
        <span className="mx-1 h-4 border-l border-border/80" />
        <Tool title={minimap ? "Hide minimap" : "Show minimap"} aria-pressed={minimap} className={minimap ? "bg-accent text-foreground" : ""} onClick={() => setMinimap(!minimap)}>
          <MapIcon />
        </Tool>
        <Tool
          title={wheelMode === "zoom" ? "Scroll wheel zooms (click to make it pan)" : "Scroll wheel pans (click to make it zoom)"}
          aria-pressed={wheelMode === "zoom"}
          className={wheelMode === "zoom" ? "bg-accent text-foreground" : ""}
          onClick={() => setWheelMode(wheelMode === "zoom" ? "pan" : "zoom")}
        >
          <Mouse />
        </Tool>
        <Tool
          title={isSimulating ? "Stop flow simulator" : "Run flow simulator"}
          aria-pressed={isSimulating}
          className={isSimulating ? "bg-accent" : ""}
          onClick={() => setIsSimulating(!isSimulating)}
        >
          <Activity className={isSimulating ? "text-cyan-400 animate-pulse" : ""} />
        </Tool>
        <Tool
          title="Architecture health & complexity analysis"
          onClick={() => setShowMetricsModal(true)}
        >
          <BarChart2 className="text-emerald-400" />
        </Tool>
        <Tool
          title="Cloud & architecture stencils palette"
          aria-pressed={showStencilsDrawer}
          className={showStencilsDrawer ? "bg-accent" : ""}
          onClick={() => setShowStencilsDrawer(!showStencilsDrawer)}
        >
          <Cloud className="text-sky-400" />
        </Tool>
        <span className="mx-1 h-4 border-l border-border/80" />
        <Tool
          title="FinOps cloud architecture cost sizing"
          aria-pressed={showFinOps}
          className={showFinOps ? "bg-accent" : ""}
          onClick={() => setShowFinOps(!showFinOps)}
        >
          <DollarSign className="text-emerald-400" />
        </Tool>
        <Tool
          title="Architecture Decision Records (ADRs)"
          onClick={() => setShowAdrModal(true)}
        >
          <FileText className="text-amber-400" />
        </Tool>
        <Tool
          title="Architecture Review Board (ARB) Well-Architected Auditor"
          onClick={() => setShowArbModal(true)}
        >
          <Award className="text-emerald-400" />
        </Tool>
        <Tool
          title="Visual Architecture Diff & PR Review"
          onClick={() => setShowDiffModal(true)}
        >
          <GitCompare className="text-blue-400" />
        </Tool>
        <Tool
          title="Infrastructure-as-Code (Terraform / Compose)"
          onClick={() => setShowIacModal(true)}
        >
          <Terminal className="text-purple-400" />
        </Tool>
        <Tool
          title="Executive Storyboard Walkthrough"
          onClick={() => setShowStoryboard(true)}
        >
          <Compass className="text-cyan-400" />
        </Tool>
        <span className="mx-1 h-4 border-l border-border/80" />
        <Tool title="Find a node (⌘/Ctrl+P)" onClick={() => setSearchOpen(true)}>
          <Search />
        </Tool>
        {callbacks.current.onOpenExportStudio && (
          <Tool title="Export studio" onClick={callbacks.current.onOpenExportStudio}>
            <Download className="text-cyan-400" />
          </Tool>
        )}
      </div>

      {/* Interactive Data Flow Simulator Overlay */}
      <FlowSimulatorOverlay
        active={isSimulating}
        onClose={() => setIsSimulating(false)}
        containerRef={containerRef}
        position={position}
      />

      {/* Quick Architecture & Cloud Stencils Drawer */}
      <CloudStencilsDrawer
        isOpen={showStencilsDrawer}
        onClose={() => setShowStencilsDrawer(false)}
        onInsert={(snippet) => {
          onInsertStencil?.(snippet);
        }}
      />

      {/* Architecture Complexity & Metrics Modal */}
      <ArchitectureMetricsModal
        isOpen={showMetricsModal}
        onClose={() => setShowMetricsModal(false)}
        source={documentSource}
        format={documentFormat}
      />

      {/* Mobile Node Bottom Sheet for Touch Devices */}
      {activeIsMobile && selected && (
        <MobileNodeSheet
          isOpen={Boolean(selected)}
          node={selected}
          onClose={() => {
            callbacks.current.onSelect?.(null);
          }}
          onRename={(newLabel) => {
            callbacks.current.onRenameNode?.(newLabel);
          }}
          onChangeShape={(shapeId) => {
            callbacks.current.onChangeShape?.(shapeId);
          }}
          onStyleNode={(colorId) => {
            callbacks.current.onStyleNode?.(colorId);
          }}
          onAddChild={(childLabel, arrow) => {
            callbacks.current.onQuickAdd?.(childLabel, arrow);
          }}
          onDuplicate={() => {
            callbacks.current.onDuplicateSelected?.();
          }}
          onDelete={() => {
            callbacks.current.onDeleteSelected?.();
          }}
          onDrillDown={(nodeId) => {
            callbacks.current.onDrillDown?.(nodeId);
          }}
          drillDownDocId={(() => {
            const rawId = selected?.id ? flowchartNodeId(selected.id) : null;
            return rawId ? drillDownLinks?.get(rawId) || drillDownLinks?.get(selected.id) : null;
          })()}
          isFlowchart={documentFormat === "mermaid"}
        />
      )}

      {/* Architecture Decision Records (ADR) Suite Modal */}
      <AdrManagerModal
        isOpen={showAdrModal}
        onClose={() => setShowAdrModal(false)}
        documentSource={documentSource}
        initialSelectedId={selectedAdrId}
        onLinkAdrToNode={(adrId, nodeId) => {
          if (nodeId && callbacks.current.onRenameNode) {
            // Document linked ADR
            setShowAdrModal(false);
          }
        }}
      />

      {/* Visual Architecture Diff & PR Review Modal */}
      <ArchitectureDiffModal
        isOpen={showDiffModal}
        onClose={() => setShowDiffModal(false)}
        currentSource={documentSource}
      />

      {/* Infrastructure-as-Code (IaC) Synthesis Modal */}
      <IacExportModal
        isOpen={showIacModal}
        onClose={() => setShowIacModal(false)}
        source={documentSource}
        projectName={currentDocName || "Architecture"}
      />

      {/* Architecture Review Board (ARB) Auditor Modal */}
      <ArbAuditModal
        isOpen={showArbModal}
        onClose={() => setShowArbModal(false)}
        source={documentSource}
        projectName={currentDocName || "Architecture"}
      />

      {/* Executive Storyboard & Presentation Walkthrough Modal */}
      <StoryboardPresentationModal
        isOpen={showStoryboard}
        onClose={() => setShowStoryboard(false)}
        containerRef={containerRef}
        source={documentSource}
        projectName={currentDocName || "Architecture"}
      />
    </div>
  );
}
function Tool({ title, children, ...props }) {
  return (
    <Button variant="ghost" size="icon-sm" title={title} aria-label={title} {...props}>
      {children}
    </Button>
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
// phase 101-200: type fixes applied
// Canvas fixes: selection, drag, edge, zoom, grid, render, events, state, mobile
Performance fix: memoized expensive calculations
