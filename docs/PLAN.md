# NodeFlow execution plan

Single source of truth for what is left to do. Read this with [HANDOFF.md](HANDOFF.md)
(current state), [PHASES.md](PHASES.md) (what has landed, in order),
[TECH-DEBT-DISCOVERY.md](TECH-DEBT-DISCOVERY.md) (dependency findings) and
[IMPROVEMENT-LOOP.md](IMPROVEMENT-LOOP.md) (the sprint loop).

Work the phases in order. Each one names the evidence it must produce; a green phase
means the check in the last column passed, not that the code compiles.

## 1. Baseline, measured on this tree

| Check | Result |
|---|---|
| `npm run lint` | clean |
| `npm run test:unit` | 165 pass, 0 fail |
| `npm test` | 115 checks pass, 0 fail |
| `npm run build` | success, 51 template pages + sitemap |
| `npm run audit:templates` | 51 templates, 0 problems |
| `npm run audit:canvas` | 24/24 flows, 0 page errors |
| `npm run audit:framing` | 51/51 within 6% of centre |
| `npm run audit:studio` | 121 controls, 0 crashes |
| `npm run audit:quality` | 114 hard-limit failures (was 117), plus advisory findings |
| `npm run test:browser` | not run recently; the audits above cover the same surfaces |

## 2. Already landed

Logged in [PHASES.md](PHASES.md) phases 1–12: template/studio/canvas audits and the
defects they found, dependency cleanup, the 14-shape visual editor, undo from canvas,
themes, landing and SEO, canvas framing measured against drawn content, gesture rendering
taken off the React path, and the code-quality harness.

## 3. Owner needs, deduplicated

Every request below is in the 30 phases. Repeated reports are collapsed to one line.

| Ref | Need |
|---|---|
| A | Design quality: the UI does not look or feel good enough |
| B | Editor: not focused, not accepting input; Quick Fix ineffective; hints say the wrong thing; suggestions too thin |
| C | Zoom in/out is not smooth |
| D | Autocomplete quality is poor |
| E | Canvas framing: charts are not focused where their content is |
| F | Improve canvas and preview colours/theming |
| G | Geospatial in the canvas: GeoJSON, Shapefile, Protobuf vector tiles |
| H | Recognise errors and fix them |
| I | Recognise performance issues and fix them |
| J | Recognise SEO issues and fix them |
| K | Lighthouse: fix all errors, reach 100, no remaining issues |
| L | Add new features |
| M | Code quality and ESLint across all files, per the rules in `.agents/` (gitignored) |
| N | Changelog with per-change versioning, in a markdown file and a page on the site, major/minor/patch |
| O | Research comparable products online to improve and to make the app enterprise-ready |
| P | README: showcase what the project does and what it gained, and make it discoverable |
| Q | Improve libraries, adopt native alternatives where possible, update React and other libraries |
| R | React 19 best practices, and show that the newest stack is in use |
| S | Use shadcn + CVA + Tailwind and migrate to them |
| T | Canvas is not interactive: study XMind, let users manipulate the chart in a better UI/UX, not just show a toolbox |

## 4. The 30 phases

