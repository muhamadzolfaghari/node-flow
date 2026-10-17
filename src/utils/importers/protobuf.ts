/** Protobuf .proto → Mermaid classDiagram — Phase 9 */
export function parseProtoToMermaid(src) {
  if (!src || typeof src !== 'string') throw new Error('Please provide .proto text.');
  const msgRe = /message\s+(\w+)\s*\{([\s\S]*?)\n\}/g;
  const enumRe = /enum\s+(\w+)\s*\{([\s\S]*?)\n\}/g;
  const classes = {}; const order = [];
  let m;
  while ((m = msgRe.exec(src)) !== null) {
    const name = m[1];
    if (!classes[name]) { classes[name] = { fields: [], kind: 'message' }; order.push(name); }
    m[2].split('\n').forEach(line => {
      const t = line.trim().replace(/;.*$/, '').trim();
      if (!t || t.startsWith('//') || t.startsWith('option') || t.startsWith('reserved')) return;
      const fm = t.match(/^(?:repeated\s+|optional\s+|required\s+)?([\w.]+)\s+(\w+)\s*=\s*\d+$/);
      if (fm) {
        let type = fm[1].split('.').pop();
        const map = { string: 'String', int32: 'Int', int64: 'Long', uint32: 'Int', uint64: 'Long', bool: 'Bool', double: 'Float', float: 'Float', bytes: 'Bytes' };
        classes[name].fields.push({ name: fm[2], type: map[type] || type });
      }
    });
  }
  while ((m = enumRe.exec(src)) !== null) {
    const name = m[1];
    if (!classes[name]) { classes[name] = { fields: [], kind: 'enum' }; order.push(name); }
    m[2].split('\n').forEach(line => {
      const t = line.trim().replace(/;.*$/, '');
      const em = t.match(/^(\w+)\s*=\s*\d+/);
      if (em && em[1] !== 'option') classes[name].fields.push({ name: em[1], type: 'int' });
    });
  }
  if (!order.length) throw new Error('No message/enum blocks found. Add: message User { string id = 1; }.');
  const out = ['classDiagram'];
  for (const n of order.slice(0, 25)) {
    const c = classes[n];
    out.push(`  class ${n} {`);
    out.push(`    <<${c.kind}>>`);
    c.fields.slice(0, 14).forEach(f => out.push(`    +${f.type} ${f.name}`));
    out.push('  }');
  }
  // relations: field type referencing another message
  for (const n of order) {
    for (const f of classes[n].fields) {
      if (classes[f.type]) out.push(`  ${n} --> ${f.type} : ${f.name}`);
    }
  }
  return out.join('\n') + '\n';
}
