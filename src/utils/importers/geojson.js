/**
 * Geospatial, GeoJSON, Shapefile attributes, and Vector Tile (Protobuf) converter for DiagramAtlas.
 * Converts GIS geometries, FeatureCollections, topological routes, and Vector Tile schemas
 * into structured, visual Mermaid diagrams.
 */

export function parseGeoJsonToMermaid(input) {
  if (!input || typeof input !== "string") {
    return 'flowchart TD\n  Empty["Empty Geospatial Dataset"]';
  }

  const clean = input.trim();

  // 1. Check for Vector Tile Protobuf specification / schema (e.g., Mapbox Vector Tile format)
  if (
    clean.includes("syntax = \"proto3\"") ||
    clean.includes("message Tile") ||
    clean.includes("message Layer") ||
    clean.includes("vector_tile")
  ) {
    return parseVectorTileProtoToMermaid(clean);
  }

  // 2. Parse GeoJSON / Shapefile JSON representation
  try {
    const data = JSON.parse(clean);
    return convertGeoJsonObjectToMermaid(data);
  } catch {
    // If not valid JSON, check for text-based geospatial spec (e.g. WKT or simplified geo DSL)
    return parseGeospatialDslToMermaid(clean);
  }
}

function convertGeoJsonObjectToMermaid(geo) {
  const type = geo.type || "FeatureCollection";

  if (type === "FeatureCollection") {
    const features = Array.isArray(geo.features) ? geo.features : [];
    if (features.length === 0) {
      return `flowchart TD\n  subgraph GeoJSON["GeoJSON: Empty FeatureCollection"]\n    Empty["No spatial features defined"]\n  end`;
    }

    // Group features by layer, geometry type, or category
    const layerMap = new Map();
    const connections = [];

    features.forEach((feat, index) => {
      const geomType = feat.geometry?.type || "UnknownGeometry";
      const props = feat.properties || {};
      const layerName = props.layer || props.category || geomType;
      const featName = props.name || props.title || props.id || `${geomType}_${index + 1}`;
      const safeId = `node_${index}_${String(featName).replace(/[^a-zA-Z0-9_]/g, "_")}`;

      if (!layerMap.has(layerName)) {
        layerMap.set(layerName, []);
      }
      layerMap.get(layerName).push({
        id: safeId,
        name: featName,
        type: geomType,
        props,
      });

      // Check for spatial connection or route relations in properties
      if (props.target || props.destination || props.connectsTo) {
        const target = String(props.target || props.destination || props.connectsTo).replace(/[^a-zA-Z0-9_]/g, "_");
        connections.push({
          from: safeId,
          to: `node_${target}`,
          label: props.routeType || props.distance || "connects",
        });
      }
    });

    let code = `flowchart TD\n`;
    code += `  %% Geospatial FeatureCollection Topology\n`;
    code += `  classDef spatial fill:#1e293b,stroke:#38bdf8,stroke-width:1.5px,color:#f8fafc,rx:8px;\n`;
    code += `  classDef route fill:#0f172a,stroke:#818cf8,stroke-width:2px,color:#f1f5f9;\n\n`;

    let clusterIdx = 0;
    for (const [layerName, items] of layerMap.entries()) {
      const clusterId = `layer_${clusterIdx++}`;
      code += `  subgraph ${clusterId}["Spatial Layer: ${escapeLabel(layerName)}"]\n`;
      items.slice(0, 8).forEach((item) => {
        const icon = getGeomIcon(item.type);
        code += `    ${item.id}["${icon} ${escapeLabel(item.name)}<br/><small style='opacity:0.7'>(${item.type})</small>"]:::spatial\n`;
      });
      if (items.length > 8) {
        code += `    ${clusterId}_more["... and ${items.length - 8} more features"]\n`;
      }
      code += `  end\n\n`;
    }

    if (connections.length > 0) {
      connections.forEach((conn) => {
        code += `  ${conn.from} -->|"${escapeLabel(conn.label)}"| ${conn.to}\n`;
      });
    } else {
      // Connect layers sequentially to form a clear topology hierarchy
      const clusters = Array.from(layerMap.keys());
      for (let i = 0; i < clusters.length - 1; i++) {
        code += `  layer_${i} -.->|spatial overlay| layer_${i + 1}\n`;
      }
    }

    return code;
  }

  if (type === "Feature") {
    const geom = geo.geometry || {};
    const props = geo.properties || {};
    const name = props.name || "Geospatial Feature";
    return `flowchart TD\n  subgraph Feature["Spatial Feature: ${escapeLabel(name)}"]\n    Geom["Geometry: ${geom.type || 'Point'}"]\n    Props["Properties: ${Object.keys(props).length} attributes"]\n    Geom --- Props\n  end`;
  }

  if (["Polygon", "MultiPolygon", "Point", "LineString"].includes(type)) {
    return `flowchart TD\n  subgraph Geometry["Single Spatial Geometry"]\n    Type["Type: ${type}"]\n    Coords["Coordinates count: ${geo.coordinates?.length || 0}"]\n    Type --- Coords\n  end`;
  }

  return `flowchart TD\n  Dataset["Geospatial Dataset: ${escapeLabel(type)}"]`;
}

function parseVectorTileProtoToMermaid(protoCode) {
  let code = `classDiagram\n`;
  code += `  %% Mapbox Vector Tile (MVT) Protobuf Schema\n`;
  code += `  class Tile {\n`;
  code += `    +Layer[] layers\n`;
  code += `    +uint32 version\n`;
  code += `  }\n`;
  code += `  class Layer {\n`;
  code += `    +string name\n`;
  code += `    +Feature[] features\n`;
  code += `    +string[] keys\n`;
  code += `    +Value[] values\n`;
  code += `    +uint32 extent\n`;
  code += `    +uint32 version\n`;
  code += `  }\n`;
  code += `  class Feature {\n`;
  code += `    +uint64 id\n`;
  code += `    +uint32[] tags\n`;
  code += `    +GeomType type\n`;
  code += `    +uint32[] geometry\n`;
  code += `  }\n`;
  code += `  class GeomType {\n`;
  code += `    <<enumeration>>\n`;
  code += `    UNKNOWN\n`;
  code += `    POINT\n`;
  code += `    LINESTRING\n`;
  code += `    POLYGON\n`;
  code += `  }\n`;
  code += `  Tile *-- Layer : contains\n`;
  code += `  Layer *-- Feature : encodes\n`;
  code += `  Feature --> GeomType : classifies\n`;

  return code;
}

function parseGeospatialDslToMermaid(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  let code = `flowchart TD\n`;
  lines.slice(0, 15).forEach((line, idx) => {
    if (line.includes("->") || line.includes("-->")) {
      code += `  ${line}\n`;
    } else {
      code += `  node_${idx}["${escapeLabel(line)}"]\n`;
    }
  });
  return code || `flowchart TD\n  Geo["Geospatial Layer"]`;
}

function getGeomIcon(type) {
  switch (type) {
    case "Point":
    case "MultiPoint":
      return "📍";
    case "LineString":
    case "MultiLineString":
      return "🛣️";
    case "Polygon":
    case "MultiPolygon":
      return "🗺️";
    default:
      return "🌐";
  }
}

function escapeLabel(text) {
  return String(text || "")
    .replace(/"/g, "'")
    .replace(/[<>]/g, "");
}
