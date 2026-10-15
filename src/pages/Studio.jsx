import { useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  FilePlus,
  FolderPlus,
  FolderOpen,
  Files,
  Download,
  Upload,
  Undo2,
  Redo2,
  Search,
  PanelLeft,
  PanelRight,
  Code2,
  X,
  ChevronDown,
  Maximize,
  Settings2,
  History,
  Sparkles,
  Play,
  CheckCircle2,
  AlertCircle,
  GitBranch,
  GitCommit,
  Copy,
  Save,
  Shapes,
  Braces,
  FileCode2,
  Pencil,
  Trash2,
  Plus,
  Palette,
  PieChart,
  Compass,
  Kanban,
  Calendar,
  Crosshair,
  Clock,
  Split,
  LineChart,
  Boxes,
  Layers,
  ClipboardList,
  Binary,
  Network,
  Minus,
  RotateCcw,
  Image,
} from "lucide-react";
import {
  Button,
  Input,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  ContextMenu,
} from "../components/ui.jsx";
import CodeEditor from "../components/CodeEditor.jsx";
import CanvasStage, { GridToggle } from "../components/CanvasStage.jsx";
import DiagnosticsPanel from "../components/DiagnosticsPanel.jsx";
import { DIAGRAM_TEMPLATES, getTemplateById } from "../components/templates.js";
import {
  FORMATS,
  FILE_ACCEPT,
  getFormat,
  importDocument,
} from "../lib/formats.js";
import {
  createDocument,
  createProject,
  addDocuments,
  parseProject,
  serializeProject,
  uid,
} from "../lib/workspace.js";
import { useWorkspace } from "../hooks/useWorkspace.jsx";
import { useDocumentPreview } from "../hooks/useDocumentPreview.js";
import { useDiagramAssistant } from "../hooks/useDiagramAssistant.js";
import { Exporter } from "../components/exporter.js";
import { StorageManager } from "../components/storage.js";
import { formatMermaidCode } from "../utils/mermaid-formatter.js";
import { SUPPORTED_DIAGRAM_TYPES } from "../utils/importers/describe-to-diagram.js";
import {
  isFlowchart,
  flowchartNodes,
  renameFlowchartNode,
  addFlowchartNode,
  connectFlowchartNodes,
  deleteFlowchartNode,
  changeFlowchartNodeShape,
  getFlowchartNodeShape,
  SHAPES,
  COLOR_PRESETS,
  styleFlowchartNode,
  ARROW_STYLES,
  addFlowchartChild,
  FLOWCHART_DIRECTIONS,
  getFlowchartDirection,
  changeFlowchartDirection,
  duplicateFlowchartNode,
  flowchartEdges,
  deleteFlowchartEdge,
  DIAGRAM_LOOKS,
  DIAGRAM_THEMES,
  getDiagramConfig,
  updateDiagramConfig,
  isSequence,
  sequenceParticipants,
  addSequenceParticipant,
  addSequenceMessage,
  deleteSequenceParticipant,
  SEQUENCE_ARROWS,
  isClassDiagram,
  classDiagramClasses,
  addClassDiagramClass,
  addClassDiagramMember,
  connectClassDiagramClasses,
  deleteClassDiagramClass,
  CLASS_RELATIONS,
  isState,
  stateDiagramStates,
  addStateDiagramState,
  connectStateDiagramStates,
  deleteStateDiagramState,
  isErDiagram,
  erDiagramEntities,
  addErDiagramEntity,
  addErDiagramAttribute,
  connectErDiagramEntities,
  deleteErDiagramEntity,
  ER_RELATIONS,
  isMindmap,
  MINDMAP_SHAPES,
  mindmapNodes,
  addMindmapChild,
  deleteMindmapNode,
  isGitGraph,
  GIT_COMMIT_TYPES,
  gitGraphBranches,
  addGitCommit,
  addGitBranch,
  checkoutGitBranch,
  mergeGitBranch,
  isPie,
  pieData,
  addPieSlice,
  deletePieSlice,
  setPieTitle,
  isJourney,
  journeySections,
  addJourneySection,
  addJourneyTask,
  deleteJourneyTask,
  isKanban,
  kanbanColumns,
  addKanbanColumn,
  addKanbanCard,
  deleteKanbanCard,
  isGantt,
  ganttSections,
  addGanttSection,
  addGanttTask,
  deleteGanttTask,
  isQuadrantChart,
  quadrantPoints,
  addQuadrantPoint,
  deleteQuadrantPoint,
  isTimeline,
  timelineSections,
  addTimelineSection,
  addTimelineEvent,
  deleteTimelineEvent,
  isSankey,
  sankeyLinks,
  addSankeyLink,
  deleteSankeyLink,
  isXyChart,
  xyChartData,
  updateXyChartTitle,
  addXyChartSeries,
  deleteXyChartSeries,
  isBlock,
  getBlockColumns,
  setBlockColumns,
  blockItems,
  addBlockItem,
  deleteBlockItem,
  isC4,
  c4Elements,
  c4Relations,
  addC4Element,
  deleteC4Element,
  addC4Relation,
  deleteC4Relation,
  isRequirement,
  requirementItems,
  requirementRelations,
  addRequirement,
  addRequirementElement,
  deleteRequirement,
  addRequirementRelation,
  deleteRequirementRelation,
  isPacket,
  packetFields,
  addPacketField,
  deletePacketField,
  isArchitecture,
  architectureGroups,
  architectureServices,
  architectureEdges,
  addArchitectureGroup,
  deleteArchitectureGroup,
  addArchitectureService,
  deleteArchitectureService,
  addArchitectureEdge,
  deleteArchitectureEdge,
} from "../lib/visual-editing.js";
import { cn } from "../lib/utils.js";

const BLANK =
  "flowchart TD\n  Start([Start]) --> Process[Process task]\n  Process --> Done([Complete])";
