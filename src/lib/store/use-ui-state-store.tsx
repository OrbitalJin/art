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
}

interface SettingsState {
  chatState: ChatState;
  journalState: JournalState;
  settingsDialogOpen: boolean;
  changelogDialogOpen: boolean;
  setChatState: (state: ChatState) => void;
  setJournalState: (state: JournalState) => void;
  setSettingsDialogOpen: (open: boolean) => void;
  setChangelogDialogOpen: (open: boolean) => void;
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
        todayOpen: true,
        yesterdayOpen: true,
        last7DaysOpen: true,
        olderOpen: true,
      },
      settingsDialogOpen: false,
      changelogDialogOpen: false,
      setChatState: (state: ChatState) => set({ chatState: state }),
      setJournalState: (state: JournalState) => set({ journalState: state }),
      setSettingsDialogOpen: (open: boolean) =>
        set({ settingsDialogOpen: open }),
      setChangelogDialogOpen: (open: boolean) =>
        set({ changelogDialogOpen: open }),
    }),
    {
      name: "ui-state-storage",
      storage: createJSONStorage(() => settingsStorage),
    },
  ),
);
