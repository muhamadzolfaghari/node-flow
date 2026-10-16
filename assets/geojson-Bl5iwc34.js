function b(t){const e=String(t||"").toLowerCase();return e.includes("point")?"📍":e.includes("line")?"🛣️":e.includes("poly")?"🗺️":e.includes("tile")||e.includes("mvt")||e.includes("pbf")?"🧱":"🌐"}function y(t){return String(t||"").replace(/"/g,"'").replace(/[<>]/g,"")}function S(t,e=""){return t.length>=100&&t[0]===0&&t[1]===0&&t[2]===39&&t[3]===10?k(t,e):t.length>=32&&(t[0]===3||t[0]===131||t[0]===245)?D(t,e):P(t,e)}function k(t,e=""){const n=new DataView(t.buffer,t.byteOffset,t.byteLength),a=n.getInt32(32,!0),s=n.getFloat64(36,!0),p=n.getFloat64(44,!0),o=n.getFloat64(52,!0),l=n.getFloat64(60,!0),r={0:"Null Shape",1:"Point",3:"PolyLine",5:"Polygon",8:"MultiPoint",11:"PointZ",13:"PolyLineZ",15:"PolygonZ",18:"MultiPointZ",21:"PointM",23:"PolyLineM",25:"PolygonM",31:"MultiPatch"},c=r[a]||`ShapeType_${a}`,u=b(c);let i=100,d=0;const h=[];for(;i+8<=t.length;){const m=n.getInt32(i,!1),$=n.getInt32(i+4,!1)*2;if(d++,h.length<8&&i+8+4<=t.length){const x=n.getInt32(i+8,!0);h.push({num:m,type:r[x]||c,bytes:$})}i+=8+$}let f=`flowchart TD
`;return f+=`  %% ESRI Shapefile Binary Dataset
`,f+=`  classDef meta fill:#041f2a,stroke:#06b6d4,stroke-width:2px,color:#e0f2fe,rx:8px;
`,f+=`  classDef geom fill:#03251e,stroke:#10b981,stroke-width:1.5px,color:#f0fdf4,rx:8px;
`,f+=`  classDef bbox fill:#241804,stroke:#f59e0b,stroke-width:1.5px,color:#fef3c7,rx:8px;
`,f+=`  subgraph SHP["🗺️ ESRI Shapefile: ${y(e||"Dataset.shp")}"]
`,f+=`    Meta["📦 Shapefile Layer Header<br/><small style='opacity:0.8'>Primary Geometry: ${u} <b>${c}</b> • ${d||"Active"} Records • ${(t.length/1024).toFixed(1)} KB</small>"]:::meta
`,f+=`    BBox["🌐 Spatial Extent (Bounding Box)<br/><small style='opacity:0.8'>West: ${Number.isFinite(s)?s.toFixed(4):"-180"}, South: ${Number.isFinite(p)?p.toFixed(4):"-90"}<br/>East: ${Number.isFinite(o)?o.toFixed(4):"180"}, North: ${Number.isFinite(l)?l.toFixed(4):"90"}</small>"]:::bbox
`,f+=`    Meta --> BBox
`,h.length>0&&(f+=`    subgraph Records["Geometry Feature Records"]
`,h.forEach((m,g)=>{f+=`      rec_${g}["${u} Feature #${m.num}<br/><small style='opacity:0.8'>${m.type} (${m.bytes} bytes)</small>"]:::geom
`}),d>h.length&&(f+=`      more_rec["... and ${d-h.length} additional spatial features"]
`),f+=`    end
`,f+=`    Meta --> Records
`),f+=`  end
`,f}function D(t,e=""){const n=new DataView(t.buffer,t.byteOffset,t.byteLength),a=n.getInt32(4,!0),s=n.getInt16(8,!0),p=[];let o=32;for(;o+32<=s&&t[o]!==13&&o<t.length;){let r="";for(let i=0;i<11;i++){const d=t[o+i];if(d===0)break;r+=String.fromCharCode(d)}const c=String.fromCharCode(t[o+11]),u=t[o+16];r.trim()&&p.push({name:r.trim(),type:c,len:u}),o+=32}let l=`flowchart TD
`;return l+=`  %% ESRI Shapefile Attribute Table (.dbf)
`,l+=`  classDef dbf fill:#041f2a,stroke:#38bdf8,stroke-width:2px,color:#e0f2fe,rx:8px;
`,l+=`  classDef col fill:#03251e,stroke:#10b981,stroke-width:1.5px,color:#f0fdf4,rx:8px;
`,l+=`  subgraph DBF["📊 Shapefile Attribute Table: ${y(e||"Attributes.dbf")}"]
`,l+=`    Table["dBASE III Attribute Records<br/><small style='opacity:0.8'>${a} Rows • ${p.length} Columns</small>"]:::dbf
`,p.slice(0,10).forEach((r,c)=>{l+=`    col_${c}["Field: <b>${y(r.name)}</b><br/><small style='opacity:0.8'>Type: ${r.type} (${r.len} bytes)</small>"]:::col
`,l+=`    Table --> col_${c}
`}),l+=`  end
`,l}function T(t,e){let n=0,a=0;for(;e.pos<t.length;){const s=t[e.pos++];if(n|=(s&127)<<a,(s&128)===0)break;a+=7}return n}function M(t,e,n,a){let s=`Layer_${a}`,p=0,o=4096,l=2;const r=[];for(;e.pos<n&&e.pos<t.length;){const c=T(t,e),u=c&7,i=c>>>3;if(u===2){const d=T(t,e);i===1?s=new TextDecoder().decode(t.subarray(e.pos,e.pos+d)):i===2?p++:i===3&&r.length<5&&r.push(new TextDecoder().decode(t.subarray(e.pos,e.pos+d))),e.pos+=d}else if(u===0){const d=T(t,e);i===5&&(o=d),i===15&&(l=d)}else if(u===5)e.pos+=4;else if(u===1)e.pos+=8;else break}return{name:s,count:p,extent:o,version:l,keys:r}}function P(t,e=""){const n={pos:0},a=[];try{for(;n.pos<t.length;){const l=T(t,n),r=l&7,c=l>>>3;if(r===2){const u=T(t,n),i=n.pos+u;c===3&&a.push(M(t,n,i,a.length+1)),n.pos=i}else if(r===0)T(t,n);else if(r===5)n.pos+=4;else if(r===1)n.pos+=8;else break}}catch{}let s=`flowchart TD
`;s+=`  %% Mapbox Vector Tile (MVT PBF) Binary Tile Structure
`,s+=`  classDef tile fill:#041f2a,stroke:#06b6d4,stroke-width:2px,color:#e0f2fe,rx:8px;
`,s+=`  classDef lyr fill:#03251e,stroke:#10b981,stroke-width:1.5px,color:#f0fdf4,rx:8px;
`,s+=`  classDef attr fill:#241804,stroke:#f59e0b,stroke-width:1.5px,color:#fef3c7,rx:8px;
`;const p=e?y(e):"Tile [z/x/y.pbf]",o=a.length||1;return s+=`  subgraph TileRoot["📦 Vector Tile Protobuf: ${p}"]
`,s+=`    TileInfo["🗺️ MVT Tile Matrix<br/><small style='opacity:0.8'>Specification: MVT v2.1 • Size: ${(t.length/1024).toFixed(1)} KB • ${o} Vector Layers</small>"]:::tile
`,a.length===0?(s+=`    Lyr0["Layer: default<br/><small>Extent: 4096 • Features: Vector Tile Geometries</small>"]:::lyr
`,s+=`    TileInfo --> Lyr0
`):a.forEach((l,r)=>{const c=b(l.name);s+=`    lyr_${r}["${c} Layer: <b>${y(l.name)}</b><br/><small style='opacity:0.8'>Extent: ${l.extent}x${l.extent} • ${l.count} Features</small>"]:::lyr
`,s+=`    TileInfo --> lyr_${r}
`,l.keys&&l.keys.length>0&&(s+=`    keys_${r}["🏷️ Attributes<br/><small style='opacity:0.8'>${l.keys.map(y).join(", ")}</small>"]:::attr
`,s+=`    lyr_${r} --> keys_${r}
`)}),s+=`  end
`,s}function L(t){let e=`classDiagram
`;return e+=`  %% Mapbox Vector Tile (MVT) Protobuf Specification
`,e+=`  class Tile {
`,e+=`    +Layer[] layers
`,e+=`    +uint32 version
`,e+=`    +decodeTile(z, x, y)
`,e+=`  }
`,e+=`  class Layer {
`,e+=`    +string name
`,e+=`    +Feature[] features
`,e+=`    +string[] keys
`,e+=`    +Value[] values
`,e+=`    +uint32 extent
`,e+=`    +uint32 version
`,e+=`  }
`,e+=`  class Feature {
`,e+=`    +uint64 id
`,e+=`    +uint32[] tags
`,e+=`    +GeomType type
`,e+=`    +uint32[] geometry
`,e+=`  }
`,e+=`  class Value {
`,e+=`    +string string_value
`,e+=`    +float float_value
`,e+=`    +double double_value
`,e+=`    +int64 int_value
`,e+=`    +bool bool_value
`,e+=`  }
`,e+=`  class GeomType {
`,e+=`    <<enumeration>>
`,e+=`    UNKNOWN : 0
`,e+=`    POINT : 1
`,e+=`    LINESTRING : 2
`,e+=`    POLYGON : 3
`,e+=`  }
`,e+=`  Tile *-- Layer : contains
`,e+=`  Layer *-- Feature : encodes
`,e+=`  Layer *-- Value : dictionary
`,e+=`  Feature --> GeomType : classifies
`,e}function _(t){const e=t.trim();if(/^(POINT|LINESTRING|POLYGON|MULTIPOINT|MULTILINESTRING|MULTIPOLYGON|GEOMETRYCOLLECTION)\s*(?:Z|M|ZM)?\s*[\(\[]/i.test(e)||e.includes("POLYGON")||e.includes("LINESTRING")||e.includes("POINT"))return I(e);if(e.includes("{z}")||e.includes("{x}")||e.includes("{y}")||/Tile\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/i.test(e))return G();if(/ShapeType|BBOX|BoundingBox|DBF|ESRI\s*Shapefile|\bFID\b/i.test(e))return N();const a=e.split(`
`).map(p=>p.trim()).filter(Boolean);let s=`flowchart TD
`;return s+=`  classDef geo fill:#0f172a,stroke:#38bdf8,stroke-width:1.5px,color:#f8fafc;
`,a.slice(0,15).forEach((p,o)=>{p.includes("->")||p.includes("-->")?s+=`  ${p}
`:s+=`  node_${o}["🌐 ${y(p)}"]:::geo
`}),s||`flowchart TD
  Geo["Geospatial Layer"]`}function I(t){const e=t.split(`
`).map(s=>s.trim()).filter(Boolean);let n=`flowchart TD
`;n+=`  %% WKT (Well-Known Text) Spatial Geometry Topology
`,n+=`  classDef point fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;
`,n+=`  classDef line fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#f8fafc;
`,n+=`  classDef poly fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#f8fafc;

`;let a=0;for(const s of e.slice(0,12)){const p=s.match(/^([A-Za-z]+)\s*(?:Z|M|ZM)?\s*\((.+)\)$/s);if(!p)continue;const o=p[1].toUpperCase(),r=p[2].match(/-?\d+(?:\.\d+)?\s+-?\d+(?:\.\d+)?/g)||[],c=b(o),u=o.includes("POINT")?"point":o.includes("LINE")?"line":"poly";if(n+=`  subgraph WKT_${a}["${c} ${o} #${a+1}"]
`,n+=`    wkt_node_${a}["${o}<br/><small>Vertices: ${r.length}</small>"]:::${u}
`,r.length>0){const i=r.slice(0,3).join("<br/>");n+=`    wkt_coords_${a}["Coordinates Sample:<br/><small>${i}</small>"]
`,n+=`    wkt_node_${a} --- wkt_coords_${a}
`}n+=`  end

`,a++}return a===0&&(n+=`  WKT_Generic["🗺️ WKT Spatial Entity<br/><small>${y(t.slice(0,80))}</small>"]:::poly
`),n}function G(t){let e=`flowchart TD
`;return e+=`  %% Vector Tile Pyramid (MVT / Protobuf) Hierarchy
`,e+=`  classDef tile fill:#0f172a,stroke:#0284c7,stroke-width:2px,color:#f0f9ff;
`,e+=`  classDef pmtiles fill:#1e1b4b,stroke:#a855f7,stroke-width:2px,color:#faf5ff;

`,e+=`  subgraph Pyramid["Vector Tile Pyramid Architecture (MVT)"]
`,e+=`    Z0["Zoom 0: Global World (1 Tile: 0/0/0)"]:::tile
`,e+=`    Z4["Zoom 4: Continental & Country Basemap (256 Tiles)"]:::tile
`,e+=`    Z10["Zoom 10: Metropolitan & Road Network (1M Tiles)"]:::tile
`,e+=`    Z14["Zoom 14+: High-Precision Building Footprints (268M Tiles)"]:::tile
`,e+=`    Archive["PMTiles / MBTiles Archive (Protobuf / GZip Compressed)"]:::pmtiles
`,e+=`  end

`,e+=`  Z0 --> Z4 --> Z10 --> Z14
`,e+=`  Z14 --> Archive
`,e}function N(t){let e=`flowchart TD
`;return e+=`  %% ESRI Shapefile Multi-Layer Architecture Schema
`,e+=`  classDef shp fill:#1e293b,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;
`,e+=`  classDef dbf fill:#0f172a,stroke:#34d399,stroke-width:1.5px,color:#f0fdf4;
`,e+=`  classDef shx fill:#18181b,stroke:#a1a1aa,stroke-width:1px,color:#f4f4f5;

`,e+=`  subgraph ShapefileBundle["ESRI Shapefile Component Bundle"]
`,e+=`    SHP[".SHP: Vector Geometry Records<br/><small>Direct binary coordinate array</small>"]:::shp
`,e+=`    SHX[".SHX: Spatial Index<br/><small>Offset and content lengths</small>"]:::shx
`,e+=`    DBF[".DBF: dBASE Attribute Table<br/><small>Tabular entity properties</small>"]:::dbf
`,e+=`    PRJ[".PRJ: Projection Metadata<br/><small>WKT Coordinate Reference System (CRS)</small>"]
`,e+=`  end

`,e+=`  SHX -->|byte offset pointer| SHP
`,e+=`  SHP ---|record alignment 1:1| DBF
`,e+=`  PRJ -.->|transforms coordinates| SHP
`,e}function F(t,e=""){if(!t)return`flowchart TD
  Empty["Empty Geospatial Dataset"]`;if(t instanceof ArrayBuffer||ArrayBuffer.isView(t)){const a=t instanceof ArrayBuffer?new Uint8Array(t):new Uint8Array(t.buffer,t.byteOffset,t.byteLength);return S(a,e)}if(typeof t!="string")return`flowchart TD
  Empty["Empty Geospatial Dataset"]`;const n=t.trim();if(n.startsWith("data:")&&n.includes(";base64,"))try{const a=n.split(";base64,")[1],s=atob(a),p=new Uint8Array(s.length);for(let o=0;o<s.length;o++)p[o]=s.charCodeAt(o);return S(p,e)}catch{}if(n.includes(`\0\0'
`)||n.length>4&&n.charCodeAt(0)===0&&n.charCodeAt(1)===0){const a=new Uint8Array(n.length);for(let s=0;s<n.length;s++)a[s]=n.charCodeAt(s)&255;return S(a,e)}if(n.includes('syntax = "proto2"')||n.includes('syntax = "proto3"')||n.includes("package vector_tile")||n.includes("message Tile")||n.includes("message Layer")||n.includes("vector_tile")||n.includes("TilePyramid"))return L();try{const a=JSON.parse(n);return A(a)}catch{return _(n)}}function A(t){var n,a,s,p;if(Array.isArray(t)){let o=`flowchart TD
`;return o+=`  %% ESRI Shapefile (.shp / .dbf) Feature Table
`,o+=`  classDef shp fill:#1e293b,stroke:#38bdf8,stroke-width:1.5px,color:#f8fafc,rx:8px;
`,o+=`  subgraph Shapefile["ESRI Shapefile Layer: Attribute & Geometry Records"]
`,t.slice(0,10).forEach((r,c)=>{const u=r.name||r.NAME||r.title||r.id||r.FID||`Record_${c+1}`,i=r.shape||r.SHAPE||r.geometry||r.type||"Feature",d=b(i);o+=`    rec_${c}["${d} ${y(u)}<br/><small style='opacity:0.7'>Type: ${i}</small>"]:::shp
`}),t.length>10&&(o+=`    rec_more["... and ${t.length-10} more spatial records"]
`),o+=`  end
`,o}if(t.type==="Topology"){const o=t.objects||{};let l=`flowchart TD
`;l+=`  %% TopoJSON Topology with Shared Arcs
`,l+=`  classDef topo fill:#0f172a,stroke:#10b981,stroke-width:2px,color:#f8fafc;
`,l+=`  subgraph TopoJSON["TopoJSON Topology (Shared Arc Compression)"]
`;let r=0;Object.keys(o).forEach(u=>{const i=o[u];l+=`    obj_${r}["🗺️ Layer: ${y(u)}<br/><small style='opacity:0.7'>Geometry: ${i.type||"GeometryCollection"}</small>"]:::topo
`,r++}),l+=`    Arcs["Shared Arcs Matrix<br/><small>${((n=t.arcs)==null?void 0:n.length)||0} topological boundary arcs</small>"]
`,l+=`  end
`;for(let u=0;u<r;u++)l+=`  obj_${u} -->|indexes| Arcs
`;return l}const e=t.type||(t.layers?"MapboxStyle":"FeatureCollection");if(t.sources||t.layers){let o=`flowchart TD
`;return o+=`  %% Mapbox GL / MapLibre Vector Tile Style Specification
`,o+=`  subgraph Style["Geospatial Map Style: ${y(t.name||"Vector Map")}"]
`,o+=`    Sources["Vector Tile Sources (MVT PBF)"]
`,(Array.isArray(t.layers)?t.layers.slice(0,8):[]).forEach((r,c)=>{o+=`    lyr_${c}["${b(r.type)} Layer: ${y(r.id)}<br/><small>${r.type||"fill"}</small>"]
`,o+=`    Sources --> lyr_${c}
`}),o+=`  end
`,o}if(e==="FeatureCollection"){const o=Array.isArray(t.features)?t.features:[];if(o.length===0)return`flowchart TD
  subgraph GeoJSON["GeoJSON: Empty FeatureCollection"]
    Empty["No spatial features defined"]
  end`;const l=new Map,r=[];o.forEach((i,d)=>{var x;const h=((x=i.geometry)==null?void 0:x.type)||"UnknownGeometry",f=i.properties||{},m=f.layer||f.category||h,g=f.name||f.title||f.id||`${h}_${d+1}`,$=`node_${d}_${String(g).replace(/[^a-zA-Z0-9_]/g,"_")}`;if(l.has(m)||l.set(m,[]),l.get(m).push({id:$,name:g,type:h,props:f}),f.target||f.destination||f.connectsTo){const w=String(f.target||f.destination||f.connectsTo).replace(/[^a-zA-Z0-9_]/g,"_");r.push({from:$,to:`node_${w}`,label:f.routeType||f.distance||"connects"})}});let c=`flowchart TD
`;c+=`  %% Geospatial FeatureCollection Topology
`,c+=`  classDef spatial fill:#1e293b,stroke:#38bdf8,stroke-width:1.5px,color:#f8fafc,rx:8px;
`,c+=`  classDef route fill:#0f172a,stroke:#818cf8,stroke-width:2px,color:#f1f5f9;

`,(s=(a=t.crs)==null?void 0:a.properties)!=null&&s.name&&(c+=`  CRS["🌐 Projection: ${y(t.crs.properties.name)}"]
`);let u=0;for(const[i,d]of l.entries()){const h=`layer_${u++}`;c+=`  subgraph ${h}["Spatial Layer: ${y(i)}"]
`,d.slice(0,8).forEach(f=>{const m=b(f.type);c+=`    ${f.id}["${m} ${y(f.name)}<br/><small style='opacity:0.7'>(${f.type})</small>"]:::spatial
`}),d.length>8&&(c+=`    ${h}_more["... and ${d.length-8} more features"]
`),c+=`  end

`}if(r.length>0)r.forEach(i=>{c+=`  ${i.from} -->|"${y(i.label)}"| ${i.to}
`});else{const i=Array.from(l.keys());for(let d=0;d<i.length-1;d++)c+=`  layer_${d} -.->|spatial overlay| layer_${d+1}
`}return c}if(e==="Feature"){const o=t.geometry||{},l=t.properties||{},r=l.name||"Geospatial Feature";return`flowchart TD
  subgraph Feature["Spatial Feature: ${y(r)}"]
    Geom["${b(o.type)} Geometry: ${o.type||"Point"}"]
    Props["Properties: ${Object.keys(l).length} attributes"]
    Geom --- Props
  end`}return["Polygon","MultiPolygon","Point","LineString","MultiLineString"].includes(e)?`flowchart TD
  subgraph Geometry["Single Spatial Geometry"]
    Type["${b(e)} Type: ${e}"]
    Coords["Coordinates count: ${((p=t.coordinates)==null?void 0:p.length)||0}"]
    Type --- Coords
  end`:`flowchart TD
  Dataset["Geospatial Dataset: ${y(e)}"]`}export{S as parseBinaryGeospatialToMermaid,F as parseGeoJsonToMermaid,I as parseWktToMermaid};
