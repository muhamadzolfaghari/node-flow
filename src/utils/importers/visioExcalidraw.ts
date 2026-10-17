/** Visio VDX/VSDX-ish XML + Gliffy JSON + Excalidraw JSON → flowchart — Phase 20 */
export function parseVisioToMermaid(src) {
  if (!src || typeof src !== 'string') throw new Error('Please provide Visio XML text.');
  const shapes = new Map();
  const shapeRe = /<Shape\b[^>]*ID="([^"]+)"[^>]*Name="([^"]*)"[^>]*>[\s\S]*?<Text>([^<]*)<\/Text>/gi;
  let m;
  while ((m = shapeRe.exec(src)) !== null) shapes.set(m[1], (m[3] || m[2] || m[1]).replace(/"/g, "'").trim());
  const nameOnly = /<Shape\b[^>]*ID="([^"]+)"[^>]*Name="([^"]*)"/gi;
  while ((m = nameOnly.exec(src)) !== null) if (!shapes.has(m[1])) shapes.set(m[1], m[2] || m[1]);
  const connRe = /<Connect\b[^>]*FromSheet="([^"]+)"[^>]*ToSheet="([^"]+)"/gi;
  const edges = [];
  while ((m = connRe.exec(src)) !== null) edges.push({ from: m[1], to: m[2] });
  if (!shapes.size) throw new Error('No Visio Shape elements found.');
  const id = (s) => 'v_' + s.replace(/[^A-Za-z0-9_]/g, '_');
  const out = ['flowchart TD'];
  for (const [sid, label] of [...shapes.entries()].slice(0, 50)) out.push(`  ${id(sid)}["${label}"]`);
  edges.slice(0, 60).forEach(e => { if (shapes.has(e.from) && shapes.has(e.to)) out.push(`  ${id(e.from)} --> ${id(e.to)}`); });
  return out.join('\n') + '\n';
}

export function parseGliffyToMermaid(src) {
  let doc; try { doc = JSON.parse(src); } catch { throw new Error('Invalid Gliffy JSON. Expect { stage: { objects: [...] } }.'); }
  const objects = doc?.stage?.objects || doc?.objects || [];
  if (!Array.isArray(objects) || !objects.length) throw new Error('No Gliffy objects found.');
  const id = (s) => 'g_' + String(s).replace(/[^A-Za-z0-9_]/g, '_');
  const out = ['flowchart TD'];
  objects.slice(0, 50).forEach((o, i) => {
    const label = String(o?.text || o?.graphic?.Text?.content || o?.id || `Node ${i}`).replace(/"/g, "'").slice(0, 48);
    out.push(`  ${id(o.id ?? i)}["${label}"]`);
  });
  // gliffy lines: objects with graphic type Line
  objects.forEach(o => {
    const c = o?.constraints;
    if (c?.startNode != null && c?.endNode != null) out.push(`  ${id(c.startNode)} --> ${id(c.endNode)}`);
  });
  return out.join('\n') + '\n';
}

export function parseExcalidrawToMermaid(src) {
  let doc; try { doc = JSON.parse(src); } catch { throw new Error('Invalid Excalidraw JSON. Expect { elements: [...] }.'); }
  const els = doc?.elements || [];
  if (!Array.isArray(els) || !els.length) throw new Error('No Excalidraw elements found.');
  const texts = new Map();
  els.filter(e => e.type === 'text').forEach(t => texts.set(t.id, String(t.text || t.originalText || '').slice(0, 40)));
  const shapes = els.filter(e => ['rectangle', 'ellipse', 'diamond'].includes(e.type));
  if (!shapes.length) throw new Error('No Excalidraw shapes (rectangle/ellipse/diamond) found.');
  const boundText = (s) => {
    const b = s.boundElements?.find(b => b.type === 'text');
    return b ? texts.get(b.id) || `Node ${s.id.slice(0, 4)}` : `Node ${s.id.slice(0, 4)}`;
  };
  const id = (s) => 'x_' + String(s).replace(/[^A-Za-z0-9_]/g, '_').slice(0, 16);
  const out = ['flowchart TD'];
  shapes.slice(0, 50).forEach(s => out.push(`  ${id(s.id)}["${String(boundText(s)).replace(/"/g, "'")}"]`));
  els.filter(e => e.type === 'arrow').slice(0, 60).forEach(a => {
    const from = shapes.find(s => Math.abs((s.x + s.width / 2) - a.x) < s.width && Math.abs((s.y + s.height / 2) - a.y) < s.height * 2);
    if (from) {
      const others = shapes.filter(s => s.id !== from.id);
      const to = others[0];
      if (to) out.push(`  ${id(from.id)} --> ${id(to.id)}`);
    }
  });
  return out.join('\n') + '\n';
}
// @ts-nocheck
