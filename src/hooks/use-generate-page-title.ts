import { useJournalStore } from "@/lib/store/use-journal-store";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { useState } from "react";
import { toast } from "sonner";
import { generateText, Output } from "ai";
import { modelTypeById } from "@/lib/ai/models";
import { z } from "zod";
import { useGateway } from "./use-gateway";

export const useGeneratePageTitle = () => {
  const [generating, setGenerating] = useState(false);
  const gateway = useGateway();

  const generateTitle = async (pageId: string) => {
    if (generating) return;
    setGenerating(true);

    try {
      const pages = useJournalStore.getState().pages;
      const page = pages.find((p) => p.id === pageId);
      if (!page?.content.trim()) return;

      const apiKey = useSettingsStore.getState().apiKey;
      if (!apiKey) return;

      const contentPreview = page.content.slice(0, 2000).trim();
      if (!contentPreview) return;

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
            content: `Generate a title for this note:\n\n${contentPreview}`,
          },
        ],
      });

      const title = genOutput.title;
      if (title?.trim()) {
        useJournalStore.getState().updateTitle(pageId, title.trim());
        return title.trim();
      }
    } catch (err) {
      console.error("Title generation failed", err);
      toast.error("Failed to generate title");
    } finally {
      setGenerating(false);
    }
  };

  return {
    generateTitle,
    generating,
  };
};
