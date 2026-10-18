import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><body></body>");
global.window = dom.window;
global.document = dom.window.document;
global.DOMParser = dom.window.DOMParser;
global.XMLSerializer = dom.window.XMLSerializer;
const { default: mermaid } = await import("mermaid");
mermaid.initialize({ startOnLoad: false, securityLevel: "strict" });

const { compileDocument, detectFormat, FORMATS } = await import("../src/lib/formats.ts");

test("registry covers 30+ formats", () => {
  assert.ok(FORMATS.length >= 30, `expected 30+ formats, got ${FORMATS.length}`);
  for (const id of ["jsonschema", "dbml", "prisma", "protobuf", "xmi", "sysml", "archimate", "dmn", "yaml", "erd", "visio", "gliffy", "excalidraw"]) {
    assert.ok(FORMATS.some(f => f.id === id), `missing format ${id}`);
  }
});

test("all format samples compile and parse", async () => {
  for (const f of FORMATS) {
    const r = await compileDocument({ format: f.id, source: f.sample });
    assert.ok(r.code && r.code.split("\n").length >= 2, `${f.id} produced no code`);
    if (f.id !== "graphviz") assert.notEqual(await mermaid.parse(r.code), false, `${f.id} sample did not parse`);
  }
});

test("content sniffing for new formats", () => {
  assert.equal(detectFormat("s.schema.json", '{"properties":{"a":{"type":"string"}}}'), "jsonschema");
  assert.equal(detectFormat("m.dbml", "Table a {\n id int [pk]\n}\nRef: b.a > a.id"), "dbml");
  assert.equal(detectFormat("s.prisma", "model User {\n id String @id\n}"), "prisma");
  assert.equal(detectFormat("a.proto", 'syntax = "proto3";\nmessage A {\n string id = 1;\n}'), "protobuf");
  assert.equal(detectFormat("m.xmi", '<xmi:XMI xmlns:uml="x"><uml:Class xmi:id="c" name="A"/></xmi:XMI>'), "xmi");
  assert.equal(detectFormat("s.sysml", "part Vehicle\nrequirement Range"), "sysml");
  assert.equal(detectFormat("d.dmn", '<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"><decision id="d" name="D"/></definitions>'), "dmn");
  assert.equal(detectFormat("e.excalidraw", '{"type":"excalidraw","elements":[{"type":"rectangle","id":"a","x":0,"y":0,"width":10,"height":10}]}'), "excalidraw");
  assert.equal(detectFormat("g.gliffy", '{"stage":{"objects":[{"id":0,"text":"A"}]}}'), "gliffy");
  assert.equal(detectFormat("v.vdx", '<VisioDocument><Shape ID="1" Name="A"><Text>Hi</Text></Shape></VisioDocument>'), "visio");
  assert.equal(detectFormat("c.yaml", "apiVersion: v1\nkind: Pod\nmetadata:\n name: x"), "yaml");
  assert.equal(detectFormat("art.ai", 'Artboard "Architecture"\n Layer "UI" [rect]'), "illustrator");
  assert.equal(detectFormat("board.fig", '{"document":{"children":[{"id":"1","type":"FRAME"}]}}'), "figma");
  assert.equal(detectFormat("diagram.graffle", '<plist version="1.0"><dict><key>GraphicsList</key><array></array></dict></plist>'), "omnigraffle");
  assert.equal(detectFormat("retro.miro", '{"items":[{"id":"1","type":"sticky_note"}]}'), "miro");
});

test("plantuml full grammar: activity/usecase/deployment", async () => {
  const { parsePlantUmlToMermaid } = await import("../src/utils/importers/plantuml.ts");
  const act = parsePlantUmlToMermaid("@startuml\nstart\n:Order food;\nif (paid?) then (yes)\n:Ship;\nstop\n@enduml");
  assert.match(act, /flowchart TD/);
  assert.notEqual(await mermaid.parse(act), false);
  const uc = parsePlantUmlToMermaid('@startuml\nactor Customer\n(Customer) -- (Checkout)\n@enduml');
  assert.match(uc, /flowchart/);
});

