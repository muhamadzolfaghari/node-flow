/**
 * AI Token Optimizer for Mermaid Studio.
 * Compresses diagram context, strips redundant comments and whitespace,
 * and estimates LLM token usage to drastically cut prompt overhead.
 */

const CHARS_PER_TOKEN_APPROX = 3.8;
const MAX_CONTEXT_LENGTH = 4000;

/**
 * Heuristic token estimator for source code, prompts, and Mermaid diagrams.
 * Accounts for punctuation symbols, whitespace breaks, and identifier boundaries.
 * @param {string} text - The input text to measure.
 * @returns {number} Estimated token count.
 */
export function estimateTokens(text = "") {
  if (!text || typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;

  // Split on boundaries: whitespace, punctuation, and markdown/mermaid tokens
  const tokens = trimmed.match(/[\w]+|[^\w\s]|\s+/g) || [];
  let tokenCount = 0;

  for (const t of tokens) {
    if (/^\s+$/.test(t)) {
      // Multiple spaces/newlines count as 1 token
      tokenCount += 1;
    } else if (t.length > 4) {
      // Long identifiers/words get broken into subwords
      tokenCount += Math.ceil(t.length / CHARS_PER_TOKEN_APPROX);
    } else {
      tokenCount += 1;
    }
  }

  return Math.max(1, tokenCount);
}

/**
 * Strips comments, removes unnecessary whitespace, and optionally removes
 * purely cosmetic styling directives from Mermaid diagram source code.
 * @param {string} source - Mermaid source text.
 * @param {Object} [options]
 * @param {boolean} [options.stripStyles=false] - Whether to strip style and classDef lines.
 * @param {boolean} [options.keepComments=false] - Whether to preserve comments.
 * @returns {string} Compressed Mermaid code.
 */
export function compressMermaidSource(source = "", options = {}) {
  if (!source || typeof source !== "string") return "";

  const lines = source.split("\n");
  const compressedLines = [];

  for (const rawLine of lines) {
    let line = rawLine.trim();

    // Skip empty lines
    if (!line) continue;

    // Filter comments
    if (!options.keepComments && line.startsWith("%%")) {
      continue;
    }

    // Optionally strip cosmetic styling to save tokens when only structure matters
    if (options.stripStyles) {
      if (
        line.startsWith("style ") ||
        line.startsWith("classDef ") ||
        line.startsWith("linkStyle ") ||
        line.startsWith("accTitle:") ||
        line.startsWith("accDescr:")
      ) {
        continue;
      }
    }

    // Collapse multiple consecutive spaces inside line
    line = line.replace(/[ \t]{2,}/g, " ");

    const isIndented = /^\s{2,}/.test(rawLine);
    compressedLines.push(isIndented ? `  ${line}` : line);
  }

  return compressedLines.join("\n");
}

/**
 * Optimizes a user prompt and its context diagram to minimize LLM token usage.
 * @param {string} prompt - The user's input request.
 * @param {Object} [options]
 * @param {string} [options.contextSource] - Active diagram source code.
 * @param {Object} [options.repair] - Previous error and previous answer for repair.
 * @param {boolean} [options.stripStyles=true] - Remove styles from context diagram.
 * @returns {{ optimizedPrompt: string, stats: { rawChars: number, compressedChars: number, originalTokens: number, optimizedTokens: number, savedTokens: number, reductionPercent: number } }}
 */
export function optimizeAiPrompt(prompt, options = {}) {
  const parts = [prompt.trim()];
  let rawContextChars = 0;
  let compressedContextChars = 0;

  if (options.contextSource?.trim()) {
    const raw = options.contextSource.trim();
    rawContextChars = raw.length;

    const compressed = compressMermaidSource(raw, {
      stripStyles: options.stripStyles !== false,
      keepComments: false,
    }).slice(0, MAX_CONTEXT_LENGTH);

    compressedContextChars = compressed.length;
    parts.push(`Existing diagram in the active file (extend or stay consistent with it):\n${compressed}`);
  }

  if (options.repair?.error) {
    const prevClean = compressMermaidSource(options.repair.previous || "", {
      stripStyles: false,
      keepComments: false,
    });
    parts.push(`Your previous answer failed Mermaid validation with: ${options.repair.error}\nPrevious answer:\n${prevClean}\nReturn a corrected, complete diagram.`);
  }

  const optimizedPrompt = parts.join("\n\n");

  // Compute token statistics
  const uncompressedFullText = [
    prompt,
    options.contextSource ? `Existing diagram in the active file:\n${options.contextSource}` : "",
    options.repair?.error ? `Error: ${options.repair.error}\n${options.repair.previous}` : "",
  ].filter(Boolean).join("\n\n");

  const originalTokens = estimateTokens(uncompressedFullText);
  const optimizedTokens = estimateTokens(optimizedPrompt);
  const savedTokens = Math.max(0, originalTokens - optimizedTokens);
  const reductionPercent = originalTokens > 0
    ? Math.round((savedTokens / originalTokens) * 100)
    : 0;

  return {
    optimizedPrompt,
    stats: {
      rawChars: rawContextChars,
      compressedChars: compressedContextChars,
      originalTokens,
      optimizedTokens,
      savedTokens,
      reductionPercent,
    },
  };
}
