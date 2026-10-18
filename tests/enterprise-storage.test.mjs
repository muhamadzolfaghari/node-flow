import test from "node:test";
import assert from "node:assert/strict";
import {
  SHOWCASE_CATALOG,
  CLOUD_STENCILS,
  enterpriseStorage,
} from "../src/lib/indexedDBStorage.ts";

test("Enterprise Showcases catalog contains valid enterprise architectures", () => {
  assert.ok(Array.isArray(SHOWCASE_CATALOG));
  assert.ok(SHOWCASE_CATALOG.length >= 5);

  for (const sc of SHOWCASE_CATALOG) {
    assert.ok(sc.id, `Showcase missing id: ${sc.title}`);
    assert.ok(sc.title, `Showcase missing title: ${sc.id}`);
    assert.ok(sc.category, `Showcase missing category: ${sc.title}`);
    assert.ok(sc.description, `Showcase missing description: ${sc.title}`);
    assert.ok(sc.source && sc.source.length > 50, `Showcase code too short: ${sc.title}`);
    assert.ok(sc.tags && sc.tags.length > 0, `Showcase missing tags: ${sc.title}`);
  }
});

test("Cloud Stencils catalog contains major cloud providers & services", () => {
  assert.ok(Array.isArray(CLOUD_STENCILS));
  assert.ok(CLOUD_STENCILS.length >= 20);

  const categories = new Set(CLOUD_STENCILS.map((s) => s.category));
  assert.ok(categories.has("AWS"), "Missing AWS category");
  assert.ok(categories.has("GCP"), "Missing GCP category");
  assert.ok(categories.has("Azure"), "Missing Azure category");
  assert.ok(categories.has("Kubernetes"), "Missing Kubernetes category");
  assert.ok(categories.has("Databases"), "Missing Databases category");
  assert.ok(categories.has("Security"), "Missing Security category");

  for (const stencil of CLOUD_STENCILS) {
    assert.ok(stencil.id, `Stencil missing id: ${stencil.label}`);
    assert.ok(stencil.label, `Stencil missing label: ${stencil.id}`);
    assert.ok(stencil.codeSnippet && stencil.codeSnippet.length > 5, `Stencil codeSnippet empty: ${stencil.label}`);
  }
});

test("enterpriseStorage provides graceful fallback in non-browser Node environments", async () => {
  assert.ok(typeof enterpriseStorage.getDb === "function");
  assert.ok(typeof enterpriseStorage.getShowcases === "function");
  assert.ok(typeof enterpriseStorage.saveProjectBackup === "function");
  assert.ok(typeof enterpriseStorage.getProjectBackups === "function");

  // In Node environment without global.indexedDB, getShowcases falls back directly to the seed catalog
  const showcases = await enterpriseStorage.getShowcases();
  assert.ok(Array.isArray(showcases));
  assert.equal(showcases.length, SHOWCASE_CATALOG.length);

  // Fallback saveProjectBackup does not crash
  const saved = await enterpriseStorage.saveProjectBackup({ id: "test-proj", name: "Enterprise Diagram" });
  assert.equal(saved, undefined);

  const backups = await enterpriseStorage.getProjectBackups();
  assert.deepEqual(backups, []);
});
