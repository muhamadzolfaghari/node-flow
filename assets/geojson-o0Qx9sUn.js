function E(t,e=""){if(!t)return`flowchart TD
  Empty["Empty Geospatial Dataset"]`;if(t instanceof ArrayBuffer||ArrayBuffer.isView(t)){const c=t instanceof ArrayBuffer?new Uint8Array(t):new Uint8Array(t.buffer,t.byteOffset,t.byteLength);return k(c,e)}if(typeof t!="string")return`flowchart TD
  Empty["Empty Geospatial Dataset"]`;const n=t.trim();if(n.startsWith("data:")&&n.includes(";base64,"))try{const c=n.split(";base64,")[1],f=atob(c),s=new Uint8Array(f.length);for(let o=0;o<f.length;o++)s[o]=f.charCodeAt(o);return k(s,e)}catch{}if(n.includes(`\0\0'
`)||n.length>4&&n.charCodeAt(0)===0&&n.charCodeAt(1)===0){const c=new Uint8Array(n.length);for(let f=0;f<n.length;f++)c[f]=n.charCodeAt(f)&255;return k(c,e)}if(n.includes('syntax = "proto2"')||n.includes('syntax = "proto3"')||n.includes("package vector_tile")||n.includes("message Tile")||n.includes("message Layer")||n.includes("vector_tile")||n.includes("TilePyramid"))return I();try{const c=JSON.parse(n);return _(c)}catch{return G(n)}}function k(t,e=""){return t.length>=100&&t[0]===0&&t[1]===0&&t[2]===39&&t[3]===10?M(t,e):t.length>=32&&(t[0]===3||t[0]===131||t[0]===245)?P(t,e):L(t,e)}function M(t,e=""){const n=new DataView(t.buffer,t.byteOffset,t.byteLength),c=n.getInt32(32,!0),f=n.getFloat64(36,!0),s=n.getFloat64(44,!0),o=n.getFloat64(52,!0),i=n.getFloat64(60,!0),r={0:"Null Shape",1:"Point",3:"PolyLine",5:"Polygon",8:"MultiPoint",11:"PointZ",13:"PolyLineZ",15:"PolygonZ",18:"MultiPointZ",21:"PointM",23:"PolyLineM",25:"PolygonM",31:"MultiPatch"},l=r[c]||`ShapeType_${c}`,d=g(l);let p=100,u=0;const h=[];for(;p+8<=t.length;){const m=n.getInt32(p,!1),b=n.getInt32(p+4,!1)*2;if(u++,h.length<8&&p+8+4<=t.length){const $=n.getInt32(p+8,!0);h.push({num:m,type:r[$]||l,bytes:b})}p+=8+b}let a=`flowchart TD
`;return a+=`  %% ESRI Shapefile Binary Dataset
`,a+=`  classDef meta fill:#041f2a,stroke:#06b6d4,stroke-width:2px,color:#e0f2fe,rx:8px;
`,a+=`  classDef geom fill:#03251e,stroke:#10b981,stroke-width:1.5px,color:#f0fdf4,rx:8px;
`,a+=`  classDef bbox fill:#241804,stroke:#f59e0b,stroke-width:1.5px,color:#fef3c7,rx:8px;
`,a+=`  subgraph SHP["🗺️ ESRI Shapefile: ${y(e||"Dataset.shp")}"]
`,a+=`    Meta["📦 Shapefile Layer Header<br/><small style='opacity:0.8'>Primary Geometry: ${d} <b>${l}</b> • ${u||"Active"} Records • ${(t.length/1024).toFixed(1)} KB</small>"]:::meta
`,a+=`    BBox["🌐 Spatial Extent (Bounding Box)<br/><small style='opacity:0.8'>West: ${Number.isFinite(f)?f.toFixed(4):"-180"}, South: ${Number.isFinite(s)?s.toFixed(4):"-90"}<br/>East: ${Number.isFinite(o)?o.toFixed(4):"180"}, North: ${Number.isFinite(i)?i.toFixed(4):"90"}</small>"]:::bbox
`,a+=`    Meta --> BBox
`,h.length>0&&(a+=`    subgraph Records["Geometry Feature Records"]
`,h.forEach((m,T)=>{a+=`      rec_${T}["${d} Feature #${m.num}<br/><small style='opacity:0.8'>${m.type} (${m.bytes} bytes)</small>"]:::geom
`}),u>h.length&&(a+=`      more_rec["... and ${u-h.length} additional spatial features"]
`),a+=`    end
`,a+=`    Meta --> Records
`),a+=`  end
`,a}function P(t,e=""){const n=new DataView(t.buffer,t.byteOffset,t.byteLength),c=n.getInt32(4,!0),f=n.getInt16(8,!0),s=[];let o=32;for(;o+32<=f&&t[o]!==13&&o<t.length;){let r="";for(let p=0;p<11;p++){const u=t[o+p];if(u===0)break;r+=String.fromCharCode(u)}const l=String.fromCharCode(t[o+11]),d=t[o+16];r.trim()&&s.push({name:r.trim(),type:l,len:d}),o+=32}let i=`flowchart TD
`;return i+=`  %% ESRI Shapefile Attribute Table (.dbf)
`,i+=`  classDef dbf fill:#041f2a,stroke:#38bdf8,stroke-width:2px,color:#e0f2fe,rx:8px;
`,i+=`  classDef col fill:#03251e,stroke:#10b981,stroke-width:1.5px,color:#f0fdf4,rx:8px;
`,i+=`  subgraph DBF["📊 Shapefile Attribute Table: ${y(e||"Attributes.dbf")}"]
`,i+=`    Table["dBASE III Attribute Records<br/><small style='opacity:0.8'>${c} Rows • ${s.length} Columns</small>"]:::dbf
`,s.slice(0,10).forEach((r,l)=>{i+=`    col_${l}["Field: <b>${y(r.name)}</b><br/><small style='opacity:0.8'>Type: ${r.type} (${r.len} bytes)</small>"]:::col
`,i+=`    Table --> col_${l}
`}),i+=`  end
`,i}function L(t,e=""){let n=0;const c=[];function f(){let r=0,l=0;for(;n<t.length;){const d=t[n++];if(r|=(d&127)<<l,(d&128)===0)break;l+=7}return r}try{for(;n<t.length;){const r=f(),l=r&7,d=r>>>3;if(l===2){const p=f(),u=n+p;if(d===3){let h=`Layer_${c.length+1}`,a=0,m=4096,T=2;const b=[];for(;n<u&&n<t.length;){const $=f(),x=$&7,w=$>>>3;if(x===2){const S=f();if(w===1){const D=t.subarray(n,n+S);h=new TextDecoder().decode(D)}else w===2?a++:w===3&&b.length<5&&b.push(new TextDecoder().decode(t.subarray(n,n+S)));n+=S}else if(x===0){const S=f();w===5&&(m=S),w===15&&(T=S)}else if(x===5)n+=4;else if(x===1)n+=8;else break}c.push({name:h,count:a,extent:m,version:T,keys:b})}n=u}else if(l===0)f();else if(l===5)n+=4;else if(l===1)n+=8;else break}}catch{}let s=`flowchart TD
`;s+=`  %% Mapbox Vector Tile (MVT PBF) Binary Tile Structure
`,s+=`  classDef tile fill:#041f2a,stroke:#06b6d4,stroke-width:2px,color:#e0f2fe,rx:8px;
`,s+=`  classDef lyr fill:#03251e,stroke:#10b981,stroke-width:1.5px,color:#f0fdf4,rx:8px;
`,s+=`  classDef attr fill:#241804,stroke:#f59e0b,stroke-width:1.5px,color:#fef3c7,rx:8px;
`;const o=e?y(e):"Tile [z/x/y.pbf]",i=c.length||1;return s+=`  subgraph TileRoot["📦 Vector Tile Protobuf: ${o}"]
`,s+=`    TileInfo["🗺️ MVT Tile Matrix<br/><small style='opacity:0.8'>Specification: MVT v2.1 • Size: ${(t.length/1024).toFixed(1)} KB • ${i} Vector Layers</small>"]:::tile
`,c.length===0?(s+=`    Lyr0["Layer: default<br/><small>Extent: 4096 • Features: Vector Tile Geometries</small>"]:::lyr
`,s+=`    TileInfo --> Lyr0
`):c.forEach((r,l)=>{const d=g(r.name);s+=`    lyr_${l}["${d} Layer: <b>${y(r.name)}</b><br/><small style='opacity:0.8'>Extent: ${r.extent}x${r.extent} • ${r.count} Features</small>"]:::lyr
`,s+=`    TileInfo --> lyr_${l}
`,r.keys&&r.keys.length>0&&(s+=`    keys_${l}["🏷️ Attributes<br/><small style='opacity:0.8'>${r.keys.map(y).join(", ")}</small>"]:::attr
`,s+=`    lyr_${l} --> keys_${l}
`)}),s+=`  end
`,s}function _(t){var n,c,f,s;if(Array.isArray(t)){let o=`flowchart TD
`;return o+=`  %% ESRI Shapefile (.shp / .dbf) Feature Table
`,o+=`  classDef shp fill:#1e293b,stroke:#38bdf8,stroke-width:1.5px,color:#f8fafc,rx:8px;
`,o+=`  subgraph Shapefile["ESRI Shapefile Layer: Attribute & Geometry Records"]
`,t.slice(0,10).forEach((r,l)=>{const d=r.name||r.NAME||r.title||r.id||r.FID||`Record_${l+1}`,p=r.shape||r.SHAPE||r.geometry||r.type||"Feature",u=g(p);o+=`    rec_${l}["${u} ${y(d)}<br/><small style='opacity:0.7'>Type: ${p}</small>"]:::shp
`}),t.length>10&&(o+=`    rec_more["... and ${t.length-10} more spatial records"]
`),o+=`  end
`,o}if(t.type==="Topology"){const o=t.objects||{};let i=`flowchart TD
`;i+=`  %% TopoJSON Topology with Shared Arcs
`,i+=`  classDef topo fill:#0f172a,stroke:#10b981,stroke-width:2px,color:#f8fafc;
`,i+=`  subgraph TopoJSON["TopoJSON Topology (Shared Arc Compression)"]
`;let r=0;Object.keys(o).forEach(d=>{const p=o[d];i+=`    obj_${r}["🗺️ Layer: ${y(d)}<br/><small style='opacity:0.7'>Geometry: ${p.type||"GeometryCollection"}</small>"]:::topo
`,r++}),i+=`    Arcs["Shared Arcs Matrix<br/><small>${((n=t.arcs)==null?void 0:n.length)||0} topological boundary arcs</small>"]
`,i+=`  end
`;for(let d=0;d<r;d++)i+=`  obj_${d} -->|indexes| Arcs
`;return i}const e=t.type||(t.layers?"MapboxStyle":"FeatureCollection");if(t.sources||t.layers){let o=`flowchart TD
`;return o+=`  %% Mapbox GL / MapLibre Vector Tile Style Specification
`,o+=`  subgraph Style["Geospatial Map Style: ${y(t.name||"Vector Map")}"]
`,o+=`    Sources["Vector Tile Sources (MVT PBF)"]
`,(Array.isArray(t.layers)?t.layers.slice(0,8):[]).forEach((r,l)=>{o+=`    lyr_${l}["${g(r.type)} Layer: ${y(r.id)}<br/><small>${r.type||"fill"}</small>"]
`,o+=`    Sources --> lyr_${l}
`}),o+=`  end
`,o}if(e==="FeatureCollection"){const o=Array.isArray(t.features)?t.features:[];if(o.length===0)return`flowchart TD
  subgraph GeoJSON["GeoJSON: Empty FeatureCollection"]
    Empty["No spatial features defined"]
  end`;const i=new Map,r=[];o.forEach((p,u)=>{var $;const h=(($=p.geometry)==null?void 0:$.type)||"UnknownGeometry",a=p.properties||{},m=a.layer||a.category||h,T=a.name||a.title||a.id||`${h}_${u+1}`,b=`node_${u}_${String(T).replace(/[^a-zA-Z0-9_]/g,"_")}`;if(i.has(m)||i.set(m,[]),i.get(m).push({id:b,name:T,type:h,props:a}),a.target||a.destination||a.connectsTo){const x=String(a.target||a.destination||a.connectsTo).replace(/[^a-zA-Z0-9_]/g,"_");r.push({from:b,to:`node_${x}`,label:a.routeType||a.distance||"connects"})}});let l=`flowchart TD
`;l+=`  %% Geospatial FeatureCollection Topology
`,l+=`  classDef spatial fill:#1e293b,stroke:#38bdf8,stroke-width:1.5px,color:#f8fafc,rx:8px;
`,l+=`  classDef route fill:#0f172a,stroke:#818cf8,stroke-width:2px,color:#f1f5f9;

`,(f=(c=t.crs)==null?void 0:c.properties)!=null&&f.name&&(l+=`  CRS["🌐 Projection: ${y(t.crs.properties.name)}"]
`);let d=0;for(const[p,u]of i.entries()){const h=`layer_${d++}`;l+=`  subgraph ${h}["Spatial Layer: ${y(p)}"]
`,u.slice(0,8).forEach(a=>{const m=g(a.type);l+=`    ${a.id}["${m} ${y(a.name)}<br/><small style='opacity:0.7'>(${a.type})</small>"]:::spatial
`}),u.length>8&&(l+=`    ${h}_more["... and ${u.length-8} more features"]
`),l+=`  end

`}if(r.length>0)r.forEach(p=>{l+=`  ${p.from} -->|"${y(p.label)}"| ${p.to}
`});else{const p=Array.from(i.keys());for(let u=0;u<p.length-1;u++)l+=`  layer_${u} -.->|spatial overlay| layer_${u+1}
`}return l}if(e==="Feature"){const o=t.geometry||{},i=t.properties||{},r=i.name||"Geospatial Feature";return`flowchart TD
  subgraph Feature["Spatial Feature: ${y(r)}"]
    Geom["${g(o.type)} Geometry: ${o.type||"Point"}"]
    Props["Properties: ${Object.keys(i).length} attributes"]
    Geom --- Props
  end`}return["Polygon","MultiPolygon","Point","LineString","MultiLineString"].includes(e)?`flowchart TD
  subgraph Geometry["Single Spatial Geometry"]
    Type["${g(e)} Type: ${e}"]
    Coords["Coordinates count: ${((s=t.coordinates)==null?void 0:s.length)||0}"]
    Type --- Coords
  end`:`flowchart TD
  Dataset["Geospatial Dataset: ${y(e)}"]`}function I(t){let e=`classDiagram
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
`,e}function G(t){const e=t.trim();if(/^(POINT|LINESTRING|POLYGON|MULTIPOINT|MULTILINESTRING|MULTIPOLYGON|GEOMETRYCOLLECTION)\s*(?:Z|M|ZM)?\s*[\(\[]/i.test(e)||e.includes("POLYGON")||e.includes("LINESTRING")||e.includes("POINT"))return N(e);if(e.includes("{z}")||e.includes("{x}")||e.includes("{y}")||/Tile\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/i.test(e))return A();if(/ShapeType|BBOX|BoundingBox|DBF|ESRI\s*Shapefile|\bFID\b/i.test(e))return F();const c=e.split(`
`).map(s=>s.trim()).filter(Boolean);let f=`flowchart TD
`;return f+=`  classDef geo fill:#0f172a,stroke:#38bdf8,stroke-width:1.5px,color:#f8fafc;
`,c.slice(0,15).forEach((s,o)=>{s.includes("->")||s.includes("-->")?f+=`  ${s}
`:f+=`  node_${o}["🌐 ${y(s)}"]:::geo
`}),f||`flowchart TD
  Geo["Geospatial Layer"]`}function N(t){const e=t.split(`
`).map(f=>f.trim()).filter(Boolean);let n=`flowchart TD
`;n+=`  %% WKT (Well-Known Text) Spatial Geometry Topology
`,n+=`  classDef point fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;
`,n+=`  classDef line fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#f8fafc;
`,n+=`  classDef poly fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#f8fafc;

`;let c=0;for(const f of e.slice(0,12)){const s=f.match(/^([A-Za-z]+)\s*(?:Z|M|ZM)?\s*\((.+)\)$/s);if(!s)continue;const o=s[1].toUpperCase(),r=s[2].match(/-?\d+(?:\.\d+)?\s+-?\d+(?:\.\d+)?/g)||[],l=g(o),d=o.includes("POINT")?"point":o.includes("LINE")?"line":"poly";if(n+=`  subgraph WKT_${c}["${l} ${o} #${c+1}"]
`,n+=`    wkt_node_${c}["${o}<br/><small>Vertices: ${r.length}</small>"]:::${d}
`,r.length>0){const p=r.slice(0,3).join("<br/>");n+=`    wkt_coords_${c}["Coordinates Sample:<br/><small>${p}</small>"]
`,n+=`    wkt_node_${c} --- wkt_coords_${c}
`}n+=`  end

`,c++}return c===0&&(n+=`  WKT_Generic["🗺️ WKT Spatial Entity<br/><small>${y(t.slice(0,80))}</small>"]:::poly
`),n}function A(t){let e=`flowchart TD
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
`,e}function F(t){let e=`flowchart TD
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
`,e}function g(t){const e=String(t||"").toLowerCase();return e.includes("point")?"📍":e.includes("line")?"🛣️":e.includes("poly")?"🗺️":e.includes("tile")||e.includes("mvt")||e.includes("pbf")?"🧱":"🌐"}function y(t){return String(t||"").replace(/"/g,"'").replace(/[<>]/g,"")}export{k as parseBinaryGeospatialToMermaid,E as parseGeoJsonToMermaid,N as parseWktToMermaid};
