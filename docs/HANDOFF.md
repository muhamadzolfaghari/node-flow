# NodeFlow handoff

State of the project for whoever picks it up next. Read this first, then `docs/PHASES.md` (what was done, in order), `docs/TECH-DEBT-DISCOVERY.md` (dependency and debt findings), and `docs/IMPROVEMENT-LOOP.md` (the sprint plan and backlog). `docs/PLAN.md` consolidates every open item below into ordered phases with an exit check each.

## What it is

A browser-only diagram workspace (React 19, Vite 6, Tailwind 4, CodeMirror 6, Mermaid 11). Source code, a live canvas, and an AI assistant edit the same diagram. Projects live in the browser (localStorage / IndexedDB). There is no backend. HashRouter, deployed to GitHub Pages under `/node-flow/`.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | `vite build` then `scripts/prerender-seo.mjs` (static SEO pages, sitemap, llms.txt) |
| `npm run lint` | ESLint `no-undef` + `react/jsx-no-undef`. Catches used-but-undefined identifiers, which previously broke ~13 Studio controls at click time |
| `npm run test:unit` | `node --test tests/*.test.mjs` (111 tests) |
| `npm test` | Format/syntax checks (115) |
| `npm run test:browser` | Full Puppeteer suite (starts its own server on :4175) |
| `npm run audit:templates` | Opens all 51 templates, checks render and canvas framing |
| `npm run audit:studio` | Clicks every menu item and toolbar button, reports crashes and error toasts |
| `npm run audit:canvas` | Real-click canvas flows: all 14 shapes, colour, add, connect, duplicate, delete, undo, syntax error + AI fix |
| `npm run audit:framing` | Measures every template's drawn content against the canvas viewport; fails when a diagram is off-centre, clipped or framed on empty space. Writes `docs/framing-audit.json` |
| `npm run audit:quality` | Checks file and function length, nesting and parameters against `.agents/rules/code-quality-metrics.md`; reports duplication, commented-out code and unnamed literals. Exits non-zero on hard-limit failures |

All of the above passed at handoff.

## Architecture in one screen

- `src/pages/Studio.jsx` (~7.5k lines) — the workspace: menus, explorer, inspector, dialogs, AI review flow. Too large; splitting it is the main structural debt.
- `src/components/CanvasStage.jsx` — pan/zoom/fit, selection, floating node toolbar, connect handles, minimap, bottom toolbar.
- `src/components/CodeEditor.jsx` — CodeMirror editor, linting, completion, AI Quick Fix. The view is created **once per mount**; do not make it depend on `document` identity (that rebuilt it on every keystroke and killed focus and history). It stays mounted (hidden) in Canvas view so undo/find/AI-fix work there.
- `src/lib/visual-editing.js` — source-mutating edits for the canvas (flowchart nodes, shapes, edges, plus sequence/class/state/ER helpers). `SHAPES` + `scanNodeDeclarations` are the single source of truth for the 14 flowchart shapes. `flowchartNodeId()` maps rendered SVG ids (`mermaid-render-N-flowchart-A-0`) to source ids.
- `src/utils/ai-syntax-fixer.js`, `universal-fixer.js` — deterministic syntax repair. `repairReportedLine` tries line-level fixes validated by the real Mermaid parser.
- `src/features/ai/providers.js`, `src/hooks/useDiagramAssistant.js` — AI engines (deterministic, WebGPU, Ollama, Gemini, OpenAI-compatible). Gemini SDK is lazy-loaded. Model output gets one repair round using the parser error.
- `src/lib/app-theme.js`, `src/components/ThemeSwitcher.jsx`, palettes in `src/index.css` under `:root[data-app-theme=…]`; an inline script in `index.html` applies the theme before first paint. Editor and syntax colours are CSS variables.
- `scripts/prerender-seo.mjs` — generates real-path static pages (templates, formats, studio), `sitemap.xml`, `llms.txt` into `dist/`.

## Gotchas

- **Stale modules in the in-app browser:** if the HMR websocket fails, the page can run old code. Test on a fresh port.
- **Leftover dev servers:** the browser suite spawns a detached Vite on :4175; an orphan from a failed run makes the next run fail with a confusing `.cm-editor` timeout. Kill it first.
- **Puppeteer is pinned to 25.12.0** (matches the cached Chrome 154). 25.14 wants Chrome 155, which is not installed, and hangs the install.
- A killed `npm update` leaves dot-prefixed temp dirs in `node_modules/` that cause `ENOTEMPTY`; move them aside and retry.
- Hidden CodeMirror renders no lines, so tests read source from the saved workspace (`diagramatlas_workspace_v1` in localStorage), not the DOM.

## Open work (priority order)

1. **Dead code needs an owner decision.** `src/main.js` (1,795-line legacy entry, not referenced by `index.html`) and files only it imports: `components/{import-modal,wasm-benchmark-modal,landing,analytics-modal,minimap,ai-assistant}.js`, `utils/visitor-analytics.js`, `utils/cn.js`, `hooks/useMermaid.js`, `components/primitives/select.jsx`. Not deleted.
2. **Other diagram types on the canvas** (sequence, class, state, ER): editing helpers exist but have only basic coverage; the flowchart is the well-tested path.
3. **Mobile/touch:** gestures and panel layout in the Studio were not re-audited in this pass.
4. **AI:** structured create/update/delete/connect operations, selection-aware context, a visible cloud-data summary in the AI dialog.
5. **Split `Studio.jsx`.**
6. **Major upgrades deferred:** mermaid 12, vite 8, `@vitejs/plugin-react` 6 (evaluate one at a time with the suites above).
7. **Accessibility/contrast audit** of all five themes, especially High contrast and Light in the canvas chrome.
8. Real-device performance profile (only bundle-level numbers exist).

## Verified vs not verified

Verified by running: everything in the command table above, plus manual passes in a browser for code → canvas, canvas → code, AI Quick Fix, theme switching, and the landing page in Studio Dark and Light.

Not verified: other themes on every page, physical mobile devices, screen readers, cloud AI providers with real keys, GitHub Pages deployment of the new static SEO pages (they build locally and are linked from the generated sitemap).
