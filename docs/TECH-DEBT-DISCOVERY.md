# Technical debt discovery

Method: `npm outdated`, `npm audit`, depcheck, bundle source-map analysis, orphan-file scan, a `no-undef` lint over `src/`, a 51-template browser sweep, and a click-through of every Studio menu item and toolbar button.

## Findings

| # | Area | Finding | Severity | Status |
|---|------|---------|----------|--------|
| 1 | Studio tools | 13 identifiers used but never defined/imported (`exportSvg`, `exportPng`, `saveSnapshot`, `runAiFix` ×3, `RotateCcw` ×4, `ArrowRight`, minimap `onMove`). Each threw when the control was used: export from the file explorer, "Save Version Snapshot", the three "AI Diagnostics & Fix" entries, "Reopen Closed Tab" icon, the `state-diagram` template (page crash), and minimap dragging. | High | **Fixed**; `npm run lint` now guards this |
| 2 | Canvas | Fit math treated SVG viewBox coordinates as pixels, so diagrams with a non-zero viewBox origin (kanban, timeline, roadmap, C4, packet, …) were off-centre and tiny. | High | **Fixed** (bounds converted to container pixel space) |
| 3 | Undeclared dependency | `@codemirror/lint` imported in `CodeEditor.jsx` but absent from `package.json` (worked only via hoisting). | Medium | Open → fix in loop |
| 4 | Unused dev deps | `prettier`, `wabt` have no references in `src/`, `scripts/`, `tests/`. | Low | Open → fix in loop |
| 5 | Eager heavy import | `@google/genai` was imported statically into the Studio chunk although only used when the Gemini engine is selected. | Medium | **Fixed** (dynamic import) |
| 6 | Build config | Production source maps shipped publicly (`sourcemap: true`, dist 44 MB); `chunkSizeWarningLimit: 15000` hides size regressions. | Medium | Source maps now `hidden`; limit review open |
| 7 | Dead code | `src/main.js` (1,795-line legacy vanilla entry, not referenced by `index.html`) plus files only it imports: `components/{import-modal,wasm-benchmark-modal,landing,analytics-modal,minimap,ai-assistant}.js`, `utils/visitor-analytics.js`, `utils/cn.js`, `hooks/useMermaid.js`, `components/primitives/select.jsx`. | Medium | **Needs owner approval to delete** |
| 8 | Patch/minor drift | `@codemirror/language`, `@codemirror/view`, `@mlc-ai/web-llm`, `@vitejs/plugin-react` (4.3→4.7), `@viz-js/viz`, `lucide-react`, `prettier`, `puppeteer`, `radix-ui`, `react`/`react-dom` 19.3.1, `vite` 6.4.4. | Low | Open → fix in loop |
| 9 | Major upgrades | `mermaid` 11→12, `vite` 6→8, `@vitejs/plugin-react` →6. | Medium | Evaluate individually with rollback |
| 10 | Security | `npm audit`: 0 vulnerabilities. | — | OK |
| 11 | Large lazy chunks | `@mlc-ai/web-llm` (6 MB) is lazy-loaded only for the local-model engine; `vendor-viz` 1.35 MB. | Info | OK, keep lazy |
| 12 | Test harness | Browser suite spawns a detached dev server; an orphan from a failed run holds port 4175 and makes the next run fail with a confusing `.cm-editor` timeout. | Low | Open |

## Evidence of Studio health (after fixes)

- `npm run audit:templates`: 51/51 templates render, no page errors, all visible in the canvas.
- `npm run audit:studio`: 96 menu items / toolbar buttons exercised, 0 crashes, 0 error toasts.
- `npm run lint`: clean. `npm run test:unit` 108/108, `npm test` 115/115, `npm run test:browser` passes, `npm run build` succeeds.

## Follow-up status
- #3, #4, #8 (semver), #5 done. #6 source maps are `hidden`. #12: the suite's leftover dev server must be killed before re-running.
- Added guardrails: `npm run lint` (undefined identifiers), `audit:templates`, `audit:studio`, `audit:canvas`.
- Still open: #7 dead code needs an owner decision; #9 major upgrades.