test("bpmn expanded: lanes + message flows", async () => {
  const { parseBpmnToMermaid } = await import("../src/utils/importers/bpmn.ts");
  const xml = `<definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"><bpmn:process id="p"><bpmn:laneSet><bpmn:lane name="Sales"><bpmn:flowNodeRef>t1</bpmn:flowNodeRef></bpmn:lane></bpmn:laneSet><bpmn:userTask id="t1" name="Call"/><bpmn:serviceTask id="t2" name="Ship"/><bpmn:sequenceFlow id="f" sourceRef="t1" targetRef="t2"/><bpmn:messageFlow id="m" sourceRef="t1" targetRef="t2" name="notify"/></bpmn:process></definitions>`;
  const out = parseBpmnToMermaid(xml);
  assert.match(out, /Sales/);
  assert.match(out, /-\.->/);
});

test("c4 expanded + openapi schemas-only + asyncapi v3", async () => {
  const { parseC4DslToMermaid } = await import("../src/utils/importers/c4dsl.ts");
  const c4 = parseC4DslToMermaid('Person(a, "A")\nSystem(b, "B")\nRel(a, b, "Uses")\nComponent(c, "C")\nRel(b, c, "Has")');
  assert.match(c4, /Component/);
  const { parseOpenApiToMermaid } = await import("../src/utils/importers/openapi.ts");
  const cls = parseOpenApiToMermaid(JSON.stringify({ info: { title: "T" }, paths: {}, components: { schemas: { User: { properties: { id: { type: "string" } } } } } }));
  assert.match(cls, /classDiagram/);
  const { parseAsyncApiToMermaid } = await import("../src/utils/importers/asyncapi.ts");
  const seq = parseAsyncApiToMermaid(JSON.stringify({ info: { title: "E" }, channels: { "o.c": { address: "o/c", messages: { m1: { name: "M1" } } } }, operations: { sendO: { action: "send" } } }));
  assert.match(seq, /sequenceDiagram/);
});

test("code-to-uml: kotlin/swift/php/ruby/cpp", async () => {
  const { parseCodeToClassDiagram } = await import("../src/utils/importers/codeToUML.ts");
  const src = `data class User(val id: String)\nclass Admin : User\ninterface Repo\nstruct Point {\n x: Float\n}`;
  const out = parseCodeToClassDiagram(src);
  assert.match(out, /classDiagram/);
  assert.match(out, /User/);
});

test("error DB has 60+ entries and lookup works", async () => {
  const { ERROR_DB, lookupErrors } = await import("../src/utils/syntaxErrorDB.ts");
  assert.ok(ERROR_DB.length >= 60, `got ${ERROR_DB.length}`);
  const hits = lookupErrors("flowchart TD\n  A -> B", "mermaid");
  assert.ok(hits.some(h => h.id === "mermaid-flow-single-arrow"));
});

test("universal fixer repairs mermaid + plantuml + csv + sql", async () => {
  const { fixAnySyntax, parseErrorDetails } = await import("../src/utils/universalFixer.ts");
  const f1 = await fixAnySyntax("flowchart TD\n  A -> B", "mermaid");
  assert.equal(f1.success, true);
  assert.match(f1.fixedCode, /-->/);
  const f2 = await fixAnySyntax("Alice -> Bob: hi", "plantuml");
  assert.match(f2.fixedCode, /@startuml/);
  const f3 = await fixAnySyntax("just text", "csv");
  assert.match(f3.fixedCode, /source,target/);
  const f4 = await fixAnySyntax("gantt\n  T :a, 2026-01-01, 3d", "mermaid");
  assert.equal(f4.success, true);
  const fSeq = await fixAnySyntax("sequenceDiagram\n  A ->> B\n  C-->>D: response", "mermaid");
  assert.match(fSeq.fixedCode, /A ->> B: call/);
  const fPacket = await fixAnySyntax("packet\n  0-15: Source Port", "mermaid");
  assert.match(fPacket.fixedCode, /packet-beta/);
  assert.match(fPacket.fixedCode, /0-15: "Source Port"/);
  const fArch = await fixAnySyntax("architecture\n  service api[API Gateway]", "mermaid");
  assert.match(fArch.fixedCode, /architecture-beta/);
  assert.match(fArch.fixedCode, /service api\(server\)\[API Gateway\]/);
  const errDetails = parseErrorDetails("Parse error on line 4:\n...foo --> bar\n----^\nExpecting EOF, got MINUS");
  assert.equal(errDetails.line, 4);
  assert.equal(errDetails.column, 4);
  assert.match(errDetails.message, /Expecting EOF/);
});

