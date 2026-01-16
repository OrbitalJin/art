import { useState, useCallback } from "react";
import { useLLM } from "@/contexts/llm-context";
import { textkit } from "@/lib/llm/prompts/text-kit";

function useLLMOperation<T extends string[]>(
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
  const { llm } = useLLM();

  const summary = useLLMOperation(
    async (text: string, tone: string, instructions?: string) => {
      return await llm?.gen(textkit.summarize(text, tone, instructions));
    },
  );

  const repharse = useLLMOperation(
    async (text: string, tone: string, instructions?: string) => {
      return await llm?.gen(textkit.rephrase(text, tone, instructions));
    },
  );

  const translation = useLLMOperation(
    async (text: string, targetLanguage: string) => {
      return await llm?.gen(textkit.translate(text, targetLanguage));
    },
  );

  const bullet = useLLMOperation(
    async (text: string, tone: string, instructions?: string) => {
      return await llm?.gen(textkit.bullet(text, tone, instructions));
    },
  );

  const organize = useLLMOperation(
    async (text: string, tone: string, instructions?: string) => {
      return await llm?.gen(textkit.organize(text, tone, instructions));
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
