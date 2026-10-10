import { tool } from "ai";
import { z } from "zod";
import { useQuestionStore } from "@/lib/store/use-question-store";

export const ASK_USER_TOOL_NAME = "ask_user";

export class QuestionCancelledError extends Error {
  constructor() {
    super("Question cancelled");
    this.name = "QuestionCancelledError";
  }
}

const optionSchema = z.object({
  label: z.string().describe("Display text for the option."),
  description: z
    .string()
    .optional()
    .describe("Short explanation of what this option means."),
});

const questionSchema = z.object({
  header: z
    .string()
    .describe("Very short label for the question (max ~12 characters)."),
  question: z.string().describe("The full question to ask the user."),
  options: z
    .array(optionSchema)
    .min(2)
    .max(3)
    .describe(
      "Multiple-choice options. Users can always type their own answer.",
    ),
  multiple: z
    .boolean()
    .optional()
    .describe("Allow selecting more than one option. Defaults to false."),
});

export const askUserTools = (sessionId: string) => ({
  [ASK_USER_TOOL_NAME]: tool({
    title: "Ask User",
    description:
      "Ask the user one or more multiple-choice questions when requirements " +
      "are ambiguous or a decision is needed. Prefer this over guessing. " +
      "The user may also type a custom answer. Returns their selections.",
    inputSchema: z.object({
      questions: z.array(questionSchema).min(1).max(5),
    }),
    execute: async ({ questions }, { toolCallId, abortSignal }) => {
      const answers = await useQuestionStore.getState().requestAnswers({
        toolCallId,
        questions,
        sessionId,
        abortSignal,
      });

      if (abortSignal?.aborted) throw new QuestionCancelledError();
      if (!answers) return { skipped: true, answers: [] };

      return { skipped: false, answers };
    },
  }),
});

export type AskUserToolName = keyof ReturnType<typeof askUserTools>;
