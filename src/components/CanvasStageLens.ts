import { useEffect } from "react";
import type { RefObject } from "react";

export function applyLens(svg: SVGSVGElement | null, activeLens: string) {
  if (!svg) return;
  svg.querySelectorAll(".lens-dimmed, .lens-highlight-security, .lens-highlight-data, .lens-highlight-resilience").forEach((el) => {
    el.classList.remove("lens-dimmed", "lens-highlight-security", "lens-highlight-data", "lens-highlight-resilience");
  });
  if (activeLens === "standard") return;
  const allNodes = Array.from(svg.querySelectorAll("g.node, g.entity, g.cluster, g.actor")) as HTMLElement[];
  const allEdges = Array.from(svg.querySelectorAll("g.edgePath, path.flowchart-link")) as HTMLElement[];
  if (activeLens === "security") {
    const secKeywords = ["auth", "gateway", "firewall", "ingress", "vault", "token", "waf", "security", "perimeter", "iam"];
    for (const n of allNodes) {
      const text = `${n.id} ${n.textContent || ""}`.toLowerCase();
      const isMatch = secKeywords.some((k) => text.includes(k));
      if (isMatch) {
        n.classList.add("lens-highlight-security");
      } else {
        n.classList.add("lens-dimmed");
      }
    }
    for (const e of allEdges) {
      e.classList.add("lens-dimmed");
    }
  } else if (activeLens === "data") {
    const dataKeywords = ["db", "database", "postgres", "mysql", "redis", "s3", "bucket", "kafka", "queue", "mongo", "storage", "cache", "elastic"];
    for (const n of allNodes) {
      const text = `${n.id} ${n.textContent || ""}`.toLowerCase();
      const isMatch = dataKeywords.some((k) => text.includes(k));
      if (isMatch) {
        n.classList.add("lens-highlight-data");
      } else {
        n.classList.add("lens-dimmed");
      }
    }
    for (const e of allEdges) {
      e.classList.add("lens-dimmed");
    }
  } else if (activeLens === "resilience") {
    for (const n of allNodes) {
      const text = `${n.id} ${n.textContent || ""}`.toLowerCase();
      const isSpof = text.includes("gateway") || text.includes("auth") || text.includes("db") || text.includes("database") || text.includes("kafka");
      if (isSpof) {
        n.classList.add("lens-highlight-resilience");
      } else {
        n.classList.add("lens-dimmed");
      }
    }
  }
}

export function useLensEffect(containerRef: React.RefObject<HTMLElement | null>, activeLens: string, status: string, documentId: string) {
  useEffect(() => {
    const svg = containerRef.current?.querySelector("svg");
    applyLens(svg, activeLens);
  }, [activeLens, status, documentId, containerRef]);
}
