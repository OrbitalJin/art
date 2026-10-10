import {
  Copy,
  FilePen,
  FilePlus,
  FileText,
  FileType2,
  FolderPlus,
  FolderTree,
  Image as ImageIcon,
  Info,
  MoveRight,
  Trash2,
} from "lucide-react";
import type { ToolRenderer } from "../../types";
import type { FileToolName } from "@/lib/ai/tools/files";
import { EditFileDetail, EditFileSummary } from "./edit";
import { ReadImageDetail, ReadImageSummary } from "./image";
import { ListFolderDetail, ListFolderSummary, ListFoldersDetail } from "./list";
import { MoveDetail, MoveSummary, PathDetail, PathSummary } from "./mutate";
import { ReadPdfDetail, ReadPdfSummary } from "./pdf";
import { ReadFileDetail, ReadFileSummary } from "./read";
import { StatDetail, StatSummary } from "./stat";
import { WriteFileDetail, WriteFileSummary } from "./write";

export const fileRenderers = {
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
  read_image: {
    icon: ImageIcon,
    title: "Read image",
    Summary: ReadImageSummary,
    Detail: ReadImageDetail,
  },
  read_pdf: {
    icon: FileType2,
    title: "Read PDF",
    Summary: ReadPdfSummary,
    Detail: ReadPdfDetail,
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
} satisfies Record<FileToolName, ToolRenderer>;
