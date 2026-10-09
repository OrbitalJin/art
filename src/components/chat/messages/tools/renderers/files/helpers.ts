import { asRecord, getBoolean, getString } from "../../helpers";

export const MAX_FILE_LINES = 400;

export interface FolderEntry {
  name: string;
  isDirectory: boolean;
  isSymlink: boolean;
}

export const pathOf = (input: unknown) => {
  const record = asRecord(input);
  return {
    folder: getString(record, "folder"),
    path: getString(record, "path"),
  };
};

export const toFolderEntry = (item: unknown): FolderEntry => {
  const record = asRecord(item);
  return {
    name: getString(record, "name") ?? String(item),
    isDirectory: getBoolean(record, "isDirectory") ?? false,
    isSymlink: getBoolean(record, "isSymlink") ?? false,
  };
};
