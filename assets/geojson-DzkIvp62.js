function D(n){if(!n||typeof n!="string")return`flowchart TD
  Empty["Empty Geospatial Dataset"]`;const e=n.trim();if(e.includes('syntax = "proto3"')||e.includes("message Tile")||e.includes("message Layer")||e.includes("vector_tile"))return $();try{const i=JSON.parse(e);return T(i)}catch{return G(e)}}function T(n){var i;const e=n.type||"FeatureCollection";if(e==="FeatureCollection"){const r=Array.isArray(n.features)?n.features:[];if(r.length===0)return`flowchart TD
  subgraph GeoJSON["GeoJSON: Empty FeatureCollection"]
    Empty["No spatial features defined"]
  end`;const a=new Map,p=[];r.forEach((l,o)=>{var d;const c=((d=l.geometry)==null?void 0:d.type)||"UnknownGeometry",t=l.properties||{},f=t.layer||t.category||c,y=t.name||t.title||t.id||`${c}_${o+1}`,m=`node_${o}_${String(y).replace(/[^a-zA-Z0-9_]/g,"_")}`;if(a.has(f)||a.set(f,[]),a.get(f).push({id:m,name:y,type:c,props:t}),t.target||t.destination||t.connectsTo){const h=String(t.target||t.destination||t.connectsTo).replace(/[^a-zA-Z0-9_]/g,"_");p.push({from:m,to:`node_${h}`,label:t.routeType||t.distance||"connects"})}});let s=`flowchart TD
`;s+=`  %% Geospatial FeatureCollection Topology
`,s+=`  classDef spatial fill:#1e293b,stroke:#38bdf8,stroke-width:1.5px,color:#f8fafc,rx:8px;
`,s+=`  classDef route fill:#0f172a,stroke:#818cf8,stroke-width:2px,color:#f1f5f9;

`;let g=0;for(const[l,o]of a.entries()){const c=`layer_${g++}`;s+=`  subgraph ${c}["Spatial Layer: ${u(l)}"]
`,o.slice(0,8).forEach(t=>{const f=b(t.type);s+=`    ${t.id}["${f} ${u(t.name)}<br/><small style='opacity:0.7'>(${t.type})</small>"]:::spatial
`}),o.length>8&&(s+=`    ${c}_more["... and ${o.length-8} more features"]
`),s+=`  end

`}if(p.length>0)p.forEach(l=>{s+=`  ${l.from} -->|"${u(l.label)}"| ${l.to}
`});else{const l=Array.from(a.keys());for(let o=0;o<l.length-1;o++)s+=`  layer_${o} -.->|spatial overlay| layer_${o+1}
`}return s}if(e==="Feature"){const r=n.geometry||{},a=n.properties||{},p=a.name||"Geospatial Feature";return`flowchart TD
  subgraph Feature["Spatial Feature: ${u(p)}"]
    Geom["Geometry: ${r.type||"Point"}"]
    Props["Properties: ${Object.keys(a).length} attributes"]
    Geom --- Props
  end`}return["Polygon","MultiPolygon","Point","LineString"].includes(e)?`flowchart TD
  subgraph Geometry["Single Spatial Geometry"]
    Type["Type: ${e}"]
    Coords["Coordinates count: ${((i=n.coordinates)==null?void 0:i.length)||0}"]
    Type --- Coords
  end`:`flowchart TD
  Dataset["Geospatial Dataset: ${u(e)}"]`}function $(n){let e=`classDiagram
`;return e+=`  %% Mapbox Vector Tile (MVT) Protobuf Schema
`,e+=`  class Tile {
`,e+=`    +Layer[] layers
`,e+=`    +uint32 version
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
`,e+=`  class GeomType {
`,e+=`    <<enumeration>>
`,e+=`    UNKNOWN
`,e+=`    POINT
`,e+=`    LINESTRING
`,e+=`    POLYGON
`,e+=`  }
`,e+=`  Tile *-- Layer : contains
`,e+=`  Layer *-- Feature : encodes
`,e+=`  Feature --> GeomType : classifies
`,e}function G(n){const e=n.split(`
`).map(r=>r.trim()).filter(Boolean);let i=`flowchart TD
`;return e.slice(0,15).forEach((r,a)=>{r.includes("->")||r.includes("-->")?i+=`  ${r}
`:i+=`  node_${a}["${u(r)}"]
`}),i||`flowchart TD
  Geo["Geospatial Layer"]`}function b(n){switch(n){case"Point":case"MultiPoint":return"📍";case"LineString":case"MultiLineString":return"🛣️";case"Polygon":case"MultiPolygon":return"🗺️";default:return"🌐"}}function u(n){return String(n||"").replace(/"/g,"'").replace(/[<>]/g,"")}export{D as parseGeoJsonToMermaid};
//# sourceMappingURL=geojson-DzkIvp62.js.map
