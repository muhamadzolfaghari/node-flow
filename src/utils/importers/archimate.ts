/** ArchiMate Open Exchange XML → Mermaid flowchart — Phase 12 */
export function parseArchiMateToMermaid(src) {
  if (!src || typeof src !== 'string') throw new Error('Please provide ArchiMate XML text.');
  if (!/archimate|archimateElement/i.test(src)) throw new Error('Not recognized as ArchiMate exchange XML.');
  const elems = new Map();
  const elRe = /<element\b[^>]*identifier="([^"]+)"[^>]*xsi:type="([^"]+)"[^>]*(?:name="([^"]*)")?[^>]*\/?>|<archimateElement\b[^>]*identifier="([^"]+)"[^>]*name="([^"]*)"[^>]*type="([^"]*)"/gi;
  let m;
  while ((m = elRe.exec(src)) !== null) {
    const id = m[1] || m[4]; const type = (m[2] || m[6] || 'Element').split(':').pop();
    const name = (m[3] || m[5] || type).replace(/"/g, "'");
    if (id) elems.set(id, { name: name || type, type });
  }
  // generic fallback: any <element identifier= name=
  const genRe = /identifier="([^"]+)"[^>]*name="([^"]*)"/gi;
  while ((m = genRe.exec(src)) !== null) {
    if (!elems.has(m[1])) elems.set(m[1], { name: m[2] || m[1], type: 'Element' });
  }
  const rels = [];
  const relRe = /<relationship\b[^>]*source="([^"]+)"[^>]*target="([^"]+)"[^>]*(?:name="([^"]*)")?/gi;
  while ((m = relRe.exec(src)) !== null) rels.push({ from: m[1], to: m[2], label: m[3] || '' });
  if (!elems.size) throw new Error('No ArchiMate elements with identifier/name found.');
  const id = (s) => 'am_' + s.replace(/[^A-Za-z0-9_]/g, '_').slice(0, 24);
  const icon = (t) => /business/i.test(t) ? '👤' : /application/i.test(t) ? '🧩' : /technology/i.test(t) ? '🖥️' : /motivation/i.test(t) ? '🎯' : '⬢';
  const out = ['flowchart LR'];
  for (const [eid, e] of [...elems.entries()].slice(0, 40)) out.push(`  ${id(eid)}["${icon(e.type)} ${e.name}"]`);
  rels.slice(0, 40).forEach(r => {
    if (elems.has(r.from) && elems.has(r.to)) out.push(r.label ? `  ${id(r.from)} -->|"${r.label}"| ${id(r.to)}` : `  ${id(r.from)} --> ${id(r.to)}`);
  });
  return out.join('\n') + '\n';
}
// @ts-nocheck
