import { tool, type ToolSet } from "ai";
import { z } from "zod";
import { useJournalStore } from "@/lib/store/use-journal-store";

export const JOURNAL_READ_TOOL_NAME = "journal_read";
export const JOURNAL_SEARCH_TOOL_NAME = "journal_search";

const EXCERPT_LIMIT = 240;
const DEFAULT_RESULTS = 6;

const excerpt = (content: string): string => {
  const single = content.replace(/\s+/g, " ").trim();
  return single.length <= EXCERPT_LIMIT
    ? single
    : `${single.slice(0, EXCERPT_LIMIT).trimEnd()}…`;
};

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

export const journalSearchInputSchema = z.object({
  query: z
    .string()
    .optional()
    .describe(
      "Text matched against titles, bodies, and tags. Omit to list the most recent entries.",
    ),
  tag: z.string().optional().describe("Only return entries carrying this tag."),
  limit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .describe(`How many results to return. Defaults to ${DEFAULT_RESULTS}.`),
});

export const journalSearchOutputSchema = z.object({
  results: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      tags: z.array(z.string()),
      workspace: z.string(),
      updatedAt: z.number(),
      excerpt: z.string(),
    }),
  ),
});

export type JournalReadOutput = z.infer<typeof journalReadOutputSchema>;
export type JournalSearchOutput = z.infer<typeof journalSearchOutputSchema>;

const readDescription =
  "Read the full Markdown of one journal entry by id. Use it after the user " +
  "references an entry, or when you need an entry's full text to reason about " +
  "or quote it. Returns `found: false` when the id no longer exists.";

const searchDescription =
  "Search the user's journal for entries relevant to the task. Matches the " +
  "query against titles, bodies, and tags, newest first. Returns short " +
  "excerpts; call `journal_read` with an id to get the full entry.";

export const journalTools = (): ToolSet => ({
  [JOURNAL_READ_TOOL_NAME]: tool({
    title: "Read journal entry",
    description: readDescription,
    inputSchema: journalReadInputSchema,
    outputSchema: journalReadOutputSchema,
    execute: async ({ id }): Promise<JournalReadOutput> => {
      const page = useJournalStore.getState().getFn(id);
      if (!page) {
        return { found: false, id, error: `No journal entry with id ${id}.` };
      }
      return {
        found: true,
        id: page.id,
        title: page.title,
        tags: page.tags,
        workspace: page.workspace,
        content: page.content,
        updatedAt: page.updatedAt,
      };
    },
  }),

  [JOURNAL_SEARCH_TOOL_NAME]: tool({
    title: "Search journal",
    description: searchDescription,
    inputSchema: journalSearchInputSchema,
    outputSchema: journalSearchOutputSchema,
    execute: async ({ query, tag, limit }): Promise<JournalSearchOutput> => {
      const pages = useJournalStore.getState().pages;
      const needle = query?.trim().toLowerCase();

      const matched = pages.filter((page) => {
        if (tag && !page.tags.includes(tag)) return false;
        if (!needle) return true;
        return (
          page.title.toLowerCase().includes(needle) ||
          page.content.toLowerCase().includes(needle) ||
          page.tags.some((entryTag) => entryTag.toLowerCase().includes(needle))
        );
      });

      const results = [...matched]
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, limit ?? DEFAULT_RESULTS)
        .map((page) => ({
          id: page.id,
          title: page.title,
          tags: page.tags,
          workspace: page.workspace,
          updatedAt: page.updatedAt,
          excerpt: excerpt(page.content),
        }));

      return { results };
    },
  }),
});

export type JournalToolName = keyof ReturnType<typeof journalTools>;
