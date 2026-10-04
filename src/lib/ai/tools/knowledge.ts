import { observeDirectory, readUsableFile } from "@/lib/fs";
import { tool, type ToolSet } from "ai";
import z from "zod";

interface Opts {
  root: string;
}

export const knowledgeTools = ({ root }: Opts): ToolSet => {
  return {
    inspect_knowledge: tool({
      title: "Inspect the Knowledge Base",
      description:
        "List the file names available in the user's local Knowledge Base folder. Read-only; the model cannot modify these files.",
      inputSchema: z.object({}),
      outputSchema: z.array(z.string()),
      execute: async () => {
        const content = await observeDirectory(root);
        return content?.map((e) => e.name) ?? [];
      },
    }),
    read_knowledge: tool({
      title: "Read from the Knowledge Base",
      description:
        "Read the full text of a file in the user's local Knowledge Base folder (read-only). Use a name returned by inspect_knowledge.",
      inputSchema: z.object({
        name: z.string().describe("Name of the file to read."),
      }),
      outputSchema: z.string().describe("Content of the file"),
      execute: async ({ name }) => {
        return await readUsableFile(root, name);
      },
    }),
  };
};
