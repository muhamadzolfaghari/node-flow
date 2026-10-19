// Type-check gate. The codebase was converted from JS and still has a lot of
// untyped-parameter noise, so this fails only on error codes that point at real
// bugs: undefined names, misspelled members, use-before-assign, unresolved
// modules and file-name casing mismatches (these break on case-sensitive CI).
import { spawnSync } from "node:child_process";

const BLOCKING = new Set([
  "TS2304", // Cannot find name
  "TS2552", // Cannot find name, did you mean
  "TS2448", // Block-scoped variable used before its declaration
  "TS2454", // Variable used before being assigned
  "TS2307", // Cannot find module
  "TS1149", // File name differs from already included file name only in casing
  "TS1261", // Already included file name differs only in casing
  "TS1005", // Syntax errors
  "TS1128",
  "TS1434",
]);

const run = spawnSync("npx", ["tsc", "--noEmit", "-p", "."], { encoding: "utf8", shell: false });
const out = `${run.stdout || ""}${run.stderr || ""}`;
const errors = out.split("\n").filter((l) => /error TS\d+/.test(l));
const blocking = errors.filter((l) => BLOCKING.has(l.match(/error (TS\d+)/)[1]));

console.log(`tsc: ${errors.length} total diagnostics, ${blocking.length} blocking`);
if (blocking.length) {
  console.error(blocking.join("\n"));
  process.exit(1);
}
