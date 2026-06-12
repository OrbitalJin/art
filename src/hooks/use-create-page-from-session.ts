import { useSessionStore } from "@/lib/store/use-session-store";
import { useJournalStore } from "@/lib/store/use-journal-store";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { modelById } from "@/lib/ai/models";
import { gen } from "@/lib/ai/prompts/gen";

export const useCreatePageFromSession = () => {
  const navigate = useNavigate();
  const [creating, setCreating] = useState<boolean>(false);

  const create = async (sessionId: string) => {
    if (creating) return;
    const toastId = toast.loading("Creating page from session...");
    setCreating(true);

    try {
      const sessions = useSessionStore.getState().sessions;
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) {
        return toast.error("Session not found", { id: toastId });
      }

      const apiKey = useSettingsStore.getState().apiKey;
      if (!apiKey) {
        return toast.error("API key not configured", { id: toastId });
      }

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

      if (!conversationText) {
        return toast.error("No conversation to create page from", {
          id: toastId,
        });
      }

      const provider = createGoogleGenerativeAI({ apiKey });
      const modelType = modelById("model-1").type;

      const { text: pages } = await generateText({
        model: provider(modelType),
        messages: [
          {
            role: "user",
            content: `${gen.pageFromSession}\n\nConversation:\n${conversationText}`,
          },
        ],
      });

      if (!pages?.trim()) {
        return toast.error("Failed to generate pages", { id: toastId });
      }

      const pageId = useJournalStore.getState().create("research");
      useJournalStore.getState().updateContent(pageId, pages.trim());

      navigate("/journal");
      toast.success("Page created from session", { id: toastId });
    } catch (err) {
      console.error("Failed to create page from session", err);
      toast.error("Failed to create page from session", { id: toastId });
    } finally {
      setCreating(false);
      toast.dismiss(toastId);
    }
  };

  return {
    create,
    creating,
  };
};
