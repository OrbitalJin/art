import { Trash2 } from "lucide-react";
import type { z } from "zod";
import { fileToolSchemas } from "@/lib/ai/tools/files";
import { defineRenderer } from "../../types";
import { PathDetail, PathSummary } from "./parts";

type RemovePathInput = z.infer<typeof fileToolSchemas.remove_path.input>;
type RemovePathOutput = z.infer<typeof fileToolSchemas.remove_path.output>;

export const renderer = defineRenderer<RemovePathInput, RemovePathOutput>({
  icon: Trash2,
  title: "Removed path",
  executingTitle: "Removing path",
  inputSchema: fileToolSchemas.remove_path.input,
  outputSchema: fileToolSchemas.remove_path.output,
  Summary: PathSummary,
  Detail: PathDetail,
});
