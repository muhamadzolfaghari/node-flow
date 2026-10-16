# NodeFlow improvement loop

This plan turns the improvement history into a repeatable five-hour sprint. Each hour ends with a usable result and evidence. The cycle prioritizes editing reliability, AI safety, and performance before adding more surface area.

## The loop

Repeat this sequence for one user-facing problem at a time:

1. **Observe:** choose a real workflow and reproduce the friction in the browser. Capture the current behavior at desktop and phone widths when layout or touch is involved.
2. **Define:** state the user, trigger, expected result, actual result, and the smallest useful change. Check the format registry and existing interaction conventions before adding a dependency.
3. **Change:** implement one coherent slice, keeping original source recoverable and making state transitions explicit.
4. **Verify:** run the focused unit or syntax checks, the browser workflow that exercises the change, and a production build. Review keyboard, pointer cancellation, empty/error states, and phone layout when relevant.
5. **Learn:** record the outcome, known limit, and next highest-friction issue. Update screenshots or documentation when user-visible behavior changes.

Do not call a loop complete based only on a successful build. The user workflow must also work in the browser.

## Five one-hour loops

### Loop 1 — Establish a trustworthy baseline

**Goal:** know what works now and which failures matter most.

- Run the existing unit, syntax, and browser suites; record exact counts and failures rather than copying old sprint totals.
- Open the studio at desktop and phone sizes. Reproduce the reported editing, focus, zoom, canvas manipulation, and AI flows.
- Compare the current workflow with Miro’s context-aware canvas prompts, Lucid’s AI iteration, and Eraser’s editable diagram-as-code flow. Use the source-linked notes in [COMPETITIVE-RESEARCH.md](COMPETITIVE-RESEARCH.md).
- Create a short issue list ranked by severity, frequency, and user impact.

**Exit:** a clean baseline report, reproducible top issues, and one selected next issue. No feature work begins until the top issue is reproducible.

### Loop 2 — Make editing dependable across canvas and source

**Goal:** a user can reliably change a diagram and keep the source and preview in agreement.

- Fix the highest-ranked interaction defect from the baseline, prioritizing source-editor focus and edits, canvas content framing, smooth zoom, drag-to-connect, selection, and pointer-cancel cleanup.
- Check whether the same source mutation path is used by keyboard editing, canvas tools, undo, and redo.
- Validate on a small fixture and a large diagram, then repeat the key flow on a phone viewport.

**Exit:** the reproduced issue no longer occurs; the active file remains editable; undo/redo and preview behavior are correct; the relevant browser flow passes.

### Loop 3 — Make AI edits contextual and reviewable

**Goal:** AI can help with an existing document without silently replacing user work.

- Include active document, selected nodes, diagram type, and diagnostics as explicit request context, with a visible summary of what will be sent to cloud providers.
- Define a validated diagram-operation format for create, update, delete, and connect actions.
- Preview proposed changes, validate resulting syntax, then apply the approved change as one undoable transaction.
- Add deterministic editor completions and diagnostics before remote predictive autocomplete. Show AI suggestions only when deterministic help is insufficient.

**Exit:** a representative edit request produces a schema-valid proposal, preview, successful syntax check, apply, and undo. Rejection leaves the document unchanged.

### Loop 4 — Reduce performance and dependency risk

**Goal:** keep common interactions responsive and make expensive work load only when needed.

- Measure startup and interaction costs before changing libraries. Record bundle chunks and identify duplicate or unused packages.
- Keep Mermaid, Graphviz/WebAssembly, WebGPU weights, and other large capabilities lazy-loaded. Move CPU-heavy parsing or generation to a worker only when a measurement shows main-thread blocking.
- Prefer built-in browser APIs when they meet the same needs; retain libraries that provide meaningful grammar, accessibility, or rendering value.
- Check React 19 usage against actual component behavior instead of adding newer hooks only to advertise them.

**Exit:** before/after measurements show the targeted improvement, feature behavior remains intact, and the production build succeeds without unexpectedly larger initial chunks.

### Loop 5 — Release quality and discoverability

**Goal:** make the current product understandable, accurate, accessible, and ready to share.

