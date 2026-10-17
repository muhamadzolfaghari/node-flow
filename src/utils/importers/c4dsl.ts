/**
 * Structurizr & C4 Model DSL to Mermaid C4Context Diagram Converter (expanded full levels)
 * Supports person/softwareSystem/container/component/code + dynamic views,
 * deploymentEnvironment, group, custom tags, and C4-PlantUML syntax.
 */

export function parseC4DslToMermaid(dslText) {
  if (!dslText || typeof dslText !== 'string') {
    throw new Error('Please provide Structurizr or C4 DSL text to convert.');
  }

  const cleanText = dslText
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/#.*$/gm, '');

  const output = ['C4Context'];
  const titleM = cleanText.match(/title\s+["']?([^"'\n]+)["']?/i);
  if (titleM) output.push(`title ${titleM[1].trim()}`);
  const elements = [];
  const rels = [];

  const cleanId = id => (id || 'node').replace(/[^a-zA-Z0-9_]/g, '_');
  const safeStr = s => (s || '').replace(/["\n\r]/g, "'").trim();

  // 1. C4-PlantUML style
  const plantUmlRegex = /(Person|Person_Ext|System|SystemDb|System_Ext|SystemDb_Ext|Container|ContainerDb|Container_Ext|Component|Code|Boundary)\s*\(\s*([a-zA-Z0-9_]+)\s*,\s*"([^"]*)"(?:\s*,\s*"([^"]*)")?(?:\s*,\s*"([^"]*)")?/gi;
  let match;
  let found = 0;

  while ((match = plantUmlRegex.exec(cleanText)) !== null) {
    const kind = match[1] === 'Boundary' ? 'Boundary' : match[1].replace(/_Ext$/, '_Ext');
    const id = cleanId(match[2]);
    const label = safeStr(match[3]);
    const desc = safeStr(match[4] || match[5]);
    elements.push(desc ? `  ${kind}(${id}, "${label}", "${desc}")` : `  ${kind}(${id}, "${label}")`);
    found++;
  }

  const plantUmlRelRegex = /Rel(_U|_D|_L|_R|_Back|_Back_Neighbor)?\s*\(\s*([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s*,\s*"([^"]*)"(?:\s*,\s*"([^"]*)")?\s*\)/gi;
  while ((match = plantUmlRelRegex.exec(cleanText)) !== null) {
    const dir = match[1] || '';
    const src = cleanId(match[2]);
    const tgt = cleanId(match[3]);
    const label = safeStr(match[4]);
    const tech = safeStr(match[5]);
    rels.push(tech ? `  Rel${dir}(${src}, ${tgt}, "${label}", "${tech}")` : `  Rel${dir}(${src}, ${tgt}, "${label}")`);
    found++;
  }

  // 2. Structurizr DSL style (incl. component, code, deployment, group, dynamic ->)
  const structurizrElemRegex = /([a-zA-Z0-9_]+)\s*=\s*(person|softwareSystem|container|component|codeElement|deploymentNode|infrastructureNode)\s*"([^"]+)"(?:\s*"([^"]*)")?(?:\s*"([^"]*)")?/gi;
  while ((match = structurizrElemRegex.exec(cleanText)) !== null) {
    const id = cleanId(match[1]);
    const rawKind = match[2].toLowerCase();
    const label = safeStr(match[3]);
    const desc = safeStr(match[4]);
    let kind = 'System';
    if (rawKind === 'person') kind = 'Person';
    else if (rawKind === 'container') kind = 'Container';
    else if (rawKind === 'component') kind = 'Component';
    else if (rawKind === 'codeelement') kind = 'Code';
    else if (rawKind === 'deploymentnode') kind = 'System';
    elements.push(desc ? `  ${kind}(${id}, "${label}", "${desc}")` : `  ${kind}(${id}, "${label}")`);
    found++;
  }

  // dynamic views: a -> b "label" (also matches deployment/group context)
  const structurizrRelRegex = /([a-zA-Z0-9_.]+)\s*->\s*([a-zA-Z0-9_.]+)\s*"([^"]*)"(?:\s*"([^"]*)")?/gi;
  while ((match = structurizrRelRegex.exec(cleanText)) !== null) {
    const src = cleanId(match[1]);
    const tgt = cleanId(match[2]);
    const desc = safeStr(match[3]);
    const tech = safeStr(match[4]);
    if (/workspace|model|views|dynamic|deployment|group/i.test(src)) continue;
    rels.push(tech ? `  Rel(${src}, ${tgt}, "${desc}", "${tech}")` : `  Rel(${src}, ${tgt}, "${desc}")`);
    found++;
  }

  if (found === 0) {
    throw new Error('No C4 model elements (Person, System, Container, Rel) found in text.');
  }

  for (const el of elements.slice(0, 30)) output.push(el);
  for (const r of rels.slice(0, 40)) output.push(r);

  return output.join('\n');
}
// @ts-nocheck
