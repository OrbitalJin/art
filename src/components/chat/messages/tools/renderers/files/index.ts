import type { ToolRenderer } from "../../types";
import type { FileToolName } from "@/lib/ai/tools/files";
import { renderer as copyPath } from "./copy-path";
import { renderer as editFile } from "./edit-file";
import { renderer as listFolder } from "./list-folder";
import { renderer as listFolders } from "./list-folders";
import { renderer as makeDir } from "./make-dir";
import { renderer as movePath } from "./move-path";
import { renderer as readFile } from "./read-file";
import { renderer as readImage } from "./read-image";
import { renderer as readPdf } from "./read-pdf";
import { renderer as removePath } from "./remove-path";
import { renderer as stat } from "./stat";
import { renderer as writeFile } from "./write-file";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRenderer = ToolRenderer<any, any>;

export const fileRenderers = {
  list_folders: listFolders,
  list_folder: listFolder,
  read_file: readFile,
  read_image: readImage,
  read_pdf: readPdf,
  stat,
  write_file: writeFile,
  edit_file: editFile,
  make_dir: makeDir,
  remove_path: removePath,
  move_path: movePath,
  copy_path: copyPath,
} satisfies Record<FileToolName, AnyRenderer>;
