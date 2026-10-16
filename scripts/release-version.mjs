#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const packageJsonPath = path.join(rootDir, "package.json");
const changelogMdPath = path.join(rootDir, "CHANGELOG.md");
const changelogDataPath = path.join(rootDir, "src", "data", "changelog-data.js");

function getPackageJson() {
  return JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
}

function run(cmd) {
  try {
    return execSync(cmd, { cwd: rootDir, encoding: "utf8" }).trim();
  } catch (err) {
    console.error(`Command failed: ${cmd}`, err.message);
    throw err;
  }
}

/**
 * Validates that package.json version matches top changelog entry
 */
export async function validateVersionSync() {
  const pkg = getPackageJson();
  const currentVersion = pkg.version;

  const changelogMd = fs.readFileSync(changelogMdPath, "utf8");
  const topMdMatch = changelogMd.match(/## \[(\d+\.\d+\.\d+)\] - (\d{4}-\d{2}-\d{2})/);
  if (!topMdMatch) {
    throw new Error("Could not find top version heading in CHANGELOG.md");
  }

  const { CHANGELOG_ENTRIES } = await import(`file://${changelogDataPath}`);
  const topEntry = CHANGELOG_ENTRIES[0];

  console.log(`[Version Check] package.json: v${currentVersion}`);
  console.log(`[Version Check] CHANGELOG.md: v${topMdMatch[1]} (${topMdMatch[2]})`);
  console.log(`[Version Check] changelog-data.js: v${topEntry.version} (${topEntry.date})`);

  if (currentVersion !== topMdMatch[1] || currentVersion !== topEntry.version) {
    throw new Error(
      `Version mismatch! package.json has v${currentVersion}, but CHANGELOG.md has v${topMdMatch[1]} and changelog-data.js has v${topEntry.version}`
    );
  }

  console.log("✅ All version surfaces (package.json, CHANGELOG.md, changelog-data.js) are synchronized!");
  return currentVersion;
}

/**
 * Creates git tags for all historical releases if not already present
 */
export async function syncGitTags() {
  const { CHANGELOG_ENTRIES } = await import(`file://${changelogDataPath}`);
  const existingTags = run("git tag -l").split("\n").map((t) => t.trim()).filter(Boolean);

  let createdCount = 0;
  for (const entry of CHANGELOG_ENTRIES) {
    const tagName = `v${entry.version}`;
    if (existingTags.includes(tagName)) {
      continue;
    }

    const commitHash = entry.commits?.[0]?.hash;
    const target = (commitHash && commitHash !== "HEAD") ? commitHash : "HEAD";
    const msg = `Release ${tagName} (${entry.type}): ${entry.title}`;

    try {
      run(`git tag -a "${tagName}" ${target} -m "${msg}"`);
      console.log(`🏷️  Created tag ${tagName} -> ${target.slice(0, 7)}: ${entry.title}`);
      createdCount++;
    } catch (err) {
      console.warn(`Could not tag ${tagName} at ${target}:`, err.message);
    }
  }

  console.log(`Git tag synchronization complete. ${createdCount} new tags created.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  (async () => {
    try {
      await validateVersionSync();
      await syncGitTags();
    } catch (err) {
      console.error("❌ Version check / tag synchronization failed:", err.message);
      process.exit(1);
    }
  })();
}
