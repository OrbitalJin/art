import { useState, useCallback } from "react";
import { useAI } from "@/contexts/ai-context";
import { prompts } from "@/lib/ai/common/prompts";

// 1. The Generic Hook
// T is an array of arguments the AI function needs (e.g., [string, string?])
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

// 2. The Text Kit Hook
export const useTextKit = () => {
  const { ai } = useAI();

  // Define Summarize
  const summary = useAIOperation(
    async (text: string, tone: string, instructions?: string) => {
      return await ai?.gen(prompts.textkit.summarize(text, tone, instructions));
    },
  );

  // Define Translate
  const repharse = useAIOperation(
    async (text: string, tone: string, instructions?: string) => {
      return await ai?.gen(prompts.textkit.rephrase(text, tone, instructions));
    },
  );

  // Define Translate
  const translation = useAIOperation(
    async (text: string, targetLanguage: string) => {
      return await ai?.gen(prompts.textkit.translate(text, targetLanguage));
    },
  );

  return {
    summarize: summary,
    translate: translation,
    repharse: repharse,
    isBusy: summary.generating || translation.generating,
  };
};
