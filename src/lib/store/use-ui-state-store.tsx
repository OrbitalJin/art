import { createJSONStorage, persist } from "zustand/middleware";
import { settingsStorage } from "@/lib/store/settings/adapter";
import { create } from "zustand";

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

interface SettingsState {
  chatState: ChatState;
  journalState: JournalState;
  settingsDialogOpen: boolean;
  updateDialogOpen: boolean;
  setChatState: (partial: Partial<ChatState>) => void;
  setJournalState: (partial: Partial<JournalState>) => void;
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
      settingsDialogOpen: false,
      updateDialogOpen: false,
      setChatState: (partial: Partial<ChatState>) =>
        set((state) => ({ chatState: { ...state.chatState, ...partial } })),
      setJournalState: (partial: Partial<JournalState>) =>
        set((state) => ({ journalState: { ...state.journalState, ...partial } })),
      setSettingsDialogOpen: (open: boolean) =>
        set({ settingsDialogOpen: open }),
      setUpdateDialogOpen: (open: boolean) => set({ updateDialogOpen: open }),
    }),
    {
      name: "ui-state-storage",
      storage: createJSONStorage(() => settingsStorage),
    },
  ),
);
