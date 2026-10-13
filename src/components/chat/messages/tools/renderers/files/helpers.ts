export const MAX_FILE_LINES = 400;

export interface FolderEntry {
  name: string;
  isDirectory: boolean;
  isSymlink: boolean;
}

export interface PathInput {
  folder?: string | null;
  path?: string | null;
}

export const pathOf = (input: PathInput | null) => ({
  folder: input?.folder ?? null,
  path: input?.path ?? null,
});
