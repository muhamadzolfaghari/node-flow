import { getGeomIcon, escapeLabel } from "./geospatial-helpers.js";

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

function readVarint(bytes, state) {
  let res = 0, shift = 0;
  while (state.pos < bytes.length) {
    const b = bytes[state.pos++];
    res |= (b & 0x7f) << shift;
    if ((b & 0x80) === 0) break;
    shift += 7;
  }
  return res;
}

function parseMvtLayer(bytes, state, end, layerNum) {
  let lyrName = `Layer_${layerNum}`;
  let featCount = 0;
  let extent = 4096;
  let version = 2;
  const tagKeys = [];

  while (state.pos < end && state.pos < bytes.length) {
    const ltag = readVarint(bytes, state);
    const lwire = ltag & 7;
    const lfield = ltag >>> 3;
    if (lwire === 2) {
      const llen = readVarint(bytes, state);
      if (lfield === 1) {
        lyrName = new TextDecoder().decode(bytes.subarray(state.pos, state.pos + llen));
      } else if (lfield === 2) {
        featCount++;
      } else if (lfield === 3 && tagKeys.length < 5) {
        tagKeys.push(new TextDecoder().decode(bytes.subarray(state.pos, state.pos + llen)));
      }
      state.pos += llen;
    } else if (lwire === 0) {
      const val = readVarint(bytes, state);
      if (lfield === 5) extent = val;
      if (lfield === 15) version = val;
    } else if (lwire === 5) {
      state.pos += 4;
    } else if (lwire === 1) {
      state.pos += 8;
    } else {
      break;
    }
  }
  return { name: lyrName, count: featCount, extent, version, keys: tagKeys };
}

function parseBinaryVectorTile(bytes, filename = "") {
  const state = { pos: 0 };
  const layers = [];

  try {
    while (state.pos < bytes.length) {
      const tag = readVarint(bytes, state);
      const wire = tag & 7;
      const field = tag >>> 3;
      if (wire === 2) {
        const len = readVarint(bytes, state);
        const end = state.pos + len;
        if (field === 3) {
          layers.push(parseMvtLayer(bytes, state, end, layers.length + 1));
        }
        state.pos = end;
      } else if (wire === 0) {
        readVarint(bytes, state);
      } else if (wire === 5) {
        state.pos += 4;
      } else if (wire === 1) {
        state.pos += 8;
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
