/** Prisma schema → Mermaid erDiagram — Phase 8 */
export function parsePrismaToMermaid(src) {
  if (!src || typeof src !== 'string') throw new Error('Please provide Prisma schema text.');
  const modelRe = /model\s+(\w+)\s*\{([\s\S]*?)\n\}/g;
  const tables = {}; const refs = [];
  let m;
  while ((m = modelRe.exec(src)) !== null) {
    const name = m[1]; const body = m[2];
    tables[name.toLowerCase()] = { name, cols: [] };
    body.split('\n').forEach(line => {
      const t = line.trim();
      if (!t || t.startsWith('//') || t.startsWith('@@')) return;
      const cm = t.match(/^(\w+)\s+([\w\[\]?]+)(.*)$/);
      if (cm) {
        const fname = cm[1]; let ftype = cm[2].replace('?', '').replace('[]', '');
        const rest = cm[3] || '';
        const map = { String: 'string', Int: 'int', BigInt: 'bigint', Float: 'float', Decimal: 'decimal', Boolean: 'bool', DateTime: 'datetime', Json: 'json', Bytes: 'bytes' };
        let type = map[ftype] || (/^[A-Z]/.test(ftype) ? 'FK' : ftype.toLowerCase());
        let key = /@id/i.test(rest) ? 'PK' : '';
        tables[name.toLowerCase()].cols.push({ name: fname, type: /^[A-Z]/.test(ftype) ? 'string' : type, key, ref: /^[A-Z]/.test(ftype) ? ftype : null });
        if (/^[A-Z]/.test(ftype)) refs.push({ from: ftype.toLowerCase(), to: name.toLowerCase(), label: fname });
        const rel = rest.match(/@relation\([^)]*references:\s*\[(\w+)\]/i);
        if (rel && /^[A-Z]/.test(ftype)) { /* already pushed */ }
      }
    });
  }
  if (!Object.keys(tables).length) throw new Error('No model blocks found. Use: model User { id String @id }.');
  const out = ['erDiagram'];
  for (const t of Object.values(tables)) {
    out.push(`  ${t.name.toUpperCase()} {`);
    t.cols.filter(c => !c.ref).slice(0, 16).forEach(c => out.push(`    ${c.type} ${c.name}${c.key ? ' ' + c.key : ''}`));
    if (!t.cols.filter(c => !c.ref).length) out.push('    string id PK');
    out.push('  }');
  }
  refs.slice(0, 40).forEach(r => {
    if (tables[r.from] && tables[r.to]) out.push(`  ${r.from.toUpperCase()} ||--o{ ${r.to.toUpperCase()} : "${r.label}"`);
  });
  return out.join('\n') + '\n';
}
