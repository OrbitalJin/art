import {
  Copy,
  FilePen,
  FilePlus,
  FileText,
  FolderPlus,
  FolderTree,
  Info,
  MoveRight,
  Trash2,
} from "lucide-react";
import type { ToolRenderer } from "../../types";
import { EditFileDetail, EditFileSummary } from "./edit";
import { ListFolderDetail, ListFolderSummary, ListFoldersDetail } from "./list";
import { MoveDetail, MoveSummary, PathDetail, PathSummary } from "./mutate";
import { ReadFileDetail, ReadFileSummary } from "./read";
import { StatDetail, StatSummary } from "./stat";
import { WriteFileDetail, WriteFileSummary } from "./write";

export const fileRenderers: Record<string, ToolRenderer> = {
  list_folders: {
    icon: FolderTree,
    title: "Listed folders",
    Detail: ListFoldersDetail,
  },
  list_folder: {
    icon: FolderTree,
    title: "Listed directory",
    Summary: ListFolderSummary,
    Detail: ListFolderDetail,
  },
  read_file: {
    icon: FileText,
    title: "Read file",
    Summary: ReadFileSummary,
    Detail: ReadFileDetail,
  },
  stat: {
    icon: Info,
    title: "Inspected path",
    Summary: StatSummary,
    Detail: StatDetail,
  },
  write_file: {
    icon: FilePlus,
    title: "Wrote file",
    Summary: WriteFileSummary,
    Detail: WriteFileDetail,
  },
  edit_file: {
    icon: FilePen,
    title: "Edited file",
    Summary: EditFileSummary,
    Detail: EditFileDetail,
  },
  make_dir: {
    icon: FolderPlus,
    title: "Created directory",
    Summary: PathSummary,
    Detail: PathDetail,
  },
  remove_path: {
    icon: Trash2,
    title: "Removed path",
    Summary: PathSummary,
    Detail: PathDetail,
  },
  move_path: {
    icon: MoveRight,
    title: "Moved path",
    Summary: MoveSummary,
    Detail: MoveDetail,
  },
  copy_path: {
    icon: Copy,
    title: "Copied path",
    Summary: MoveSummary,
    Detail: MoveDetail,
  },
};