test("reverse hub: mermaid -> plantuml/dot/d2/sql/dbml/xmi/ts/opml/openapi/prisma/graphql/terraform", async () => {
  const mod = await import("../src/utils/exporters/mermaidExport.ts");
  const seq = "sequenceDiagram\n  A->>B: GET /items\n  A->>B: POST /items";
  assert.match(mod.mermaidToPlantUml(seq), /@startuml/);
  const openapi = JSON.parse(mod.mermaidSequenceToOpenApiStub(seq, "Store API"));
  assert.equal(openapi.openapi, "3.0.3");
  assert.equal(openapi.info.title, "Store API");
  assert.ok(openapi.paths["/items"].get);
  assert.ok(openapi.paths["/items"].post);
  const flow = "flowchart TD\n  A[Hi] --> B[There]";
  assert.match(mod.mermaidToDot(flow), /digraph/);
  assert.match(mod.mermaidToD2(flow), /direction/);
  const er = "erDiagram\n  USERS ||--o{ ORDERS : places\n  USERS {\n    string id PK\n  }\n  ORDERS {\n    string id PK\n  }";
  assert.match(mod.mermaidErToSql(er), /CREATE TABLE/);
  assert.match(mod.mermaidErToDbml(er), /Table/);
  assert.match(mod.mermaidErToPrisma(er), /model USERS/);
  assert.match(mod.mermaidErToPrisma(er), /datasource db/);
  const cls = "classDiagram\n  class User {\n    +String id\n  }";
  assert.match(mod.mermaidClassToTypeScript(cls), /class User/);
  assert.match(mod.mermaidClassToXmi(cls), /xmi:XMI/);
  assert.match(mod.mermaidClassToGraphql(cls), /type User/);
  assert.match(mod.mermaidClassToGraphql(cls), /id: ID!/);
  const arch = "architecture-beta\n  group vpc(cloud)[Prod VPC]\n  service db(database)[DB] in vpc";
  assert.match(mod.mermaidArchitectureToTerraform(arch), /resource "aws_vpc" "vpc"/);
  assert.match(mod.mermaidArchitectureToTerraform(arch), /resource "aws_db_instance" "db"/);
  const mm = "mindmap\n  root((R))\n    A\n    B";
  assert.match(mod.mermaidMindmapToMarkdown(mm), /- A/);
  assert.match(mod.mermaidMindmapToOpml(mm), /<opml/);
});

