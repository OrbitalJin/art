import { execSync } from "child_process";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

interface ChangelogEntry {
  hash: string;
  type: string;
  message: string;
  date: string;
}

interface VersionGroup {
  version: string;
  date: string;
  entries: ChangelogEntry[];
}

interface GitCommit {
  hash: string;
  shortHash: string;
  date: string;
  subject: string;
  body: string;
  version: string | null;
}

const CHANGELOG_TYPES = new Set([
  "feat",
  "fix",
  "fixed",
  "updated",
  "added",
  "refactor",
  "tweaks",
  "semantics",
  "patch",
]);

const CHANGELOG_REGEX =
  /^(feat|fix|fixed|updated|added|refactor|tweaks|semantics|patch):\s*(.*)$/i;

function run(command: string): string {
  return execSync(command, {
    encoding: "utf-8",
    cwd: process.cwd(),
  }).trim();
}

function escapeArg(value: string): string {
  return `"${value.replace(/(["\\$`])/g, "\\$1")}"`;
}

function getVersionFromTauriConfigAtCommit(hash: string): string | null {
  try {
    const content = run(`git show ${hash}:src-tauri/tauri.conf.json`);
    const match = content.match(/"version":\s*"([^"]+)"/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function parseCommitMessageLines(
  subject: string,
  body: string,
): ChangelogEntry[] {
  const lines = [subject, ...body.split("\n")]
    .map((line) => line.trim())
    .filter(Boolean);

  const entries: Array<{ type: string; message: string }> = [];

  for (const line of lines) {
    const match = line.match(CHANGELOG_REGEX);
    if (!match) continue;

    const type = match[1].toLowerCase();
    const message = match[2].trim();

    if (!CHANGELOG_TYPES.has(type) || !message) continue;

    entries.push({ type, message });
  }

  return entries.map((entry) => ({
    hash: "",
    type: entry.type,
    message: entry.message,
    date: "",
  }));
}

function getAllCommits(): GitCommit[] {
  const format = ["%H", "%h", "%cs", "%s", "%b"].join("%x1f");
  const raw = run(`git log --reverse --pretty=format:${escapeArg(format)}%x1e`);

  if (!raw) return [];

  return raw
    .split("\x1e")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [hash, shortHash, date, subject, body] = chunk.split("\x1f");

      return {
        hash,
        shortHash,
        date,
        subject: subject?.trim() ?? "",
        body: body?.trim() ?? "",
        version: getVersionFromTauriConfigAtCommit(hash),
      };
    });
}

function didTauriConfigChange(hash: string): boolean {
  try {
    const changed = run(`git diff-tree --no-commit-id --name-only -r ${hash}`)
      .split("\n")
      .map((line) => line.trim());

    return changed.includes("src-tauri/tauri.conf.json");
  } catch {
    return false;
  }
}

function isVersionBumpCommit(
  commit: GitCommit,
  previousVersion: string | null,
): boolean {
  if (!didTauriConfigChange(commit.hash)) return false;
  if (!commit.version) return false;
  return commit.version !== previousVersion;
}

function cloneEntries(entries: ChangelogEntry[]): ChangelogEntry[] {
  return entries.map((entry) => ({ ...entry }));
}

function main() {
  const commits = getAllCommits();

  const versionGroups: VersionGroup[] = [];
  const unreleasedEntries: ChangelogEntry[] = [];
  const preReleaseEntries: ChangelogEntry[] = [];

  let pendingEntries: ChangelogEntry[] = [];
  let currentVersion: string | null = null;
  let seenFirstVersion = false;

  for (const commit of commits) {
    const parsedEntries = parseCommitMessageLines(
      commit.subject,
      commit.body,
    ).map((entry) => ({
      ...entry,
      hash: commit.shortHash,
      date: commit.date,
    }));

    const nextVersion = commit.version;
    const isBump = isVersionBumpCommit(commit, currentVersion);

    if (isBump && nextVersion) {
      versionGroups.push({
        version: nextVersion,
        date: commit.date,
        entries: cloneEntries(pendingEntries).reverse(),
      });

      pendingEntries = [];
      currentVersion = nextVersion;
      seenFirstVersion = true;
      continue;
    }

    if (parsedEntries.length > 0) {
      pendingEntries.push(...parsedEntries);
    }
  }

  if (!seenFirstVersion) {
    preReleaseEntries.push(...pendingEntries);
  } else {
    unreleasedEntries.push(...pendingEntries);
  }

  const output: VersionGroup[] = [];

  if (unreleasedEntries.length > 0) {
    output.push({
      version: "Unreleased",
      date: "Latest",
      entries: cloneEntries(unreleasedEntries).reverse(),
    });
  }

  output.push(...versionGroups.reverse());

  const firstVersionExists = versionGroups.length > 0;
  if (!firstVersionExists && preReleaseEntries.length > 0) {
    output.push({
      version: "Pre-release",
      date: "Initial",
      entries: cloneEntries(preReleaseEntries).reverse(),
    });
  }

  const publicDir = join(process.cwd(), "public");
  const changelogPath = join(publicDir, "changelog.json");

  mkdirSync(publicDir, { recursive: true });
  writeFileSync(changelogPath, JSON.stringify(output, null, 2), "utf-8");

  console.log(`Changelog written to ${changelogPath}`);
}

main();
