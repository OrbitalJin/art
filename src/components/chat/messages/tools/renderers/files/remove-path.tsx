import { Trash2 } from "lucide-react";
import { fileToolSchemas } from "@/lib/ai/tools/files";
import type { ToolRenderer } from "../../types";
import { PathDetail, PathSummary } from "./parts";

interface RemovePathInput {
  folder: string;
  path: string;
}

export const renderer: ToolRenderer<RemovePathInput, unknown> = {
  icon: Trash2,
  title: "Removed path",
  executingTitle: "Removing path",
  inputSchema: fileToolSchemas.remove_path.input,
  outputSchema: fileToolSchemas.remove_path.output,
  Summary: PathSummary,
  Detail: PathDetail,
};
