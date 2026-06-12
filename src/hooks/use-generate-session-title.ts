import { useCallback, useRef, useState } from "react";
import { useSessionStore } from "@/lib/store/use-session-store";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { toast } from "sonner";
import { generateText, Output } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { modelById } from "@/lib/ai/models";
import { z } from "zod";

export const useGenerateSessionTitle = () => {
  const [generating, setGenerating] = useState(false);
  const genRef = useRef(false);

  const generateTitle = useCallback(
    async (sessionId: string) => {
      if (genRef.current || generating) return;
      genRef.current = true;
      setGenerating(true);

      try {
        const sessions = useSessionStore.getState().sessions;
        const session = sessions.find((s) => s.id === sessionId);
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

        const provider = createGoogleGenerativeAI({ apiKey });
        const modelType = modelById("model-1").type;

        const { output: genOutput } = await generateText({
          model: provider(modelType),
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
        genRef.current = false;
        setGenerating(false);
      }
    },
    [generating],
  );

  return { generateTitle, generating };
};
