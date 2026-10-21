import { MoveRight } from "lucide-react";
import type { z } from "zod";
import { fileToolSchemas } from "@/lib/ai/tools/files";
import { defineRenderer } from "../../types";
import { MoveDetail, MoveSummary } from "./parts";

type MoveInput = z.infer<typeof fileToolSchemas.move_path.input>;
type MoveOutput = z.infer<typeof fileToolSchemas.move_path.output>;

export const renderer = defineRenderer<MoveInput, MoveOutput>({
  icon: MoveRight,
  title: "Moved path",
  executingTitle: "Moving path",
  inputSchema: fileToolSchemas.move_path.input,
  outputSchema: fileToolSchemas.move_path.output,
  Summary: MoveSummary,
  Detail: MoveDetail,
});
