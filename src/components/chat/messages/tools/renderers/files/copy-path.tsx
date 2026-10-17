import { Copy } from "lucide-react";
import { fileToolSchemas } from "@/lib/ai/tools/files";
import type { ToolRenderer } from "../../types";
import { MoveDetail, MoveSummary } from "./parts";

interface CopyInput {
  folder: string;
  from: string;
  to: string;
}

export const renderer: ToolRenderer<CopyInput, unknown> = {
  icon: Copy,
  title: "Copied path",
  executingTitle: "Copying path",
  inputSchema: fileToolSchemas.copy_path.input,
  outputSchema: fileToolSchemas.copy_path.output,
  Summary: MoveSummary,
  Detail: MoveDetail,
};
