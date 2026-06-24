import { createJSONStorage, persist } from "zustand/middleware";
import { settingsStorage } from "@/lib/store/settings/adapter";
import { create } from "zustand";
import type { ModelId } from "../ai/models";

export type FontSize = "small" | "medium" | "large";
export type CornerRadius = "none" | "small" | "medium" | "large";

export interface ToolOptions {
  showCalls: boolean;
  // Search (Exa)
  web_search: boolean;
  fetch_url: boolean;
  // Custom
  journal: boolean;
  tasks: boolean;
  audio: boolean;
}

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
  searchApiKey: string;
  fontSize: FontSize;
  cornerRadius: CornerRadius;
  defaultModel: ModelId;
  enterKeySends: boolean;
  reducedMotion: boolean;
  userProfile: UserProfile;
  agentProfile: AgentProfile;
  toolOptions: ToolOptions;

  setApiKey: (key: string) => void;
  setSearchApiKey: (key: string) => void;
  setFontSize: (size: FontSize) => void;
  setCornerRadius: (radius: CornerRadius) => void;
  setDefaultModel: (model: ModelId) => void;
  setEnterKeySends: (value: boolean) => void;
  setReducedMotion: (value: boolean) => void;
  setToolOptions: (options: Partial<ToolOptions>) => void;
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

const DEFAULT_TOOL_OPTIONS: ToolOptions = {
  showCalls: true,
  web_search: true,
  fetch_url: true,
  journal: false,
  tasks: false,
  audio: false,
};

const initialState = {
  apiKey: "",
  searchApiKey: "",
  fontSize: "medium" as FontSize,
  cornerRadius: "medium" as CornerRadius,
  defaultModel: "model-1" as ModelId,
  enterKeySends: true,
  reducedMotion: false,
  userProfile: DEFAULT_USER_PROFILE,
  agentProfile: DEFAULT_AGENT_PROFILE,
  toolOptions: DEFAULT_TOOL_OPTIONS,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...initialState,
      setApiKey: (key: string) => set({ apiKey: key }),
      setSearchApiKey: (key: string) => set({ searchApiKey: key }),
      setFontSize: (size: FontSize) => set({ fontSize: size }),
      setCornerRadius: (radius: CornerRadius) => set({ cornerRadius: radius }),
      setDefaultModel: (model: ModelId) => set({ defaultModel: model }),
      setEnterKeySends: (value: boolean) => set({ enterKeySends: value }),
      setReducedMotion: (value: boolean) => set({ reducedMotion: value }),
      setToolOptions: (options: Partial<ToolOptions>) =>
        set((state) => ({
          toolOptions: { ...state.toolOptions, ...options },
        })),
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
      version: 3,
      storage: createJSONStorage(() => settingsStorage),
      migrate: (persistedState: unknown, version: number) => {
        if (version < 2) {
          const state = persistedState as { defaultModel: ModelId };
          if (state) {
            state.defaultModel =
              state.defaultModel in ["model-1", "model-2", "model-3"]
                ? (state.defaultModel as ModelId)
                : "model-1";
          }
        }
        if (version < 3) {
          const state = persistedState as {
            searchApiKey?: string;
            toolOptions?: {
              google_search?: boolean;
              url_context?: boolean;
              web_search?: boolean;
              fetch_url?: boolean;
            };
          };
          if (state) {
            if (state.searchApiKey === undefined) state.searchApiKey = "";
            if (state.toolOptions) {
              const { google_search, url_context, ...rest } = state.toolOptions;
              void google_search;
              void url_context;
              state.toolOptions = {
                ...rest,
                web_search: rest.web_search ?? true,
                fetch_url: rest.fetch_url ?? true,
              };
            }
          }
        }
        return persistedState as SettingsState;
      },
    },
  ),
);
