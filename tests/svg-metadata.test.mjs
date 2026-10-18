import test from "node:test";
import assert from "node:assert/strict";
import {
  embedSourceInSvg,
  extractSourceFromSvg,
} from "../src/utils/importers/svgmetadata.ts";
import { importDocument } from "../src/lib/formats.ts";

test("embedSourceInSvg injects metadata and comment into SVG", () => {
  const initialSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 300"><g><rect width="100" height="50"/></g></svg>`;
  const mermaidSource = `flowchart TD\n  A["Client"] --> B["Server"]\n  B --> C[("Database")]`;

  const embedded = embedSourceInSvg(initialSvg, mermaidSource, "mermaid");
  assert.match(embedded, /<metadata id="nodeflow-metadata"/);
  assert.match(embedded, /data-source-format="mermaid"/);
  assert.match(embedded, /nodeflow-source format="mermaid"/);
  assert.match(embedded, /<!\[CDATA\[flowchart TD/);

  const extracted = extractSourceFromSvg(embedded);
  assert.ok(extracted, "Should extract source from embedded SVG");
  assert.equal(extracted.format, "mermaid");
  assert.equal(extracted.source, mermaidSource);
});

test("extractSourceFromSvg handles encoded XML comments and legacy formats", () => {
  const source = "graph LR\n  X --> Y";
  const commentSvg = `<svg xmlns="http://www.w3.org/2000/svg"><!-- [nodeflow-source format="mermaid"]\n${encodeURIComponent(source)}\n--><rect/></svg>`;
  const extracted = extractSourceFromSvg(commentSvg);
  assert.ok(extracted);
  assert.equal(extracted.format, "mermaid");
  assert.equal(extracted.source, source);

  const legacySvg = `<svg xmlns="http://www.w3.org/2000/svg"><!-- mermaid-source:\n${encodeURIComponent(source)}\n--><circle/></svg>`;
  const legacyExtracted = extractSourceFromSvg(legacySvg);
  assert.ok(legacyExtracted);
  assert.equal(legacyExtracted.format, "mermaid");
  assert.equal(legacyExtracted.source, source);
});

test("importDocument roundtrips exported SVG back to editable diagram file", async () => {
  const rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle r="50"/></svg>`;
  const source = `flowchart LR\n  Start([Start]) --> Stop([Stop])`;
  const svgWithSource = embedSourceInSvg(rawSvg, source, "mermaid");

  const file = new File([svgWithSource], "architecture.svg", { type: "image/svg+xml" });
  const doc = await importDocument(file);

  assert.equal(doc.name, "architecture.mmd");
  assert.equal(doc.format, "mermaid");
  assert.equal(doc.source, source);
});

test("importDocument throws clear error on plain SVG without embedded metadata", async () => {
  const plainSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="50" height="50"/></svg>`;
  const file = new File([plainSvg], "drawing.svg", { type: "image/svg+xml" });

  await assert.rejects(
    async () => await importDocument(file),
    /does not contain embedded NodeFlow or Mermaid source metadata/,
  );
});
