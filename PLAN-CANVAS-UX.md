# Canvas UX Improvement Plan

## Goal
Make the canvas genuinely interactive and capturable:
1. **Real screenshot**: render the live SVG diagram to a high-DPI PNG data URL and download it (not just an SVG data URI).
2. **Interactive connections**: click any node (no pre-selection required) to start a drag-to-connect gesture; drag an existing edge's end to repoint it to another node; click empty canvas to cancel.

## Current state (gaps)
- `captureScreenshot` returns an SVG `data:image/svg+xml` URI only — not a bitmap/PNG, no download hook in the app.
- `startConnectDrag` requires `selected?.id`, so a user cannot click a node and drag to connect unless they first select it via a separate click.
- No way to repoint an existing edge's target interactively.

## Changes

### 1. `src/utils/screenshot.ts`
- Add `capturePng(container, scale = 2)` that draws the SVG onto an `OffscreenCanvas` at `scale`x and returns a `data:image/png` data URL.
- Keep `captureScreenshot`/`captureThumbnail` as SVG fallbacks; add `downloadPng(filename)`.

### 2. `src/components/ContentMenu.tsx`
- Replace SVG thumbnail copy with real PNG screenshot capture + browser download (`<a download>`).

### 3. `src/components/CanvasStage.tsx`
- `startConnectDrag(e, portSide)`: drop the `selected?.id` requirement. Use `e.target.closest("g.node, ...")` as the `fromId` when no node is pre-selected.
- Add edge repointing: on pointer down over an existing edge path, enter "repoint" mode; on pointer up over another node, replace that edge's target via `connectFlowchartNodes`.
- Pointer-up over empty canvas cancels the gesture cleanly (deselects connect target highlight).

## Verification: 10 scenarios in a loop
See `scripts/verify-canvas-ux.mjs`. It imports the real modules, builds a minimal jsdom + mermaid SVG, and asserts each scenario. Loop repeats until all 10 pass or a max iteration cap is hit.

## Convention
Commits follow `.github/COMMIT_GUIDE.md` (`<type>[scope]: <description>`).
