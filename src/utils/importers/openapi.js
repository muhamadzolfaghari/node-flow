/**
 * OpenAPI / Swagger JSON Specification to Mermaid Diagram Converter (expanded)
 * Paths/methods → sequence; schemas/components → class notes + schema-driven messages.
 */

export function parseOpenApiToMermaid(specText) {
  if (!specText || typeof specText !== 'string') {
    throw new Error('Please provide OpenAPI JSON or YAML text to convert.');
  }

  let spec;
  try {
    spec = JSON.parse(specText);
  } catch (err) {
    throw new Error(`OpenAPI parser expects JSON: ${err.message}`);
  }

  const title = spec.info?.title || 'API Architecture';
  const paths = spec.paths || {};
  const schemas = spec.components?.schemas || spec.definitions || {};

  const output = ['sequenceDiagram'];
  output.push('  autonumber');
  output.push('  actor Client as "User / Client"');
  output.push('  participant Gateway as "API Gateway"');
  output.push('  participant Service as "Microservice Engine"');

  const pathEntries = Object.entries(paths).slice(0, 10);
  if (pathEntries.length === 0) {
    // schemas-only spec → class diagram instead
    const names = Object.keys(schemas).slice(0, 12);
    if (!names.length) throw new Error('No paths found in OpenAPI specification. Add paths: or components.schemas.');
    const cls = ['classDiagram'];
    names.forEach(n => {
      cls.push(`  class ${n} {`);
      const props = schemas[n]?.properties || {};
      Object.entries(props).slice(0, 8).forEach(([p, def]) => cls.push(`    +${(def.type || 'String')} ${p}`));
      cls.push('  }');
    });
    return cls.join('\n') + '\n';
  }

  pathEntries.forEach(([pathUrl, methods]) => {
    Object.entries(methods).forEach(([method, def]) => {
      if (typeof def !== 'object' || def === null) return;
      if (!['get', 'post', 'put', 'delete', 'patch', 'head', 'options'].includes(method.toLowerCase())) return;
      const upperMethod = method.toUpperCase();
      const summary = def.summary || def.operationId || `${upperMethod} ${pathUrl}`;
      const cleanSummary = String(summary).replace(/"/g, "'").slice(0, 40);
      output.push(`  Client->>Gateway: ${upperMethod} ${pathUrl}`);
      output.push(`  Gateway->>Service: Forward (${cleanSummary})`);
      const responses = def.responses || {};
      const successCode = Object.keys(responses).find(c => String(c).startsWith('2')) || '200';
      const rawDesc = responses[successCode]?.description || responses[successCode]?.content && Object.keys(responses[successCode].content)[0] || 'OK';
      const responseDesc = String(rawDesc).replace(/"/g, "'").slice(0, 30);
      // requestBody schema hint
      const bodySchema = def.requestBody?.content?.['application/json']?.schema?.$ref?.split('/').pop();
      if (bodySchema) output.push(`  Note over Gateway,Service: body: ${bodySchema}`);
      output.push(`  Service-->>Gateway: ${successCode} ${responseDesc}`);
      output.push(`  Gateway-->>Client: HTTP ${successCode} Response`);
    });
  });
  // schema notes (first 5)
  Object.keys(schemas).slice(0, 5).forEach(s => output.push(`  Note over Service: schema ${s}`));

  return output.join('\n') + '\n';
}
