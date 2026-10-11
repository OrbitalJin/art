import { createJSONStorage, persist } from "zustand/middleware";
import { settingsStorage } from "@/lib/store/settings/adapter";
import { create } from "zustand";
import type { ModelId } from "../ai/models";
import type { AccessMode } from "../ai/tools/registry";
import { DEFAULT_MODE, type ModeId } from "../ai/prompts/modes";
import { DEFAULT_TRANSCRIPT_PROVIDER_ID } from "../ai/tools/transcript/providers";

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
  composioApiKey: string;
  composioUserId: string;
  youtubeApiKey: string;
  transcriptProvider: string;
  fontSize: FontSize;
  cornerRadius: CornerRadius;
  defaultModel: ModelId;
  defaultAgentModel: ModelId;
  defaultMode: ModeId;
  defaultAccessMode: AccessMode;
  enterKeySends: boolean;
  reducedMotion: boolean;
  userProfile: UserProfile;
  agentProfile: AgentProfile;

  setApiKey: (key: string) => void;
  setComposioApiKey: (key: string) => void;
  setYoutubeApiKey: (key: string) => void;
  setTranscriptProvider: (id: string) => void;
  ensureComposioUserId: () => string;
  setFontSize: (size: FontSize) => void;
  setCornerRadius: (radius: CornerRadius) => void;
  setDefaultModel: (model: ModelId) => void;
  setDefaultAgentModel: (model: ModelId) => void;
  setDefaultMode: (mode: ModeId) => void;
  setDefaultAccessMode: (mode: AccessMode) => void;
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
  composioApiKey: "",
  composioUserId: "",
  youtubeApiKey: "",
  transcriptProvider: DEFAULT_TRANSCRIPT_PROVIDER_ID,
  fontSize: "medium" as FontSize,
  cornerRadius: "medium" as CornerRadius,
  defaultModel: "model-1" as ModelId,
  defaultAgentModel: "model-1" as ModelId,
  defaultMode: DEFAULT_MODE,
  defaultAccessMode: "confirm" as AccessMode,
  enterKeySends: true,
  reducedMotion: false,
  userProfile: DEFAULT_USER_PROFILE,
  agentProfile: DEFAULT_AGENT_PROFILE,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setApiKey: (key: string) => set({ apiKey: key }),
      setComposioApiKey: (key: string) => set({ composioApiKey: key }),
      setYoutubeApiKey: (key: string) => set({ youtubeApiKey: key }),
      setTranscriptProvider: (id: string) => set({ transcriptProvider: id }),
      ensureComposioUserId: () => {
        const existing = get().composioUserId;
        if (existing) return existing;
        const id = crypto.randomUUID();
        set({ composioUserId: id });
        return id;
      },
      setFontSize: (size: FontSize) => set({ fontSize: size }),
      setCornerRadius: (radius: CornerRadius) => set({ cornerRadius: radius }),
      setDefaultModel: (model: ModelId) => set({ defaultModel: model }),
      setDefaultAgentModel: (model: ModelId) => set({ defaultAgentModel: model }),
      setDefaultMode: (mode: ModeId) => set({ defaultMode: mode }),
      setDefaultAccessMode: (mode: AccessMode) =>
        set({ defaultAccessMode: mode }),
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
      version: 8,
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
            toolOptions?: {
              google_search?: boolean;
              url_context?: boolean;
              web_search?: boolean;
              fetch_url?: boolean;
            };
          };
          if (state) {
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
        if (version < 4) {
          const state = persistedState as { toolOptions?: unknown };
          if (state) delete state.toolOptions;
        }
        if (version < 5) {
          const state = persistedState as {
            defaultMode?: ModeId;
            defaultAccessMode?: AccessMode;
            defaultAgentModel?: ModelId;
          };
          if (state) {
            if (state.defaultMode === undefined) state.defaultMode = DEFAULT_MODE;
            if (state.defaultAccessMode === undefined)
              state.defaultAccessMode = "confirm";
            if (state.defaultAgentModel === undefined)
              state.defaultAgentModel = "model-1";
          }
        }
        if (version < 6) {
          const state = persistedState as {
            composioApiKey?: string;
            composioUserId?: string;
          };
          if (state) {
            if (state.composioApiKey === undefined) state.composioApiKey = "";
            if (state.composioUserId === undefined) state.composioUserId = "";
          }
        }
        if (version < 7) {
          const state = persistedState as {
            youtubeApiKey?: string;
            transcriptProvider?: string;
          };
          if (state) {
            if (state.youtubeApiKey === undefined) state.youtubeApiKey = "";
            if (state.transcriptProvider === undefined)
              state.transcriptProvider = DEFAULT_TRANSCRIPT_PROVIDER_ID;
          }
        }
        if (version < 8) {
          const state = persistedState as { searchApiKey?: string };
          if (state) delete state.searchApiKey;
        }
        return persistedState as SettingsState;
      },
    },
  ),
);
