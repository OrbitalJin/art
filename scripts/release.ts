import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";

function run(command: string): string {
  return execSync(command, {
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "inherit"],
  }).trim();
}

function safeRun(command: string): string | null {
  try {
    return run(command);
  } catch {
    return null;
  }
}

function fail(message: string): never {
  console.error(`\nError: ${message}\n`);
  process.exit(1);
}

function assertCleanWorkingTree() {
  const status = run("git status --porcelain");
  if (status) {
    fail("working tree is not clean. Commit or stash your changes first.");
  }
}

function assertVersionLooksValid(version: string) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    fail(`invalid version "${version}". Expected format like 0.3.9`);
  }
}

function assertTagDoesNotExist(tag: string) {
  const existing = safeRun(`git rev-parse --verify ${tag}`);
  if (existing) {
    fail(`tag "${tag}" already exists`);
  }
}

function getCurrentBranch(): string {
  return run("git branch --show-current");
}

function updateTauriVersion(version: string) {
  const path = "src-tauri/tauri.conf.json";
  const raw = readFileSync(path, "utf-8");
  const json = JSON.parse(raw);
  json.version = version;
  writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`, "utf-8");
}

function main() {
  const version = process.argv[2];

  if (!version) {
    fail("usage: bun scripts/release.ts <version>");
  }

  const tag = `v${version}`;
  const branch = getCurrentBranch();

  if (branch !== "main") {
    console.warn(
      `Warning: You are releasing from branch "${branch}" instead of main.`,
    );
  }

  assertVersionLooksValid(version);
  assertCleanWorkingTree();
  assertTagDoesNotExist(tag);

  console.log(`Preparing release ${tag}...`);

  // 1. Update Tauri Version
  console.log("Updating src-tauri/tauri.conf.json...");
  updateTauriVersion(version);

  // 2. Commit the version bump
  console.log("Creating release commit...");
  run("git add src-tauri/tauri.conf.json");
  run(`git commit -m "release: ${tag}"`);

  // 3. Tag the commit
  console.log(`Creating tag ${tag}...`);
  run(`git tag ${tag}`);

  console.log("\nRelease prepared locally.");
  console.log("\nNext steps to trigger the cloud build:");
  console.log(`  git push origin ${branch}`);
  console.log(`  git push origin ${tag}\n`);
}

main();
