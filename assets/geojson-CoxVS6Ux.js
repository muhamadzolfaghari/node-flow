function x(t){if(!t||typeof t!="string")return`flowchart TD
  Empty["Empty Geospatial Dataset"]`;const e=t.trim();if(e.includes('syntax = "proto2"')||e.includes('syntax = "proto3"')||e.includes("package vector_tile")||e.includes("message Tile")||e.includes("message Layer")||e.includes("vector_tile")||e.includes("TilePyramid"))return G();try{const l=JSON.parse(e);return D(l)}catch{return P(e)}}function D(t){var l,c,y,f;if(Array.isArray(t)){let n=`flowchart TD
`;return n+=`  %% ESRI Shapefile (.shp / .dbf) Feature Table
`,n+=`  classDef shp fill:#1e293b,stroke:#38bdf8,stroke-width:1.5px,color:#f8fafc,rx:8px;
`,n+=`  subgraph Shapefile["ESRI Shapefile Layer: Attribute & Geometry Records"]
`,t.slice(0,10).forEach((o,s)=>{const d=o.name||o.NAME||o.title||o.id||o.FID||`Record_${s+1}`,i=o.shape||o.SHAPE||o.geometry||o.type||"Feature",p=h(i);n+=`    rec_${s}["${p} ${u(d)}<br/><small style='opacity:0.7'>Type: ${i}</small>"]:::shp
`}),t.length>10&&(n+=`    rec_more["... and ${t.length-10} more spatial records"]
`),n+=`  end
`,n}if(t.type==="Topology"){const n=t.objects||{};let r=`flowchart TD
`;r+=`  %% TopoJSON Topology with Shared Arcs
`,r+=`  classDef topo fill:#0f172a,stroke:#10b981,stroke-width:2px,color:#f8fafc;
`,r+=`  subgraph TopoJSON["TopoJSON Topology (Shared Arc Compression)"]
`;let o=0;Object.keys(n).forEach(d=>{const i=n[d];r+=`    obj_${o}["🗺️ Layer: ${u(d)}<br/><small style='opacity:0.7'>Geometry: ${i.type||"GeometryCollection"}</small>"]:::topo
`,o++}),r+=`    Arcs["Shared Arcs Matrix<br/><small>${((l=t.arcs)==null?void 0:l.length)||0} topological boundary arcs</small>"]
`,r+=`  end
`;for(let d=0;d<o;d++)r+=`  obj_${d} -->|indexes| Arcs
`;return r}const e=t.type||(t.layers?"MapboxStyle":"FeatureCollection");if(t.sources||t.layers){let n=`flowchart TD
`;return n+=`  %% Mapbox GL / MapLibre Vector Tile Style Specification
`,n+=`  subgraph Style["Geospatial Map Style: ${u(t.name||"Vector Map")}"]
`,n+=`    Sources["Vector Tile Sources (MVT PBF)"]
`,(Array.isArray(t.layers)?t.layers.slice(0,8):[]).forEach((o,s)=>{n+=`    lyr_${s}["${h(o.type)} Layer: ${u(o.id)}<br/><small>${o.type||"fill"}</small>"]
`,n+=`    Sources --> lyr_${s}
`}),n+=`  end
`,n}if(e==="FeatureCollection"){const n=Array.isArray(t.features)?t.features:[];if(n.length===0)return`flowchart TD
  subgraph GeoJSON["GeoJSON: Empty FeatureCollection"]
    Empty["No spatial features defined"]
  end`;const r=new Map,o=[];n.forEach((i,p)=>{var $;const m=(($=i.geometry)==null?void 0:$.type)||"UnknownGeometry",a=i.properties||{},T=a.layer||a.category||m,b=a.name||a.title||a.id||`${m}_${p+1}`,S=`node_${p}_${String(b).replace(/[^a-zA-Z0-9_]/g,"_")}`;if(r.has(T)||r.set(T,[]),r.get(T).push({id:S,name:b,type:m,props:a}),a.target||a.destination||a.connectsTo){const g=String(a.target||a.destination||a.connectsTo).replace(/[^a-zA-Z0-9_]/g,"_");o.push({from:S,to:`node_${g}`,label:a.routeType||a.distance||"connects"})}});let s=`flowchart TD
`;s+=`  %% Geospatial FeatureCollection Topology
`,s+=`  classDef spatial fill:#1e293b,stroke:#38bdf8,stroke-width:1.5px,color:#f8fafc,rx:8px;
`,s+=`  classDef route fill:#0f172a,stroke:#818cf8,stroke-width:2px,color:#f1f5f9;

`,(y=(c=t.crs)==null?void 0:c.properties)!=null&&y.name&&(s+=`  CRS["🌐 Projection: ${u(t.crs.properties.name)}"]
`);let d=0;for(const[i,p]of r.entries()){const m=`layer_${d++}`;s+=`  subgraph ${m}["Spatial Layer: ${u(i)}"]
`,p.slice(0,8).forEach(a=>{const T=h(a.type);s+=`    ${a.id}["${T} ${u(a.name)}<br/><small style='opacity:0.7'>(${a.type})</small>"]:::spatial
`}),p.length>8&&(s+=`    ${m}_more["... and ${p.length-8} more features"]
`),s+=`  end

`}if(o.length>0)o.forEach(i=>{s+=`  ${i.from} -->|"${u(i.label)}"| ${i.to}
`});else{const i=Array.from(r.keys());for(let p=0;p<i.length-1;p++)s+=`  layer_${p} -.->|spatial overlay| layer_${p+1}
`}return s}if(e==="Feature"){const n=t.geometry||{},r=t.properties||{},o=r.name||"Geospatial Feature";return`flowchart TD
  subgraph Feature["Spatial Feature: ${u(o)}"]
    Geom["${h(n.type)} Geometry: ${n.type||"Point"}"]
    Props["Properties: ${Object.keys(r).length} attributes"]
    Geom --- Props
  end`}return["Polygon","MultiPolygon","Point","LineString","MultiLineString"].includes(e)?`flowchart TD
  subgraph Geometry["Single Spatial Geometry"]
    Type["${h(e)} Type: ${e}"]
    Coords["Coordinates count: ${((f=t.coordinates)==null?void 0:f.length)||0}"]
    Type --- Coords
  end`:`flowchart TD
  Dataset["Geospatial Dataset: ${u(e)}"]`}function G(t){let e=`classDiagram
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
`,e}function P(t){const e=t.trim();if(/^(POINT|LINESTRING|POLYGON|MULTIPOINT|MULTILINESTRING|MULTIPOLYGON|GEOMETRYCOLLECTION)\s*(?:Z|M|ZM)?\s*[\(\[]/i.test(e)||e.includes("POLYGON")||e.includes("LINESTRING")||e.includes("POINT"))return k(e);if(e.includes("{z}")||e.includes("{x}")||e.includes("{y}")||/Tile\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/i.test(e))return M();if(/ShapeType|BBOX|BoundingBox|DBF|ESRI\s*Shapefile|\bFID\b/i.test(e))return _();const c=e.split(`
`).map(f=>f.trim()).filter(Boolean);let y=`flowchart TD
`;return y+=`  classDef geo fill:#0f172a,stroke:#38bdf8,stroke-width:1.5px,color:#f8fafc;
`,c.slice(0,15).forEach((f,n)=>{f.includes("->")||f.includes("-->")?y+=`  ${f}
`:y+=`  node_${n}["🌐 ${u(f)}"]:::geo
`}),y||`flowchart TD
  Geo["Geospatial Layer"]`}function k(t){const e=t.split(`
`).map(y=>y.trim()).filter(Boolean);let l=`flowchart TD
`;l+=`  %% WKT (Well-Known Text) Spatial Geometry Topology
`,l+=`  classDef point fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;
`,l+=`  classDef line fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#f8fafc;
`,l+=`  classDef poly fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#f8fafc;

`;let c=0;for(const y of e.slice(0,12)){const f=y.match(/^([A-Za-z]+)\s*(?:Z|M|ZM)?\s*\((.+)\)$/s);if(!f)continue;const n=f[1].toUpperCase(),o=f[2].match(/-?\d+(?:\.\d+)?\s+-?\d+(?:\.\d+)?/g)||[],s=h(n),d=n.includes("POINT")?"point":n.includes("LINE")?"line":"poly";if(l+=`  subgraph WKT_${c}["${s} ${n} #${c+1}"]
`,l+=`    wkt_node_${c}["${n}<br/><small>Vertices: ${o.length}</small>"]:::${d}
`,o.length>0){const i=o.slice(0,3).join("<br/>");l+=`    wkt_coords_${c}["Coordinates Sample:<br/><small>${i}</small>"]
`,l+=`    wkt_node_${c} --- wkt_coords_${c}
`}l+=`  end

`,c++}return c===0&&(l+=`  WKT_Generic["🗺️ WKT Spatial Entity<br/><small>${u(t.slice(0,80))}</small>"]:::poly
`),l}function M(t){let e=`flowchart TD
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
`,e}function _(t){let e=`flowchart TD
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
`,e}function h(t){const e=String(t||"").toLowerCase();return e.includes("point")?"📍":e.includes("line")?"🛣️":e.includes("poly")?"🗺️":e.includes("tile")||e.includes("mvt")||e.includes("pbf")?"🧱":"🌐"}function u(t){return String(t||"").replace(/"/g,"'").replace(/[<>]/g,"")}export{x as parseGeoJsonToMermaid,k as parseWktToMermaid};
