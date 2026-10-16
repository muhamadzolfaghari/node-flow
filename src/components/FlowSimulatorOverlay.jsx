import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Activity,
  X,
  Gauge,
} from "lucide-react";

const PROTOCOLS = [
  { name: "gRPC", color: "#38bdf8", baseLatency: 12 },
  { name: "HTTPS", color: "#a855f7", baseLatency: 35 },
  { name: "Kafka", color: "#10b981", baseLatency: 4 },
  { name: "WebSocket", color: "#f59e0b", baseLatency: 18 },
  { name: "Redis", color: "#f43f5e", baseLatency: 2 },
];

function PacketParticle({ pkt, showLatencyBadges }) {
  try {
    const pt = pkt.pathEl.getPointAtLength(pkt.progress * pkt.length);
    return (
      <g transform={`translate(${pt.x}, ${pt.y})`}>
        <circle r="9" fill={pkt.color} opacity="0.35" className="animate-ping" />
        <circle
          r="4.5"
          fill="#ffffff"
          stroke={pkt.color}
          strokeWidth="2.5"
          filter="drop-shadow(0 0 8px currentColor)"
          style={{ color: pkt.color }}
        />
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
}

function SimulatorHud({
  isPlaying,
  onTogglePlay,
  onStepForward,
  speed,
  onCycleSpeed,
  showLatencyBadges,
  onToggleLatencyBadges,
  onReset,
  onClose,
  avgLatency,
  packetCount,
}) {
  return (
    <div className="pointer-events-auto absolute top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-2xl border border-cyan-500/40 bg-slate-950/95 px-3.5 py-1.5 shadow-2xl backdrop-blur-2xl ring-1 ring-cyan-400/20 text-xs text-slate-200 animate-in fade-in slide-in-from-top-3">
      <div className="flex items-center gap-1.5 pr-2.5 border-r border-slate-800 text-cyan-400 font-semibold tracking-wider uppercase text-[10px]">
        <Activity className="size-3.5 animate-pulse text-cyan-400" />
        <span>Flow Simulator</span>
      </div>

      <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] font-mono text-slate-300">
        <Gauge className="size-3 text-emerald-400" />
        <span>
          Avg: <strong className="text-emerald-300">{avgLatency}ms</strong>
        </span>
        <span className="text-slate-600">·</span>
        <span>
          In Flight: <strong className="text-cyan-300">{packetCount}</strong>
        </span>
      </div>

      <button
        onClick={onTogglePlay}
        className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white transition"
        title={isPlaying ? "Pause simulation" : "Play simulation"}
      >
        {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5 text-cyan-400" />}
      </button>

      <button
        onClick={onStepForward}
        className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white transition"
        title="Step 1 packet hop forward"
      >
        <StepForward className="size-3.5" />
      </button>

      <button
        onClick={onCycleSpeed}
        className="rounded-md px-2 py-0.5 text-[10px] font-mono font-medium border border-slate-700 bg-slate-900 text-cyan-300 hover:bg-slate-800 transition"
        title="Cycle playback speed"
      >
        {speed}×
      </button>

      <button
        onClick={onToggleLatencyBadges}
        className={`rounded-md px-2 py-0.5 text-[10px] font-medium border transition ${
          showLatencyBadges
            ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-300"
            : "border-slate-800 bg-slate-900 text-slate-500"
        }`}
        title="Toggle packet latency tags"
      >
        Latency Tags
      </button>

      <button
        onClick={onReset}
        className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white transition"
        title="Reset flow to beginning"
      >
        <RotateCcw className="size-3.5" />
      </button>

      <button
        onClick={onClose}
        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition ml-1"
        title="Exit Flow Simulator"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

export default function FlowSimulatorOverlay({
  active,
  onClose,
  containerRef,
  position = { x: 0, y: 0, z: 1 },
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [activePackets, setActivePackets] = useState([]);
  const [selectedProtocol] = useState("All");
  const [showLatencyBadges, setShowLatencyBadges] = useState(true);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (!active || !containerRef?.current) {
      setActivePackets([]);
      return;
    }

    const paths = Array.from(
      containerRef.current.querySelectorAll(
        "svg path.edge-thickness-normal, svg path.flowchart-link, svg path.edgePath, svg path[id*='edge'], svg g.edgePaths path"
      )
    ).filter((p) => {
      try {
        return p.getTotalLength() > 20;
      } catch {
        return false;
      }
    });

    if (paths.length === 0) return;

    const packets = [];
    paths.forEach((p, idx) => {
      const len = p.getTotalLength();
      const proto = PROTOCOLS[idx % PROTOCOLS.length];
      packets.push({
        id: `pkt-${idx}-a`,
        pathEl: p,
        length: len,
        progress: (idx * 0.23) % 1,
        speed: (0.16 + (idx % 3) * 0.05),
        protocol: proto.name,
        color: proto.color,
        latency: proto.baseLatency + Math.floor((idx * 7) % 15),
      });
      if (len > 80) {
        packets.push({
          id: `pkt-${idx}-b`,
          pathEl: p,
          length: len,
          progress: ((idx * 0.23) + 0.5) % 1,
          speed: (0.16 + (idx % 3) * 0.05),
          protocol: proto.name,
          color: proto.color,
          latency: proto.baseLatency + Math.floor((idx * 9) % 20),
        });
      }
    });

    setActivePackets(packets);
  }, [active, containerRef]);

  useEffect(() => {
    if (!isPlaying || activePackets.length === 0) return;

    let lastTime = performance.now();
    const tick = (now) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      setActivePackets((prev) =>
        prev.map((pkt) => ({
          ...pkt,
          progress: (pkt.progress + (pkt.speed * speed * delta)) % 1,
        }))
      );
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, speed, activePackets.length]);

  if (!active) return null;

  const filteredPackets = activePackets.filter(
    (p) => selectedProtocol === "All" || p.protocol === selectedProtocol
  );

  const avgLatency = Math.round(
    filteredPackets.reduce((acc, p) => acc + p.latency, 0) / Math.max(1, filteredPackets.length)
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      <div
        className="absolute left-0 top-0 pointer-events-none"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0px) scale(${position.z})`,
          transformOrigin: "0 0",
        }}
      >
        <svg className="overflow-visible pointer-events-none" style={{ width: 1, height: 1 }}>
          {filteredPackets.map((pkt) => (
            <PacketParticle key={pkt.id} pkt={pkt} showLatencyBadges={showLatencyBadges} />
          ))}
        </svg>
      </div>

      <SimulatorHud
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onStepForward={() =>
          setActivePackets((prev) =>
            prev.map((p) => ({ ...p, progress: (p.progress + 0.08) % 1 }))
          )
        }
        speed={speed}
        onCycleSpeed={() =>
          setSpeed((prev) => (prev === 1 ? 2 : prev === 2 ? 3 : prev === 3 ? 0.5 : 1))
        }
        showLatencyBadges={showLatencyBadges}
        onToggleLatencyBadges={() => setShowLatencyBadges(!showLatencyBadges)}
        onReset={() =>
          setActivePackets((prev) => prev.map((p, i) => ({ ...p, progress: (i * 0.22) % 1 })))
        }
        onClose={onClose}
        avgLatency={avgLatency}
        packetCount={filteredPackets.length}
      />
    </div>
  );
}
