# Changelog

All notable changes to NodeFlow. This project uses [semantic versioning](https://semver.org/):
`MAJOR` for a breaking change to saved projects or the public interface, `MINOR` for a
backwards-compatible capability, `PATCH` for a fix or internal change with no behaviour
change. One version per merged change; the version in `package.json` matches the newest
entry here.

This file is the source of truth. There is no in-app changelog page or version display
yet — building both, driven by this same data, is phase 30 in `docs/PLAN.md`. Until then,
nothing in the product claims a version number.

## [1.1.0] - 2026-10-17

### Fixed

- **Canvas framing now follows the actual diagram.** Charts were framed on the wrong box,
  which is why some rendered tiny, off-centre or partly off-stage. Three causes were
  measured and fixed: padded bounds were clamped to the canvas origin, so diagrams with a
  negative or non-zero viewBox origin sat off-centre; Mermaid's translated groups were
  mis-measured by the per-child `getBBox`/CTM scan (the user-journey template used 6% of
  the available height, the timing template rendered partly off-stage, C4 measured
  negative coordinates); and decorative axis/band shapes were counted as content, pulling
  the centre ~40px off on the roadmap template. The fit now measures what is drawn on
  screen, converts back to user units, keeps one corrective translation pass for late font
  and label settling, and shares one content definition with its audit.
  Verified: `npm run audit:framing` — 51/51 templates within 6% of centre, none clipped
  (4 failures before).
- **Zoom and pan no longer re-render the whole canvas per event.** Every wheel and
  pointermove event queued a React render of the 2.4k-line canvas component. The transform
  and grid background are written to the DOM directly, the state sync is coalesced to one
  update per animation frame, and content bounds are cached per diagram so a gesture
  performs no layout measurement.
  Verified: `npm run audit:canvas` — 24/24 flows, 0 page errors.

### Added

- **`npm run audit:framing`** — measures every template's drawn content against the canvas
  viewport and fails when a diagram is off-centre, clipped, or framed on empty space.
- **`npm run audit:quality`** — checks the tree against the limits in the owner's quality
  rubric: file and function length, control-flow nesting and parameter count as hard
  limits, plus duplication, commented-out code and unnamed numeric literals as advisory
  findings.
- **`src/lib/canvas-content.js`** — one definition of what counts as canvas content, used
  by both the fit and the framing audit so the implementation and its check cannot drift.
- **`docs/PLAN.md`** — the deduplicated owner needs and a 30-phase execution plan, each
  phase with the evidence it must produce.

### Changed

- The canvas frame math was split into focused helpers (`measureContentBounds`,
  `scanChildBounds`, `selectFrameTarget`, `readViewBoxBounds`, `nudgeToDrawnContent`), which
  took the three quality findings this change had introduced back out (117 → 114 hard-limit
  failures) and left `fit()` under the 50-line limit.
- The owner's quality rubric is stored in the gitignored `.agents/rules/` folder and is
  therefore local to this workspace by request; `npm run audit:quality` reads the same
  limits from `scripts/audit-code-quality.mjs`.
- `docs/template-audit.json` and `docs/framing-audit.json` are now ignored: they are
  regenerated on every audit run.

### Known limits

- `npm run audit:quality` reports 114 hard-limit failures across the existing codebase (18
  files over 400 lines, 79 functions over 50 lines). That backlog predates this change and
  is phase 28's worklist, starting with `Studio.jsx` at 8,060 lines.
- `npm run test:browser` was not run for this entry; the four Puppeteer audits were used
  instead.
- Non-flowchart families are still edited through helpers rather than by direct canvas
  manipulation (phase 7–10), and the editor focus, hint and autocomplete reports from the
  same request are phases 1–4: reproduced and fixed there, not addressed here.
