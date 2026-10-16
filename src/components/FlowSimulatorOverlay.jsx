import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Activity,
  X,
  Zap,
  Gauge,
  Radio,
  Sliders,
} from "lucide-react";

const PROTOCOLS = [
  { name: "gRPC", color: "#38bdf8", baseLatency: 12 },
  { name: "HTTPS", color: "#a855f7", baseLatency: 35 },
  { name: "Kafka", color: "#10b981", baseLatency: 4 },
  { name: "WebSocket", color: "#f59e0b", baseLatency: 18 },
  { name: "Redis", color: "#f43f5e", baseLatency: 2 },
];

export default function FlowSimulatorOverlay({
  active,
  onClose,
  containerRef,
  position = { x: 0, y: 0, z: 1 },
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [activePackets, setActivePackets] = useState([]);
  const [selectedProtocol, setSelectedProtocol] = useState("All");
  const [showLatencyBadges, setShowLatencyBadges] = useState(true);
  const animFrameRef = useRef(null);

  // Discover all connection paths in the current rendered SVG
  useEffect(() => {
    if (!active || !containerRef?.current) {
      setActivePackets([]);
      return;
    }

    const svg = containerRef.current.querySelector("svg");
    if (!svg) return;

    // Discover path elements representing links between nodes
    const paths = Array.from(
      svg.querySelectorAll("path.flowchart-link, path.transition, path.edge, .edgePath path, g.edgePaths path, path[marker-end]")
    );

    if (paths.length === 0) {
      // Fallback: any non-marker path longer than 40px
      const allPaths = Array.from(svg.querySelectorAll("path")).filter((p) => {
        try {
          return p.getTotalLength() > 40;
        } catch {
          return false;
        }
      });
      paths.push(...allPaths.slice(0, 25));
    }

    const initialPackets = paths.map((pathEl, idx) => {
      const proto = PROTOCOLS[idx % PROTOCOLS.length];
      const length = pathEl.getTotalLength ? pathEl.getTotalLength() : 100;
      return {
        id: idx,
        pathEl,
        length,
        progress: (idx * 0.22) % 1,
        color: proto.color,
        protocol: proto.name,
        latency: Math.round(proto.baseLatency * (0.8 + Math.random() * 0.5)),
      };
    });

    setActivePackets(initialPackets);
  }, [active, containerRef]);

  // Animation loop driving packet positions along paths
  useEffect(() => {
    if (!active || !isPlaying || activePackets.length === 0) return;

    let lastTime = performance.now();

    const loop = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      setActivePackets((prev) =>
        prev.map((pkt) => {
          let nextProg = pkt.progress + dt * 0.35 * speed;
          if (nextProg > 1) {
            nextProg -= 1;
            // Recalculate transient latency on hop completion
            return {
              ...pkt,
              progress: nextProg,
              latency: Math.max(1, Math.round(pkt.latency * (0.9 + Math.random() * 0.25))),
            };
          }
          return { ...pkt, progress: nextProg };
        })
      );

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [active, isPlaying, speed, activePackets.length]);

  // Single-step forward
  const stepForward = () => {
    setIsPlaying(false);
    setActivePackets((prev) =>
      prev.map((pkt) => {
        let nextProg = pkt.progress + 0.08;
        if (nextProg > 1) nextProg -= 1;
        return { ...pkt, progress: nextProg };
      })
    );
  };

  if (!active) return null;

  const filteredPackets = activePackets.filter(
    (p) => selectedProtocol === "All" || p.protocol === selectedProtocol
  );

  const avgLatency = Math.round(
    filteredPackets.reduce((acc, p) => acc + p.latency, 0) / Math.max(1, filteredPackets.length)
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {/* Animated Glowing Photon Particles matching the Canvas Pan & Zoom Camera Transform */}
      <div
        className="absolute left-0 top-0 pointer-events-none"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0px) scale(${position.z})`,
          transformOrigin: "0 0",
        }}
      >
        <svg className="overflow-visible pointer-events-none" style={{ width: 1, height: 1 }}>
          {filteredPackets.map((pkt) => {
            try {
              const pt = pkt.pathEl.getPointAtLength(pkt.progress * pkt.length);
              return (
                <g key={pkt.id} transform={`translate(${pt.x}, ${pt.y})`}>
                  {/* Glow pulse ring */}
                  <circle
                    r="9"
                    fill={pkt.color}
                    opacity="0.35"
                    className="animate-ping"
                  />
                  {/* Core photon */}
                  <circle
                    r="4.5"
                    fill="#ffffff"
                    stroke={pkt.color}
                    strokeWidth="2.5"
                    filter="drop-shadow(0 0 8px currentColor)"
                    style={{ color: pkt.color }}
                  />
                  {/* Microservice Latency & Protocol Badge */}
                  {showLatencyBadges && (
                    <g transform="translate(8, -12)">
                      <rect
                        x="0"
                        y="0"
                        width="46"
                        height="14"
                        rx="3"
                        fill="#090d16"
                        fillOpacity="0.85"
                        stroke={pkt.color}
                        strokeWidth="0.8"
                      />
                      <text
                        x="23"
                        y="10"
                        textAnchor="middle"
                        fill={pkt.color}
                        fontSize="8"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {pkt.latency}ms
                      </text>
                    </g>
                  )}
                </g>
              );
            } catch {
              return null;
            }
          })}
        </svg>
      </div>

      {/* Simulator Control HUD Bar */}
      <div className="pointer-events-auto absolute top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-2xl border border-cyan-500/40 bg-slate-950/95 px-3.5 py-1.5 shadow-2xl backdrop-blur-2xl ring-1 ring-cyan-400/20 text-xs text-slate-200 animate-in fade-in slide-in-from-top-3">
        <div className="flex items-center gap-1.5 pr-2.5 border-r border-slate-800 text-cyan-400 font-semibold tracking-wider uppercase text-[10px]">
          <Activity className="size-3.5 animate-pulse text-cyan-400" />
          <span>Flow Simulator</span>
        </div>

        {/* Live Latency Stats Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] font-mono text-slate-300">
          <Gauge className="size-3 text-emerald-400" />
          <span>Avg: <strong className="text-emerald-300">{avgLatency}ms</strong></span>
          <span className="text-slate-600">·</span>
          <span>In Flight: <strong className="text-cyan-300">{filteredPackets.length}</strong></span>
        </div>

        {/* Play / Pause */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white transition"
          title={isPlaying ? "Pause simulation" : "Play simulation"}
        >
          {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5 text-cyan-400" />}
        </button>

        {/* Step Forward */}
        <button
          onClick={stepForward}
          className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white transition"
          title="Step 1 packet hop forward"
        >
          <StepForward className="size-3.5" />
        </button>

        {/* Speed toggle (0.5x, 1x, 2x, 3x) */}
        <button
          onClick={() => setSpeed((prev) => (prev === 1 ? 2 : prev === 2 ? 3 : prev === 3 ? 0.5 : 1))}
          className="rounded-md px-2 py-0.5 text-[10px] font-mono font-medium border border-slate-700 bg-slate-900 text-cyan-300 hover:bg-slate-800 transition"
          title="Cycle playback speed"
        >
          {speed}×
        </button>

        {/* Latency Badges Toggle */}
        <button
          onClick={() => setShowLatencyBadges(!showLatencyBadges)}
          className={`rounded-md px-2 py-0.5 text-[10px] font-medium border transition ${
            showLatencyBadges
              ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-300"
              : "border-slate-800 bg-slate-900 text-slate-500"
          }`}
          title="Toggle packet latency tags"
        >
          Latency Tags
        </button>

        {/* Reset */}
        <button
          onClick={() =>
            setActivePackets((prev) => prev.map((p, i) => ({ ...p, progress: (i * 0.22) % 1 })))
          }
          className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white transition"
          title="Reset flow to beginning"
        >
          <RotateCcw className="size-3.5" />
        </button>

        {/* Close Simulator */}
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition ml-1"
          title="Exit Flow Simulator"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