export default function Studio() {
  const [params] = useSearchParams(),
    location = useLocation(),
    nav = useNavigate();
  const {
    workspace,
    project,
    saveStatus,
    updateProject,
    addProject,
    setWorkspace,
  } = useWorkspace(params.get("project"));
  const document = project.documents.find((d) => d.id === project.activeId);
  const fileRef = useRef(null),
    folderRef = useRef(null),
    editorRef = useRef(null),
    canvasRef = useRef(null),
    shellRef = useRef(null),
    entryRef = useRef(null),
    splitRef = useRef(null);
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const resize = () => {
      setWidth(window.innerWidth);
      if (window.innerWidth < 1024) {
        setExplorer(false);
        setView((v) => (v === "split" ? "canvas" : v));
      }
      if (window.innerWidth < 1280) setInspector(false);
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  const [explorer, setExplorer] = useState(() => window.innerWidth > 900),
    [inspector, setInspector] = useState(() => window.innerWidth >= 1280),
    [view, setView] = useState(() =>
      window.innerWidth < 900 ? "canvas" : "split",
    );
  const [theme, setTheme] = useState("dark"),
    [grid, setGrid] = useState("dots"),
    [toast, setToast] = useState(""),
    [contextMenu, setContextMenu] = useState({
      isOpen: false,
      position: { x: 0, y: 0 },
      title: "",
      items: [],
    }),
    [dialog, setDialog] = useState(null),
    [renameId, setRenameId] = useState(null),
    [format, setFormat] = useState("mermaid"),
    [name, setName] = useState(""),
    [query, setQuery] = useState("");
  const projectRef = useRef(project);
  projectRef.current = project;
  const [inspectorTab, setInspectorTab] = useState("properties"),
    [selected, setSelected] = useState(null),
    [label, setLabel] = useState(""),
    [nodeLabel, setNodeLabel] = useState(""),
    [newShape, setNewShape] = useState("rectangle"),
    [edgeFrom, setEdgeFrom] = useState(""),
    [edgeTo, setEdgeTo] = useState(""),
    [edgeLabel, setEdgeLabel] = useState(""),
    [edgeArrow, setEdgeArrow] = useState("solid"),
    // Sequence diagram modeling state
    [seqId, setSeqId] = useState(""),
    [seqLabel, setSeqLabel] = useState(""),
    [seqType, setSeqType] = useState("participant"),
    [seqFrom, setSeqFrom] = useState(""),
    [seqTo, setSeqTo] = useState(""),
    [seqMsg, setSeqMsg] = useState(""),
    [seqArrow, setSeqArrow] = useState("solid"),
    // Class diagram modeling state
    [clsName, setClsName] = useState(""),
    [clsTarget, setClsTarget] = useState(""),
    [clsMember, setClsMember] = useState(""),
    [clsFrom, setClsFrom] = useState(""),
    [clsTo, setClsTo] = useState(""),
    [clsRel, setClsRel] = useState("inheritance"),
    [clsRelLabel, setClsRelLabel] = useState(""),
    // State diagram modeling state
    [stateId, setStateId] = useState(""),
    [stateLabel, setStateLabel] = useState(""),
    [stateFrom, setStateFrom] = useState(""),
    [stateTo, setStateTo] = useState(""),
    [stateEvent, setStateEvent] = useState(""),
    // ER diagram modeling state
    [erEntity, setErEntity] = useState(""),
    [erAttrTarget, setErAttrTarget] = useState(""),
    [erAttrType, setErAttrType] = useState("string"),
    [erAttrName, setErAttrName] = useState(""),
    [erAttrKey, setErAttrKey] = useState(""),
    [erFrom, setErFrom] = useState(""),
    [erTo, setErTo] = useState(""),
    [erRel, setErRel] = useState("||--o{"),
    [erRelLabel, setErRelLabel] = useState(""),
    // Mindmap modeling state
    [mmParent, setMmParent] = useState(""),
    [mmChild, setMmChild] = useState(""),
    [mmShape, setMmShape] = useState("default"),
    // GitGraph modeling state
    [gitCommitMsg, setGitCommitMsg] = useState(""),
    [gitCommitTag, setGitCommitTag] = useState(""),
    [gitCommitType, setGitCommitType] = useState("NORMAL"),
    [gitBranchName, setGitBranchName] = useState(""),
    [gitCheckoutTarget, setGitCheckoutTarget] = useState(""),
    [gitMergeBranch, setGitMergeBranch] = useState(""),
    [gitMergeTag, setGitMergeTag] = useState(""),
    // Pie chart modeling state
    [pieTitleInput, setPieTitleInput] = useState(""),
    [pieSliceLabel, setPieSliceLabel] = useState(""),
    [pieSliceVal, setPieSliceVal] = useState(""),
    // Journey modeling state
    [journeySecName, setJourneySecName] = useState(""),
    [journeyTaskName, setJourneyTaskName] = useState(""),
    [journeyScore, setJourneyScore] = useState("5"),
    [journeyActors, setJourneyActors] = useState("User"),
    [journeyTargetSec, setJourneyTargetSec] = useState(""),
    // Kanban modeling state
    [kanbanColName, setKanbanColName] = useState(""),
    [kanbanTargetCol, setKanbanTargetCol] = useState(""),
    [kanbanCardText, setKanbanCardText] = useState(""),
    // Gantt modeling state
    [ganttSecName, setGanttSecName] = useState(""),
    [ganttTargetSec, setGanttTargetSec] = useState(""),
    [ganttTaskName, setGanttTaskName] = useState(""),
    [ganttTaskStatus, setGanttTaskStatus] = useState("active"),
    [ganttTaskDur, setGanttTaskDur] = useState("5d"),
    // Quadrant modeling state
    [quadLabel, setQuadLabel] = useState(""),
    [quadX, setQuadX] = useState("0.5"),
    [quadY, setQuadY] = useState("0.5"),
    // Timeline modeling state
    [timelineSecName, setTimelineSecName] = useState(""),
    [timelineTargetSec, setTimelineTargetSec] = useState(""),
    [timelineEvtName, setTimelineEvtName] = useState(""),
    [timelineEvtDesc, setTimelineEvtDesc] = useState(""),
    // Sankey modeling state
    [sankeySrc, setSankeySrc] = useState(""),
    [sankeyDst, setSankeyDst] = useState(""),
    [sankeyVal, setSankeyVal] = useState(""),
    // XY Chart modeling state
    [xySeriesType, setXySeriesType] = useState("bar"),
    [xySeriesVals, setXySeriesVals] = useState(""),
    [xyTitleInput, setXyTitleInput] = useState(""),
    // Block diagram modeling state
    [blockIdInput, setBlockIdInput] = useState(""),
    [blockLabelInput, setBlockLabelInput] = useState(""),
    [blockSpanInput, setBlockSpanInput] = useState("1"),
    [blockColsInput, setBlockColsInput] = useState("4"),
    // C4 Architecture modeling state
    [c4ElType, setC4ElType] = useState("System"),
    [c4ElId, setC4ElId] = useState(""),
    [c4ElLabel, setC4ElLabel] = useState(""),
    [c4ElDesc, setC4ElDesc] = useState(""),
    [c4RelFrom, setC4RelFrom] = useState(""),
    [c4RelTo, setC4RelTo] = useState(""),
    [c4RelLabel, setC4RelLabel] = useState("Uses"),
    // Requirement diagram modeling state
    [reqType, setReqType] = useState("functionalRequirement"),
    [reqName, setReqName] = useState(""),
    [reqId, setReqId] = useState(""),
    [reqText, setReqText] = useState(""),
    [reqRisk, setReqRisk] = useState("low"),
    [reqVerify, setReqVerify] = useState("test"),
    [reqElName, setReqElName] = useState(""),
    [reqElType, setReqElType] = useState("module"),
    [reqRelFrom, setReqRelFrom] = useState(""),
    [reqRelTo, setReqRelTo] = useState(""),
    [reqRelType, setReqRelType] = useState("satisfies"),
    // Packet diagram modeling state
    [pktStart, setPktStart] = useState(""),
    [pktEnd, setPktEnd] = useState(""),
    [pktLabel, setPktLabel] = useState(""),
    // Architecture diagram modeling state
    [archSvcId, setArchSvcId] = useState(""),
    [archSvcTitle, setArchSvcTitle] = useState(""),
    [archSvcIcon, setArchSvcIcon] = useState("server"),
    [archSvcGroup, setArchSvcGroup] = useState(""),
    [archGrpId, setArchGrpId] = useState(""),
    [archGrpTitle, setArchGrpTitle] = useState(""),
    [archGrpIcon, setArchGrpIcon] = useState("cloud"),
    [archEdgeFrom, setArchEdgeFrom] = useState(""),
    [archEdgeFromSide, setArchEdgeFromSide] = useState("R"),
    [archEdgeTo, setArchEdgeTo] = useState(""),
    [archEdgeToSide, setArchEdgeToSide] = useState("L"),
    [archEdgeDirected, setArchEdgeDirected] = useState(false),
    [prompt, setPrompt] = useState(""),
    [aiType, setAiType] = useState("auto"),
    [aiMode, setAiMode] = useState("instant"),
    [presentation, setPresentation] = useState(false);
  const assistant = useDiagramAssistant();
  const preview = useDocumentPreview(document, theme, view);
  const definition = getFormat(document?.format),
    nodes = isFlowchart(document) ? flowchartNodes(document.source) : [];
  const seqParticipants = useMemo(() => {
    return isSequence(document) ? sequenceParticipants(document.source) : [];
  }, [document?.source]);
  const clsList = useMemo(() => {
    return isClassDiagram(document) ? classDiagramClasses(document.source) : [];
  }, [document?.source]);
  const stateList = useMemo(() => {
    return isState(document) ? stateDiagramStates(document.source) : [];
  }, [document?.source]);
  const erList = useMemo(() => {
    return isErDiagram(document) ? erDiagramEntities(document.source) : [];
  }, [document?.source]);
  const mmList = useMemo(() => {
    return isMindmap(document) ? mindmapNodes(document.source) : [];
  }, [document?.source]);
  const gitBranches = useMemo(() => {
    return isGitGraph(document) ? gitGraphBranches(document.source) : [];
  }, [document?.source]);
  const pieInfo = useMemo(() => {
    return isPie(document) ? pieData(document.source) : { title: "", slices: [] };
  }, [document?.source]);
  const journeySecs = useMemo(() => {
    return isJourney(document) ? journeySections(document.source) : [];
  }, [document?.source]);
  const kanbanCols = useMemo(() => {
    return isKanban(document) ? kanbanColumns(document.source) : [];
  }, [document?.source]);
  const ganttSecs = useMemo(() => {
    return isGantt(document) ? ganttSections(document.source) : [];
  }, [document?.source]);
  const quadPoints = useMemo(() => {
    return isQuadrantChart(document) ? quadrantPoints(document.source) : [];
  }, [document?.source]);
  const timelineSecs = useMemo(() => {
    return isTimeline(document) ? timelineSections(document.source) : [];
  }, [document?.source]);
  const sankeyFlows = useMemo(() => {
    return isSankey(document) ? sankeyLinks(document.source) : [];
  }, [document?.source]);
  const xyInfo = useMemo(() => {
    return isXyChart(document) ? xyChartData(document.source) : null;
  }, [document?.source]);
  const blockElements = useMemo(() => {
    return isBlock(document) ? blockItems(document.source) : [];
  }, [document?.source]);
  const blockColumnsCount = useMemo(() => {
    return isBlock(document) ? getBlockColumns(document.source) : 1;
  }, [document?.source]);
  const c4Els = useMemo(() => {
    return isC4(document) ? c4Elements(document.source) : [];
  }, [document?.source]);
  const c4Rels = useMemo(() => {
    return isC4(document) ? c4Relations(document.source) : [];
  }, [document?.source]);
  const reqItems = useMemo(() => {
    return isRequirement(document) ? requirementItems(document.source) : [];
  }, [document?.source]);
  const reqRels = useMemo(() => {
    return isRequirement(document) ? requirementRelations(document.source) : [];
  }, [document?.source]);
  const pktList = useMemo(() => {
    return isPacket(document) ? packetFields(document.source) : [];
  }, [document?.source]);
  const archGroupList = useMemo(() => {
    return isArchitecture(document) ? architectureGroups(document.source) : [];
  }, [document?.source]);
  const archServiceList = useMemo(() => {
    return isArchitecture(document) ? architectureServices(document.source) : [];
  }, [document?.source]);
  const archEdgeList = useMemo(() => {
    return isArchitecture(document) ? architectureEdges(document.source) : [];
  }, [document?.source]);
  const diagramConfig = useMemo(() => {
    return document?.format === "mermaid"
      ? getDiagramConfig(document.source)
      : { look: "classic", theme: "default" };
  }, [document?.source]);
  const say = (message) => setToast(message);
  const updateSource = (id, source) =>
    updateProject((p) => ({
      ...p,
      documents: p.documents.map((d) =>
        d.id === id ? { ...d, source, updatedAt: new Date().toISOString() } : d,
      ),
    }));
  const openDocument = (id) => {
    updateProject((p) => ({
      ...p,
      activeId: id,
      openIds: p.openIds.includes(id) ? p.openIds : [...p.openIds, id],
    }));
    setSelected(null);
  };
  const newFiles = (docs) => {
    updateProject((p) => addDocuments(p, docs));
    setSelected(null);
  };
  const openNewFile = (chosen = "mermaid") => {
    setFormat(chosen);
    setName(`untitled.${getFormat(chosen).ext}`);
    setDialog("new-file");
  };
  const selectTemplate = (template) => {
    newFiles([
      {
        name: `${template.id}.${template.kind === "graphviz" ? "dot" : "mmd"}`,
        source: template.code,
        format: template.kind === "graphviz" ? "graphviz" : "mermaid",
      },
    ]);
    setDialog(null);
  };

  useEffect(() => {
    if (entryRef.current === location.key) return;
    entryRef.current = location.key;
    const template = DIAGRAM_TEMPLATES.find(
      (t) => t.id === params.get("template"),
    );
    if (template) {
      selectTemplate(template);
      nav("/studio", { replace: true });
      return;
    }
    if (params.get("fresh")) {
      newFiles([{ name: "flowchart.mmd", format: "mermaid", source: BLANK }]);
      nav("/studio", { replace: true });
      return;
    }
    const legacy = location.state?.diagram;
    if (legacy?.code) {
      newFiles([
        {
          name: `${Exporter.sanitizeFilename(legacy.title)}.mmd`,
          format: "mermaid",
          source: legacy.code,
        },
      ]);
      nav("/studio", { replace: true });
    }
  }, [location.key]);
  useEffect(() => {
    setSelected(null);
  }, [document?.id]);
  useEffect(() => {
    if (toast) {
      const timeout = setTimeout(() => setToast(""), 4500);
      return () => clearTimeout(timeout);
    }
  }, [toast]);
  useEffect(() => {
    const onKey = (e) => {
      const key = e.key.toLowerCase(),
        modifier = e.metaKey || e.ctrlKey;
      if (modifier && key === "s") {
        e.preventDefault();
        say(
          saveStatus === "Saved locally"
            ? "Project saved in this browser"
            : saveStatus,
        );
      }
      if (modifier && key === "o") {
        e.preventDefault();
        fileRef.current?.click();
      }
      if (modifier && key === "i") {
        e.preventDefault();
        fileRef.current?.click();
      }
      if (modifier && e.shiftKey && key === "n") {
        e.preventDefault();
        openNewFile();
      }
      if (modifier && key === "w") {
        if (projectRef.current.activeId) {
          e.preventDefault();
          closeTab(projectRef.current.activeId);
        }
      }
      if (modifier && e.shiftKey && key === "t") {
        e.preventDefault();
        reopenClosedTab();
      }
      if (e.key === "F2" && projectRef.current.activeId) {
        if (!e.target.closest("input,textarea,[contenteditable]")) {
          e.preventDefault();
          startRenameFile(projectRef.current.activeId);
        }
      }
      if (key === "?" && !e.target.closest("input,textarea,[contenteditable]"))
        setDialog("shortcuts");
    };
    const fullscreen = () => {
      if (!globalThis.document.fullscreenElement) setPresentation(false);
    };
    window.addEventListener("keydown", onKey);
    globalThis.document.addEventListener("fullscreenchange", fullscreen);
    return () => {
      window.removeEventListener("keydown", onKey);
      globalThis.document.removeEventListener("fullscreenchange", fullscreen);
    };
  }, [saveStatus]);

  async function importFiles(files) {
    const accepted = [],
      failures = [];
    for (const file of Array.from(files || [])) {
      try {
        if (file.size > 30 * 1024 * 1024)
          throw new Error("Project or archive exceeds 30 MB.");
        if (file.name.toLowerCase().endsWith(".atlas")) {
          const imported = parseProject(await file.text());
          addProject({ ...imported, id: uid() });
          nav("/studio", { replace: true });
          say(`Opened ${imported.name}`);
        } else if (file.name.toLowerCase().endsWith(".zip")) {
          const { default: JSZip } = await import("jszip");
          const archive = await JSZip.loadAsync(await file.arrayBuffer());
          const backup = archive.file("project.atlas");
          if (backup) {
            const data = await backup.async("uint8array");
            if (data.length > 30 * 1024 * 1024)
              throw new Error("Expanded project backup exceeds 30 MB.");
            const imported = parseProject(new TextDecoder().decode(data));
            addProject({ ...imported, id: uid() });
            nav("/studio", { replace: true });
            say(`Restored ${imported.name}, including snapshots`);
            continue;
          }
          const entries = Object.values(archive.files).filter(
            (f) =>
              !f.dir &&
              !f.name.startsWith("__MACOSX/") &&
              !f.name.split("/").some((part) => part.startsWith(".")),
          );
          if (entries.length > 100)
            throw new Error("A workspace supports up to 100 files.");
          let total = 0;
          for (const entry of entries) {
            const data = await entry.async("uint8array");
            total += data.length;
            if (total > 30 * 1024 * 1024)
              throw new Error("Expanded archive exceeds 30 MB.");
            const input = new File([data], entry.name);
            try {
              accepted.push(await importDocument(input));
            } catch (e) {
              failures.push(`${entry.name}: ${e.message}`);
            }
          }
        } else accepted.push(await importDocument(file));
      } catch (e) {
        failures.push(`${file.name}: ${e.message}`);
      }
    }
    if (accepted.length) {
      if (project.documents.length + accepted.length > 100) {
        say("The project supports up to 100 files. Create another project.");
        return;
      }
      newFiles(accepted);
      say(`Opened ${accepted.length} file${accepted.length === 1 ? "" : "s"}`);
    }
    if (failures.length) {
      setName(failures.join("\n"));
      setDialog("import-errors");
    }
  }
  const download = (content, filename, type = "text/plain") =>
    Exporter.downloadBlob(new Blob([content], { type }), filename);
  const projectBackup = () => {
    download(
      serializeProject(project),
      `${Exporter.sanitizeFilename(project.name)}.atlas`,
      "application/json",
    );
    say("Project backup downloaded");
  };
  async function downloadZip() {
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      zip.file("project.atlas", serializeProject(project));
      for (const doc of project.documents) {
        const path = doc.name
          .split("/")
          .filter((part) => part && part !== "." && part !== "..")
          .join("/");
        zip.file(`sources/${path || `${doc.id}.txt`}`, doc.source);
        if (doc.original)
          zip.file(
            `originals/${doc.original.name.split("/").pop()}`,
            doc.original.base64,
            { base64: true },
          );
      }
      Exporter.downloadBlob(
        await zip.generateAsync({ type: "blob" }),
        `${Exporter.sanitizeFilename(project.name)}.zip`,
      );
    } catch (e) {
      say(e.message);
    }
  }
  async function doExport(kind) {
    if (!document) return;
    try {
      const title = document.name.replace(/\.[^.]+$/, "");
      if (kind === "source") {
        if (document.format === "xmind") {
          const { exportMermaidToXmindBlob } =
            await import("../utils/importers/xmind.js");
          Exporter.downloadBlob(
            await exportMermaidToXmindBlob(document.source, title),
            document.name,
          );
        } else download(document.source, document.name);
        return;
      }
      if (kind === "mermaid") {
        download(preview.code, `${title}.mmd`);
        return;
      }
      if (kind === "original" && document.original) {
        const bytes = Uint8Array.from(atob(document.original.base64), (c) =>
          c.charCodeAt(0),
        );
        Exporter.downloadBlob(new Blob([bytes]), document.original.name);
        return;
      }
      if (preview.error || preview.status.state !== "ok")
        throw new Error(
          "Resolve preview errors before exporting the current diagram.",
        );
      const el = preview.containerRef.current;
      if (!el?.querySelector("svg"))
        throw new Error(
          "Switch to Canvas or Split view before exporting an image.",
        );
      if (kind === "svg")
        Exporter.downloadSvg(el, title, {
          source: document.source,
          format: document.format,
        });
      else if (kind === "png")
        await Exporter.downloadPng(el, title, { scale: 2 });
      else if (kind === "png4")
        await Exporter.downloadPng(el, title, { scale: 4 });
      else if (kind === "pdf")
        await Exporter.downloadPdf(el, title, {
          pageSize: "fit",
          background: "#ffffff",
          padding: 32,
        });
      else if (kind === "html")
        Exporter.downloadStandaloneHtml(el, preview.code, title);
      else if (kind === "pptx")
        await Exporter.downloadPptx(el, title, {
          background: "#ffffff",
          padding: 32,
        });
      else if (kind === "pptx-deck") {
        say("Generating presentation deck...");
        await Exporter.downloadProjectDeckPptx(
          [{ title, container: el }],
          project?.name || title,
          { background: "#ffffff", padding: 32 }
        );
        say("Presentation deck downloaded");
      }
      else if (kind === "ai")
        Exporter.downloadIllustratorSvg(el, title, {
          background: "#ffffff",
          padding: 32,
        });
      else if (kind === "copy") await Exporter.copyMarkdown(preview.code);
      else if (kind === "plantuml" || kind === "dot" || kind === "d2" || kind === "sql" || kind === "dbml" || kind === "xmi" || kind === "ts" || kind === "opml" || kind === "md" || kind === "openapi" || kind === "prisma" || kind === "graphql" || kind === "terraform") {
        const mod = await import("../utils/exporters/mermaid-export.js");
        const map = {
          plantuml: ["mermaidToPlantUml", "puml"],
          dot: ["mermaidToDot", "dot"],
          d2: ["mermaidToD2", "d2"],
          sql: ["mermaidErToSql", "sql"],
          dbml: ["mermaidErToDbml", "dbml"],
          xmi: ["mermaidClassToXmi", "xmi"],
          ts: ["mermaidClassToTypeScript", "ts"],
          opml: ["mermaidMindmapToOpml", "opml"],
          md: ["mermaidMindmapToMarkdown", "md"],
          openapi: ["mermaidSequenceToOpenApiStub", "json"],
          prisma: ["mermaidErToPrisma", "prisma"],
          graphql: ["mermaidClassToGraphql", "graphql"],
          terraform: ["mermaidArchitectureToTerraform", "tf"],
        };
        const [fn, ext] = map[kind];
        download(mod[fn](preview.code, title), `${title}.${ext}`);
      }
      else if (kind === "xmind") {
        if (!/^\s*mindmap/m.test(preview.code))
          throw new Error("XMind export requires a mindmap.");
        const { exportMermaidToXmindBlob } =
          await import("../utils/importers/xmind.js");
        Exporter.downloadBlob(
          await exportMermaidToXmindBlob(preview.code, title),
          `${title}.xmind`,
        );
      }
      say("Export complete");
    } catch (e) {
      say(e.message || "Export failed");
    }
  }
  const snapshot = () => {
    if (!document) return;
    updateProject((p) => ({
      ...p,
      snapshots: [
        {
          id: uid(),
          documentId: document.id,
          name: document.name,
          format: document.format,
          source: document.source,
          createdAt: new Date().toISOString(),
        },
        ...p.snapshots,
      ].slice(0, 30),
    }));
    say("Version snapshot saved");
  };
  const recentlyClosedTabs = useRef([]);
  const closeTab = (id) => {
    recentlyClosedTabs.current.push(id);
    updateProject((p) => {
      const openIds = p.openIds.filter((open) => open !== id);
      return {
        ...p,
        openIds,
        activeId:
          p.activeId === id ? openIds[openIds.length - 1] || null : p.activeId,
      };
    });
  };
  const reopenClosedTab = () => {
    const lastId = recentlyClosedTabs.current.pop();
    if (!lastId) {
      say("No recently closed tabs to reopen");
      return;
    }
    const doc = project.documents.find((d) => d.id === lastId);
    if (doc) {
      updateProject((p) => ({
        ...p,
        openIds: p.openIds.includes(lastId) ? p.openIds : [...p.openIds, lastId],
        activeId: lastId,
      }));
      say(`Reopened tab "${doc.name}"`);
    }
  };
  const closeOtherTabs = (id) =>
    updateProject((p) => ({
      ...p,
      openIds: [id],
      activeId: id,
    }));
  const closeTabsToRight = (id) =>
    updateProject((p) => {
      const idx = p.openIds.indexOf(id);
      if (idx === -1) return p;
      const openIds = p.openIds.slice(0, idx + 1);
      return {
        ...p,
        openIds,
        activeId: openIds.includes(p.activeId) ? p.activeId : id,
      };
    });
  const closeAllTabs = () => {
    recentlyClosedTabs.current.push(...project.openIds);
    updateProject((p) => ({
      ...p,
      openIds: [],
      activeId: null,
    }));
  };
  const duplicateFile = (docId) => {
    const doc = project.documents.find((d) => d.id === docId);
    if (!doc) return;
    const baseName = doc.name.replace(/\.[^.]+$/, "");
    const ext = doc.name.split(".").pop();
    const newName = `${baseName}-copy.${ext}`;
    const newDoc = {
      id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: newName,
      format: doc.format,
      source: doc.source,
    };
    updateProject((p) => ({
      ...p,
      documents: [...p.documents, newDoc],
      openIds: [...p.openIds, newDoc.id],
      activeId: newDoc.id,
    }));
    say(`Duplicated as "${newName}"`);
  };
  const deleteFile = (docId) => {
    updateProject((p) => {
      if (p.documents.length <= 1) {
        say("Cannot delete the only file in project");
        return p;
      }
      const documents = p.documents.filter((d) => d.id !== docId);
      const openIds = p.openIds.filter((id) => id !== docId);
      return {
        ...p,
        documents,
        openIds,
        activeId:
          p.activeId === docId
            ? openIds[0] || documents[0]?.id || null
            : p.activeId,
      };
    });
    say("File deleted");
  };
  const startRenameFile = (docId) => {
    const doc = projectRef.current.documents.find((d) => d.id === docId);
    if (!doc) return;
    setRenameId(doc.id);
    setName(doc.name);
    setDialog("rename");
  };
  const chooseNode = (node) => {
    setSelected(node);
    setLabel(node.label);
    setInspector(true);
    setInspectorTab("properties");
  };
  const nodeId = selected?.id?.match(/^flowchart-(.+)-\d+$/)?.[1];
  const relatedEdges = useMemo(() => {
    if (!isFlowchart(document) || !nodeId) return [];
    return flowchartEdges(document.source).filter(
      (e) => e.from === nodeId || e.to === nodeId,
    );
  }, [document?.source, nodeId]);
  const startResize = (e) => {
    e.preventDefault();
    const grid = splitRef.current;
    const move = (event) => {
      const r = grid.getBoundingClientRect();
      grid.style.setProperty(
        "--editor-width",
        `${Math.max(25, Math.min(75, ((event.clientX - r.left) / r.width) * 100))}%`,
      );
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  async function present() {
    setView("canvas");
    setExplorer(false);
    setInspector(false);
    setPresentation(true);
    try {
      await shellRef.current?.requestFullscreen();
    } catch {
      say("Presentation mode enabled. Press Escape or Exit to leave.");
    }
  }
  const sourceOutline = useMemo(
    () =>
      document?.source
        .split("\n")
        .map((line, index) => ({ line: index + 1, text: line.trim() }))
        .filter((x) =>
          /^(class |type |CREATE TABLE|resource |subgraph |participant |actor |section |# |\s*\w+\s*\{)/i.test(
            x.text,
          ),
        )
        .slice(0, 60) || [],
    [document?.source],
  );
  const fileList = project.documents.filter((d) =>
    d.name.toLowerCase().includes(query.toLowerCase()),
  );

  const explorerPanel = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-10 items-center justify-between border-b px-3">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Project explorer
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="New file"
          onClick={() => openNewFile()}
        >
          <FilePlus />
        </Button>
      </div>
      <div className="border-b px-3 py-3">
        <div className="flex items-center gap-2 text-xs font-medium">
          <FolderOpen className="size-4 text-primary" />
          <span className="truncate">{project.name}</span>
          <span className="ml-auto text-[10px] text-muted-foreground">
            {project.documents.length}
          </span>
        </div>
        <Input
          className="mt-3 h-7 text-xs"
          aria-label="Filter files"
          placeholder="Filter files…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div
        className="flex-1 overflow-auto py-1"
        onContextMenu={(e) => {
          if (e.target.closest("button[data-document-id]")) return;
          e.preventDefault();
          setContextMenu({
            isOpen: true,
            position: { x: e.clientX, y: e.clientY },
            title: "Explorer",
            items: [
              {
                id: "new-file",
                label: "New Diagram File",
                icon: FilePlus,
                shortcut: "⌘⇧N",
                onClick: () => openNewFile(),
              },
              {
                id: "import-files",
                label: "Import Files...",
                icon: Upload,
                shortcut: "⌘O",
                onClick: () => fileRef.current?.click(),
              },
              {
                id: "templates",
                label: "Browse Templates...",
                icon: Shapes,
                onClick: () => setDialog("templates"),
              },
              { divider: true },
              {
                id: "download-zip",
                label: "Download Workspace (.zip)",
                icon: Download,
                onClick: () => downloadZip(),
              },
              {
                id: "project-backup",
                label: "Project Backup (.atlas)",
                icon: Save,
                onClick: () => projectBackup(),
              },
            ],
          });
        }}
      >
        {fileList.map((d) => (
          <button
            key={d.id}
            data-document-id={d.id}
            onClick={() => openDocument(d.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setContextMenu({
                isOpen: true,
                position: { x: e.clientX, y: e.clientY },
                title: d.name,
                items: [
                  {
                    id: "open",
                    label: "Open in Tab",
                    icon: FileCode2,
                    onClick: () => openDocument(d.id),
                  },
                  {
                    id: "rename",
                    label: "Rename...",
                    icon: Pencil,
                    shortcut: "F2",
                    onClick: () => startRenameFile(d.id),
                  },
                  {
                    id: "duplicate",
                    label: "Duplicate File",
                    icon: Copy,
                    shortcut: "⌘D",
                    onClick: () => duplicateFile(d.id),
                  },
                  {
                    id: "copy-name",
                    label: "Copy File Name",
                    onClick: () => {
                      navigator.clipboard?.writeText(d.name);
                      say(`Copied "${d.name}"`);
                    },
                  },
                  {
                    id: "copy-source",
                    label: "Copy Diagram Code",
                    onClick: () => {
                      navigator.clipboard?.writeText(d.source);
                      say(`Copied ${d.name} code`);
                    },
                  },
                  { divider: true },
                  {
                    id: "export-svg",
                    label: "Export Vector SVG",
                    icon: Download,
                    onClick: () => {
                      openDocument(d.id);
                      setTimeout(() => exportSvg(), 100);
                    },
                  },
                  {
                    id: "export-png",
                    label: "Export High-Res PNG",
                    icon: Image,
                    onClick: () => {
                      openDocument(d.id);
                      setTimeout(() => exportPng(), 100);
                    },
                  },
                  { divider: true },
                  {
                    id: "delete",
                    label: "Delete File",
                    icon: Trash2,
                    danger: true,
                    onClick: () => deleteFile(d.id),
                  },
                ],
              });
            }}
            className={cn(
              "flex w-full items-center gap-2 border-l-2 px-3 py-2 text-left text-xs transition-colors",
              d.id === project.activeId
                ? "border-primary bg-primary/10 text-blue-200"
                : "border-transparent text-muted-foreground hover:bg-accent",
            )}
          >
            <FileCode2 className="size-3.5 shrink-0" />
            <span className="truncate">{d.name}</span>
          </button>
        ))}
        {!fileList.length && (
          <p className="px-3 py-5 text-xs text-muted-foreground">
            No matching files.
          </p>
        )}
      </div>
      <div className="grid gap-1 border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          className="justify-start text-xs"
          onClick={() => setDialog("templates")}
        >
          <Shapes />
          Browse templates
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="justify-start text-xs"
          onClick={() => setDialog("assistant")}
        >
          <Sparkles />
          Diagram assistant
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="justify-start text-xs"
          asChild
        >
          <Link to="/saved">
            <FolderOpen />
            All projects
          </Link>
        </Button>
      </div>
    </div>
  );

  const inspectorPanel = (
    <Tabs
      value={inspectorTab}
      onValueChange={setInspectorTab}
      className="flex h-full min-h-0 flex-col gap-0"
      onContextMenu={(e) => {
        if (e.target.closest("input, textarea, select, button")) return;
        e.preventDefault();
        setContextMenu({
          isOpen: true,
          position: { x: e.clientX, y: e.clientY },
          title: "Inspector Panel",
          items: [
            {
              id: "tab-props",
              label: "Show Properties",
              icon: Settings2,
              onClick: () => setInspectorTab("properties"),
            },
            {
              id: "tab-history",
              label: "Show History Snapshots",
              icon: History,
              onClick: () => setInspectorTab("history"),
            },
            {
              id: "tab-outline",
              label: "Show Outline Structure",
              icon: Layers,
              onClick: () => setInspectorTab("outline"),
            },
            { divider: true },
            {
              id: "save-snapshot",
              label: "Save Version Snapshot Now",
              icon: GitCommit,
              onClick: () => saveSnapshot(),
            },
            { divider: true },
            {
              id: "theme-dark",
              label: "Theme: Dark (Modern)",
              onClick: () => setTheme("dark"),
            },
            {
              id: "theme-default",
              label: "Theme: Light (Default)",
              onClick: () => setTheme("default"),
            },
            {
              id: "theme-forest",
              label: "Theme: Forest",
              onClick: () => setTheme("forest"),
            },
            {
              id: "theme-neutral",
              label: "Theme: Neutral",
              onClick: () => setTheme("neutral"),
            },
          ],
        });
      }}
    >
      <TabsList className="h-10 w-full shrink-0 rounded-none border-b bg-card p-1">
        <TabsTrigger className="text-[11px]" value="properties">
          Inspector
        </TabsTrigger>
        <TabsTrigger className="text-[11px]" value="history">
          History
        </TabsTrigger>
        <TabsTrigger className="text-[11px]" value="outline">
          Outline
        </TabsTrigger>
      </TabsList>
      <TabsContent
        value="properties"
        className="m-0 flex-1 overflow-auto p-4 text-xs"
      >
        {document && (
          <>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              File properties
            </p>
            <label
              className="mt-4 block text-muted-foreground"
              htmlFor="file-format"
            >
              Source format
            </label>
            <select
              id="file-format"
              aria-label="Source format"
              value={document.format}
              onChange={(e) =>
                updateProject((p) => ({
                  ...p,
                  documents: p.documents.map((d) =>
                    d.id === document.id ? { ...d, format: e.target.value } : d,
                  ),
                }))
              }
              className="mt-2 h-8 w-full rounded-md border bg-background px-2 text-xs"
            >
              {FORMATS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <p className="mt-3 leading-5 text-muted-foreground">
              {definition.description}
            </p>
            <div className="mt-3 flex gap-2">
              <Badge tone={definition.mode === "Native" ? "green" : "indigo"}>
                {definition.mode === "Native"
                  ? "Native renderer"
                  : "Derived preview"}
              </Badge>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 border-y py-3 text-muted-foreground">
              <span>
                Lines{" "}
                <strong className="block pt-1 text-foreground">
                  {document.source.split("\n").length}
                </strong>
              </span>
              <span>
                Characters{" "}
                <strong className="block pt-1 text-foreground">
                  {document.source.length.toLocaleString()}
                </strong>
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full text-xs"
              onClick={() => {
                setName(document.name);
                setDialog("rename");
              }}
            >
              <Pencil />
              Rename file
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 w-full text-xs"
              onClick={() => newFiles([{ ...document, name: document.name }])}
            >
              <Copy />
              Duplicate file
            </Button>
            {document?.format === "mermaid" && (
              <div className="mt-4 border-t pt-3">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-medium flex items-center gap-1.5 text-foreground">
                    <Palette className="size-3.5 text-primary" />
                    Diagram style & look
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-muted-foreground block mb-1">
                      Render look
                    </label>
                    <select
                      aria-label="Diagram render look"
                      className="h-7 w-full rounded border bg-background px-1.5 text-[11px]"
                      value={diagramConfig.look}
                      onChange={(e) => {
                        try {
                          updateSource(
                            document.id,
                            updateDiagramConfig(document.source, {
                              look: e.target.value,
                            }),
                          );
                          say(`Look changed to ${e.target.value}`);
                        } catch (err) {
                          say(err.message);
                        }
                      }}
                    >
                      {Object.entries(DIAGRAM_LOOKS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground block mb-1">
                      Mermaid theme
                    </label>
                    <select
                      aria-label="Mermaid theme preset"
                      className="h-7 w-full rounded border bg-background px-1.5 text-[11px]"
                      value={diagramConfig.theme}
                      onChange={(e) => {
                        try {
                          updateSource(
                            document.id,
                            updateDiagramConfig(document.source, {
                              theme: e.target.value,
                            }),
                          );
                          say(`Theme changed to ${e.target.value}`);
                        } catch (err) {
                          say(err.message);
                        }
                      }}
                    >
                      {Object.entries(DIAGRAM_THEMES).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
            {selected && (
              <div className="mt-5 border-t pt-4">
                <p className="font-medium">Selected element</p>
                <p className="mt-2 break-all text-muted-foreground">
                  {selected.label}
                </p>
                <Input
                  aria-label="Selected node label"
                  className="mt-3 h-8 text-xs"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
                <select
                  aria-label="Node shape"
                  className="mt-2 h-8 w-full rounded-md border bg-background px-2 text-xs"
                  value={nodeId ? getFlowchartNodeShape(document.source, nodeId) : "rectangle"}
                  onChange={(e) => {
                    try {
                      updateSource(
                        document.id,
                        changeFlowchartNodeShape(document.source, nodeId, e.target.value),
                      );
                      say(`Shape changed to ${SHAPES[e.target.value]?.label || e.target.value}`);
                    } catch (err) {
                      say(err.message);
                    }
                  }}
                >
                  {Object.entries(SHAPES).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.label}
                    </option>
                  ))}
                </select>
                <div className="mt-2.5">
                  <span className="text-[11px] text-muted-foreground block mb-1.5 font-medium">Color accent</span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(COLOR_PRESETS).map(([key, preset]) => (
                      <button
                        key={key}
                        type="button"
                        aria-label={`Style ${preset.label}`}
                        title={preset.label}
                        disabled={!isFlowchart(document) || !nodeId}
                        onClick={() => {
                          try {
                            updateSource(
                              document.id,
                              styleFlowchartNode(document.source, nodeId, key),
                            );
                            say(`Applied ${preset.label} style`);
                          } catch (err) {
                            say(err.message);
                          }
                        }}
                        style={{ backgroundColor: preset.color }}
                        className="size-5 rounded-full border border-white/20 transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
                      />
                    ))}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full text-xs"
                  disabled={!isFlowchart(document) || !nodeId}
                  onClick={() => {
                    try {
                      updateSource(
                        document.id,
                        renameFlowchartNode(document.source, nodeId, label),
                      );
                      say("Node label updated");
                    } catch (e) {
                      say(e.message);
                    }
                  }}
                >
                  Apply label
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1.5 w-full text-xs"
                  disabled={!isFlowchart(document) || !nodeId}
                  onClick={() => {
                    try {
                      const res = addFlowchartChild(
                        document.source,
                        nodeId,
                        "Next step",
                        edgeArrow,
                      );
                      updateSource(document.id, res.source);
                      setSelected({
                        id: `flowchart-${res.childId}-0`,
                        label: res.childLabel,
                      });
                      setLabel(res.childLabel);
                      say(`Added connected step ${res.childId}`);
                    } catch (e) {
                      say(e.message);
                    }
                  }}
                >
                  <Plus className="size-3.5" />
                  Add connected step
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1.5 w-full text-xs"
                  disabled={!isFlowchart(document) || !nodeId}
                  onClick={() => {
                    try {
                      const res = duplicateFlowchartNode(
                        document.source,
                        nodeId,
                      );
                      updateSource(document.id, res.source);
                      setSelected({
                        id: `flowchart-${res.duplicateId}-0`,
                        label: res.duplicateLabel,
                      });
                      setLabel(res.duplicateLabel);
                      say(`Duplicated node as ${res.duplicateId}`);
                    } catch (e) {
                      say(e.message);
                    }
                  }}
                >
                  <Copy className="size-3.5" />
                  Duplicate node
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1.5 w-full text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={!isFlowchart(document) || !nodeId}
                  onClick={() => {
                    try {
                      updateSource(
                        document.id,
                        deleteFlowchartNode(document.source, nodeId),
                      );
                      setSelected(null);
                      say("Node removed");
                    } catch (e) {
                      say(e.message);
                    }
                  }}
                >
                  <Trash2 className="size-3.5" />
                  Delete node
                </Button>
                {relatedEdges.length > 0 && (
                  <div className="mt-4 border-t pt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Connections ({relatedEdges.length})
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-auto">
                      {relatedEdges.map((e, idx) => {
                        const isOutgoing = e.from === nodeId;
                        const otherId = isOutgoing ? e.to : e.from;
                        const otherNode = nodes.find((n) => n.id === otherId);
                        const otherLabel = otherNode?.label || otherId;
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-1.5 rounded bg-muted/40 px-2 py-1 text-[11px]"
                          >
                            <span className="truncate">
                              {isOutgoing ? (
                                <>
                                  <span className="text-muted-foreground font-mono">
                                    {e.symbol}
                                  </span>{" "}
                                  {otherLabel}
                                </>
                              ) : (
                                <>
                                  {otherLabel}{" "}
                                  <span className="text-muted-foreground font-mono">
                                    {e.symbol}
                                  </span>
                                </>
                              )}
                              {e.label ? (
                                <span className="ml-1 text-[10px] text-muted-foreground italic">
                                  ({e.label})
                                </span>
                              ) : null}
                            </span>
                            <button
                              type="button"
                              title="Disconnect"
                              aria-label={`Disconnect ${otherLabel}`}
                              className="text-muted-foreground hover:text-destructive shrink-0 p-0.5 rounded transition"
                              onClick={() => {
                                try {
                                  updateSource(
                                    document.id,
                                    deleteFlowchartEdge(
                                      document.source,
                                      e.from,
                                      e.to,
                                    ),
                                  );
                                  say(`Disconnected ${e.from} and ${e.to}`);
                                } catch (err) {
                                  say(err.message);
                                }
                              }}
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
            {isFlowchart(document) && (
              <div className="mt-5 border-t pt-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">Visual model tools</p>
                  <select
                    aria-label="Flowchart layout direction"
                    className="h-7 rounded-md border bg-background px-2 text-[11px]"
                    value={getFlowchartDirection(document.source)}
                    onChange={(e) => {
                      try {
                        updateSource(
                          document.id,
                          changeFlowchartDirection(
                            document.source,
                            e.target.value,
                          ),
                        );
                        say(`Layout direction changed to ${e.target.value}`);
                      } catch (err) {
                        say(err.message);
                      }
                    }}
                  >
                    {Object.entries(FLOWCHART_DIRECTIONS).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.id} ({val.label.split(" ")[0]})
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  aria-label="New node label"
                  className="mt-3 h-8 text-xs"
                  placeholder="Node label"
                  value={nodeLabel}
                  onChange={(e) => setNodeLabel(e.target.value)}
                />
                <div className="mt-2 flex gap-2">
                  <select
                    aria-label="New node shape"
                    className="h-8 rounded-md border bg-background px-2 text-xs"
                    value={newShape}
                    onChange={(e) => setNewShape(e.target.value)}
                  >
                    {Object.entries(SHAPES).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => {
                      try {
                        updateSource(
                          document.id,
                          addFlowchartNode(document.source, nodeLabel, newShape),
                        );
                        setNodeLabel("");
                      } catch (e) {
                        say(e.message);
                      }
                    }}
                  >
                    Add node
                  </Button>
                </div>
                <div className="mt-4 grid gap-2">
                  {[
                    ["From", edgeFrom, setEdgeFrom],
                    ["To", edgeTo, setEdgeTo],
                  ].map(([text, value, set]) => (
                    <select
                      key={text}
                      aria-label={`Connection ${text.toLowerCase()}`}
                      className="h-8 w-full rounded-md border bg-background px-2"
                      value={value}
                      onChange={(e) => set(e.target.value)}
                    >
                      <option value="">{text} node…</option>
                      {nodes.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.label}
                        </option>
                      ))}
                    </select>
                  ))}
                  <select
                    aria-label="Arrow style"
                    className="h-8 w-full rounded-md border bg-background px-2 text-xs"
                    value={edgeArrow}
                    onChange={(e) => setEdgeArrow(e.target.value)}
                  >
                    {Object.entries(ARROW_STYLES).map(([key, style]) => (
                      <option key={key} value={key}>
                        {style.label}
                      </option>
                    ))}
                  </select>
                  <Input
                    aria-label="Connection label"
                    className="h-8 text-xs"
                    placeholder="Connection label (optional)"
                    value={edgeLabel}
                    onChange={(e) => setEdgeLabel(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      try {
                        updateSource(
                          document.id,
                          connectFlowchartNodes(
                            document.source,
                            edgeFrom,
                            edgeTo,
                            edgeLabel,
                            edgeArrow,
                          ),
                        );
                        setEdgeLabel("");
                      } catch (e) {
                        say(e.message);
                      }
                    }}
                  >
                    <GitBranch />
                    Connect nodes
                  </Button>
                </div>
              </div>
            )}
            {isSequence(document) && (
              <div className="mt-5 border-t pt-4">
                <p className="font-medium text-xs">Sequence diagram tools</p>
                {seqParticipants.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Participants ({seqParticipants.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-auto">
                      {seqParticipants.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-1 rounded bg-muted/60 px-2 py-0.5 text-[11px]"
                        >
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {p.type === "actor" ? "👤" : "📦"}
                          </span>
                          <span className="truncate max-w-[100px]">{p.label}</span>
                          <button
                            type="button"
                            title={`Remove ${p.label}`}
                            aria-label={`Remove participant ${p.label}`}
                            className="text-muted-foreground hover:text-destructive shrink-0 ml-0.5"
                            onClick={() => {
                              try {
                                updateSource(
                                  document.id,
                                  deleteSequenceParticipant(
                                    document.source,
                                    p.id,
                                  ),
                                );
                                say(`Removed participant ${p.label}`);
                              } catch (err) {
                                say(err.message);
                              }
                            }}
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-4 border-t border-dashed pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                    Add participant / actor
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      aria-label="Participant identifier"
                      className="h-8 text-xs"
                      placeholder="ID (e.g. Auth)"
                      value={seqId}
                      onChange={(e) => setSeqId(e.target.value)}
                    />
                    <Input
                      aria-label="Participant label"
                      className="h-8 text-xs"
                      placeholder="Label (optional)"
                      value={seqLabel}
                      onChange={(e) => setSeqLabel(e.target.value)}
                    />
                  </div>
                  <div className="mt-2 flex gap-2">
                    <select
                      aria-label="Participant type"
                      className="h-8 rounded-md border bg-background px-2 text-xs"
                      value={seqType}
                      onChange={(e) => setSeqType(e.target.value)}
                    >
                      <option value="participant">Participant</option>
                      <option value="actor">Actor</option>
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => {
                        try {
                          updateSource(
                            document.id,
                            addSequenceParticipant(
                              document.source,
                              seqId,
                              seqLabel,
                              seqType,
                            ),
                          );
                          setSeqId("");
                          setSeqLabel("");
                          say("Participant added");
                        } catch (err) {
                          say(err.message);
                        }
                      }}
                    >
                      <Plus className="size-3.5" />
                      Add participant
                    </Button>
                  </div>
                </div>
                {seqParticipants.length >= 2 && (
                  <div className="mt-4 border-t border-dashed pt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Send message
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        aria-label="Message sender"
                        className="h-8 rounded-md border bg-background px-2 text-xs"
                        value={seqFrom}
                        onChange={(e) => setSeqFrom(e.target.value)}
                      >
                        <option value="">From…</option>
                        {seqParticipants.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                      <select
                        aria-label="Message recipient"
                        className="h-8 rounded-md border bg-background px-2 text-xs"
                        value={seqTo}
                        onChange={(e) => setSeqTo(e.target.value)}
                      >
                        <option value="">To…</option>
                        {seqParticipants.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <select
                      aria-label="Message arrow style"
                      className="mt-2 h-8 w-full rounded-md border bg-background px-2 text-xs"
                      value={seqArrow}
                      onChange={(e) => setSeqArrow(e.target.value)}
                    >
                      {Object.entries(SEQUENCE_ARROWS).map(([k, v]) => (
                        <option key={k} value={v.symbol}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                    <Input
                      aria-label="Message text"
                      className="mt-2 h-8 text-xs"
                      placeholder="Message (e.g. login(creds))"
                      value={seqMsg}
                      onChange={(e) => setSeqMsg(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full text-xs"
                      onClick={() => {
                        try {
                          updateSource(
                            document.id,
                            addSequenceMessage(
                              document.source,
                              seqFrom,
                              seqTo,
                              seqMsg,
                              seqArrow,
                            ),
                          );
                          setSeqMsg("");
                          say("Message added");
                        } catch (err) {
                          say(err.message);
                        }
                      }}
                    >
                      Send message
                    </Button>
                  </div>
                )}
              </div>
            )}
            {isClassDiagram(document) && (
              <div className="mt-5 border-t pt-4">
                <p className="font-medium text-xs">Class diagram tools</p>
                {clsList.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Classes ({clsList.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-auto">
                      {clsList.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center gap-1 rounded bg-muted/60 px-2 py-0.5 text-[11px]"
                        >
                          <span className="font-mono text-[10px] text-muted-foreground">
                            🏛️
                          </span>
                          <span className="truncate max-w-[100px]">{c.label}</span>
                          <button
                            type="button"
                            title={`Remove ${c.label}`}
                            aria-label={`Remove class ${c.label}`}
                            className="text-muted-foreground hover:text-destructive shrink-0 ml-0.5"
                            onClick={() => {
                              try {
                                updateSource(
                                  document.id,
                                  deleteClassDiagramClass(
                                    document.source,
                                    c.id,
                                  ),
                                );
                                say(`Removed class ${c.label}`);
                              } catch (err) {
                                say(err.message);
                              }
                            }}
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-4 border-t border-dashed pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                    Add new class
                  </span>
                  <div className="flex gap-2">
                    <Input
                      aria-label="New class name"
                      className="h-8 text-xs"
                      placeholder="Class name (e.g. Account)"
                      value={clsName}
                      onChange={(e) => setClsName(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs shrink-0"
                      onClick={() => {
                        try {
                          updateSource(
                            document.id,
                            addClassDiagramClass(document.source, clsName),
                          );
                          setClsName("");
                          say("Class added");
                        } catch (err) {
                          say(err.message);
                        }
                      }}
                    >
                      <Plus className="size-3.5" />
                      Add class
                    </Button>
                  </div>
                </div>
                {clsList.length > 0 && (
                  <div className="mt-4 border-t border-dashed pt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Add field or method
                    </span>
                    <div className="grid gap-2">
                      <select
                        aria-label="Target class for member"
                        className="h-8 rounded-md border bg-background px-2 text-xs"
                        value={clsTarget}
                        onChange={(e) => setClsTarget(e.target.value)}
                      >
                        <option value="">Select class…</option>
                        {clsList.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <Input
                          aria-label="Member declaration"
                          className="h-8 text-xs flex-1 font-mono text-[11px]"
                          placeholder="+String name or +save(): bool"
                          value={clsMember}
                          onChange={(e) => setClsMember(e.target.value)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs shrink-0"
                          onClick={() => {
                            try {
                              updateSource(
                                document.id,
                                addClassDiagramMember(
                                  document.source,
                                  clsTarget,
                                  clsMember,
                                ),
                              );
                              setClsMember("");
                              say("Member added");
                            } catch (err) {
                              say(err.message);
                            }
                          }}
                        >
                          Add member
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                {clsList.length >= 2 && (
                  <div className="mt-4 border-t border-dashed pt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Connect classes (Relationship)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        aria-label="Relationship source class"
                        className="h-8 rounded-md border bg-background px-2 text-xs"
                        value={clsFrom}
                        onChange={(e) => setClsFrom(e.target.value)}
                      >
                        <option value="">From…</option>
                        {clsList.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <select
                        aria-label="Relationship target class"
                        className="h-8 rounded-md border bg-background px-2 text-xs"
                        value={clsTo}
                        onChange={(e) => setClsTo(e.target.value)}
                      >
                        <option value="">To…</option>
                        {clsList.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <select
                      aria-label="Relationship type"
                      className="mt-2 h-8 w-full rounded-md border bg-background px-2 text-xs"
                      value={clsRel}
                      onChange={(e) => setClsRel(e.target.value)}
                    >
                      {Object.entries(CLASS_RELATIONS).map(([k, v]) => (
                        <option key={k} value={v.symbol}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                    <Input
                      aria-label="Relationship label"
                      className="mt-2 h-8 text-xs"
                      placeholder="Label (optional)"
                      value={clsRelLabel}
                      onChange={(e) => setClsRelLabel(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full text-xs"
                      onClick={() => {
                        try {
                          updateSource(
                            document.id,
                            connectClassDiagramClasses(
                              document.source,
                              clsFrom,
                              clsTo,
                              clsRel,
                              clsRelLabel,
                            ),
                          );
                          setClsRelLabel("");
                          say("Classes connected");
                        } catch (err) {
                          say(err.message);
                        }
                      }}
                    >
                      <GitBranch className="size-3.5" />
                      Connect classes
                    </Button>
                  </div>
                )}
              </div>
            )}
            {isState(document) && (
              <div className="mt-5 border-t pt-4">
                <p className="font-medium text-xs">State diagram tools</p>
                {stateList.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      States ({stateList.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-auto">
                      {stateList.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center gap-1 rounded bg-muted/60 px-2 py-0.5 text-[11px]"
                        >
                          <span className="font-mono text-[10px] text-muted-foreground">
                            🔄
                          </span>
                          <span className="truncate max-w-[100px]">{s.label}</span>
                          {s.id !== "[*]" && (
                            <button
                              type="button"
                              title={`Remove ${s.label}`}
                              aria-label={`Remove state ${s.label}`}
                              className="text-muted-foreground hover:text-destructive shrink-0 ml-0.5"
                              onClick={() => {
                                try {
                                  updateSource(
                                    document.id,
                                    deleteStateDiagramState(
                                      document.source,
                                      s.id,
                                    ),
                                  );
                                  say(`Removed state ${s.label}`);
                                } catch (err) {
                                  say(err.message);
                                }
                              }}
                            >
                              <X className="size-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-4 border-t border-dashed pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                    Add new state
                  </span>
                  <div className="grid gap-2">
                    <div className="flex gap-2">
                      <Input
                        aria-label="New state identifier"
                        className="h-8 text-xs flex-1 font-mono"
                        placeholder="State ID (e.g. InReview)"
                        value={stateId}
                        onChange={(e) => setStateId(e.target.value)}
                      />
                      <Input
                        aria-label="New state label"
                        className="h-8 text-xs flex-1"
                        placeholder="Label / Title (optional)"
                        value={stateLabel}
                        onChange={(e) => setStateLabel(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        try {
                          updateSource(
                            document.id,
                            addStateDiagramState(
                              document.source,
                              stateId,
                              stateLabel,
                            ),
                          );
                          setStateId("");
                          setStateLabel("");
                          say("State added");
                        } catch (err) {
                          say(err.message);
                        }
                      }}
                    >
                      <Plus className="size-3.5" />
                      Add state
                    </Button>
                  </div>
                </div>
                {stateList.length >= 2 && (
                  <div className="mt-4 border-t border-dashed pt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Add state transition
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        aria-label="Transition source state"
                        className="h-8 rounded-md border bg-background px-2 text-xs"
                        value={stateFrom}
                        onChange={(e) => setStateFrom(e.target.value)}
                      >
                        <option value="">From…</option>
                        {stateList.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      <select
                        aria-label="Transition target state"
                        className="h-8 rounded-md border bg-background px-2 text-xs"
                        value={stateTo}
                        onChange={(e) => setStateTo(e.target.value)}
                      >
                        <option value="">To…</option>
                        {stateList.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Input
                      aria-label="Transition event label"
                      className="mt-2 h-8 text-xs"
                      placeholder="Event / trigger label (e.g. approve)"
                      value={stateEvent}
                      onChange={(e) => setStateEvent(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full text-xs"
                      onClick={() => {
                        try {
                          updateSource(
                            document.id,
                            connectStateDiagramStates(
                              document.source,
                              stateFrom,
                              stateTo,
                              stateEvent,
                            ),
                          );
                          setStateEvent("");
                          say("Transition added");
                        } catch (err) {
                          say(err.message);
                        }
                      }}
                    >
                      <ArrowRight className="size-3.5" />
                      Connect transition
                    </Button>
                  </div>
                )}
              </div>
            )}
            {isErDiagram(document) && (
              <div className="mt-5 border-t pt-4">
                <p className="font-medium text-xs">ER diagram tools</p>
                {erList.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Entities ({erList.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-auto">
                      {erList.map((ent) => (
                        <div
                          key={ent.id}
                          className="flex items-center gap-1 rounded bg-muted/60 px-2 py-0.5 text-[11px]"
                        >
                          <span className="font-mono text-[10px] text-muted-foreground">
                            🗃️
                          </span>
                          <span className="truncate max-w-[100px]">{ent.label}</span>
                          <button
                            type="button"
                            title={`Remove ${ent.label}`}
                            aria-label={`Remove entity ${ent.label}`}
                            className="text-muted-foreground hover:text-destructive shrink-0 ml-0.5"
                            onClick={() => {
                              try {
                                updateSource(
                                  document.id,
                                  deleteErDiagramEntity(
                                    document.source,
                                    ent.id,
                                  ),
                                );
                                say(`Removed entity ${ent.label}`);
                              } catch (err) {
                                say(err.message);
                              }
                            }}
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-4 border-t border-dashed pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                    Add new entity
                  </span>
                  <div className="flex gap-2">
                    <Input
                      aria-label="New entity name"
                      className="h-8 text-xs font-mono"
                      placeholder="Entity name (e.g. CUSTOMER)"
                      value={erEntity}
                      onChange={(e) => setErEntity(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs shrink-0"
                      onClick={() => {
                        try {
                          updateSource(
                            document.id,
                            addErDiagramEntity(document.source, erEntity),
                          );
                          setErEntity("");
                          say("Entity added");
                        } catch (err) {
                          say(err.message);
                        }
                      }}
                    >
                      <Plus className="size-3.5" />
                      Add entity
                    </Button>
                  </div>
                </div>
                {erList.length > 0 && (
                  <div className="mt-4 border-t border-dashed pt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Add entity attribute
                    </span>
                    <div className="grid gap-2">
                      <select
                        aria-label="Target entity for attribute"
                        className="h-8 rounded-md border bg-background px-2 text-xs"
                        value={erAttrTarget}
                        onChange={(e) => setErAttrTarget(e.target.value)}
                      >
                        <option value="">Select entity…</option>
                        {erList.map((ent) => (
                          <option key={ent.id} value={ent.id}>
                            {ent.label}
                          </option>
                        ))}
                      </select>
                      <div className="grid grid-cols-3 gap-1.5">
                        <Input
                          aria-label="Attribute type"
                          className="h-8 text-xs font-mono"
                          placeholder="Type (string, int)"
                          value={erAttrType}
                          onChange={(e) => setErAttrType(e.target.value)}
                        />
                        <Input
                          aria-label="Attribute name"
                          className="h-8 text-xs font-mono"
                          placeholder="Name (user_id)"
                          value={erAttrName}
                          onChange={(e) => setErAttrName(e.target.value)}
                        />
                        <Input
                          aria-label="Attribute key"
                          className="h-8 text-xs font-mono"
                          placeholder="Key (PK, FK)"
                          value={erAttrKey}
                          onChange={(e) => setErAttrKey(e.target.value)}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          try {
                            updateSource(
                              document.id,
                              addErDiagramAttribute(
                                document.source,
                                erAttrTarget,
                                erAttrType,
                                erAttrName,
                                erAttrKey,
                              ),
                            );
                            setErAttrName("");
                            setErAttrKey("");
                            say("Attribute added");
                          } catch (err) {
                            say(err.message);
                          }
                        }}
                      >
                        <Plus className="size-3.5" />
                        Add attribute
                      </Button>
                    </div>
                  </div>
                )}
                {erList.length >= 2 && (
                  <div className="mt-4 border-t border-dashed pt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Connect entities (Relationship)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        aria-label="Relationship source entity"
                        className="h-8 rounded-md border bg-background px-2 text-xs"
                        value={erFrom}
                        onChange={(e) => setErFrom(e.target.value)}
                      >
                        <option value="">From entity…</option>
                        {erList.map((ent) => (
                          <option key={ent.id} value={ent.id}>
                            {ent.label}
                          </option>
                        ))}
                      </select>
                      <select
                        aria-label="Relationship target entity"
                        className="h-8 rounded-md border bg-background px-2 text-xs"
                        value={erTo}
                        onChange={(e) => setErTo(e.target.value)}
                      >
                        <option value="">To entity…</option>
                        {erList.map((ent) => (
                          <option key={ent.id} value={ent.id}>
                            {ent.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <select
                      aria-label="ER relationship cardinality"
                      className="mt-2 h-8 w-full rounded-md border bg-background px-2 text-xs"
                      value={erRel}
                      onChange={(e) => setErRel(e.target.value)}
                    >
                      {Object.entries(ER_RELATIONS).map(([k, v]) => (
                        <option key={k} value={v.symbol}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                    <Input
                      aria-label="ER relationship label"
                      className="mt-2 h-8 text-xs"
                      placeholder="Label (e.g. places, contains)"
                      value={erRelLabel}
                      onChange={(e) => setErRelLabel(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full text-xs"
                      onClick={() => {
                        try {
                          updateSource(
                            document.id,
                            connectErDiagramEntities(
                              document.source,
                              erFrom,
                              erTo,
                              erRel,
                              erRelLabel,
                            ),
                          );
                          setErRelLabel("");
                          say("Entities connected");
                        } catch (err) {
                          say(err.message);
                        }
                      }}
                    >
                      <GitBranch className="size-3.5" />
                      Connect entities
                    </Button>
                  </div>
                )}
              </div>
            )}
            {isMindmap(document) && (
              <div className="mt-5 border-t pt-4">
                <p className="font-medium text-xs">Mindmap tools</p>
                {mmList.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Topic Hierarchy ({mmList.length})
                    </span>
                    <div className="flex flex-col gap-1 max-h-36 overflow-auto p-1 border rounded bg-muted/20">
                      {mmList.map((m, idx) => (
                        <div
                          key={`${m.text}-${idx}`}
                          className="flex items-center justify-between gap-1 rounded bg-muted/60 px-2 py-0.5 text-[11px]"
                          style={{
                            paddingLeft: `${Math.max(6, (m.indent - 2) * 6)}px`,
                          }}
                        >
                          <div className="flex items-center gap-1 truncate">
                            <span className="font-mono text-[10px] text-muted-foreground">
                              🧠
                            </span>
                            <span className="truncate">{m.text}</span>
                            {m.shape !== "default" && (
                              <span className="text-[9px] text-muted-foreground font-mono">
                                ({m.shape})
                              </span>
                            )}
                          </div>
                          {idx > 0 && (
                            <button
                              type="button"
                              title={`Remove ${m.text}`}
                              aria-label={`Remove mindmap branch ${m.text}`}
                              className="text-muted-foreground hover:text-destructive shrink-0 ml-1"
                              onClick={() => {
                                try {
                                  updateSource(
                                    document.id,
                                    deleteMindmapNode(document.source, m.text),
                                  );
                                  say(`Removed ${m.text}`);
                                } catch (err) {
                                  say(err.message);
                                }
                              }}
                            >
                              <X className="size-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {mmList.length > 0 && (
                  <div className="mt-4 border-t border-dashed pt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Add subtopic / branch
                    </span>
                    <div className="grid gap-2">
                      <select
                        aria-label="Parent mindmap topic"
                        className="h-8 rounded-md border bg-background px-2 text-xs"
                        value={mmParent}
                        onChange={(e) => setMmParent(e.target.value)}
                      >
                        <option value="">Select parent topic…</option>
                        {mmList.map((m, idx) => (
                          <option key={`${m.text}-${idx}`} value={m.text}>
                            {"— ".repeat(Math.max(0, (m.indent - 2) / 2))}
                            {m.text}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <Input
                          aria-label="New subtopic text"
                          className="h-8 text-xs flex-1"
                          placeholder="Subtopic label"
                          value={mmChild}
                          onChange={(e) => setMmChild(e.target.value)}
                        />
                        <select
                          aria-label="Subtopic shape"
                          className="h-8 rounded-md border bg-background px-2 text-xs shrink-0"
                          value={mmShape}
                          onChange={(e) => setMmShape(e.target.value)}
                        >
                          {Object.entries(MINDMAP_SHAPES).map(([k, v]) => (
                            <option key={k} value={k}>
                              {v.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          try {
                            updateSource(
                              document.id,
                              addMindmapChild(
                                document.source,
                                mmParent || mmList[0]?.text,
                                mmChild,
                                mmShape,
                              ),
                            );
                            setMmChild("");
                            say("Subtopic added");
                          } catch (err) {
                            say(err.message);
                          }
                        }}
                      >
                        <Plus className="size-3.5" />
                        Add subtopic
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {isGitGraph(document) && (
              <div className="mt-5 border-t pt-4">
                <p className="font-medium text-xs">Git graph tools</p>
                {gitBranches.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Branches ({gitBranches.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-auto">
                      {gitBranches.map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center gap-1 rounded bg-muted/60 px-2 py-0.5 text-[11px]"
                        >
                          <GitBranch className="size-3 text-muted-foreground" />
                          <span className="font-mono text-xs">{b.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-4 border-t border-dashed pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                    Create new commit
                  </span>
                  <div className="grid gap-2">
                    <div className="flex gap-2">
                      <Input
                        aria-label="Commit message ID"
                        className="h-8 text-xs flex-1"
                        placeholder="Commit ID / msg (e.g. Add auth)"
                        value={gitCommitMsg}
                        onChange={(e) => setGitCommitMsg(e.target.value)}
                      />
                      <Input
                        aria-label="Commit tag"
                        className="h-8 text-xs w-24 shrink-0 font-mono"
                        placeholder="Tag (v1.0)"
                        value={gitCommitTag}
                        onChange={(e) => setGitCommitTag(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        aria-label="Commit type"
                        className="h-8 rounded-md border bg-background px-2 text-xs flex-1"
                        value={gitCommitType}
                        onChange={(e) => setGitCommitType(e.target.value)}
                      >
                        {Object.entries(GIT_COMMIT_TYPES).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs shrink-0"
                        onClick={() => {
                          try {
                            updateSource(
                              document.id,
                              addGitCommit(
                                document.source,
                                gitCommitMsg,
                                gitCommitTag,
                                gitCommitType,
                              ),
                            );
                            setGitCommitMsg("");
                            setGitCommitTag("");
                            say("Commit added");
                          } catch (err) {
                            say(err.message);
                          }
                        }}
                      >
                        <GitCommit className="size-3.5" />
                        Commit
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 border-t border-dashed pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                    Branch operations
                  </span>
                  <div className="grid gap-2">
                    <div className="flex gap-2">
                      <Input
                        aria-label="New branch name"
                        className="h-8 text-xs font-mono flex-1"
                        placeholder="Branch name (feature/api)"
                        value={gitBranchName}
                        onChange={(e) => setGitBranchName(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs shrink-0"
                        onClick={() => {
                          try {
                            updateSource(
                              document.id,
                              addGitBranch(document.source, gitBranchName),
                            );
                            setGitBranchName("");
                            say("Branch created");
                          } catch (err) {
                            say(err.message);
                          }
                        }}
                      >
                        <Plus className="size-3.5" />
                        Branch
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <select
                        aria-label="Checkout target branch"
                        className="h-8 rounded-md border bg-background px-2 text-xs flex-1"
                        value={gitCheckoutTarget}
                        onChange={(e) => setGitCheckoutTarget(e.target.value)}
                      >
                        <option value="">Checkout branch…</option>
                        {gitBranches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.label}
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs shrink-0"
                        onClick={() => {
                          try {
                            updateSource(
                              document.id,
                              checkoutGitBranch(
                                document.source,
                                gitCheckoutTarget,
                              ),
                            );
                            say(`Checked out ${gitCheckoutTarget}`);
                          } catch (err) {
                            say(err.message);
                          }
                        }}
                      >
                        Checkout
                      </Button>
                    </div>
                    {gitBranches.length >= 2 && (
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <select
                          aria-label="Merge branch"
                          className="h-8 rounded-md border bg-background px-2 text-xs"
                          value={gitMergeBranch}
                          onChange={(e) => setGitMergeBranch(e.target.value)}
                        >
                          <option value="">Merge branch…</option>
                          {gitBranches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.label}
                            </option>
                          ))}
                        </select>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs shrink-0"
                          onClick={() => {
                            try {
                              updateSource(
                                document.id,
                                mergeGitBranch(
                                  document.source,
                                  gitMergeBranch,
                                  gitMergeTag,
                                ),
                              );
                              say(`Merged ${gitMergeBranch}`);
                            } catch (err) {
                              say(err.message);
                            }
                          }}
                        >
                          <GitBranch className="size-3.5" />
                          Merge
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {isPie(document) && (
              <div className="mt-5 border-t pt-4">
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <PieChart className="size-3.5 text-primary" />
                  <span>Pie chart tools</span>
                </div>

                <div className="mt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-1.5">
                    Chart title
                  </span>
                  <div className="flex gap-2">
                    <Input
                      aria-label="Pie chart title"
                      className="h-8 text-xs flex-1"
                      placeholder={pieInfo.title || "e.g. Browser Market Share"}
                      value={pieTitleInput}
                      onChange={(e) => setPieTitleInput(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs shrink-0"
                      onClick={() => {
                        try {
                          updateSource(
                            document.id,
                            setPieTitle(
                              document.source,
                              pieTitleInput || pieInfo.title || "Key Metrics",
                            ),
                          );
                          setPieTitleInput("");
                          say("Pie title updated");
                        } catch (err) {
                          say(err.message);
                        }
                      }}
                    >
                      Set title
                    </Button>
                  </div>
                </div>

                {pieInfo.slices.length > 0 && (
                  <div className="mt-4 border-t border-dashed pt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Slices ({pieInfo.slices.length})
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-auto">
                      {pieInfo.slices.map((s, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 rounded bg-muted/50 px-2 py-1 text-xs"
                        >
                          <span className="truncate font-medium">{s.label}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge
                              variant="secondary"
                              className="text-[10px] h-5 px-1.5 font-mono"
                            >
                              {s.value}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                updateSource(
                                  document.id,
                                  deletePieSlice(document.source, s.label),
                                );
                                say(`Removed slice "${s.label}"`);
                              }}
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 border-t border-dashed pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                    Add slice
                  </span>
                  <div className="grid gap-2">
                    <div className="flex gap-2">
                      <Input
                        aria-label="Slice label"
                        className="h-8 text-xs flex-1"
                        placeholder="Slice label (e.g. Chrome)"
                        value={pieSliceLabel}
                        onChange={(e) => setPieSliceLabel(e.target.value)}
                      />
                      <Input
                        aria-label="Slice value"
                        type="number"
                        min="1"
                        step="any"
                        className="h-8 text-xs w-20 shrink-0 font-mono"
                        placeholder="Value"
                        value={pieSliceVal}
                        onChange={(e) => setPieSliceVal(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        try {
                          updateSource(
                            document.id,
                            addPieSlice(
                              document.source,
                              pieSliceLabel,
                              pieSliceVal,
                            ),
                          );
                          setPieSliceLabel("");
                          setPieSliceVal("");
                          say("Slice added");
                        } catch (err) {
                          say(err.message);
                        }
                      }}
                    >
                      <Plus className="size-3.5" />
                      Add slice
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {isJourney(document) && (
              <div className="mt-5 border-t pt-4">
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <Compass className="size-3.5 text-primary" />
                  <span>User journey tools</span>
                </div>

                {journeySecs.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Journey stages & tasks ({journeySecs.length} sections)
                    </span>
                    <div className="space-y-2.5 max-h-48 overflow-auto">
                      {journeySecs.map((sec, sIdx) => (
                        <div key={sIdx} className="rounded border bg-muted/20 p-2">
                          <span className="font-semibold text-xs text-foreground block mb-1">
                            {sec.name}
                          </span>
                          {sec.tasks.length === 0 ? (
                            <span className="text-[11px] text-muted-foreground italic">
                              No tasks in this section
                            </span>
                          ) : (
                            <div className="space-y-1">
                              {sec.tasks.map((t, tIdx) => (
                                <div
                                  key={tIdx}
                                  className="flex items-center justify-between gap-1 text-[11px] rounded bg-background/80 px-2 py-0.5 border"
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className="truncate">{t.name}</span>
                                    <Badge
                                      variant="outline"
                                      className="text-[9px] h-4 px-1 shrink-0 font-mono"
                                    >
                                      ★ {t.score}/5
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-[10px] text-muted-foreground">
                                      {t.actors}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive"
                                      onClick={() => {
                                        updateSource(
                                          document.id,
                                          deleteJourneyTask(
                                            document.source,
                                            t.name,
                                          ),
                                        );
                                        say(`Removed task "${t.name}"`);
                                      }}
                                    >
                                      <Trash2 className="size-2.5" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 border-t border-dashed pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                    Add section stage
                  </span>
                  <div className="flex gap-2">
                    <Input
                      aria-label="New journey section name"
                      className="h-8 text-xs flex-1"
                      placeholder="Stage name (e.g. Onboarding)"
                      value={journeySecName}
                      onChange={(e) => setJourneySecName(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs shrink-0"
                      onClick={() => {
                        try {
                          updateSource(
                            document.id,
                            addJourneySection(
                              document.source,
                              journeySecName,
                            ),
                          );
                          setJourneySecName("");
                          say("Section added");
                        } catch (err) {
                          say(err.message);
                        }
                      }}
                    >
                      <Plus className="size-3.5" />
                      Section
                    </Button>
                  </div>
                </div>

                <div className="mt-4 border-t border-dashed pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                    Add journey task
                  </span>
                  <div className="grid gap-2">
                    <div className="flex gap-2">
                      <select
                        aria-label="Target section for task"
                        className="h-8 rounded-md border bg-background px-2 text-xs flex-1"
                        value={journeyTargetSec}
                        onChange={(e) => setJourneyTargetSec(e.target.value)}
                      >
                        <option value="">Select section…</option>
                        {journeySecs.map((s, idx) => (
                          <option key={idx} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <select
                        aria-label="Journey task score"
                        className="h-8 rounded-md border bg-background px-2 text-xs w-24 shrink-0 font-mono"
                        value={journeyScore}
                        onChange={(e) => setJourneyScore(e.target.value)}
                      >
                        <option value="5">Score: 5</option>
                        <option value="4">Score: 4</option>
                        <option value="3">Score: 3</option>
                        <option value="2">Score: 2</option>
                        <option value="1">Score: 1</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        aria-label="Journey task name"
                        className="h-8 text-xs flex-1"
                        placeholder="Task name (e.g. Sign up form)"
                        value={journeyTaskName}
                        onChange={(e) => setJourneyTaskName(e.target.value)}
                      />
                      <Input
                        aria-label="Journey task actors"
                        className="h-8 text-xs w-28 shrink-0"
                        placeholder="Actors (User, Bot)"
                        value={journeyActors}
                        onChange={(e) => setJourneyActors(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        try {
                          const target =
                            journeyTargetSec ||
                            (journeySecs[0] ? journeySecs[0].name : "");
                          updateSource(
                            document.id,
                            addJourneyTask(
                              document.source,
                              target,
                              journeyTaskName,
                              journeyScore,
                              journeyActors,
                            ),
                          );
                          setJourneyTaskName("");
                          say("Task added to journey");
                        } catch (err) {
                          say(err.message);
                        }
                      }}
                    >
                      <Plus className="size-3.5" />
                      Add task
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {isKanban(document) && (
              <div className="mt-5 border-t pt-4">
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <Kanban className="size-3.5 text-primary" />
                  <span>Kanban board tools</span>
                </div>

                {kanbanCols.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Columns & Cards ({kanbanCols.length} columns)
                    </span>
                    <div className="space-y-2.5 max-h-48 overflow-auto">
                      {kanbanCols.map((col, cIdx) => (
                        <div key={cIdx} className="rounded border bg-muted/20 p-2">
                          <span className="font-semibold text-xs text-foreground block mb-1">
                            {col.name} ({col.cards.length})
                          </span>
                          {col.cards.length === 0 ? (
                            <span className="text-[11px] text-muted-foreground italic">
                              No cards in this column
                            </span>
                          ) : (
                            <div className="space-y-1">
                              {col.cards.map((card, cardIdx) => (
                                <div
                                  key={cardIdx}
                                  className="flex items-center justify-between gap-1 text-[11px] rounded bg-background/80 px-2 py-1 border"
                                >
                                  <span className="truncate">{card}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 shrink-0 text-muted-foreground hover:text-destructive"
                                    onClick={() => {
                                      updateSource(
                                        document.id,
                                        deleteKanbanCard(document.source, card),
                                      );
                                      say(`Removed card "${card}"`);
                                    }}
                                  >
                                    <Trash2 className="size-2.5" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 border-t border-dashed pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                    Add column
                  </span>
                  <div className="flex gap-2">
                    <Input
                      aria-label="New kanban column name"
                      className="h-8 text-xs flex-1"
                      placeholder="Column name (e.g. In Review)"
                      value={kanbanColName}
                      onChange={(e) => setKanbanColName(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs shrink-0"
                      onClick={() => {
                        try {
                          updateSource(
                            document.id,
                            addKanbanColumn(document.source, kanbanColName),
                          );
                          setKanbanColName("");
                          say("Column added");
                        } catch (err) {
                          say(err.message);
                        }
                      }}
                    >
                      <Plus className="size-3.5" />
                      Column
                    </Button>
                  </div>
                </div>

                <div className="mt-4 border-t border-dashed pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                    Add card
                  </span>
                  <div className="grid gap-2">
                    <select
                      aria-label="Target column for card"
                      className="h-8 rounded-md border bg-background px-2 text-xs"
                      value={kanbanTargetCol}
                      onChange={(e) => setKanbanTargetCol(e.target.value)}
                    >
                      <option value="">Select column…</option>
                      {kanbanCols.map((c, idx) => (
                        <option key={idx} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <Input
                        aria-label="Kanban card text"
                        className="h-8 text-xs flex-1"
                        placeholder="Card description (e.g. Implement OAuth)"
                        value={kanbanCardText}
                        onChange={(e) => setKanbanCardText(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs shrink-0"
                        onClick={() => {
                          try {
                            const target =
                              kanbanTargetCol ||
                              (kanbanCols[0] ? kanbanCols[0].name : "");
                            updateSource(
                              document.id,
                              addKanbanCard(
                                document.source,
                                target,
                                kanbanCardText,
                              ),
                            );
                            setKanbanCardText("");
                            say("Card added");
                          } catch (err) {
                            say(err.message);
                          }
                        }}
                      >
                        <Plus className="size-3.5" />
                        Card
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {isGantt(document) && (
              <div className="mt-5 border-t pt-4">
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <Calendar className="size-3.5 text-primary" />
                  <span>Gantt roadmap tools</span>
                </div>

                {ganttSecs.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Sections & Schedule ({ganttSecs.length} workstreams)
                    </span>
                    <div className="space-y-2.5 max-h-48 overflow-auto">
                      {ganttSecs.map((sec, sIdx) => (
                        <div key={sIdx} className="rounded border bg-muted/20 p-2">
                          <span className="font-semibold text-xs text-foreground block mb-1">
                            {sec.name} ({sec.tasks.length})
                          </span>
                          {sec.tasks.length === 0 ? (
                            <span className="text-[11px] text-muted-foreground italic">
                              No tasks in this section
                            </span>
                          ) : (
                            <div className="space-y-1">
                              {sec.tasks.map((t, tIdx) => (
                                <div
                                  key={tIdx}
                                  className="flex items-center justify-between gap-1 text-[11px] rounded bg-background/80 px-2 py-0.5 border"
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className="truncate">{t.name}</span>
                                    <Badge
                                      variant={
                                        t.status === "done"
                                          ? "secondary"
                                          : t.status === "crit"
                                          ? "destructive"
                                          : "outline"
                                      }
                                      className="text-[9px] h-4 px-1 shrink-0 font-mono"
                                    >
                                      {t.status}
                                    </Badge>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 shrink-0 text-muted-foreground hover:text-destructive"
                                    onClick={() => {
                                      updateSource(
                                        document.id,
                                        deleteGanttTask(
                                          document.source,
                                          t.name,
                                        ),
                                      );
                                      say(`Removed task "${t.name}"`);
                                    }}
                                  >
                                    <Trash2 className="size-2.5" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 border-t border-dashed pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                    Add workstream section
                  </span>
                  <div className="flex gap-2">
                    <Input
                      aria-label="New gantt section name"
                      className="h-8 text-xs flex-1"
                      placeholder="Workstream (e.g. Infrastructure)"
                      value={ganttSecName}
                      onChange={(e) => setGanttSecName(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs shrink-0"
                      onClick={() => {
                        try {
                          updateSource(
                            document.id,
                            addGanttSection(
                              document.source,
                              ganttSecName,
                            ),
                          );
                          setGanttSecName("");
                          say("Section added");
                        } catch (err) {
                          say(err.message);
                        }
                      }}
                    >
                      <Plus className="size-3.5" />
                      Section
                    </Button>
                  </div>
                </div>

                <div className="mt-4 border-t border-dashed pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                    Add roadmap task
                  </span>
                  <div className="grid gap-2">
                    <div className="flex gap-2">
                      <select
                        aria-label="Target section for gantt task"
                        className="h-8 rounded-md border bg-background px-2 text-xs flex-1"
                        value={ganttTargetSec}
                        onChange={(e) => setGanttTargetSec(e.target.value)}
                      >
                        <option value="">Select section…</option>
                        {ganttSecs.map((s, idx) => (
                          <option key={idx} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <select
                        aria-label="Gantt task status"
                        className="h-8 rounded-md border bg-background px-2 text-xs w-28 shrink-0 font-mono"
                        value={ganttTaskStatus}
                        onChange={(e) => setGanttTaskStatus(e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="done">Done</option>
                        <option value="crit">Critical</option>
                        <option value="milestone">Milestone</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        aria-label="Gantt task name"
                        className="h-8 text-xs flex-1"
                        placeholder="Task name (e.g. Database Migration)"
                        value={ganttTaskName}
                        onChange={(e) => setGanttTaskName(e.target.value)}
                      />
                      <Input
                        aria-label="Gantt duration"
                        className="h-8 text-xs w-20 shrink-0 font-mono"
                        placeholder="7d"
                        value={ganttTaskDur}
                        onChange={(e) => setGanttTaskDur(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        try {
                          const target =
                            ganttTargetSec ||
                            (ganttSecs[0] ? ganttSecs[0].name : "");
                          updateSource(
                            document.id,
                            addGanttTask(
                              document.source,
                              target,
                              ganttTaskName,
                              ganttTaskStatus,
                              ganttTaskDur,
                            ),
                          );
                          setGanttTaskName("");
                          say("Task added to roadmap");
                        } catch (err) {
                          say(err.message);
                        }
                      }}
                    >
                      <Plus className="size-3.5" />
                      Add task
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {isQuadrantChart(document) && (
              <div className="mt-5 border-t pt-4">
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <Crosshair className="size-3.5 text-primary" />
                  <span>Quadrant chart tools</span>
                </div>

                {quadPoints.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Points ({quadPoints.length})
                    </span>
                    <div className="space-y-1.5 max-h-48 overflow-auto">
                      {quadPoints.map((pt, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 rounded bg-muted/50 px-2 py-1 text-xs"
                        >
                          <span className="truncate font-medium">
                            {pt.label}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Badge
                              variant="secondary"
                              className="text-[10px] h-5 px-1.5 font-mono"
                            >
                              [{pt.x}, {pt.y}]
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                updateSource(
                                  document.id,
                                  deleteQuadrantPoint(
                                    document.source,
                                    pt.label,
                                  ),
                                );
                                say(`Removed point "${pt.label}"`);
                              }}
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 border-t border-dashed pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                    Add point
                  </span>
                  <div className="grid gap-2">
                    <Input
                      aria-label="Quadrant point label"
                      className="h-8 text-xs flex-1"
                      placeholder="Point label (e.g. Real-Time Sync)"
                      value={quadLabel}
                      onChange={(e) => setQuadLabel(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1 flex-1">
                        <span className="text-[11px] text-muted-foreground font-mono">
                          X:
                        </span>
                        <Input
                          aria-label="X coordinate"
                          type="number"
                          step="0.05"
                          min="0"
                          max="1"
                          className="h-8 text-xs font-mono"
                          placeholder="0.5"
                          value={quadX}
                          onChange={(e) => setQuadX(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-1 flex-1">
                        <span className="text-[11px] text-muted-foreground font-mono">
                          Y:
                        </span>
                        <Input
                          aria-label="Y coordinate"
                          type="number"
                          step="0.05"
                          min="0"
                          max="1"
                          className="h-8 text-xs font-mono"
                          placeholder="0.5"
                          value={quadY}
                          onChange={(e) => setQuadY(e.target.value)}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs shrink-0"
                        onClick={() => {
                          try {
                            updateSource(
                              document.id,
                              addQuadrantPoint(
                                document.source,
                                quadLabel,
                                quadX,
                                quadY,
                              ),
                            );
                            setQuadLabel("");
                            say("Point added to matrix");
                          } catch (err) {
                            say(err.message);
                          }
                        }}
                      >
                        <Plus className="size-3.5" />
                        Point
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {isTimeline(document) && (
              <div className="mt-5 border-t pt-4">
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <Clock className="size-3.5 text-primary" />
                  <span>Timeline & timing tools</span>
                </div>

                {timelineSecs.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Timeline periods ({timelineSecs.length} sections)
                    </span>
                    <div className="space-y-2.5 max-h-48 overflow-auto">
                      {timelineSecs.map((sec, sIdx) => (
                        <div key={sIdx} className="rounded border bg-muted/20 p-2">
                          <span className="font-semibold text-xs text-foreground block mb-1">
                            {sec.name} ({sec.events.length})
                          </span>
                          {sec.events.length === 0 ? (
                            <span className="text-[11px] text-muted-foreground italic">
                              No events in this period
                            </span>
                          ) : (
                            <div className="space-y-1">
                              {sec.events.map((evt, eIdx) => (
                                <div
                                  key={eIdx}
                                  className="flex items-center justify-between gap-1 text-[11px] rounded bg-background/80 px-2 py-1 border"
                                >
                                  <div className="truncate">
                                    <span className="font-medium">
                                      {evt.title}
                                    </span>
                                    {evt.description && (
                                      <span className="text-muted-foreground text-[10px] ml-1.5">
                                        — {evt.description}
                                      </span>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 shrink-0 text-muted-foreground hover:text-destructive"
                                    onClick={() => {
                                      updateSource(
                                        document.id,
                                        deleteTimelineEvent(
                                          document.source,
                                          evt.title,
                                        ),
                                      );
                                      say(`Removed event "${evt.title}"`);
                                    }}
                                  >
                                    <Trash2 className="size-2.5" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 border-t border-dashed pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                    Add period section
                  </span>
                  <div className="flex gap-2">
                    <Input
                      aria-label="New timeline section name"
                      className="h-8 text-xs flex-1"
                      placeholder="Period (e.g. Q3 2026 : Launch)"
                      value={timelineSecName}
                      onChange={(e) => setTimelineSecName(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs shrink-0"
                      onClick={() => {
                        try {
                          updateSource(
                            document.id,
                            addTimelineSection(
                              document.source,
                              timelineSecName,
                            ),
                          );
                          setTimelineSecName("");
                          say("Period added");
                        } catch (err) {
                          say(err.message);
                        }
                      }}
                    >
                      <Plus className="size-3.5" />
                      Section
                    </Button>
                  </div>
                </div>

                <div className="mt-4 border-t border-dashed pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                    Add timeline event
                  </span>
                  <div className="grid gap-2">
                    <select
                      aria-label="Target section for timeline event"
                      className="h-8 rounded-md border bg-background px-2 text-xs"
                      value={timelineTargetSec}
                      onChange={(e) => setTimelineTargetSec(e.target.value)}
                    >
                      <option value="">Select period…</option>
                      {timelineSecs.map((s, idx) => (
                        <option key={idx} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <Input
                        aria-label="Timeline event title"
                        className="h-8 text-xs flex-1"
                        placeholder="Event title (e.g. Beta release)"
                        value={timelineEvtName}
                        onChange={(e) => setTimelineEvtName(e.target.value)}
                      />
                      <Input
                        aria-label="Timeline event description"
                        className="h-8 text-xs w-36 shrink-0"
                        placeholder="Details (optional)"
                        value={timelineEvtDesc}
                        onChange={(e) => setTimelineEvtDesc(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        try {
                          const target =
                            timelineTargetSec ||
                            (timelineSecs[0] ? timelineSecs[0].name : "");
                          updateSource(
                            document.id,
                            addTimelineEvent(
                              document.source,
                              target,
                              timelineEvtName,
                              timelineEvtDesc,
                            ),
                          );
                          setTimelineEvtName("");
                          setTimelineEvtDesc("");
                          say("Event added to timeline");
                        } catch (err) {
                          say(err.message);
                        }
                      }}
                    >
                      <Plus className="size-3.5" />
                      Add event
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {isSankey(document) && (
              <div className="mt-5 border-t pt-4">
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <Split className="size-3.5 text-primary" />
                  <span>Sankey flow tools</span>
                </div>

                {sankeyFlows.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Flows ({sankeyFlows.length})
                    </span>
                    <div className="space-y-1.5 max-h-48 overflow-auto">
                      {sankeyFlows.map((link, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-1.5 rounded bg-muted/50 px-2 py-1 text-xs"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="truncate font-medium">
                              {link.source}
                            </span>
                            <span className="text-muted-foreground text-[10px]">
                              →
                            </span>
                            <span className="truncate font-medium">
                              {link.target}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Badge
                              variant="secondary"
                              className="text-[10px] h-5 px-1.5 font-mono"
                            >
                              {link.value}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                updateSource(
                                  document.id,
                                  deleteSankeyLink(
                                    document.source,
                                    link.source,
                                    link.target,
                                  ),
                                );
                                say(
                                  `Removed flow "${link.source} → ${link.target}"`,
                                );
                              }}
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 border-t border-dashed pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                    Add flow link
                  </span>
                  <div className="grid gap-2">
                    <div className="flex gap-2">
                      <Input
                        aria-label="Sankey source node"
                        className="h-8 text-xs flex-1"
                        placeholder="Source (e.g. Visitors)"
                        value={sankeySrc}
                        onChange={(e) => setSankeySrc(e.target.value)}
                      />
                      <Input
                        aria-label="Sankey target node"
                        className="h-8 text-xs flex-1"
                        placeholder="Target (e.g. Signups)"
                        value={sankeyDst}
                        onChange={(e) => setSankeyDst(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        aria-label="Sankey flow value"
                        type="number"
                        min="1"
                        step="any"
                        className="h-8 text-xs flex-1 font-mono"
                        placeholder="Flow quantity (e.g. 5000)"
                        value={sankeyVal}
                        onChange={(e) => setSankeyVal(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs shrink-0"
                        onClick={() => {
                          try {
                            updateSource(
                              document.id,
                              addSankeyLink(
                                document.source,
                                sankeySrc,
                                sankeyDst,
                                sankeyVal,
                              ),
                            );
                            setSankeySrc("");
                            setSankeyDst("");
                            setSankeyVal("");
                            say("Flow link added");
                          } catch (err) {
                            say(err.message);
                          }
                        }}
                      >
                        <Plus className="size-3.5" />
                        Flow
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {isXyChart(document) && xyInfo && (
              <div className="mt-5 border-t pt-4">
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <LineChart className="size-3.5 text-primary" />
                  <span>XY chart tools</span>
                </div>

                <div className="mt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-1">
                    Chart title
                  </span>
                  <div className="flex gap-1.5">
                    <Input
                      aria-label="XY chart title"
                      className="h-8 text-xs flex-1"
                      placeholder={xyInfo.title || "Chart title..."}
                      value={xyTitleInput}
                      onChange={(e) => setXyTitleInput(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2.5 text-xs shrink-0"
                      onClick={() => {
                        try {
                          updateSource(
                            document.id,
                            updateXyChartTitle(document.source, xyTitleInput),
                          );
                          setXyTitleInput("");
                          say("Chart title updated");
                        } catch (err) {
                          say(err.message);
                        }
                      }}
                    >
                      Update
                    </Button>
                  </div>
                </div>

                {xyInfo.series.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Data series ({xyInfo.series.length})
                    </span>
                    <div className="space-y-1.5 max-h-48 overflow-auto">
                      {xyInfo.series.map((s, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-1.5 rounded bg-muted/50 px-2 py-1 text-xs"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Badge
                              variant="secondary"
                              className="text-[10px] h-5 px-1.5 uppercase font-mono"
                            >
                              {s.type}
                            </Badge>
                            <span className="truncate font-mono text-[11px] text-muted-foreground">
                              [{s.values.slice(0, 4).join(", ")}
                              {s.values.length > 4 ? "…" : ""}]
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              updateSource(
                                document.id,
                                deleteXyChartSeries(document.source, idx),
                              );
                              say(`Removed ${s.type} series`);
                            }}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 border-t border-dashed pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                    Add data series
                  </span>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground">
                        Type:
                      </span>
                      <div className="flex gap-1">
                        {["bar", "line"].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setXySeriesType(t)}
                            className={`rounded px-2 py-0.5 text-[11px] font-medium uppercase transition ${
                              xySeriesType === t
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        aria-label="XY series values"
                        className="h-8 text-xs flex-1 font-mono"
                        placeholder="Values: 10, 25, 42, 60"
                        value={xySeriesVals}
                        onChange={(e) => setXySeriesVals(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs shrink-0"
                        onClick={() => {
                          try {
                            updateSource(
                              document.id,
                              addXyChartSeries(
                                document.source,
                                xySeriesType,
                                xySeriesVals,
                              ),
                            );
                            setXySeriesVals("");
                            say(`Added ${xySeriesType} series`);
                          } catch (err) {
                            say(err.message);
                          }
                        }}
                      >
                        <Plus className="size-3.5" />
                        Series
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {isBlock(document) && (
              <div className="mt-5 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-medium text-xs">
                    <Boxes className="size-3.5 text-primary" />
                    <span>Block architecture tools</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">
                      Columns:
                    </span>
                    <Input
                      aria-label="Block diagram grid columns"
                      type="number"
                      min="1"
                      max="12"
                      className="h-6 w-12 text-center text-xs font-mono p-0"
                      value={blockColsInput || blockColumnsCount}
                      onChange={(e) => setBlockColsInput(e.target.value)}
                      onBlur={() => {
                        if (blockColsInput) {
                          updateSource(
                            document.id,
                            setBlockColumns(document.source, blockColsInput),
                          );
                          say(`Columns set to ${blockColsInput}`);
                        }
                      }}
                    />
                  </div>
                </div>

                {blockElements.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Blocks ({blockElements.length})
                    </span>
                    <div className="space-y-1.5 max-h-48 overflow-auto">
                      {blockElements.map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between gap-1.5 rounded bg-muted/50 px-2 py-1 text-xs"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-mono font-medium text-primary text-[11px]">
                              {b.id}
                            </span>
                            <span className="truncate text-muted-foreground">
                              {b.label !== b.id ? `(${b.label})` : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {b.span > 1 && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] h-5 px-1.5 font-mono"
                              >
                                span {b.span}
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                updateSource(
                                  document.id,
                                  deleteBlockItem(document.source, b.id),
                                );
                                say(`Removed block "${b.id}"`);
                              }}
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 border-t border-dashed pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                    Add architecture block
                  </span>
                  <div className="grid gap-2">
                    <div className="flex gap-2">
                      <Input
                        aria-label="Block ID"
                        className="h-8 text-xs flex-1 font-mono"
                        placeholder="ID (e.g. GPU)"
                        value={blockIdInput}
                        onChange={(e) => setBlockIdInput(e.target.value)}
                      />
                      <Input
                        aria-label="Block grid span"
                        type="number"
                        min="1"
                        max="8"
                        className="h-8 w-16 text-center text-xs font-mono"
                        placeholder="Span"
                        value={blockSpanInput}
                        onChange={(e) => setBlockSpanInput(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        aria-label="Block label"
                        className="h-8 text-xs flex-1"
                        placeholder="Label (e.g. Graphics Processor)"
                        value={blockLabelInput}
                        onChange={(e) => setBlockLabelInput(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs shrink-0"
                        onClick={() => {
                          try {
                            updateSource(
                              document.id,
                              addBlockItem(
                                document.source,
                                blockIdInput,
                                blockLabelInput,
                                blockSpanInput,
                              ),
                            );
                            setBlockIdInput("");
                            setBlockLabelInput("");
                            setBlockSpanInput("1");
                            say(`Added block "${blockIdInput}"`);
                          } catch (err) {
                            say(err.message);
                          }
                        }}
                      >
                        <Plus className="size-3.5" />
                        Block
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {isC4(document) && (
              <div className="mt-5 border-t pt-4">
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <Layers className="size-3.5 text-primary" />
                  <span>C4 architecture tools</span>
                </div>

                {c4Els.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Elements ({c4Els.length})
                    </span>
                    <div className="space-y-1.5 max-h-48 overflow-auto">
                      {c4Els.map((el) => (
                        <div
                          key={el.id}
                          className="flex items-center justify-between gap-1.5 rounded bg-muted/50 px-2 py-1 text-xs"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Badge
                              variant="secondary"
                              className="text-[10px] h-5 px-1.5 font-mono"
                            >
                              {el.type}
                            </Badge>
                            <span className="font-mono font-medium text-[11px]">
                              {el.id}
                            </span>
                            <span className="truncate text-muted-foreground text-[11px]">
                              {el.label}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => {
                              updateSource(
                                document.id,
                                deleteC4Element(document.source, el.id),
                              );
                              say(`Removed C4 element "${el.id}"`);
                            }}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {c4Rels.length > 0 && (
                  <div className="mt-3 border-t border-dashed pt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Relationships ({c4Rels.length})
                    </span>
                    <div className="space-y-1.5 max-h-40 overflow-auto">
                      {c4Rels.map((r, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-1.5 rounded bg-muted/50 px-2 py-1 text-xs"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-mono font-medium">
                              {r.from}
                            </span>
                            <span className="text-muted-foreground text-[10px]">
                              →
                            </span>
                            <span className="font-mono font-medium">
                              {r.to}
                            </span>
                            <span className="truncate text-muted-foreground text-[10px]">
                              ({r.label})
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => {
                              updateSource(
                                document.id,
                                deleteC4Relation(document.source, r.from, r.to),
                              );
                              say(`Removed relation "${r.from} → ${r.to}"`);
                            }}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 border-t border-dashed pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                    Add architecture element
                  </span>
                  <div className="grid gap-2">
                    <div className="flex gap-2">
                      <select
                        aria-label="C4 element type"
                        className="h-8 rounded-md border bg-background px-2 text-xs"
                        value={c4ElType}
                        onChange={(e) => setC4ElType(e.target.value)}
                      >
                        <option value="System">System</option>
                        <option value="System_Ext">System (Ext)</option>
                        <option value="Person">Person</option>
                        <option value="Person_Ext">Person (Ext)</option>
                        <option value="Container">Container</option>
                        <option value="ContainerDb">Database</option>
                        <option value="Component">Component</option>
                      </select>
                      <Input
                        aria-label="C4 element ID"
                        className="h-8 text-xs flex-1 font-mono"
                        placeholder="Alias (e.g. authService)"
                        value={c4ElId}
                        onChange={(e) => setC4ElId(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        aria-label="C4 element label"
                        className="h-8 text-xs flex-1"
                        placeholder="Title (e.g. Auth Service)"
                        value={c4ElLabel}
                        onChange={(e) => setC4ElLabel(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs shrink-0"
                        onClick={() => {
                          try {
                            updateSource(
                              document.id,
                              addC4Element(
                                document.source,
                                c4ElType,
                                c4ElId,
                                c4ElLabel,
                                c4ElDesc,
                              ),
                            );
                            setC4ElId("");
                            setC4ElLabel("");
                            setC4ElDesc("");
                            say(`Added ${c4ElType} "${c4ElId}"`);
                          } catch (err) {
                            say(err.message);
                          }
                        }}
                      >
                        <Plus className="size-3.5" />
                        Element
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-dashed pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                    Connect elements
                  </span>
                  <div className="grid gap-2">
                    <div className="flex gap-2">
                      <Input
                        aria-label="C4 relation from"
                        className="h-8 text-xs flex-1 font-mono"
                        placeholder="From (e.g. customer)"
                        value={c4RelFrom}
                        onChange={(e) => setC4RelFrom(e.target.value)}
                      />
                      <Input
                        aria-label="C4 relation to"
                        className="h-8 text-xs flex-1 font-mono"
                        placeholder="To (e.g. bankingSystem)"
                        value={c4RelTo}
                        onChange={(e) => setC4RelTo(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        aria-label="C4 relation label"
                        className="h-8 text-xs flex-1"
                        placeholder="Description (e.g. Uses via HTTPS)"
                        value={c4RelLabel}
                        onChange={(e) => setC4RelLabel(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs shrink-0"
                        onClick={() => {
                          try {
                            updateSource(
                              document.id,
                              addC4Relation(
                                document.source,
                                c4RelFrom,
                                c4RelTo,
                                c4RelLabel,
                              ),
                            );
                            setC4RelFrom("");
                            setC4RelTo("");
                            setC4RelLabel("Uses");
                            say("Relationship added");
                          } catch (err) {
                            say(err.message);
                          }
                        }}
                      >
                        <Plus className="size-3.5" />
                        Rel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {isRequirement(document) && (
              <div className="mt-5 border-t pt-4">
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <ClipboardList className="size-3.5 text-primary" />
                  <span>Requirement diagram tools</span>
                </div>

                {reqItems.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Requirements & Elements ({reqItems.length})
                    </span>
                    <div className="space-y-1.5 max-h-48 overflow-auto">
                      {reqItems.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between gap-1.5 rounded bg-muted/50 px-2 py-1 text-xs"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Badge
                              variant="secondary"
                              className="text-[10px] h-5 px-1.5 font-mono"
                            >
                              {item.category === "element"
                                ? item.elementType
                                : item.type}
                            </Badge>
                            <span className="font-mono font-medium text-[11px]">
                              {item.name}
                            </span>
                            {item.category === "requirement" && item.id && (
                              <span className="text-[10px] text-muted-foreground">
                                [{item.id}]
                              </span>
                            )}
                            {item.category === "requirement" && item.risk && (
                              <Badge
                                variant="outline"
                                className="text-[9px] h-4 px-1 capitalize"
                              >
                                {item.risk}
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => {
                              updateSource(
                                document.id,
                                deleteRequirement(document.source, item.name),
                              );
                              say(`Removed "${item.name}"`);
                            }}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {reqRels.length > 0 && (
                  <div className="mt-3 border-t border-dashed pt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Traceability & Relations ({reqRels.length})
                    </span>
                    <div className="space-y-1.5 max-h-40 overflow-auto">
                      {reqRels.map((r, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-1.5 rounded bg-muted/50 px-2 py-1 text-xs"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-mono font-medium">
                              {r.from}
                            </span>
                            <span className="text-muted-foreground text-[10px]">
                              -{r.type}→
                            </span>
                            <span className="font-mono font-medium">
                              {r.to}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => {
                              updateSource(
                                document.id,
                                deleteRequirementRelation(
                                  document.source,
                                  r.from,
                                  r.to,
                                ),
                              );
                              say(
                                `Removed relation "${r.from} - ${r.type} -> ${r.to}"`,
                              );
                            }}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 border-t border-dashed pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                    Add requirement
                  </span>
                  <div className="grid gap-2">
                    <div className="flex gap-2">
                      <select
                        aria-label="Requirement type"
                        className="h-8 rounded-md border bg-background px-2 text-xs"
                        value={reqType}
                        onChange={(e) => setReqType(e.target.value)}
                      >
                        <option value="functionalRequirement">Functional</option>
                        <option value="requirement">Requirement</option>
                        <option value="interfaceRequirement">Interface</option>
                        <option value="performanceRequirement">
                          Performance
                        </option>
                        <option value="physicalRequirement">Physical</option>
                        <option value="designConstraint">Constraint</option>
                      </select>
                      <Input
                        aria-label="Requirement name"
                        className="h-8 text-xs flex-1 font-mono"
                        placeholder="Name (e.g. req_auth)"
                        value={reqName}
                        onChange={(e) => setReqName(e.target.value)}
                      />
                      <Input
                        aria-label="Requirement ID"
                        className="h-8 text-xs w-20 font-mono"
                        placeholder="ID (1.0)"
                        value={reqId}
                        onChange={(e) => setReqId(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        aria-label="Requirement text"
                        className="h-8 text-xs flex-1"
                        placeholder="Specification text"
                        value={reqText}
                        onChange={(e) => setReqText(e.target.value)}
                      />
                      <select
                        aria-label="Requirement risk"
                        className="h-8 rounded-md border bg-background px-2 text-xs"
                        value={reqRisk}
                        onChange={(e) => setReqRisk(e.target.value)}
                      >
                        <option value="low">Low risk</option>
                        <option value="medium">Med risk</option>
                        <option value="high">High risk</option>
                      </select>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs shrink-0"
                        onClick={() => {
                          try {
                            updateSource(
                              document.id,
                              addRequirement(
                                document.source,
                                reqType,
                                reqName,
                                reqId,
                                reqText,
                                reqRisk,
                                reqVerify,
                              ),
                            );
                            setReqName("");
                            setReqId("");
                            setReqText("");
                            say(`Added requirement "${reqName}"`);
                          } catch (err) {
                            say(err.message);
                          }
                        }}
                      >
                        <Plus className="size-3.5" />
                        Req
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-dashed pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                    Add architecture element
                  </span>
                  <div className="flex gap-2">
                    <Input
                      aria-label="Element name"
                      className="h-8 text-xs flex-1 font-mono"
                      placeholder="Element name (e.g. auth_service)"
                      value={reqElName}
                      onChange={(e) => setReqElName(e.target.value)}
                    />
                    <Input
                      aria-label="Element type"
                      className="h-8 text-xs w-28"
                      placeholder="Type (e.g. service)"
                      value={reqElType}
                      onChange={(e) => setReqElType(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs shrink-0"
                      onClick={() => {
                        try {
                          updateSource(
                            document.id,
                            addRequirementElement(
                              document.source,
                              reqElName,
                              reqElType,
                            ),
                          );
                          setReqElName("");
                          say(`Added element "${reqElName}"`);
                        } catch (err) {
                          say(err.message);
                        }
                      }}
                    >
                      <Plus className="size-3.5" />
                      Element
                    </Button>
                  </div>
                </div>

                <div className="mt-4 border-t border-dashed pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                    Connect element & requirement
                  </span>
                  <div className="grid gap-2">
                    <div className="flex gap-2">
                      <Input
                        aria-label="Relation from"
                        className="h-8 text-xs flex-1 font-mono"
                        placeholder="Element (e.g. auth_service)"
                        value={reqRelFrom}
                        onChange={(e) => setReqRelFrom(e.target.value)}
                      />
                      <select
                        aria-label="Relation type"
                        className="h-8 rounded-md border bg-background px-2 text-xs"
                        value={reqRelType}
                        onChange={(e) => setReqRelType(e.target.value)}
                      >
                        <option value="satisfies">satisfies</option>
                        <option value="traces">traces</option>
                        <option value="derives">derives</option>
                        <option value="refines">refines</option>
                        <option value="copies">copies</option>
                        <option value="contains">contains</option>
                      </select>
                      <Input
                        aria-label="Relation to"
                        className="h-8 text-xs flex-1 font-mono"
                        placeholder="Requirement (e.g. req_auth)"
                        value={reqRelTo}
                        onChange={(e) => setReqRelTo(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs w-full"
                      onClick={() => {
                        try {
                          updateSource(
                            document.id,
                            addRequirementRelation(
                              document.source,
                              reqRelFrom,
                              reqRelTo,
                              reqRelType,
                            ),
                          );
                          setReqRelFrom("");
                          setReqRelTo("");
                          say(
                            `Connected ${reqRelFrom} - ${reqRelType} -> ${reqRelTo}`,
                          );
                        } catch (err) {
                          say(err.message);
                        }
                      }}
                    >
                      <Plus className="size-3.5" />
                      Add Relationship
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {isPacket(document) && (
              <div className="mt-5 border-t pt-4">
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <Binary className="size-3.5 text-primary" />
                  <span>Packet bytefield tools</span>
                </div>

                {pktList.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Packet Fields ({pktList.length})
                    </span>
                    <div className="space-y-1.5 max-h-48 overflow-auto">
                      {pktList.map((f, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-1.5 rounded bg-muted/50 px-2 py-1 text-xs"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Badge
                              variant="secondary"
                              className="text-[10px] h-5 px-1.5 font-mono"
                            >
                              {f.start === f.end
                                ? `bit ${f.start}`
                                : `${f.start}–${f.end}`}
                            </Badge>
                            <span className="truncate font-medium text-[11px]">
                              {f.label}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              ({f.bits} {f.bits === 1 ? "bit" : "bits"})
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => {
                              updateSource(
                                document.id,
                                deletePacketField(
                                  document.source,
                                  f.start,
                                  f.end,
                                ),
                              );
                              say(`Removed field "${f.label}"`);
                            }}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 border-t border-dashed pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                    Add packet field
                  </span>
                  <div className="grid gap-2">
                    <div className="flex gap-2">
                      <Input
                        aria-label="Packet start bit"
                        type="number"
                        className="h-8 text-xs w-20 font-mono"
                        placeholder="Start"
                        value={pktStart}
                        onChange={(e) => setPktStart(e.target.value)}
                      />
                      <Input
                        aria-label="Packet end bit"
                        type="number"
                        className="h-8 text-xs w-20 font-mono"
                        placeholder="End (opt)"
                        value={pktEnd}
                        onChange={(e) => setPktEnd(e.target.value)}
                      />
                      <Input
                        aria-label="Packet field label"
                        className="h-8 text-xs flex-1"
                        placeholder="Field name (e.g. Checksum)"
                        value={pktLabel}
                        onChange={(e) => setPktLabel(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs w-full"
                      onClick={() => {
                        try {
                          updateSource(
                            document.id,
                            addPacketField(
                              document.source,
                              pktStart,
                              pktEnd,
                              pktLabel,
                            ),
                          );
                          setPktStart("");
                          setPktEnd("");
                          setPktLabel("");
                          say(`Added packet field "${pktLabel || "Field"}"`);
                        } catch (err) {
                          say(err.message);
                        }
                      }}
                    >
                      <Plus className="size-3.5" />
                      Add Field
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {isArchitecture(document) && (
              <div className="mt-5 border-t pt-4">
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <Network className="size-3.5 text-primary" />
                  <span>Cloud architecture tools</span>
                </div>

                {archGroupList.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Groups & VPCs ({archGroupList.length})
                    </span>
                    <div className="space-y-1.5 max-h-40 overflow-auto">
                      {archGroupList.map((g) => (
                        <div
                          key={g.id}
                          className="flex items-center justify-between gap-1.5 rounded bg-muted/50 px-2 py-1 text-xs"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Badge
                              variant="secondary"
                              className="text-[10px] h-5 px-1.5 font-mono"
                            >
                              {g.icon}
                            </Badge>
                            <span className="font-mono font-medium text-[11px]">
                              {g.id}
                            </span>
                            <span className="truncate text-muted-foreground text-[11px]">
                              {g.title}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => {
                              updateSource(
                                document.id,
                                deleteArchitectureGroup(document.source, g.id),
                              );
                              say(`Removed group "${g.id}"`);
                            }}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {archServiceList.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Services & Nodes ({archServiceList.length})
                    </span>
                    <div className="space-y-1.5 max-h-48 overflow-auto">
                      {archServiceList.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between gap-1.5 rounded bg-muted/50 px-2 py-1 text-xs"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Badge
                              variant="secondary"
                              className="text-[10px] h-5 px-1.5 font-mono"
                            >
                              {s.icon}
                            </Badge>
                            <span className="font-mono font-medium text-[11px]">
                              {s.id}
                            </span>
                            <span className="truncate text-muted-foreground text-[11px]">
                              {s.title}
                            </span>
                            {s.inGroup && (
                              <Badge
                                variant="outline"
                                className="text-[9px] h-4 px-1 font-mono"
                              >
                                in {s.inGroup}
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => {
                              updateSource(
                                document.id,
                                deleteArchitectureService(document.source, s.id),
                              );
                              say(`Removed service "${s.id}"`);
                            }}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {archEdgeList.length > 0 && (
                  <div className="mt-3 border-t border-dashed pt-3">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                      Connections ({archEdgeList.length})
                    </span>
                    <div className="space-y-1.5 max-h-40 overflow-auto">
                      {archEdgeList.map((e, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-1.5 rounded bg-muted/50 px-2 py-1 text-xs"
                        >
                          <div className="flex items-center gap-1.5 truncate font-mono text-[11px]">
                            <span>{e.from}:{e.fromSide}</span>
                            <span className="text-muted-foreground">{e.directed ? "-->" : "--"}</span>
                            <span>{e.toSide}:{e.to}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => {
                              updateSource(
                                document.id,
                                deleteArchitectureEdge(document.source, e.from, e.to),
                              );
                              say(`Removed connection "${e.from} -- ${e.to}"`);
                            }}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 border-t border-dashed pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                    Add architecture service
                  </span>
                  <div className="grid gap-2">
                    <div className="flex gap-2">
                      <Input
                        aria-label="Service identifier"
                        className="h-8 text-xs flex-1 font-mono"
                        placeholder="Service ID (e.g. auth_svc)"
                        value={archSvcId}
                        onChange={(e) => setArchSvcId(e.target.value)}
                      />
                      <Input
                        aria-label="Service title"
                        className="h-8 text-xs flex-1"
                        placeholder="Display title"
                        value={archSvcTitle}
                        onChange={(e) => setArchSvcTitle(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        aria-label="Service icon"
                        className="h-8 rounded-md border bg-background px-2 text-xs flex-1"
                        value={archSvcIcon}
                        onChange={(e) => setArchSvcIcon(e.target.value)}
                      >
                        <option value="server">server (Microservice)</option>
                        <option value="database">database (Database)</option>
                        <option value="cloud">cloud (Gateway/Cloud)</option>
                        <option value="disk">disk (Storage/Cache)</option>
                        <option value="internet">internet (Client/Web)</option>
                        <option value="key">key (Auth/Security)</option>
                        <option value="user">user (User)</option>
                      </select>
                      <Input
                        aria-label="Parent group"
                        className="h-8 text-xs flex-1 font-mono"
                        placeholder="In group (optional)"
                        value={archSvcGroup}
                        onChange={(e) => setArchSvcGroup(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs shrink-0"
                        onClick={() => {
                          try {
                            updateSource(
                              document.id,
                              addArchitectureService(
                                document.source,
                                archSvcId,
                                archSvcTitle,
                                archSvcIcon,
                                archSvcGroup,
                              ),
                            );
                            setArchSvcId("");
                            setArchSvcTitle("");
                            say(`Added service "${archSvcId}"`);
                          } catch (err) {
                            say(err.message);
                          }
                        }}
                      >
                        <Plus className="size-3.5" />
                        Service
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-dashed pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                    Add group boundary
                  </span>
                  <div className="flex gap-2">
                    <Input
                      aria-label="Group identifier"
                      className="h-8 text-xs flex-1 font-mono"
                      placeholder="Group ID (e.g. vpc_prod)"
                      value={archGrpId}
                      onChange={(e) => setArchGrpId(e.target.value)}
                    />
                    <Input
                      aria-label="Group title"
                      className="h-8 text-xs flex-1"
                      placeholder="Title (e.g. Production VPC)"
                      value={archGrpTitle}
                      onChange={(e) => setArchGrpTitle(e.target.value)}
                    />
                    <select
                      aria-label="Group icon"
                      className="h-8 rounded-md border bg-background px-2 text-xs w-24"
                      value={archGrpIcon}
                      onChange={(e) => setArchGrpIcon(e.target.value)}
                    >
                      <option value="cloud">cloud</option>
                      <option value="server">server</option>
                      <option value="disk">disk</option>
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs shrink-0"
                      onClick={() => {
                        try {
                          updateSource(
                            document.id,
                            addArchitectureGroup(
                              document.source,
                              archGrpId,
                              archGrpTitle,
                              archGrpIcon,
                            ),
                          );
                          setArchGrpId("");
                          setArchGrpTitle("");
                          say(`Added group "${archGrpId}"`);
                        } catch (err) {
                          say(err.message);
                        }
                      }}
                    >
                      <Plus className="size-3.5" />
                      Group
                    </Button>
                  </div>
                </div>

                <div className="mt-4 border-t border-dashed pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                    Connect services
                  </span>
                  <div className="grid gap-2">
                    <div className="flex gap-2 items-center">
                      <Input
                        aria-label="Connect from service"
                        className="h-8 text-xs flex-1 font-mono"
                        placeholder="From service"
                        value={archEdgeFrom}
                        onChange={(e) => setArchEdgeFrom(e.target.value)}
                      />
                      <select
                        aria-label="From side"
                        className="h-8 rounded-md border bg-background px-1.5 text-xs w-16 text-center font-mono"
                        value={archEdgeFromSide}
                        onChange={(e) => setArchEdgeFromSide(e.target.value)}
                      >
                        <option value="R">R (Right)</option>
                        <option value="L">L (Left)</option>
                        <option value="B">B (Bottom)</option>
                        <option value="T">T (Top)</option>
                      </select>
                      <span className="text-muted-foreground text-xs font-mono">--</span>
                      <select
                        aria-label="To side"
                        className="h-8 rounded-md border bg-background px-1.5 text-xs w-16 text-center font-mono"
                        value={archEdgeToSide}
                        onChange={(e) => setArchEdgeToSide(e.target.value)}
                      >
                        <option value="L">L (Left)</option>
                        <option value="R">R (Right)</option>
                        <option value="T">T (Top)</option>
                        <option value="B">B (Bottom)</option>
                      </select>
                      <Input
                        aria-label="Connect to service"
                        className="h-8 text-xs flex-1 font-mono"
                        placeholder="To service"
                        value={archEdgeTo}
                        onChange={(e) => setArchEdgeTo(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs w-full"
                      onClick={() => {
                        try {
                          updateSource(
                            document.id,
                            addArchitectureEdge(
                              document.source,
                              archEdgeFrom,
                              archEdgeFromSide,
                              archEdgeTo,
                              archEdgeToSide,
                              archEdgeDirected,
                            ),
                          );
                          setArchEdgeFrom("");
                          setArchEdgeTo("");
                          say(`Connected ${archEdgeFrom} to ${archEdgeTo}`);
                        } catch (err) {
                          say(err.message);
                        }
                      }}
                    >
                      <Plus className="size-3.5" />
                      Add Connection
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="mt-6 w-full text-xs text-destructive"
              disabled={project.documents.length === 1}
              onClick={() => setDialog("delete-file")}
            >
              <Trash2 />
              Delete file
            </Button>
          </>
        )}
      </TabsContent>
      <TabsContent value="history" className="m-0 flex-1 overflow-auto p-3">
        <Button
          variant="outline"
          size="sm"
          className="mb-4 w-full text-xs"
          onClick={snapshot}
          disabled={!document}
        >
          <Save />
          Save snapshot
        </Button>
        {project.snapshots.length === 0 && (
          <p className="px-1 text-xs leading-5 text-muted-foreground">
            Keep checkpoints before making larger edits. Snapshots include the
            original source.
          </p>
        )}
        {project.snapshots.map((s) => (
          <div key={s.id} className="mb-2 rounded-md border p-3">
            <p className="truncate text-xs font-medium">{s.name}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {new Date(s.createdAt).toLocaleString()}
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="mt-2 h-6 text-xs"
              onClick={() => {
                const existing = project.documents.find(
                  (d) => d.id === s.documentId,
                );
                if (existing) {
                  updateSource(existing.id, s.source);
                  openDocument(existing.id);
                } else
                  newFiles([
                    { name: s.name, source: s.source, format: s.format },
                  ]);
                say("Snapshot restored");
              }}
            >
              Restore
            </Button>
          </div>
        ))}
      </TabsContent>
      <TabsContent value="outline" className="m-0 flex-1 overflow-auto py-2">
        {sourceOutline.map((item) => (
          <button
            key={item.line}
            className="flex w-full gap-3 px-3 py-2 text-left text-[11px] hover:bg-accent"
            onClick={() => {
              setView("code");
              requestAnimationFrame(() => editorRef.current?.goTo(item.line));
            }}
          >
            <span className="w-5 shrink-0 text-muted-foreground">
              {item.line}
            </span>
            <span className="truncate">{item.text}</span>
          </button>
        ))}
        {!sourceOutline.length && (
          <p className="p-4 text-xs text-muted-foreground">
            No outline entries for this file.
          </p>
        )}
      </TabsContent>
    </Tabs>
  );

  return (
    <div
      ref={shellRef}
      className="workspace-shell flex flex-col bg-background"
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) e.preventDefault();
      }}
      onDrop={(e) => {
        if (e.dataTransfer.files.length) {
          e.preventDefault();
          importFiles(e.dataTransfer.files);
        }
      }}
    >
      <input
        ref={fileRef}
        type="file"
        multiple
        accept={`${FILE_ACCEPT},.zip`}
        className="hidden"
        onChange={(e) => {
          importFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={folderRef}
        type="file"
        multiple
        webkitdirectory=""
        className="hidden"
        onChange={(e) => {
          importFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div className="flex h-11 shrink-0 items-center gap-1 border-b bg-card px-2 sm:px-3">
        <Menu label="File">
          <Item onSelect={() => openNewFile()} icon={FilePlus}>
            New file<DropdownMenuShortcut>⇧⌘N</DropdownMenuShortcut>
          </Item>
          <Item
            onSelect={() => {
              setName("Untitled project");
              setDialog("new-project");
            }}
            icon={FolderPlus}
          >
            New project
          </Item>
          <DropdownMenuSeparator />
          <Item onSelect={() => fileRef.current?.click()} icon={Upload}>
            Open files / project<DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
          </Item>
          <Item onSelect={() => folderRef.current?.click()} icon={FolderOpen}>
            Open folder
          </Item>
          <Item onSelect={() => setDialog("templates")} icon={Shapes}>
            Create from template
          </Item>
          <DropdownMenuSeparator />
          <Item onSelect={projectBackup} icon={Download}>
            Download project backup
          </Item>
          <Item onSelect={downloadZip} icon={Files}>
            Download all files as ZIP
          </Item>
          <Item
            onSelect={() => doExport("source")}
            icon={FileCode2}
            disabled={!document}
          >
            Download current source
          </Item>
        </Menu>
        <Menu label="Edit">
          <Item
            onSelect={() => editorRef.current?.undo()}
            icon={Undo2}
            disabled={view === "canvas"}
          >
            Undo<DropdownMenuShortcut>⌘Z</DropdownMenuShortcut>
          </Item>
          <Item
            onSelect={() => editorRef.current?.redo()}
            icon={Redo2}
            disabled={view === "canvas"}
          >
            Redo<DropdownMenuShortcut>⇧⌘Z</DropdownMenuShortcut>
          </Item>
          <Item
            onSelect={() => editorRef.current?.search()}
            icon={Search}
            disabled={view === "canvas"}
          >
            Find in file<DropdownMenuShortcut>⌘F</DropdownMenuShortcut>
          </Item>
          <DropdownMenuSeparator />
          <Item
            onSelect={() =>
              updateSource(document.id, formatMermaidCode(document.source))
            }
            icon={Braces}
            disabled={!document || document.format !== "mermaid"}
          >
            Format Mermaid source
          </Item>
          <Item
            onSelect={() =>
              newFiles([
                {
                  name: "preview.mmd",
                  format: "mermaid",
                  source: preview.code,
                },
              ])
            }
            icon={Code2}
            disabled={
              !preview.code ||
              !!preview.error ||
              document?.format === "graphviz"
            }
          >
            Open preview as editable Mermaid
          </Item>
          <Item onSelect={snapshot} icon={History} disabled={!document}>
            Save version snapshot
          </Item>
        </Menu>
        <Menu label="View">
          <Item onSelect={() => setView("split")}>Split editor and canvas</Item>
          <Item onSelect={() => setView("code")}>Source editor</Item>
          <Item onSelect={() => setView("canvas")}>Canvas only</Item>
          <DropdownMenuSeparator />
          <Item onSelect={() => setExplorer(!explorer)} icon={PanelLeft}>
            Toggle explorer
          </Item>
          <Item onSelect={() => setInspector(!inspector)} icon={PanelRight}>
            Toggle inspector
          </Item>
          <Item onSelect={() => canvasRef.current?.fit()} icon={Maximize}>
            Fit diagram<DropdownMenuShortcut>F</DropdownMenuShortcut>
          </Item>
          <Item onSelect={present} icon={Play}>
            Presentation mode
          </Item>
        </Menu>
        <Menu label="Tools">
          <Item onSelect={() => setDialog("assistant")} icon={Sparkles}>
            Diagram assistant
          </Item>
          <Item onSelect={() => setDialog("shortcuts")}>
            Keyboard shortcuts
          </Item>
          <Item onSelect={() => nav("/formats")}>Format capabilities</Item>
        </Menu>
        <div className="mx-2 hidden h-4 border-l sm:block" />
        <Input
          aria-label="Project name"
          className="hidden h-7 max-w-64 border-transparent bg-transparent px-2 text-xs hover:border-border md:block"
          value={project.name}
          onChange={(e) => updateProject({ name: e.target.value })}
        />
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Toggle explorer"
            onClick={() => setExplorer(!explorer)}
          >
            <PanelLeft />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Toggle inspector"
            onClick={() => setInspector(!inspector)}
          >
            <PanelRight />
          </Button>
          {presentation && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setPresentation(false);
                globalThis.document.exitFullscreen?.();
              }}
            >
              Exit
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="text-xs" disabled={!document}>
                <Download />
                Export
                <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Current file</DropdownMenuLabel>
              <Item onSelect={() => doExport("source")}>
                Original format source
              </Item>
              {document?.original && (
                <Item onSelect={() => doExport("original")}>
                  Original imported workbook
                </Item>
              )}
              <Item
                onSelect={() => doExport("mermaid")}
                disabled={
                  !preview.code ||
                  !!preview.error ||
                  document?.format === "graphviz"
                }
              >
                Derived Mermaid source
              </Item>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Current preview</DropdownMenuLabel>
              {[
                ["svg", "SVG vector"],
                ["ai", "Adobe Illustrator (.ai.svg)"],
                ["png", "PNG image · 2×"],
                ["png4", "PNG image · 4×"],
                ["pdf", "PDF document"],
                ["pptx", "PowerPoint slide (.pptx)"],
                ["pptx-deck", "Multi-slide presentation deck (.pptx)"],
                ["html", "Interactive HTML"],
                ["xmind", "XMind mindmap"],
                ["copy", "Copy Markdown"],
              ].map(([id, text]) => (
                <Item
                  key={id}
                  onSelect={() => doExport(id)}
                  disabled={!!preview.error || preview.status.state !== "ok"}
                >
                  {text}
                </Item>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Derived UML / code targets</DropdownMenuLabel>
              {[
                ["plantuml", "PlantUML (.puml)"],
                ["dot", "Graphviz DOT (.dot)"],
                ["d2", "D2 (.d2)"],
                ["sql", "SQL DDL (.sql)"],
                ["dbml", "DBML (.dbml)"],
                ["xmi", "UML XMI (.xmi)"],
                ["ts", "TypeScript stub (.ts)"],
                ["opml", "OPML outline (.opml)"],
                ["md", "Markdown outline (.md)"],
                ["openapi", "OpenAPI spec (.json)"],
                ["prisma", "Prisma schema (.prisma)"],
                ["graphql", "GraphQL schema (.graphql)"],
                ["terraform", "Terraform HCL (.tf)"],
              ].map(([id, text]) => (
                <Item
                  key={id}
                  onSelect={() => doExport(id)}
                  disabled={!!preview.error || preview.status.state !== "ok"}
                >
                  {text}
                </Item>
              ))}
              <DropdownMenuSeparator />
              <Item onSelect={projectBackup}>Project backup (.atlas)</Item>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {explorer && (
          <aside className="hidden w-52 shrink-0 border-r bg-card lg:block">
            {explorerPanel}
          </aside>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <div
            className="flex h-10 shrink-0 items-center overflow-x-auto border-b bg-background"
            role="tablist"
            aria-label="Open documents"
            onContextMenu={(e) => {
              if (e.target.closest('[role="tab"], .group')) return;
              e.preventDefault();
              setContextMenu({
                isOpen: true,
                position: { x: e.clientX, y: e.clientY },
                title: "Editor Tabs",
                items: [
                  {
                    id: "new-file",
                    label: "New Diagram File",
                    icon: FilePlus,
                    shortcut: "⌘⇧N",
                    onClick: () => openNewFile(),
                  },
                  {
                    id: "reopen-closed",
                    label: "Reopen Closed Tab",
                    icon: RotateCcw,
                    shortcut: "⌘⇧T",
                    disabled: recentlyClosedTabs.current.length === 0,
                    onClick: () => reopenClosedTab(),
                  },
                  {
                    id: "close-all",
                    label: "Close All Tabs",
                    icon: X,
                    disabled: project.openIds.length === 0,
                    onClick: () => closeAllTabs(),
                  },
                  { divider: true },
                  {
                    id: "split-view",
                    label: "Split View Layout",
                    icon: Split,
                    onClick: () => setView("split"),
                  },
                  {
                    id: "toggle-grid",
                    label: "Cycle Canvas Grid",
                    icon: Crosshair,
                    onClick: () => setGrid((g) => (g === "dots" ? "lines" : g === "lines" ? "none" : "dots")),
                  },
                ],
              });
            }}
            onKeyDown={(event) => {
              if (
                !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
              )
                return;
              event.preventDefault();
              const ids = project.openIds;
              const current = ids.indexOf(project.activeId);
              const next =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? ids.length - 1
                    : (current +
                        (event.key === "ArrowRight" ? 1 : -1) +
                        ids.length) %
                      ids.length;
              if (ids[next]) {
                openDocument(ids[next]);
                requestAnimationFrame(() =>
                  globalThis.document
                    .querySelector('[role="tab"][aria-selected="true"]')
                    ?.focus(),
                );
              }
            }}
          >
            {project.openIds.map((id) => {
              const d = project.documents.find((doc) => doc.id === id);
              return (
                d && (
                  <div
                    key={id}
                    className={cn(
                      "flex h-full shrink-0 items-center border-r transition-colors group",
                      id === project.activeId ? "bg-card" : "bg-background hover:bg-card/40",
                    )}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setContextMenu({
                        isOpen: true,
                        position: { x: e.clientX, y: e.clientY },
                        title: d.name,
                        items: [
                          {
                            id: "close",
                            label: "Close Tab",
                            icon: X,
                            shortcut: "⌘W",
                            onClick: () => closeTab(id),
                          },
                          {
                            id: "close-others",
                            label: "Close Others",
                            disabled: project.openIds.length <= 1,
                            onClick: () => closeOtherTabs(id),
                          },
                          {
                            id: "close-right",
                            label: "Close to the Right",
                            disabled:
                              project.openIds.indexOf(id) ===
                              project.openIds.length - 1,
                            onClick: () => closeTabsToRight(id),
                          },
                          {
                            id: "close-all",
                            label: "Close All Tabs",
                            onClick: () => closeAllTabs(),
                          },
                          {
                            id: "reopen-closed",
                            label: "Reopen Closed Tab",
                            icon: RotateCcw,
                            shortcut: "⌘⇧T",
                            disabled: recentlyClosedTabs.current.length === 0,
                            onClick: () => reopenClosedTab(),
                          },
                          { divider: true },
                          {
                            id: "rename",
                            label: "Rename...",
                            icon: Pencil,
                            shortcut: "F2",
                            onClick: () => startRenameFile(id),
                          },
                          {
                            id: "duplicate",
                            label: "Duplicate File",
                            icon: Copy,
                            shortcut: "⌘D",
                            onClick: () => duplicateFile(id),
                          },
                          {
                            id: "copy-name",
                            label: "Copy File Name",
                            onClick: () => {
                              navigator.clipboard?.writeText(d.name);
                              say(`Copied "${d.name}"`);
                            },
                          },
                          {
                            id: "copy-source",
                            label: "Copy Diagram Code",
                            onClick: () => {
                              navigator.clipboard?.writeText(d.source);
                              say(`Copied ${d.name} source to clipboard`);
                            },
                          },
                          { divider: true },
                          {
                            id: "delete",
                            label: "Delete File",
                            icon: Trash2,
                            danger: true,
                            onClick: () => deleteFile(id),
                          },
                        ],
                      });
                    }}
                  >
                    <button
                      role="tab"
                      tabIndex={id === project.activeId ? 0 : -1}
                      aria-controls="document-panel"
                      aria-selected={id === project.activeId}
                      className={cn(
                        "flex h-full items-center gap-2 border-t-2 pl-3 pr-2 text-xs",
                        id === project.activeId
                          ? "border-primary text-foreground"
                          : "border-transparent text-muted-foreground",
                      )}
                      onClick={() => openDocument(id)}
                    >
                      <FileCode2 className="size-3.5" />
                      {d.name}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="mr-2"
                      aria-label={`Close ${d.name}`}
                      onClick={() => closeTab(id)}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                )
              );
            })}
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Add file tab"
              className="mx-2 shrink-0"
              onClick={() => openNewFile()}
            >
              <FilePlus />
            </Button>
          </div>
          <div className="flex h-10 shrink-0 items-center justify-between gap-2 border-b bg-card px-3">
            <div className="flex min-w-0 items-center gap-2">
              <Code2 className="size-3.5 text-muted-foreground" />
              <span className="truncate text-[11px] text-muted-foreground">
                {document?.name || "No file selected"}
              </span>
              {document && <Badge>{definition.name}</Badge>}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <div
                className="flex rounded-md border p-0.5"
                aria-label="Editor layout"
              >
                {[
                  ["split", "Split"],
                  ["code", "Source"],
                  ["canvas", "Canvas"],
                ].map(([id, text]) => (
                  <button
                    key={id}
                    aria-pressed={view === id}
                    onClick={() => setView(id)}
                    className={cn(
                      "rounded px-2 py-1 text-[10px]",
                      view === id
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {text}
                  </button>
                ))}
              </div>
              <select
                aria-label="Diagram theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="hidden h-7 rounded border bg-background px-1 text-[10px] sm:block"
              >
                {["dark", "default", "forest", "neutral"].map((t) => (
                  <option key={t} value={t}>
                    {t === "default"
                      ? "Light"
                      : t[0].toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
              <GridToggle grid={grid} onChange={setGrid} />
            </div>
          </div>
          {document ? (
            <div
              ref={splitRef}
              id="document-panel"
              role="tabpanel"
              aria-label={document.name}
              className={cn(
                "workspace-panels min-h-0 flex-1 overflow-hidden",
                view === "canvas" && "canvas-only",
                view === "code" && "source-only",
              )}
            >
              {view !== "canvas" && (
                <div
                  className={cn(
                    "min-h-0 min-w-0 overflow-hidden bg-card",
                    view === "split" && "hidden lg:block",
                  )}
                >
                  <CodeEditor
                    ref={editorRef}
                    document={document}
                    onChange={updateSource}
                    onContextMenu={(e) => {
                      setContextMenu({
                        isOpen: true,
                        position: { x: e.clientX, y: e.clientY },
                        title: document.name,
                        items: [
                          {
                            id: "format",
                            label: "Format Document",
                            icon: Code2,
                            shortcut: "⇧⌥F",
                            onClick: () => {
                              editorRef.current?.format();
                              say("Formatted document");
                            },
                          },
                          {
                            id: "ai-fix",
                            label: "AI Diagnostics & Fix",
                            icon: Sparkles,
                            shortcut: "Alt+F",
                            onClick: () => runAiFix(),
                          },
                          { divider: true },
                          {
                            id: "undo",
                            label: "Undo",
                            icon: Undo2,
                            shortcut: "⌘Z",
                            onClick: () => editorRef.current?.undo(),
                          },
                          {
                            id: "redo",
                            label: "Redo",
                            icon: Redo2,
                            shortcut: "⌘⇧Z",
                            onClick: () => editorRef.current?.redo(),
                          },
                          { divider: true },
                          {
                            id: "find",
                            label: "Find & Replace",
                            icon: Search,
                            shortcut: "⌘F",
                            onClick: () => editorRef.current?.search(),
                          },
                          {
                            id: "select-all",
                            label: "Select All",
                            shortcut: "⌘A",
                            onClick: () => editorRef.current?.selectAll(),
                          },
                          {
                            id: "copy-all",
                            label: "Copy All Code",
                            icon: Copy,
                            onClick: () => {
                              editorRef.current?.copyAll();
                              say("Copied all source code to clipboard");
                            },
                          },
                          { divider: true },
                          {
                            id: "assistant",
                            label: "Open Diagram Assistant...",
                            icon: Sparkles,
                            onClick: () => setDialog("assistant"),
                          },
                        ],
                      });
                    }}
                  />
                </div>
              )}
              {view === "split" && (
                <div
                  role="separator"
                  aria-label="Resize editor and canvas"
                  aria-orientation="vertical"
                  tabIndex={0}
                  onPointerDown={startResize}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                      e.preventDefault();
                      const value = parseFloat(
                        splitRef.current.style.getPropertyValue(
                          "--editor-width",
                        ) || "48",
                      );
                      splitRef.current.style.setProperty(
                        "--editor-width",
                        `${Math.max(25, Math.min(75, value + (e.key === "ArrowRight" ? 5 : -5)))}%`,
                      );
                    }
                  }}
                  className="hidden cursor-col-resize border-x bg-background hover:bg-primary/40 focus:bg-primary/40 lg:block"
                />
              )}
              {view !== "code" && (
                <div className="relative min-h-0 min-w-0 overflow-hidden">
                  <CanvasStage
                    ref={canvasRef}
                    containerRef={preview.containerRef}
                    status={preview.status}
                    documentId={document.id}
                    grid={grid}
                    theme={theme}
                    selected={selected}
                    onSelect={chooseNode}
                    onContextMenu={(e, nodeInfo) => {
                      if (nodeInfo) {
                        const targetNodeId =
                          nodeInfo.id.match(/^flowchart-(.+)-\d+$/)?.[1] ||
                          nodeInfo.id;
                        setContextMenu({
                          isOpen: true,
                          position: { x: e.clientX, y: e.clientY },
                          title: nodeInfo.label || `Node ${targetNodeId}`,
                          items: [
                            {
                              id: "add-child",
                              label: "Add Connected Step",
                              icon: Plus,
                              shortcut: "Tab",
                              disabled: !isFlowchart(document),
                              onClick: () => {
                                try {
                                  const res = addFlowchartChild(
                                    document.source,
                                    targetNodeId,
                                    "Next step",
                                    edgeArrow,
                                  );
                                  updateSource(document.id, res.source);
                                  setSelected({
                                    id: `flowchart-${res.childId}-0`,
                                    label: res.childLabel,
                                  });
                                  setLabel(res.childLabel);
                                  say(`Added connected step ${res.childId}`);
                                } catch (err) {
                                  say(err.message);
                                }
                              },
                            },
                            {
                              id: "duplicate-node",
                              label: "Duplicate Node",
                              icon: Copy,
                              shortcut: "⌘D",
                              disabled: !isFlowchart(document),
                              onClick: () => {
                                try {
                                  const res = duplicateFlowchartNode(
                                    document.source,
                                    targetNodeId,
                                  );
                                  updateSource(document.id, res.source);
                                  setSelected({
                                    id: `flowchart-${res.duplicateId}-0`,
                                    label: res.duplicateLabel,
                                  });
                                  setLabel(res.duplicateLabel);
                                  say(`Duplicated node as ${res.duplicateId}`);
                                } catch (err) {
                                  say(err.message);
                                }
                              },
                            },
                            {
                              id: "edit-label",
                              label: "Edit in Inspector",
                              icon: Pencil,
                              onClick: () => {
                                setInspector(true);
                                setInspectorTab("properties");
                              },
                            },
                            {
                              id: "delete-node",
                              label: "Delete Node",
                              icon: Trash2,
                              danger: true,
                              disabled: !isFlowchart(document),
                              onClick: () => {
                                try {
                                  updateSource(
                                    document.id,
                                    deleteFlowchartNode(document.source, targetNodeId),
                                  );
                                  setSelected(null);
                                  say("Node removed");
                                } catch (err) {
                                  say(err.message);
                                }
                              },
                            },
                            { divider: true },
                            {
                              id: "copy-node-id",
                              label: "Copy Node ID",
                              onClick: () => {
                                navigator.clipboard?.writeText(targetNodeId);
                                say(`Copied node ID "${targetNodeId}"`);
                              },
                            },
                            {
                              id: "copy-node-label",
                              label: "Copy Node Label",
                              onClick: () => {
                                navigator.clipboard?.writeText(
                                  nodeInfo.label || targetNodeId,
                                );
                                say(
                                  `Copied label "${nodeInfo.label || targetNodeId}"`,
                                );
                              },
                            },
                            { divider: true },
                            {
                              id: "fit",
                              label: "Fit Canvas to View",
                              icon: Maximize,
                              shortcut: "F",
                              onClick: () => canvasRef.current?.fit(),
                            },
                            {
                              id: "center",
                              label: "Center Content",
                              icon: Crosshair,
                              shortcut: "C",
                              onClick: () => canvasRef.current?.center(),
                            },
                          ],
                        });
                      } else {
                        setContextMenu({
                          isOpen: true,
                          position: { x: e.clientX, y: e.clientY },
                          title: "Canvas Controls",
                          items: [
                            {
                              id: "fit",
                              label: "Fit to View",
                              icon: Maximize,
                              shortcut: "F",
                              onClick: () => canvasRef.current?.fit(),
                            },
                            {
                              id: "center",
                              label: "Center Content",
                              icon: Crosshair,
                              shortcut: "C",
                              onClick: () => canvasRef.current?.center(),
                            },
                            {
                              id: "reset",
                              label: "Reset Zoom (100%)",
                              icon: RotateCcw,
                              shortcut: "0",
                              onClick: () => canvasRef.current?.reset(),
                            },
                            {
                              id: "zoom-in",
                              label: "Zoom In",
                              icon: Plus,
                              shortcut: "+",
                              onClick: () => canvasRef.current?.zoomIn(),
                            },
                            {
                              id: "zoom-out",
                              label: "Zoom Out",
                              icon: Minus,
                              shortcut: "-",
                              onClick: () => canvasRef.current?.zoomOut(),
                            },
                            { divider: true },
                            {
                              id: "export-svg",
                              label: "Export Vector SVG",
                              icon: Download,
                              onClick: exportSvg,
                            },
                            {
                              id: "export-png",
                              label: "Export High-Res PNG",
                              icon: Image,
                              onClick: exportPng,
                            },
                            {
                              id: "copy-code",
                              label: "Copy Mermaid Source",
                              icon: Copy,
                              onClick: () => {
                                navigator.clipboard?.writeText(document.source);
                                say("Copied source to clipboard");
                              },
                            },
                            { divider: true },
                            {
                              id: "toggle-grid",
                              label: "Cycle Canvas Grid",
                              icon: Crosshair,
                              onClick: () =>
                                setGrid((g) =>
                                  g === "dots"
                                    ? "lines"
                                    : g === "lines"
                                      ? "none"
                                      : "dots",
                                ),
                            },
                            {
                              id: "quick-fix",
                              label: "AI Diagnostics & Fix",
                              icon: Sparkles,
                              shortcut: "Alt+F",
                              onClick: () => runAiFix(),
                            },
                          ],
                        });
                      }
                    }}
                    onQuickAdd={() => {
                      if (!isFlowchart(document) || !nodeId) return;
                      try {
                        const res = addFlowchartChild(
                          document.source,
                          nodeId,
                          "Next step",
                          edgeArrow,
                        );
                        updateSource(document.id, res.source);
                        setSelected({
                          id: `flowchart-${res.childId}-0`,
                          label: res.childLabel,
                        });
                        setLabel(res.childLabel);
                        say(`Added connected step ${res.childId}`);
                      } catch (e) {
                        say(e.message);
                      }
                    }}
                    onDeleteSelected={() => {
                      if (!isFlowchart(document) || !nodeId) return;
                      try {
                        updateSource(
                          document.id,
                          deleteFlowchartNode(document.source, nodeId),
                        );
                        setSelected(null);
                        say("Node removed");
                      } catch (e) {
                        say(e.message);
                      }
                    }}
                    onDuplicateSelected={() => {
                      if (!isFlowchart(document) || !nodeId) return;
                      try {
                        const res = duplicateFlowchartNode(
                          document.source,
                          nodeId,
                        );
                        updateSource(document.id, res.source);
                        setSelected({
                          id: `flowchart-${res.duplicateId}-0`,
                          label: res.duplicateLabel,
                        });
                        setLabel(res.duplicateLabel);
                        say(`Duplicated node as ${res.duplicateId}`);
                      } catch (e) {
                        say(e.message);
                      }
                    }}
                    presentation={presentation}
                  />
                  {preview.error && (
                    <div
                      role="alert"
                      className="absolute left-3 right-3 top-3 rounded-md border border-destructive/30 bg-card p-3 shadow-lg"
                    >
                      <p className="flex items-center gap-2 text-xs font-medium text-destructive">
                        <AlertCircle className="size-4" />
                        Preview needs attention
                      </p>
                      <p className="mt-2 max-h-24 overflow-auto text-xs leading-5 text-muted-foreground">
                        {preview.error}
                      </p>
                      <p className="mt-2 text-[10px] text-muted-foreground">
                        The last valid preview for this file is retained.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="grid flex-1 place-items-center p-8 text-center">
              <div>
                <Files className="mx-auto size-10 text-muted-foreground" />
                <h2 className="mt-4 text-lg font-medium">
                  Your workspace is ready
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Open a file from the explorer or create a new diagram.
                </p>
                <Button className="mt-5" onClick={() => openNewFile()}>
                  <FilePlus />
                  New file
                </Button>
              </div>
            </div>
          )}
          <div
            className="max-h-32 shrink-0 overflow-auto border-t bg-card px-3 py-2"
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({
                isOpen: true,
                position: { x: e.clientX, y: e.clientY },
                title: "Problems & Diagnostics",
                items: [
                  {
                    id: "ai-fix-problems",
                    label: "Run AI Diagnostics & Fix",
                    icon: Sparkles,
                    shortcut: "Alt+F",
                    onClick: () => runAiFix(),
                  },
                  {
                    id: "copy-error",
                    label: "Copy Error Diagnostics",
                    icon: Copy,
                    disabled: !preview.error,
                    onClick: () => {
                      if (preview.error) {
                        navigator.clipboard?.writeText(preview.error);
                        say("Copied error to clipboard");
                      }
                    },
                  },
                  { divider: true },
                  {
                    id: "view-split",
                    label: "View: Split",
                    icon: Split,
                    onClick: () => setView("split"),
                  },
                  {
                    id: "view-code",
                    label: "View: Source Only",
                    icon: Code2,
                    onClick: () => setView("code"),
                  },
                  {
                    id: "view-canvas",
                    label: "View: Canvas Only",
                    icon: Maximize,
                    onClick: () => setView("canvas"),
                  },
                ],
              });
            }}
          >
            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              <AlertCircle className="size-3" />
              Problems & output
              <span className="ml-auto">
                {preview.error
                  ? "1 error"
                  : preview.warnings.length
                    ? `${preview.warnings.length} note`
                    : "No errors"}
              </span>
            </div>
            {preview.error ? (
              <>
                <p
                  role="alert"
                  className="mt-2 text-xs leading-5 text-destructive"
                >
                  {preview.error}
                </p>
                <DiagnosticsPanel
                  document={document}
                  error={preview.error}
                  code={preview.code}
                  onApplyFix={(fixed) => updateSource(document.id, fixed)}
                />
              </>
            ) : (
              preview.warnings.map((warning, i) => (
                <p
                  key={i}
                  className="mt-2 text-[11px] leading-5 text-muted-foreground"
                >
                  {warning}
                </p>
              ))
            )}
          </div>
        </div>
        {inspector && (
          <aside className="hidden w-64 shrink-0 border-l bg-card xl:block">
            {inspectorPanel}
          </aside>
        )}
      </div>
      <div
        className="flex h-7 shrink-0 items-center gap-3 border-t bg-card px-3 text-[10px] text-muted-foreground"
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenu({
            isOpen: true,
            position: { x: e.clientX, y: e.clientY },
            title: "Status Bar & Workspace",
            items: [
              {
                id: "shortcuts",
                label: "Keyboard Shortcuts...",
                icon: Braces,
                shortcut: "?",
                onClick: () => setDialog("shortcuts"),
              },
              {
                id: "toggle-explorer",
                label: "Toggle File Explorer",
                icon: PanelLeft,
                onClick: () => setExplorer((ex) => !ex),
              },
              {
                id: "toggle-inspector",
                label: "Toggle Inspector Sidebar",
                icon: PanelRight,
                onClick: () => setInspector((ins) => !ins),
              },
              { divider: true },
              {
                id: "reset-view",
                label: "Reset Layout to Split View",
                icon: Split,
                onClick: () => setView("split"),
              },
              {
                id: "save-project",
                label: "Save Project Now",
                icon: Save,
                shortcut: "⌘S",
                onClick: () =>
                  say(
                    saveStatus === "Saved locally"
                      ? "Project saved in this browser"
                      : saveStatus,
                  ),
              },
            ],
          });
        }}
      >
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              "size-1.5 rounded-full",
              saveStatus.startsWith("Storage")
                ? "bg-rose-400"
                : "bg-emerald-400",
            )}
          />
          {saveStatus}
        </span>
        <span className="hidden sm:inline">
          {project.documents.length} files
        </span>
        <span className="ml-auto truncate">{preview.status.message}</span>
        <button
          className="hover:text-foreground"
          onClick={() => setDialog("shortcuts")}
        >
          Shortcuts
        </button>
      </div>
      <Dialog open={explorer && width < 1024} onOpenChange={setExplorer}>
        <DialogContent className="flex h-[70vh] flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b p-4">
            <DialogTitle>Project files</DialogTitle>
            <DialogDescription>
              Select a file to edit in your workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1">{explorerPanel}</div>
        </DialogContent>
      </Dialog>
      <Dialog open={inspector && width < 1280} onOpenChange={setInspector}>
        <DialogContent className="flex h-[75vh] flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b p-4">
            <DialogTitle>Inspector & history</DialogTitle>
            <DialogDescription>
              File settings, visual tools, and version checkpoints.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1">{inspectorPanel}</div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!dialog}
        onOpenChange={(open) => {
          if (!open) {
            setRenameId(null);
            setDialog(null);
          }
        }}
      >
        <DialogContent
          className={cn(
            "max-h-[85vh] overflow-auto",
            dialog === "templates" && "sm:max-w-2xl",
          )}
        >
          <DialogHeader>
            <DialogTitle>
              {
                {
                  "new-file": "Create a file",
                  "new-project": "Create a project",
                  rename: "Rename file",
                  templates: "Template library",
                  assistant: "Diagram assistant",
                  "delete-file": "Delete this file?",
                  "import-errors": "Some files could not be opened",
                  shortcuts: "Keyboard shortcuts",
                }[dialog]
              }
            </DialogTitle>
            <DialogDescription>
              {
                {
                  "new-file":
                    "Choose the source format. Each file stays editable in its original language.",
                  "new-project":
                    "A project groups related files, tabs, and snapshots in this browser.",
                  rename: "Change the filename without changing its contents.",
                  templates: "Add a diagram to your current project.",
                  assistant:
                    "Draft a new diagram from a description. Review the generated source before using it.",
                  "delete-file":
                    "This removes the file from this project. Existing version snapshots remain available.",
                  "import-errors":
                    "Successfully recognized files were opened. The following files need attention.",
                  shortcuts:
                    "Use the editor and canvas without leaving the keyboard.",
                }[dialog]
              }
            </DialogDescription>
          </DialogHeader>
          {["new-file", "new-project", "rename"].includes(dialog) && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!name.trim()) return;
                if (dialog === "new-file") {
                  newFiles([{ ...createDocument(format, name.trim()) }]);
                } else if (dialog === "new-project") {
                  addProject(createProject(name.trim()));
                  nav("/studio", { replace: true });
                } else {
                  const targetDocId = renameId || document?.id;
                  if (
                    project.documents.some(
                      (d) => d.id !== targetDocId && d.name === name.trim(),
                    )
                  ) {
                    say("A file already has that name.");
                    return;
                  }
                  updateProject((p) => ({
                    ...p,
                    documents: p.documents.map((d) =>
                      d.id === targetDocId ? { ...d, name: name.trim() } : d,
                    ),
                  }));
                  setRenameId(null);
                }
                setDialog(null);
              }}
            >
              <label
                className="mb-2 block text-xs text-muted-foreground"
                htmlFor="new-name"
              >
                {dialog === "new-project" ? "Project name" : "File name"}
              </label>
              <Input
                id="new-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
              {dialog === "new-file" && (
                <>
                  <label
                    className="mb-2 mt-4 block text-xs text-muted-foreground"
                    htmlFor="new-format"
                  >
                    Source format
                  </label>
                  <select
                    id="new-format"
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                    value={format}
                    onChange={(e) => {
                      setFormat(e.target.value);
                      setName(`untitled.${getFormat(e.target.value).ext}`);
                    }}
                  >
                    {FORMATS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    {getFormat(format).description}
                  </p>
                </>
              )}
              <DialogFooter className="mt-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialog(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {dialog === "rename" ? "Rename" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          )}
          {dialog === "templates" && (
            <>
              <Input
                aria-label="Search templates"
                placeholder="Search UML, ER, architecture…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="grid max-h-[50vh] gap-2 overflow-auto sm:grid-cols-2">
                {DIAGRAM_TEMPLATES.filter((t) =>
                  (t.title + t.kind + t.category)
                    .toLowerCase()
                    .includes(query.toLowerCase()),
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => selectTemplate(t)}
                    className="rounded-md border bg-card p-3 text-left hover:border-primary"
                  >
                    <Badge>{t.kind}</Badge>
                    <p className="mt-2 text-xs font-medium">
                      {t.title.replace(/^\d+\. /, "")}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {t.category}
                    </p>
                  </button>
                ))}
              </div>
            </>
          )}
          {dialog === "assistant" && (
            <>
              <textarea
                aria-label="Diagram description"
                className="min-h-32 w-full rounded-md border bg-background p-3 text-sm"
                placeholder="Describe a system, process, database, or roadmap…"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  aria-label="Assistant diagram type"
                  className="h-9 rounded border bg-background px-2 text-xs"
                  value={aiType}
                  onChange={(e) => setAiType(e.target.value)}
                >
                  {SUPPORTED_DIAGRAM_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label.replace(/^\S+\s/, "")}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Assistant engine"
                  className="h-9 rounded border bg-background px-2 text-xs"
                  value={aiMode}
                  onChange={(e) => setAiMode(e.target.value)}
                >
                  <option value="instant">Instant · rule-based</option>
                  <option value="qwen">Qwen · local WebGPU</option>
                </select>
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                {aiMode === "instant"
                  ? "Runs immediately using local rules. This is a starting draft, not a trained language model."
                  : "Downloads Qwen model weights on first use. Requires WebGPU; prompts run on your device."}
              </p>
              {assistant.progress && (
                <p role="status" className="text-xs text-primary">
                  {assistant.progress}
                </p>
              )}
              <Button
                disabled={assistant.busy || !prompt.trim()}
                onClick={async () => {
                  try {
                    const source = await assistant.generate(
                      prompt,
                      aiType,
                      aiMode,
                    );
                    if (!source)
                      throw new Error("No diagram source was generated.");
                    newFiles([
                      {
                        name: "assistant-draft.mmd",
                        format: "mermaid",
                        source,
                      },
                    ]);
                    setDialog(null);
                    say("Draft added as a new file");
                  } catch (e) {
                    say(e.message);
                  }
                }}
              >
                <Sparkles />
                {assistant.busy ? "Generating…" : "Generate new draft"}
              </Button>
            </>
          )}
          {dialog === "delete-file" && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialog(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  updateProject((p) => {
                    const documents = p.documents.filter(
                      (d) => d.id !== document.id,
                    );
                    return {
                      ...p,
                      documents,
                      openIds: p.openIds.filter((id) => id !== document.id),
                      activeId: documents[0].id,
                    };
                  });
                  setDialog(null);
                }}
              >
                Delete file
              </Button>
            </DialogFooter>
          )}
          {dialog === "import-errors" && (
            <pre className="whitespace-pre-wrap rounded-md border bg-card p-3 text-xs leading-6 text-muted-foreground">
              {name}
            </pre>
          )}
          {dialog === "shortcuts" && (
            <div className="grid gap-2">
              {[
                ["Save locally", "⌘ / Ctrl + S"],
                ["Open files", "⌘ / Ctrl + O"],
                ["New file", "⌘ / Ctrl + Shift + N"],
                ["Close active tab", "⌘ / Ctrl + W"],
                ["Reopen closed tab", "⌘ / Ctrl + Shift + T"],
                ["Rename active file", "F2"],
                ["Context menu (any section)", "Right Click"],
                ["Search commands", "⌘ / Ctrl + K"],
                ["Find in source", "⌘ / Ctrl + F"],
                ["Undo / redo", "⌘Z / ⇧⌘Z"],
                ["Quick add child step", "Tab / Enter (node selected)"],
                ["Duplicate node", "⌘ / Ctrl + D (node selected)"],
                ["Delete selected node", "Delete / Backspace"],
                ["Fit / center / reset", "F / C / 0"],
                ["Zoom", "+ / −"],
                ["Pan", "Drag / arrow keys"],
                ["Presentation laser", "Move pointer in presentation"],
              ].map(([action, key]) => (
                <div
                  key={action}
                  className="flex justify-between gap-4 border-b py-2 text-xs"
                >
                  <span className="text-muted-foreground">{action}</span>
                  <kbd className="text-right">{key}</kbd>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
      {toast && (
        <div
          role="status"
          className="fixed bottom-10 left-1/2 z-[100] max-w-[90vw] -translate-x-1/2 rounded-md border bg-popover px-4 py-3 text-xs shadow-xl"
        >
          {toast}
        </div>
      )}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        title={contextMenu.title}
        items={contextMenu.items}
        onClose={() => setContextMenu((c) => ({ ...c, isOpen: false }))}
      />
    </div>
  );
}
function Menu({ label, children }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
function Item({ icon: Icon, children, ...props }) {
  return (
    <DropdownMenuItem className="text-xs" {...props}>
      {Icon && <Icon className="size-3.5" />}
      {children}
    </DropdownMenuItem>
  );
}
