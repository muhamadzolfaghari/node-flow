// Clicks every Studio menu item / toolbar button and reports page errors and
// error-looking toasts. Usage: node scripts/audit-studio-tools.mjs
import puppeteer from "puppeteer";
import { spawn } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const base = "http://127.0.0.1:4179";
const server = spawn("npx", ["vite", "--host", "127.0.0.1", "--port", "4179", "--strictPort"], {
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
const downloads = await mkdtemp(path.join(tmpdir(), "studio-audit-"));
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const cdp = await page.createCDPSession();
await cdp.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: downloads });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

const SKIP = /delete|clear|remove|reset workspace|close all|sign|github|clone|sync|new project|empty/i;
const toast = () =>
  page.evaluate(() => [...document.querySelectorAll("[role=status]")].map((x) => x.textContent.trim()).join(" | "));
const report = [];
async function fresh(template = "service-architecture") {
  await page.goto(`${base}/#/studio?template=${template}`, { waitUntil: "domcontentloaded" });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => /Preview ready/.test(document.body.innerText), { timeout: 20000 }).catch(() => {});
  await sleep(700);
}
async function closeOverlays() {
  for (let i = 0; i < 3; i++) await page.keyboard.press("Escape");
  await sleep(150);
}
const openMenu = (m) =>
  page.evaluate((name) => {
    const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === name);
    b?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0 }));
  }, m);

await fresh();
for (const menu of ["File", "Edit", "View", "Tools"]) {
  await closeOverlays();
  await openMenu(menu);
  await sleep(250);
  const count = await page.$$eval("[role=menuitem]", (els) => els.length);
  await closeOverlays();
  for (let i = 0; i < count; i++) {
    await fresh();
    errors.length = 0;
    await openMenu(menu);
    await sleep(250);
    const label = await page.evaluate((idx) => {
      const el = document.querySelectorAll("[role=menuitem]")[idx];
      if (!el) return null;
      return { text: el.textContent.trim(), disabled: el.getAttribute("data-disabled") !== null };
    }, i);
    if (!label) continue;
    const name = `${menu} › ${label.text.replace(/\s+/g, " ").slice(0, 48)}`;
    if (label.disabled) {
      report.push({ name, result: "disabled" });
      continue;
    }
    if (SKIP.test(label.text)) {
      report.push({ name, result: "skipped" });
      continue;
    }
    await page.evaluate((idx) => document.querySelectorAll("[role=menuitem]")[idx]?.click(), i);
    await sleep(1500);
    report.push({ name, result: errors.length ? "CRASH" : "ok", errors: [...errors], toast: await toast() });
  }
}

await fresh();
const tools = await page.$$eval("button[title], button[aria-label]", (els) =>
  els.map((e) => e.getAttribute("title") || e.getAttribute("aria-label")).filter(Boolean),
);
for (const t of [...new Set(tools)]) {
  if (SKIP.test(t)) continue;
  await fresh();
  errors.length = 0;
  const clicked = await page.evaluate((title) => {
    const b = [...document.querySelectorAll("button")].find(
      (x) => (x.getAttribute("title") || x.getAttribute("aria-label")) === title && !x.disabled,
    );
    if (!b) return false;
    b.click();
    return true;
  }, t);
  if (!clicked) continue;
  await sleep(900);
  report.push({ name: `Button › ${t.slice(0, 48)}`, result: errors.length ? "CRASH" : "ok", errors: [...errors], toast: await toast() });
  await closeOverlays();
}

await browser.close();
try {
  process.kill(-server.pid);
} catch {}
const crashes = report.filter((r) => r.result === "CRASH");
const errToasts = report.filter((r) => r.toast && /error|fail|not defined|cannot|unable|invalid/i.test(r.toast));
console.log(`Checked ${report.length} controls: ${report.filter((r) => r.result === "ok").length} ok, ${crashes.length} crashed, ${errToasts.length} error toasts`);
for (const r of crashes) console.log(`CRASH ${r.name}: ${r.errors.join("; ").slice(0, 160)}`);
for (const r of errToasts) console.log(`TOAST ${r.name}: ${r.toast.slice(0, 160)}`);
process.exit(crashes.length || errToasts.length ? 1 : 0);
