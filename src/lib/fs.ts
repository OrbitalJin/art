import { basename, isAbsolute, join, normalize } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

export interface FsRoot {
  id: string;
  name: string;
  path: string;
}

export const selectDirectory = async (): Promise<string | null> => {
  return await open({
    recursive: true,
    directory: true,
    multiple: false,
  });
};

export const grantFolder = async (path: string): Promise<void> => {
  await invoke("allow_folder", { path });
};

export const isInsideRoot = (
  rootPath: string,
  resolvedPath: string,
): boolean => {
  const windows = /^[a-zA-Z]:[\\/]/.test(rootPath) || rootPath.includes("\\");
  const fold = (p: string) => (windows ? p.toLowerCase() : p);
  const root = fold(rootPath).replace(/[\\/]+$/, "");
  const resolved = fold(resolvedPath);

  return (
    resolved === root ||
    resolved.startsWith(`${root}/`) ||
    resolved.startsWith(`${root}\\`)
  );
};

export const resolveInRoot = async (
  root: FsRoot,
  rel = ".",
): Promise<string> => {
  if (await isAbsolute(rel)) {
    throw new Error(
      "Absolute paths are not allowed. Use a path relative to the folder.",
    );
  }

  const base = await normalize(root.path);
  const resolved = await normalize(await join(base, rel));

  if (!isInsideRoot(base, resolved)) {
    throw new Error(`Path "${rel}" escapes the folder "${root.name}".`);
  }

  return resolved;
};

export const makeRoot = async (
  path: string,
  existing: FsRoot[],
): Promise<FsRoot> => {
  const normalized = await normalize(path);
  const name = await uniqueName(existing, normalized);
  return { id: crypto.randomUUID(), name, path: normalized };
};

const rootLabel = async (path: string): Promise<string> => {
  const base = await basename(path);
  return !base || base === "." || base === "/" ? path : base;
};

const uniqueName = async (roots: FsRoot[], path: string): Promise<string> => {
  const base = await rootLabel(path);
  let name = base;
  let suffix = 2;
  while (roots.some((root) => root.name === name)) {
    name = `${base}-${suffix++}`;
  }
  return name;
};
