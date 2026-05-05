import { execSync } from "child_process";

interface CommitVersion {
  hash: string;
  shortHash: string;
  date: string;
  version: string;
}

const DRY_RUN = false;

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

function escapeArg(value: string): string {
  return `"${value.replace(/(["\\$`])/g, "\\$1")}"`;
}

function getAllCommits(): Array<{
  hash: string;
  shortHash: string;
  date: string;
}> {
  const format = ["%H", "%h", "%cs"].join("%x1f");
  const raw = run(`git log --reverse --pretty=format:${escapeArg(format)}%x1e`);

  if (!raw) return [];

  return raw
    .split("\x1e")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [hash, shortHash, date] = chunk.split("\x1f");

      return {
        hash,
        shortHash,
        date,
      };
    });
}

function getVersionAtCommit(hash: string): string | null {
  const content = safeRun(`git show ${hash}:src-tauri/tauri.conf.json`);
  if (!content) return null;

  const match = content.match(/"version":\s*"([^"]+)"/);
  return match ? match[1] : null;
}

function getExistingTags(): Set<string> {
  const raw = safeRun("git tag") ?? "";

  return new Set(
    raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  );
}

function main() {
  const commits = getAllCommits();
  const existingTags = getExistingTags();

  let previousVersion: string | null = null;
  const detected: CommitVersion[] = [];

  for (const commit of commits) {
    const version = getVersionAtCommit(commit.hash);

    if (!version) continue;

    if (version !== previousVersion) {
      detected.push({
        hash: commit.hash,
        shortHash: commit.shortHash,
        date: commit.date,
        version,
      });

      previousVersion = version;
    }
  }

  for (const item of detected) {
    const tag = `v${item.version}`;

    if (existingTags.has(tag)) {
      console.log(`SKIP   ${tag} already exists`);
      continue;
    }

    if (DRY_RUN) {
      console.log(`WOULD  git tag ${tag} ${item.hash}  # ${item.date}`);
    } else {
      run(`git tag ${tag} ${item.hash}`);
      console.log(`CREATE ${tag} -> ${item.shortHash}`);
    }
  }

  if (DRY_RUN) {
    console.log("\nDry run only. Set DRY_RUN = false to create tags.");
  }
}

main();
