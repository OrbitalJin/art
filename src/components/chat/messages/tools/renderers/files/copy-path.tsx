import { Copy } from "lucide-react";
import type { z } from "zod";
import { fileToolSchemas } from "@/lib/ai/tools/files";
import { defineRenderer } from "../../types";
import { MoveDetail, MoveSummary } from "./parts";

type CopyInput = z.infer<typeof fileToolSchemas.copy_path.input>;
type CopyOutput = z.infer<typeof fileToolSchemas.copy_path.output>;

export const renderer = defineRenderer<CopyInput, CopyOutput>({
  icon: Copy,
  title: "Copied path",
  executingTitle: "Copying path",
  inputSchema: fileToolSchemas.copy_path.input,
  outputSchema: fileToolSchemas.copy_path.output,
  Summary: MoveSummary,
  Detail: MoveDetail,
});
