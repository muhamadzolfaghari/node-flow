// Opens every template in the Studio and reports render status and canvas framing.
// Usage: node scripts/audit-templates.mjs   (starts its own dev server on :4177)
import puppeteer from "puppeteer";
import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { DIAGRAM_TEMPLATES } from "../src/components/templates.js";

const base = "http://127.0.0.1:4177";
const server = spawn("npx", ["vite", "--host", "127.0.0.1", "--port", "4177", "--strictPort"], {
  stdio: "ignore",
  detached: true,
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 150; i++) {
  try {
    if ((await fetch(base)).ok) break;
  } catch {}
  await sleep(100);
}

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(e.message));

const rows = [];
for (const t of DIAGRAM_TEMPLATES) {
  pageErrors.length = 0;
  const started = Date.now();
  await page.goto(`${base}/#/studio?template=${t.id}`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear()).catch(() => {});
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.goto(`${base}/#/studio?template=${t.id}`, { waitUntil: "domcontentloaded" });
  let result = { status: "timeout" };
  try {
    await page.waitForFunction(
      () => /Preview ready|Check source|Preview needs attention/.test(document.body.innerText),
      { timeout: 20000 },
    );
    await sleep(600);
    // The canvas tab may not be the default view; the preview stage exists in all views.
    result = await page.evaluate(() => {
      const svg = document.querySelector(".mermaid-stage svg");
      const stage = svg?.closest("[class*='overflow-hidden']") || document.body;
      const s = svg?.getBoundingClientRect();
      const st = stage.getBoundingClientRect();
      const bodyText = document.body.innerText;
      const ok = /Preview ready/.test(bodyText);
      const visible = s
        ? Math.max(0, Math.min(s.right, st.right) - Math.max(s.left, st.left)) *
            Math.max(0, Math.min(s.bottom, st.bottom) - Math.max(s.top, st.top))
        : 0;
      const area = s ? s.width * s.height : 0;
      return {
        status: ok ? "ok" : "error",
        message: (bodyText.match(/Invalid[^\n]*|Parse error[^\n]*|Check source/) || [""])[0],
        nodes: document.querySelectorAll(".mermaid-stage svg g.node, .mermaid-stage svg .node, .mermaid-stage svg g.cluster").length,
        svgW: Math.round(s?.width || 0),
        svgH: Math.round(s?.height || 0),
        visibleRatio: area ? +(visible / area).toFixed(2) : 0,
        zoomPct: (bodyText.match(/(\d+)%/) || [])[1] || "",
      };
    });
  } catch {}
  rows.push({ id: t.id, category: t.category, ms: Date.now() - started, pageErrors: [...pageErrors], ...result });
  process.stdout.write(`${result.status === "ok" ? "." : "F"}`);
}
console.log();
await browser.close();
try {
  process.kill(-server.pid);
} catch {}

const bad = rows.filter((r) => r.status !== "ok" || r.visibleRatio < 0.85 || r.pageErrors.length || r.svgW < 40);
await writeFile("docs/template-audit.json", JSON.stringify(rows, null, 2));
console.log(`Templates: ${rows.length}, problems: ${bad.length}`);
for (const r of bad) console.log(`- ${r.id} [${r.category}] status=${r.status} visible=${r.visibleRatio} svg=${r.svgW}x${r.svgH} ${r.message} ${r.pageErrors.join("; ").slice(0, 120)}`);
process.exit(bad.length ? 1 : 0);
