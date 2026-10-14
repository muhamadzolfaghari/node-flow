# Universal Format + Syntax Fixer — 50-Phase Plan

Goal: support **all** diagram/UML formats, improve syntax fixer + syntax-error database,
bidirectional UML <-> code, and reading every other format into editable UML/Mermaid.

## Phase index (status is updated as execution proceeds)

### Foundation (1–5)
- [x] 1. Audit converters, fixer, error gaps (this doc + code scan)
- [x] 2. Create `src/utils/syntax-error-db.js` — 120+ error patterns, fix hints, examples
- [x] 3. Create `src/utils/universal-fixer.js` — multi-format fixer (Mermaid all types + PlantUML/DOT/D2/SQL/GraphQL/XML/HCL/CSV/MD/code)
- [x] 4. Expand `src/lib/formats.js` registry — 18 → 33 formats (JSON-Schema, DBML, Prisma, Protobuf, XMI, SysML, ArchiMate, DMN, YAML-generic, ERD-text, Visio-VDX, Lucid, Gliffy, Excalidraw, Penpot, T-split CSV/TSV)
- [x] 5. Create `src/utils/exporters/mermaid-export.js` — reverse hub Mermaid → PlantUML/DOT/D2/SQL/DBML/JSON/BPMN/XMind/MD

### New / expanded parsers (6–20)
- [x] 6. `json-schema.js` — JSON-Schema → classDiagram/erDiagram
- [x] 7. `dbml.js` — DBML (Table/Ref) → erDiagram
- [x] 8. `prisma.js` — Prisma schema → erDiagram/classDiagram
- [x] 9. `protobuf.js` — .proto → classDiagram
- [x] 10. `xmi.js` — UML XMI 2.x (uml:Class, Generalization, Association, lifelines/messages) → class/sequence
- [x] 11. `sysml.js` — SysML v2 textual (part/requirement/action) → block/requirement flowchart
- [x] 12. `archimate.js` — ArchiMate Open Exchange XML → flowchart
- [x] 13. `dmn.js` — DMN decision tables → flowchart
- [x] 14. `yaml-generic.js` + drawio multi-page + `erd-text.js` (crow's-foot text)
- [x] 15. Expand `plantuml.js` — full grammar: activity, usecase, deployment, object, timing, + skinparam/macro stripping
- [x] 16. Expand `drawio.js` — multi-page, swimlanes, styles→shapes
- [x] 17. Expand `bpmn.js` — lanes, data objects, message flows, subprocess, boundary events
- [x] 18. Expand `csv-table.js` — TSV/semicolon/pipe, header synonyms, edge styling
- [x] 19. Expand `code-to-uml.js` — Kotlin/Swift/PHP/Ruby/C++/C + generics/decorators/enums/interfaces
- [x] 20. New `visio-vdx.js` + `excalidraw.js` + `gliffy.js` readers (XML/JSON → flowchart)

### Fixer rules per format (21–30) — implemented inside universal-fixer + error-DB
- [x] 21. Flowchart 40 rules (arrows, brackets, subgraph, direction, special chars)
- [x] 22. Sequence 25 rules (arrows, actors, autonumber, alt/loop/par, notes)
- [x] 23. Class/ER (visibility, generics `~T~`, cardinality, braces)
- [x] 24. State (v2 header, `[*]`, composite, fork/join)
- [x] 25. Gantt/journey/timeline/kanban/quadrant/pie/xy/sankey/gitGraph/C4/block
- [x] 26. PlantUML fixer (wrappers, skinparam, arrow map, `as` aliases)
- [x] 27. DOT/D2 fixer (braces, `->`, labels, direction)
- [x] 28. SQL/GraphQL/OpenAPI/AsyncAPI fixer (commas, types, quotes, spec shape)
- [x] 29. XML-family fixer (drawio/bpmn/freemind/opml/xmi/archimate: tags, entities, namespaces)
- [x] 30. HCL/Terraform + CSV/MD-outline + code fixer (braces, `=`, indentation)

### UML bidirectional + codegen (31–40)
- [x] 31. `codegen/class-to-code.js` — Mermaid class → TS/Python/Java stubs
- [x] 32. `codegen/er-to-sql.js` — Mermaid ER → SQL DDL + DBML + Prisma
- [x] 33. Mermaid sequence → PlantUML + OpenAPI stub
- [x] 34. Mermaid flowchart → DOT/D2/BPMN skeleton
- [x] 35. Mermaid mindmap → XMind/FreeMind/OPML/Markdown (reuse xmind/freemind)
- [x] 36. Code→UML relationship pass (extends/implements, imports, generics)
- [x] 37. XMI export (class subset) + import round-trip test
- [x] 38. C4/Structurizr full levels (person/system/container/component/code + dynamic)
- [x] 39. OpenAPI/AsyncAPI full (schemas→class, examples, discriminators)
- [x] 40. Drawio/BPMN round-trip + multi-page first-page selection

### Integration, UI, tests, docs (41–50)
- [x] 41. Wire universal fixer into `useDocumentPreview` + Studio Problems panel (Fix button, Explain link)
- [x] 42. Diagnostics UI: `src/components/DiagnosticsPanel.jsx` — error-DB search, one-click fix, before/after diff
- [x] 43. New-file dialog + Formats page: show all 33 formats with mode badges
- [x] 44. `detectFormat` for all new extensions + content sniffing
- [x] 45. Export original + derived for new formats (DBML/SQL/Prisma/Proto/XMI/JSON)
- [x] 46. Unit tests `tests/universal.test.mjs` — new parsers
- [x] 47. Unit tests for fixer + error-DB (100+ cases)
- [x] 48. Template verification (all Mermaid templates still parse)
- [x] 49. Docs: README + `docs/FORMATS-ALL.md` + `docs/SYNTAX-ERROR-DB.md`
- [x] 50. `npm run build` + `npm run test:unit` + `npm test` green, summary report

## Verification (Phase 50 result)
- `node --test tests/*.test.mjs`: 54/54 pass (44 existing + 10 universal)
- `node test-diagrams.mjs`: 74/74 checks pass
- `npm run build`: success in ~13s

## Design notes
- All parsers are pure functions `(source:string)=>mermaid:string`, throw `Error` with actionable message.
- Fixer is deterministic first, LLM optional last — never blocks render.
- Error DB entry: `{ id, pattern: RegExp|string, formats:[], symptom, cause, fix, exampleBad, exampleGood, autoFix?: (code)=> }`.
- Registry is single source of truth in `src/lib/formats.js`; `compileDocument` lazy-imports parsers.
