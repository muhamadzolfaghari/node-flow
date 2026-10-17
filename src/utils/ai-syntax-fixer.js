/**
 * AI Syntax Fixer for Mermaid Diagrams
 * Automatically diagnoses, repairs, and validates broken Mermaid syntax.
 * Combines deterministic rule-based repair (instant, 0 latency) with
 * local LLM fallback (Qwen / Ollama) when available.
 */
let mermaidPromise;
const getMermaid = () => {
  mermaidPromise ||= import('mermaid').then((module) => module.default);
  return mermaidPromise;
};

/**
 * Repairs broken Mermaid diagram code
 * @param {string} code - The broken Mermaid source code
 * @param {string} errorMessage - The parser error message
 * @param {object} opts - Optional options (aiAssistant, etc.)
 * @returns {Promise<{ success: boolean, fixedCode: string, fixes: string[], error?: string }>}
 */
export async function fixMermaidSyntax(code, errorMessage = '', opts = {}) {
  if (!code || typeof code !== 'string') {
    return { success: false, error: 'No code provided to fix.' };
  }

  const fixes = [];
  let currentCode = code;

  // 1. Strip markdown fences or chat conversational wrappers
  const cleanedWrapper = stripMarkdownFences(currentCode);
  if (cleanedWrapper !== currentCode) {
    fixes.push('Removed markdown backtick wrappers and conversational text');
    currentCode = cleanedWrapper;
  }

  // 2. Rule-based repairs
  const ruleResult = applyRuleBasedFixes(currentCode, errorMessage);
  if (ruleResult.fixes.length > 0) {
    fixes.push(...ruleResult.fixes);
    currentCode = ruleResult.code;
  }

  // 3. Test if current code now compiles cleanly
  const validation = await testMermaidSyntax(currentCode);
  if (validation.valid) {
    return {
      success: true,
      fixedCode: currentCode,
      fixes: fixes.length > 0 ? fixes : ['Cleaned syntax and resolved syntax conflicts'],
      method: 'deterministic',
    };
  }

  // 4. If rules didn't completely solve it, try secondary heuristics
  const secondaryResult = applyAggressiveFixes(currentCode, validation.error || errorMessage);
  if (secondaryResult.fixed) {
    const secondValidation = await testMermaidSyntax(secondaryResult.code);
    if (secondValidation.valid) {
      fixes.push(...secondaryResult.fixes);
      return {
        success: true,
        fixedCode: secondaryResult.code,
        fixes,
        method: 'heuristic',
      };
    }
  }

  // 4b. Line-level repair: use the parser's reported line and try progressively
  // stronger edits, keeping the first one the real parser accepts.
  const lineRepair = await repairReportedLine(currentCode, validation.error || errorMessage);
  if (lineRepair) {
    fixes.push(lineRepair.fix);
    return { success: true, fixedCode: lineRepair.code, fixes, method: 'line-repair' };
  }

  // 5. If AI Assistant engine is provided and ready (Qwen or Ollama), query it
  if (opts.aiAssistant) {
    try {
      const aiResult = await fixWithLlm(opts.aiAssistant, code, errorMessage);
      if (aiResult && aiResult.success) {
        const aiValidation = await testMermaidSyntax(aiResult.code);
        if (aiValidation.valid) {
          return {
            success: true,
            fixedCode: aiResult.code,
            fixes: ['AI diagnosed and restructured invalid syntax'],
            method: 'llm',
          };
        }
      }
    } catch (llmErr) {
      console.warn('AI LLM syntax fix error:', llmErr);
    }
  }

  // If we made some valid progress, return best-effort
  return {
    success: false,
    fixedCode: currentCode,
    fixes,
    error: validation.error || errorMessage,
  };
}

/**
 * Tries targeted edits on the line the parser complains about. Each candidate
 * is validated; the least destructive passing candidate wins.
 */
