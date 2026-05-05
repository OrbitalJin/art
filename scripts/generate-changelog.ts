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
}

const CHANGELOG_TYPES = new Set([
  "feat",
  "fix",
  "fixed",
  "chore",
  "ci/cd",
  "updated",
  "added",
  "refactor",
  "tweaks",
  "semantics",
  "patch",
]);

const CHANGELOG_REGEX =
  /^(feat|fix|fixed|updated|added|refactor|tweaks|semantics|patch|chore|ci\/cd):\s*(.*)$/i;

function run(command: string): string {
  return execSync(command, {
    encoding: "utf-8",
    cwd: process.cwd(),
    stdio: ["pipe", "pipe", "pipe"],
  }).trim();
}

function safeRun(command: string): string | null {
  try {
    return run(command);
  } catch {
    return null;
  }
}

function escapeArg(value: string): string {
  return `"${value.replace(/(["\\$`])/g, "\\$1")}"`;
}

function parseSemver(tag: string): [number, number, number] | null {
  const match = tag.match(/^v(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return null;

  return [
    Number.parseInt(match[1], 10),
    Number.parseInt(match[2], 10),
    Number.parseInt(match[3], 10),
  ];
}

function compareTags(a: string, b: string): number {
  const av = parseSemver(a);
  const bv = parseSemver(b);

  if (!av || !bv) return a.localeCompare(b);

  if (av[0] !== bv[0]) return av[0] - bv[0];
  if (av[1] !== bv[1]) return av[1] - bv[1];
  return av[2] - bv[2];
}

function getVersionTags(): string[] {
  const raw = safeRun(`git tag --list "v*"`) ?? "";

  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((tag) => parseSemver(tag) !== null)
    .sort(compareTags);
}

function getTagDate(tag: string): string {
  return safeRun(`git log -1 --format=%cs ${tag}`) || "Unknown";
}

function getCommitsInRange(range: string): GitCommit[] {
  const format = ["%H", "%h", "%cs", "%s", "%b"].join("%x1f") + "%x1e";
  const raw = safeRun(
    `git log --reverse --pretty=format:${escapeArg(format)} ${range}`,
  );

  if (!raw) return [];

  return raw
    .split("\x1e")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [hash, shortHash, date, subject, body] = chunk.split("\x1f");

      return {
        hash: hash?.trim() ?? "",
        shortHash: shortHash?.trim() ?? "",
        date: date?.trim() ?? "",
        subject: subject?.trim() ?? "",
        body: body?.trim() ?? "",
      };
    });
}

function parseCommitMessageLines(
  subject: string,
  body: string,
): ChangelogEntry[] {
  const lines = [subject, ...body.split("\n")]
    .map((line) => line.trim())
    .filter(Boolean);

  const entries: ChangelogEntry[] = [];

  for (const line of lines) {
    const match = line.match(CHANGELOG_REGEX);
    if (!match) continue;

    const type = match[1].toLowerCase();
    const message = match[2].trim();

    if (!CHANGELOG_TYPES.has(type) || !message) continue;

    entries.push({
      hash: "",
      type,
      message,
      date: "",
    });
  }

  return entries;
}

function commitsToEntries(commits: GitCommit[]): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];

  for (const commit of commits) {
    const parsedEntries = parseCommitMessageLines(commit.subject, commit.body);

    for (const entry of parsedEntries) {
      entries.push({
        ...entry,
        hash: commit.shortHash,
        date: commit.date,
      });
    }
  }

  return entries.reverse();
}

function main() {
  const tags = getVersionTags();
  const output: VersionGroup[] = [];

  if (tags.length === 0) {
    const commits = getCommitsInRange("HEAD");
    const entries = commitsToEntries(commits);

    output.push({
      version: "Pre-release",
      date: "Initial",
      entries,
    });
  } else {
    const firstTag = tags[0];
    const preReleaseCommits = getCommitsInRange(`${firstTag}^@`);
    const preReleaseEntries = commitsToEntries(
      getCommitsInRange(`${firstTag} --not ${firstTag}^`),
    );

    const latestTag = tags[tags.length - 1];
    const unreleasedEntries = commitsToEntries(
      getCommitsInRange(`${latestTag}..HEAD`),
    );

    if (unreleasedEntries.length > 0) {
      output.push({
        version: "Unreleased",
        date: "Latest",
        entries: unreleasedEntries,
      });
    }

    for (let i = tags.length - 1; i >= 0; i--) {
      const currentTag = tags[i];
      const previousTag = i > 0 ? tags[i - 1] : null;

      let commits: GitCommit[];

      if (previousTag) {
        commits = getCommitsInRange(`${previousTag}..${currentTag}`);
      } else {
        commits = getCommitsInRange(currentTag);
      }

      output.push({
        version: currentTag.replace(/^v/, ""),
        date: getTagDate(currentTag),
        entries: commitsToEntries(commits),
      });
    }

    if (preReleaseCommits.length > 0 || preReleaseEntries.length > 0) {
      output.push({
        version: "Pre-release",
        date: "Initial",
        entries: preReleaseEntries,
      });
    }
  }

  const publicDir = join(process.cwd(), "public");
  const changelogPath = join(publicDir, "changelog.json");

  mkdirSync(publicDir, { recursive: true });
  writeFileSync(changelogPath, JSON.stringify(output, null, 2), "utf-8");

  console.log(`Changelog written to ${changelogPath}`);
}

main();
