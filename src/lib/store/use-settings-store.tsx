import { createJSONStorage, persist } from "zustand/middleware";
import { settingsStorage } from "@/lib/store/settings/adapter";
import { create } from "zustand";
import type { ModelId } from "../llm/common/types";

export type FontSize = "small" | "medium" | "large";
export type CornerRadius = "none" | "small" | "medium" | "large";

export interface UserProfile {
  name: string;
  occupation: string;
  languages: string;
  goals: string;
  about: string;
}

export interface AgentProfile {
  personality: string;
  communicationStyle: string;
  background: string;
  quirks: string;
}

interface SettingsState {
  apiKey: string;
  fontSize: FontSize;
  cornerRadius: CornerRadius;
  defaultModel: ModelId;
  enterKeySends: boolean;
  reducedMotion: boolean;
  userProfile: UserProfile;
  agentProfile: AgentProfile;

  setApiKey: (key: string) => void;
  setFontSize: (size: FontSize) => void;
  setCornerRadius: (radius: CornerRadius) => void;
  setDefaultModel: (model: ModelId) => void;
  setEnterKeySends: (value: boolean) => void;
  setReducedMotion: (value: boolean) => void;
  setUserProfile: (profile: Partial<UserProfile>) => void;
  setAgentProfile: (profile: Partial<AgentProfile>) => void;
  resetSettings: () => void;
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: "Cath",
  occupation: "Senior marketing student",
  languages: "English, Japanese",
  goals: "Productivity, skill acquisition & self-improvement",
  about: "Cute things, food, games, drawing & repetitive tasks.",
};

export const DEFAULT_AGENT_PROFILE: AgentProfile = {
  personality:
    "Natural, efficient, emotionally intelligent. Like a smart, organized friend.",
  communicationStyle:
    "Use rare, soft emojis (🐇, ✨, 🌸, 🌼, etc) sparingly for mood.",
  background:
    "An adaptive assistant designed for thoughtful conversation and task assistance.",
  quirks: "Silly, but wise.",
};

const initialState = {
  apiKey: "",
  fontSize: "medium" as FontSize,
  cornerRadius: "medium" as CornerRadius,
  defaultModel: "model-1" as ModelId,
  enterKeySends: true,
  reducedMotion: false,
  userProfile: DEFAULT_USER_PROFILE,
  agentProfile: DEFAULT_AGENT_PROFILE,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...initialState,
      setApiKey: (key: string) => set({ apiKey: key }),
      setFontSize: (size: FontSize) => set({ fontSize: size }),
      setCornerRadius: (radius: CornerRadius) => set({ cornerRadius: radius }),
      setDefaultModel: (model: ModelId) => set({ defaultModel: model }),
      setEnterKeySends: (value: boolean) => set({ enterKeySends: value }),
      setReducedMotion: (value: boolean) => set({ reducedMotion: value }),
      setUserProfile: (profile: Partial<UserProfile>) =>
        set((state) => ({
          userProfile: { ...state.userProfile, ...profile },
        })),
      setAgentProfile: (profile: Partial<AgentProfile>) =>
        set((state) => ({
          agentProfile: { ...state.agentProfile, ...profile },
        })),
      resetSettings: () => set(initialState),
    }),
    {
      name: "settings-storage",
      version: 2,
      storage: createJSONStorage(() => settingsStorage),
      migrate: (persistedState: unknown, version: number) => {
        if (version < 2) {
          const state = persistedState as { defaultModel: ModelId };
          if (state) {
            state.defaultModel =
              state.defaultModel in ["model-1", "model-2", "model-3"]
                ? (state.defaultModel as ModelId)
                : "model-1";
            return state;
          }
        }
        return persistedState as SettingsState;
      },
    },
  ),
);
