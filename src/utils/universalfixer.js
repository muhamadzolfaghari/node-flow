/**
 * Universal Syntax Fixer — Phase 3/21-30 of 50-phase plan.
 * Deterministic multi-format repair: Mermaid (all 17 diagram types)
 * + PlantUML, DOT, D2, SQL, GraphQL, OpenAPI/AsyncAPI, XML family,
 * HCL, CSV, Markdown, code stubs. LLM optional last resort.
 */
import { testMermaidSyntax, fixMermaidSyntax, parseErrorDetails } from './ai-syntax-fixer.js';

export async function fixAnySyntax(code, format = 'mermaid', errorMessage = '', opts = {}) {
  if (!code || typeof code !== 'string') return { success: false, error: 'No code provided.' };
  const fixes = [];
  let cur = code;

  // 0. Strip chat wrappers / fences for mermaid-family
  if (['mermaid', 'plantuml', 'graphviz', 'd2'].includes(format)) {
    const stripped = cur.replace(/```(?:mermaid|plantuml|dot|d2)?\s*\n?/gi, '').replace(/\n?```\s*$/g, '').trim();
    if (stripped !== cur) { fixes.push('Stripped markdown fences'); cur = stripped; }
  }

  // 1. Per-format pre-fixes
  const pre = preFixByFormat(cur, format);
  if (pre.code !== cur) { cur = pre.code; fixes.push(...pre.fixes); }

  // 2. If target compiles to mermaid, run mermaid fixer on converted or direct code
  if (format === 'mermaid') {
    const r = await fixMermaidSyntax(cur, errorMessage, opts);
    return { ...r, fixes: [...fixes, ...(r.fixes || [])] };
  }

  // 3. For derived formats: try compile → if mermaid invalid, fix mermaid side and report
  try {
    const { compileDocument } = await import('../lib/formats.js');
    const compiled = await compileDocument({ format, source: cur });
    const v = await testMermaidSyntax(compiled.code);
    if (v.valid) return { success: fixes.length > 0, fixedCode: cur, fixes: fixes.length ? fixes : ['Source looks valid'], method: 'deterministic' };
    // attempt to repair derived source by generic rules + re-compile
    const repaired = await fixMermaidSyntax(compiled.code, v.error || errorMessage, opts);
    if (repaired.success) {
      return { success: false, fixedCode: cur, fixes: [...fixes, 'Derived preview invalid — see previewFix hint'], previewFix: repaired.fixedCode, error: v.error };
    }
    return { success: false, fixedCode: cur, fixes, error: v.error || errorMessage };
  } catch (e) {
    // compile threw: source-level error, return pre-fixes + message
    return { success: false, fixedCode: cur, fixes, error: e.message || errorMessage };
  }
}

function preFixByFormat(code, format) {
  const fixes = [];
  let cur = code;
  const push = (cond, msg) => { if (cond) fixes.push(msg); };

  if (format === 'plantuml') {
    if (!/^\s*@startuml/m.test(cur)) { cur = '@startuml\n' + cur; push(true, 'Added missing @startuml'); }
    if (!/@enduml/i.test(cur)) { cur = cur.trim() + '\n@enduml'; push(true, 'Added missing @enduml'); }
  }
  if (format === 'graphviz') {
    const open = (cur.match(/\{/g) || []).length, close = (cur.match(/\}/g) || []).length;
    if (open > close) { cur += '\n}'; push(true, `Closed ${open - close} unbalanced DOT brace(s)`); }
    if (/digraph|graph/i.test(cur) && /->[^\n;]*[^;\s}\n]\s*$/m.test(cur)) {
      cur = cur.replace(/(->[^\n;]*[^;\s}\n])(\s*\n)/g, '$1;$2');
      push(true, 'Terminated DOT edges with semicolons');
    }
  }
  if (format === 'd2') {
    if (!/direction:/i.test(cur) && /->/.test(cur)) { cur = 'direction: right\n' + cur; push(true, 'Added D2 direction: right'); }
  }
  if (format === 'sql') {
    // add missing commas between column lines inside CREATE TABLE
    const before = cur;
    cur = cur.replace(/^(\s*[\w"`]+\s+[\w()]+(?:\s+(?:PRIMARY\s+KEY|NOT\s+NULL|UNIQUE|REFERENCES\s+\w+\(\w+\)))?)\s*\n(\s*[\w"`]+\s+\w+)/gim, '$1,\n$2');
    push(before !== cur, 'Added missing commas between SQL columns');
  }
  if (format === 'graphql') {
    const open = (cur.match(/\{/g) || []).length, close = (cur.match(/\}/g) || []).length;
    if (open > close) { cur += '\n}'.repeat(open - close); push(true, 'Closed GraphQL braces'); }
  }
  if (format === 'terraform') {
    const open = (cur.match(/\{/g) || []).length, close = (cur.match(/\}/g) || []).length;
    if (open > close) { cur += '\n}'.repeat(open - close); push(true, 'Closed Terraform braces'); }
  }
  if (format === 'csv') {
    const first = (cur.split('\n')[0] || '');
    if (!/[,;\t|]/.test(first)) { cur = 'source,target,label\n' + cur; push(true, 'Added CSV header source,target,label'); }
    const before = cur;
    cur = cur.split('\n').map((l, i) => {
      if (i === 0) return l;
      if (l.includes(';') && !l.includes(',')) return l.split(';').join(',');
      return l;
    }).join('\n');
    push(before !== cur, 'Normalized CSV delimiters to commas');
  }
  if (format === 'markdown') {
    if (!/^(\s*[-*•]|\s*\d+\.|#{1,6}\s|```mermaid)/m.test(cur)) {
      cur = cur.split('\n').filter(Boolean).map(l => `- ${l}`).join('\n');
      push(true, 'Converted plain lines to Markdown bullets');
    }
  }
  if (['drawio', 'bpmn', 'freemind', 'opml', 'xmi', 'archimate'].includes(format)) {
    const before = cur;
    cur = cur.replace(/&(?!amp;|lt;|gt;|quot;|apos;)/g, '&amp;');
    push(before !== cur, 'Escaped raw & as &amp; in XML');
  }
  if (format === 'openapi' || format === 'asyncapi') {
    if (/^\s*\{/.test(cur.trim())) {
      try { JSON.parse(cur); } catch (e) {
        // try trailing-comma fix
        const fixed = cur.replace(/,(\s*[}\]])/g, '$1');
        if (fixed !== cur) { cur = fixed; push(true, 'Removed trailing commas in JSON spec'); }
      }
    }
  }
  return { code: cur, fixes };
}

export { testMermaidSyntax, parseErrorDetails };
