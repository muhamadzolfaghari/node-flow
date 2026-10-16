/**
 * Geospatial, GeoJSON, ESRI Shapefile attributes, and Vector Tile (Protobuf / MVT) converter for DiagramAtlas.
 * Converts GIS geometries, FeatureCollections, topological routes, Vector Tile schemas,
 * and spatial pipeline architectures into structured, visual Mermaid diagrams.
 */

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
    clean.includes("syntax = \"proto2\"") ||
    clean.includes("syntax = \"proto3\"") ||
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

export function parseBinaryGeospatialToMermaid(bytes, filename = "") {
  // Check for ESRI Shapefile (.shp) file magic (9994 / 0x0000270a in big-endian)
  if (
    bytes.length >= 100 &&
    bytes[0] === 0x00 &&
    bytes[1] === 0x00 &&
    bytes[2] === 0x27 &&
    bytes[3] === 0x0a
  ) {
    return parseBinaryShapefile(bytes, filename);
  }

  // Check for DBF (.dbf) dBASE III file
  if (
    bytes.length >= 32 &&
    (bytes[0] === 0x03 || bytes[0] === 0x83 || bytes[0] === 0xf5)
  ) {
    return parseBinaryDbf(bytes, filename);
  }

  // Default to Vector Tile Protobuf (MVT / PBF) parser
  return parseBinaryVectorTile(bytes, filename);
}

function parseBinaryShapefile(bytes, filename = "") {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const shapeTypeInt = dv.getInt32(32, true);
  const xMin = dv.getFloat64(36, true);
  const yMin = dv.getFloat64(44, true);
  const xMax = dv.getFloat64(52, true);
  const yMax = dv.getFloat64(60, true);

  const shapeTypeNames = {
    0: "Null Shape",
    1: "Point",
    3: "PolyLine",
    5: "Polygon",
    8: "MultiPoint",
    11: "PointZ",
    13: "PolyLineZ",
    15: "PolygonZ",
    18: "MultiPointZ",
    21: "PointM",
    23: "PolyLineM",
    25: "PolygonM",
    31: "MultiPatch",
  };
  const shapeName = shapeTypeNames[shapeTypeInt] || `ShapeType_${shapeTypeInt}`;
  const icon = getGeomIcon(shapeName);

  let offset = 100;
  let recordCount = 0;
  const sampleRecords = [];
  while (offset + 8 <= bytes.length) {
    const recNum = dv.getInt32(offset, false);
    const contentLenWords = dv.getInt32(offset + 4, false);
    const contentLenBytes = contentLenWords * 2;
    recordCount++;
    if (sampleRecords.length < 8 && offset + 8 + 4 <= bytes.length) {
      const recShapeType = dv.getInt32(offset + 8, true);
      sampleRecords.push({
        num: recNum,
        type: shapeTypeNames[recShapeType] || shapeName,
        bytes: contentLenBytes,
      });
    }
    offset += 8 + contentLenBytes;
  }

  let code = `flowchart TD\n`;
  code += `  %% ESRI Shapefile Binary Dataset\n`;
  code += `  classDef meta fill:#041f2a,stroke:#06b6d4,stroke-width:2px,color:#e0f2fe,rx:8px;\n`;
  code += `  classDef geom fill:#03251e,stroke:#10b981,stroke-width:1.5px,color:#f0fdf4,rx:8px;\n`;
  code += `  classDef bbox fill:#241804,stroke:#f59e0b,stroke-width:1.5px,color:#fef3c7,rx:8px;\n`;
  code += `  subgraph SHP["🗺️ ESRI Shapefile: ${escapeLabel(filename || "Dataset.shp")}"]\n`;
  code += `    Meta["📦 Shapefile Layer Header<br/><small style='opacity:0.8'>Primary Geometry: ${icon} <b>${shapeName}</b> • ${recordCount || "Active"} Records • ${(bytes.length / 1024).toFixed(1)} KB</small>"]:::meta\n`;
  code += `    BBox["🌐 Spatial Extent (Bounding Box)<br/><small style='opacity:0.8'>West: ${Number.isFinite(xMin) ? xMin.toFixed(4) : "-180"}, South: ${Number.isFinite(yMin) ? yMin.toFixed(4) : "-90"}<br/>East: ${Number.isFinite(xMax) ? xMax.toFixed(4) : "180"}, North: ${Number.isFinite(yMax) ? yMax.toFixed(4) : "90"}</small>"]:::bbox\n`;
  code += `    Meta --> BBox\n`;
  if (sampleRecords.length > 0) {
    code += `    subgraph Records["Geometry Feature Records"]\n`;
    sampleRecords.forEach((r, i) => {
      code += `      rec_${i}["${icon} Feature #${r.num}<br/><small style='opacity:0.8'>${r.type} (${r.bytes} bytes)</small>"]:::geom\n`;
    });
    if (recordCount > sampleRecords.length) {
      code += `      more_rec["... and ${recordCount - sampleRecords.length} additional spatial features"]\n`;
    }
    code += `    end\n`;
    code += `    Meta --> Records\n`;
  }
  code += `  end\n`;
  return code;
}

