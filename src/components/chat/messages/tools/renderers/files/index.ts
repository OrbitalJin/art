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
import { fileToolSchemas, type FileToolName } from "@/lib/ai/tools/files";
import { EditFileDetail, EditFileSummary } from "./edit";
import { ReadImageDetail, ReadImageSummary } from "./image";
import { ListFolderDetail, ListFolderSummary, ListFoldersDetail } from "./list";
import { MoveDetail, MoveSummary, PathDetail, PathSummary } from "./mutate";
import { ReadPdfDetail, ReadPdfSummary } from "./pdf";
import { ReadFileDetail, ReadFileSummary } from "./read";
import { StatDetail, StatSummary } from "./stat";
import { WriteFileDetail, WriteFileSummary } from "./write";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRenderer = ToolRenderer<any, any>;

export const fileRenderers = {
  list_folders: {
    icon: FolderTree,
    title: "Listed folders",
    inputSchema: fileToolSchemas.list_folders.input,
    outputSchema: fileToolSchemas.list_folders.output,
    Detail: ListFoldersDetail,
  },
  list_folder: {
    icon: FolderTree,
    title: "Listed directory",
    inputSchema: fileToolSchemas.list_folder.input,
    outputSchema: fileToolSchemas.list_folder.output,
    Summary: ListFolderSummary,
    Detail: ListFolderDetail,
  },
  read_file: {
    icon: FileText,
    title: "Read file",
    inputSchema: fileToolSchemas.read_file.input,
    outputSchema: fileToolSchemas.read_file.output,
    Summary: ReadFileSummary,
    Detail: ReadFileDetail,
  },
  read_image: {
    icon: ImageIcon,
    title: "Read image",
    inputSchema: fileToolSchemas.read_image.input,
    outputSchema: fileToolSchemas.read_image.output,
    Summary: ReadImageSummary,
    Detail: ReadImageDetail,
  },
  read_pdf: {
    icon: FileType2,
    title: "Read PDF",
    inputSchema: fileToolSchemas.read_pdf.input,
    outputSchema: fileToolSchemas.read_pdf.output,
    Summary: ReadPdfSummary,
    Detail: ReadPdfDetail,
  },
  stat: {
    icon: Info,
    title: "Inspected path",
    inputSchema: fileToolSchemas.stat.input,
    outputSchema: fileToolSchemas.stat.output,
    Summary: StatSummary,
    Detail: StatDetail,
  },
  write_file: {
    icon: FilePlus,
    title: "Wrote file",
    inputSchema: fileToolSchemas.write_file.input,
    outputSchema: fileToolSchemas.write_file.output,
    Summary: WriteFileSummary,
    Detail: WriteFileDetail,
  },
  edit_file: {
    icon: FilePen,
    title: "Edited file",
    inputSchema: fileToolSchemas.edit_file.input,
    outputSchema: fileToolSchemas.edit_file.output,
    Summary: EditFileSummary,
    Detail: EditFileDetail,
  },
  make_dir: {
    icon: FolderPlus,
    title: "Created directory",
    inputSchema: fileToolSchemas.make_dir.input,
    outputSchema: fileToolSchemas.make_dir.output,
    Summary: PathSummary,
    Detail: PathDetail,
  },
  remove_path: {
    icon: Trash2,
    title: "Removed path",
    inputSchema: fileToolSchemas.remove_path.input,
    outputSchema: fileToolSchemas.remove_path.output,
    Summary: PathSummary,
    Detail: PathDetail,
  },
  move_path: {
    icon: MoveRight,
    title: "Moved path",
    inputSchema: fileToolSchemas.move_path.input,
    outputSchema: fileToolSchemas.move_path.output,
    Summary: MoveSummary,
    Detail: MoveDetail,
  },
  copy_path: {
    icon: Copy,
    title: "Copied path",
    inputSchema: fileToolSchemas.copy_path.input,
    outputSchema: fileToolSchemas.copy_path.output,
    Summary: MoveSummary,
    Detail: MoveDetail,
  },
} satisfies Record<FileToolName, AnyRenderer>;
