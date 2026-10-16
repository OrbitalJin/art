import { create } from "zustand";
import type { ChatAttachment } from "@/lib/store/session/types";

export interface Draft {
  prompt: string;
  attachments: ChatAttachment[];
}

const EMPTY_DRAFT: Draft = { prompt: "", attachments: [] };

interface DraftState {
  drafts: Record<string, Draft>;
  setPrompt: (sessionId: string, value: string) => void;
  addAttachment: (sessionId: string, attachment: ChatAttachment) => void;
  updateAttachment: (
    sessionId: string,
    id: string,
    patch: Partial<ChatAttachment>,
  ) => void;
  removeAttachment: (
    sessionId: string,
    id: string,
  ) => ChatAttachment | undefined;
  clearAttachments: (sessionId: string) => void;
  clear: (sessionId: string) => void;
  clearAll: () => void;
}

const patch = (state: DraftState, sessionId: string, next: Partial<Draft>) => ({
  drafts: {
    ...state.drafts,
    [sessionId]: { ...(state.drafts[sessionId] ?? EMPTY_DRAFT), ...next },
  },
});

export const useDraftStore = create<DraftState>()((set, get) => ({
  drafts: {},

  setPrompt: (sessionId, value) =>
    set((state) => patch(state, sessionId, { prompt: value })),

  addAttachment: (sessionId, attachment) =>
    set((state) => {
      const current = state.drafts[sessionId] ?? EMPTY_DRAFT;
      return patch(state, sessionId, {
        attachments: [...current.attachments, attachment],
      });
    }),

  updateAttachment: (sessionId, id, attachmentPatch) =>
    set((state) => {
      const current = state.drafts[sessionId] ?? EMPTY_DRAFT;
      return patch(state, sessionId, {
        attachments: current.attachments.map((attachment) =>
          attachment.id === id
            ? { ...attachment, ...attachmentPatch }
            : attachment,
        ),
      });
    }),

  removeAttachment: (sessionId, id) => {
    const current = get().drafts[sessionId] ?? EMPTY_DRAFT;
    const removed = current.attachments.find((a) => a.id === id);
    set((state) => ({
      drafts: {
        ...state.drafts,
        [sessionId]: {
          ...current,
          attachments: current.attachments.filter((a) => a.id !== id),
        },
      },
    }));
    return removed;
  },

  clearAttachments: (sessionId) =>
    set((state) => patch(state, sessionId, { attachments: [] })),

  clear: (sessionId) =>
    set((state) => {
      if (!(sessionId in state.drafts)) return state;
      const drafts = { ...state.drafts };
      delete drafts[sessionId];
      return { drafts };
    }),

  clearAll: () => set({ drafts: {} }),
}));

export const useDraft = (sessionId: string | null): Draft =>
  useDraftStore((state) =>
    sessionId ? state.drafts[sessionId] : undefined,
  ) ?? EMPTY_DRAFT;
