import {
  BaseDirectory,
  exists,
  mkdir,
  readTextFile,
  remove,
  writeTextFile,
} from "@tauri-apps/plugin-fs";

const DIR = "journal";
const filePath = (id: string) => `${DIR}/${id}.md`;

let dirReady: Promise<void> | null = null;

const ensureDir = (): Promise<void> => {
  dirReady ??= (async () => {
    if (!(await exists(DIR, { baseDir: BaseDirectory.AppData }))) {
      await mkdir(DIR, { baseDir: BaseDirectory.AppData, recursive: true });
    }
  })();
  return dirReady;
};

export const readPageMarkdown = async (id: string): Promise<string | null> => {
  try {
    return await readTextFile(filePath(id), { baseDir: BaseDirectory.AppData });
  } catch {
    return null;
  }
};

export const writePageMarkdown = async (
  id: string,
  markdown: string,
): Promise<void> => {
  await ensureDir();
  await writeTextFile(filePath(id), markdown, {
    baseDir: BaseDirectory.AppData,
  });
};

export const removePageMarkdown = async (id: string): Promise<void> => {
  try {
    await remove(filePath(id), { baseDir: BaseDirectory.AppData });
  } catch {
    // A missing file is not a failure when deleting.
  }
};
