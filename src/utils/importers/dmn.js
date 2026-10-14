/** DMN (decision tables) → Mermaid flowchart — Phase 13. Handles XML decision/decisionTable + FEEL-friendly text. */
export function parseDmnToMermaid(src) {
  if (!src || typeof src !== 'string') throw new Error('Please provide DMN text.');
  const out = ['flowchart TD'];
  const id = (s) => 'dmn_' + s.replace(/[^A-Za-z0-9_]/g, '_').slice(0, 24);
  if (/<definitions|<decision\b/i.test(src)) {
    const decRe = /<decision\b[^>]*id="([^"]+)"[^>]*name="([^"]*)"/gi;
    const decs = [];
    let m;
    while ((m = decRe.exec(src)) !== null) decs.push({ id: m[1], name: m[2] || m[1] });
    const reqRe = /<informationRequirement>[\s\S]*?<requiredDecision[^>]*href="#([^"]+)"/gi;
    const edges = [];
    // map decision order to requirements approximately
    const hrefs = [];
    while ((m = reqRe.exec(src)) !== null) hrefs.push(m[1]);
    if (!decs.length) throw new Error('No DMN decision elements found.');
    decs.slice(0, 20).forEach(d => out.push(`  ${id(d.id)}{"${d.name.replace(/"/g, "'")}"}`));
    hrefs.slice(0, 30).forEach((h, i) => {
      const from = decs[i % decs.length]; const toId = decs.find(d => d.id === h);
      if (from && toId && from.id !== h) out.push(`  ${id(from.id)} --> ${id(h)}`);
    });
    return out.join('\n') + '\n';
  }
  // Text form: "when X then Y" lines
  const lines = src.split('\n').map(l => l.trim()).filter(Boolean);
  const rules = lines.filter(l => /when|if|then|rule/i.test(l)).slice(0, 15);
  if (!rules.length) throw new Error('No DMN rules found. Use XML or "when X then Y" lines.');
  out.push('  D0(["Input"])');
  rules.forEach((r, i) => out.push(`  D0 --> D${i + 1}["${r.slice(0, 60).replace(/"/g, "'")}"]`));
  return out.join('\n') + '\n';
}
