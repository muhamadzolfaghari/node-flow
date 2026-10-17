import { useState, useDeferredValue, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FilePlus,
  FolderOpen,
  Shapes,
  Upload,
  Download,
  Save,
  FileCode2,
  Pencil,
  Copy,
  Image,
  Trash2,
  Sparkles,
} from "lucide-react";
import { Button, Input } from "../../../components/ui.tsx";
import { cn } from "../../../lib/utils.ts";

export function ExplorerPanel({
  project,
  openNewFile,
  fileRef,
  setDialog,
  downloadZip,
  projectBackup,
  openDocument,
  startRenameFile,
  duplicateFile,
  say,
  doExport,
  deleteFile,
  setContextMenu,
}) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query, "");

  const fileList = useMemo(() => {
    if (!project?.documents) return [];
    const q = deferredQuery.trim().toLowerCase();
    return q
      ? project.documents.filter((d) => d.name.toLowerCase().includes(q))
      : project.documents;
  }, [project?.documents, deferredQuery]);

  return (
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
          <span className="truncate">{project?.name}</span>
          <span className="ml-auto text-[10px] text-muted-foreground">
            {project?.documents?.length || 0}
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
          setContextMenu?.({
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
                onClick: () => fileRef?.current?.click(),
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
              setContextMenu?.({
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
                      setTimeout(() => doExport("svg"), 1200);
                    },
                  },
                  {
                    id: "export-png",
                    label: "Export High-Res PNG",
                    icon: Image,
                    onClick: () => {
                      openDocument(d.id);
                      setTimeout(() => doExport("png"), 1200);
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
              d.id === project?.activeId
                ? "border-primary bg-primary/10 text-foreground"
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
      {/* Role-Specific Workspaces & Starter Kits */}
      <div className="border-t p-2">
        <div className="flex items-center justify-between px-1 mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Role Starters
          </span>
          <span className="text-[9px] text-muted-foreground">Tailored</span>
        </div>
        <div className="grid grid-cols-2 gap-1 text-[11px]">
          <button
            type="button"
            onClick={() => setDialog("templates")}
            className="flex items-center gap-1.5 rounded-md border border-border/70 bg-card/60 px-2 py-1.5 text-left text-muted-foreground hover:bg-accent hover:text-foreground transition"
            title="Product Manager: User Story Maps, OKRs, Funnels"
          >
            <span className="text-xs">🎯</span>
            <span className="truncate font-medium">Product (PM)</span>
          </button>
          <button
            type="button"
            onClick={() => setDialog("templates")}
            className="flex items-center gap-1.5 rounded-md border border-border/70 bg-card/60 px-2 py-1.5 text-left text-muted-foreground hover:bg-accent hover:text-foreground transition"
            title="QA & Testing: Defect Lifecycles, CI Gates, E2E Smoke"
          >
            <span className="text-xs">🧪</span>
            <span className="truncate font-medium">QA & Test</span>
          </button>
          <button
            type="button"
            onClick={() => setDialog("templates")}
            className="flex items-center gap-1.5 rounded-md border border-border/70 bg-card/60 px-2 py-1.5 text-left text-muted-foreground hover:bg-accent hover:text-foreground transition"
            title="Developers & Architects: C4, Microservices, DB ER"
          >
            <span className="text-xs">💻</span>
            <span className="truncate font-medium">Developer</span>
          </button>
          <button
            type="button"
            onClick={() => setDialog("templates")}
            className="flex items-center gap-1.5 rounded-md border border-border/70 bg-card/60 px-2 py-1.5 text-left text-muted-foreground hover:bg-accent hover:text-foreground transition"
            title="Operations & Business: SOP Workflows, Org Charts"
          >
            <span className="text-xs">📋</span>
            <span className="truncate font-medium">Ops & SOP</span>
          </button>
          <button
            type="button"
            onClick={() => setDialog("templates")}
            className="col-span-2 flex items-center justify-center gap-1.5 rounded-md border border-border/70 bg-card/60 px-2 py-1.5 text-left text-muted-foreground hover:bg-accent hover:text-foreground transition"
            title="Students & Academics: Thesis Mindmaps, Scientific Protocols, Exam Plans"
          >
            <span className="text-xs">🎓</span>
            <span className="truncate font-medium">Student & Academic Research</span>
          </button>
        </div>
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
}
