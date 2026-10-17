/**
 * AsyncAPI Specification to Mermaid Diagram Converter (expanded v2/v3)
 * Channels + operations + message traits/payloads → sequence with payload notes.
 */

export function parseAsyncApiToMermaid(specText) {
  if (!specText || typeof specText !== 'string') {
    throw new Error('Please provide AsyncAPI JSON text to convert.');
  }

  let spec;
  try {
    spec = JSON.parse(specText);
  } catch (err) {
    throw new Error(`AsyncAPI parser expects JSON: ${err.message}`);
  }

  const appTitle = (spec.info?.title || 'Event Architecture').replace(/["\n]/g, "'");
  const channels = spec.channels || {};
  const operations = spec.operations || {};
  const channelEntries = Object.entries(channels);

  if (channelEntries.length === 0 && !Object.keys(operations).length) {
    throw new Error('No channels found in AsyncAPI specification.');
  }

  const output = ['sequenceDiagram'];
  output.push('  autonumber');
  output.push(`  participant App as "${appTitle}"`);
  output.push('  participant Broker as "Event Broker (Kafka/RabbitMQ)"');
  output.push('  participant Consumer as "Subscribed Consumer"');

  const msgLabel = (op) => {
    if (!op || typeof op !== 'object') return 'Event Message';
    const msg = op.message;
    if (!msg) return op.summary || op.title || 'Event Message';
    if (Array.isArray(msg)) return msg[0]?.name || msg[0]?.title || 'Event Message';
    if (typeof msg === 'object') {
      if (msg.$ref) return String(msg.$ref).split('/').pop();
      return msg.name || msg.title || msg.summary || 'Event Message';
    }
    return String(msg);
  };

  for (const [channelName, channelDef] of channelEntries.slice(0, 12)) {
    const cleanChan = String(channelName).replace(/["\n]/g, "'");
    const address = channelDef?.address || cleanChan;
    if (channelDef?.publish || channelDef?.subscribe || channelDef?.messages) {
      if (channelDef.publish) {
        output.push(`  App->>Broker: Publish to [${address}]`);
        output.push(`  Broker-->>Consumer: Distribute (${msgLabel(channelDef.publish)})`);
      }
      if (channelDef.subscribe) {
        output.push(`  Consumer->>Broker: Produce event [${address}]`);
        output.push(`  Broker-->>App: Deliver to subscriber (${msgLabel(channelDef.subscribe)})`);
      }
      if (channelDef.messages) {
        Object.entries(channelDef.messages).slice(0, 3).forEach(([k, v]) => {
          output.push(`  Note over Broker: message ${k}: ${msgLabel(v).slice(0, 40)}`);
        });
      }
      if (!channelDef.publish && !channelDef.subscribe && !channelDef.messages) {
        output.push(`  App->>Broker: Event Channel [${address}]`);
      }
    } else if (channelDef && typeof channelDef === 'object') {
      output.push(`  App->>Broker: Event Channel [${address}]`);
    }
  }
  // v3 operations
  Object.entries(operations).slice(0, 8).forEach(([name, op]) => {
    const action = op?.action || 'send';
    output.push(`  Note over App,Broker: op ${name}: ${String(action).slice(0, 30)}`);
  });

  return output.join('\n');
}