- Review navigation, focus order, labels, contrast, keyboard behavior, modal dismissal, and mobile panel behavior.
- Check page titles, descriptions, canonical URLs, social previews, structured data, and screenshots against current implemented behavior.
- Keep the README examples prominent and describe conversion limits, browser storage, cloud-provider data flow, and export formats accurately.
- Review GeoJSON and related GIS support as a distinct product workflow: identify actual accepted files and output, then document only what is implemented. Do not imply full map rendering if the result is a converted diagram.
- Update the verification report with fresh results and explicit unverified areas.

**Exit:** browser checks pass on desktop and phone for critical flows, production build succeeds, user-facing claims match behavior, and a fresh verification note is saved.

## Prioritized backlog after the first sprint

1. **P0 — Source editing, focus, and canvas navigation:** reproduce the reported inability to edit; verify editor events and focus handoff, framing for every diagram family, and smooth pointer/trackpad zoom.
2. **P1 — Transactional AI editing:** structured operations, preview, apply/reject, validation, undo/redo, and selection-aware context.
3. **P1 — Editor diagnostics and completion:** incremental deterministic diagnostics, syntax highlighting, symbol-aware completions, quick fixes, then optional provider-based suggestions.
4. **P1 — Mobile workspace:** decide which panels are editable on narrow screens, provide clear panel switching, and verify touch gestures and export dialogs.
5. **P2 — Performance and WebAssembly:** capture bundle and runtime profiles, lazy-load or workerize measured hotspots, document browser/runtime limits, and compare only equivalent native alternatives.
6. **P2 — Geospatial workflow:** define supported GeoJSON, TopoJSON, MVT, and shapefile inputs separately; preserve coordinate properties and clarify whether output is a map, topology diagram, or attribute view.
7. **P2 — Enterprise foundations:** before enterprise positioning, add a secure server-side provider option, documented retention and data-flow controls, and then assess collaboration, access control, audit, and policy requirements.
8. **P3 — Reach and polish:** role-based examples for PM, QA, developers, students, and general users; searchable format pages; focused landing pages for implemented use cases; source-linked documentation.

## Rules for keeping the loop healthy

- Take the next task from observed failures, not from the size of the feature list.
- Change one user-visible behavior per loop where possible; split unrelated work into separate loops.
- Use focused tests for the modified behavior, then the browser suite and build before declaring completion.
- Track coverage by critical module and behavior. Pursue complete coverage for deterministic core logic without adding tests that merely mirror implementation details.
- Do not claim cloud privacy, collaboration, offline installation, or enterprise controls unless the product provides and verifies them.
- Keep a compact log for every loop: issue, change, checks, result, remaining limit, next issue.

## Execution log — October 16, 2026

- **Loop 1 — Baseline completed.** Fresh baseline: 102 unit tests and 115 integration checks passed. The browser suite reproduced horizontal overflow at 390px: the studio toolbar exceeded the viewport. That issue was selected for the next loop.
- **Loop 2 — Mobile toolbar issue fixed.** The Stencils, Architecture Examples, and GitHub Sync actions now live in the Tools menu below the small-screen breakpoint. The browser suite covers the mobile routes and panels. The broader source-focus, canvas framing, zoom, and pointer-cancel backlog was not part of this fix and remains open.
- **Loop 3 — AI proposal review implemented, partial against the full goal.** Generated source is staged in an editable review dialog with a live preview, destination summary, syntax validation, Apply, and Discard. Browser coverage confirms a proposal can be generated and discarded without changing the project. The review-and-apply interaction was verified manually in the browser; an integrated automated apply assertion proved unstable and was removed. Structured create/update/delete/connect operations, active-selection context, cloud-data summary, and one-step undo are still open.
- **Loop 4 — Initial loading reduced.** The build had manually grouped Mermaid with shared dependencies, causing its 12.6 MB chunk (about 4.1 MB gzip) to be preloaded on the entry page. Mermaid and syntax validation now load dynamically, and Mermaid's forced manual chunk was removed. The rebuilt page preloads the 125 KB app entry and 406 KB React chunk (about 169 KB gzip combined with UI), while Mermaid's grammars and renderer load on demand. This is a bundle-level before/after measurement; no device-level startup or interaction profile was captured.
- **Loop 5 — Release checks completed, partial against the full goal.** Browser coverage verifies the key flows, all registered format samples, exports, persistence, routes, and 390px layouts. README/product metadata and the competitive research notes were refreshed. This sprint did not complete a full assistive-technology, contrast, or physical-device audit.

