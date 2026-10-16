# NodeFlow Quality Sprint Verification Report

Verified locally on October 16, 2026, with the production build served under `/node-flow/`.

## Automated checks

- `npm run build`: successful production build. Mermaid grammar and renderer chunks load on demand. The initial JavaScript payload is about 169 KB gzip (app entry, React, and UI), compared with about 4.1 MB gzip of Mermaid-containing shared code preloaded before the change. This is a bundle measurement, not a device startup benchmark.
- `npm test`: 115 checks pass, including starter templates, reference diagrams, syntax validation, import/export engines, AI validation, design primitives, WebAssembly, and production output inspection.
- `npm run test:unit`: 102 tests pass. Covers all registered format samples, source preservation, content detection, conversions, syntax fixes, project persistence, and visual modeling across diagram families.
- `npm run test:browser`: passes 39 format previews in the live browser workspace, source and image/document exports, project and ZIP backup restoration, tabs and reload persistence, visual editing, snapshots, errors, search, routes, keyboard commands, and phone layouts and panels.
- `Total automated checks`: 102 unit tests + 115 integration checks + 39 browser format previews (256 passed checks).

The browser suite also ran against the production build under `/node-flow/`. It passed all 39 format previews, exports, persistence, invalid-source retention, and backup restoration, then stalled on the “Find in file” editor command. The full development-server suite passes; production-only command behavior or test targeting remains open.

The browser suite runs against development or production via `ATLAS_TEST_URL`. It uses a fresh browser profile and temporary downloads, and cleans them up afterward. GitHub Actions runs the build and all three test suites on `main` and pull requests.

## Visual review

`screenshots/audit` preserves the original five-page design. `screenshots/enterprise` contains the reviewed home, templates, projects, formats, studio, and not-found pages at 1440×1000 desktop and 390×844 phone viewports. Marketing pages are captured in full; the studio uses a viewport capture to preserve its panel layout.

To refresh screenshots while a server is running:

```sh
ATLAS_TEST_URL=http://127.0.0.1:4176/diagram-atlas node scripts/capture-screenshots.mjs
```

## Known scope and unverified behavior

- Converted formats intentionally support documented subsets. Their vendor layout, styling, macros, and execution semantics are not fully reproduced. Original text remains editable and exportable.
- Visual source edits support Mermaid flowcharts (node creation, renaming, 8 shapes, color accents, 6 arrow styles, quick child steps, duplication, direction switching, cascading deletion, edge disconnection), sequence diagrams (participant/actor management, message passing with arrow styles), class diagrams (class addition, field/method declaration, relationships, class removal), state diagrams (state addition with labels, transitions with events, state deletion), entity-relationship diagrams (entity creation, typed attributes with PK/FK flags, relational cardinalities, entity deletion), mindmaps (topic hierarchy, custom-shaped subtopic addition, subtree pruning), git graphs (commit, branch, checkout, and merge), pie charts (chart title editing, weighted slice addition, slice removal), user journey maps (section organization, task addition with satisfaction ratings and actors, task deletion), kanban boards (columns, card addition, card removal), gantt charts (workstream section creation, scheduled task addition with status and duration, task deletion), quadrant charts (point coordinate editing, item addition, point deletion), timelines (period creation, event addition with descriptions, event deletion), sankey diagrams (link flow modeling and removal), xy charts (title updates, bar/line series management), block diagrams (column layout and hardware/system block management), C4 architecture models (Context/Container/Component elements and protocol relations), requirement diagrams (functional/performance requirements, elements, traceability links, deletion), packet & bytefield diagrams (bitfield ranges, single bits, field deletion), cloud & architecture diagrams (groups, services, port connections, deletion), and diagram look/theme styling (hand-drawn sketchy mode and theme presets). Other diagram types remain editable through source code.
- Storage is local to this browser; there is no shared cloud persistence or collaborative editing service.
- PDF export embeds a raster image. SVG remains the vector export.
- Optional Qwen model download and WebGPU inference have not been verified in the headless browser. The UI reports unavailable WebGPU and model-loading failures.
- AI proposal generation and discard are covered in the automated browser suite. Apply and append behavior was manually verified; a stable automated apply assertion remains to be added. Structured AI operations, selection-aware context, and undoable AI transactions are not implemented.
- Native mobile touch gestures, OS fullscreen behavior, every vendor syntax variation, and extreme-size real-world projects require further device and fixture testing.
