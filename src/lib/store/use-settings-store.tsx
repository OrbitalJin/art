import { createJSONStorage, persist } from "zustand/middleware";
import { settingsStorage } from "@/lib/store/settings/adapter";
import { create } from "zustand";
import type { ModelId } from "../ai/models";
import type { AccessMode } from "./session/types";
import { DEFAULT_PERSONA, type PersonaId } from "../ai/prompts/personas";

export type FontSize = "small" | "medium" | "large";
export type CornerRadius = "none" | "small" | "medium" | "large";

export type KeyType = "gateway" | "composio";

export const KEY_LABELS: Record<KeyType, string> = {
  gateway: "Gateway",
  composio: "Connections",
};

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
  fontSize: FontSize;
  cornerRadius: CornerRadius;
  defaultModel: ModelId;
  defaultAgentModel: ModelId;
  defaultPersona: PersonaId;
  defaultAccessMode: AccessMode;
  enterKeySends: boolean;
  reducedMotion: boolean;
  userProfile: UserProfile;
  agentProfile: AgentProfile;

  setApiKey: (key: string) => void;
  setComposioApiKey: (key: string) => void;
  ensureComposioUserId: () => string;
  setFontSize: (size: FontSize) => void;
  setCornerRadius: (radius: CornerRadius) => void;
  setDefaultModel: (model: ModelId) => void;
  setDefaultAgentModel: (model: ModelId) => void;
  setDefaultPersona: (persona: PersonaId) => void;
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
  fontSize: "medium" as FontSize,
  cornerRadius: "medium" as CornerRadius,
  defaultModel: "model-1" as ModelId,
  defaultAgentModel: "model-1" as ModelId,
  defaultPersona: DEFAULT_PERSONA,
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
      setDefaultPersona: (persona: PersonaId) =>
        set({ defaultPersona: persona }),
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
      version: 11,
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
            defaultPersona?: PersonaId;
            defaultAccessMode?: AccessMode;
            defaultAgentModel?: ModelId;
          };
          if (state) {
            if (state.defaultPersona === undefined)
              state.defaultPersona = DEFAULT_PERSONA;
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
        if (version < 8) {
          const state = persistedState as { searchApiKey?: string };
          if (state) delete state.searchApiKey;
        }
        if (version < 9) {
          const state = persistedState as {
            defaultMode?: PersonaId;
            defaultPersona?: PersonaId;
          };
          if (state) {
            state.defaultPersona =
              state.defaultPersona ?? state.defaultMode ?? DEFAULT_PERSONA;
            delete state.defaultMode;
          }
        }
        if (version < 10) {
          const state = persistedState as { transcriptProvider?: string };
          if (state) delete state.transcriptProvider;
        }
        if (version < 11) {
          const state = persistedState as { youtubeApiKey?: string };
          if (state) delete state.youtubeApiKey;
        }
        return persistedState as SettingsState;
      },
    },
  ),
);

export const useHasKey = (type?: KeyType): boolean =>
  useSettingsStore((state) =>
    type === "gateway"
      ? state.apiKey.length > 0
      : type === "composio"
        ? state.composioApiKey.length > 0
        : true,
  );
