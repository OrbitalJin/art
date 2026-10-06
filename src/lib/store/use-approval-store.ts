import { create } from "zustand";

export type ApprovalStatus = "pending" | "approved" | "rejected";

interface RequestApprovalArgs {
  toolCallId: string;
  abortSignal?: AbortSignal;
}

interface ApprovalState {
  pending: Record<string, ApprovalStatus>;
  requestApproval: (args: RequestApprovalArgs) => Promise<boolean>;
  resolve: (toolCallId: string, approved: boolean) => void;
  clear: () => void;
}

const resolvers = new Map<string, (approved: boolean) => void>();
const detachAbort = new Map<string, () => void>();

export const useApprovalStore = create<ApprovalState>()((set) => ({
  pending: {},

  requestApproval: ({ toolCallId, abortSignal }) => {
    if (abortSignal?.aborted) return Promise.resolve(false);

    set((state) => ({
      pending: { ...state.pending, [toolCallId]: "pending" },
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
            if (!(toolCallId in state.pending)) return state;
            return {
              pending: { ...state.pending, [toolCallId]: "rejected" },
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
      if (!(toolCallId in state.pending)) return state;
      return {
        pending: {
          ...state.pending,
          [toolCallId]: approved ? "approved" : "rejected",
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
