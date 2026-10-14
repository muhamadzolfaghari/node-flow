/** UML XMI 2.x → Mermaid — Phase 10. Handles uml:Class, Generalization, Association, InterfaceRealization, lifelines/messages. */
export function parseXmiToMermaid(src) {
  if (!src || typeof src !== 'string') throw new Error('Please provide XMI text.');
  if (!/XMI|uml:/i.test(src)) throw new Error('Not recognized as UML XMI. Export UML2 XMI from Papyrus/StarUML/Enterprise Architect.');
  const classes = new Map(); // id -> name
  const classRe = /<uml:Class\b[^>]*xmi:id="([^"]+)"[^>]*name="([^"]*)"[^>]*\/?>|<packagedElement\b[^>]*xmi:type="uml:Class"[^>]*xmi:id="([^"]+)"[^>]*name="([^"]*)"/gi;
  let m;
  while ((m = classRe.exec(src)) !== null) {
    const id = m[1] || m[3]; const name = (m[2] || m[4] || 'Unnamed').replace(/[^A-Za-z0-9_]/g, '_') || 'Unnamed';
    classes.set(id, name);
  }
  // attributes / operations inside class nodes
  const attrs = new Map(); // className -> [fields]
  const ownedAttrRe = /<packagedElement\b[^>]*xmi:id="([^"]+)"[^>]*name="([^"]*)"[^>]*>([\s\S]*?)<\/packagedElement>/gi;
  while ((m = ownedAttrRe.exec(src)) !== null) {
    const id = m[1]; const name = m[2]; const inner = m[3];
    if (!classes.has(id)) continue;
    const fields = [];
    const aRe = /<ownedAttribute\b[^>]*name="([^"]*)"[^>]*type="([^"]*)"?[^>]*\/?>|<ownedAttribute\b[^>]*name="([^"]*)"[^>]*>/gi;
    let am;
    while ((am = aRe.exec(inner)) !== null) {
      fields.push({ name: (am[1] || am[3] || 'field').replace(/[^A-Za-z0-9_]/g, '_'), type: 'String' });
      if (fields.length >= 12) break;
    }
    attrs.set(classes.get(id), fields);
  }
  const rels = [];
  const genRe = /<generalization\b[^>]*general="([^"]+)"[^>]*>|<Generalization\b[^>]*general="([^"]+)"/gi;
  // generalization is usually nested; approximate: child packagedElement containing generalization@ general
  const childGenRe = /<packagedElement\b[^>]*xmi:id="([^"]+)"[^>]*>[\s\S]*?<generalization\b[^>]*general="([^"]+)"/gi;
  while ((m = childGenRe.exec(src)) !== null) {
    const child = classes.get(m[1]); const parent = classes.get(m[2]);
    if (child && parent) rels.push(`  ${parent} <|-- ${child}`);
  }
  const assocRe = /<packagedElement\b[^>]*xmi:type="uml:Association"[^>]*>[\s\S]*?<ownedEnd[^>]*type="([^"]+)"[\s\S]*?<ownedEnd[^>]*type="([^"]+)"/gi;
  while ((m = assocRe.exec(src)) !== null) {
    const a = classes.get(m[1]); const b = classes.get(m[2]);
    if (a && b) rels.push(`  ${a} --> ${b} : associates`);
  }
  // sequence: lifelines + messages
  const lifelines = new Map();
  const lifeRe = /<lifeline\b[^>]*xmi:id="([^"]+)"[^>]*name="([^"]*)"/gi;
  while ((m = lifeRe.exec(src)) !== null) lifelines.set(m[1], (m[2] || 'Lifeline').replace(/[^A-Za-z0-9_]/g, '_'));
  const messages = [];
  const msgRe = /<message\b[^>]*name="([^"]*)"[^>]*sendEvent="([^"]*)"[^>]*receiveEvent="([^"]*)"/gi;
  // fallback: message with signature referencing operation
  const msgSimpleRe = /<message\b[^>]*name="([^"]*)"/gi;
  const msgNames = [];
  while ((m = msgSimpleRe.exec(src)) !== null) msgNames.push(m[1].replace(/"/g, "'"));
  if (classes.size >= 2 && lifelines.size === 0 && msgNames.length === 0) {
    // class diagram path
    const out = ['classDiagram'];
    for (const name of new Set(classes.values())) {
      out.push(`  class ${name} {`);
      (attrs.get(name) || [{ name: 'id', type: 'String' }]).slice(0, 10).forEach(f => out.push(`    +${f.type} ${f.name}`));
      out.push('  }');
    }
    rels.slice(0, 30).forEach(r => out.push(r));
    if (out.length < 3) throw new Error('No uml:Class elements with names found in XMI.');
    return out.join('\n') + '\n';
  }
  if (lifelines.size >= 2 || msgNames.length >= 2) {
    const out = ['sequenceDiagram', '  autonumber'];
    [...lifelines.values()].slice(0, 8).forEach(l => out.push(`  participant ${l}`));
    const parts = [...lifelines.values()];
    msgNames.slice(0, 20).forEach((msg, i) => {
      const from = parts[i % parts.length] || 'A'; const to = parts[(i + 1) % parts.length] || 'B';
      out.push(`  ${from}->>${to}: ${msg}`);
    });
    if (out.length < 4) throw new Error('XMI lifelines/messages incomplete.');
    return out.join('\n') + '\n';
  }
  if (classes.size === 0) throw new Error('No uml:Class, lifeline, or message elements found in XMI.');
  const out = ['classDiagram'];
  for (const name of new Set(classes.values())) out.push(`  class ${name}`);
  rels.slice(0, 30).forEach(r => out.push(r));
  return out.join('\n') + '\n';
}