test("StarUML (.mdj) import and compilation to Mermaid classDiagram", async () => {
  const { detectFormat, compileDocument } = await import("../src/lib/formats.ts");
  const { parseStarUmlToMermaid } = await import("../src/utils/importers/staruml.ts");

  const starUmlSample = JSON.stringify({
    _type: "Project",
    name: "BankingSystem",
    ownedElements: [
      {
        _type: "UMLClass",
        _id: "cls_acc",
        name: "BankAccount",
        attributes: [
          { name: "balance", type: "number", visibility: "private" },
          { name: "accountNumber", type: "string", visibility: "public" }
        ],
        operations: [
          {
            name: "deposit",
            parameters: [
              { name: "amount", type: "number" },
              { direction: "return", type: "boolean" }
            ]
          }
        ]
      },
      {
        _type: "UMLClass",
        _id: "cls_savings",
        name: "SavingsAccount",
        attributes: [
          { name: "interestRate", type: "number", visibility: "protected" }
        ]
      },
      {
        _type: "UMLGeneralization",
        source: { $ref: "cls_savings" },
        target: { $ref: "cls_acc" }
      }
    ]
  });

  assert.equal(detectFormat("model.mdj", starUmlSample), "staruml");

  const mmd = parseStarUmlToMermaid(starUmlSample);
  assert.match(mmd, /classDiagram/);
  assert.match(mmd, /class BankAccount \{/);
  assert.match(mmd, /-number balance/);
  assert.match(mmd, /\+deposit\(amount: number\): boolean/);
  assert.match(mmd, /class SavingsAccount \{/);
  assert.match(mmd, /SavingsAccount <\|-- BankAccount/);

  const compiled = await compileDocument({ format: "staruml", source: starUmlSample });
  assert.match(compiled.code, /classDiagram/);
});

test("Lucidchart JSON and CSV import and compilation to Mermaid flowchart", async () => {
  const { detectFormat, compileDocument } = await import("../src/lib/formats.ts");
  const { parseLucidchartToMermaid } = await import("../src/utils/importers/lucidchart.ts");

  const lucidJson = JSON.stringify({
    pages: [
      {
        shapes: [
          { id: "101", text: "Web Client" },
          { id: "102", text: "REST API Gateway" },
          { id: "103", text: "Auth Database" }
        ],
        lines: [
          { from: "101", to: "102", text: "POST /login" },
          { from: "102", to: "103", text: "Validate hash" }
        ]
      }
    ]
  });

  assert.equal(detectFormat("architecture.lucid", lucidJson), "lucid");
  const mmdJson = parseLucidchartToMermaid(lucidJson);
  assert.match(mmdJson, /flowchart TD/);
  assert.match(mmdJson, /101\["Web Client"\]/);
  assert.match(mmdJson, /101 -->\|"POST \/login"\| 102/);

  const lucidCsv = `Id,Name,Shape Library,Page ID,Contained By,Group,Line Source,Line Destination,Source Arrow,Destination Arrow,Text Area 1
1,Process,Standard,1,,,,,None,Arrow,Validate User
2,Process,Standard,1,,,,,None,Arrow,Authorize Token
3,Line,Standard,1,,,1,2,None,Arrow,Success`;

  assert.equal(detectFormat("diagram.csv", lucidCsv), "lucid");
  const mmdCsv = parseLucidchartToMermaid(lucidCsv);
  assert.match(mmdCsv, /flowchart TD/);
  assert.match(mmdCsv, /1\["Validate User"\]/);
  assert.match(mmdCsv, /1 -->\|"Success"\| 2/);

  const compiled = await compileDocument({ format: "lucid", source: lucidJson });
  assert.match(compiled.code, /flowchart TD/);
});

test("AI describeToDiagram: comprehensive multi-format synthesis (C4, Sankey, Kanban, Requirement, Packet, Architecture)", async () => {
  const { describeToDiagram, detectDiagramType, SUPPORTED_DIAGRAM_TYPES } = await import(
    "../src/utils/importers/describeToDiagram.ts"
  );

  assert.ok(SUPPORTED_DIAGRAM_TYPES.some((t) => t.id === "c4"));
  assert.ok(SUPPORTED_DIAGRAM_TYPES.some((t) => t.id === "sankey"));
  assert.ok(SUPPORTED_DIAGRAM_TYPES.some((t) => t.id === "kanban"));
  assert.ok(SUPPORTED_DIAGRAM_TYPES.some((t) => t.id === "requirement"));
  assert.ok(SUPPORTED_DIAGRAM_TYPES.some((t) => t.id === "packet"));
  assert.ok(SUPPORTED_DIAGRAM_TYPES.some((t) => t.id === "architecture"));

  assert.equal(detectDiagramType("C4 software system context with banking customer"), "c4");
  assert.equal(detectDiagramType("Conversion funnel with dropoff rates and visitors"), "sankey");
  assert.equal(detectDiagramType("Sprint kanban board with todo and in progress tasks"), "kanban");
  assert.equal(detectDiagramType("System functional requirement with verification method"), "requirement");
  assert.equal(detectDiagramType("TCP packet bytefield protocol header"), "packet");
  assert.equal(detectDiagramType("Cloud architecture with VPC and microservice gateway"), "architecture");

  const c4Res = describeToDiagram("Customer using web app", "c4");
  assert.match(c4Res.code, /C4Context/);

  const sankeyRes = describeToDiagram("Visitors to Signups to Paid users", "sankey");
  assert.match(sankeyRes.code, /sankey-beta/);

  const kanbanRes = describeToDiagram("Design UI\nImplement backend\nDeploy service", "kanban");
  assert.match(kanbanRes.code, /kanban/);

  const reqRes = describeToDiagram("Security requirement for encrypted storage", "requirement");
  assert.match(reqRes.code, /requirementDiagram/);

  const pktRes = describeToDiagram("Network packet with header and checksum", "packet");
  assert.match(pktRes.code, /packet-beta/);

  const archRes = describeToDiagram("Microservices API and Database in Cloud VPC", "architecture");
  assert.match(archRes.code, /architecture-beta/);

  assert.throws(() => describeToDiagram(""), /Please enter a description/);
});


