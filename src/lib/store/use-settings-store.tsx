import { createJSONStorage, persist } from "zustand/middleware";
import { settingsStorage } from "@/lib/store/settings/adapter";
import { create } from "zustand";

interface SettingsState {
  apiKey: string;
  chatSidebarOpen: boolean;
  notesSidebarOpen: boolean;

  setApiKey: (key: string) => void;
  setChatSidebarOpen: (open: boolean) => void;
  setNotesSidebarOpen: (open: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: "",
      chatSidebarOpen: false,
      notesSidebarOpen: false,
      setApiKey: (key: string) => set({ apiKey: key }),
      setChatSidebarOpen: (open: boolean) => set({ chatSidebarOpen: open }),
      setNotesSidebarOpen: (open: boolean) => set({ notesSidebarOpen: open }),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => settingsStorage),
    },
  ),
);
