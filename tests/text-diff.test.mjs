import test from "node:test";
import assert from "node:assert/strict";
import { minimalTextChange } from "../src/utils/textDiff.ts";

const apply = (text, c) => (c ? text.slice(0, c.from) + c.insert + text.slice(c.to) : text);

test("minimalTextChange returns null for equal strings", () => {
  assert.equal(minimalTextChange("abc", "abc"), null);
});

test("minimalTextChange round-trips for inserts, deletes and replacements", () => {
  const cases = [
    ["a --> b", "a --> b\n  b --> c"],
    ["a --> b\n  b --> c\n  c --> d", "a --> b\n  c --> d"],
    ["flowchart LR\n  A[x]", "flowchart TD\n  A[y]"],
    ["", "hello"],
    ["hello", ""],
    ["aaaa", "aa"],
    ["aa", "aaaa"],
    ["abcabc", "abcXabc"],
  ];
  for (const [a, b] of cases) {
    const c = minimalTextChange(a, b);
    assert.equal(apply(a, c), b, JSON.stringify([a, b, c]));
    assert.ok(c.from <= c.to && c.to <= a.length);
  }
});

test("minimalTextChange keeps the cursor target inside the new document", () => {
  const a = "x[Unclose\n";
  const b = "x[Unclose]\n";
  const c = minimalTextChange(a, b);
  assert.ok(c.from + c.insert.length <= b.length);
});
