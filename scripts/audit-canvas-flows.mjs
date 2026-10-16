// Real-click audit of canvas editing: every shape, colour, add step, connect,
// duplicate, delete and undo — verifying both the source text and rendered SVG.
// Usage: node scripts/audit-canvas-flows.mjs
import puppeteer from "puppeteer";
import { spawn } from "node:child_process";
import { SHAPES } from "../src/lib/visual-editing.js";

const port = 4182;
const base = `http://127.0.0.1:${port}`;
const server = spawn("npx", ["vite", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
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
const browser = await puppeteer.launch({ headless: true });
let context;
let page;
const pageErrors = [];
async function newPage() {
  if (context) await context.close().catch(() => {});
  context = await browser.createBrowserContext();
  page = await context.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  page.on("pageerror", (e) => pageErrors.push(e.message));
}

const results = [];
const check = (name, pass, detail = "") => {
  results.push({ name, pass, detail });
  process.stdout.write(pass ? "." : "F");
};
// Read the saved workspace (the editor renders no lines while hidden in Canvas view).
const source = () =>
  page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      try {
        const ws = JSON.parse(localStorage.getItem(key));
        const project = ws?.projects?.find((p) => p.id === ws.activeProjectId);
        const doc = project?.documents?.find((d) => d.id === project.activeId) || project?.documents?.[0];
        if (doc?.source) return doc.source;
      } catch {}
    }
    return "";
  });
const settle = async () => {
  await sleep(900);
  await page.waitForFunction(() => /Preview ready|Check source/.test(document.body.innerText), { timeout: 15000 }).catch(() => {});
  await sleep(300);
};
const counts = () =>
  page.evaluate(() => ({
    nodes: document.querySelectorAll(".mermaid-stage svg g.node").length,
    edges: document.querySelectorAll(".mermaid-stage svg .edgePaths path, .mermaid-stage svg path.flowchart-link").length,
    ready: /Preview ready/.test(document.body.innerText),
  }));
const clickTitle = (title) =>
  page.evaluate((t) => {
    const b = [...document.querySelectorAll("button")].find((x) => (x.getAttribute("title") || "").startsWith(t));
    b?.click();
    return !!b;
  }, title);
const clickText = (text) =>
  page.evaluate((t) => {
    const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim().startsWith(t));
    b?.click();
    return !!b;
  }, text);
async function selectNode(label) {
  const box = await page.evaluate((l) => {
    const n = [...document.querySelectorAll(".mermaid-stage svg g.node")].find((x) => x.textContent.includes(l));
    if (!n) return null;
    const r = n.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }, label);
  if (!box) return false;
  await page.mouse.click(box.x, box.y);
  await sleep(500);
  return true;
}
async function fresh() {
  await newPage();
  await page.goto(`${base}/#/studio`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => /Preview ready/.test(document.body.innerText), { timeout: 60000 });
  await clickText("Canvas");
  await sleep(1000);
}

await fresh();
const initial = await counts();
check("initial render has nodes and edges", initial.nodes >= 4 && initial.edges >= 3, JSON.stringify(initial));

// --- every shape
for (const [key, shape] of Object.entries(SHAPES)) {
  await fresh();
  await selectNode("Order service");
  const opened = await clickTitle("Change node shape");
  const picked = await page.evaluate((label) => {
    const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim().startsWith(label));
    b?.click();
    return !!b;
  }, shape.label);
  await settle();
  const src = await source();
  const c = await counts();
  const declared = src.includes(`Service${shape.open}`) && src.includes(shape.close);
  check(`shape ${key}`, opened && picked && declared && c.ready && c.nodes >= 4, `${opened}/${picked}/${declared}/${c.ready} ${src.split("\n").find((l) => l.includes("Service[") || l.includes("Service" + shape.open)) || ""}`);
}

// --- colour
await fresh();
await selectNode("Order service");
await clickTitle("Change node style");
await page.evaluate(() => document.querySelector('button[title="Emerald"]')?.click());
await settle();
check("colour adds a style line", /style Service fill:/.test(await source()));

// --- add connected step
await fresh();
const before = await counts();
await selectNode("Order service");
await clickTitle("Add connected child step");
await settle();
let after = await counts();
check("add step adds a node and an edge", after.nodes === before.nodes + 1 && after.edges === before.edges + 1, `${JSON.stringify(before)} -> ${JSON.stringify(after)}`);

// --- connect two shapes
await fresh();
const b2 = await counts();
await selectNode("Web client");
await clickTitle("Connect to another node");
await sleep(300);
const connected = await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => (x.getAttribute("title") || "").startsWith("Connect to Database"));
  b?.click();
  return !!b;
});
await settle();
const a2 = await counts();
const s2 = await source();
check("connect adds an edge line to the source", connected && /Client\s+-->\s+DB/.test(s2), s2.split("\n").slice(-2).join(" | "));
check("connect draws one more edge in the preview", a2.edges === b2.edges + 1, `${b2.edges} -> ${a2.edges}`);

// --- duplicate / delete / undo
await fresh();
const b3 = await counts();
await selectNode("API gateway");
await clickTitle("Duplicate node");
await settle();
const a3 = await counts();
check("duplicate adds a node", a3.nodes === b3.nodes + 1, `${b3.nodes} -> ${a3.nodes}`);
await selectNode("Database");
await clickTitle("Delete node");
await settle();
const a4 = await counts();
check("delete removes a node", a4.nodes === a3.nodes - 1, `${a3.nodes} -> ${a4.nodes}`);
await page.keyboard.down("Meta");
await page.keyboard.press("z");
await page.keyboard.up("Meta");
await settle();
const a5 = await counts();
check("undo restores the deleted node", a5.nodes === a3.nodes, `${a3.nodes} vs ${a5.nodes}`);

// --- syntax error → fix → canvas recovers
await fresh();
await clickText("Source");
await sleep(500);
await page.click(".cm-content");
await page.keyboard.down("Meta");
await page.keyboard.press("End");
await page.keyboard.up("Meta");
await page.keyboard.type(" XY");
await sleep(1500);
const errored = await page.evaluate(() => /ERROR|Line \d+:/i.test(document.body.innerText));
check("a syntax error is reported", errored);
await clickText("AI Quick Fix");
await sleep(2500);
const fixedSrc = await source();
check("AI Quick Fix repairs the source", !fixedSrc.includes(" XY"), fixedSrc.split("\n").slice(-2).join("|"));

await browser.close();
try {
  process.kill(-server.pid);
} catch {}
console.log();
const failed = results.filter((r) => !r.pass);
console.log(`Canvas flow checks: ${results.length - failed.length}/${results.length} passed, page errors: ${pageErrors.length}`);
for (const r of failed) console.log(`FAIL ${r.name} — ${r.detail}`);
for (const e of pageErrors.slice(0, 5)) console.log(`PAGEERR ${e}`);
process.exit(failed.length || pageErrors.length ? 1 : 0);
