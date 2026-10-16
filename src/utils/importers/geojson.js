/**
 * Geospatial, GeoJSON, ESRI Shapefile attributes, and Vector Tile (Protobuf / MVT) converter for DiagramAtlas.
 * Converts GIS geometries, FeatureCollections, topological routes, Vector Tile schemas,
 * and spatial pipeline architectures into structured, visual Mermaid diagrams.
 */

export function parseGeoJsonToMermaid(input) {
  if (!input || typeof input !== "string") {
    return 'flowchart TD\n  Empty["Empty Geospatial Dataset"]';
  }

  const clean = input.trim();

  // 1. Check for Vector Tile Protobuf specification / schema (MVT format / .proto)
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

  // 2. Parse GeoJSON / Shapefile JSON representation / TopoJSON
  try {
    const data = JSON.parse(clean);
    return convertGeoJsonObjectToMermaid(data);
  } catch {
    // 3. Text-based geospatial spec (WKT, ESRI Shapefile schema, or spatial pipeline DSL)
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
