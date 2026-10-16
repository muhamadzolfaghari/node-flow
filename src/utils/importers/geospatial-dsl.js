import { getGeomIcon, escapeLabel } from "./geospatial-helpers.js";

export function parseVectorTileProtoToMermaid(protoCode) {
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

export function parseGeospatialDslToMermaid(text) {
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

export function parseTilePyramidDslToMermaid(text) {
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

export function parseShapefileDslToMermaid(text) {
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
