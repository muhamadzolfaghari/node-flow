# Phase log

Each phase: manual/automated test → bug fix or improvement → retest. Evidence is the command output, not a build alone.

| Phase | Focus | Result |
|---|---|---|
| 1 | Sweep all 51 templates in the Studio (`audit:templates`) | Found `state-diagram` crash (`ArrowRight`) and 7 templates rendered tiny/off-centre. Fixed the missing import and the viewBox-origin fit bug. 51/51 pass. |
| 2 | Click every Studio menu item and toolbar button (`audit:studio`) | After a `no-undef` lint found 13 undefined identifiers, fixed export/snapshot/AI-fix/reopen-tab/minimap controls. 96 controls, 0 crashes. |
| 3 | Dependency loop | Declared `@codemirror/lint`; removed unused `prettier`, `wabt`; applied semver updates; `puppeteer` pinned to 25.12.0 (25.14 needs a Chrome build that is not installed and hung the install). 0 vulnerabilities. Majors (mermaid 12, vite 8, plugin-react 6) deferred. |
| 4 | Shapes in the visual editor (`audit:canvas`) | Only 8 delimiters were recognised, via 7 copy-pasted regexes; Shape menu showed 7. Replaced with one declaration scanner covering all 14 Mermaid flowchart shapes; rename/shape edits now declare bare nodes. +3 unit tests. 14/14 shapes verified by real clicks (source + render). |
| 5 | Click-a-shape UX | Toolbar was a two-row pill covering neighbours: now one compact icon row above the node (flips below at the top edge). Bottom toolbar grouped with dividers and pressed states; wheel-mode icon no longer duplicates Select. Clicking a shape reveals its source. |
| 6 | Undo from canvas | CodeEditor was unmounted in Canvas view, so canvas edits had no undo/find/AI-fix target. Editor now stays mounted (hidden). Undo verified. |
| 7 | Multi-theme | Five palettes + “match system”, CSS-variable driven incl. editor and syntax colours, applied before first paint, persisted, diagram theme follows. |
| 8 | Landing redesign | Product-forward hero with live Studio window, 3×2 features, how-it-works, roles, visible FAQ (accurate privacy wording). |
| 9 | SEO / GEO | Hash-route sitemap replaced by 55 real URLs: static page per template, hub pages, formats and studio pages with JSON-LD (BreadcrumbList, ItemList, SoftwareSourceCode, FAQPage), PNG social image + large Twitter card, accurate `llms.txt` listing every template. |
