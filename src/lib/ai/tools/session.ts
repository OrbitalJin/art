import { useJournalStore } from "@/lib/store/use-journal-store";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { createGateway, tool, type ToolSet } from "ai";
import { z } from "zod";
import { generateText } from "ai";
import { modelTypeById } from "@/lib/ai/models";
import { gen } from "@/lib/ai/prompts/gen";
import type { Session } from "@/lib/store/session/types";

interface Opts {
  session?: Session;
}

export const sessionTools = ({ session }: Opts): ToolSet => {
  return {
    create_page_from_session: tool({
      title: "Create Page from Session",
      description:
        "Transform a conversation session into educational study notes and save them as a new journal page",
      inputSchema: z.object({}),
      outputSchema: z.object({
        pageId: z.string(),
        title: z.string(),
      }),
      execute: async () => {
        if (!session) throw new Error(`Session not found`);

        const conversationText = session.messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => {
            const content =
              typeof m.content === "string"
                ? m.content
                : m.content
                    .filter((b) => b.type === "text")
                    .map((b) => b.text)
                    .join("");
            return `${m.role === "user" ? "User" : "Assistant"}: ${content}`;
          })
          .join("\n\n");

        if (!conversationText)
          throw new Error("No conversation found in session");

        const apiKey = useSettingsStore.getState().apiKey;
        if (!apiKey) throw new Error("API key not configured");

        const gateway = createGateway({ apiKey });

        const { text: notes } = await generateText({
          model: gateway(modelTypeById("model-1")),
          messages: [
            {
              role: "user",
              content: `${gen.pageFromSession}\n\nConversation:\n${conversationText}`,
            },
          ],
        });

        if (!notes?.trim()) throw new Error("Failed to generate notes");

        const pageId = useJournalStore.getState().create("research");
        useJournalStore.getState().updateContent(pageId, notes.trim());

        return { pageId, title: session.title };
      },
    }),
  } satisfies ToolSet;
};
