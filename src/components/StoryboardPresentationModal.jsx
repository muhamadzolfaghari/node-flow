import React, { useState, useEffect, useMemo } from "react";
import {
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  X,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  Compass,
  CheckCircle2,
} from "lucide-react";
import { scanNodeDeclarations } from "../lib/visual-editing.js";

const STORYBOARD_CATEGORIES = [
  {
    keywords: ["client", "browser", "user", "gateway", "alb", "ingress", "cloudflare"],
    title: "Edge Ingress & Perimeter Routing",
    description: "Public client requests terminate at the edge API gateway or ALB with TLS 1.3 encryption and WAF rate limiting.",
    takeaway: "High availability edge with DDoS mitigation.",
  },
  {
    keywords: ["auth", "service", "api", "order", "payment"],
    title: "Core Domain Logic & Microservices",
    description: "Decoupled microservices execute domain logic, process business transactions, and validate identity.",
    takeaway: "Horizontal auto-scaling with isolated fault domains.",
  },
  {
    keywords: ["kafka", "sqs", "queue", "event", "pubsub"],
    title: "Asynchronous Event Streaming",
    description: "High-throughput event bus buffers peak bursts and broadcasts state changes asynchronously.",
    takeaway: "Guaranteed at-least-once delivery with partition durability.",
  },
  {
    keywords: ["db", "database", "postgres", "mysql", "redis", "s3", "mongo"],
    title: "Persistence & Low-Latency Cache Tier",
    description: "Multi-AZ relational database ensures ACID durability while in-memory cache accelerates sub-millisecond reads.",
    takeaway: "RPO = 0 with automated cross-AZ failover.",
  },
];

function generateStoryboardSteps(source = "") {
  const nodes = scanNodeDeclarations(source);
  const steps = [];

  for (const cat of STORYBOARD_CATEGORIES) {
    const matched = nodes.filter((n) => {
      const text = `${n.id} ${n.label || ""}`.toLowerCase();
      return cat.keywords.some((kw) => text.includes(kw));
    });
    if (matched.length > 0) {
      steps.push({
        title: cat.title,
        description: cat.description,
        takeaway: cat.takeaway,
        nodeIds: matched.map((n) => n.id),
      });
    }
  }

  if (steps.length === 0) {
    steps.push({
      title: "Architecture System Topology",
      description: "Complete overview of declared architectural services, dependencies, and communication channels.",
      takeaway: "Clean modular software architecture.",
      nodeIds: nodes.map((n) => n.id),
    });
  }

  return steps;
}

export default function StoryboardPresentationModal({
  isOpen,
  onClose,
  containerRef,
  source = "",
  projectName = "Architecture",
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = useMemo(() => {
    return generateStoryboardSteps(source);
  }, [source]);

  // Keyboard navigation: Left, Right, Space, Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setCurrentStep((prev) => (prev + 1) % steps.length);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, steps.length, onClose]);

  // Auto-play timer
  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isOpen, isPlaying, steps.length]);

  // Highlight step nodes on the underlying SVG
  useEffect(() => {
    if (!isOpen || !containerRef?.current) return;
    const svg = containerRef.current.querySelector("svg");
    if (!svg) return;

    const step = steps[currentStep];
    const targetSet = new Set(step?.nodeIds?.map((id) => id.toLowerCase()) || []);

    const allNodes = svg.querySelectorAll("g.node, g.entity, g.cluster, g.actor");
    allNodes.forEach((n) => {
      const match = targetSet.has(n.id.toLowerCase());
      if (match) {
        n.classList.remove("lens-dimmed");
        n.classList.add("lens-highlight-security");
      } else {
        n.classList.add("lens-dimmed");
        n.classList.remove("lens-highlight-security");
      }
    });

    return () => {
      allNodes.forEach((n) => {
        n.classList.remove("lens-dimmed", "lens-highlight-security");
      });
    };
  }, [isOpen, currentStep, steps, containerRef]);

  if (!isOpen) return null;

  const step = steps[currentStep] || steps[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Executive Architecture Walkthrough"
      className="fixed inset-0 z-50 flex flex-col justify-between p-6 bg-slate-950/90 backdrop-blur-md select-none animate-in fade-in duration-200 pointer-events-none"
    >
      {/* Top Header Controls (Pointer Events Enabled) */}
      <div className="flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2.5 rounded-full border border-border/80 bg-card/95 px-4 py-1.5 shadow-2xl backdrop-blur-xl">
          <Compass className="size-4 text-cyan-400 animate-spin" style={{ animationDuration: "12s" }} />
          <span className="text-xs font-bold text-foreground">
            {projectName} • Executive Walkthrough
          </span>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 rounded-full border border-border/80 bg-card/95 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent transition"
          >
            {isPlaying ? <Pause className="size-3.5 text-amber-400" /> : <Play className="size-3.5 text-emerald-400" />}
            <span>{isPlaying ? "Pause" : "Auto-Play"}</span>
          </button>

          <button
            onClick={onClose}
            className="rounded-full border border-border/80 bg-card/95 p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition"
            title="Exit Presentation (Esc)"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Bottom Presenter Narrative Card (Pointer Events Enabled) */}
      <div className="mx-auto max-w-2xl w-full pointer-events-auto">
        <div className="rounded-2xl border border-primary/40 bg-card/98 p-5 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-cyan-400 animate-ping" />
              <h3 className="text-base font-bold text-foreground">
                {step.title}
              </h3>
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length)}
                className="flex size-8 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-accent transition"
                title="Previous step (Left Arrow)"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={() => setCurrentStep((prev) => (prev + 1) % steps.length)}
                className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-xs"
                title="Next step (Right Arrow or Space)"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {step.description}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="size-3" />
              <span>SLA Target: {step.takeaway}</span>
            </span>

            {/* Progress Dots */}
            <div className="flex items-center gap-1">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentStep ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
