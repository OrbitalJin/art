import { useState, useCallback } from "react";
import { useAI } from "@/contexts/ai-context";
import { prompts } from "@/lib/ai/common/prompts";

function useAIOperation<T extends string[]>(
  operation: (...args: T) => Promise<string | undefined>,
) {
  const [generating, setGenerating] = useState(false);

  const execute = useCallback(
    async (...args: T): Promise<string> => {
      try {
        setGenerating(true);
        const result = await operation(...args);
        return result || "";
      } finally {
        setGenerating(false);
      }
    },
    [operation],
  );

  return { execute, generating };
}

export const useTextActions = () => {
  const { ai } = useAI();

  const summary = useAIOperation(
    async (text: string, tone: string, instructions?: string) => {
      return await ai?.gen(prompts.textkit.summarize(text, tone, instructions));
    },
  );

  const repharse = useAIOperation(
    async (text: string, tone: string, instructions?: string) => {
      return await ai?.gen(prompts.textkit.rephrase(text, tone, instructions));
    },
  );

  const translation = useAIOperation(
    async (text: string, targetLanguage: string) => {
      return await ai?.gen(prompts.textkit.translate(text, targetLanguage));
    },
  );

  const bullet = useAIOperation(
    async (text: string, tone: string, instructions?: string) => {
      return await ai?.gen(prompts.textkit.bullet(text, tone, instructions));
    },
  );

  const organize = useAIOperation(
    async (text: string, tone: string, instructions?: string) => {
      return await ai?.gen(prompts.textkit.organize(text, tone, instructions));
    },
  );

  return {
    summarize: summary,
    translate: translation,
    repharse: repharse,
    bullet: bullet,
    organize,
    isBusy: summary.generating || translation.generating,
  };
};
