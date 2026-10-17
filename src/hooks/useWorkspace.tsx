import { createContext, use, useEffect, useRef, useState } from "react";
import { loadWorkspace, saveWorkspace } from "../lib/workspace.ts";
const WorkspaceContext = createContext(null);
export function WorkspaceProvider({ children }) {
  const [workspace, setWorkspace] = useState(loadWorkspace),
    [saveStatus, setSaveStatus] = useState("Saved locally");
  const latest = useRef(workspace);
  latest.current = workspace;
  useEffect(() => {
    const flush = () => {
      try {
        saveWorkspace(latest.current);
      } catch {}
    };
    window.addEventListener("pagehide", flush);
    return () => {
      flush();
      window.removeEventListener("pagehide", flush);
    };
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        saveWorkspace(workspace);
        setSaveStatus((prev) => (prev === "Saved locally" ? prev : "Saved locally"));
      } catch {
        setSaveStatus((prev) => (prev === "Storage full · download a project backup" ? prev : "Storage full · download a project backup"));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [workspace]);
  const activeProjId = workspace.projects.some((p) => p.id === workspace.activeProjectId)
    ? workspace.activeProjectId
    : workspace.projects[0]?.id;
  const project =
    workspace.projects.find((p) => p.id === activeProjId) ||
    workspace.projects[0];
  const updateProject = (update) => {
    setSaveStatus((prev) => (prev === "Saving…" ? prev : "Saving…"));
    setWorkspace((w) => {
      const targetId = w.projects.some((p) => p.id === w.activeProjectId)
        ? w.activeProjectId
        : (project?.id || w.projects[0]?.id);
      return {
        ...w,
        activeProjectId: targetId,
        projects: w.projects.map((p) =>
          p.id === targetId
            ? {
                ...(typeof update === "function"
                  ? update(p)
                  : { ...p, ...update }),
                updatedAt: new Date().toISOString(),
              }
            : p,
        ),
      };
    });
  };
  const addProject = (newProject) =>
    setWorkspace((w) => ({
      ...w,
      activeProjectId: newProject.id,
      projects: [newProject, ...w.projects],
    }));
  return (
    <WorkspaceContext
      value={{
        workspace,
        project,
        saveStatus,
        updateProject,
        addProject,
        setWorkspace,
      }}
    >
      {children}
    </WorkspaceContext>
  );
}
export function useWorkspace(projectId) {
  const context = use(WorkspaceContext);
  if (!context) throw new Error("WorkspaceProvider is required.");
  useEffect(() => {
    if (projectId)
      context.setWorkspace((w) =>
        w.projects.some((p) => p.id === projectId) &&
        w.activeProjectId !== projectId
          ? { ...w, activeProjectId: projectId }
          : w,
      );
  }, [projectId]);
  return context;
}
