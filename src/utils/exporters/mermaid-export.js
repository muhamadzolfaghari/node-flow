/**
 * Mermaid → other formats reverse hub — Phase 5 + 31-35.
 * Pure functions; best-effort structural export (not pixel-perfect).
 */

export function mermaidToPlantUml(mermaid) {
  if (!mermaid || typeof mermaid !== 'string') throw new Error('No Mermaid source.');
  const lines = mermaid.split('\n');
  const head = (lines[0] || '').trim();
  const out = ['@startuml'];
  if (/^sequenceDiagram/i.test(head)) {
    for (const l of lines.slice(1)) {
      const t = l.trim(); if (!t || t === 'autonumber') { if (t === 'autonumber') out.push('autonumber'); continue; }
      const m = t.match(/^(\w+)\s*(->>|-->>|-\)|--\))\s*(\w+)\s*:\s*(.*)$/);
      if (m) {
        const map = { '->>': '->', '-->>': '-->', '-)': '->>', '--)': '-->>' };
        out.push(`${m[1]} ${map[m[2]] || '->'} ${m[3]} : ${m[4]}`);
      } else if (/^(actor|participant)\b/i.test(t)) out.push(t);
      else if (/^(alt|else|loop|opt|par|end|Note)\b/i.test(t)) out.push(t);
      else out.push(`' ${t}`);
    }
  } else if (/^classDiagram/i.test(head)) {
    for (const l of lines.slice(1)) {
      const t = l.trim(); if (!t) continue;
      const cm = t.match(/^class\s+(\w+)\s*\{?/);
      if (cm) { out.push(`class ${cm[1]} {`); continue; }
      if (t === '}') { out.push('}'); continue; }
      const fm = t.match(/^([+#~-]?)([\w~]+)\s+(\w+)/);
      if (fm) out.push(`  ${fm[3]} : ${fm[2].replace(/~/g, '<')}`);
      else if (/<\|--|\*--|o--|-->|\.\.>/.test(t)) out.push(`  ${t}`);
      else out.push(`  ${t}`);
    }
  } else if (/^stateDiagram/i.test(head)) {
    for (const l of lines.slice(1)) { const t = l.trim(); if (t) out.push(t.replace(/\[\*\]/g, '[*]')); }
  } else {
    // flowchart → activity-ish
    for (const l of lines.slice(1)) {
      const t = l.trim(); if (!t) continue;
      const em = t.match(/^(\w+)(?:\["([^"]*)"|\("([^"]*)"|"([^"]*)"|\{([^}]*)\}|\[([^\]]*)\])?\s*-->(?:\|"([^"]*)"\|)?\s*(\w+)/);
      if (em) {
        const from = em[1]; const label = em[2] || em[3] || em[4] || em[5] || em[6] || from;
        const edge = em[7]; const to = em[8];
        out.push(edge ? `${from} --> ${to} : ${edge} (${label})` : `${from} --> ${to} : ${label}`);
      } else out.push(`' ${t}`);
    }
  }
  out.push('@enduml');
  return out.join('\n') + '\n';
}

export function mermaidToDot(mermaid) {
  const lines = mermaid.split('\n');
  const out = ['digraph G {', '  rankdir=TD;'];
  const nodeRe = /(\w+)(?:\["([^"]*)"|\("([^"]*)"|\("([^"]*)"\)|\[([^\]]*)\]|\{([^}]*)\}|\(\(\(([^)]*)\)\)\)|\("([^"]*)"\))?/g;
  const seen = new Set();
  for (const l of lines) {
    const t = l.trim();
    if (!t || /^(flowchart|graph|classDiagram|sequenceDiagram|stateDiagram|erDiagram|mindmap|gantt|pie|journey|timeline)/i.test(t)) continue;
    const em = t.match(/^(\w+)\s*-->(?:\|"?([^"|]*)"?\|\s*)?(\w+)/);
    if (em) {
      out.push(em[2] ? `  ${em[1]} -> ${em[3]} [label="${em[2]}"];` : `  ${em[1]} -> ${em[3]};`);
      continue;
    }
    let nm;
    while ((nm = nodeRe.exec(t)) !== null) {
      const nid = nm[1];
      if (/^(subgraph|end|direction|class|style|link|click)$/i.test(nid) || seen.has(nid)) continue;
      const label = nm[2] || nm[3] || nm[4] || nm[5] || nm[6] || nm[7] || nm[8] || nid;
      if (label && nid.length <= 32) { out.push(`  ${nid} [label="${label}"];`); seen.add(nid); }
    }
  }
  out.push('}');
  return out.join('\n') + '\n';
}

export function mermaidToD2(mermaid) {
  const dot = mermaidToDot(mermaid);
  return 'direction: right\n' + dot.split('\n')
    .filter(l => /->|label/.test(l))
    .map(l => l.replace(/digraph.*|rankdir.*|[{};]/g, '').replace(/\[label="([^"]*)"\]/, ': $1').trim())
    .filter(Boolean)
    .join('\n') + '\n';
}

export function mermaidErToSql(mermaid) {
  const tables = {}; const rels = [];
  const lines = mermaid.split('\n');
  let cur = null;
  for (const l of lines) {
    const t = l.trim(); if (!t) continue;
    if (/erDiagram/i.test(t)) continue;
    const rm = t.match(/^(\w+)\s*\|\|--o\{\s*(\w+)\s*:\s*"([^"]*)"/);
    if (rm) { rels.push({ from: rm[1], to: rm[2], col: rm[3] }); continue; }
    const tm = t.match(/^(\w+)\s*\{$/);
    if (tm) { cur = tm[1]; tables[cur] = []; continue; }
    if (t === '}') { cur = null; continue; }
    if (cur) {
      const cm = t.match(/^([\w()]+)\s+(\w+)(?:\s+(PK|FK))?/);
      if (cm) tables[cur].push({ type: cm[1], name: cm[2], key: cm[3] || '' });
    }
  }
  if (!Object.keys(tables).length) throw new Error('No ER tables found to export.');
  const sqlType = (t) => /int/i.test(t) ? 'INTEGER' : /bool/i.test(t) ? 'BOOLEAN' : /float|decimal|double/i.test(t) ? 'REAL' : /date|time/i.test(t) ? 'TIMESTAMP' : 'TEXT';
  const out = [];
  for (const [t, cols] of Object.entries(tables)) {
    out.push(`CREATE TABLE ${t.toLowerCase()} (`);
    const defs = cols.map(c => `  ${c.name} ${sqlType(c.type)}${c.key === 'PK' ? ' PRIMARY KEY' : ''}`);
    rels.filter(r => r.to === t).forEach(r => defs.push(`  ${r.col} TEXT REFERENCES ${r.from.toLowerCase()}(id)`));
    out.push(defs.join(',\n'));
    out.push(');');
  }
  return out.join('\n') + '\n';
}

export function mermaidErToDbml(mermaid) {
  const sql = mermaidErToSql(mermaid); // validate
  void sql;
  const lines = mermaid.split('\n');
  const out = [];
  let cur = null;
  for (const l of lines) {
    const t = l.trim(); if (!t || /erDiagram/i.test(t)) continue;
    const rm = t.match(/^(\w+)\s*\|\|--o\{\s*(\w+)\s*:\s*"([^"]*)"/);
    if (rm) { out.push(`Ref: ${rm[2].toLowerCase()}.${rm[3]} > ${rm[1].toLowerCase()}.id`); continue; }
    const tm = t.match(/^(\w+)\s*\{$/);
    if (tm) { cur = tm[1].toLowerCase(); out.push(`Table ${cur} {`); continue; }
    if (t === '}') { out.push('}'); cur = null; continue; }
    if (cur) {
      const cm = t.match(/^([\w()]+)\s+(\w+)(?:\s+(PK|FK))?/);
      if (cm) out.push(`  ${cm[2]} ${cm[1].toLowerCase()}${cm[3] === 'PK' ? ' [pk]' : ''}`);
    }
  }
  return out.join('\n') + '\n';
}

export function mermaidClassToTypeScript(mermaid) {
  const lines = mermaid.split('\n');
  const out = [];
  let cur = null;
  for (const l of lines) {
    const t = l.trim(); if (!t || /^classDiagram/i.test(t)) continue;
    const cm = t.match(/^class\s+(\w+)/);
    if (cm) { if (cur) out.push('}'); cur = cm[1]; out.push(`export class ${cur} {`); continue; }
    if (t === '}') { out.push('}'); cur = null; continue; }
    if (cur) {
      const fm = t.match(/^([+#~-]?)([\w~]+)\s+(\w+)/);
      if (fm) {
        const vis = fm[1] === '-' ? 'private ' : fm[1] === '#' ? 'protected ' : '';
        out.push(`  ${vis}${fm[3]}: ${fm[2].replace(/~/g, '')};`);
      } else {
        const mm = t.match(/^([+#~-]?)(\w+)\(([^)]*)\)/);
        if (mm) out.push(`  ${mm[1] === '-' ? 'private ' : ''}${mm[2]}(${mm[3]}): void {}`);
      }
    }
    const rm = t.match(/^(\w+)\s*<\|--\s*(\w+)/);
    if (rm) out.push(`// ${rm[2]} extends ${rm[1]}`);
  }
  if (cur) out.push('}');
  if (!out.length) throw new Error('No classes found to export.');
  return out.join('\n') + '\n';
}

export function mermaidMindmapToMarkdown(mermaid) {
  const lines = mermaid.split('\n');
  const out = [];
  for (const l of lines) {
    if (/^\s*mindmap/i.test(l)) continue;
    const m = l.match(/^(\s*)(.+?)\s*$/);
    if (!m || !m[2].trim()) continue;
    const depth = Math.max(0, Math.floor((m[1].length - 2) / 2));
    const label = m[2].replace(/^root\(\("?|"?\)\)$/g, '').replace(/[()"]/g, '').trim();
    if (!label) continue;
    out.push(`${'  '.repeat(depth)}- ${label}`);
  }
  if (!out.length) throw new Error('No mindmap nodes found to export.');
  return out.join('\n') + '\n';
}

export function mermaidMindmapToOpml(mermaid, title = 'Mindmap') {
  const md = mermaidMindmapToMarkdown(mermaid).split('\n').filter(Boolean);
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  // build nested outlines from indent
  const root = { children: [], depth: -1 };
  const stack = [root];
  md.forEach(line => {
    const m = line.match(/^( *)- (.*)$/);
    const depth = Math.floor(m[1].length / 2);
    const node = { text: m[2], children: [], depth };
    while (stack.length > 1 && stack[stack.length - 1].depth >= depth) stack.pop();
    stack[stack.length - 1].children.push(node);
    stack.push(node);
  });
  const render = (nodes) => nodes.map(n => `${'  '.repeat(n.depth + 2)}<outline text="${esc(n.text)}">${n.children.length ? `\n${render(n.children)}\n${'  '.repeat(n.depth + 2)}` : ''}</outline>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<opml version="2.0">\n  <head><title>${esc(title)}</title></head>\n  <body>\n${render(root.children)}\n  </body>\n</opml>\n`;
}

export function mermaidClassToXmi(mermaid) {
  const lines = mermaid.split('\n');
  const classes = [];
  let cur = null;
  for (const l of lines) {
    const t = l.trim(); if (!t || /^classDiagram/i.test(t)) continue;
    const cm = t.match(/^class\s+(\w+)/);
    if (cm) { cur = { name: cm[1], attrs: [] }; classes.push(cur); continue; }
    if (t === '}') { cur = null; continue; }
    if (cur) {
      const fm = t.match(/^([+#~-]?)([\w~]+)\s+(\w+)/);
      if (fm) cur.attrs.push({ name: fm[3], type: fm[2] });
    }
  }
  if (!classes.length) throw new Error('No classes found to export as XMI.');
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<xmi:XMI xmlns:xmi="http://www.omg.org/XMI" xmlns:uml="http://www.omg.org/spec/UML/20131001">\n  <uml:Model name="AtlasExport">\n`;
  classes.forEach((c, i) => {
    xml += `    <packagedElement xmi:type="uml:Class" xmi:id="c${i}" name="${esc(c.name)}">\n`;
    c.attrs.slice(0, 12).forEach((a, j) => { xml += `      <ownedAttribute xmi:id="c${i}a${j}" name="${esc(a.name)}" type="${esc(a.type)}"/>\n`; });
    xml += `    </packagedElement>\n`;
  });
  xml += '  </uml:Model>\n</xmi:XMI>\n';
  return xml;
}

export function mermaidSequenceToOpenApiStub(mermaid, title = 'Generated API') {
  const paths = {};
  mermaid.split('\n').forEach(l => {
    const m = l.trim().match(/(?:->>|-->>)\s*\w*\s*:\s*(GET|POST|PUT|DELETE|PATCH)\s+(\S+)/i);
    if (m) {
      const path = m[2].startsWith('/') ? m[2] : `/${m[2]}`;
      paths[path] = paths[path] || {};
      paths[path][m[1].toLowerCase()] = { summary: l.trim().slice(0, 80), responses: { 200: { description: 'OK' } } };
    }
  });
  return JSON.stringify({ openapi: '3.0.3', info: { title, version: '1.0.0' }, paths }, null, 2) + '\n';
}

export function mermaidErToPrisma(mermaid) {
  const lines = mermaid.split('\n');
  const tables = {};
  const rels = [];
  let cur = null;
  for (const l of lines) {
    const t = l.trim();
    if (!t || /erDiagram/i.test(t)) continue;
    const rm = t.match(/^(\w+)\s*\|\|--o\{\s*(\w+)\s*:\s*"?([^"]*)"?/);
    if (rm) { rels.push({ from: rm[1], to: rm[2], label: rm[3] }); continue; }
    const tm = t.match(/^(\w+)\s*\{$/);
    if (tm) { cur = tm[1]; tables[cur] = []; continue; }
    if (t === '}') { cur = null; continue; }
    if (cur) {
      const cm = t.match(/^([\w()]+)\s+(\w+)(?:\s+(PK|FK))?/);
      if (cm) tables[cur].push({ type: cm[1], name: cm[2], key: cm[3] || '' });
    }
  }
  if (!Object.keys(tables).length) throw new Error('No ER tables found to export as Prisma.');

  const pType = (t) => {
    if (/int/i.test(t)) return 'Int';
    if (/bool/i.test(t)) return 'Boolean';
    if (/float|double|decimal/i.test(t)) return 'Float';
    if (/date|time/i.test(t)) return 'DateTime';
    return 'String';
  };

  const out = [
    '// Generated by DiagramAtlas / NodeFlow',
    'datasource db {',
    '  provider = "postgresql"',
    '  url      = env("DATABASE_URL")',
    '}',
    '',
    'generator client {',
    '  provider = "prisma-client-js"',
    '}',
    ''
  ];

  for (const [table, cols] of Object.entries(tables)) {
    out.push(`model ${table} {`);
    for (const c of cols) {
      const t = pType(c.type);
      const isPk = c.key === 'PK' || c.name.toLowerCase() === 'id';
      const pkAttr = isPk ? ' @id @default(autoincrement())' : '';
      out.push(`  ${c.name.padEnd(16)} ${t}${pkAttr}`);
    }
    rels.filter(r => r.from === table).forEach(r => {
      out.push(`  ${r.to.toLowerCase().padEnd(16)} ${r.to}[]`);
    });
    rels.filter(r => r.to === table).forEach(r => {
      out.push(`  ${r.from.toLowerCase().padEnd(16)} ${r.from} @relation(fields: [${r.from.toLowerCase()}Id], references: [id])`);
      out.push(`  ${(r.from.toLowerCase() + 'Id').padEnd(16)} Int`);
    });
    out.push('}');
    out.push('');
  }
  return out.join('\n');
}

export function mermaidClassToGraphql(mermaid) {
  const lines = mermaid.split('\n');
  const types = {};
  let cur = null;
  for (const l of lines) {
    const t = l.trim();
    if (!t || /^classDiagram/i.test(t)) continue;
    const cm = t.match(/^class\s+(\w+)/);
    if (cm) { cur = cm[1]; types[cur] = []; continue; }
    if (t === '}') { cur = null; continue; }
    if (cur) {
      const fm = t.match(/^([+#~-]?)([\w~]+)\s+(\w+)/);
      if (fm) {
        types[cur].push({ type: fm[2].replace(/~/g, ''), name: fm[3] });
      }
    }
  }
  if (!Object.keys(types).length) throw new Error('No classes found to export as GraphQL schema.');

  const gType = (t, name) => {
    if (name.toLowerCase() === 'id' || t.toLowerCase() === 'id') return 'ID!';
    if (/int/i.test(t)) return 'Int';
    if (/bool/i.test(t)) return 'Boolean';
    if (/float|double|number/i.test(t)) return 'Float';
    return 'String';
  };

  const out = ['# Generated by DiagramAtlas / NodeFlow', ''];
  for (const [name, fields] of Object.entries(types)) {
    out.push(`type ${name} {`);
    for (const f of fields) {
      out.push(`  ${f.name}: ${gType(f.type, f.name)}`);
    }
    out.push('}');
    out.push('');
  }
  return out.join('\n');
}

export { mermaidArchitectureToTerraform } from './terraform-export.js';

