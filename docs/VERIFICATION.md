# NodeFlow Quality Sprint Verification Report

Verified locally with the production build served under `/node-flow/` and `/diagram-atlas/`.

## Automated checks

- `npm run build`: successful production build in ~10.6s with code splitting, dynamic imports, and source maps. Heavy modules (WebLLM, Graphviz Wasm) load strictly on demand.
- `npm test`: 94 checks pass, including all 30 starter templates, reference diagrams, shared syntax validation gates, error fixers, import engines, XMind round trips, PDF generation, and Graphviz WebAssembly.
- `npm run test:unit`: 63 tests pass. Covers every format sample (30+ formats), source preservation, content sniffing, PlantUML full grammar, BPMN expanded lanes/message flows, C4 context, code-to-UML multi-language extraction, error database lookup, universal fixer, reverse export hub, project validation, backups, SVG source metadata roundtrip, and visual flowchart edits (shapes, color presets, arrow styles, quick-add child steps, duplicate node with style cloning, layout direction switcher, cascading node deletion).
- `npm run test:browser`: verifies all 31 format previews inside the actual live browser workspace; original source downloads; SVG, PNG, PDF, and HTML downloads; project and ZIP backup restoration; tabs and reload persistence; visual nodes and connections; snapshots; last valid preview retention; source search; React Router transitions and filters; keyboard commands; and phone layouts and panel dialogs.
- `Total automated checks`: 157 automated unit/integration checks + 31 live browser end-to-end format checks (188 total checks, 0 failed).

The browser suite runs against development or production via `ATLAS_TEST_URL`. It uses a fresh browser profile and temporary downloads, and cleans them up afterward. GitHub Actions runs the build and all three test suites on `main` and pull requests.

## Visual review

`screenshots/audit` preserves the original five-page design. `screenshots/enterprise` contains the reviewed home, templates, projects, formats, studio, and not-found pages at 1440×1000 desktop and 390×844 phone viewports. Marketing pages are captured in full; the studio uses a viewport capture to preserve its panel layout.

To refresh screenshots while a server is running:

```sh
ATLAS_TEST_URL=http://127.0.0.1:4176/diagram-atlas node scripts/capture-screenshots.mjs
```

## Known scope and unverified behavior

- Converted formats intentionally support documented subsets. Their vendor layout, styling, macros, and execution semantics are not fully reproduced. Original text remains editable and exportable.
- Visual source edits support Mermaid flowchart node creation, renaming, shape selection (8 shapes), color accents, connector arrow styles (6 styles), quick child step creation via Enter/Tab or inspector, node duplication via Cmd+D or inspector, layout direction switching (TD/LR/BT/RL), and cascading node deletion via Delete/Backspace. Other diagram types remain editable through source code.
- Storage is local to this browser; there is no shared cloud persistence or collaborative editing service.
- PDF export embeds a raster image. SVG remains the vector export.
- Optional Qwen model download and WebGPU inference have not been verified in the headless browser. The UI reports unavailable WebGPU and model-loading failures.
- Native mobile touch gestures, OS fullscreen behavior, every vendor syntax variation, and extreme-size real-world projects require further device and fixture testing.
