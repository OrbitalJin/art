import { execSync } from "child_process";
import { writeFileSync } from "fs";

function run(command: string): string {
  return execSync(command, {
    encoding: "utf-8",
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

function main() {
  const currentTag = process.argv[2];

  if (!currentTag) {
    throw new Error("Missing current tag argument");
  }

  const tags = getVersionTags();
  const currentIndex = tags.indexOf(currentTag);

  if (currentIndex === -1) {
    throw new Error(`Tag not found: ${currentTag}`);
  }

  const previousTag = currentIndex > 0 ? tags[currentIndex - 1] : null;
  const range = previousTag ? `${previousTag}..${currentTag}` : currentTag;

  const commitsRaw =
    safeRun(`git log --reverse --pretty=format:%s ${range}`) ?? "";
  const commits = commitsRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let notes = `Release ${currentTag}\n`;

  if (previousTag) {
    notes += `\nChanges since ${previousTag}:\n`;
  } else {
    notes += `\nInitial release:\n`;
  }

  if (commits.length > 0) {
    notes += commits.map((commit) => `- ${commit}`).join("\n");
  } else {
    notes += "- No commit messages found";
  }

  writeFileSync("release-notes.md", notes, "utf-8");
  console.log("Release notes written to release-notes.md");
}

main();
