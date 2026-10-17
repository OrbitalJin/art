import { FolderPlus } from "lucide-react";
import { fileToolSchemas } from "@/lib/ai/tools/files";
import type { ToolRenderer } from "../../types";
import { PathDetail, PathSummary } from "./parts";

interface MakeDirInput {
  folder: string;
  path: string;
}

export const renderer: ToolRenderer<MakeDirInput, unknown> = {
  icon: FolderPlus,
  title: "Created directory",
  executingTitle: "Creating directory",
  inputSchema: fileToolSchemas.make_dir.input,
  outputSchema: fileToolSchemas.make_dir.output,
  Summary: PathSummary,
  Detail: PathDetail,
};
