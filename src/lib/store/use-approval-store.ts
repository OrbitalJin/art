import { create } from "zustand";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface PendingApproval {
  status: ApprovalStatus;
  toolName: string;
  input: unknown;
  requestedAt: number;
}

interface RequestApprovalArgs {
  toolCallId: string;
  toolName: string;
  input: unknown;
  abortSignal?: AbortSignal;
}

interface ApprovalState {
  pending: Record<string, PendingApproval>;
  requestApproval: (args: RequestApprovalArgs) => Promise<boolean>;
  resolve: (toolCallId: string, approved: boolean) => void;
  clear: () => void;
}

const resolvers = new Map<string, (approved: boolean) => void>();
const detachAbort = new Map<string, () => void>();
let requestSeq = 0;

export const useApprovalStore = create<ApprovalState>()((set) => ({
  pending: {},

  requestApproval: ({ toolCallId, toolName, input, abortSignal }) => {
    if (abortSignal?.aborted) return Promise.resolve(false);

    set((state) => ({
      pending: {
        ...state.pending,
        [toolCallId]: {
          status: "pending",
          toolName,
          input,
          requestedAt: ++requestSeq,
        },
      },
    }));

    return new Promise<boolean>((resolvePromise) => {
      const settle = (approved: boolean) => {
        detachAbort.get(toolCallId)?.();
        detachAbort.delete(toolCallId);
        resolvers.delete(toolCallId);
        resolvePromise(approved);
      };

      resolvers.set(toolCallId, settle);

      if (abortSignal) {
        const onAbort = () => {
          set((state) => {
            const current = state.pending[toolCallId];
            if (!current) return state;
            return {
              pending: {
                ...state.pending,
                [toolCallId]: { ...current, status: "rejected" },
              },
            };
          });
          settle(false);
        };
        abortSignal.addEventListener("abort", onAbort, { once: true });
        detachAbort.set(toolCallId, () =>
          abortSignal.removeEventListener("abort", onAbort),
        );
      }
    });
  },

  resolve: (toolCallId, approved) => {
    set((state) => {
      const current = state.pending[toolCallId];
      if (!current) return state;
      return {
        pending: {
          ...state.pending,
          [toolCallId]: {
            ...current,
            status: approved ? "approved" : "rejected",
          },
        },
      };
    });
    resolvers.get(toolCallId)?.(approved);
  },

  clear: () => {
    for (const [toolCallId, resolver] of [...resolvers]) {
      detachAbort.get(toolCallId)?.();
      detachAbort.delete(toolCallId);
      resolvers.delete(toolCallId);
      resolver(false);
    }
    set({ pending: {} });
  },
}));