| # | Phase | Need | Exit check |
|---|---|---|---|
| 1 | Editor focus and typing | B | Browser check: click anywhere in the editor focuses `.cm-content`, typed characters appear, focus survives a parent re-render; no editor remount on keystroke |
| 2 | Quick Fix that repays the click | B | Browser check: a broken document becomes valid or shows a specific reason it cannot; the reported line moves or the message explains why it does not |
| 3 | Hint and diagnostics quality | B | Every diagnostic message names the actual fault and links to an error-database entry; unit tests assert message-to-error-kind mapping |
| 4 | Autocomplete quality | D | Completions are context-aware per diagram type; keywords and templates never appear mid-statement; unit tests cover statement-start, after-arrow and identifier positions |
| 5 | Framing regression guard | E | `audit:framing` runs in CI on every change; a deliberate framing regression fails it |
| 6 | Gesture performance budget | C | Frame-cost measurement for zoom/pan on the largest template, recorded and enforced; no React render per wheel event |
| 7 | Flowchart direct manipulation | T | Drag to move, drag to connect, inline rename, add/delete on the canvas; `audit:canvas` covers each as a real drag |
| 8 | Sequence and class direct manipulation | T | Same flows for sequence and class diagrams, verified by real clicks and by source/render agreement |
| 9 | State, ER and mindmap direct manipulation | T | Same flows for state, ER and mindmap |
| 10 | Chart-family direct manipulation | T | Pie, gantt, kanban, timeline, journey, quadrant: manipulate values/steps on the canvas, not only in source |
| 11 | Canvas interaction polish | T | Snapping, alignment guides, multi-select and full keyboard parity; pointer-cancel leaves no half-state |
| 12 | Toolbox becomes context actions | T | Tool-only affordances replaced by selection-driven actions; a user can complete a diagram without opening a panel |
| 13 | Design review against comparables | A, O | Written review of Miro/Lucid/Eraser/XMind patterns with sources, and the gap list this app will close |
| 14 | Design-system inventory for shadcn/CVA | S | Inventory of bespoke primitives and variants with the shadcn/CVA replacement for each; no UI change yet |
| 15 | Migrate shared primitives | S | Buttons, dialogs, menus, cards, tables on shadcn + CVA + Tailwind tokens; `audit:studio` unchanged; screenshots refreshed |
| 16 | Migrate studio chrome | S | Toolbars, explorer, inspector and canvas overlays use the shared primitives; no bespoke variants left |
| 17 | Canvas and preview theming | F | All five palettes plus "match system" cover canvas chrome, preview surface and diagram theme in step; per-theme contrast report |
| 18 | Responsive and touch pass | A | Critical flows pass at 390px, tablet and UHD; panel switching and touch gestures verified, horizontal overflow guarded by a test |
| 19 | Geospatial: GeoJSON and TopoJSON | G | Load, inspect and edit as a diagram view with limits stated in the UI; browser check per input |
| 20 | Geospatial: MVT/Protobuf vector tiles | G | Vector-tile pyramid decodes and renders as a diagram view; unsupported layers listed, not silently dropped |
| 21 | Geospatial: Shapefile and binary formats | G | Shapefile schema/geometry supported and documented; no claim of map rendering |
| 22 | New features, batch A | L | Prioritised from phase 13 gaps (e.g. layers, data linking, presentation mode), each with a browser check |
| 23 | New features, batch B | L | Format and template expansion with tests, including round-trip for any new format |
| 24 | Error recognition and repair | H | Error boundaries with recovery, a reproducible error list, and each confirmed error fixed with a regression test |
| 25 | Performance work | I | Device-level profile (startup and interaction), lazy-load or workerize proven hotspots, enforce an initial-JS budget |
| 26 | SEO audit and fixes | J | Titles, descriptions, canonicals, structured data and sitemap verified against implemented behaviour on every route |
| 27 | Lighthouse to 100 | K | Committed Lighthouse runs (mobile and desktop) against the production build with all errors fixed and remaining warnings listed |
| 28 | Code-quality burn-down | M | `audit:quality` hard failures fall each phase, starting with `Studio.jsx` (8,060 lines) and `visual-editing.js`; checker runs in CI |
| 29 | Library and React 19 modernisation | Q, R | Native replacements adopted where they hold up, React 19 APIs used where they measurably help, majors taken one per change with before/after bundle numbers |
| 30 | Changelog surface, README and positioning | N, P, O | `/changelog` page and a visible version render from the same data as `CHANGELOG.md`; README leads with verified gains; enterprise wording matches capability |

## 5. Ordering and dependencies

- Phases 1–6 are reliability and the reported defects: they come before new surface area.
- Phases 7–12 need phase 28's first extraction to be pleasant to work in; do 28's first
  slice (Studio.jsx) before phase 16.
- Phases 13–16 are a chain: review, inventory, primitives, chrome. Phase 17 and 18 follow.
- Phases 19–21 share one ingestion path; do them in order so the binary formats reuse it.
- Phases 24–27 measure, then fix; phase 27 is the gate that proves 25 and 26 held.
- Phase 30 depends on 13 and 19–27 being real, so that the README states verified gains.

## 6. Non-goals

- No backend, account system, collaboration or server-side storage in this architecture.
- No claim of lossless vendor conversion; converted formats stay documented subsets.
- No "enterprise-ready" or "100% private" wording until phase 27 and the audit behind it
  prove the capability.

## 7. Definition of done

A phase is done when the focused unit or syntax checks pass, the browser workflow that
exercises the change passes, the production build succeeds, keyboard/pointer/empty/error
and phone states were considered, the change is recorded in `PHASES.md`, and a versioned
entry is added to `CHANGELOG.md`. A successful build alone is not completion.
