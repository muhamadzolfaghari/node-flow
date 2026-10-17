/**
 * Geospatial, GeoJSON, ESRI Shapefile attributes, and Vector Tile (Protobuf / MVT) converter for DiagramAtlas.
 * Converts GIS geometries, FeatureCollections, topological routes, Vector Tile schemas,
 * and spatial pipeline architectures into structured, visual Mermaid diagrams.
 */
import { parseBinaryGeospatialToMermaid } from "./geospatialBinary.ts";
import {
  parseVectorTileProtoToMermaid,
  parseGeospatialDslToMermaid,
  parseWktToMermaid,
} from "./geospatialdsl.ts";
import { getGeomIcon, escapeLabel } from "./geospatialhelpers.ts";

export { parseBinaryGeospatialToMermaid } from "./geospatialBinary.ts";
export { parseWktToMermaid } from "./geospatialdsl.ts";

export function parseGeoJsonToMermaid(input, filename = "") {
  if (!input) {
    return 'flowchart TD\n  Empty["Empty Geospatial Dataset"]';
  }

  // 1. Handle binary ArrayBuffer or TypedArray (.pbf / .mvt / .shp / .dbf)
  if (input instanceof ArrayBuffer || ArrayBuffer.isView(input)) {
    const bytes =
      input instanceof ArrayBuffer
        ? new Uint8Array(input)
        : new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
    return parseBinaryGeospatialToMermaid(bytes, filename);
  }

  if (typeof input !== "string") {
    return 'flowchart TD\n  Empty["Empty Geospatial Dataset"]';
  }

  const clean = input.trim();

  // 2. Base64 encoded geospatial binary or data URI
  if (clean.startsWith("data:") && clean.includes(";base64,")) {
    try {
      const b64 = clean.split(";base64,")[1];
      const binaryStr = atob(b64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
      return parseBinaryGeospatialToMermaid(bytes, filename);
    } catch {}
  }

  // 3. Raw binary file loaded into a string with null bytes / magic
  if (
    clean.includes("\x00\x00\x27\x0a") ||
    (clean.length > 4 && clean.charCodeAt(0) === 0 && clean.charCodeAt(1) === 0)
  ) {
    const bytes = new Uint8Array(clean.length);
    for (let i = 0; i < clean.length; i++) bytes[i] = clean.charCodeAt(i) & 0xff;
    return parseBinaryGeospatialToMermaid(bytes, filename);
  }

  // 4. Check for Vector Tile Protobuf specification / schema (MVT format / .proto)
  if (
    clean.includes('syntax = "proto2"') ||
    clean.includes('syntax = "proto3"') ||
    clean.includes("package vector_tile") ||
    clean.includes("message Tile") ||
    clean.includes("message Layer") ||
    clean.includes("vector_tile") ||
    clean.includes("TilePyramid")
  ) {
    return parseVectorTileProtoToMermaid(clean);
  }

  // 5. Parse GeoJSON / Shapefile JSON representation / TopoJSON
  try {
    const data = JSON.parse(clean);
    return convertGeoJsonObjectToMermaid(data);
  } catch {
    // 6. Text-based geospatial spec (WKT, ESRI Shapefile schema, or spatial pipeline DSL)
    return parseGeospatialDslToMermaid(clean);
  }
}

function convertGeoJsonObjectToMermaid(geo) {
  // A. ESRI Shapefile attribute rows array: [{ FID: 0, SHAPE: "Polygon", ... }]
  if (Array.isArray(geo)) {
    let code = `flowchart TD\n`;
    code += `  %% ESRI Shapefile (.shp / .dbf) Feature Table\n`;
    code += `  classDef shp fill:#1e293b,stroke:#38bdf8,stroke-width:1.5px,color:#f8fafc,rx:8px;\n`;
    code += `  subgraph Shapefile["ESRI Shapefile Layer: Attribute & Geometry Records"]\n`;
    const rows = geo.slice(0, 10);
    rows.forEach((row, idx) => {
      const name = row.name || row.NAME || row.title || row.id || row.FID || `Record_${idx + 1}`;
      const shapeType = row.shape || row.SHAPE || row.geometry || row.type || "Feature";
      const icon = getGeomIcon(shapeType);
      code += `    rec_${idx}["${icon} ${escapeLabel(name)}<br/><small style='opacity:0.7'>Type: ${shapeType}</small>"]:::shp\n`;
    });
    if (geo.length > 10) {
      code += `    rec_more["... and ${geo.length - 10} more spatial records"]\n`;
    }
    code += `  end\n`;
    return code;
  }

  // B. TopoJSON Topology with shared arc compression
  if (geo.type === "Topology") {
    const objects = geo.objects || {};
    let code = `flowchart TD\n`;
    code += `  %% TopoJSON Topology with Shared Arcs\n`;
    code += `  classDef topo fill:#0f172a,stroke:#10b981,stroke-width:2px,color:#f8fafc;\n`;
    code += `  subgraph TopoJSON["TopoJSON Topology (Shared Arc Compression)"]\n`;
    let idx = 0;
    const objKeys = Object.keys(objects);
    objKeys.forEach((key) => {
      const val = objects[key];
      code += `    obj_${idx}["🗺️ Layer: ${escapeLabel(key)}<br/><small style='opacity:0.7'>Geometry: ${val.type || "GeometryCollection"}</small>"]:::topo\n`;
      idx++;
    });
    code += `    Arcs["Shared Arcs Matrix<br/><small>${geo.arcs?.length || 0} topological boundary arcs</small>"]\n`;
    code += `  end\n`;
    for (let i = 0; i < idx; i++) {
      code += `  obj_${i} -->|indexes| Arcs\n`;
    }
    return code;
  }

  const type = geo.type || (geo.layers ? "MapboxStyle" : "FeatureCollection");

  // C. Mapbox / MapLibre Style Specification with Vector Tile Sources
  if (geo.sources || geo.layers) {
    let code = `flowchart TD\n`;
    code += `  %% Mapbox GL / MapLibre Vector Tile Style Specification\n`;
    code += `  subgraph Style["Geospatial Map Style: ${escapeLabel(geo.name || "Vector Map")}"]\n`;
    code += `    Sources["Vector Tile Sources (MVT PBF)"]\n`;
    const layers = Array.isArray(geo.layers) ? geo.layers.slice(0, 8) : [];
    layers.forEach((lyr, idx) => {
      code += `    lyr_${idx}["${getGeomIcon(lyr.type)} Layer: ${escapeLabel(lyr.id)}<br/><small>${lyr.type || "fill"}</small>"]\n`;
      code += `    Sources --> lyr_${idx}\n`;
    });
    code += `  end\n`;
    return code;
  }

  // D. GeoJSON FeatureCollection
  if (type === "FeatureCollection") {
    const features = Array.isArray(geo.features) ? geo.features : [];
    if (features.length === 0) {
      return `flowchart TD\n  subgraph GeoJSON["GeoJSON: Empty FeatureCollection"]\n    Empty["No spatial features defined"]\n  end`;
    }

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

    if (geo.crs?.properties?.name) {
      code += `  CRS["🌐 Projection: ${escapeLabel(geo.crs.properties.name)}"]\n`;
    }

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
      const clusters = Array.from(layerMap.keys());
      for (let i = 0; i < clusters.length - 1; i++) {
        code += `  layer_${i} -.->|spatial overlay| layer_${i + 1}\n`;
      }
    }

    return code;
  }

  // E. Single Feature
  if (type === "Feature") {
    const geom = geo.geometry || {};
    const props = geo.properties || {};
    const name = props.name || "Geospatial Feature";
    return `flowchart TD\n  subgraph Feature["Spatial Feature: ${escapeLabel(name)}"]\n    Geom["${getGeomIcon(geom.type)} Geometry: ${geom.type || "Point"}"]\n    Props["Properties: ${Object.keys(props).length} attributes"]\n    Geom --- Props\n  end`;
  }

  // F. Direct Geometry
  if (["Polygon", "MultiPolygon", "Point", "LineString", "MultiLineString"].includes(type)) {
    return `flowchart TD\n  subgraph Geometry["Single Spatial Geometry"]\n    Type["${getGeomIcon(type)} Type: ${type}"]\n    Coords["Coordinates count: ${geo.coordinates?.length || 0}"]\n    Type --- Coords\n  end`;
  }

  return `flowchart TD\n  Dataset["Geospatial Dataset: ${escapeLabel(type)}"]`;
}
// @ts-nocheck
