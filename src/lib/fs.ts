import { join } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile, readDir, type DirEntry } from "@tauri-apps/plugin-fs";

const validExtensions = [
  "txt",
  "md",
  "csv",
  "json",
  "yaml",
  "yml",
  "xml",
  "html",
  "css",
  "js",
  "ts",
  "jsx",
  "tsx",
  "py",
  "rb",
  "go",
  "rs",
  "java",
  "php",
];

export const selectDirectory = async (): Promise<string | null> => {
  return await open({
    directory: true,
    multiple: false,
  });
};

export const observeDirectory = async (
  root: string,
): Promise<DirEntry[] | undefined> => {
  const content = await readDir(root);
  if (!content.length) return;
  return content.filter((f) => f.isFile && isUsable(f.name));
};

export const readUsableFile = async (root: string, name: string) => {
  const segments = name
    .trim()
    .split(/[\\/]+/)
    .filter((segment) => segment.length > 0 && segment !== ".");

  if (!segments.length) {
    throw new Error("No file name was provided.");
  }

  if (segments.some((segment) => segment === "..")) {
    throw new Error("Invalid file path.");
  }

  const fileName = segments[segments.length - 1];
  if (!isUsable(fileName)) {
    throw new Error(
      `Unsupported file type. The Knowledge Base only exposes ${validExtensions.join(
        ", ",
      )} files.`,
    );
  }

  const path = await join(root, segments.join("/"));
  const content = await readTextFile(path);
  return content;
};

const isUsable = (name: string): boolean => {
  const dot = name.lastIndexOf(".");
  // `dot > 0` skips extension-less names and dotfiles such as `.md`.
  if (dot <= 0) return false;
  return validExtensions.includes(name.slice(dot + 1).toLowerCase());
};
