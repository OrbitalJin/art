import { FolderPlus } from "lucide-react";
import type { z } from "zod";
import { fileToolSchemas } from "@/lib/ai/tools/files";
import { defineRenderer } from "../../types";
import { PathDetail, PathSummary } from "./parts";

type MakeDirInput = z.infer<typeof fileToolSchemas.make_dir.input>;
type MakeDirOutput = z.infer<typeof fileToolSchemas.make_dir.output>;

export const renderer = defineRenderer<MakeDirInput, MakeDirOutput>({
  icon: FolderPlus,
  title: "Created directory",
  executingTitle: "Creating directory",
  inputSchema: fileToolSchemas.make_dir.input,
  outputSchema: fileToolSchemas.make_dir.output,
  Summary: PathSummary,
  Detail: PathDetail,
});
