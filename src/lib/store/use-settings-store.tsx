import { createJSONStorage, persist } from "zustand/middleware";
import { settingsStorage } from "@/lib/store/settings/adapter";
import { create } from "zustand";

export type FontSize = "small" | "medium" | "large";
export type CornerRadius = "none" | "small" | "medium" | "large";

interface SettingsState {
  apiKey: string;
  fontSize: FontSize;
  cornerRadius: CornerRadius;
  defaultModel: string;
  enterKeySends: boolean;
  reducedMotion: boolean;

  setApiKey: (key: string) => void;
  setFontSize: (size: FontSize) => void;
  setCornerRadius: (radius: CornerRadius) => void;
  setDefaultModel: (model: string) => void;
  setEnterKeySends: (value: boolean) => void;
  setReducedMotion: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: "",
      fontSize: "medium",
      cornerRadius: "medium",
      defaultModel: "Genesis",
      enterKeySends: true,
      reducedMotion: false,
      setApiKey: (key: string) => set({ apiKey: key }),
      setFontSize: (size: FontSize) => set({ fontSize: size }),
      setCornerRadius: (radius: CornerRadius) => set({ cornerRadius: radius }),
      setDefaultModel: (model: string) => set({ defaultModel: model }),
      setEnterKeySends: (value: boolean) => set({ enterKeySends: value }),
      setReducedMotion: (value: boolean) => set({ reducedMotion: value }),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => settingsStorage),
    },
  ),
);
