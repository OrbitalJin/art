import { createGateway, generateText, Output } from "ai";
import { toast } from "sonner";
import { z } from "zod";
import { useSessionStore } from "@/lib/store/use-session-store";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { modelTypeById } from "@/lib/ai/models";

export async function generateSessionTitle(
  sessionId: string,
): Promise<string | undefined> {
  const store = useSessionStore.getState();
  if (store.titleGeneratingIds.includes(sessionId)) return;
  store.startTitleGeneration(sessionId);

  try {
    const session = store.sessions.find((s) => s.id === sessionId);
    if (!session?.messages.length) return;

    const apiKey = useSettingsStore.getState().apiKey;
    if (!apiKey) return;

    const conversationText = session.messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(0, 4)
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

    if (!conversationText) return;

    const gateway = createGateway({
      apiKey,
      fetch: (url, init) => {
        const headers = new Headers(init?.headers);
        headers.delete("User-Agent");
        return fetch(url, { ...init, headers });
      },
    });

    const { output: genOutput } = await generateText({
      model: gateway(modelTypeById("model-1")),
      output: Output.object({
        schema: z.object({
          title: z
            .string()
            .describe("Concise title, max 5 words, Title Case, no quotes"),
        }),
      }),
      messages: [
        {
          role: "user",
          content: `Generate a title for this conversation:\n\n${conversationText}`,
        },
      ],
    });

    const title = genOutput.title;
    if (title?.trim()) {
      useSessionStore.getState().updateTitle(sessionId, title.trim());
      useSessionStore.getState().setTitleGenerated(sessionId, true);
      return title.trim();
    }
  } catch (err) {
    console.error("Title generation failed", err);
    toast.error("Failed to generate title");
  } finally {
    useSessionStore.getState().endTitleGeneration(sessionId);
  }
}
