# All Supported Formats (32)

Derived previews are structural models, not lossless vendor renderers.
Original source always stays editable; export downloads original or derived view.

| # | Format | Extensions | Mode | Family | Preview |
|---|--------|-----------|------|--------|---------|
| 1 | Mermaid | .mmd, .mermaid | Native | Diagrams | flowcharts, ER, UML class/sequence/state, mindmaps, Gantt, C4, journeys, timelines, Git, Sankey, pie, XY, quadrant, Kanban, block |
| 2 | Graphviz DOT | .dot, .gv | Native | Architecture | native Wasm layout |
| 3 | PlantUML | .puml, .plantuml | Derived | UML | sequence, class, state, activity, usecase, deployment, object (skinparam/macros stripped) |
| 4 | D2 | .d2 | Derived | Architecture | nodes, connections, containers |
| 5 | SQL DDL | .sql | Derived | Data | CREATE TABLE → ER |
| 6 | DBML | .dbml | Derived | Data | Table/Ref → ER |
| 7 | Prisma | .prisma | Derived | Data | model blocks → ER |
| 8 | Protobuf | .proto | Derived | Data | message/enum → class |
| 9 | JSON Schema | .schema.json + content-sniffed .json | Derived | Data | properties/$defs → class |
| 10 | GraphQL SDL | .graphql, .gql | Derived | Data | types → class |
| 11 | OpenAPI / Swagger | content-sniffed .json/.yaml | Derived | APIs | first 10 paths → sequence; schemas-only → class |
| 12 | AsyncAPI | content-sniffed .json/.yaml | Derived | APIs | first 12 channels (v2/v3) → sequence |
| 13 | YAML structure | .yaml, .yml | Derived | Data | generic mappings (K8s/Compose) → mindmap |
| 14 | ERD text | .erd | Derived | Data | crow's-foot text → ER |
| 15 | UML XMI | .xmi, .uml | Derived | UML | uml:Class/Generalization/Association → class; lifelines/messages → sequence |
| 16 | SysML v2 | .sysml | Derived | UML | part/requirement/action → flowchart |
| 17 | ArchiMate Exchange | content-sniffed .xml | Derived | Architecture | elements/relationships → flowchart |
| 18 | DMN | .dmn | Derived | Processes | decision tables (XML or when/then) → flowchart |
| 19 | Draw.io | .drawio (+.xml sniff) | Derived | Diagrams | multi-page: first non-empty page decoded → flowchart |
| 20 | BPMN 2.0 | .bpmn (+.xml sniff) | Derived | Processes | tasks/events/gateways + lanes, data objects, message flows, subprocess, boundary events |
| 21 | C4 / Structurizr | .dsl, .c4 | Derived | Architecture | person/system/container/component/code + dynamic views → C4Context |
| 22 | Terraform HCL | .tf | Derived | Architecture | resources + refs → graph |
| 23 | Markdown outline | .md, .markdown, .txt | Derived | Mindmaps | bullets → mindmap, or first ```mermaid fence |
| 24 | CSV relationships | .csv, .tsv | Derived | Data | source,target rows (csv/tsv/;/|) → graph; table/col form → ER |
| 25 | FreeMind | .mm (+.xml sniff) | Derived | Mindmaps | topics → mindmap |
| 26 | OPML | .opml (+.xml sniff) | Derived | Mindmaps | outlines → mindmap |
| 27 | XMind | .xmind | Mindmap | Mindmaps | first sheet ZEN/legacy → editable mindmap; export new workbook |
| 28 | Visio VDX | .vdx | Derived | Diagrams | Shape/Connect → flowchart |
| 29 | Gliffy JSON | .gliffy (+.json sniff) | Derived | Diagrams | stage objects → flowchart |
| 30 | Excalidraw JSON | .excalidraw (+.json sniff) | Derived | Diagrams | shapes → flowchart |
| 31 | Source code → UML | .ts/.tsx/.js/.jsx/.py/.java/.cs/.go/.rs/.kt/.swift/.php/.rb/.cpp/.c | Derived | UML | classes/structs/enums + extends/implements → class |
| 32 | Mermaid reverse export | — | Export | — | Mermaid → PlantUML/DOT/D2/SQL/DBML/XMI/TS/OPML/MD + OpenAPI stub |

## Reverse / bidirectional matrix (UML ↔ code)

| From | To | Engine |
|------|----|--------|
| Mermaid class | PlantUML, TypeScript stub, UML XMI | `src/utils/exporters/mermaid-export.js` |
| Mermaid ER | SQL DDL, DBML | same |
| Mermaid sequence | PlantUML, OpenAPI stub | same |
| Mermaid flowchart | DOT, D2, BPMN skeleton | same |
| Mermaid mindmap | Markdown, OPML, XMind | same + `xmind.js`/`freemind.js` |
| Code (12 langs) | Mermaid class | `code-to-uml.js` |
| XMI | Mermaid class/sequence | `xmi.js` (+ XMI export back) |
