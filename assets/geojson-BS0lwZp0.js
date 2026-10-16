function M(t){if(!t||typeof t!="string")return`flowchart TD
  Empty["Empty Geospatial Dataset"]`;const e=t.trim();if(e.includes('syntax = "proto2"')||e.includes('syntax = "proto3"')||e.includes("package vector_tile")||e.includes("message Tile")||e.includes("message Layer")||e.includes("vector_tile")||e.includes("TilePyramid"))return _();try{const u=JSON.parse(e);return G(u)}catch{return D(e)}}function G(t){var u,y,h,T;if(Array.isArray(t)){let n=`flowchart TD
`;return n+=`  %% ESRI Shapefile (.shp / .dbf) Feature Table
`,n+=`  classDef shp fill:#1e293b,stroke:#38bdf8,stroke-width:1.5px,color:#f8fafc,rx:8px;
`,n+=`  subgraph Shapefile["ESRI Shapefile Layer: Attribute & Geometry Records"]
`,t.slice(0,10).forEach((r,s)=>{const p=r.name||r.NAME||r.title||r.id||r.FID||`Record_${s+1}`,l=r.shape||r.SHAPE||r.geometry||r.type||"Feature",c=m(l);n+=`    rec_${s}["${c} ${i(p)}<br/><small style='opacity:0.7'>Type: ${l}</small>"]:::shp
`}),t.length>10&&(n+=`    rec_more["... and ${t.length-10} more spatial records"]
`),n+=`  end
`,n}if(t.type==="Topology"){const n=t.objects||{};let a=`flowchart TD
`;a+=`  %% TopoJSON Topology with Shared Arcs
`,a+=`  classDef topo fill:#0f172a,stroke:#10b981,stroke-width:2px,color:#f8fafc;
`,a+=`  subgraph TopoJSON["TopoJSON Topology (Shared Arc Compression)"]
`;let r=0;Object.keys(n).forEach(p=>{const l=n[p];a+=`    obj_${r}["🗺️ Layer: ${i(p)}<br/><small style='opacity:0.7'>Geometry: ${l.type||"GeometryCollection"}</small>"]:::topo
`,r++}),a+=`    Arcs["Shared Arcs Matrix<br/><small>${((u=t.arcs)==null?void 0:u.length)||0} topological boundary arcs</small>"]
`,a+=`  end
`;for(let p=0;p<r;p++)a+=`  obj_${p} -->|indexes| Arcs
`;return a}const e=t.type||(t.layers?"MapboxStyle":"FeatureCollection");if(t.sources||t.layers){let n=`flowchart TD
`;return n+=`  %% Mapbox GL / MapLibre Vector Tile Style Specification
`,n+=`  subgraph Style["Geospatial Map Style: ${i(t.name||"Vector Map")}"]
`,n+=`    Sources["Vector Tile Sources (MVT PBF)"]
`,(Array.isArray(t.layers)?t.layers.slice(0,8):[]).forEach((r,s)=>{n+=`    lyr_${s}["${m(r.type)} Layer: ${i(r.id)}<br/><small>${r.type||"fill"}</small>"]
`,n+=`    Sources --> lyr_${s}
`}),n+=`  end
`,n}if(e==="FeatureCollection"){const n=Array.isArray(t.features)?t.features:[];if(n.length===0)return`flowchart TD
  subgraph GeoJSON["GeoJSON: Empty FeatureCollection"]
    Empty["No spatial features defined"]
  end`;const a=new Map,r=[];n.forEach((l,c)=>{var g;const f=((g=l.geometry)==null?void 0:g.type)||"UnknownGeometry",o=l.properties||{},d=o.layer||o.category||f,$=o.name||o.title||o.id||`${f}_${c+1}`,b=`node_${c}_${String($).replace(/[^a-zA-Z0-9_]/g,"_")}`;if(a.has(d)||a.set(d,[]),a.get(d).push({id:b,name:$,type:f,props:o}),o.target||o.destination||o.connectsTo){const S=String(o.target||o.destination||o.connectsTo).replace(/[^a-zA-Z0-9_]/g,"_");r.push({from:b,to:`node_${S}`,label:o.routeType||o.distance||"connects"})}});let s=`flowchart TD
`;s+=`  %% Geospatial FeatureCollection Topology
`,s+=`  classDef spatial fill:#1e293b,stroke:#38bdf8,stroke-width:1.5px,color:#f8fafc,rx:8px;
`,s+=`  classDef route fill:#0f172a,stroke:#818cf8,stroke-width:2px,color:#f1f5f9;

`,(h=(y=t.crs)==null?void 0:y.properties)!=null&&h.name&&(s+=`  CRS["🌐 Projection: ${i(t.crs.properties.name)}"]
`);let p=0;for(const[l,c]of a.entries()){const f=`layer_${p++}`;s+=`  subgraph ${f}["Spatial Layer: ${i(l)}"]
`,c.slice(0,8).forEach(o=>{const d=m(o.type);s+=`    ${o.id}["${d} ${i(o.name)}<br/><small style='opacity:0.7'>(${o.type})</small>"]:::spatial
`}),c.length>8&&(s+=`    ${f}_more["... and ${c.length-8} more features"]
`),s+=`  end

`}if(r.length>0)r.forEach(l=>{s+=`  ${l.from} -->|"${i(l.label)}"| ${l.to}
`});else{const l=Array.from(a.keys());for(let c=0;c<l.length-1;c++)s+=`  layer_${c} -.->|spatial overlay| layer_${c+1}
`}return s}if(e==="Feature"){const n=t.geometry||{},a=t.properties||{},r=a.name||"Geospatial Feature";return`flowchart TD
  subgraph Feature["Spatial Feature: ${i(r)}"]
    Geom["${m(n.type)} Geometry: ${n.type||"Point"}"]
    Props["Properties: ${Object.keys(a).length} attributes"]
    Geom --- Props
  end`}return["Polygon","MultiPolygon","Point","LineString","MultiLineString"].includes(e)?`flowchart TD
  subgraph Geometry["Single Spatial Geometry"]
    Type["${m(e)} Type: ${e}"]
    Coords["Coordinates count: ${((T=t.coordinates)==null?void 0:T.length)||0}"]
    Type --- Coords
  end`:`flowchart TD
  Dataset["Geospatial Dataset: ${i(e)}"]`}function _(t){let e=`classDiagram
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
`,e}function D(t){const e=t.split(`
`).map(y=>y.trim()).filter(Boolean);let u=`flowchart TD
`;return e.slice(0,15).forEach((y,h)=>{y.includes("->")||y.includes("-->")?u+=`  ${y}
`:u+=`  node_${h}["${i(y)}"]
`}),u||`flowchart TD
  Geo["Geospatial Layer"]`}function m(t){switch(t){case"Point":case"MultiPoint":case"circle":return"📍";case"LineString":case"MultiLineString":case"line":return"🛣️";case"Polygon":case"MultiPolygon":case"fill":return"🗺️";default:return"🌐"}}function i(t){return String(t||"").replace(/"/g,"'").replace(/[<>]/g,"")}export{M as parseGeoJsonToMermaid};
