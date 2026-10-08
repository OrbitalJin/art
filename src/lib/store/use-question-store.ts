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
  sessionId: string;
  requestedAt: number;
}

interface RequestAnswersArgs {
  toolCallId: string;
  questions: AskUserQuestion[];
  sessionId: string;
  abortSignal?: AbortSignal;
}

interface QuestionState {
  pending: Record<string, PendingQuestion>;
  requestAnswers: (
    args: RequestAnswersArgs,
  ) => Promise<AskUserAnswer[] | null>;
  answer: (toolCallId: string, answers: AskUserAnswer[]) => void;
  skip: (toolCallId: string) => void;
  clear: (sessionId?: string) => void;
}

const resolvers = new Map<string, (answers: AskUserAnswer[] | null) => void>();
const detachAbort = new Map<string, () => void>();
let requestSeq = 0;

export const useQuestionStore = create<QuestionState>()((set, get) => ({
  pending: {},

  requestAnswers: ({ toolCallId, questions, sessionId, abortSignal }) => {
    if (abortSignal?.aborted) return Promise.resolve(null);

    set((state) => ({
      pending: {
        ...state.pending,
        [toolCallId]: {
          status: "pending",
          questions,
          sessionId,
          requestedAt: ++requestSeq,
        },
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

  clear: (sessionId) => {
    const pending = get().pending;
    for (const [toolCallId, entry] of Object.entries(pending)) {
      if (sessionId && entry.sessionId !== sessionId) continue;
      const resolver = resolvers.get(toolCallId);
      detachAbort.get(toolCallId)?.();
      detachAbort.delete(toolCallId);
      resolvers.delete(toolCallId);
      resolver?.(null);
    }
    set((state) => ({
      pending: sessionId
        ? Object.fromEntries(
            Object.entries(state.pending).filter(
              ([, entry]) => entry.sessionId !== sessionId,
            ),
          )
        : {},
    }));
  },
}));
