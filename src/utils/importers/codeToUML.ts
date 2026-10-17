/**
 * Code → Mermaid Class Diagram Converter (expanded)
 * Supports: TS/JS, Python, Java, C#, Go, Rust, Kotlin, Swift, PHP, Ruby, C++, C.
 * Best-effort: classes, structs, interfaces, enums, generics, decorators, relations.
 */

export function parseCodeToClassDiagram(code) {
  if (!code || typeof code !== 'string') {
    throw new Error('Please provide source code to convert.');
  }

  const classes = {}; // name -> {fields, methods, parents, interfaces, stereotype}
  const ensure = (n, stereo) => {
    if (!classes[n]) classes[n] = { fields: [], methods: [], parents: [], interfaces: [], stereotype: stereo || '' };
    return classes[n];
  };

  const clean = code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '')
    .replace(/#.*/g, '')
    .replace(/"""[\s\S]*?"""/g, '')
    .replace(/'''[\s\S]*?'''/g, '');

  let m;
  // TS/JS/Kotlin/Swift class
  const tsClassRe = /(?:export\s+|public\s+|open\s+|data\s+)?(?:abstract\s+)?class\s+(\w+)(?:<[^>]*>)?(?:\s+extends\s+([\w.]+))?(?:\s*:\s*([\w.,\s()]+?))?(?:\s+implements\s+([\w,\s]+))?\s*[{(:]/g;
  while ((m = tsClassRe.exec(clean)) !== null) {
    const name = m[1];
    if (/^(if|for|while|switch|catch|return)$/.test(name)) continue;
    const c = ensure(name);
    if (m[2]) c.parents.push(m[2].split('.').pop().split('<')[0]);
    const ifs = [m[3], m[4]].filter(Boolean).join(',').split(',').map(s => s.trim().split('<')[0].split('(')[0]).filter(s => s && /^[A-Z]/.test(s) && s !== name);
    ifs.forEach(i => { if (!c.interfaces.includes(i)) c.interfaces.push(i); });
  }
  // Python
  const pyClassRe = /class\s+(\w+)(?:\(([\w,\s]*)\))?:/g;
  while ((m = pyClassRe.exec(clean)) !== null) {
    const c = ensure(m[1]);
    if (m[2]) m[2].split(',').map(s => s.trim()).filter(s => s && s !== 'object').forEach(p => c.parents.push(p.split('[')[0]));
  }
  // Java/C#/PHP interface/enum
  const javaClassRe = /(?:public|private|protected|abstract|static|final|sealed)?\s*(class|interface|enum|record)\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([\w,\s]+))?/g;
  while ((m = javaClassRe.exec(clean)) !== null) {
    const c = ensure(m[2], m[1] === 'interface' ? 'interface' : m[1] === 'enum' ? 'enumeration' : '');
    if (m[3] && !c.parents.includes(m[3])) c.parents.push(m[3]);
    if (m[4]) m[4].split(',').map(s => s.trim()).filter(Boolean).forEach(i => { if (!c.interfaces.includes(i)) c.interfaces.push(i); });
  }
  // Go struct + interface
  const goStructRe = /type\s+(\w+)\s+(struct\s*\{|interface\s*\{)/g;
  while ((m = goStructRe.exec(clean)) !== null) ensure(m[1], /interface/.test(m[2]) ? 'interface' : '');
  // Rust struct/enum/trait
  const rustRe = /(?:pub\s+)?(struct|enum|trait)\s+(\w+)/g;
  while ((m = rustRe.exec(clean)) !== null) ensure(m[2], m[1] === 'trait' ? 'interface' : m[1] === 'enum' ? 'enumeration' : '');
  // Ruby class/module
  const rubyRe = /^(?:class|module)\s+(\w+(?:::\w+)*)/gm;
  while ((m = rubyRe.exec(clean)) !== null) {
    const name = m[1].split('::').pop();
    const sup = clean.slice(m.index, m.index + 120).match(/<\s*(\w+)/);
    const c = ensure(name);
    if (sup) c.parents.push(sup[1]);
  }
  // C++ class/struct
  const cppRe = /(?:class|struct)\s+(\w+)(?:\s*:\s*(?:public|private|protected)?\s*(\w+))?/g;
  while ((m = cppRe.exec(clean)) !== null) {
    const c = ensure(m[1]);
    if (m[2]) c.parents.push(m[2]);
  }
  // PHP class
  const phpRe = /class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([\w,\s\\]+))?/g;
  while ((m = phpRe.exec(clean)) !== null) {
    const c = ensure(m[1]);
    if (m[2]) c.parents.push(m[2].split('\\').pop());
    if (m[3]) m[3].split(',').map(s => s.trim().split('\\').pop()).filter(Boolean).forEach(i => { if (!c.interfaces.includes(i)) c.interfaces.push(i); });
  }

  // Field extraction per class body
  const classNames = Object.keys(classes);
  for (const className of classNames) {
    const startRe = new RegExp(`\\b(?:class|struct|interface|enum|trait|module)\\s+${className}\\b`);
    const startIdx = clean.search(startRe);
    if (startIdx === -1) continue;
    let nextIdx = clean.length;
    for (const other of classNames) {
      if (other === className) continue;
      const oi = clean.search(new RegExp(`\\b(?:class|struct|interface|enum|trait|module)\\s+${other}\\b`));
      if (oi > startIdx && oi < nextIdx) nextIdx = oi;
    }
    const body = clean.slice(startIdx, nextIdx);
    const pushField = (name, type, vis) => {
      if (!name || ['constructor', 'return', 'const', 'let', 'var', 'func'].includes(name)) return;
      if (!classes[className].fields.some(f => f.name === name)) {
        classes[className].fields.push({ name, type: String(type || 'any').replace(/[<>[\] ]/g, '').slice(0, 20) || 'any', vis: vis || '+' });
      }
    };
    const pushMethod = (name, args, vis) => {
      if (!name || ['if', 'for', 'while', 'switch', 'catch', 'return'].includes(name)) return;
      if (!classes[className].methods.some(x => x.name === name)) {
        classes[className].methods.push({ name, args: String(args || '').slice(0, 30), vis: vis || '+' });
      }
    };
    let fm;
    // TS/Kotlin/Swift fields: name: Type / val/var name: Type / let/var
    const fieldRes = [
      /(?:(?:public|private|protected|readonly|static|override|open|val|var|let)\s+)*(\w+)\s*(?:\?\s*)?:\s*([\w<>\[\]?|&, ]+)\s*(?:=|;|,|\n)/g,
      /self\.(\w+)\s*=/g,
      /(\w+)\s*:\s*([\w\[\], |]+)\s*=/g,
      /(?:(?:public|private|protected|static|final|readonly)\s+)+(\w+(?:<[\w<>, ]+>)?(?:\[\])?)\s+(\w+)\s*(?:=|;)/g,
      /(?:val|var)\s+(\w+)\s*:\s*([\w<>?]+)/g,
      /(?:let|var)\s+(\w+)\s*:\s*([\w<>?\[\]]+)/g,
      /\$\w+\s*->\s*(\w+)\s*;/g,
      /(\w+)\s*=\s*attr_accessor/g,
    ];
    for (const re of fieldRes) {
      const local = new RegExp(re.source, 'g');
      while ((fm = local.exec(body)) !== null) {
        if (fm.length === 2) pushField(fm[1], 'Any', fm[1].startsWith('_') ? '-' : '+');
        else if (/self/.test(re.source) && fm[1]) pushField(fm[1], 'Any', '+');
        else if (fm[1] && fm[2] && /^[A-Z]/.test(fm[1]) === false && fm[1].length < 30) {
          // java-style is Type name (groups swapped)
          if (/(public|private|protected|static|final|readonly)/.test(body.slice(Math.max(0, fm.index - 40), fm.index)) && /^[A-Z]/.test(fm[1])) pushField(fm[2], fm[1], '+');
          else pushField(fm[1], fm[2], fm[1].startsWith('_') ? '-' : '+');
        }
      }
    }
    // Go struct fields: Name Type `tag`
    const goFieldRe = /^\s*(\w+)\s+([\w*\[\].]+)(?:\s+`[^`]*`)?\s*$/gm;
    while ((fm = goFieldRe.exec(body)) !== null) {
      if (/^(type|func|return|if|for)$/.test(fm[1])) continue;
      pushField(fm[1], fm[2].replace('*', ''), /^[A-Z]/.test(fm[1]) ? '+' : '-');
    }
    // methods
    const methodRes = [
      /(?:(?:public|private|protected|static|async|override|abstract|open|func)\s+)*(\w+)\s*\(([^)]*)\)\s*(?::\s*[\w<>\[\]?|& ,]+)?\s*(?:\{|=>)/g,
      /def\s+(\w+)\s*\(([^)]*)\)\s*(?:->\s*[\w\[\], |]+)?\s*:/g,
      /fn\s+(\w+)\s*\(([^)]*)\)/g,
      /func\s+(?:\([^)]*\)\s+)?(\w+)\s*\(([^)]*)\)/g,
    ];
    for (const re of methodRes) {
      const local = new RegExp(re.source, 'g');
      while ((fm = local.exec(body)) !== null) {
        const vis = fm[1].startsWith('_') ? '-' : '+';
        pushMethod(fm[1], (fm[2] || '').replace(/self,?\s*/, ''), vis);
      }
    }
  }

  if (!Object.keys(classes).length) {
    throw new Error('No classes, structs, or interfaces detected in the source code.');
  }

  const lines = ['classDiagram'];
  for (const [cname, data] of Object.entries(classes)) {
    if (data.stereotype) lines.push(`  class ${cname} {\n    <<${data.stereotype}>>`);
    else lines.push(`  class ${cname} {`);
    data.fields.slice(0, 12).forEach(f => lines.push(`    ${f.vis}${f.type} ${f.name}`));
    data.methods.slice(0, 10).forEach(me => lines.push(`    ${me.vis}${me.name}(${me.args})`));
    lines.push('  }');
  }
  for (const [cname, data] of Object.entries(classes)) {
    data.parents.forEach(p => { if (classes[p]) lines.push(`  ${p} <|-- ${cname}`); });
    data.interfaces.forEach(i => { if (classes[i]) lines.push(`  ${i} <|.. ${cname} : implements`); });
  }
  return lines.join('\n') + '\n';
}
