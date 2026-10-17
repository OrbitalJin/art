import { MoveRight } from "lucide-react";
import { fileToolSchemas } from "@/lib/ai/tools/files";
import type { ToolRenderer } from "../../types";
import { MoveDetail, MoveSummary } from "./parts";

interface MoveInput {
  folder: string;
  from: string;
  to: string;
}

export const renderer: ToolRenderer<MoveInput, unknown> = {
  icon: MoveRight,
  title: "Moved path",
  executingTitle: "Moving path",
  inputSchema: fileToolSchemas.move_path.input,
  outputSchema: fileToolSchemas.move_path.output,
  Summary: MoveSummary,
  Detail: MoveDetail,
};
