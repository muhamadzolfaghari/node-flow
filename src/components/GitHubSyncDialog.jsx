import React, { useState, useEffect } from "react";
import {
  X,
  GitBranch,
  UploadCloud,
  DownloadCloud,
  Check,
  AlertCircle,
  FileCode,
  FolderGit2,
  Lock,
} from "lucide-react";
import { Input, Button } from "./ui.jsx";

function GithubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export default function GitHubSyncDialog({
  isOpen,
  onClose,
  currentDocument,
  onImportDocument,
}) {
  const [token, setToken] = useState(() => localStorage.getItem("nodeflow_gh_token") || "");
  const [repo, setRepo] = useState(() => localStorage.getItem("nodeflow_gh_repo") || "");
  const [branch, setBranch] = useState("main");
  const [path, setPath] = useState(currentDocument?.name || "architecture.mmd");
  const [commitMessage, setCommitMessage] = useState(`Update ${currentDocument?.name || "diagram"} via NodeFlow`);
  const [status, setStatus] = useState({ type: null, text: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isOpen && currentDocument?.name) {
      setPath((prev) => (prev === currentDocument.name ? prev : currentDocument.name));
      setCommitMessage((prev) => {
        const next = `Update ${currentDocument.name} via NodeFlow`;
        return prev === next ? prev : next;
      });
    }
  }, [isOpen, currentDocument?.name]);

  if (!isOpen) return null;

  const saveSettings = () => {
    localStorage.setItem("nodeflow_gh_token", token);
    localStorage.setItem("nodeflow_gh_repo", repo);
  };

  const handlePull = async () => {
    if (!repo.trim() || !path.trim()) {
      setStatus({ type: "error", text: "Specify owner/repo and file path." });
      return;
    }
    setBusy(true);
    setStatus({ type: "info", text: "Fetching file from GitHub…" });
    saveSettings();

    try {
      const cleanRepo = repo.replace(/^https?:\/\/github\.com\//, "").replace(/\/+$/, "");
      const url = `https://api.github.com/repos/${cleanRepo}/contents/${path.replace(/^\/+/, "")}?ref=${branch}`;
      const headers = { Accept: "application/vnd.github.v3+json" };
      if (token.trim()) headers.Authorization = `token ${token.trim()}`;

      const res = await fetch(url, { headers });
      if (!res.ok) {
        throw new Error(`GitHub error (${res.status}): ${res.statusText}`);
      }
      const data = await res.json();
      const content = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ""))));

      onImportDocument?.({
        name: data.name || path.split("/").pop(),
        format: data.name?.endsWith(".dot") ? "dot" : "mermaid",
        source: content,
      });

      setStatus({ type: "success", text: `Successfully pulled ${data.name}!` });
      setTimeout(onClose, 1200);
    } catch (err) {
      setStatus({ type: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  };

async function pushFileToGitHub({ repo, path, branch, token, commitMessage, source }) {
  const cleanRepo = repo.replace(/^https?:\/\/github\.com\//, "").replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  const checkUrl = `https://api.github.com/repos/${cleanRepo}/contents/${cleanPath}?ref=${branch}`;
  const headers = {
    Accept: "application/vnd.github.v3+json",
    Authorization: `token ${token.trim()}`,
  };

  let sha = undefined;
  const checkRes = await fetch(checkUrl, { headers });
  if (checkRes.ok) {
    const fileData = await checkRes.json();
    sha = fileData.sha;
  }

  const putUrl = `https://api.github.com/repos/${cleanRepo}/contents/${cleanPath}`;
  const b64Content = btoa(unescape(encodeURIComponent(source)));

  const putRes = await fetch(putUrl, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message: commitMessage || `Update ${cleanPath}`,
      content: b64Content,
      branch,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!putRes.ok) {
    const errJson = await putRes.json().catch(() => ({}));
    throw new Error(errJson.message || `Commit failed with status ${putRes.status}`);
  }

  return await putRes.json();
}

  const handlePush = async () => {
    if (!token.trim()) {
      setStatus({ type: "error", text: "A GitHub Personal Access Token (repo scope) is required to commit." });
      return;
    }
    if (!repo.trim() || !path.trim() || !currentDocument?.source) {
      setStatus({ type: "error", text: "Specify owner/repo, file path, and ensure an active diagram is open." });
      return;
    }
    setBusy(true);
    setStatus({ type: "info", text: "Committing directly to GitHub…" });
    saveSettings();

    try {
      const result = await pushFileToGitHub({
        repo,
        path,
        branch,
        token,
        commitMessage,
        source: currentDocument.source,
      });
      setStatus({
        type: "success",
        text: `Committed successfully! Commit: ${result.commit?.sha?.slice(0, 7) || "Done"}`,
      });
      setTimeout(onClose, 1500);
    } catch (err) {
      setStatus({ type: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md animate-in fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border/80 bg-card text-card-foreground shadow-2xl ring-1 ring-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <GithubIcon className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">GitHub Repository Sync</h2>
              <p className="text-xs text-muted-foreground">Directly pull and commit diagrams to your repositories</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3.5">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase mb-1 block">
              Repository (owner/repo)
            </label>
            <Input
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="e.g. acme-corp/architecture-diagrams"
              className="h-8 text-xs font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase mb-1 block">
                Branch
              </label>
              <Input
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                className="h-8 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase mb-1 block">
                File Path
              </label>
              <Input
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="docs/architecture.mmd"
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase mb-1 block flex items-center justify-between">
              <span>Personal Access Token (PAT)</span>
              <span className="text-[10px] text-muted-foreground font-normal">Stored in local browser</span>
            </label>
            <Input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_... (needs repo scope to commit)"
              className="h-8 text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase mb-1 block">
              Commit Message
            </label>
            <Input
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Commit message"
              className="h-8 text-xs"
            />
          </div>

          {status.text && (
            <div
              className={`flex items-center gap-2 rounded-lg p-2.5 text-xs ${
                status.type === "error"
                  ? "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                  : status.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                  : "bg-primary/10 border border-primary/30 text-primary"
              }`}
            >
              {status.type === "error" ? (
                <AlertCircle className="size-3.5 shrink-0" />
              ) : status.type === "success" ? (
                <Check className="size-3.5 shrink-0" />
              ) : (
                <UploadCloud className="size-3.5 shrink-0 animate-pulse" />
              )}
              <span>{status.text}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-border/60">
            <button
              onClick={handlePull}
              disabled={busy}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-muted/40 py-2 text-xs font-semibold hover:bg-muted transition text-foreground"
            >
              <DownloadCloud className="size-3.5 text-primary" />
              <span>Pull from GitHub</span>
            </button>
            <button
              onClick={handlePush}
              disabled={busy}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition"
            >
              <UploadCloud className="size-3.5" />
              <span>Commit & Push</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