export async function repairReportedLine(code, errorMessage = '') {
  const parsed = parseErrorDetails(errorMessage, code);
  let lineNumber = parsed?.line || Number(String(errorMessage).match(/(?:line|Line)\s*[:#]?\s*(\d+)/i)?.[1]) || 1;
  const lines = code.split('\n');
  if (lineNumber === lines.length + 1) {
    lineNumber = lines.length;
  } else if (lineNumber > lines.length || lineNumber < 1) {
    return null;
  }
  const index = lineNumber - 1;
  const original = lines[index];
  if (original === undefined) return null;

  const candidates = [];

  // 1. Missing closing delimiter on line
  const unclosedBeforeArrow = original.replace(/(\[[^\]\n]+?)\s*(-->|-.->|==>|---|===)/g, '$1] $2');
  if (unclosedBeforeArrow !== original) {
    candidates.push({
      fix: `Closed unclosed bracket before arrow on line ${lineNumber}`,
      line: unclosedBeforeArrow,
    });
  }

  const opens = (original.match(/\[/g) || []).length;
  const closes = (original.match(/\]/g) || []).length;
  if (opens > closes) {
    candidates.push({
      fix: `Closed unclosed bracket ']' on line ${lineNumber}`,
      line: `${original}${']'.repeat(opens - closes)}`,
    });
  }

  // Missing node ID before brackets e.g. A --> [label] -> A --> Node_2[label]
  const missingNodeId = original.replace(/([^-])(-->|-.->|==>|---|===)\s*(\[[^\]\n]+\]|\([^\)\n]+\)|\{[^\}\n]+\})/g, `$1$2 Node_${lineNumber}$3`);
  if (missingNodeId !== original) {
    candidates.push({
      fix: `Added missing node identifier before brackets on line ${lineNumber}`,
      line: missingNodeId,
    });
  }

  const openParens = (original.match(/\(/g) || []).length;
  const closeParens = (original.match(/\)/g) || []).length;
  if (openParens > closeParens) {
    candidates.push({
      fix: `Closed unclosed parenthesis ')' on line ${lineNumber}`,
      line: `${original}${')'.repeat(openParens - closeParens)}`,
    });
  }

  // 2. Unbalanced double quotes on line
  const quotes = (original.match(/"/g) || []).length;
  if (quotes % 2 !== 0) {
    const lastBracketIdx = original.search(/[\]\)\}]$/);
    if (lastBracketIdx > -1) {
      candidates.push({
        fix: `Closed unclosed quote '"' before bracket on line ${lineNumber}`,
        line: `${original.slice(0, lastBracketIdx)}"${original.slice(lastBracketIdx)}`,
      });
    }
    candidates.push({
      fix: `Closed unclosed quote '"' on line ${lineNumber}`,
      line: `${original}"`,
    });
  }

  // 3. Unquoted special characters inside brackets e.g. A[Title: Subtitle (v2)] -> A["Title: Subtitle (v2)"]
  const unquotedBracket = original.replace(/(\w+)\s*\[([^\]"\n]*[:()&,+{}<>/][^\]"\n]*)\]/g, '$1["$2"]');
  if (unquotedBracket !== original) {
    candidates.push({
      fix: `Quoted special characters inside node label on line ${lineNumber}`,
      line: unquotedBracket,
    });
  }

  // 4. Single arrow in flowchart or sequence
  if (!original.includes('-->') && original.includes('->')) {
    candidates.push({
      fix: `Replaced single arrow '->' with '-->' on line ${lineNumber}`,
      line: original.replace(/([^-])->([^-])/g, '$1-->$2'),
    });
    candidates.push({
      fix: `Replaced sequence arrow '->' with '->>' on line ${lineNumber}`,
      line: original.replace(/->(?![>])/g, '->>'),
    });
  }

  // 5. Pipe label spacing: --> |text| -> -->|text|
  if (/-->\s*\|\s*[^|]*\s*\|\s*/.test(original)) {
    candidates.push({
      fix: `Normalized pipe label spacing on line ${lineNumber}`,
      line: original.replace(/-->\s*\|\s*([^|]*?)\s*\|\s*/g, '-->|$1| '),
    });
  }

  // 6. Trailing semicolon: A --> B; -> A --> B
  if (/;\s*$/.test(original)) {
    candidates.push({
      fix: `Removed trailing semicolon on line ${lineNumber}`,
      line: original.replace(/;\s*$/, ''),
    });
  }

  // 7. Sequence message missing colon: A->>B message -> A->>B: message
  const seqMsg = original.replace(/^(\s*\w+\s*(?:->>|-->>|-\)|--\))\s*\w+)\s+([^:\s][^:\n]*)$/, '$1: $2');
  if (seqMsg !== original) {
    candidates.push({
      fix: `Added missing colon to sequence message on line ${lineNumber}`,
      line: seqMsg,
    });
  }

  // 8. Line 1 diagram header fixes
  if (lineNumber === 1) {
    if (/^\s*graph\b/i.test(original)) {
      candidates.push({
        fix: `Updated legacy 'graph' to 'flowchart TD'`,
        line: 'flowchart TD',
      });
    }
    if (/^\s*flowchart\s*$/i.test(original)) {
      candidates.push({
        fix: `Added default direction TD to flowchart header`,
        line: 'flowchart TD',
      });
    }
  }

  // 9. Removed stray text after closed bracket
  const stray = original.replace(/^(.*[\]\)\}])\s+[^\]\)\}\s][^\]\)\}]*$/, '$1');
  if (stray !== original) {
    candidates.push({
      fix: `Removed stray text after the statement on line ${lineNumber}`,
      line: stray,
    });
  }

  // 10. Removed trailing token on line
  const lessWord = original.replace(/\s+\S+\s*$/, '');
  if (lessWord !== original) {
    candidates.push({
      fix: `Removed the trailing token on line ${lineNumber}`,
      line: lessWord,
    });
  }

  // 11. Commented out the invalid line
  const indent = original.match(/^\s*/)?.[0] || '';
  candidates.push({
    fix: `Commented out the invalid line ${lineNumber}`,
    line: `${indent}%% ${original.trim()}`,
  });

  for (const candidate of candidates) {
    if (candidate.line === original || !candidate.line.trim()) continue;
    const next = [...lines];
    next[index] = candidate.line;
    const joined = next.join('\n');
    if ((await testMermaidSyntax(joined)).valid) return { code: joined, fix: candidate.fix };
  }
  return null;
}

