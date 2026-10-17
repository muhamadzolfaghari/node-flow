/**
 * CSV / TSV / semicolon / pipe tabular data to Mermaid (expanded).
 * Header synonyms: from/source/src, to/target/dst, label/action/event/edge.
 */

export function parseCsvToMermaid(csvText) {
  if (!csvText || typeof csvText !== 'string') {
    throw new Error('Please provide CSV data to convert.');
  }

  const rawLines = csvText.split(/\r?\n/).map(l => l.trimEnd()).filter(l => l.trim().length > 0 && !l.trim().startsWith('#'));
  if (rawLines.length < 2) throw new Error('CSV requires at least a header row and one data row.');

  // Detect delimiter from header
  const headerLine = rawLines[0];
  const counts = { ',': headerLine.split(',').length, ';': headerLine.split(';').length, '\t': headerLine.split('\t').length, '|': headerLine.split('|').length };
  let delimiter = ',';
  let best = 0;
  for (const [d, c] of Object.entries(counts)) if (c > best) { best = c; delimiter = d; }

  const splitRow = (line) => {
    // minimal quoted-field support
    const cells = []; let cur = ''; let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { q = !q; continue; }
      if (ch === delimiter && !q) { cells.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    cells.push(cur.trim());
    return cells;
  };

  const headers = splitRow(headerLine).map(h => h.trim().toLowerCase());
  const rows = rawLines.slice(1, 101).map(splitRow);

  // ER mode
  if (headers.some(h => /table|entity/.test(h)) && headers.some(h => /col|field|prop|attr/.test(h))) {
    return generateErFromCsv(headers, rows);
  }

  return generateFlowchartFromCsv(headers, rows);
}

function colIdx(headers, ...names) {
  for (const n of names) {
    const i = headers.findIndex(h => h === n || h.includes(n));
    if (i !== -1) return i;
  }
  return -1;
}

function generateFlowchartFromCsv(headers, rows) {
  const fromI = colIdx(headers, 'from', 'source', 'src', 'start');
  const toI = colIdx(headers, 'to', 'target', 'dst', 'dest', 'end');
  const labelI = colIdx(headers, 'label', 'action', 'event', 'edge', 'name', 'verb');
  const fi = fromI === -1 ? 0 : fromI;
  const ti = toI === -1 ? 1 : toI;
  const output = ['flowchart LR'];
  const safe = (s) => (s || '').replace(/"/g, "'").slice(0, 60);
  rows.forEach(cols => {
    if (cols.length < 2 && fi === 0 && ti === 1 && cols.length < 2) return;
    const from = (cols[fi] || '').trim(); const to = (cols[ti] || '').trim();
    if (!from || !to) return;
    const fromId = from.replace(/[^\w\d_-]/g, '_').slice(0, 24) || 'A';
    const toId = to.replace(/[^\w\d_-]/g, '_').slice(0, 24) || 'B';
    const label = labelI !== -1 ? safe(cols[labelI]) : safe(cols[2] || '');
    if (label) output.push(`  ${fromId}["${safe(from)}"] -->|"${label}"| ${toId}["${safe(to)}"]`);
    else output.push(`  ${fromId}["${safe(from)}"] --> ${toId}["${safe(to)}"]`);
  });
  if (output.length < 2) throw new Error('No valid source,target rows found.');
  return output.join('\n') + '\n';
}

function generateErFromCsv(headers, rows) {
  const tableIdx = headers.findIndex(h => h.includes('table') || h.includes('entity'));
  const colIdx = headers.findIndex(h => h.includes('col') || h.includes('field') || h.includes('prop'));
  const typeIdx = headers.findIndex(h => h.includes('type'));
  const keyIdx = headers.findIndex(h => h.includes('key') || h.includes('constraint'));
  const tables = {};
  rows.forEach(cols => {
    const tableName = (cols[tableIdx] || 'ENTITY').replace(/[^\w\d_]/g, '_').toUpperCase();
    const colName = (cols[colIdx] || 'id').replace(/[^\w\d_]/g, '_');
    const colType = (typeIdx !== -1 && cols[typeIdx]) ? cols[typeIdx].replace(/[^\w\d_]/g, '_') : 'string';
    const key = (keyIdx !== -1 && cols[keyIdx]) ? cols[keyIdx].toUpperCase() : '';
    if (!tables[tableName]) tables[tableName] = [];
    tables[tableName].push({ colName, colType, key });
  });
  const output = ['erDiagram'];
  for (const [tableName, fields] of Object.entries(tables)) {
    output.push(`  ${tableName} {`);
    fields.forEach(f => output.push(`    ${f.colType} ${f.colName}${f.key ? ` ${f.key}` : ''}`));
    output.push('  }');
  }
  return output.join('\n') + '\n';
}
// @ts-nocheck
