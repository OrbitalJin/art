import { tool, type ToolSet } from "ai";
import { z } from "zod";
import { useJournalIndex } from "@/lib/store/journal/index-store";
import { journalContentStore } from "@/lib/store/journal/content-store";

export const JOURNAL_READ_TOOL_NAME = "journal_read";

export const journalReadInputSchema = z.object({
  id: z
    .string()
    .min(1)
    .describe("The journal entry id, e.g. from a [[journal:<id>]] reference."),
});

export const journalReadOutputSchema = z.object({
  found: z.boolean(),
  id: z.string(),
  title: z.string().optional(),
  tags: z.array(z.string()).optional(),
  workspace: z.string().optional(),
  content: z.string().optional(),
  updatedAt: z.number().optional(),
  error: z.string().optional(),
});

export type JournalReadOutput = z.infer<typeof journalReadOutputSchema>;

const readDescription =
  "Read the full Markdown of one journal entry by id. Use it after the user " +
  "references an entry, or when you need an entry's full text to reason about " +
  "or quote it. Returns `found: false` when the id no longer exists.";

export const journalTools = (): ToolSet => ({
  [JOURNAL_READ_TOOL_NAME]: tool({
    title: "Read journal entry",
    description: readDescription,
    inputSchema: journalReadInputSchema,
    outputSchema: journalReadOutputSchema,
    execute: async ({ id }): Promise<JournalReadOutput> => {
      const page = useJournalIndex.getState().getPage(id);
      if (!page) {
        return { found: false, id, error: `No journal entry with id ${id}.` };
      }
      const content = await journalContentStore.getState().ensure(id);
      return {
        found: true,
        id: page.id,
        title: page.title,
        tags: page.tags,
        workspace: page.workspace,
        content,
        updatedAt: page.updatedAt,
      };
    },
  }),
});

export type JournalToolName = keyof ReturnType<typeof journalTools>;
