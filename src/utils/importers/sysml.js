/** SysML v2 textual → Mermaid — Phase 11. Handles part/requirement/action/state/item/interface. */
export function parseSysmlToMermaid(src) {
  if (!src || typeof src !== 'string') throw new Error('Please provide SysML v2 text.');
  if (!/(part|requirement|action|state|item|interface|package|allocation|constraint)\b/i.test(src)) throw new Error('No SysML declarations found (part/requirement/action/state).');
  const parts = []; const reqs = []; const actions = []; const rels = [];
  const re = /^\s*(part|requirement|action|state|item|interface|package)\s+(?:def\s+)?(\w+)(?:\s*:\s*(\w+))?/gim;
  let m;
  while ((m = re.exec(src)) !== null) {
    const kind = m[1].toLowerCase(); const name = m[2];
    if (kind === 'part') parts.push(name);
    else if (kind === 'requirement') reqs.push(name);
    else if (kind === 'action') actions.push(name);
    else parts.push(name);
    if (m[3]) rels.push({ from: name, to: m[3] });
  }
  const connRe = /(\w+)\s*(connects?|binds?|flows?|allocates?)\s*(?:to\s+)?(\w+)/gi;
  while ((m = connRe.exec(src)) !== null) rels.push({ from: m[1], to: m[3], label: m[2] });
  const id = (s) => s.replace(/[^A-Za-z0-9_]/g, '_').slice(0, 28) || 'N';
  const out = ['flowchart TD'];
  if (parts.length) {
    out.push('  subgraph Parts [Parts / Blocks]');
    parts.slice(0, 15).forEach(p => out.push(`    ${id(p)}["🧩 ${p}"]`));
    out.push('  end');
  }
  if (reqs.length) {
    out.push('  subgraph Requirements [Requirements]');
    reqs.slice(0, 12).forEach(r => out.push(`    ${id(r)}["📋 ${r}"]`));
    out.push('  end');
  }
  if (actions.length) {
    out.push('  subgraph Actions [Actions]');
    actions.slice(0, 12).forEach(a => out.push(`    ${id(a)}["⚙️ ${a}"]`));
    out.push('  end');
  }
  rels.slice(0, 30).forEach(r => out.push(`  ${id(r.from)} -->|"${r.label || 'rel'}"| ${id(r.to)}`));
  if (out.length < 3) throw new Error('No SysML parts/requirements extracted.');
  return out.join('\n') + '\n';
}