**Fresh verification:** `npm run test:unit` 102/102; `npm test` 115/115; `npm run test:browser` passed all 39 format previews plus exports, backup/import, persistence, keyboard, routes, and mobile checks; `npm run build` succeeded. See [VERIFICATION.md](VERIFICATION.md) for the current report.

The same browser suite against the production build passed all 39 format previews, exports, persistence, invalid-source retention, and backup restoration, then stalled on the “Find in file” editor command. The full development-server browser suite passes; production-only command behavior or test targeting still needs investigation.

**Next issue:** stabilize a focused automated Apply test for the AI review flow, then add transactional operations and undo. After that, resume the source focus/canvas reliability backlog and capture device-level startup data before further performance changes.

## Execution log — continuation

- **Studio blank canvas fixed.** The initial fit ran before the stage was laid out (zoom 0.07) and never retried; fit now waits for a real stage size.
- **Source editor rebuilt on every keystroke — fixed.** The CodeMirror view was recreated whenever `document` changed identity, which dropped focus, history and the search panel (the likely cause of the "cannot edit" report and the "Find in file" browser stall). The view is now created once per mount.
- **Find in file** switches from Canvas to Split (Source on narrow screens) instead of being disabled.
- **AI:** active-file source is sent as context for "Insert in active file"; model engines get one repair round with the parser error; inserted diagrams can be undone from the toast.
- **Verification:** `npm run test:unit` 105/105, `npm run test:browser` passed in full (including Find in file), `npm run build` succeeded.
- **Still open:** structured create/update/delete/connect operations, selection-aware context, cloud-data summary in the AI dialog, device-level performance data.

## Studio interaction pass — code ↔ canvas

Walked the Studio section by section in the browser:

| Section | Result |
| --- | --- |
| Code → canvas (typing, focus, live preview) | Works. |
| Canvas: double-click empty space adds a node | **Fixed** — referenced undefined `shape` (also in the context-menu "Add New Step"). |
| Canvas: change node shape | **Fixed** — called undefined `setShape`; source changed but an error toast showed. |
| Canvas: rename / shape / style / connect from selection | **Fixed** — node ids carry Mermaid's `mermaid-render-N-` prefix, so the `^flowchart-` parsers never matched; one shared `flowchartNodeId` helper now used by Studio and CanvasStage. |
| Canvas: delete node | **Fixed** — deleting a node dropped the whole edge line and the other endpoint's inline label. |
| Undo/redo after canvas edits | **Fixed** — menu items were disabled in Canvas view and ⌘Z did nothing; now routed to the editor history. |

Open: the floating node toolbar is clipped when the node is near the canvas edge; double-click rename inline editor is hidden behind the inspector dialog below 1280px (by design, needs a design decision).
Verification: unit 108/108, syntax checks 115/115, full browser suite passes, build succeeds.

## Manual Studio pass — shapes, code editing, AI fix

Driven with real clicks and typing in the browser (not synthetic events):

- **AI Quick Fix did nothing** for a stray token (`DB[(Database)] XY`) and gave no feedback. Added a verified line-level repair (`repairReportedLine`: strip stray text → drop last word → comment out line, first candidate the real parser accepts wins) and a visible message when no fix is possible. `runAiFix` no longer depends on stale closure state.
- **Fixer corrupted valid shapes**: the "quote special characters" rule rewrote cylinders `[(x)]` to `["(x)"]`. It now leaves `[(…)]`, `[/…/]`, `[\…\]` alone.
- **Autocomplete** offered diagram-type keywords (`xychart`) and whole-diagram templates mid-statement. Templates and type keywords now appear only on the first/an empty line; identifiers already in the file are offered as completions.
- **Clicking a shape** now reveals and selects its declaration in the source; the floating node toolbar wraps and stays inside the canvas instead of clipping.
- **Canvas fit** is kept in sync with panel resizes until the user pans or zooms.
- Dev-server note: when the HMR websocket fails in the in-app browser, the page can run stale modules; test on a fresh port.
