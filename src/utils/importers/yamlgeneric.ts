/** Generic YAML structure → Mermaid mindmap/flowchart — Phase 14a. For k8s, compose, generic maps. */
export function parseYamlGenericToMermaid(src) {
  if (!src || typeof src !== 'string') throw new Error('Please provide YAML text.');
  const lines = src.split('\n');
  const items = [];
  for (const line of lines) {
    const m = line.match(/^(\s*)([\w./-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const indent = m[1].length; const key = m[2]; const val = m[3].trim();
    if (key === '---' || key.startsWith('#')) continue;
    items.push({ indent, key, val });
  }
  if (items.length < 2) throw new Error('No YAML mapping entries found (key: value).');
  const root = items[0].key.replace(/[^A-Za-z0-9_ ]/g, '').slice(0, 30) || 'Root';
  const out = ['mindmap', `  root(("${root}"))`];
  const stack = [];
  items.slice(1, 40).forEach(it => {
    const depth = Math.min(3, Math.floor(it.indent / 2) + 1);
    const label = `${it.key}${it.val && it.val !== '|' && it.val !== '>' ? ': ' + it.val.slice(0, 24) : ''}`.replace(/"/g, "'").slice(0, 48);
    out.push(`${'  '.repeat(depth + 1)}${label}`);
  });
  return out.join('\n') + '\n';
}

/** Crow's-foot ERD text → Mermaid erDiagram — Phase 14c. Lines like "users ||--o{ orders : places". */
export function parseErdTextToMermaid(src) {
  if (!src || typeof src !== 'string') throw new Error('Please provide ERD text.');
  if (!/(\|\|--o\{|\|\|--\||\}o--|\|o--|\bTABLE\b|\bentity\b)/i.test(src)) throw new Error('No ERD relations or TABLE blocks found.');
  const out = ['erDiagram'];
  const relLines = [];
  src.split('\n').forEach(line => {
    const t = line.trim();
    if (!t || t.startsWith('#') || t.startsWith('//')) return;
    if (/(\|\||\}o|\}|\|o)--(o\{|\|\{|o\||--)/.test(t)) { relLines.push(`  ${t}`); return; }
    const tm = t.match(/^(?:TABLE|entity)\s+(\w+)/i) || t.match(/^([A-Za-z_]\w*)\s*\{$/);
    if (tm) { out.push(`  ${tm[1].toUpperCase()} {`); return; }
    if (t === '}' || t === ');') { out.push('  }'); return; }
    const cm = t.match(/^(\w+)\s+([\w()]+)(.*)$/);
    if (cm && out.length && out[out.length - 1]?.endsWith('{')) {
      out.push(`    ${cm[2].replace(/\(.*\)/, '')} ${cm[1]}`);
    }
  });
  if (out.length < 3 && relLines.length === 0) throw new Error('No ERD relations parsed.');
  // relations first (mermaid ER convention), then blocks
  return [...out.slice(0, 1), ...relLines, ...out.slice(1)].join('\n') + '\n';
}
// @ts-nocheck