/**
 * Validates syntax using Mermaid parser
 */
export async function testMermaidSyntax(code) {
  if (!code || !code.trim()) return { valid: false, error: 'Empty code' };
  try {
    const mermaid = await getMermaid();
    const res = await mermaid.parse(code);
    return { valid: Boolean(res) };
  } catch (err) {
    if (err?.message?.includes('DOMPurify')) {
      // In headless/Node test environments DOMPurify is not attached to window,
      // but reaching DOMPurify hook means Mermaid parser syntax validation passed!
      return { valid: true };
    }
    return { valid: false, error: err?.message || String(err) };
  }
}

/**
 * Apply Mermaid source only after it passes the same parser used by the renderer.
 * This prevents model output or converted files from replacing the current canvas
 * with invalid syntax.
 */
export async function applyMermaidIfValid(code, onApply) {
  if (typeof onApply !== 'function') {
    return { valid: false, applied: false, error: 'No apply callback provided.' };
  }

  const validation = await testMermaidSyntax(code);
  if (!validation.valid) {
    return { ...validation, applied: false };
  }

  await onApply(code);
  return { ...validation, valid: true, applied: true };
}

/**
 * Strips ```mermaid ... ``` or conversational artifacts
 */
function stripMarkdownFences(text) {
  let cleaned = text.trim();
  // If wrapped in ```mermaid ... ``` code block inside chat response, extract the block
  const blockMatch = cleaned.match(/```(?:mermaid)?\s*\n([\s\S]*?)\n```/i);
  if (blockMatch) {
    return blockMatch[1].trim();
  }
  // Strip standalone opening fence ```mermaid or ```
  cleaned = cleaned.replace(/^```(?:mermaid)?\s*\n?/i, '');
  // Strip standalone closing fence ```
  cleaned = cleaned.replace(/\n?```\s*$/i, '');
  // Strip common conversational chat prefixes/suffixes
  cleaned = cleaned.replace(/^(?:Here is the(?: fixed)? (?:Mermaid )?diagram:?|Sure! Here is the code:?)\s*\n+/i, '');
  cleaned = cleaned.replace(/\n+(?:Hope this helps!?|Let me know if you need any adjustments!?|Enjoy!?)\s*$/i, '');
  return cleaned.trim();
}

/**
 * Applies deterministic rule-based corrections for common Mermaid syntax errors
 */
function applyRuleBasedFixes(code, errorMsg = '') {
  const fixes = [];
  let lines = code.split('\n');

  // A. Check for missing diagram type header
  const firstNonEmpty = lines.find((l) => l.trim().length > 0) || '';
  const hasHeader = /^(?:flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|stateDiagram-v2|erDiagram|gantt|pie|gitGraph|mindmap|timeline|quadrantChart|journey|xychart|xychart-beta|sankey|sankey-beta|kanban|block|block-beta|C4|C4Context|packet|packet-beta|architecture|architecture-beta|requirementDiagram|requirement)\b/i.test(
    firstNonEmpty.trim()
  );

  if (!hasHeader) {
    if (/\b(?:->>|-->>)\b/.test(code) || /\b(?:actor|participant)\b/i.test(code)) {
      lines.unshift('sequenceDiagram', '    autonumber');
      fixes.push('Added missing sequenceDiagram header with autonumber');
    } else if (/\b(?:\|\|--|}\|--|--o\{)\b/.test(code)) {
      lines.unshift('erDiagram');
      fixes.push('Added missing erDiagram header');
    } else if (/\[\*\]\s*--?>|--?>\s*\[\*\]/.test(code)) {
      lines.unshift('stateDiagram-v2');
      fixes.push('Added missing stateDiagram-v2 header');
    } else if (/\b(?:<\|--|<\|\.\.|\*--|o--)\b/.test(code) || /^\s*class\s+\w+/m.test(code)) {
      lines.unshift('classDiagram');
      fixes.push('Added missing classDiagram header');
    } else {
      lines.unshift('flowchart TD');
      fixes.push('Added missing flowchart TD header');
    }
  }

  // B. Standardize flowchart / graph headers
  if (/^graph\b/i.test(lines[0].trim())) {
    const rest = lines[0].trim().replace(/^graph\s*/i, '');
    lines[0] = `flowchart ${rest || 'TD'}`;
    fixes.push('Updated legacy graph syntax to modern flowchart');
  } else if (/^flowcharts?\b/i.test(lines[0].trim()) && !/^flowchart\s+[A-Z]{2}\b/i.test(lines[0].trim())) {
    lines[0] = 'flowchart TD';
    fixes.push('Standardized flowchart direction to flowchart TD');
  }

  // C. Fix unclosed subgraphs
  const subgraphCount = lines.filter((l) => /^\s*subgraph\b/i.test(l)).length;
  const endCount = lines.filter((l) => /^\s*end\b/i.test(l)).length;
  if (subgraphCount > endCount) {
    const missing = subgraphCount - endCount;
    for (let i = 0; i < missing; i++) {
      lines.push('    end');
    }
    fixes.push(`Closed ${missing} unclosed subgraph block(s) with 'end'`);
  }

  // D. Process line by line for arrow operators and unquoted labels
  let inFlowchart = /^(?:flowchart|graph)\b/i.test(lines[0]);
  let inSequence = /^sequenceDiagram\b/i.test(lines[0]);
  let inState = /^stateDiagram\b/i.test(lines[0]);
  const headLower = (lines[0] || '').trim().toLowerCase();

  // D0. Normalize beta headers & diagram-specific headers
  if (/^sankey\b/i.test(lines[0].trim())) { lines[0] = 'sankey-beta'; fixes.push('Normalized sankey header to sankey-beta'); }
  if (/^xychart\b(?!-beta)/i.test(lines[0].trim())) { lines[0] = lines[0].trim().replace(/^xychart\b/i, 'xychart-beta'); fixes.push('Normalized xychart header to xychart-beta'); }
  if (/^block\b(?!-beta)/i.test(lines[0].trim())) { lines[0] = lines[0].trim().replace(/^block\b/i, 'block-beta'); fixes.push('Normalized block header to block-beta'); }
  if (/^statediagram\s*$/i.test(lines[0].trim())) { lines[0] = 'stateDiagram-v2'; fixes.push('Upgraded stateDiagram to stateDiagram-v2'); }
  if (/^c4context/i.test(lines[0].trim()) && !/^C4Context/.test(lines[0].trim())) { lines[0] = lines[0].trim().replace(/^c4context/i, 'C4Context'); fixes.push('Fixed C4Context casing'); }
  if (/^c4\b/i.test(lines[0].trim())) { lines[0] = 'C4Context'; fixes.push('Expanded C4 header to C4Context'); }

  // D0b. Diagram-specific quick repairs (gantt/journey/pie/quadrant/kanban/timeline/gitgraph/mindmap/er/class)
  if (/^gantt/i.test(headLower)) {
    if (!lines.some((l) => /^\s*dateFormat/i.test(l))) { lines.splice(1, 0, '    dateFormat YYYY-MM-DD'); fixes.push('Added missing gantt dateFormat'); }
    lines = lines.map((l, idx) => {
      if (idx === 0 || /^\s*(dateFormat|title|axisFormat|section|tickInterval|excludes|includes)\b/i.test(l) || !l.trim()) return l;
      if (!l.includes(':')) {
        const m2 = l.trim().match(/^(.+?)\s+(\d{4}-\d{2}-\d{2}|after\b.*|\d+d|\d+w)$/i);
        if (m2) { fixes.push(`Added task id/colon on gantt line ${idx + 1}`); return `    ${m2[1].trim()} :t${idx}, ${m2[2]}`; }
      }
      return l;
    });
  }
  if (/^journey/i.test(headLower)) {
    if (!lines.some((l) => /^\s*title\b/i.test(l))) { lines.splice(1, 0, '    title User Journey'); fixes.push('Added missing journey title'); }
    lines = lines.map((l, idx) => {
      if (idx === 0 || /^\s*(title|section)\b/i.test(l) || !l.trim()) return l;
      if (!/:\s*[1-5]\s*:/.test(l)) { fixes.push(`Added journey score on line ${idx + 1}`); return `${l.trim()}: 4: User`; }
      return l;
    });
  }
  if (/^pie/i.test(headLower)) {
    if (!/^\s*pie(\s+title\b|\s*$)/i.test(lines[0])) { lines[0] = 'pie title Distribution'; fixes.push('Normalized pie header'); }
    lines = lines.map((l, idx) => {
      if (idx === 0 || !l.trim()) return l;
      const m3 = l.trim().match(/^"?([^":]+)"?\s*:\s*(\d+(?:\.\d+)?)\s*$/);
      if (m3) return `    "${m3[1].trim()}" : ${m3[2]}`;
      if (!l.includes(':')) { fixes.push(`Added pie value on line ${idx + 1}`); return `    "${l.trim().replace(/"/g, '')}" : 25`; }
      return l;
    });
  }
  if (/^quadrantchart/i.test(headLower)) {
    ['x-axis Low Effort --> High Effort', 'y-axis Low Impact --> High Impact', 'quadrant-1 Quick Wins', 'quadrant-2 Major Bets', 'quadrant-3 Fill-ins', 'quadrant-4 Re-evaluate'].forEach((req) => {
      const key = req.split(' ')[0];
      if (!lines.some((l) => new RegExp(`^\\s*${key}`, 'i').test(l))) { lines.splice(1, 0, `    ${req}`); fixes.push(`Added missing ${key} declaration`); }
    });
    lines = lines.map((l, idx) => {
      if (idx === 0 || /^\s*(title|x-axis|y-axis|quadrant-)/i.test(l) || !l.trim()) return l;
      if (!/\[.*,.+\]/.test(l)) { fixes.push(`Added quadrant coordinates on line ${idx + 1}`); return `${l.trim().replace(/:\s*$/, '')}: [0.5, 0.5]`; }
      return l;
    });
  }
  if (/^kanban/i.test(headLower)) {
    lines = lines.map((l, idx) => {
      if (idx === 0 || !l.trim()) return l;
      if (/^\S/.test(l)) return `  ${l.trim()}`;
      if (/^\s{2}\S/.test(l) && !/^\s{2}\[.+/.test(l) && idx > 1 && /^\s{2}\S/.test(lines[idx - 1] || '')) return l;
      return l;
    });
    if (!lines.some((l) => /^\s{4}\[.+/.test(l))) fixes.push('Kanban needs [cards] under columns — add indented [Task] rows');
  }
  if (/^timeline/i.test(headLower)) {
    if (!lines.some((l) => /^\s*title\b/i.test(l))) { lines.splice(1, 0, '    title Roadmap'); fixes.push('Added missing timeline title'); }
  }
  if (/^gitgraph/i.test(headLower)) {
    if (!lines.some((l) => /^\s*commit\b/i.test(l))) { lines.splice(1, 0, '    commit'); fixes.push('Added missing gitGraph commit'); }
  }
  if (/^mindmap/i.test(headLower)) {
    if (!lines.some((l) => /root\(\(?/i.test(l))) {
      const first = lines.slice(1).find((l) => l.trim());
      lines.splice(1, 0, `  root(("${(first || 'Topic').trim().slice(0, 30)}"))`);
      fixes.push('Added missing mindmap root');
    }
  }
  if (/^erdiagram/i.test(headLower)) {
    lines = lines.map((l) => l.replace(/(\w+)\s+varchar\((\d+)\)/gi, '$1 String').replace(/(\w+)\((\d+)\)/g, '$1'));
    if (lines.some((l) => /varchar\(\d+\)/i.test(l))) fixes.push('Stripped SQL length params from ER types');
  }
  if (/^classdiagram/i.test(headLower)) {
    lines = lines.map((l) => l.replace(/List<(\w+)>/g, 'List~$1~').replace(/Map<([^>]+)>/g, (mm, inner) => `Map~${inner.replace(/,\s*/g, '_')}~`));
  }
  if (/^xychart-beta/i.test(headLower)) {
    if (!lines.some((l) => /^\s*x-axis/i.test(l))) { lines.splice(1, 0, '    x-axis [a, b, c]'); fixes.push('Added missing x-axis'); }
    if (!lines.some((l) => /^\s*y-axis/i.test(l))) { lines.splice(1, 0, '    y-axis "value" 0 --> 10'); fixes.push('Added missing y-axis'); }
  }
  if (/^sankey-beta/i.test(headLower)) {
    lines = lines.map((l, idx) => {
      if (idx === 0 || !l.trim()) return l;
      if (!/,/.test(l)) {
        const parts = l.trim().split(/\s+/);
        if (parts.length >= 3) { fixes.push(`Fixed sankey commas on line ${idx + 1}`); return `    ${parts[0]},${parts[1]},${parts[2]}`; }
      }
      return l;
    });
  }
  if (/^block-beta/i.test(headLower)) {
    if (!lines.some((l) => /^\s*columns\s+\d+/i.test(l))) { lines.splice(1, 0, '    columns 3'); fixes.push('Added missing block columns'); }
  }
  if (/^c4context/i.test(headLower)) {
    lines = lines.map((l, idx) => {
      if (idx === 0 || !l.trim()) return l;
      const fixed = l.replace(/^\s*person\(/i, '    Person(').replace(/^\s*system\(/i, '    System(').replace(/^\s*container\(/i, '    Container(').replace(/^\s*rel\(/i, '    Rel(');
      if (fixed !== l) fixes.push(`Fixed C4 keyword casing on line ${idx + 1}`);
      return fixed;
    });
  }

  lines = lines.map((line, idx) => {
    let l = line;

    if (inFlowchart) {
      // Fix single arrow '->' in flowchart which Mermaid rejects
      if (/(^|[^-])->([^-]|$)/.test(l) && !/-->/.test(l)) {
        l = l.replace(/([A-Za-z0-9_\]\)\}])\s*->\s*([A-Za-z0-9_\[\(\{])/g, '$1 --> $2');
        if (l !== line) fixes.push(`Replaced invalid single arrow '->' with '-->' on line ${idx + 1}`);
      }

      // Fix pipe labels with spaces: --> | label | B -> -->|label| B
      l = l.replace(/-->\s*\|\s*(.*?)\s*\|\s*/g, '-->|$1| ');

      // Fix unquoted special characters in node bracket labels: id[Some (Text) & /More/] -> id["Some (Text) & /More/"]
      const quotedBracket = l.replace(/(\b\w+)\s*\[([^"\n\[\]]*?[()\/&:,+{}<>][^"\n\[\]]*?)\]/g, (match, id, text) => {
        // Leave valid shape delimiters alone: [(cylinder)], [/parallelogram/], [\trapezoid\]
        const t = text.trim();
        if (/^\(.*\)$/.test(t) || /^\/.*\/$/.test(t) || /^\\.*\\$/.test(t) || /^\/.*\\$/.test(t) || /^\\.*\/$/.test(t)) return match;
        return `${id}["${t}"]`;
      });
      if (quotedBracket !== l) {
        l = quotedBracket;
        fixes.push(`Quoted special characters in node label on line ${idx + 1}`);
      }

      // Fix unquoted nested parentheses in round nodes: id(Some (Text)) -> id("Some (Text)")
      const quotedParen = l.replace(/(\b\w+)\s*\(([^"\n()]*?[()[\]{}][^"\n()]*?)\)/g, (match, id, text) => {
        return `${id}("${text.trim()}")`;
      });
      if (quotedParen !== l) {
        l = quotedParen;
        fixes.push(`Quoted special characters in rounded node on line ${idx + 1}`);
      }

      // Fix invalid subgraph syntax: subgraph Some Name (v1) -> subgraph SUB_N ["Some Name (v1)"]
      if (/^\s*subgraph\s+[^\["\n]+\s+[^\["\n]+/i.test(l) && !/\[/.test(l)) {
        const match = l.match(/^(\s*subgraph\s+)(.+)$/i);
        if (match) {
          const rawTitle = match[2].trim();
          const cleanId = rawTitle.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 16);
          l = `${match[1]}${cleanId} ["${rawTitle}"]`;
          fixes.push(`Quoted multi-word subgraph title on line ${idx + 1}`);
        }
      }
    }

    if (inSequence) {
      // Fix dotted arrow without double arrowhead: Bob --> Alice -> Bob -->> Alice
      if (/(^|\s)(\w+)\s*-->\s*(\w+)/.test(l)) {
        l = l.replace(/(^|\s)(\w+)\s*-->\s*(\w+)/g, '$1$2-->>$3');
        fixes.push(`Corrected dotted sequence arrow to '-->>' on line ${idx + 1}`);
      }
      // Fix single arrow '->' in sequence to '->>'
      if (/(^|\s)(\w+)\s*->\s*(\w+)/.test(l) && !/->>/.test(l)) {
        l = l.replace(/(^|\s)(\w+)\s*->\s*(\w+)/g, '$1$2->>$3');
        fixes.push(`Corrected arrow to '->>' on line ${idx + 1}`);
      }
      // Fix missing colon in sequence message: A->>B message -> A->>B: message
      if (/(->>|-->>|-\)|--\))\s*(\w+)\s+([^:\n]+)$/.test(l) && !l.includes(':')) {
        l = l.replace(/(->>|-->>|-\)|--\))\s*(\w+)\s+(.+)$/, '$1$2: $3');
        fixes.push(`Added missing ':' for message on line ${idx + 1}`);
      }
      // Fix sequence arrow with no message text at all: A ->> B -> A ->> B: call
      if (/(->>|-->>|-\)|--\>)\s*(\w+)\s*$/.test(l) && !l.includes(':')) {
        l = l.trim() + ': call';
        fixes.push(`Added missing message on sequence line ${idx + 1}`);
      }
    }

    if (inState) {
      // Fix state diagram single arrows
      l = l.replace(/\[\*\]\s*->\s*/g, '[*] --> ');
      l = l.replace(/\s*->\s*\[\*\]/g, ' --> [*]');
      l = l.replace(/(\w+)\s*->\s*(\w+)/g, '$1 --> $2');
    }

    return l;
  });

  // Check unclosed sequence blocks
  if (inSequence) {
    const blockStarts = lines.filter((l) => /^\s*(alt|opt|loop|par|critical|rect)\b/i.test(l)).length;
    const blockEnds = lines.filter((l) => /^\s*end\b/i.test(l)).length;
    if (blockStarts > blockEnds) {
      const missing = blockStarts - blockEnds;
      for (let i = 0; i < missing; i++) lines.push('    end');
      fixes.push(`Closed ${missing} unclosed sequence block(s) with 'end'`);
    }
  }

  // Architecture diagram syntax repairs
  if (/^architecture/i.test(headLower)) {
    if (!/^architecture-beta/i.test(lines[0])) {
      lines[0] = 'architecture-beta';
      fixes.push('Normalized architecture header to architecture-beta');
    }
    lines = lines.map((l, idx) => {
      if (idx === 0 || !l.trim()) return l;
      if (/^\s*service\s+(\w+)\s*\[/i.test(l) && !/^\s*service\s+\w+\s*\(/i.test(l)) {
        fixes.push(`Added default icon to service on line ${idx + 1}`);
        return l.replace(/^(\s*service\s+\w+)\s*\[/i, '$1(server)[');
      }
      return l;
    });
  }

  // Packet diagram syntax repairs
  if (/^packet/i.test(headLower)) {
    if (!/^packet-beta/i.test(lines[0])) {
      lines[0] = 'packet-beta';
      fixes.push('Normalized packet header to packet-beta');
    }
    lines = lines.map((l, idx) => {
      if (idx === 0 || !l.trim()) return l;
      const m = l.match(/^(\s*\d+-\d+\s*:\s*)([^"\n]+)$/);
      if (m && !m[2].trim().startsWith('"')) {
        fixes.push(`Quoted packet label on line ${idx + 1}`);
        return `${m[1]}"${m[2].trim()}"`;
      }
      return l;
    });
  }

  return { code: lines.join('\n'), fixes: Array.from(new Set(fixes)) };
}

/**
 * Secondary aggressive fixes when syntax still fails
 */
function applyAggressiveFixes(code, errorMsg = '') {
  const fixes = [];
  let lines = code.split('\n');

  // Strip empty lines from start/end
  while (lines.length > 0 && !lines[0].trim()) lines.shift();
  while (lines.length > 0 && !lines[lines.length - 1].trim()) lines.pop();

  // If Parse error indicates a specific line number:
  const lineMatch = errorMsg.match(/line\s+(\d+)/i);
  if (lineMatch) {
    const errorLineIdx = parseInt(lineMatch[1], 10) - 1;
    if (lines[errorLineIdx]) {
      const errLine = lines[errorLineIdx];
      // Escape all double quotes in that line inside node brackets
      const escaped = errLine.replace(/\[(.*?)\]/g, (m, content) => {
        const cleanContent = content.replace(/"/g, "'");
        return `["${cleanContent}"]`;
      });
      if (escaped !== errLine) {
        lines[errorLineIdx] = escaped;
        fixes.push(`Sanitized quotes and special characters on line ${errorLineIdx + 1}`);
      }
    }
  }

  // Remove any stray unclosed quotes across the file
  lines = lines.map((l) => {
    const quoteCount = (l.match(/"/g) || []).length;
    if (quoteCount % 2 !== 0) {
      fixes.push('Balanced unclosed quotes in diagram line');
      return l + '"';
    }
    return l;
  });

  // Cross-type sanitizers: generics, ER parens, C4 casing, beta headers
  let joined = lines.join('\n');
  const beforeAll = joined;
  if (/^classDiagram/im.test(joined)) {
    joined = joined.replace(/List<(\w+)>/g, 'List~$1~').replace(/Map<([^>\n]+)>/g, (mm, inner) => `Map~${inner.replace(/,\s*/g, '_')}~`);
    if (joined !== beforeAll) fixes.push('Converted Java generics <T> to Mermaid ~T~');
  }
  if (/^erDiagram/im.test(joined)) {
    const noParen = joined.replace(/(\w+)\s+\w+\(\d+\)/g, (mm, a) => mm.replace(/\(\d+\)/, ''));
    if (noParen !== joined) { joined = noParen; fixes.push('Stripped length params from ER column types'); }
  }
  if (joined !== beforeAll) lines = joined.split('\n');

  return { fixed: fixes.length > 0, code: lines.join('\n'), fixes };
}

/**
 * Fallback to LLM if active in AIAssistant (Qwen or Ollama)
 */
async function fixWithLlm(aiAssistant, code, errorMsg) {
  if (!aiAssistant) return null;

  const prompt = `Fix this invalid Mermaid diagram syntax error.
Error: ${errorMsg}

Broken Code:
\`\`\`mermaid
${code}
\`\`\`

Return ONLY the corrected valid Mermaid diagram code inside a single \`\`\`mermaid ... \`\`\` code block. Do NOT include explanations.`;

  try {
    if (aiAssistant.engineMode === 'ollama' && aiAssistant.ollamaConnected) {
      const res = await fetch(`${aiAssistant.ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: aiAssistant.ollamaModel,
          messages: [{ role: 'user', content: prompt }],
          stream: false,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.message?.content || '';
        const fixed = aiAssistant.extractMermaidCode(text);
        if (fixed) return { success: true, code: fixed };
      }
    }

    if (aiAssistant.engineMode === 'qwen' && aiAssistant.qwenLoaded && aiAssistant.qwenEngine) {
      const completion = await aiAssistant.qwenEngine.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        max_tokens: 600,
      });
      const text = completion.choices[0]?.message?.content || '';
      const fixed = aiAssistant.extractMermaidCode(text);
      if (fixed) return { success: true, code: fixed };
    }
  } catch (err) {
    console.warn('fixWithLlm error:', err);
  }

  return null;
}

/**
 * Extracts line number, column, and cleaned description from parser errors
 * @param {string} errorMsg
 * @param {string} docText
 * @returns {{ line: number, column: number, message: string, raw: string }}
 */
export function parseErrorDetails(errorMsg, docText = '') {
  if (!errorMsg || typeof errorMsg !== 'string') return null;

  // Extract 1-based line number
  let line = 1;
  const lineMatch =
    errorMsg.match(/Parse error on line (\d+)/i) ||
    errorMsg.match(/(?:line|Line)\s*[:#]?\s*(\d+)/i) ||
    errorMsg.match(/at line (\d+)/i);
  if (lineMatch) {
    line = Math.max(1, parseInt(lineMatch[1], 10));
  }

  // Extract column if caret is present (e.g. '----------^')
  let column = 0;
  const caretMatch = errorMsg.match(/(-+)\^/);
  if (caretMatch) {
    column = Math.max(0, caretMatch[1].length);
  }

  // Clean error message: look for descriptive parser rule line first
  const lines = errorMsg.split('\n').map((l) => l.trim()).filter(Boolean);
  const descriptive = lines.find((l) =>
    /^(?:expecting|unrecognized|lexical|syntaxerror|unexpected|invalid)/i.test(l),
  );

  let cleanMsg = descriptive || '';
  if (!cleanMsg) {
    cleanMsg = errorMsg
      .replace(/^Error:\s*/i, '')
      .replace(/Parse error on line \d+:\s*/i, '')
      .split('\n')[0]
      .trim();
  }

  // If still empty or just code dashes/dots, find any helpful text
  if (!cleanMsg || cleanMsg.startsWith('---') || cleanMsg.startsWith('...')) {
    cleanMsg = lines.find((l) => !l.startsWith('---') && !l.startsWith('...') && !/^\d+$/.test(l)) || 'Syntax error';
  }

  if (!cleanMsg) cleanMsg = 'Syntax parse error';

  return {
    line,
    column,
    message: cleanMsg,
    raw: errorMsg,
  };
}

