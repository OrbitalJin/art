import { useCallback, useState } from "react";
import { useLLM } from "@/contexts/llm-context";
import { gen } from "@/lib/llm/prompts/gen";

function useLLMOperation<T extends readonly unknown[]>(
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

export const useTutorActions = () => {
  const { llm } = useLLM();

  const generateQuiz = useLLMOperation(
    async (
      topic: string,
      context: string,
      difficulty?: "beginner" | "intermediate" | "advanced",
      type?: "multiple_choice" | "short_answer" | "coding" | "fill_blank",
    ) => {
      return await llm?.gen(
        gen.quiz.generate(topic, context, difficulty, type),
      );
    },
  );

  const evaluateAnswer = useLLMOperation(
    async (question: string, userAnswer: string, correctAnswer: string) => {
      return await llm?.gen(
        gen.quiz.evaluate(question, userAnswer, correctAnswer),
      );
    },
  );

  const assessProgress = useLLMOperation(
    async (topic: string, interactionHistory: string) => {
      return await llm?.gen(gen.quiz.progressCheck(topic, interactionHistory));
    },
  );

  const generateAdaptiveQuiz = useLLMOperation(
    async (userProgress: string, difficultyLevel: string) => {
      return await llm?.gen(gen.quiz.adaptive(userProgress, difficultyLevel));
    },
  );

  return {
    generateQuiz: {
      execute: generateQuiz.execute,
      generating: generateQuiz.generating,
    },
    evaluateAnswer: {
      execute: evaluateAnswer.execute,
      generating: evaluateAnswer.generating,
    },
    assessProgress: {
      execute: assessProgress.execute,
      generating: assessProgress.generating,
    },
    generateAdaptiveQuiz: {
      execute: generateAdaptiveQuiz.execute,
      generating: generateAdaptiveQuiz.generating,
    },
    isBusy:
      generateQuiz.generating ||
      evaluateAnswer.generating ||
      assessProgress.generating ||
      generateAdaptiveQuiz.generating,
  };
};
