import { create } from "zustand";

export interface AskUserOption {
  label: string;
  description?: string;
}

export interface AskUserQuestion {
  header: string;
  question: string;
  options?: AskUserOption[];
  multiple?: boolean;
}

export interface AskUserAnswer {
  question: string;
  selected: string[];
  custom?: string;
}

export type QuestionStatus = "pending" | "answered" | "skipped";

export interface PendingQuestion {
  status: QuestionStatus;
  questions: AskUserQuestion[];
}

interface RequestAnswersArgs {
  toolCallId: string;
  questions: AskUserQuestion[];
  abortSignal?: AbortSignal;
}

interface QuestionState {
  pending: Record<string, PendingQuestion>;
  requestAnswers: (
    args: RequestAnswersArgs,
  ) => Promise<AskUserAnswer[] | null>;
  answer: (toolCallId: string, answers: AskUserAnswer[]) => void;
  skip: (toolCallId: string) => void;
  clear: () => void;
}

const resolvers = new Map<string, (answers: AskUserAnswer[] | null) => void>();
const detachAbort = new Map<string, () => void>();

export const useQuestionStore = create<QuestionState>()((set) => ({
  pending: {},

  requestAnswers: ({ toolCallId, questions, abortSignal }) => {
    if (abortSignal?.aborted) return Promise.resolve(null);

    set((state) => ({
      pending: {
        ...state.pending,
        [toolCallId]: { status: "pending", questions },
      },
    }));

    return new Promise<AskUserAnswer[] | null>((resolvePromise) => {
      const settle = (answers: AskUserAnswer[] | null) => {
        detachAbort.get(toolCallId)?.();
        detachAbort.delete(toolCallId);
        resolvers.delete(toolCallId);
        resolvePromise(answers);
      };

      resolvers.set(toolCallId, settle);

      if (abortSignal) {
        const onAbort = () => {
          set((state) => {
            if (!(toolCallId in state.pending)) return state;
            return {
              pending: {
                ...state.pending,
                [toolCallId]: {
                  ...state.pending[toolCallId],
                  status: "skipped",
                },
              },
            };
          });
          settle(null);
        };
        abortSignal.addEventListener("abort", onAbort, { once: true });
        detachAbort.set(toolCallId, () =>
          abortSignal.removeEventListener("abort", onAbort),
        );
      }
    });
  },

  answer: (toolCallId, answers) => {
    set((state) => {
      if (!(toolCallId in state.pending)) return state;
      return {
        pending: {
          ...state.pending,
          [toolCallId]: {
            ...state.pending[toolCallId],
            status: "answered" as const,
          },
        },
      };
    });
    resolvers.get(toolCallId)?.(answers);
  },

  skip: (toolCallId) => {
    set((state) => {
      if (!(toolCallId in state.pending)) return state;
      return {
        pending: {
          ...state.pending,
          [toolCallId]: {
            ...state.pending[toolCallId],
            status: "skipped" as const,
          },
        },
      };
    });
    resolvers.get(toolCallId)?.(null);
  },

  clear: () => {
    for (const [toolCallId, resolver] of [...resolvers]) {
      detachAbort.get(toolCallId)?.();
      detachAbort.delete(toolCallId);
      resolvers.delete(toolCallId);
      resolver(null);
    }
    set({ pending: {} });
  },
}));
