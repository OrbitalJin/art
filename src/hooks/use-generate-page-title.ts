import { useJournalIndex } from "@/lib/store/journal/index-store";
import { journalContentStore } from "@/lib/store/journal/content-store";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { useState } from "react";
import { toast } from "sonner";
import { type ModelType } from "@/lib/ai/models";
import { z } from "zod";

const loadAi = () => import("ai");

export const useGeneratePageTitle = () => {
  const [generating, setGenerating] = useState(false);

  const generateTitle = async (pageId: string) => {
    if (generating) return;
    setGenerating(true);

    try {
      const page = useJournalIndex.getState().getPage(pageId);
      if (!page) return;

      const apiKey = useSettingsStore.getState().keys?.gateway;
      if (!apiKey) return;

      const content = await journalContentStore.getState().ensure(pageId);
      const contentPreview = content.slice(0, 2000).trim();
      if (!contentPreview) return;

      const [{ generateText, Output, createGateway }, { nativeFetch }] =
        await Promise.all([loadAi(), import("@/lib/native-fetch")]);
      const gateway = createGateway({ apiKey, fetch: nativeFetch });

      const { output: genOutput } = await generateText({
        model: gateway("deepseek/deepseek-v4-flash" as ModelType),
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
            content: `Generate a JSON object with a "title" field for this note:\n\n${contentPreview}`,
          },
        ],
      });

      const title = genOutput.title;
      if (title?.trim()) {
        useJournalIndex.getState().updateTitle(pageId, title.trim());
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
