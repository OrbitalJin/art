import { createJSONStorage, persist } from "zustand/middleware";
import { settingsStorage } from "@/lib/store/settings/adapter";
import { create } from "zustand";

export type FontSize = "small" | "medium" | "large";
export type CornerRadius = "none" | "small" | "medium" | "large";

interface SettingsState {
  apiKey: string;
  chatSidebarOpen: boolean;
  notesSidebarOpen: boolean;
  settingsDialogOpen: boolean;
  fontSize: FontSize;
  cornerRadius: CornerRadius;
  defaultModel: string;
  enterKeySends: boolean;
  reducedMotion: boolean;
  compactMode: boolean;

  setApiKey: (key: string) => void;
  setChatSidebarOpen: (open: boolean) => void;
  setNotesSidebarOpen: (open: boolean) => void;
  setSettingsDialogOpen: (open: boolean) => void;
  setFontSize: (size: FontSize) => void;
  setCornerRadius: (radius: CornerRadius) => void;
  setDefaultModel: (model: string) => void;
  setEnterKeySends: (value: boolean) => void;
  setReducedMotion: (value: boolean) => void;
  setCompactMode: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: "",
      chatSidebarOpen: false,
      notesSidebarOpen: false,
      settingsDialogOpen: false,
      fontSize: "medium",
      cornerRadius: "medium",
      defaultModel: "Genesis",
      enterKeySends: true,
      reducedMotion: false,
      compactMode: false,
      setApiKey: (key: string) => set({ apiKey: key }),
      setChatSidebarOpen: (open: boolean) => set({ chatSidebarOpen: open }),
      setNotesSidebarOpen: (open: boolean) => set({ notesSidebarOpen: open }),
      setSettingsDialogOpen: (open: boolean) =>
        set({ settingsDialogOpen: open }),
      setFontSize: (size: FontSize) => set({ fontSize: size }),
      setCornerRadius: (radius: CornerRadius) => set({ cornerRadius: radius }),
      setDefaultModel: (model: string) => set({ defaultModel: model }),
      setEnterKeySends: (value: boolean) => set({ enterKeySends: value }),
      setReducedMotion: (value: boolean) => set({ reducedMotion: value }),
      setCompactMode: (value: boolean) => set({ compactMode: value }),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => settingsStorage),
    },
  ),
);
