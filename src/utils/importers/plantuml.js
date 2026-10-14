/**
 * PlantUML -> Mermaid Diagram Converter Engine (expanded full grammar)
 * Converts sequence, class, state, activity, usecase, deployment, object, timing
 * into clean Mermaid syntax. Strips skinparam, macros,Salt, styling.
 */

export function parsePlantUmlToMermaid(pumlText) {
  if (!pumlText || typeof pumlText !== 'string') {
    throw new Error('Please provide PlantUML text to convert.');
  }

  // Strip @startuml/@enduml wrappers, skinparam, macros, Salt blocks, notes styling
  const cleanLines = pumlText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => {
      if (!line) return false;
      if (line.startsWith('@startuml') || line.startsWith('@enduml')) return false;
      if (/^skinparam/i.test(line)) return false;
      if (/^!|^hide |^show /i.test(line)) return false;
      if (/^salt\b/i.test(line)) return false;
      return true;
    });

  const joined = cleanLines.join('\n');
  const isClass = /class\s+\w+|\binterface\s+\w+|enum\s+\w+|<\|--|\*--|o--|\.\.>/i.test(joined) && !/^(participant|actor|boundary|control|entity|database)\s/m.test(joined);
  const isState = /\[\*\]\s*-->|state\s+\w+/i.test(joined);
  const isUsecase = /\bactor\b.*\b(usecase|use case)\b|\(.*\)\s*--|\bactor\b/i.test(joined) && /usecase|\(.+\)/i.test(joined);
  const isActivity = /^\s*(:|start|stop|if\s*\(|fork|split|detach)/im.test(joined) || /\bpartition\b/i.test(joined);
  const isDeployment = /\bnode\b|\bartifact\b|\bdevice\b|\bcomponent\s*\[|\bdeployment\b/i.test(joined);
  const isObject = /\bobject\b\s+\w+/i.test(joined);
  const isSequence = /->|-->|participant|actor|boundary|control|entity|database|autonumber/i.test(joined);

  if (isClass) return convertPlantUmlClassToMermaid(cleanLines);
  if (isState) return convertPlantUmlStateToMermaid(cleanLines);
  if (isActivity) return convertPlantUmlActivityToMermaid(cleanLines);
  if (isUsecase) return convertPlantUmlUsecaseToMermaid(cleanLines);
  if (isDeployment) return convertPlantUmlDeploymentToMermaid(cleanLines);
  if (isObject) return convertPlantUmlObjectToMermaid(cleanLines);
  if (isSequence) return convertPlantUmlSequenceToMermaid(cleanLines);
  // default: activity-ish if colons/arrows, else sequence
  if (/^\s*:/m.test(joined)) return convertPlantUmlActivityToMermaid(cleanLines);
  return convertPlantUmlSequenceToMermaid(cleanLines);
}

function convertPlantUmlSequenceToMermaid(lines) {
  const output = ['sequenceDiagram'];

  for (const line of lines) {
    if (!line || line.startsWith('\'')) continue; // Skip comments

    if (/^autonumber/i.test(line)) { output.push('  autonumber'); continue; }
    if (/^activate\s+/i.test(line)) {
      const m = line.match(/^activate\s+(\w+)/i);
      if (m) output.push(`  activate ${m[1]}`);
      continue;
    }
    if (/^deactivate\s+/i.test(line)) {
      const m = line.match(/^deactivate\s+(\w+)/i);
      if (m) output.push(`  deactivate ${m[1]}`);
      continue;
    }
    if (/^create\s+/i.test(line)) {
      const m = line.match(/^create\s+(\w+)/i);
      if (m) output.push(`  create participant ${m[1]}`);
      continue;
    }
    if (/^destroy\s+/i.test(line)) {
      const m = line.match(/^destroy\s+(\w+)/i);
      if (m) output.push(`  destroy ${m[1]}`);
      continue;
    }

    // Participant / Actor definitions: participant "Display Name" as Id
    const partMatch = line.match(/^(participant|actor|boundary|control|entity|database|collections)\s+(?:"([^"]+)"|(\S+))(?:\s+as\s+(\w+))?/i);
    if (partMatch) {
      const type = partMatch[1].toLowerCase() === 'actor' ? 'actor' : 'participant';
      const label = partMatch[2] || partMatch[3];
      const alias = partMatch[4] || (partMatch[2] ? label.replace(/[^A-Za-z0-9_]/g, '_') : label);
      if (alias !== label) output.push(`  ${type} ${alias} as ${label}`);
      else output.push(`  ${type} ${alias}`);
      continue;
    }

    // Notes: note (left of|right of|over) Target: text
    const noteMatch = line.match(/^note\s+(left of|right of|over)\s+([^:]+)(?::\s*(.*))?$/i);
    if (noteMatch) {
      output.push(`  Note ${noteMatch[1].trim()} ${noteMatch[2].trim()}: ${(noteMatch[3] || '').trim()}`);
      continue;
    }
    // box ... end box grouping
    if (/^box\b/i.test(line)) { output.push(`  box ${line.replace(/^box\s*/i, '')}`); continue; }
    if (/^end\s*box/i.test(line)) { output.push('  end'); continue; }

    // Alt / Else / Opt / Loop / Par / Break / Critical / Group
    if (/^(alt|else|opt|loop|par|break|critical|group|rect)\b/i.test(line)) { output.push(`  ${line}`); continue; }
    if (/^end\b/i.test(line)) { output.push('  end'); continue; }
    if (/^and\b/i.test(line)) { output.push('  and'); continue; }

    // Arrows: A -> B: Message => A->>B ; A --> B => A-->>B ; A ->> B => A-)B (async)
    const arrow2 = line.match(/^([\w\d_.@-]+)\s*(-->|->>|-->>|->)\s*([\w\d_.@-]+)\s*(?::\s*(.*))?$/);
    if (arrow2) {
      const from = arrow2[1]; const op = arrow2[2]; const to = arrow2[3]; const msg = (arrow2[4] || '').trim();
      let mermaidArrow = '->>';
      if (op === '-->') mermaidArrow = '-->>';
      if (op === '->>') mermaidArrow = '-)';
      if (op === '-->>') mermaidArrow = '--)';
      output.push(`  ${from}${mermaidArrow}${to}: ${msg}`);
      continue;
    }
    output.push(`  ${line}`);
    continue;
  }

  return output.join('\n') + '\n';
}

function convertPlantUmlClassToMermaid(lines) {
  const output = ['classDiagram'];
  for (const line of lines) {
    if (!line || line.startsWith('\'')) continue;
    // enum/interface/object declarations pass through
    if (/<\|--|\*--|o--|\.\.>|-->|<\|..|..\|>/.test(line)) { output.push(`  ${line.replace(/</g, '<').replace(/~/g, '~')}`); continue; }
    // class Foo { -> class Foo {
    // hide/show lines skipped already
    if (/^(hide|show)\b/i.test(line)) continue;
    output.push(`  ${line.replace(/<(\w+)>/g, '~$1~')}`);
  }
  return output.join('\n') + '\n';
}

function convertPlantUmlStateToMermaid(lines) {
  const output = ['stateDiagram-v2'];
  for (const line of lines) {
    if (!line || line.startsWith('\'')) continue;
    if (/^(hide|show)\b/i.test(line)) continue;
    // state "Long name" as S1 -> state "Long name" as S1 (mermaid supports)
    output.push(`  ${line}`);
  }
  return output.join('\n') + '\n';
}

function convertPlantUmlActivityToMermaid(lines) {
  const out = ['flowchart TD'];
  let n = 0;
  const nid = () => `P${++n}`;
  const map = new Map(); // label -> id
  const getId = (label) => {
    const k = label.slice(0, 40);
    if (!map.has(k)) map.set(k, nid());
    return map.get(k);
  };
  out.push('  START((Start))');
  let prev = 'START';
  for (const line of lines) {
    if (!line || line.startsWith('\'')) continue;
    let m;
    if (/^(start)\b/i.test(line)) continue;
    if (/^(stop|end)\b/i.test(line)) { out.push(`  ${prev} --> STOP((Stop))`); prev = 'STOP'; continue; }
    if ((m = line.match(/^:\s*(.+?)\s*;?\s*$/))) {
      const id = getId(m[1]);
      out.push(`  ${id}["${m[1].slice(0, 60).replace(/"/g, "'")}"]`);
      out.push(`  ${prev} --> ${id}`);
      prev = id;
      continue;
    }
    if ((m = line.match(/^if\s*\((.+?)\)\s*(then)?/i))) {
      const id = getId(m[1]);
      out.push(`  ${id}{"${m[1].slice(0, 50).replace(/"/g, "'")}"}`);
      out.push(`  ${prev} --> ${id}`);
      prev = id;
      continue;
    }
    if (/^(else|elseif|endif)/i.test(line)) continue;
    if (/^(fork|split)/i.test(line)) { out.push(`  ${prev} --> FORK${n}[===== fork =====]`); prev = `FORK${n}`; continue; }
    if (/^(join|end\s*fork|end\s*split)/i.test(line)) { out.push(`  ${prev} --> JOIN${n}[===== join =====]`); prev = `JOIN${n}`; continue; }
    if ((m = line.match(/^partition\s+(.+?)\s*\{?$/i))) {
      out.push(`  subgraph PART${n} ["${m[1].replace(/"/g, "'")}"]`);
      continue;
    }
    if (line === '}') { out.push('  end'); continue; }
    if (/detach/i.test(line)) { out.push(`  ${prev} --> DETACHED((X))`); continue; }
    const am = line.match(/^([\w\s"]+)\s*(->|-->)\s*([\w\s"]+)\s*(?::\s*(.*))?$/);
    if (am) {
      const a = getId(am[1].trim()); const b = getId(am[3].trim());
      out.push(`  ${a} -->${am[4] ? `|"${am[4].slice(0, 30)}"|` : ''} ${b}`);
      continue;
    }
  }
  return out.join('\n') + '\n';
}

function convertPlantUmlUsecaseToMermaid(lines) {
  const out = ['flowchart LR'];
  const seen = new Set();
  const id = (s) => 'U' + s.replace(/[^A-Za-z0-9_]/g, '_').slice(0, 20);
  for (const line of lines) {
    if (!line || line.startsWith('\'')) continue;
    let m;
    if ((m = line.match(/^actor\s+(?:"([^"]+)"|(\S+))(?:\s+as\s+(\w+))?/i))) {
      const label = m[1] || m[2]; const alias = m[3] || label.replace(/[^A-Za-z0-9_]/g, '_');
      if (!seen.has(alias)) { out.push(`  ${id(alias)}((👤 ${label.replace(/"/g, "'")}))`); seen.add(alias); }
      continue;
    }
    if ((m = line.match(/^(?:usecase\s+)?\((.+?)\)(?:\s+as\s+(\w+))?/i))) {
      const label = m[1]; const alias = m[2] || label.replace(/[^A-Za-z0-9_]/g, '_').slice(0, 16);
      if (!seen.has(alias)) { out.push(`  ${id(alias)}(["${label.replace(/"/g, "'")}"])`); seen.add(alias); }
      continue;
    }
    if ((m = line.match(/^(\S+)\s*(--|..>)\s*(\S+)\s*(?::\s*(.*))?$/))) {
      const a = id(m[1].replace(/[()]/g, '')); const b = id(m[3].replace(/[()]/g, ''));
      out.push(m[4] ? `  ${a} -.->|"${m[4].slice(0, 30)}"| ${b}` : `  ${a} --> ${b}`);
      continue;
    }
  }
  return out.join('\n') + '\n';
}

function convertPlantUmlDeploymentToMermaid(lines) {
  const out = ['flowchart TB'];
  for (const line of lines) {
    if (!line || line.startsWith('\'')) continue;
    let m;
    if ((m = line.match(/^(node|device|artifact|component|database|cloud)\s+(?:"([^"]+)"|(\S+))(?:\s+as\s+(\w+))?/i))) {
      const label = m[2] || m[3]; const alias = m[4] || label.replace(/[^A-Za-z0-9_]/g, '_');
      out.push(`  ${alias}["⬢ ${label.replace(/"/g, "'")}"]`);
      continue;
    }
    if ((m = line.match(/^(\S+)\s*(-->|->|\.\.>|--)\s*(\S+)\s*(?::\s*(.*))?$/))) {
      out.push(m[4] ? `  ${m[1]} -->|"${m[4].slice(0, 30)}"| ${m[3]}` : `  ${m[1]} --> ${m[3]}`);
      continue;
    }
    if (/^\w/.test(line)) out.push(`  ' ${line}`);
  }
  return out.join('\n') + '\n';
}

function convertPlantUmlObjectToMermaid(lines) {
  const out = ['classDiagram'];
  for (const line of lines) {
    if (!line || line.startsWith('\'')) continue;
    const m = line.match(/^object\s+(?:"([^"]+)"|(\S+))(?:\s+as\s+(\w+))?/i);
    if (m) {
      const label = m[1] || m[2]; const alias = m[3] || label.replace(/[^A-Za-z0-9_]/g, '_');
      out.push(`  class ${alias} {`);
      out.push(`    :${label.replace(/"/g, "'")}`);
      out.push('  }');
      continue;
    }
    if (/-->|--|:/.test(line)) { out.push(`  ${line}`); continue; }
    out.push(`  ' ${line}`);
  }
  return out.join('\n') + '\n';
}
