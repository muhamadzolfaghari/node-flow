// Checks the source tree against the limits in .agents/rules/code-quality-metrics.md.
// Hard limits (exit 1): file length, function length, parameter count, nesting depth.
// Advisory (reported only): duplication, commented-out code, unnamed numeric literals.
// Usage: node scripts/audit-code-quality.mjs [--all]
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const LIMITS = {
  fileLines: 400,
  functionLines: 50,
  nesting: 4,
  parameters: 5,
  duplicateBlockLines: 6,
  magicLiteralAllowList: new Set(["0", "1", "2", "-1", "0.5", "100"]),
};

const ROOT = new URL("..", import.meta.url).pathname;
const includeAll = process.argv.includes("--all");
const SCAN_DIRS = includeAll ? ["src", "scripts", "tests"] : ["src"];
const SKIP_DIRS = new Set(["node_modules", "dist", ".git"]);

async function collectFiles(dir, out = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) await collectFiles(full, out);
    } else if (/\.(js|jsx|mjs)$/.test(entry.name) && !entry.name.startsWith("_")) {
      out.push(full);
    }
  }
  return out;
}

// Strips comments and string/template contents so brace counting and literal scans
// do not trip over punctuation inside them.
function stripForScanning(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + " ".repeat(m.length - p1.length))
    .replace(/`(?:\\.|[^`\\])*`/g, (m) => "`" + " ".repeat(Math.max(0, m.length - 2)) + "`")
    .replace(/"(?:\\.|[^"\\\n])*"/g, (m) => '"' + " ".repeat(Math.max(0, m.length - 2)) + '"')
    .replace(/'(?:\\.|[^'\\\n])*'/g, (m) => "'" + " ".repeat(Math.max(0, m.length - 2)) + "'");
}

const FUNCTION_HEAD = /(?:^|\s)(?:export\s+)?(?:async\s+)?function\s+(\w+)?\s*\(|=>\s*\{\s*$|\)\s*=>\s*$/;
// Control-flow keywords only. Counted separately from raw brace depth because JSX
// and object literals legitimately nest deeply and are not what the rule targets.
const CONTROL_START = /(?:^|[\s{};)])(if|for|while|switch|catch)\s*\(|(?:^|[\s{};])(else|try|do|finally)\s*\{/g;

const braceEnd = (text, openIndex) => {
  let depth = 0;
  for (let i = openIndex; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}" && --depth === 0) return i;
  }
  return -1;
};

// Spans of control-flow blocks, used to measure real nesting depth.
function controlSpans(sliceText) {
  const spans = [];
  for (const match of sliceText.matchAll(CONTROL_START)) {
    const searchFrom = match.index + match[0].length;
    const braceIndex = sliceText.indexOf("{", searchFrom - 1);
    if (braceIndex === -1 || braceIndex > searchFrom + 400) continue;
    const end = braceEnd(sliceText, braceIndex);
    if (end !== -1) spans.push({ start: match.index, end });
  }
  return spans;
}

const maxControlNesting = (spans) =>
  spans.reduce(
    (max, span) => Math.max(max, 1 + spans.filter((other) => other.start < span.start && other.end > span.end).length),
    0,
  );

// Finds every declared function and measures it. Callers filter by limit so that
// parameters and nesting are checked for all functions, not only long ones.
function findFunctions(scanned) {
  const openers = [...scanned.matchAll(/\([^()]*\)\s*(?:=>)?\s*\{/g)];
  const found = [];
  for (const match of openers) {
    const braceIndex = match.index + match[0].length - 1;
    const lineText = scanned.slice(scanned.lastIndexOf("\n", braceIndex) + 1, braceIndex);
    if (!FUNCTION_HEAD.test(`${lineText}{`)) continue;
    const end = braceEnd(scanned, braceIndex);
    if (end === -1) continue;
    const startLine = scanned.slice(0, braceIndex).split("\n").length;
    const endLine = scanned.slice(0, end).split("\n").length;
    const params = match[0].replace(/\)\s*(?:=>)?\s*\{$/, "").replace(/^\(/, "");
    found.push({
      line: startLine,
      lines: endLine - startLine + 1,
      params: countTopLevel(params),
      nesting: maxControlNesting(controlSpans(scanned.slice(braceIndex, end))),
    });
  }
  return found;
}

function countTopLevel(text) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  let depth = 0;
  let count = 1;
  for (const char of trimmed) {
    if ("([{<".includes(char)) depth++;
    else if (")]}>".includes(char)) depth--;
    else if (char === "," && depth === 0) count++;
  }
  return count;
}

// Deliberately strict: prose in a comment must not be reported as dead code. A line
// counts only when it opens with a statement keyword or clearly looks like a statement.
function findCommentedOutCode(lines) {
  const statementStart = /^(const|let|var|function|class|return|if|for|while|switch|import|export|await|throw|console\.)\b/;
  const callLike = /^[\w.$]+\s*\([^)]*\)\s*;?$/;
  const jsxLike = /^<\/?[A-Za-z][\w.]*(\s|>|\/>|$)/;
  const findings = [];
  lines.forEach((raw, index) => {
    const trimmed = raw.trim();
    if (!trimmed.startsWith("//")) return;
    const body = trimmed.replace(/^\/\/\s?/, "");
    if (statementStart.test(body) || callLike.test(body) || jsxLike.test(body)) {
      findings.push(index + 1);
    }
  });
  return findings;
}

function findMagicLiterals(scanned) {
  const hits = [];
  const lines = scanned.split("\n");
  lines.forEach((text, index) => {
    const declaration = /\b(const|let|var)\s+\w+\s*=|\b[A-Z_]{3,}\s*=/.test(text);
    if (declaration) return;
    for (const match of text.matchAll(/(?<![\w.$])(\d+(?:\.\d+)?)(?![\w.])/g)) {
      if (!LIMITS.magicLiteralAllowList.has(match[1])) {
        hits.push({ line: index + 1, value: match[1] });
        break;
      }
    }
  });
  return hits;
}

// Repeated windows of normalized lines: the review prompt for the duplication rule.
function findDuplication(lines, fileKey) {
  const normalized = lines.map((l) => l.trim().replace(/\s+/g, " "));
  const index = new Map();
  for (let i = 0; i + LIMITS.duplicateBlockLines <= normalized.length; i++) {
    const block = normalized.slice(i, i + LIMITS.duplicateBlockLines);
    if (block.filter((l) => l.length > 1 && !l.startsWith("//")).length < LIMITS.duplicateBlockLines) continue;
    const key = block.join("\n");
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(i + 1);
  }
  return [...index.entries()]
    .filter(([, positions]) => positions.length > 1)
    .map(([key, positions]) => ({
      file: fileKey,
      firstLine: positions[0],
      occurrences: positions.length,
      preview: key.split("\n")[0].slice(0, 80),
    }));
}

const files = (await Promise.all(SCAN_DIRS.map((dir) => collectFiles(join(ROOT, dir))))).flat();
const reports = [];
const duplicates = [];

for (const file of files) {
  const text = await readFile(file, "utf8");
  const lines = text.split("\n");
  const scanned = stripForScanning(text);
  const functions = findFunctions(scanned);
  const commentedOut = findCommentedOutCode(lines);
  const magic = findMagicLiterals(scanned);
  reports.push({
    file: relative(ROOT, file),
    lines: lines.length,
    functions,
    commentedOut,
    magic,
  });
  duplicates.push(...findDuplication(lines, relative(ROOT, file)));
}

const tooLongFiles = reports.filter((r) => r.lines > LIMITS.fileLines);
const tooManyParams = reports.flatMap((r) =>
  r.functions.filter((f) => f.params > LIMITS.parameters).map((f) => ({ file: r.file, ...f })),
);
const tooDeep = reports.flatMap((r) =>
  r.functions.filter((f) => f.nesting > LIMITS.nesting).map((f) => ({ file: r.file, ...f })),
);
const longFunctions = reports.flatMap((r) =>
  r.functions.filter((f) => f.lines > LIMITS.functionLines).map((f) => ({ file: r.file, ...f })),
);
const commentedOut = reports.flatMap((r) => r.commentedOut.map((line) => ({ file: r.file, line })));
const magicHotspots = reports
  .map((r) => ({ file: r.file, count: r.magic.length }))
  .filter((r) => r.count > 0)
  .sort((a, b) => b.count - a.count);

const print = (title, items, format, limit = 15) => {
  console.log(`\n## ${title} — ${items.length}`);
  items.slice(0, limit).forEach((item) => console.log(`  - ${format(item)}`));
  if (items.length > limit) console.log(`  … ${items.length - limit} more`);
};

