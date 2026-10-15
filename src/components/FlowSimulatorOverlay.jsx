import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Activity,
  X,
  Zap,
} from "lucide-react";

export default function FlowSimulatorOverlay({
  active,
  onClose,
  containerRef,
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [activePackets, setActivePackets] = useState([]);
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
      paths.push(...allPaths.slice(0, 20));
    }

    const initialPackets = paths.map((pathEl, idx) => ({
      id: idx,
      pathEl,
      length: pathEl.getTotalLength ? pathEl.getTotalLength() : 100,
      progress: (idx * 0.25) % 1,
      color: idx % 2 === 0 ? "#38bdf8" : "#a855f7",
    }));

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
          let nextProg = pkt.progress + dt * 0.4 * speed;
          if (nextProg > 1) nextProg -= 1;
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

  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {/* Animated Glowing Photon Particles along paths */}
      <svg className="size-full overflow-visible">
        {activePackets.map((pkt) => {
          try {
            const pt = pkt.pathEl.getPointAtLength(pkt.progress * pkt.length);
            return (
              <g key={pkt.id} transform={`translate(${pt.x}, ${pt.y})`}>
                {/* Glow ring */}
                <circle
                  r="8"
                  fill={pkt.color}
                  opacity="0.3"
                  className="animate-ping"
                />
                {/* Core photon */}
                <circle
                  r="4"
                  fill="#ffffff"
                  stroke={pkt.color}
                  strokeWidth="2"
                  filter="drop-shadow(0 0 6px currentColor)"
                  style={{ color: pkt.color }}
                />
              </g>
            );
          } catch {
            return null;
          }
        })}
      </svg>

      {/* Simulator Control HUD Bar */}
      <div className="pointer-events-auto absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-cyan-500/50 bg-slate-950/90 px-4 py-1.5 shadow-2xl backdrop-blur-xl ring-1 ring-cyan-400/20 text-xs text-slate-200 animate-in fade-in slide-in-from-top-3">
        <div className="flex items-center gap-1.5 pr-2 border-r border-slate-800 text-cyan-400 font-semibold tracking-wider uppercase text-[10px]">
          <Activity className="size-3.5 animate-pulse text-cyan-400" />
          <span>Flow Simulator</span>
        </div>

        {/* Play/Pause */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="rounded-full p-1 text-slate-300 hover:bg-slate-800 hover:text-white transition"
          title={isPlaying ? "Pause simulation" : "Play simulation"}
        >
          {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5 text-cyan-400" />}
        </button>

        {/* Speed toggle (0.5x, 1x, 2x) */}
        <button
          onClick={() => setSpeed((prev) => (prev === 1 ? 2 : prev === 2 ? 0.5 : 1))}
          className="rounded-md px-2 py-0.5 text-[10px] font-mono font-medium border border-slate-700 bg-slate-900 text-cyan-300 hover:bg-slate-800 transition"
          title="Toggle playback speed"
        >
          {speed}×
        </button>

        {/* Reset */}
        <button
          onClick={() =>
            setActivePackets((prev) => prev.map((p, i) => ({ ...p, progress: (i * 0.25) % 1 })))
          }
          className="rounded-full p-1 text-slate-300 hover:bg-slate-800 hover:text-white transition"
          title="Reset flow to beginning"
        >
          <RotateCcw className="size-3.5" />
        </button>

        {/* Close Simulator */}
        <button
          onClick={onClose}
          className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition ml-1"
          title="Exit Flow Simulator"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
