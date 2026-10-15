import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { deflateSync, strToU8 } from "fflate";
import {
  FORMATS,
  compileDocument,
  detectFormat,
  importDocument,
} from "../src/lib/formats.js";
const dom = new JSDOM("<!doctype html><body></body>");
global.window = dom.window;
global.document = dom.window.document;
global.DOMParser = dom.window.DOMParser;
global.XMLSerializer = dom.window.XMLSerializer;
const { default: mermaid } = await import("mermaid");
mermaid.initialize({ startOnLoad: false, securityLevel: "strict" });
for (const format of FORMATS) {
  test(`${format.name}: sample compiles without changing original source`, async () => {
    const original = { format: format.id, source: format.sample };
    const result = await compileDocument(original);
    assert.equal(original.source, format.sample);
    assert.ok(result.code);
    if (format.id !== "graphviz")
      assert.notEqual(await mermaid.parse(result.code), false);
    assert.equal(result.warnings.length, format.mode === "Derived" ? 1 : 0);
  });
}
test("ambiguous spec extensions are detected by content", () => {
  assert.equal(detectFormat("schema.json", '{"openapi":"3.0.0"}'), "openapi");
  assert.equal(detectFormat("events.yaml", "asyncapi: 3.0.0"), "asyncapi");
  assert.equal(
    detectFormat("model.xml", FORMATS.find((f) => f.id === "drawio").sample),
    "drawio",
  );
  assert.equal(
    detectFormat("diagram.txt", "sequenceDiagram\n A->>B: Hi"),
    "mermaid",
  );
  assert.equal(
    detectFormat("reqs.txt", "requirementDiagram\n functionalRequirement r1 { id: 1 }"),
    "mermaid",
  );
  assert.equal(
    detectFormat("network.txt", "packet-beta\n 0-15: \"Port\""),
    "mermaid",
  );
  assert.equal(
    detectFormat("tiles.mvt", 'syntax = "proto2"; package vector_tile; message Tile {}'),
    "geojson",
  );
  assert.equal(
    detectFormat("parcels.shp", '[{"FID":1,"SHAPE":"Polygon","NAME":"Parcel A"}]'),
    "geojson",
  );
  assert.equal(
    detectFormat("admin.topojson", '{"type":"Topology","objects":{"regions":{}},"arcs":[]}'),
    "geojson",
  );
  assert.throws(
    () => detectFormat("unrelated.json", '{"hello":true}'),
    /Cannot identify/,
  );
});
test("compressed Draw.io first page can be previewed", async () => {
  const xml = FORMATS.find((f) => f.id === "drawio").sample;
  const payload = Buffer.from(
    deflateSync(strToU8(encodeURIComponent(xml))),
  ).toString("base64");
  const result = await compileDocument({
    format: "drawio",
    source: `<mxfile><diagram>${payload}</diagram></mxfile>`,
  });
  assert.match(result.code, /Client/);
  assert.notEqual(await mermaid.parse(result.code), false);
});
test("PlantUML class and state arrows do not misclassify as sequence", async () => {
  const state = await compileDocument({
    format: "plantuml",
    source: "@startuml\n[*] --> Idle\nIdle --> Active\n@enduml",
  });
  assert.match(state.code, /^stateDiagram-v2/);
  const klass = await compileDocument({
    format: "plantuml",
    source: "@startuml\nclass User\nclass Order\nUser --> Order\n@enduml",
  });
  assert.match(klass.code, /^classDiagram/);
});
test("invalid and empty input report useful diagnostics", async () => {
  await assert.rejects(
    compileDocument({ format: "openapi", source: "openapi: [invalid" }),
  );
  await assert.rejects(
    compileDocument({ format: "drawio", source: "<broken" }),
  );
  assert.deepEqual(await compileDocument({ format: "sql", source: "" }), {
    code: "",
    warnings: [],
  });
});

test("native file import retains source, name and format", async () => {
  const source = "CREATE TABLE product (id INT PRIMARY KEY);";
  const result = await importDocument(new File([source], "schema.sql"));
  assert.equal(result.source, source);
  assert.equal(result.format, "sql");
  assert.equal(result.name, "schema.sql");
});
test("XMind binary import retains original workbook and editable first sheet", async () => {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  zip.file(
    "content.json",
    JSON.stringify([
      {
        rootTopic: {
          title: "Atlas",
          children: { attached: [{ title: "Studio" }] },
        },
      },
    ]),
  );
  const data = await zip.generateAsync({ type: "uint8array" });
  const imported = await importDocument(new File([data], "plan.xmind"));
  assert.equal(imported.format, "xmind");
  assert.match(imported.source, /Atlas/);
  assert.match(imported.source, /Studio/);
  assert.deepEqual(
    Buffer.from(imported.original.base64, "base64"),
    Buffer.from(data),
  );
  assert.notEqual(await mermaid.parse(imported.source), false);
});

test("Mapbox Vector Tile Protobuf specification compiles to Mermaid class diagram", async () => {
  const mvtProto = `syntax = "proto2";
package vector_tile;

message Tile {
  enum GeomType {
    UNKNOWN = 0;
    POINT = 1;
    LINESTRING = 2;
    POLYGON = 3;
  }
  message Value {
    optional string string_value = 1;
    optional float float_value = 2;
    optional int64 int_value = 5;
    optional bool bool_value = 7;
  }
  message Feature {
    optional uint64 id = 1;
    repeated uint32 tags = 2;
    optional GeomType type = 3 [default = UNKNOWN];
    repeated uint32 geometry = 4;
  }
  message Layer {
    required uint32 version = 15 [default = 1];
    required string name = 1;
    repeated Feature features = 2;
    repeated string keys = 3;
    repeated Value values = 4;
    optional uint32 extent = 5 [default = 4096];
  }
  repeated Layer layers = 3;
}`;

  const res = await compileDocument({ format: "geojson", source: mvtProto });
  assert.ok(res.code);
  assert.match(res.code, /class Tile/);
  assert.match(res.code, /class Layer/);
  assert.match(res.code, /class Feature/);
  assert.notEqual(await mermaid.parse(res.code), false);
});

test("ESRI Shapefile attribute table dump compiles to Mermaid flowchart", async () => {
  const shpDump = JSON.stringify([
    { FID: 1, SHAPE: "Polygon", NAME: "Central Park Zone", ACRES: 843 },
    { FID: 2, SHAPE: "Point", NAME: "Metro Transit Station", RIDERS: 45000 },
  ]);

  const res = await compileDocument({ format: "geojson", source: shpDump });
  assert.ok(res.code);
  assert.match(res.code, /Central Park Zone/);
  assert.match(res.code, /Metro Transit Station/);
  assert.notEqual(await mermaid.parse(res.code), false);
});

test("TopoJSON shared arcs topology compiles to Mermaid flowchart", async () => {
  const topoData = JSON.stringify({
    type: "Topology",
    objects: {
      counties: { type: "GeometryCollection", geometries: [] },
      rivers: { type: "MultiLineString", arcs: [[0, 1]] },
    },
    arcs: [[[0, 0], [1, 1]]],
  });

  const res = await compileDocument({ format: "geojson", source: topoData });
  assert.ok(res.code);
  assert.match(res.code, /counties/);
  assert.match(res.code, /rivers/);
  assert.match(res.code, /Shared Arcs Matrix/);
  assert.notEqual(await mermaid.parse(res.code), false);
});

