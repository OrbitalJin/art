import { useJournalStore } from "../store/use-journal-store";
import { WORKSPACES } from "../store/journal/types";
import { tool, type ToolSet } from "ai";
import { z } from "zod";

const pageSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
  workspace: z.enum(WORKSPACES),
  archived: z.boolean().optional(),
  pinned: z.boolean().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  lastViewedAt: z.number(),
});

export const journalTools = (): ToolSet => {
  const state = useJournalStore.getState();
  return {
    get_journals: tool({
      title: "Get Journal Entries",
      description:
        "Get all journal entries, optionally filtered by workspace or tag",
      inputSchema: z.object({
        workspace: z.enum(WORKSPACES).optional(),
        tag: z.string().optional(),
      }),
      outputSchema: z.array(pageSchema),
      execute: async ({ workspace, tag }) => {
        let pages = state.pages;
        if (workspace) pages = pages.filter((p) => p.workspace === workspace);
        if (tag) pages = state.getByTag(tag);
        return pages;
      },
    }),

    get_journal: tool({
      title: "Get Journal Entry",
      description: "Get a single journal entry by ID",
      inputSchema: z.object({
        id: z.string().describe("The page ID"),
      }),
      outputSchema: pageSchema,
      execute: async ({ id }) => {
        const page = state.getFn(id);
        if (!page) throw new Error(`Page not found: ${id}`);
        return page;
      },
    }),

    create_journal: tool({
      title: "Create Journal Entry",
      description: "Create a new journal entry",
      inputSchema: z.object({
        title: z.string().optional(),
        workspace: z.enum(WORKSPACES).optional(),
        content: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }),
      outputSchema: z.object({ id: z.string() }),
      execute: async ({ title, workspace, content, tags }) => {
        const id = state.create(workspace, title);
        if (content) state.updateContent(id, content);
        if (tags) state.updateTags(id, tags);
        return { id };
      },
    }),

    update_journal: tool({
      title: "Update Journal Entry",
      description: "Update the title and/or content of a journal entry",
      inputSchema: z.object({
        id: z.string(),
        title: z.string().optional(),
        content: z.string().optional(),
      }),
      outputSchema: z.object({ success: z.literal(true) }),
      execute: async ({ id, title, content }) => {
        if (title) state.updateTitle(id, title);
        if (content) state.updateContent(id, content);
        return { success: true };
      },
    }),

    delete_journal: tool({
      title: "Delete Journal Entry",
      description: "Delete a journal entry by ID",
      inputSchema: z.object({
        id: z.string(),
      }),
      outputSchema: z.object({ success: z.literal(true) }),
      execute: async ({ id }) => {
        state.deleteFn(id);
        return { success: true };
      },
    }),

    update_tags: tool({
      title: "Update Journal Tags",
      description: "Replace all tags on a journal entry",
      inputSchema: z.object({
        id: z.string(),
        tags: z.array(z.string()),
      }),
      outputSchema: z.object({ success: z.literal(true) }),
      execute: async ({ id, tags }) => {
        state.updateTags(id, tags);
        return { success: true };
      },
    }),

    get_all_tags: tool({
      title: "Get All Tags",
      description: "Get all unique tags across all journal entries",
      inputSchema: z.object({}),
      outputSchema: z.object({ tags: z.array(z.string()) }),
      execute: async () => {
        return { tags: state.getAllTags() };
      },
    }),

    toggle_pinned: tool({
      title: "Toggle Pinned Journal Entry",
      description: "Toggle the pinned state of a journal entry",
      inputSchema: z.object({
        id: z.string(),
      }),
      outputSchema: z.object({ success: z.boolean() }),
      execute: async ({ id }) => {
        const success = state.togglePinned(id);
        return { success };
      },
    }),

    toggle_archived: tool({
      title: "Toggle Archived Journal Entry",
      description: "Toggle the archived state of a journal entry",
      inputSchema: z.object({
        id: z.string(),
      }),
      outputSchema: z.object({ success: z.literal(true) }),
      execute: async ({ id }) => {
        state.toggleArchived(id);
        return { success: true };
      },
    }),
  };
};
