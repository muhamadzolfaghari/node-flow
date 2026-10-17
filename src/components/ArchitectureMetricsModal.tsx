import React, { useMemo } from "react";
import {
  X,
  Activity,
  Layers,
  GitBranch,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Network,
  Share2,
  FileCode,
} from "lucide-react";

export default function ArchitectureMetricsModal({
  isOpen,
  onClose,
  source = "",
  format = "mermaid",
}) {
  const metrics = useMemo(() => {
    if (!source) {
      return {
        nodes: 0,
        edges: 0,
        density: 0,
        circular: 0,
        maxDepth: 0,
        isolated: 0,
        boundaries: 0,
        healthScore: 100,
        grade: "A+",
        recommendations: ["Empty diagram. Add nodes to begin architecture analysis."],
      };
    }

    // Extract nodes and edges
    const lines = source.split("\n");
    const nodeSet = new Set();
    const edgeList = [];
    const outgoing = new Map();
    const incoming = new Map();
    let subgraphs = 0;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("%%") || line.startsWith("//") || line.startsWith("#")) continue;

      if (/^(subgraph|box|rect)\b/i.test(line)) {
        subgraphs++;
      }

      // Match arrow patterns (A --> B, A -.-> B, A ==> B, A -> B)
      const edgeMatch = line.match(/([A-Za-z0-9_-]+)\s*(?:\[[^\]]*\]|\([^\)]*\)|\{[^\}]*\})?\s*(?:-->|-.->|==>|->|-->>|--o|--x)\s*(?:\|[^|]*\|)?\s*([A-Za-z0-9_-]+)/);
      if (edgeMatch) {
        const from = edgeMatch[1];
        const to = edgeMatch[2];
        if (from && to && from !== "subgraph" && to !== "end") {
          nodeSet.add(from);
          nodeSet.add(to);
          edgeList.push({ from, to });

          if (!outgoing.has(from)) outgoing.set(from, new Set());
          outgoing.get(from).add(to);

          if (!incoming.has(to)) incoming.set(to, new Set());
          incoming.get(to).add(from);
        }
      } else {
        // Individual node declarations
        const nodeMatch = line.match(/^([A-Za-z0-9_-]+)(?:\[|\(|\{|\>)/);
        if (nodeMatch && !/^(subgraph|end|style|classDef|click|linkStyle)\b/i.test(nodeMatch[1])) {
          nodeSet.add(nodeMatch[1]);
        }
      }
    }

    const n = Math.max(1, nodeSet.size);
    const e = edgeList.length;

    // Density: E / (V * (V - 1))
    const possibleEdges = n > 1 ? n * (n - 1) : 1;
    const density = Math.min(1, e / possibleEdges);

    // Detect Circular Dependencies (Tarjan's / DFS cycle search)
    let circularCycles = 0;
    const visited = new Set();
    const recStack = new Set();

    function checkCycle(node) {
      visited.add(node);
      recStack.add(node);

      const neighbors = outgoing.get(node) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (checkCycle(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          circularCycles++;
          return true;
        }
      }
      recStack.delete(node);
      return false;
    }

    for (const node of nodeSet) {
      if (!visited.has(node)) {
        checkCycle(node);
      }
    }

    // Longest Path (Critical Dependency Chain)
    const depths = new Map();
    function getDepth(node, seen = new Set()) {
      if (seen.has(node)) return 0;
      if (depths.has(node)) return depths.get(node);

      seen.add(node);
      const neighbors = outgoing.get(node) || new Set();
      let maxChild = 0;
      for (const neighbor of neighbors) {
        maxChild = Math.max(maxChild, 1 + getDepth(neighbor, new Set(seen)));
      }
      depths.set(node, maxChild);
      return maxChild;
    }

    let maxDepth = 0;
    for (const node of nodeSet) {
      maxDepth = Math.max(maxDepth, getDepth(node));
    }

    // Isolated / Orphan nodes
    let isolated = 0;
    for (const node of nodeSet) {
      const outDeg = (outgoing.get(node) || new Set()).size;
      const inDeg = (incoming.get(node) || new Set()).size;
      if (outDeg === 0 && inDeg === 0) isolated++;
    }

    // Calculate Architectural Health Score (0 - 100)
    let penalty = 0;
    if (circularCycles > 0) penalty += Math.min(30, circularCycles * 15);
    if (density > 0.4) penalty += 15;
    if (maxDepth > 7) penalty += 15;
    if (isolated > 2) penalty += 10;

    const healthScore = Math.max(20, Math.min(100, 100 - penalty));
    let grade = "A+";
    if (healthScore < 60) grade = "C";
    else if (healthScore < 75) grade = "B";
    else if (healthScore < 90) grade = "A";

    const recommendations = [];
    if (circularCycles > 0) {
      recommendations.push(
        `Found ${circularCycles} circular dependency cycle(s). Decouple with event-driven messaging (Kafka/PubSub) or API contracts.`
      );
    }
    if (maxDepth > 6) {
      recommendations.push(
        `Critical path depth is ${maxDepth} hops. High call latency risk; consider aggregating through an API gateway or caching layers.`
      );
    }
    if (density > 0.35) {
      recommendations.push(
        "High coupling density detected. Consider modularizing tightly coupled components into isolated subgraphs."
      );
    }
    if (subgraphs === 0 && n > 6) {
      recommendations.push(
        "No security or domain boundaries defined. Wrap related services in `subgraph` to clarify VPC or cluster boundaries."
      );
    }
    if (recommendations.length === 0) {
      recommendations.push("Excellent decoupled topology! Clean dependency hierarchy with zero circular references.");
    }

    return {
      nodes: nodeSet.size,
      edges: e,
      density: Math.round(density * 100),
      circular: circularCycles,
      maxDepth,
      isolated,
      boundaries: subgraphs,
      healthScore,
      grade,
      recommendations,
    };
  }, [source]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex h-[540px] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950/95 text-slate-100 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <Activity className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <span>Architecture Health & Complexity Analysis</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-300 font-bold">
                  Score: {metrics.healthScore}/100 ({metrics.grade})
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Graph metrics, cyclomatic depth, coupling density & anti-pattern detection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Top Score Cards Grid */}
          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Nodes / Services</span>
              <span className="text-xl font-bold text-sky-400 mt-1 block">{metrics.nodes}</span>
              <span className="text-[10px] text-slate-500">Declared components</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Dependencies</span>
              <span className="text-xl font-bold text-indigo-400 mt-1 block">{metrics.edges}</span>
              <span className="text-[10px] text-slate-500">Directed links</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Max Call Depth</span>
              <span className="text-xl font-bold text-amber-400 mt-1 block">{metrics.maxDepth}</span>
              <span className="text-[10px] text-slate-500">Critical latency hops</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Circular Cycles</span>
              <span className={`text-xl font-bold mt-1 block ${metrics.circular > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                {metrics.circular}
              </span>
              <span className="text-[10px] text-slate-500">{metrics.circular > 0 ? "Deadlock hazard" : "Zero deadlocks"}</span>
            </div>
          </div>

          {/* Secondary Structural Breakdown */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-200">Coupling Density</p>
                <p className="text-[10px] text-slate-400">Graph interconnectedness</p>
              </div>
              <span className="text-sm font-mono font-bold text-cyan-300">{metrics.density}%</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-200">Domain Boundaries</p>
                <p className="text-[10px] text-slate-400">Subgraphs / VPCs</p>
              </div>
              <span className="text-sm font-mono font-bold text-purple-300">{metrics.boundaries}</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-200">Isolated Components</p>
                <p className="text-[10px] text-slate-400">Disconnected nodes</p>
              </div>
              <span className="text-sm font-mono font-bold text-amber-300">{metrics.isolated}</span>
            </div>
          </div>

          {/* Architecture Insights & Recommendations */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2.5">
            <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Zap className="size-3.5 text-amber-400" />
              <span>Architectural Insights & Recommendations</span>
            </h3>
            <div className="space-y-2">
              {metrics.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                  {metrics.circular > 0 && idx === 0 ? (
                    <AlertTriangle className="size-4 text-rose-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 px-5 py-3 bg-slate-900/60 text-xs">
          <span className="text-slate-400 text-[11px]">
            Format: <span className="font-mono text-slate-200 uppercase">{format}</span> · Real-time client-side graph analysis
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-primary/20 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/30 transition"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
