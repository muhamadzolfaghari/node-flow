import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { persistedCanvasSchema } from "./schemas.ts";

export interface CameraState {
  x: number;
  y: number;
  z: number;
}

export interface CanvasStore {
  // Camera
  camera: CameraState;
  setCamera: (cam: Partial<CameraState>) => void;
  fitCamera: (cam: CameraState) => void;
  // UI toggles
  tool: "pointer" | "hand";
  setTool: (t: "pointer" | "hand") => void;
  wheelMode: "zoom" | "pan";
  setWheelMode: (m: "zoom" | "pan") => void;
  minimap: boolean;
  setMinimap: (v: boolean) => void;
  grid: "dots" | "lines" | "blueprint" | "none";
  setGrid: (g: "dots" | "lines" | "blueprint" | "none") => void;
  // Active lens
  activeLens: string;
  setActiveLens: (lens: string) => void;
  // Simulator
  isSimulating: boolean;
  setIsSimulating: (v: boolean) => void;
  // Selection/modals
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  editLabel: string;
  setEditLabel: (v: string) => void;
  showShapes: boolean;
  setShowShapes: (v: boolean) => void;
  showColors: boolean;
  setShowColors: (v: boolean) => void;
  showConnect: boolean;
  setShowConnect: (v: boolean) => void;
  showZoomMenu: boolean;
  setShowZoomMenu: (v: boolean) => void;
  showBatchColors: boolean;
  setShowBatchColors: (v: boolean) => void;
  showMetricsModal: boolean;
  setShowMetricsModal: (v: boolean) => void;
  showAdrModal: boolean;
  setShowAdrModal: (v: boolean) => void;
  showDiffModal: boolean;
  setShowDiffModal: (v: boolean) => void;
  showFinOps: boolean;
  setShowFinOps: (v: boolean) => void;
  showIacModal: boolean;
  setShowIacModal: (v: boolean) => void;
  showArbModal: boolean;
  setShowArbModal: (v: boolean) => void;
  showStencilsDrawer: boolean;
  setShowStencilsDrawer: (v: boolean) => void;
  showStoryboard: boolean;
  setShowStoryboard: (v: boolean) => void;
  showMoreTools: boolean;
  setShowMoreTools: (v: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  searchIndex: number;
  setSearchIndex: (v: number) => void;
  // Mobile
  isMobile: boolean;
  setIsMobile: (v: boolean) => void;
  mobileMode: "preview" | "edit";
  setMobileMode: (m: "preview" | "edit") => void;
  // Node anchor
  nodeAnchorX: number;
  nodeAnchorY: number;
  nodeAnchorElLeft: number;
  nodeAnchorElTop: number;
  nodeAnchorElWidth: number;
  nodeAnchorElHeight: number;
  setNodeAnchor: (anchor: { x: number; y: number; elLeft: number; elTop: number; elWidth: number; elHeight: number } | null) => void;
  // Batch selection
  batchSelectedIds: string[];
  setBatchSelectedIds: (ids: string[]) => void;
  // Marquee
  marqueeLeft: number;
  marqueeTop: number;
  marqueeWidth: number;
  marqueeHeight: number;
  setMarquee: (rect: { left: number; top: number; width: number; height: number } | null) => void;
  // Connect drag
  connectDrag: { fromId: string; startX: number; startY: number; currentX: number; currentY: number } | null;
  setConnectDrag: (drag: { fromId: string; startX: number; startY: number; currentX: number; currentY: number } | null) => void;
  // Laser
  laserX: number | null;
  laserY: number | null;
  setLaser: (x: number | null, y: number | null) => void;
  // Thumbnail
  thumbnail: string;
  setThumbnail: (v: string) => void;
  // Size
  canvasSizeW: number;
  canvasSizeH: number;
  setCanvasSize: (w: number, h: number) => void;
  // Space panning
  spacePanning: boolean;
  setSpacePanning: (v: boolean) => void;
  // Dragging
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
}

export const useCanvasStore = create<CanvasStore>()(
  persist(
    (set) => ({
      // Camera
      camera: { x: 30, y: 30, z: 1 },
      setCamera: (cam) => set((s) => ({ camera: { ...s.camera, ...cam } })),
      fitCamera: (cam) => set({ camera: cam }),
      // UI toggles
      tool: "pointer",
      setTool: (t) => set({ tool: t }),
      wheelMode: "zoom",
      setWheelMode: (m) => set({ wheelMode: m }),
      minimap: true,
      setMinimap: (v) => set({ minimap: v }),
      grid: "dots",
      setGrid: (g) => set({ grid: g }),
      // Active lens
      activeLens: "standard",
      setActiveLens: (lens) => set({ activeLens: lens }),
      // Simulator
      isSimulating: false,
      setIsSimulating: (v) => set({ isSimulating: v }),
      // Selection/modals
      selectedId: null,
      setSelectedId: (id) => set({ selectedId: id }),
      isEditing: false,
      setIsEditing: (v) => set({ isEditing: v }),
      editLabel: "",
      setEditLabel: (v) => set({ editLabel: v }),
      showShapes: false,
      setShowShapes: (v) => set({ showShapes: v }),
      showColors: false,
      setShowColors: (v) => set({ showColors: v }),
      showConnect: false,
      setShowConnect: (v) => set({ showConnect: v }),
      showZoomMenu: false,
      setShowZoomMenu: (v) => set({ showZoomMenu: v }),
      showBatchColors: false,
      setShowBatchColors: (v) => set({ showBatchColors: v }),
      showMetricsModal: false,
      setShowMetricsModal: (v) => set({ showMetricsModal: v }),
      showAdrModal: false,
      setShowAdrModal: (v) => set({ showAdrModal: v }),
      showDiffModal: false,
      setShowDiffModal: (v) => set({ showDiffModal: v }),
      showFinOps: false,
      setShowFinOps: (v) => set({ showFinOps: v }),
      showIacModal: false,
      setShowIacModal: (v) => set({ showIacModal: v }),
      showArbModal: false,
      setShowArbModal: (v) => set({ showArbModal: v }),
      showStencilsDrawer: false,
      setShowStencilsDrawer: (v) => set({ showStencilsDrawer: v }),
      showStoryboard: false,
      setShowStoryboard: (v) => set({ showStoryboard: v }),
      showMoreTools: false,
      setShowMoreTools: (v) => set({ showMoreTools: v }),
      searchOpen: false,
      setSearchOpen: (v) => set({ searchOpen: v }),
      searchQuery: "",
      setSearchQuery: (v) => set({ searchQuery: v }),
      searchIndex: 0,
      setSearchIndex: (v) => set({ searchIndex: v }),
      // Mobile
      isMobile: false,
      setIsMobile: (v) => set({ isMobile: v }),
      mobileMode: "preview",
      setMobileMode: (m) => set({ mobileMode: m }),
      // Node anchor
      nodeAnchorX: 0,
      nodeAnchorY: 0,
      nodeAnchorElLeft: 0,
      nodeAnchorElTop: 0,
      nodeAnchorElWidth: 0,
      nodeAnchorElHeight: 0,
      setNodeAnchor: (anchor) =>
        set((anchor
          ? {
              nodeAnchorX: anchor.x,
              nodeAnchorY: anchor.y,
              nodeAnchorElLeft: anchor.elLeft,
              nodeAnchorElTop: anchor.elTop,
              nodeAnchorElWidth: anchor.elWidth,
              nodeAnchorElHeight: anchor.elHeight,
            }
          : {
              nodeAnchorX: 0,
              nodeAnchorY: 0,
              nodeAnchorElLeft: 0,
              nodeAnchorElTop: 0,
              nodeAnchorElWidth: 0,
              nodeAnchorElHeight: 0,
            })),
      // Batch selection
      batchSelectedIds: [],
      setBatchSelectedIds: (ids) => set({ batchSelectedIds: ids }),
      // Marquee
      marqueeLeft: 0,
      marqueeTop: 0,
      marqueeWidth: 0,
      marqueeHeight: 0,
      setMarquee: (rect) =>
        set(rect
          ? {
              marqueeLeft: rect.left,
              marqueeTop: rect.top,
              marqueeWidth: rect.width,
              marqueeHeight: rect.height,
            }
          : { marqueeLeft: 0, marqueeTop: 0, marqueeWidth: 0, marqueeHeight: 0 }),
      // Connect drag
      connectDrag: null,
      setConnectDrag: (drag) => set({ connectDrag: drag }),
      // Laser
      laserX: null,
      laserY: null,
      setLaser: (x, y) => set({ laserX: x, laserY: y }),
      // Thumbnail
      thumbnail: "",
      setThumbnail: (v) => set({ thumbnail: v }),
      // Size
      canvasSizeW: 1000,
      canvasSizeH: 700,
      setCanvasSize: (w, h) => set({ canvasSizeW: w, canvasSizeH: h }),
      // Space panning
      spacePanning: false,
      setSpacePanning: (v) => set({ spacePanning: v }),
      // Dragging
      isDragging: false,
      setIsDragging: (v) => set({ isDragging: v }),
    }),
    {
      name: "canvas-storage",
      merge: (persisted, current) => ({
        ...current,
        ...persistedCanvasSchema.parse(persisted ?? {}),
      }),
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        activeLens: s.activeLens,
        grid: s.grid,
        tool: s.tool,
        wheelMode: s.wheelMode,
        minimap: s.minimap,
      }),
    },
  ),
);
