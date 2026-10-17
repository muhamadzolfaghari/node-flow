/**
 * AI Provider Health Check & Offline Fallback Diagnostics
 * Evaluates provider availability, hardware WebGPU support, local Ollama connectivity,
 * and maintains resilient graceful degradation to offline deterministic AST synthesis.
 */

import { fetchWithRetry } from "./networkRetry.ts";
import { describeToDiagram } from "./importers/describeToDiagram.ts";

const DEFAULT_OLLAMA_URL = "http://localhost:11434";
const HEALTH_TIMEOUT_MS = 2500;

/**
 * Checks deterministic AST offline generator readiness.
 * @returns {Promise<Object>}
 */
export async function checkInstantHealth() {
  const start = performance.now();
  try {
    const sample = describeToDiagram("user logs in", "flowchart");
    const latencyMs = Math.round(performance.now() - start);
    const ok = Boolean(sample && (typeof sample === "string" || sample.code));
    return {
      id: "instant",
      label: "Deterministic AST",
      status: ok ? "online" : "error",
      latencyMs,
      local: true,
      description: "100% offline, zero-latency deterministic generator",
    };
  } catch (err) {
    return {
      id: "instant",
      label: "Deterministic AST",
      status: "error",
      latencyMs: null,
      local: true,
      error: err.message,
    };
  }
}

/**
 * Checks in-browser WebGPU model capability.
 * @returns {Promise<Object>}
 */
export async function checkWebLlmHealth() {
  const start = performance.now();
  const hasGpu = typeof navigator !== "undefined" && Boolean(navigator.gpu);

  if (!hasGpu) {
    return {
      id: "webllm",
      label: "WebGPU Local Model",
      status: "unavailable",
      latencyMs: null,
      local: true,
      description: "WebGPU is not enabled or not supported in this browser",
    };
  }

  try {
    const adapter = await navigator.gpu.requestAdapter();
    const latencyMs = Math.round(performance.now() - start);
    return {
      id: "webllm",
      label: "WebGPU Local Model",
      status: adapter ? "online" : "unavailable",
      latencyMs,
      local: true,
      description: adapter
        ? "Hardware-accelerated on-device neural engine ready"
        : "No compatible GPU adapter discovered",
    };
  } catch (err) {
    return {
      id: "webllm",
      label: "WebGPU Local Model",
      status: "unavailable",
      latencyMs: null,
      local: true,
      error: err.message,
    };
  }
}

/**
 * Checks local Ollama server connectivity with timeout & retry.
 * @param {string} [baseUrl]
 * @returns {Promise<Object>}
 */
export async function checkOllamaHealth(baseUrl = DEFAULT_OLLAMA_URL) {
  const start = performance.now();
  const cleanUrl = baseUrl.replace(/\/+$/, "");

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

    const res = await fetchWithRetry(`${cleanUrl}/api/version`, {
      method: "GET",
      signal: controller.signal,
    }, { maxRetries: 1, initialDelayMs: 300 });

    clearTimeout(timer);
    const latencyMs = Math.round(performance.now() - start);

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        id: "ollama",
        label: "Local Ollama",
        status: "online",
        latencyMs,
        local: true,
        version: data.version || "unknown",
        description: `Ollama daemon active at ${cleanUrl}`,
      };
    }

    return {
      id: "ollama",
      label: "Local Ollama",
      status: "degraded",
      latencyMs,
      local: true,
      description: `Ollama responded with HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      id: "ollama",
      label: "Local Ollama",
      status: "offline",
      latencyMs: null,
      local: true,
      description: `Unreachable at ${cleanUrl}. Start Ollama or use offline engine.`,
      error: err.message,
    };
  }
}

/**
 * Checks Cloud API configuration (Gemini / OpenAI).
 * @param {string} id
 * @param {string} label
 * @param {string|undefined} keyOrUrl
 * @returns {Object}
 */
export function checkCloudProviderHealth(id, label, keyOrUrl) {
  const configured = Boolean(keyOrUrl && keyOrUrl.trim());
  return {
    id,
    label,
    status: configured ? "ready" : "unconfigured",
    latencyMs: null,
    local: false,
    description: configured
      ? `${label} configured with credentials`
      : `Enter API credentials to activate ${label}`,
  };
}

/**
 * Runs full AI system health diagnostic across all available engines.
 * @param {Object} [options]
 * @returns {Promise<Object>}
 */
export async function runAiHealthDiagnostics(options = {}) {
  const [instant, webllm, ollama] = await Promise.all([
    checkInstantHealth(),
    checkWebLlmHealth(),
    checkOllamaHealth(options.ollamaUrl),
  ]);

  const gemini = checkCloudProviderHealth("gemini", "Google Gemini", options.geminiApiKey);
  const custom = checkCloudProviderHealth("openaiCompatible", "OpenAI / Custom", options.apiUrl);

  const providers = [instant, webllm, ollama, gemini, custom];
  const activeProviders = providers.filter((p) => p.status === "online" || p.status === "ready");

  const overall = activeProviders.length > 0 ? "healthy" : "offline";

  return {
    overall,
    timestamp: new Date().toISOString(),
    fallbackReady: instant.status === "online",
    onlineCount: activeProviders.length,
    providers,
  };
}
