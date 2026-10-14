/**
 * BPMN 2.0 XML to Mermaid Flowchart Converter (expanded: lanes, data objects,
 * message flows, subprocess, boundary events, text annotations).
 */

export function parseBpmnToMermaid(bpmnXmlText) {
  if (!bpmnXmlText || typeof bpmnXmlText !== 'string') {
    throw new Error('Please provide BPMN 2.0 XML text to convert.');
  }

  const output = ['flowchart TD'];
  const cleanId = id => 'bpmn_' + (id || 'node').replace(/[^a-zA-Z0-9_]/g, '_');
  const nodes = new Map();
  const edges = [];
  const lanes = new Map(); // laneSet id -> names

  // Lanes: laneSet / lane with flowNodeRef
  const laneRe = /<(?:\w+:)?lane\b[^>]*name="([^"]*)"[^>]*>([\s\S]*?)<\/(?:\w+:)?lane>/gi;
  let m;
  const laneMembers = new Map(); // nodeId -> laneName
  while ((m = laneRe.exec(bpmnXmlText)) !== null) {
    const laneName = m[1];
    const refs = [...m[2].matchAll(/<(?:\w+:)?flowNodeRef>([^<]+)<\/(?:\w+:)?flowNodeRef>/gi)].map(x => x[1].trim());
    refs.forEach(r => laneMembers.set(r, laneName));
  }

  const elementRegex = /<([a-zA-Z0-9]+:)?(startEvent|endEvent|task|userTask|serviceTask|scriptTask|sendTask|receiveTask|businessRuleTask|manualTask|exclusiveGateway|parallelGateway|inclusiveGateway|eventBasedGateway|subProcess|callActivity|dataObjectReference|dataStoreReference|textAnnotation)\b([^>]*)(?:\/?>|>([\s\S]*?)<\/\1?\2>)/gi;

  while ((m = elementRegex.exec(bpmnXmlText)) !== null) {
    const rawTag = m[2];
    const attrs = m[3];
    const innerContent = m[4] || '';
    const idMatch = attrs.match(/\bid=["']([^"']+)["']/i);
    const nameMatch = attrs.match(/\bname=["']([^"']+)["']/i);
    if (!idMatch) continue;
    const rawId = idMatch[1];
    const safeId = cleanId(rawId);
    let label = nameMatch ? nameMatch[1] : '';
    if (!label) {
      const innerName = innerContent.match(/<([a-zA-Z0-9]+:)?name\b[^>]*>([^<]+)<\/\1?name>/i);
      label = innerName ? innerName[2].trim() : rawTag.replace(/([A-Z])/g, ' $1').trim();
    }
    const cleanLabel = label.replace(/["\n\r]/g, ' ').trim();
    const lowerTag = rawTag.toLowerCase();
    let nodeSyntax = '';
    if (lowerTag.includes('startevent')) nodeSyntax = `${safeId}(["${cleanLabel || 'Start'}"])`;
    else if (lowerTag.includes('endevent')) nodeSyntax = `${safeId}(["${cleanLabel || 'End'}"])`;
    else if (lowerTag.includes('gateway')) nodeSyntax = `${safeId}{"🔷 ${cleanLabel || 'Decision'}"}`;
    else if (lowerTag.includes('usertask')) nodeSyntax = `${safeId}["👤 ${cleanLabel}"]`;
    else if (lowerTag.includes('servicetask')) nodeSyntax = `${safeId}["⚙️ ${cleanLabel}"]`;
    else if (lowerTag.includes('scripttask')) nodeSyntax = `${safeId}["📜 ${cleanLabel}"]`;
    else if (lowerTag.includes('sendtask')) nodeSyntax = `${safeId}["📤 ${cleanLabel}"]`;
    else if (lowerTag.includes('receivetask')) nodeSyntax = `${safeId}["📥 ${cleanLabel}"]`;
    else if (lowerTag.includes('businessruletask')) nodeSyntax = `${safeId}["📏 ${cleanLabel}"]`;
    else if (lowerTag.includes('manualtask')) nodeSyntax = `${safeId}["✋ ${cleanLabel}"]`;
    else if (lowerTag.includes('subprocess') || lowerTag.includes('callactivity')) nodeSyntax = `subgraph ${safeId} ["📦 ${cleanLabel}"]\n  end`;
    else if (lowerTag.includes('dataobject') || lowerTag.includes('datastore')) nodeSyntax = `${safeId}[("${cleanLabel}") ]`;
    else if (lowerTag.includes('textannotation')) nodeSyntax = `${safeId}["📝 ${cleanLabel.slice(0, 60)}"]`;
    else nodeSyntax = `${safeId}["📋 ${cleanLabel}"]`;
    nodes.set(safeId, { syntax: nodeSyntax, lane: laneMembers.get(rawId) });
    // boundary events attachedToRef
    const attached = attrs.match(/\battachedToRef=["']([^"']+)["']/i);
    if (attached) edges.push(`  ${safeId} -.->|boundary| ${cleanId(attached[1])}`);
  }

  // sequence flows
  const flowRegex = /<([a-zA-Z0-9]+:)?sequenceFlow\b([^>]*)/gi;
  while ((m = flowRegex.exec(bpmnXmlText)) !== null) {
    const attrs = m[2];
    const sourceMatch = attrs.match(/\bsourceRef=["']([^"']+)["']/i);
    const targetMatch = attrs.match(/\btargetRef=["']([^"']+)["']/i);
    const nameMatch = attrs.match(/\bname=["']([^"']+)["']/i);
    if (sourceMatch && targetMatch) {
      const flowName = nameMatch ? nameMatch[1].replace(/["\n\r]/g, ' ').trim() : '';
      edges.push(flowName ? `  ${cleanId(sourceMatch[1])} -->|"${flowName}"| ${cleanId(targetMatch[1])}` : `  ${cleanId(sourceMatch[1])} --> ${cleanId(targetMatch[1])}`);
    }
  }
  // message flows (dashed)
  const msgFlowRe = /<([a-zA-Z0-9]+:)?messageFlow\b([^>]*)/gi;
  while ((m = msgFlowRe.exec(bpmnXmlText)) !== null) {
    const attrs = m[2];
    const s = attrs.match(/\bsourceRef=["']([^"']+)["']/i);
    const t = attrs.match(/\btargetRef=["']([^"']+)["']/i);
    const n = attrs.match(/\bname=["']([^"']+)["']/i);
    if (s && t) edges.push(n ? `  ${cleanId(s[1])} -.->|"${n[1]}"| ${cleanId(t[1])}` : `  ${cleanId(s[1])} -.-> ${cleanId(t[1])}`);
  }
  // associations (dotted, for data objects/annotations)
  const assocRe = /<([a-zA-Z0-9]+:)?association\b[^>]*sourceRef=["']([^"']+)["'][^>]*targetRef=["']([^"']+)["']/gi;
  while ((m = assocRe.exec(bpmnXmlText)) !== null) edges.push(`  ${cleanId(m[2])} -.- ${cleanId(m[3])}`);

  if (nodes.size === 0 && edges.length === 0) {
    throw new Error('No BPMN 2.0 events, tasks, or sequence flows found in XML text.');
  }

  // group by lane
  const byLane = new Map();
  for (const [sid, n] of nodes) {
    const lane = n.lane || 'Process';
    if (!byLane.has(lane)) byLane.set(lane, []);
    byLane.get(lane).push(`  ${n.syntax}`);
  }
  if (byLane.size > 1) {
    for (const [lane, lines] of byLane) {
      output.push(`  subgraph LANE_${lane.replace(/[^A-Za-z0-9_]/g, '_')} ["🏊 ${lane.replace(/"/g, "'")}"]`);
      lines.forEach(l => output.push(l));
      output.push('  end');
    }
  } else {
    for (const n of nodes.values()) output.push(`  ${n.syntax}`);
  }
  for (const e of edges) output.push(e);

  return output.join('\n');
}
