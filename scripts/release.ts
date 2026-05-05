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

function getCurrentTauriVersion(): string {
  const raw = readFileSync("src-tauri/tauri.conf.json", "utf-8");
  const json = JSON.parse(raw);

  return json.version;
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

  assertVersionLooksValid(version);
  assertCleanWorkingTree();
  assertTagDoesNotExist(tag);

  const currentVersion = getCurrentTauriVersion();

  if (currentVersion === version) {
    fail(`tauri version is already "${version}"`);
  }

  console.log(`Preparing release ${tag}`);
  console.log(`Current branch: ${branch}`);
  console.log(`Current Tauri version: ${currentVersion}`);
  console.log(`Next Tauri version: ${version}\n`);

  console.log("1. Updating Tauri version...");
  updateTauriVersion(version);

  console.log("2. Generating changelog...");
  run("bun run changelog");

  console.log("3. Staging release files...");
  run("git add src-tauri/tauri.conf.json public/changelog.json");

  console.log("4. Creating release commit...");
  run(`git commit -m "release: ${tag}"`);

  console.log("5. Creating tag...");
  run(`git tag ${tag}`);

  console.log("\nRelease prepared successfully.\n");
  console.log("Next steps:");
  console.log(`  git push origin ${branch}`);
  console.log(`  git push origin ${tag}\n`);
}

main();
