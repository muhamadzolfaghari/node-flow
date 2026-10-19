// Verifies that every template's diagram is framed on its real content: the
// rendered content must sit inside the visible stage AND be centred in the band
// the canvas leaves for it (below the top toolbar, above the bottom bar).
// This is the check that catches diagrams which render fully visible but tiny or
// pushed to a corner because the fit math used the wrong bounding box.
// Usage: node scripts/audit-canvas-framing.mjs   (starts its own dev server on :4183)
import puppeteer from "puppeteer";
import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { DIAGRAM_TEMPLATES } from "../src/components/templates.ts";
// Same definition of "content" the canvas fit uses, so the check cannot drift from
// the implementation it verifies.
import { CANVAS_CONTENT_SELECTOR } from "../src/lib/canvasContent.ts";

const base = "http://127.0.0.1:4183";
const server = spawn("npx", ["vite", "--host", "127.0.0.1", "--port", "4183", "--strictPort"], {
  stdio: "ignore",
  detached: true,
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 200; i++) {
  try {
    if ((await fetch(base)).ok) break;
  } catch {}
  await sleep(100);
}

// Mirror the insets the canvas itself reserves when it fits a diagram.
const TOP_INSET = 54;
const BOTTOM_INSET = 64;
const TOL = 0.06;

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(e.message));

const rows = [];
for (const t of DIAGRAM_TEMPLATES) {
  pageErrors.length = 0;
  await page.goto(`${base}/#/studio?template=${t.id}`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear()).catch(() => {});
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.goto(`${base}/#/studio?template=${t.id}`, { waitUntil: "domcontentloaded" });

  let result = { error: "never measured" };
  try {
    await page.waitForFunction(
      () => /Preview ready|Check source|Preview needs attention/.test(document.body.innerText),
      { timeout: 20000 },
    );
    await sleep(700);
    result = await page.evaluate((contentSelector) => {
      const stage = document.querySelector(".studio-stage-wrap");
      if (!stage) return { error: "no stage" };
      const st = stage.getBoundingClientRect();
      const svg = stage.querySelector(".mermaid-stage svg");
      if (!svg) return { error: "no svg" };
      const sr = svg.getBoundingClientRect();
      // Screen-space union of the visible content, clipped to the SVG's own box —
      // the SVG element renders exactly the viewBox area, so anything outside it is
      // not visible to the user.
      const rects = [...svg.querySelectorAll(contentSelector)]
        .map((e) => e.getBoundingClientRect())
        .filter((r) => r.width > 0.5 || r.height > 0.5);
      if (!rects.length) return { error: "no content elements" };
      const cx0 = Math.max(sr.left, Math.min(...rects.map((r) => r.left)));
      const cy0 = Math.max(sr.top, Math.min(...rects.map((r) => r.top)));
      const cx1 = Math.min(sr.right, Math.max(...rects.map((r) => r.right)));
      const cy1 = Math.min(sr.bottom, Math.max(...rects.map((r) => r.bottom)));
      return {
        stage: { x: st.x, y: st.y, w: st.width, h: st.height },
        svg: { x: sr.x, y: sr.y, w: sr.width, h: sr.height },
        content: { x: cx0, y: cy0, w: Math.max(0, cx1 - cx0), h: Math.max(0, cy1 - cy0) },
      };
    }, CANVAS_CONTENT_SELECTOR);
  } catch (err) {
    // Report the real cause: a thrown page.evaluate used to surface as a bare
    // "timeout", which hid a selector bug in this script.
    result = { error: `measure failed: ${err.message}` };
  }

  if (result.error) {
    rows.push({ id: t.id, category: t.category, status: "fail", reason: result.error, pageErrors: [...pageErrors] });
    process.stdout.write("F");
    continue;
  }

  const { stage, svg, content } = result;
  const availH = Math.max(50, stage.h - TOP_INSET - BOTTOM_INSET);
  const expectedCx = stage.x + stage.w / 2;
  const expectedCy = stage.y + TOP_INSET + availH / 2;
  const contentCx = content.x + content.w / 2;
  const contentCy = content.y + content.h / 2;
  const offsetX = Math.abs(contentCx - expectedCx) / stage.w;
  const offsetY = Math.abs(contentCy - expectedCy) / availH;
  const outside =
    content.x < stage.x - 8 ||
    content.y < stage.y - 8 ||
    content.x + content.w > stage.x + stage.w + 8 ||
    content.y + content.h > stage.y + stage.h + 8;

  const pass = !outside && offsetX <= TOL && offsetY <= TOL && content.w > 4 && content.h > 4;
  rows.push({
    id: t.id,
    category: t.category,
    status: pass ? "ok" : "fail",
    outside,
    offsetXPct: +(offsetX * 100).toFixed(1),
    offsetYPct: +(offsetY * 100).toFixed(1),
    fillWPct: +((content.w / stage.w) * 100).toFixed(1),
    fillHPct: +((content.h / availH) * 100).toFixed(1),
    // How much of the rendered SVG box the content occupies: an oversized viewBox
    // that we failed to tighten shows up here as a low number.
    svgUsePct: svg.w && svg.h ? +(((content.w * content.h) / (svg.w * svg.h)) * 100).toFixed(1) : 0,
    pageErrors: [...pageErrors],
  });
  process.stdout.write(pass ? "." : "F");
}

console.log();
await browser.close();
try {
  process.kill(-server.pid);
} catch {}

await writeFile("docs/framing-audit.json", JSON.stringify(rows, null, 2));
const bad = rows.filter((r) => r.status !== "ok");
console.log(`Templates: ${rows.length}, framing problems: ${bad.length} (tolerance ${TOL * 100}% of the stage)`);
for (const r of bad) {
  console.log(
    `- ${r.id} [${r.category}] ${r.reason || `offX=${r.offsetXPct}% offY=${r.offsetYPct}% fill=${r.fillWPct}x${r.fillHPct}% outside=${r.outside} svgUse=${r.svgUsePct}% ${r.pageErrors.join("; ").slice(0, 100)}`}`,
  );
}
process.exit(bad.length ? 1 : 0);