function parseBinaryDbf(bytes, filename = "") {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const recordCount = dv.getInt32(4, true);
  const headerLen = dv.getInt16(8, true);
  const fields = [];
  let offset = 32;
  while (offset + 32 <= headerLen && bytes[offset] !== 0x0d && offset < bytes.length) {
    let name = "";
    for (let i = 0; i < 11; i++) {
      const c = bytes[offset + i];
      if (c === 0) break;
      name += String.fromCharCode(c);
    }
    const type = String.fromCharCode(bytes[offset + 11]);
    const len = bytes[offset + 16];
    if (name.trim()) fields.push({ name: name.trim(), type, len });
    offset += 32;
  }

  let code = `flowchart TD\n`;
  code += `  %% ESRI Shapefile Attribute Table (.dbf)\n`;
  code += `  classDef dbf fill:#041f2a,stroke:#38bdf8,stroke-width:2px,color:#e0f2fe,rx:8px;\n`;
  code += `  classDef col fill:#03251e,stroke:#10b981,stroke-width:1.5px,color:#f0fdf4,rx:8px;\n`;
  code += `  subgraph DBF["📊 Shapefile Attribute Table: ${escapeLabel(filename || "Attributes.dbf")}"]\n`;
  code += `    Table["dBASE III Attribute Records<br/><small style='opacity:0.8'>${recordCount} Rows • ${fields.length} Columns</small>"]:::dbf\n`;
  fields.slice(0, 10).forEach((f, idx) => {
    code += `    col_${idx}["Field: <b>${escapeLabel(f.name)}</b><br/><small style='opacity:0.8'>Type: ${f.type} (${f.len} bytes)</small>"]:::col\n`;
    code += `    Table --> col_${idx}\n`;
  });
  code += `  end\n`;
  return code;
}

