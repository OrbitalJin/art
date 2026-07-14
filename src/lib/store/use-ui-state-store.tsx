import { createJSONStorage, persist } from "zustand/middleware";
import { settingsStorage } from "@/lib/store/settings/adapter";
import { create } from "zustand";
import type { CaptureFilter } from "./capture/types";

interface ChatState {
  sidebarOpen: boolean;
  pinnedOpen: boolean;
  sessionsOpen: boolean;
  archivedOpen: boolean;
  todayOpen: boolean;
  yesterdayOpen: boolean;
  last7DaysOpen: boolean;
  olderOpen: boolean;
}

interface JournalState {
  sidebarOpen: boolean;
  pinnedOpen: boolean;
  sessionsOpen: boolean;
  archivedOpen: boolean;
  zoomLevel: number;
}

interface CaptureState {
  dialogOpen: boolean;
  sidebarOpen: boolean;
  search: string;
  filter: CaptureFilter;
}

interface SettingsState {
  chatState: ChatState;
  journalState: JournalState;
  captureState: CaptureState;
  settingsDialogOpen: boolean;
  updateDialogOpen: boolean;
  setChatState: (partial: Partial<ChatState>) => void;
  setJournalState: (partial: Partial<JournalState>) => void;
  setCaptureState: (partial: Partial<CaptureState>) => void;
  setSettingsDialogOpen: (open: boolean) => void;
  setUpdateDialogOpen: (open: boolean) => void;
}

export const useUIStateStore = create<SettingsState>()(
  persist(
    (set) => ({
      chatState: {
        sidebarOpen: false,
        pinnedOpen: true,
        sessionsOpen: true,
        archivedOpen: false,
        todayOpen: true,
        yesterdayOpen: true,
        last7DaysOpen: true,
        olderOpen: true,
      },
      journalState: {
        sidebarOpen: false,
        pinnedOpen: true,
        sessionsOpen: true,
        archivedOpen: false,
        zoomLevel: 100,
      },
      captureState: {
        dialogOpen: false,
        sidebarOpen: false,
        search: "",
        filter: "all",
      },
      settingsDialogOpen: false,
      updateDialogOpen: false,
      setChatState: (partial: Partial<ChatState>) =>
        set((state) => ({ chatState: { ...state.chatState, ...partial } })),
      setJournalState: (partial: Partial<JournalState>) =>
        set((state) => ({ journalState: { ...state.journalState, ...partial } })),
      setCaptureState: (partial: Partial<CaptureState>) =>
        set((state) => ({
          captureState: { ...state.captureState, ...partial },
        })),
      setSettingsDialogOpen: (open: boolean) =>
        set({ settingsDialogOpen: open }),
      setUpdateDialogOpen: (open: boolean) => set({ updateDialogOpen: open }),
    }),
    {
      name: "ui-state-storage",
      version: 2,
      storage: createJSONStorage(() => settingsStorage),
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Partial<SettingsState>;
        if (version < 1) {
          if (state && !state.captureState) {
            state.captureState = {
              dialogOpen: false,
              sidebarOpen: false,
              search: "",
              filter: "all",
            };
          }
        }
        if (version < 2 && state?.captureState) {
          state.captureState = {
            ...state.captureState,
            sidebarOpen: state.captureState.sidebarOpen ?? false,
          };
        }
        return state as SettingsState;
      },
    },
  ),
);
