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
      return await llm?.gen(textkit.summarize(tone, instructions), text);
    },
  );

  const repharse = useLLMOperation(
    async (text: string, tone: string, instructions?: string) => {
      return await llm?.gen(textkit.rephrase(tone, instructions), text);
    },
  );

  const translation = useLLMOperation(
    async (text: string, targetLanguage: string) => {
      return await llm?.gen(textkit.translate(targetLanguage), text);
    },
  );

  const bullet = useLLMOperation(
    async (text: string, tone: string, instructions?: string) => {
      return await llm?.gen(textkit.bullet(tone, instructions), text);
    },
  );

  const organize = useLLMOperation(
    async (text: string, tone: string, instructions?: string) => {
      return await llm?.gen(textkit.organize(tone, instructions), text);
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