const functionCount = reports.reduce((sum, r) => sum + r.functions.length, 0);
console.log(
  `Code quality report — ${files.length} files, ${functionCount} functions scanned (limits: ` +
    `${LIMITS.fileLines} lines/file, ${LIMITS.functionLines} lines/function, ${LIMITS.nesting} control-flow nesting, ${LIMITS.parameters} parameters)`,
);
print("Files over limit", tooLongFiles, (r) => `${r.file} — ${r.lines} lines`, 20);
print("Functions over limit", longFunctions, (f) => `${f.file}:${f.line} — ${f.lines} lines`, 20);
print("Too many parameters", tooManyParams, (f) => `${f.file}:${f.line} — ${f.params} parameters`);
print("Control-flow nesting over limit", tooDeep, (f) => `${f.file}:${f.line} — depth ${f.nesting}`);
print("Duplicated blocks", duplicates, (d) => `${d.file}:${d.firstLine} (x${d.occurrences}) ${d.preview}`, 10);
print("Commented-out code", commentedOut, (c) => `${c.file}:${c.line}`, 10);
print("Unnamed numeric literals (per file)", magicHotspots, (m) => `${m.file} — ${m.count}`, 10);

const failures = tooLongFiles.length + longFunctions.length + tooManyParams.length + tooDeep.length;
console.log(
  `\nHard-limit failures: ${failures}. Advisory: ${duplicates.length} duplicated blocks, ` +
    `${commentedOut.length} commented-out code lines, ${magicHotspots.reduce((sum, m) => sum + m.count, 0)} unnamed literals.`,
);
process.exit(failures ? 1 : 0);
