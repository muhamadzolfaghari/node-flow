// Engineering & Data templates (part 3 of 3).
// Combined registry and lookup live in src/components/templates.js.
export const TEMPLATES = [
  {
    id: "geospatial-vector-tile-pipeline",
    title: "GIS Vector Tile Pyramid & Spatial Data Pipeline",
    category: "Engineering & Data",
    role: "Developer",
    kind: "flowchart",
    description: "End-to-end geospatial processing architecture: raw Shapefile / GeoJSON ingestion, PostGIS indexing, Tippecanoe tiling, and Vector Tile (MVT) distribution.",
    code: `flowchart TD
    subgraph Ingestion["1. Spatial Data Ingestion"]
        SHP["Shapefile / GeoJSON Raw Archives"]
        GPS["Real-Time GPS Telemetry Stream"]
        OSM["OpenStreetMap Planet Dumps"]
    end

    subgraph Processing["2. Spatial Processing & Storage"]
        PostGIS[("PostgreSQL + PostGIS (H3 Spatial Indexes)")]
        Tippecanoe["Tippecanoe Vector Tile Compressor"]
        ProtobufGen["Mapbox Vector Tile (MVT / Protobuf) Encoder"]
    end

    subgraph Distribution["3. Global Vector Tile Distribution"]
        S3["Cloud Object Storage (PMTiles / MBTiles)"]
        CDN["Global Edge CDN Cache"]
        MapClient["Maplibre / Mapbox Vector Tile Renderer"]
    end

    SHP --> PostGIS
    GPS --> PostGIS
    OSM --> PostGIS
    PostGIS --> Tippecanoe
    Tippecanoe --> ProtobufGen
    ProtobufGen --> S3
    S3 --> CDN
    CDN --> MapClient
`,
  },
  {
    id: "mvt-vector-tile-protobuf-spec",
    title: "Mapbox Vector Tile (MVT) Protobuf Specification",
    category: "Engineering & Data",
    role: "Developer",
    kind: "classDiagram",
    description: "Binary Protobuf encoding specification for Mapbox Vector Tiles (MVT): Tile layers, geometry commands, feature tags, and value dictionaries.",
    code: `classDiagram
    %% Mapbox Vector Tile (MVT) Protobuf Specification
    class Tile {
        +Layer[] layers
        +uint32 version
        +decodeTile(z, x, y)
    }
    class Layer {
        +string name
        +Feature[] features
        +string[] keys
        +Value[] values
        +uint32 extent
        +uint32 version
    }
    class Feature {
        +uint64 id
        +uint32[] tags
        +GeomType type
        +uint32[] geometry
    }
    class Value {
        +string string_value
        +float float_value
        +double double_value
        +int64 int_value
        +bool bool_value
    }
    class GeomType {
        <<enumeration>>
        UNKNOWN : 0
        POINT : 1
        LINESTRING : 2
        POLYGON : 3
    }
    Tile *-- Layer : contains
    Layer *-- Feature : encodes
    Layer *-- Value : dictionary
    Feature --> GeomType : classifies
`,
  },
];
