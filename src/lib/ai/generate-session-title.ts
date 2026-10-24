import { createGateway, generateText, Output } from "ai";
import { toast } from "sonner";
import { z } from "zod";
import { useSessionIndex } from "@/lib/store/session/index-store";
import { sessionDataStore } from "@/lib/store/session/data-store";
import { messageText } from "@/lib/store/session/types";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { type ModelType } from "@/lib/ai/models";
import { nativeFetch } from "@/lib/native-fetch";

export async function generateSessionTitle(
  sessionId: string,
): Promise<string | undefined> {
  const store = useSessionIndex.getState();
  if (store.titleGeneratingIds.includes(sessionId)) return;
  store.startTitleGeneration(sessionId);

  try {
    await sessionDataStore.getState().ensure(sessionId);
    const messages = sessionDataStore.getState().cache[sessionId]?.messages;
    if (!messages?.length) return;

    const apiKey = useSettingsStore.getState().keys?.gateway;
    if (!apiKey) return;

    const conversationText = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(0, 4)
      .map(
        (m) =>
          `${m.role === "user" ? "User" : "Assistant"}: ${messageText(m)}`,
      )
      .join("\n\n");

    if (!conversationText) return;

    const gateway = createGateway({ apiKey, fetch: nativeFetch });

    const { output: genOutput } = await generateText({
      model: gateway("deepseek/deepseek-v4-flash" as ModelType),
      output: Output.object({
        schema: z.object({
          title: z
            .string()
            .describe("Concise title, max 4-5 words, Title Case, no quotes"),
        }),
      }),
      messages: [
        {
          role: "user",
          content: `Generate a JSON object with a "title" field for this conversation: \n\n${conversationText}`,
        },
      ],
    });

    const title = genOutput.title;
    if (title?.trim()) {
      useSessionIndex.getState().updateTitle(sessionId, title.trim());
      useSessionIndex.getState().setTitleGenerated(sessionId, true);
      return title.trim();
    }
  } catch (err) {
    console.error("Title generation failed", err);
    toast.error("Failed to generate title");
  } finally {
    useSessionIndex.getState().endTitleGeneration(sessionId);
  }
}