function parseBinaryVectorTile(bytes, filename = "") {
  let pos = 0;
  const layers = [];

  function readVarint() {
    let res = 0,
      shift = 0;
    while (pos < bytes.length) {
      const b = bytes[pos++];
      res |= (b & 0x7f) << shift;
      if ((b & 0x80) === 0) break;
      shift += 7;
    }
    return res;
  }

  try {
    while (pos < bytes.length) {
      const tag = readVarint();
      const wire = tag & 7;
      const field = tag >>> 3;
      if (wire === 2) {
        const len = readVarint();
        const end = pos + len;
        if (field === 3) {
          // Layer message
          let lyrName = `Layer_${layers.length + 1}`;
          let featCount = 0;
          let extent = 4096;
          let version = 2;
          const tagKeys = [];

          while (pos < end && pos < bytes.length) {
            const ltag = readVarint();
            const lwire = ltag & 7;
            const lfield = ltag >>> 3;
            if (lwire === 2) {
              const llen = readVarint();
              if (lfield === 1) {
                const strBytes = bytes.subarray(pos, pos + llen);
                lyrName = new TextDecoder().decode(strBytes);
              } else if (lfield === 2) {
                featCount++;
              } else if (lfield === 3) {
                if (tagKeys.length < 5) {
                  tagKeys.push(new TextDecoder().decode(bytes.subarray(pos, pos + llen)));
                }
              }
              pos += llen;
            } else if (lwire === 0) {
              const val = readVarint();
              if (lfield === 5) extent = val;
              if (lfield === 15) version = val;
            } else if (lwire === 5) {
              pos += 4;
            } else if (lwire === 1) {
              pos += 8;
            } else {
              break;
            }
          }
          layers.push({ name: lyrName, count: featCount, extent, version, keys: tagKeys });
        }
        pos = end;
      } else if (wire === 0) {
        readVarint();
      } else if (wire === 5) {
        pos += 4;
      } else if (wire === 1) {
        pos += 8;
      } else {
        break;
      }
    }
  } catch {}

  let code = `flowchart TD\n`;
  code += `  %% Mapbox Vector Tile (MVT PBF) Binary Tile Structure\n`;
  code += `  classDef tile fill:#041f2a,stroke:#06b6d4,stroke-width:2px,color:#e0f2fe,rx:8px;\n`;
  code += `  classDef lyr fill:#03251e,stroke:#10b981,stroke-width:1.5px,color:#f0fdf4,rx:8px;\n`;
  code += `  classDef attr fill:#241804,stroke:#f59e0b,stroke-width:1.5px,color:#fef3c7,rx:8px;\n`;
  const tileTitle = filename ? escapeLabel(filename) : "Tile [z/x/y.pbf]";
  const totalLayers = layers.length || 1;
  code += `  subgraph TileRoot["📦 Vector Tile Protobuf: ${tileTitle}"]\n`;
  code += `    TileInfo["🗺️ MVT Tile Matrix<br/><small style='opacity:0.8'>Specification: MVT v2.1 • Size: ${(bytes.length / 1024).toFixed(1)} KB • ${totalLayers} Vector Layers</small>"]:::tile\n`;
  if (layers.length === 0) {
    code += `    Lyr0["Layer: default<br/><small>Extent: 4096 • Features: Vector Tile Geometries</small>"]:::lyr\n`;
    code += `    TileInfo --> Lyr0\n`;
  } else {
    layers.forEach((lyr, idx) => {
      const icon = getGeomIcon(lyr.name);
      code += `    lyr_${idx}["${icon} Layer: <b>${escapeLabel(lyr.name)}</b><br/><small style='opacity:0.8'>Extent: ${lyr.extent}x${lyr.extent} • ${lyr.count} Features</small>"]:::lyr\n`;
      code += `    TileInfo --> lyr_${idx}\n`;
      if (lyr.keys && lyr.keys.length > 0) {
        code += `    keys_${idx}["🏷️ Attributes<br/><small style='opacity:0.8'>${lyr.keys.map(escapeLabel).join(", ")}</small>"]:::attr\n`;
        code += `    lyr_${idx} --> keys_${idx}\n`;
      }
    });
  }
  code += `  end\n`;
  return code;
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

function parseVectorTileProtoToMermaid(protoCode) {
  let code = `classDiagram\n`;
  code += `  %% Mapbox Vector Tile (MVT) Protobuf Specification\n`;
  code += `  class Tile {\n`;
  code += `    +Layer[] layers\n`;
  code += `    +uint32 version\n`;
  code += `    +decodeTile(z, x, y)\n`;
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
  code += `  class Value {\n`;
  code += `    +string string_value\n`;
  code += `    +float float_value\n`;
  code += `    +double double_value\n`;
  code += `    +int64 int_value\n`;
  code += `    +bool bool_value\n`;
  code += `  }\n`;
  code += `  class GeomType {\n`;
  code += `    <<enumeration>>\n`;
  code += `    UNKNOWN : 0\n`;
  code += `    POINT : 1\n`;
  code += `    LINESTRING : 2\n`;
  code += `    POLYGON : 3\n`;
  code += `  }\n`;
  code += `  Tile *-- Layer : contains\n`;
  code += `  Layer *-- Feature : encodes\n`;
  code += `  Layer *-- Value : dictionary\n`;
  code += `  Feature --> GeomType : classifies\n`;

  return code;
}

function parseGeospatialDslToMermaid(text) {
  const clean = text.trim();

  // 1. Well-Known Text (WKT) Geometry Detection
  const wktRegex = /^(POINT|LINESTRING|POLYGON|MULTIPOINT|MULTILINESTRING|MULTIPOLYGON|GEOMETRYCOLLECTION)\s*(?:Z|M|ZM)?\s*[\(\[]/i;
  if (wktRegex.test(clean) || clean.includes("POLYGON") || clean.includes("LINESTRING") || clean.includes("POINT")) {
    return parseWktToMermaid(clean);
  }

  // 2. Vector Tile URL or Pyramid schema (e.g. /{z}/{x}/{y}.pbf or tile coordinates)
  if (clean.includes("{z}") || clean.includes("{x}") || clean.includes("{y}") || /Tile\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/i.test(clean)) {
    return parseTilePyramidDslToMermaid(clean);
  }

  // 3. ESRI Shapefile Schema / DBF Field Specification
  if (/ShapeType|BBOX|BoundingBox|DBF|ESRI\s*Shapefile|\bFID\b/i.test(clean)) {
    return parseShapefileDslToMermaid(clean);
  }

  const lines = clean.split("\n").map((l) => l.trim()).filter(Boolean);
  let code = `flowchart TD\n`;
  code += `  classDef geo fill:#0f172a,stroke:#38bdf8,stroke-width:1.5px,color:#f8fafc;\n`;
  lines.slice(0, 15).forEach((line, idx) => {
    if (line.includes("->") || line.includes("-->")) {
      code += `  ${line}\n`;
    } else {
      code += `  node_${idx}["🌐 ${escapeLabel(line)}"]:::geo\n`;
    }
  });
  return code || `flowchart TD\n  Geo["Geospatial Layer"]`;
}

/**
 * Parses Well-Known Text (WKT) geometries into structured visual diagrams.
 */
export function parseWktToMermaid(wktText) {
  const lines = wktText.split("\n").map((l) => l.trim()).filter(Boolean);
  let code = `flowchart TD\n`;
  code += `  %% WKT (Well-Known Text) Spatial Geometry Topology\n`;
  code += `  classDef point fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;\n`;
  code += `  classDef line fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#f8fafc;\n`;
  code += `  classDef poly fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#f8fafc;\n\n`;

  let idx = 0;
  for (const line of lines.slice(0, 12)) {
    const match = line.match(/^([A-Za-z]+)\s*(?:Z|M|ZM)?\s*\((.+)\)$/s);
    if (!match) continue;
    const geomType = match[1].toUpperCase();
    const rawCoords = match[2];
    const coordPairs = rawCoords.match(/-?\d+(?:\.\d+)?\s+-?\d+(?:\.\d+)?/g) || [];
    const icon = getGeomIcon(geomType);
    const styleClass = geomType.includes("POINT") ? "point" : geomType.includes("LINE") ? "line" : "poly";

    code += `  subgraph WKT_${idx}["${icon} ${geomType} #${idx + 1}"]\n`;
    code += `    wkt_node_${idx}["${geomType}<br/><small>Vertices: ${coordPairs.length}</small>"]:::${styleClass}\n`;
    if (coordPairs.length > 0) {
      const sample = coordPairs.slice(0, 3).join("<br/>");
      code += `    wkt_coords_${idx}["Coordinates Sample:<br/><small>${sample}</small>"]\n`;
      code += `    wkt_node_${idx} --- wkt_coords_${idx}\n`;
    }
    code += `  end\n\n`;
    idx++;
  }

  if (idx === 0) {
    code += `  WKT_Generic["🗺️ WKT Spatial Entity<br/><small>${escapeLabel(wktText.slice(0, 80))}</small>"]:::poly\n`;
  }
  return code;
}

/**
 * Parses Vector Tile Pyramid schema into zoom hierarchy diagram.
 */
function parseTilePyramidDslToMermaid(text) {
  let code = `flowchart TD\n`;
  code += `  %% Vector Tile Pyramid (MVT / Protobuf) Hierarchy\n`;
  code += `  classDef tile fill:#0f172a,stroke:#0284c7,stroke-width:2px,color:#f0f9ff;\n`;
  code += `  classDef pmtiles fill:#1e1b4b,stroke:#a855f7,stroke-width:2px,color:#faf5ff;\n\n`;

  code += `  subgraph Pyramid["Vector Tile Pyramid Architecture (MVT)"]\n`;
  code += `    Z0["Zoom 0: Global World (1 Tile: 0/0/0)"]:::tile\n`;
  code += `    Z4["Zoom 4: Continental & Country Basemap (256 Tiles)"]:::tile\n`;
  code += `    Z10["Zoom 10: Metropolitan & Road Network (1M Tiles)"]:::tile\n`;
  code += `    Z14["Zoom 14+: High-Precision Building Footprints (268M Tiles)"]:::tile\n`;
  code += `    Archive["PMTiles / MBTiles Archive (Protobuf / GZip Compressed)"]:::pmtiles\n`;
  code += `  end\n\n`;

  code += `  Z0 --> Z4 --> Z10 --> Z14\n`;
  code += `  Z14 --> Archive\n`;
  return code;
}

/**
 * Parses ESRI Shapefile schema definitions into attribute-spatial ER diagrams.
 */
function parseShapefileDslToMermaid(text) {
  let code = `flowchart TD\n`;
  code += `  %% ESRI Shapefile Multi-Layer Architecture Schema\n`;
  code += `  classDef shp fill:#1e293b,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;\n`;
  code += `  classDef dbf fill:#0f172a,stroke:#34d399,stroke-width:1.5px,color:#f0fdf4;\n`;
  code += `  classDef shx fill:#18181b,stroke:#a1a1aa,stroke-width:1px,color:#f4f4f5;\n\n`;

  code += `  subgraph ShapefileBundle["ESRI Shapefile Component Bundle"]\n`;
  code += `    SHP[".SHP: Vector Geometry Records<br/><small>Direct binary coordinate array</small>"]:::shp\n`;
  code += `    SHX[".SHX: Spatial Index<br/><small>Offset and content lengths</small>"]:::shx\n`;
  code += `    DBF[".DBF: dBASE Attribute Table<br/><small>Tabular entity properties</small>"]:::dbf\n`;
  code += `    PRJ[".PRJ: Projection Metadata<br/><small>WKT Coordinate Reference System (CRS)</small>"]\n`;
  code += `  end\n\n`;

  code += `  SHX -->|byte offset pointer| SHP\n`;
  code += `  SHP ---|record alignment 1:1| DBF\n`;
  code += `  PRJ -.->|transforms coordinates| SHP\n`;
  return code;
}

function getGeomIcon(type) {
  const t = String(type || "").toLowerCase();
  if (t.includes("point")) return "📍";
  if (t.includes("line")) return "🛣️";
  if (t.includes("poly")) return "🗺️";
  if (t.includes("tile") || t.includes("mvt") || t.includes("pbf")) return "🧱";
  return "🌐";
}

function escapeLabel(text) {
  return String(text || "")
    .replace(/"/g, "'")
    .replace(/[<>]/g, "");
}
