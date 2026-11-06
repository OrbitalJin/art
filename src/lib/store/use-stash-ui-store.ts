import { create } from "zustand";
import { useStashStore, type StashEntry } from "./use-stash-store";

interface StashForm {
  open: boolean;
  entry: StashEntry | null;
  initialContent: string;
  initialTitle: string;
  /** Bumped on every open so the form remounts with fresh fields. */
  key: number;
}

interface StashTemplate {
  open: boolean;
  entry: StashEntry | null;
}

interface StashUiState {
  form: StashForm;
  template: StashTemplate;
  pendingDelete: StashEntry | null;

  openCreate: (opts?: { initialContent?: string; initialTitle?: string }) => void;
  openEdit: (entry: StashEntry) => void;
  closeForm: () => void;

  openTemplate: (entry: StashEntry) => void;
  closeTemplate: () => void;

  requestDelete: (entry: StashEntry) => void;
  cancelDelete: () => void;
  confirmDelete: () => void;
}

const emptyForm: StashForm = {
  open: false,
  entry: null,
  initialContent: "",
  initialTitle: "",
  key: 0,
};

/**
 * Transient UI intents for the stash. Kept out of the persisted stash store so
 * the inline "@" picker, the toolbar save button, and the dialogs can all agree
 * on what is open without prop drilling.
 */
export const useStashUiStore = create<StashUiState>()((set) => ({
  form: emptyForm,
  template: { open: false, entry: null },
  pendingDelete: null,

  openCreate: (opts) =>
    set((state) => ({
      form: {
        open: true,
        entry: null,
        initialContent: opts?.initialContent ?? "",
        initialTitle: opts?.initialTitle ?? "",
        key: state.form.key + 1,
      },
    })),

  openEdit: (entry) =>
    set((state) => ({
      form: {
        open: true,
        entry,
        initialContent: entry.content,
        initialTitle: entry.title,
        key: state.form.key + 1,
      },
    })),

  closeForm: () => set((state) => ({ form: { ...state.form, open: false } })),

  openTemplate: (entry) => set({ template: { open: true, entry } }),
  closeTemplate: () => set({ template: { open: false, entry: null } }),

  requestDelete: (entry) => set({ pendingDelete: entry }),
  cancelDelete: () => set({ pendingDelete: null }),
  confirmDelete: () =>
    set((state) => {
      if (state.pendingDelete) {
        useStashStore.getState().removeEntry(state.pendingDelete.id);
      }
      return { pendingDelete: null };
    }),
}));
