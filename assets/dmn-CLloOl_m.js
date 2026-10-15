function m(i){if(!i||typeof i!="string")throw new Error("Please provide DMN text.");const o=["flowchart TD"],s=e=>"dmn_"+e.replace(/[^A-Za-z0-9_]/g,"_").slice(0,24);if(/<definitions|<decision\b/i.test(i)){const e=/<decision\b[^>]*id="([^"]+)"[^>]*name="([^"]*)"/gi,n=[];let t;for(;(t=e.exec(i))!==null;)n.push({id:t[1],name:t[2]||t[1]});const h=/<informationRequirement>[\s\S]*?<requiredDecision[^>]*href="#([^"]+)"/gi,f=[];for(;(t=h.exec(i))!==null;)f.push(t[1]);if(!n.length)throw new Error("No DMN decision elements found.");return n.slice(0,20).forEach(r=>o.push(`  ${s(r.id)}{"${r.name.replace(/"/g,"'")}"}`)),f.slice(0,30).forEach((r,d)=>{const l=n[d%n.length],u=n.find(a=>a.id===r);l&&u&&l.id!==r&&o.push(`  ${s(l.id)} --> ${s(r)}`)}),o.join(`
`)+`
`}const c=i.split(`
`).map(e=>e.trim()).filter(Boolean).filter(e=>/when|if|then|rule/i.test(e)).slice(0,15);if(!c.length)throw new Error('No DMN rules found. Use XML or "when X then Y" lines.');return o.push('  D0(["Input"])'),c.forEach((e,n)=>o.push(`  D0 --> D${n+1}["${e.slice(0,60).replace(/"/g,"'")}"]`)),o.join(`
`)+`
`}export{m as parseDmnToMermaid};
//# sourceMappingURL=dmn-CLloOl_m.js.map
