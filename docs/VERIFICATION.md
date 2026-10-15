# NodeFlow Quality Sprint Verification Report

Verified locally with the production build served under `/node-flow/` and `/diagram-atlas/`.

## Automated checks

- `npm run build`: successful production build in ~10.6s with code splitting, dynamic imports, and source maps. Heavy modules (WebLLM, Graphviz Wasm) load strictly on demand.
- `npm test`: 94 checks pass, including all 30 starter templates, reference diagrams, shared syntax validation gates, error fixers, import engines, XMind round trips, PDF generation, and Graphviz WebAssembly.
- `npm run test:unit`: 68 tests pass. Covers every format sample (30+ formats), source preservation, content sniffing, PlantUML full grammar, BPMN expanded lanes/message flows, C4 context, code-to-UML multi-language extraction, error database lookup, universal fixer, reverse export hub, project validation, backups, SVG source metadata roundtrip, PowerPoint slide (.pptx) export, and visual modeling for flowcharts (shapes, color presets, arrow styles, quick-add child steps, duplicate node with style cloning, layout direction switcher, cascading node deletion, edge inspection and disconnection with inline/pipe labels), sequence diagrams (participants, actors, messages, arrows, participant removal), class diagrams (classes, members, relationships, class deletion), and diagram render look (classic/hand-drawn) and theme presets.
- `npm run test:browser`: verifies all 31 format previews inside the actual live browser workspace; original source downloads; SVG, PNG, PDF, and HTML downloads; project and ZIP backup restoration; tabs and reload persistence; visual nodes and connections; snapshots; last valid preview retention; source search; React Router transitions and filters; keyboard commands; and phone layouts and panel dialogs.
- `Total automated checks`: 162 automated unit/integration checks + 31 live browser end-to-end format checks (193 total checks, 0 failed).

The browser suite runs against development or production via `ATLAS_TEST_URL`. It uses a fresh browser profile and temporary downloads, and cleans them up afterward. GitHub Actions runs the build and all three test suites on `main` and pull requests.

## Visual review

`screenshots/audit` preserves the original five-page design. `screenshots/enterprise` contains the reviewed home, templates, projects, formats, studio, and not-found pages at 1440×1000 desktop and 390×844 phone viewports. Marketing pages are captured in full; the studio uses a viewport capture to preserve its panel layout.

To refresh screenshots while a server is running:

```sh
ATLAS_TEST_URL=http://127.0.0.1:4176/diagram-atlas node scripts/capture-screenshots.mjs
```

## Known scope and unverified behavior

- Converted formats intentionally support documented subsets. Their vendor layout, styling, macros, and execution semantics are not fully reproduced. Original text remains editable and exportable.
- Visual source edits support Mermaid flowcharts (node creation, renaming, 8 shapes, color accents, 6 arrow styles, quick child steps, duplication, direction switching, cascading deletion, edge disconnection), sequence diagrams (participant/actor management, message passing with arrow styles), class diagrams (class addition, field/method declaration, relationships, class removal), and diagram look/theme styling (hand-drawn sketchy mode and theme presets). Other diagram types remain editable through source code.
- Storage is local to this browser; there is no shared cloud persistence or collaborative editing service.
- PDF export embeds a raster image. SVG remains the vector export.
- Optional Qwen model download and WebGPU inference have not been verified in the headless browser. The UI reports unavailable WebGPU and model-loading failures.
- Native mobile touch gestures, OS fullscreen behavior, every vendor syntax variation, and extreme-size real-world projects require further device and fixture testing.
