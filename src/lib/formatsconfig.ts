/** The single source of truth for editing, import, preview, and documentation. */
export const FORMATS = [
  {
    id: "mermaid",
    name: "Mermaid",
    ext: "mmd",
    extensions: ["mmd", "mermaid"],
    language: "diagram",
    mode: "Native",
    family: "Diagrams",
    description: "Flowcharts, ER, UML, mindmaps, Gantt, charts, and C4.",
    sample:
      "flowchart LR\n  Client[Web client] --> API[API gateway]\n  API --> Service[Order service]\n  Service --> DB[(Database)]",
  },
  {
    id: "graphviz",
    name: "Graphviz DOT",
    ext: "dot",
    extensions: ["dot", "gv"],
    language: "diagram",
    mode: "Native",
    family: "Architecture",
    description: "Native Graphviz layout through WebAssembly.",
    sample:
      "digraph Architecture {\n  rankdir=LR;\n  node [shape=box, style=rounded];\n  Client -> Gateway -> Service -> Database;\n}",
  },
  {
    id: "plantuml",
    name: "PlantUML",
    ext: "puml",
    extensions: ["puml", "plantuml"],
    language: "diagram",
    mode: "Derived",
    family: "UML",
    description:
      "Sequence, class, state, activity, usecase, deployment subsets; styling and macros are not preserved.",
    sample:
      "@startuml\nparticipant Client\nparticipant API\nClient -> API: Create order\nAPI --> Client: Order confirmed\n@enduml",
  },
  {
    id: "d2",
    name: "D2",
    ext: "d2",
    extensions: ["d2"],
    language: "diagram",
    mode: "Derived",
    family: "Architecture",
    description:
      "Basic nodes, connections, and containers; layout and styling are approximate.",
    sample:
      "client: Web Client\napi: API Gateway\ndb: Database\nclient -> api: Request\napi -> db: Query",
  },
  {
    id: "sql",
    name: "SQL DDL",
    ext: "sql",
    extensions: ["sql"],
    language: "sql",
    mode: "Derived",
    family: "Data",
    description:
      "CREATE TABLE columns and foreign keys to ER schemas; dialect-specific syntax may need simplification.",
    sample:
      "CREATE TABLE users (\n  id INTEGER PRIMARY KEY,\n  name VARCHAR(100)\n);\nCREATE TABLE orders (\n  id INTEGER PRIMARY KEY,\n  user_id INTEGER REFERENCES users(id)\n);",
  },
  {
    id: "dbml",
    name: "DBML",
    ext: "dbml",
    extensions: ["dbml"],
    language: "sql",
    mode: "Derived",
    family: "Data",
    description: "DBML Table blocks and Ref lines to ER schemas.",
    sample:
      "Table users {\n  id int [pk]\n  name varchar\n}\nTable orders {\n  id int [pk]\n  user_id int [ref: > users.id]\n}",
  },
  {
    id: "prisma",
    name: "Prisma schema",
    ext: "prisma",
    extensions: ["prisma"],
    language: "diagram",
    mode: "Derived",
    family: "Data",
    description: "Prisma model blocks and relations to ER schemas.",
    sample:
      "model User {\n  id String @id\n  email String @unique\n  orders Order[]\n}\nmodel Order {\n  id String @id\n  user User @relation(fields: [userId], references: [id])\n  userId String\n}",
  },
  {
    id: "protobuf",
    name: "Protobuf",
    ext: "proto",
    extensions: ["proto"],
    language: "diagram",
    mode: "Derived",
    family: "Data",
    description: "Proto3 message/enum blocks to class diagrams.",
    sample:
      'syntax = "proto3";\nmessage User {\n  string id = 1;\n  string email = 2;\n}\nmessage Order {\n  string id = 1;\n  User user = 2;\n}',
  },
  {
    id: "jsonschema",
    name: "JSON Schema",
    ext: "schema.json",
    extensions: ["schema.json"],
    language: "json",
    mode: "Derived",
    family: "Data",
    description: "JSON-Schema properties/$defs to class diagrams. Content-detected for *.json.",
    sample:
      '{"title":"User","type":"object","properties":{"id":{"type":"string"},"email":{"type":"string"}},"required":["id"]}',
  },
  {
    id: "graphql",
    name: "GraphQL SDL",
    ext: "graphql",
    extensions: ["graphql", "gql"],
    language: "diagram",
    mode: "Derived",
    family: "Data",
    description: "Types, fields, and relationships to a class diagram.",
    sample:
      "type User {\n  id: ID!\n  name: String!\n  orders: [Order!]!\n}\ntype Order {\n  id: ID!\n  user: User!\n}",
  },
  {
    id: "openapi",
    name: "OpenAPI / Swagger",
    ext: "yaml",
    extensions: [],
    language: "yaml",
    mode: "Derived",
    family: "APIs",
    description:
      "JSON or YAML paths to a request sequence. Preview shows the first 10 paths.",
    sample:
      'openapi: 3.0.3\ninfo:\n  title: Orders API\n  version: 1.0.0\npaths:\n  /orders:\n    get:\n      summary: List orders\n      responses:\n        "200":\n          description: Order list',
  },
  {
    id: "asyncapi",
    name: "AsyncAPI",
    ext: "yaml",
    extensions: [],
    language: "yaml",
    mode: "Derived",
    family: "APIs",
    description:
      "JSON or YAML v2/v3 channels to event sequences. Preview shows the first 12 channels.",
    sample:
      "asyncapi: 2.6.0\ninfo:\n  title: Orders events\n  version: 1.0.0\nchannels:\n  orders.created:\n    publish:\n      message:\n        name: OrderCreated",
  },
  {
    id: "yaml",
    name: "YAML structure",
    ext: "yaml",
    extensions: ["yaml", "yml"],
    language: "yaml",
    mode: "Derived",
    family: "Data",
    description: "Generic YAML mappings (Kubernetes, Compose) to mindmaps. Spec files auto-detect as OpenAPI/AsyncAPI.",
    sample:
      "apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: app-config\ndata:\n  log_level: info",
  },
  {
    id: "erd",
    name: "ERD text",
    ext: "erd",
    extensions: ["erd"],
    language: "diagram",
    mode: "Derived",
    family: "Data",
    description: "Crow's-foot text (||--o{) and TABLE blocks to ER diagrams.",
    sample:
      "USERS ||--o{ ORDERS : places\nUSERS {\n  string id\n}\nORDERS {\n  string id\n  string user_id\n}",
  },
  {
    id: "xmi",
    name: "UML XMI",
    ext: "xmi",
    extensions: ["xmi", "uml"],
    language: "xml",
    mode: "Derived",
    family: "UML",
    description: "UML2 XMI classes/generalizations/associations and lifelines/messages to class/sequence.",
    sample:
      '<xmi:XMI xmlns:xmi="http://www.omg.org/XMI" xmlns:uml="http://www.omg.org/spec/UML/20131001">\n  <uml:Class xmi:id="c1" name="User"/>\n  <uml:Class xmi:id="c2" name="Order"/>\n</xmi:XMI>',
  },
  {
    id: "sysml",
    name: "SysML v2",
    ext: "sysml",
    extensions: ["sysml"],
    language: "diagram",
    mode: "Derived",
    family: "UML",
    description: "SysML v2 part/requirement/action declarations to block/requirement flowcharts.",
    sample:
      "part Vehicle\nrequirement Range\npart Battery : Vehicle\naction Drive",
  },
  {
    id: "archimate",
    name: "ArchiMate Exchange",
    ext: "xml",
    extensions: [],
    language: "xml",
    mode: "Derived",
    family: "Architecture",
    description: "ArchiMate Open Exchange elements/relationships to flowcharts. Content-detected for *.xml.",
    sample:
      '<model xmlns="http://www.opengroup.org/xsd/archimate/3"><elements><element identifier="a1" name="Customer" xsi:type="BusinessActor"/></elements></model>',
  },
  {
    id: "dmn",
    name: "DMN",
    ext: "dmn",
    extensions: ["dmn"],
    language: "xml",
    mode: "Derived",
    family: "Processes",
    description: "DMN decision tables (XML or when/then text) to flowcharts.",
    sample:
      '<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"><decision id="d1" name="Approve loan"/></definitions>',
  },
  {
    id: "drawio",
    name: "Draw.io",
    ext: "drawio",
    extensions: ["drawio"],
    language: "xml",
    mode: "Derived",
    family: "Diagrams",
    description:
      "Compressed or plain XML nodes and edges; first page preview, approximate shapes and layout.",
    sample:
      '<mxGraphModel><root>\n  <mxCell id="0"/><mxCell id="1" parent="0"/>\n  <mxCell id="a" value="Client" vertex="1" parent="1"/>\n  <mxCell id="b" value="Service" vertex="1" parent="1"/>\n  <mxCell id="e" edge="1" source="a" target="b" parent="1"/>\n</root></mxGraphModel>',
  },
  {
    id: "bpmn",
    name: "BPMN 2.0",
    ext: "bpmn",
    extensions: ["bpmn"],
    language: "xml",
    mode: "Derived",
    family: "Processes",
    description:
      "Tasks, events, gateways, lanes, data objects, message flows; no BPMN execution semantics.",
    sample:
      '<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL">\n  <process id="orders">\n    <startEvent id="start" name="Order received"/>\n    <task id="check" name="Check inventory"/>\n    <endEvent id="end" name="Confirmed"/>\n    <sequenceFlow id="f1" sourceRef="start" targetRef="check"/>\n    <sequenceFlow id="f2" sourceRef="check" targetRef="end"/>\n  </process>\n</definitions>',
  },
  {
    id: "c4",
    name: "C4 / Structurizr DSL",
    ext: "dsl",
    extensions: ["dsl", "c4"],
    language: "diagram",
    mode: "Derived",
    family: "Architecture",
    description:
      "People, systems, containers, components, code and dynamic views to C4 context.",
    sample:
      'workspace {\n  model {\n    customer = person "Customer"\n    shop = softwareSystem "Online store"\n    customer -> shop "Places orders"\n  }\n}',
  },
  {
    id: "terraform",
    name: "Terraform HCL",
    ext: "tf",
    extensions: ["tf"],
    language: "diagram",
    mode: "Derived",
    family: "Architecture",
    description:
      "Resources and direct references; modules, dynamic blocks, and evaluated values are not resolved.",
    sample:
      'resource "aws_vpc" "main" {\n  cidr_block = "10.0.0.0/16"\n}\nresource "aws_subnet" "app" {\n  vpc_id = aws_vpc.main.id\n  cidr_block = "10.0.1.0/24"\n}',
  },
  {
    id: "markdown",
    name: "Markdown outline",
    ext: "md",
    extensions: ["md", "markdown", "txt"],
    language: "markdown",
    mode: "Derived",
    family: "Mindmaps",
    description:
      "Indented lists to a mindmap. Embedded Mermaid fences can be rendered.",
    sample:
      "- Product strategy\n  - Discovery\n    - Interviews\n    - Research\n  - Delivery\n    - Build\n    - Test",
  },
  {
    id: "csv",
    name: "CSV relationships",
    ext: "csv",
    extensions: ["csv", "tsv"],
    language: "diagram",
    mode: "Derived",
    family: "Data",
    description: "Source,target rows (CSV/TSV/semicolon/pipe) to a relationship graph.",
    sample:
      "source,target,label\nClient,Gateway,Request\nGateway,Service,Route\nService,Database,Query",
  },
  {
    id: "freemind",
    name: "FreeMind",
    ext: "mm",
    extensions: ["mm"],
    language: "xml",
    mode: "Derived",
    family: "Mindmaps",
    description:
      "Topic hierarchy to a mindmap; styling and metadata remain in the original XML.",
    sample:
      '<map version="1.0.1">\n  <node TEXT="Product">\n    <node TEXT="Discovery"/>\n    <node TEXT="Delivery"/>\n  </node>\n</map>',
  },
  {
    id: "opml",
    name: "OPML",
    ext: "opml",
    extensions: ["opml"],
    language: "xml",
    mode: "Derived",
    family: "Mindmaps",
    description: "Outline hierarchy to a mindmap.",
    sample:
      '<opml version="2.0"><body>\n  <outline text="Product">\n    <outline text="Discovery"/>\n    <outline text="Delivery"/>\n  </outline>\n</body></opml>',
  },
  {
    id: "xmind",
    name: "XMind",
    ext: "xmind",
    extensions: ["xmind"],
    language: "diagram",
    mode: "Mindmap",
    family: "Mindmaps",
    description:
      "First sheet of ZEN or legacy workbooks to an editable Mermaid mindmap; original workbook retained, fresh workbook export supported.",
    sample:
      "mindmap\n  root((Product))\n    Discovery\n      Research\n    Delivery\n      Build\n      Test",
  },
  {
    id: "visio",
    name: "Visio VDX",
    ext: "vdx",
    extensions: ["vdx"],
    language: "xml",
    mode: "Derived",
    family: "Diagrams",
    description: "Visio VDX Shape/Connect elements to flowcharts.",
    sample:
      '<VisioDocument><Pages><Page><Shapes><Shape ID="1" Name="Start"><Text>Start</Text></Shape><Shape ID="2" Name="Task"><Text>Review</Text></Shape></Shapes><Connects><Connect FromSheet="1" ToSheet="2"/></Connects></Page></Pages></VisioDocument>',
  },
  {
    id: "gliffy",
    name: "Gliffy JSON",
    ext: "gliffy",
    extensions: ["gliffy"],
    language: "json",
    mode: "Derived",
    family: "Diagrams",
    description: "Gliffy stage objects/constraints to flowcharts. Content-detected for *.json.",
    sample:
      '{"stage":{"objects":[{"id":0,"text":"Start"},{"id":1,"text":"Review"}]}}',
  },
  {
    id: "excalidraw",
    name: "Excalidraw JSON",
    ext: "excalidraw",
    extensions: ["excalidraw"],
    language: "json",
    mode: "Derived",
    family: "Diagrams",
    description: "Excalidraw elements (shapes/arrows) to flowcharts. Content-detected for *.json.",
    sample:
      '{"type":"excalidraw","elements":[{"type":"rectangle","id":"a","x":0,"y":0,"width":100,"height":50},{"type":"rectangle","id":"b","x":200,"y":0,"width":100,"height":50}]}',
  },
  {
    id: "code",
    name: "Source code → UML",
    ext: "ts",
    extensions: ["ts", "tsx", "js", "jsx", "py", "java", "cs", "go", "rs", "kt", "kts", "swift", "php", "rb", "cpp", "c", "h"],
    language: "javascript",
    mode: "Derived",
    family: "UML",
    description:
      "Best-effort class/struct/enum extraction incl. Kotlin/Swift/PHP/Ruby/C++. Not a code execution environment.",
    sample:
      "class User {\n  id: string;\n  name: string;\n}\nclass Admin extends User {\n  permissions: string[];\n}",
  },
  {
    id: "staruml",
    name: "StarUML",
    ext: "mdj",
    extensions: ["mdj"],
    language: "json",
    mode: "Derived",
    family: "UML",
    description:
      "StarUML model JSON (.mdj) containing UMLClass, UMLAttribute, UMLOperation, and UMLGeneralization.",
    sample:
      '{\n  "_type": "Project",\n  "name": "AppModel",\n  "ownedElements": [\n    {\n      "_type": "UMLClass",\n      "_id": "c1",\n      "name": "User",\n      "attributes": [\n        { "name": "id", "type": "string", "visibility": "private" }\n      ],\n      "operations": [\n        { "name": "login", "parameters": [{ "direction": "return", "type": "boolean" }] }\n      ]\n    }\n  ]\n}',
  },
  {
    id: "lucid",
    name: "Lucidchart",
    ext: "lucid",
    extensions: ["lucid", "lucidchart"],
    language: "json",
    mode: "Derived",
    family: "Whiteboard",
    description:
      "Lucidchart CSV or JSON export converted to Mermaid flowchart nodes and connections.",
    sample:
      '{\n  "pages": [\n    {\n      "shapes": [\n        { "id": "1", "text": "Client App" },\n        { "id": "2", "text": "API Server" }\n      ],\n      "lines": [\n        { "from": "1", "to": "2", "text": "HTTP GET" }\n      ]\n    }\n  ]\n}',
  },
  {
    id: "illustrator",
    name: "Adobe Illustrator",
    ext: "ai",
    extensions: ["ai", "ait"],
    language: "diagram",
    mode: "Derived",
    family: "Design & Vector",
    description:
      "Adobe Illustrator artboards, vector layers, labeled groups, and path objects converted to structured visual diagrams.",
    sample:
      'Artboard "Architecture Overview"\n  Layer "Frontend App" [rect]\n  Layer "API Gateway" [rounded]\n  Layer "Microservices" [box]\n  Layer "Database" [cylinder]\n  "Frontend App" -> "API Gateway" : HTTPS\n  "API Gateway" -> "Microservices" : gRPC\n  "Microservices" -> "Database" : SQL',
  },
  {
    id: "figma",
    name: "Figma / FigJam",
    ext: "fig",
    extensions: ["fig", "figjam"],
    language: "json",
    mode: "Derived",
    family: "Whiteboard",
    description:
      "Figma frames, component nodes, FigJam sticky notes, shapes, and connector lines converted to Mermaid flowchart.",
    sample:
      '{\n  "document": {\n    "children": [\n      { "id": "1", "name": "UI Components", "type": "FRAME" },\n      { "id": "2", "name": "Backend Services", "type": "FRAME" },\n      { "id": "3", "type": "CONNECTOR", "connectorStart": { "endpointNodeId": "1" }, "connectorEnd": { "endpointNodeId": "2" }, "characters": "API" }\n    ]\n  }\n}',
  },
  {
    id: "omnigraffle",
    name: "OmniGraffle",
    ext: "graffle",
    extensions: ["graffle"],
    language: "xml",
    mode: "Derived",
    family: "Diagrams",
    description:
      "OmniGraffle graphics, shape sheets, and line connections converted to Mermaid flowchart.",
    sample:
      '<?xml version="1.0" encoding="UTF-8"?>\n<plist version="1.0"><dict><key>GraphicsList</key><array><dict><key>ID</key><integer>1</integer><key>Text</key><dict><key>Text</key><string>Client</string></dict></dict><dict><key>ID</key><integer>2</integer><key>Text</key><dict><key>Text</key><string>Server</string></dict></dict><dict><key>Class</key><string>LineGraphic</string><key>Head</key><dict><key>ID</key><integer>2</integer></dict><key>Tail</key><dict><key>ID</key><integer>1</integer></dict></dict></array></dict></plist>',
  },
  {
    id: "miro",
    name: "Miro",
    ext: "miro",
    extensions: ["miro"],
    language: "json",
    mode: "Derived",
    family: "Whiteboard",
    description:
      "Miro board items, sticky notes, cards, shapes, and connector lines converted to Mermaid flowchart.",
    sample:
      '{\n  "items": [\n    { "id": "1", "type": "sticky_note", "data": { "content": "Sprint Goal" } },\n    { "id": "2", "type": "card", "data": { "title": "Architecture Refactoring" } },\n    { "id": "3", "type": "connector", "startItem": { "id": "1" }, "endItem": { "id": "2" }, "caption": "Drives" }\n  ]\n}',
  },
  {
    id: "geojson",
    name: "GeoJSON / Geospatial (MVT, Shapefile, Protobuf)",
    ext: "geojson",
    extensions: ["geojson", "geo.json", "mvt", "pbf", "shp", "dbf", "kml", "topojson"],
    language: "json",
    mode: "Derived",
    family: "Geospatial & Maps",
    description:
      "GeoJSON FeatureCollections, Mapbox Vector Tile (MVT) Protobuf schemas, ESRI Shapefile attributes, and spatial topologies converted to visual diagrams.",
    sample:
      '{\n  "type": "FeatureCollection",\n  "features": [\n    {\n      "type": "Feature",\n      "properties": { "name": "Logistics Hub", "layer": "Distribution" },\n      "geometry": { "type": "Point", "coordinates": [-122.4, 37.7] }\n    },\n    {\n      "type": "Feature",\n      "properties": { "name": "Retail Store", "layer": "Fulfillment", "connectsTo": "Logistics Hub", "routeType": "Fleet Truck" },\n      "geometry": { "type": "Point", "coordinates": [-122.2, 37.8] }\n    }\n  ]\n}',
  },
];
export const getFormat = (id) =>
  FORMATS.find((format) => format.id === id) || FORMATS[0];
export const FILE_ACCEPT = [
  ...new Set(
    FORMATS.flatMap((f) => f.extensions).concat([
      "json",
      "yaml",
      "yml",
      "xml",
      "atlas",
      "svg",
    ]),
  ),
]
  .map((ext) => `.${ext}`)
// @ts-nocheck
