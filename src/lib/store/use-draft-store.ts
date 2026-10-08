import { create } from "zustand";
import type { MessageAttachment } from "@/lib/store/session/types";

export interface Draft {
  prompt: string;
  attachments: MessageAttachment[];
}

const EMPTY_DRAFT: Draft = { prompt: "", attachments: [] };

interface DraftState {
  drafts: Record<string, Draft>;
  setPrompt: (sessionId: string, value: string) => void;
  addAttachment: (sessionId: string, attachment: MessageAttachment) => void;
  removeAttachment: (sessionId: string, index: number) => void;
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

export const useDraftStore = create<DraftState>()((set) => ({
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

  removeAttachment: (sessionId, index) =>
    set((state) => {
      const current = state.drafts[sessionId] ?? EMPTY_DRAFT;
      return patch(state, sessionId, {
        attachments: current.attachments.filter((_, i) => i !== index),
      });
    }),

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