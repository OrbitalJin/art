import { createJSONStorage, persist } from "zustand/middleware";
import { settingsStorage } from "@/lib/store/settings/adapter";
import { create } from "zustand";

interface SettingsState {
  apiKey: string;
  setApiKey: (key: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: "",

      setApiKey: (key: string) => set({ apiKey: key }),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => settingsStorage),
    },
  ),
);
