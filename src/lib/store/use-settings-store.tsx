import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { tauriStorageAdapter } from "@/lib/store/tauri-adapter";

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
      storage: createJSONStorage(() => tauriStorageAdapter),
    },
  ),
);
