import { execSync } from "child_process";
import { writeFileSync } from "fs";
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

// Step 1: Extract version bumps from tauri.conf.json history
const versionCommitsRaw = execSync(
  'git log --pretty=format:"%H" -- src-tauri/tauri.conf.json',
  { encoding: "utf-8" },
).trim();

const versionMap: Map<string, { hash: string; date: string; version: string }> =
  new Map();

if (versionCommitsRaw) {
  const hashes = versionCommitsRaw.split("\n").filter((h) => h.trim() !== "");
  for (const hash of hashes) {
    try {
      const date = execSync(
        `git show --pretty=format:"%cd" --date=short -s ${hash}`,
        { encoding: "utf-8" },
      ).trim();
      const configContent = execSync(
        `git show ${hash}:src-tauri/tauri.conf.json`,
        { encoding: "utf-8" },
      );
      const versionMatch = configContent.match(/"version":\s*"([^"]+)"/);

      if (versionMatch) {
        const version = versionMatch[1];
        if (!versionMap.has(version) || date > versionMap.get(version)!.date) {
          versionMap.set(version, { hash, date, version });
        }
      }
    } catch (error) {
      console.error(`Skipping commit ${hash}:`, error);
    }
  }
}

const versionCommits = Array.from(versionMap.values()).sort((a, b) =>
  a.date.localeCompare(b.date),
);
const lastVersionCommit =
  versionCommits.length > 0 ? versionCommits[versionCommits.length - 1] : null;

// Step 2: Collect all feat/fix/updated commits
const allCommitsRaw = execSync(
  'git log --pretty=format:"%h %cd %s" --date=short',
  { encoding: "utf-8" },
).trim();

const regex =
  /^(feat|fix|fixed|updated|added|refactor|tweaks|semantics|patch):\s*(.*)/;
const versionGroups: Map<string, VersionGroup> = new Map();

if (allCommitsRaw) {
  const lines = allCommitsRaw.split("\n").filter((line) => line.trim() !== "");

  for (const line of lines) {
    const firstSpace = line.indexOf(" ");
    const secondSpace = line.indexOf(" ", firstSpace + 1);

    if (firstSpace === -1 || secondSpace === -1) continue;

    const hash = line.substring(0, firstSpace);
    const date = line.substring(firstSpace + 1, secondSpace);
    const subject = line.substring(secondSpace + 1);

    const match = subject.match(regex);
    if (!match) continue;

    const entry: ChangelogEntry = {
      hash,
      type: match[1],
      message: match[2].trim(),
      date,
    };

    // Categorize commit into version group
    if (lastVersionCommit && date > lastVersionCommit.date) {
      // Unreleased commits
      if (!versionGroups.has("Unreleased")) {
        versionGroups.set("Unreleased", {
          version: "Unreleased",
          date: "Latest",
          entries: [],
        });
      }
      versionGroups.get("Unreleased")!.entries.push(entry);
    } else {
      // Find the latest version commit that was active when this commit was made
      let targetVersion = null;
      for (let i = versionCommits.length - 1; i >= 0; i--) {
        if (versionCommits[i].date <= date) {
          targetVersion = versionCommits[i];
          break;
        }
      }

      if (targetVersion) {
        const key = targetVersion.version;
        if (!versionGroups.has(key)) {
          versionGroups.set(key, {
            version: targetVersion.version,
            date: targetVersion.date,
            entries: [],
          });
        }
        versionGroups.get(key)!.entries.push(entry);
      } else {
        // Pre-release commits (before first version bump)
        if (!versionGroups.has("Pre-release")) {
          versionGroups.set("Pre-release", {
            version: "Pre-release",
            date: "Initial",
            entries: [],
          });
        }
        versionGroups.get("Pre-release")!.entries.push(entry);
      }
    }
  }
}

// Step 3: Sort version groups for output
const sortedGroups: VersionGroup[] = [];

// Unreleased first
if (versionGroups.has("Unreleased")) {
  sortedGroups.push(versionGroups.get("Unreleased")!);
}

// Versioned groups (newest first)
const versionedGroups = Array.from(versionGroups.values())
  .filter((g) => g.version !== "Unreleased" && g.version !== "Pre-release")
  .sort((a, b) => b.date.localeCompare(a.date));
sortedGroups.push(...versionedGroups);

// Pre-release last
if (versionGroups.has("Pre-release")) {
  sortedGroups.push(versionGroups.get("Pre-release")!);
}

// Sort entries within each group by date (newest first)
for (const group of sortedGroups) {
  group.entries.sort((a, b) => b.date.localeCompare(a.date));
}

// Write output
const changelogPath = join(__dirname, "..", "public", "changelog.json");
writeFileSync(changelogPath, JSON.stringify(sortedGroups, null, 2));
