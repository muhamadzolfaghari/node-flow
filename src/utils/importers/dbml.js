/** DBML → Mermaid erDiagram — Phase 7. Supports Table { col type [pk/fk/ref], Ref: a.b > c.d } */
export function parseDbmlToMermaid(src) {
  if (!src || typeof src !== 'string') throw new Error('Please provide DBML text.');
  const tables = {}; const refs = [];
  const tableRe = /Table\s+(\w+)(?:\s+as\s+(\w+))?\s*\{([\s\S]*?)\}/gi;
  let m;
  while ((m = tableRe.exec(src)) !== null) {
    const name = m[1]; const body = m[3];
    tables[name.toLowerCase()] = { name, cols: [] };
    body.split('\n').forEach(line => {
      const t = line.trim(); if (!t || t.startsWith('//') || t.startsWith('Note:')) return;
      const cm = t.match(/^(\w+)\s+([\w()]+)(.*)$/);
      if (cm) {
        let type = cm[2].replace(/\(.*\)/, '') || 'string';
        const rest = cm[3] || '';
        let key = '';
        if (/\[.*pk.*\]/i.test(rest)) key = 'PK';
        else if (/\[.*ref.*\]/i.test(rest)) key = 'FK';
        tables[name.toLowerCase()].cols.push({ name: cm[1], type, key });
      }
    });
  }
  const refRe = /Ref\s*(?::\s*\w+\s*)?:?\s*(\w+)\.(\w+)\s*([<>-]+)\s*(\w+)\.(\w+)/gi;
  while ((m = refRe.exec(src)) !== null) {
    refs.push({ from: m[4].toLowerCase(), to: m[1].toLowerCase(), label: `${m[2]}-${m[5]}` });
  }
  // inline [ref: > other.col]
  const inlineRe = /(\w+)\s+[\w()]+\s*\[[^\]]*ref\s*:\s*([<>-]+)\s*(\w+)\.(\w+)[^\]]*\]/gi;
  while ((m = inlineRe.exec(src)) !== null) {
    // find enclosing table: search backwards
    const idx = m.index; const before = src.slice(0, idx);
    const tm = before.match(/Table\s+(\w+)[^{]*\{[^}]*$/i);
    if (tm) refs.push({ from: m[3].toLowerCase(), to: tm[1].toLowerCase(), label: m[1] });
  }
  if (!Object.keys(tables).length) throw new Error('No Table blocks found. Use: Table users { id int [pk] }.');
  const out = ['erDiagram'];
  for (const t of Object.values(tables)) {
    out.push(`  ${t.name.toUpperCase()} {`);
    (t.cols.length ? t.cols : [{ name: 'id', type: 'int', key: 'PK' }]).forEach(c => {
      out.push(`    ${c.type} ${c.name}${c.key ? ' ' + c.key : ''}`);
    });
    out.push('  }');
  }
  refs.slice(0, 40).forEach(r => {
    if (tables[r.from] && tables[r.to]) out.push(`  ${r.from.toUpperCase()} ||--o{ ${r.to.toUpperCase()} : "${r.label}"`);
  });
  return out.join('\n') + '\n';
}
