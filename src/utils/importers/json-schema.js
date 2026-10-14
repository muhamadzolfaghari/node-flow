/** JSON Schema → Mermaid (classDiagram + erDiagram fallback) — Phase 6 */
export function parseJsonSchemaToMermaid(src) {
  if (!src || typeof src !== 'string') throw new Error('Please provide JSON Schema text.');
  let schema;
  try { schema = JSON.parse(src); }
  catch { throw new Error('Invalid JSON. Validate quotes, commas, and braces.'); }
  const defs = { ...(schema.definitions || {}), ...(schema.$defs || {}), ...(schema.components?.schemas || {}) };
  if (schema.properties && !Object.keys(defs).length) defs[schema.title || 'Root'] = schema;
  if (!Object.keys(defs).length) {
    if (schema.type === 'object' && schema.properties) defs[schema.title || 'Root'] = schema;
    else throw new Error('No object definitions found. Add "properties" or "definitions".');
  }
  const lines = ['classDiagram'];
  const clean = (s) => String(s).replace(/[^A-Za-z0-9_]/g, '_').slice(0, 32) || 'Field';
  for (const [name, def] of Object.entries(defs).slice(0, 20)) {
    const cls = clean(name);
    lines.push(`  class ${cls} {`);
    const props = def.properties || {};
    const required = new Set(def.required || []);
    Object.entries(props).slice(0, 14).forEach(([p, pdef]) => {
      let t = 'String';
      if (pdef.type) t = { string: 'String', integer: 'Int', number: 'Float', boolean: 'Bool', array: 'Array', object: 'Object' }[pdef.type] || 'String';
      else if (pdef.$ref) t = clean(pdef.$ref.split('/').pop());
      else if (pdef.anyOf || pdef.oneOf) t = 'Union';
      const mark = required.has(p) ? '' : '?';
      lines.push(`    +${t} ${clean(p)}${mark}`);
    });
    lines.push('  }');
  }
  // refs → relations
  for (const [name, def] of Object.entries(defs)) {
    const from = clean(name);
    for (const [p, pdef] of Object.entries(def.properties || {})) {
      const ref = pdef.$ref || pdef.items?.$ref;
      if (ref) { const to = clean(ref.split('/').pop()); lines.push(`  ${from} --> "${p}" ${to}`); }
      else if (pdef.type === 'array' && pdef.items?.type) { /* scalar array, skip */ }
    }
  }
  return lines.join('\n') + '\n';
}
