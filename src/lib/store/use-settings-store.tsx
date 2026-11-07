import { persist } from "zustand/middleware";
import { createSettingsStorage } from "@/lib/store/settings/adapter";
import { create } from "zustand";
import type { ModelId } from "../ai/models";
import type { AccessMode } from "./session/types";
import { DEFAULT_PERSONA, type PersonaId } from "../ai/prompts/personas";

export type FontSize = "small" | "medium" | "large";
export type CornerRadius = "none" | "small" | "medium" | "large";

export type KeyType = "gateway" | "exa" | "uploads" | "usda";

/** The key set resolved from a single art key via PocketBase. */
export interface ArtKeys {
  gateway: string;
  usda: string;
  exa: string;
}

/** Where the app sources its API keys from. */
export type KeySource = "art" | "own";

/** User-supplied keys, used when the key source is `"own"`. Persisted. */
export interface OwnKeys {
  gateway: string;
  exa: string;
  usda: string;
  /** PocketBase upload secret for attachments. */
  upload: string;
}

export type KeysStatus = "idle" | "loading" | "ready" | "error";

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
  keySource: KeySource;
  artKey: string;
  /** User-supplied keys, used when `keySource` is `"own"`; persisted. */
  ownKeys: OwnKeys;
  /** Resolved from the active source; never persisted. */
  keys: ArtKeys | null;
  keysStatus: KeysStatus;
  keysError: string | null;
  fontSize: FontSize;
  cornerRadius: CornerRadius;
  defaultModel: ModelId;
  defaultAgentModel: ModelId;
  defaultPersona: PersonaId;
  defaultAccessMode: AccessMode;
  enterKeySends: boolean;
  groupToolCalls: boolean;
  reducedMotion: boolean;
  userProfile: UserProfile;
  agentProfile: AgentProfile;

  setArtKey: (key: string) => void;
  setKeySource: (source: KeySource) => void;
  setOwnKey: (key: keyof OwnKeys, value: string) => void;
  setFontSize: (size: FontSize) => void;
  setCornerRadius: (radius: CornerRadius) => void;
  setDefaultModel: (model: ModelId) => void;
  setDefaultAgentModel: (model: ModelId) => void;
  setDefaultPersona: (persona: PersonaId) => void;
  setDefaultAccessMode: (mode: AccessMode) => void;
  setEnterKeySends: (value: boolean) => void;
  setGroupToolCalls: (value: boolean) => void;
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
  keySource: "art" as KeySource,
  artKey: "",
  ownKeys: {
    gateway: "",
    exa: "",
    usda: "",
    upload: "",
  } as OwnKeys,
  keys: null as ArtKeys | null,
  keysStatus: "idle" as KeysStatus,
  keysError: null as string | null,
  fontSize: "medium" as FontSize,
  cornerRadius: "medium" as CornerRadius,
  defaultModel: "model-1" as ModelId,
  defaultAgentModel: "model-1" as ModelId,
  defaultPersona: DEFAULT_PERSONA,
  defaultAccessMode: "confirm" as AccessMode,
  enterKeySends: true,
  groupToolCalls: false,
  reducedMotion: false,
  userProfile: DEFAULT_USER_PROFILE,
  agentProfile: DEFAULT_AGENT_PROFILE,
};

type PersistedSettings = Omit<
  typeof initialState,
  "keys" | "keysStatus" | "keysError"
>;

const partialize = (state: SettingsState): PersistedSettings => ({
  keySource: state.keySource,
  artKey: state.artKey,
  ownKeys: state.ownKeys,
  fontSize: state.fontSize,
  cornerRadius: state.cornerRadius,
  defaultModel: state.defaultModel,
  defaultAgentModel: state.defaultAgentModel,
  defaultPersona: state.defaultPersona,
  defaultAccessMode: state.defaultAccessMode,
  enterKeySends: state.enterKeySends,
  groupToolCalls: state.groupToolCalls,
  reducedMotion: state.reducedMotion,
  userProfile: state.userProfile,
  agentProfile: state.agentProfile,
});

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...initialState,
      setArtKey: (key: string) => set({ artKey: key }),
      setKeySource: (source: KeySource) =>
        set({ keySource: source, keysError: null }),
      setOwnKey: (key: keyof OwnKeys, value: string) =>
        set((state) => ({ ownKeys: { ...state.ownKeys, [key]: value } })),
      setFontSize: (size: FontSize) => set({ fontSize: size }),
      setCornerRadius: (radius: CornerRadius) => set({ cornerRadius: radius }),
      setDefaultModel: (model: ModelId) => set({ defaultModel: model }),
      setDefaultAgentModel: (model: ModelId) => set({ defaultAgentModel: model }),
      setDefaultPersona: (persona: PersonaId) =>
        set({ defaultPersona: persona }),
      setDefaultAccessMode: (mode: AccessMode) =>
        set({ defaultAccessMode: mode }),
      setEnterKeySends: (value: boolean) => set({ enterKeySends: value }),
      setGroupToolCalls: (value: boolean) => set({ groupToolCalls: value }),
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
      version: 16,
      storage: createSettingsStorage<PersistedSettings>(),
      partialize,
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
        if (version < 12) {
          const state = persistedState as { groupToolCalls?: boolean };
          if (state && state.groupToolCalls === undefined) {
            state.groupToolCalls = false;
          }
        }
        if (version < 13) {
          const state = persistedState as { fdcApiKey?: string };
          if (state && state.fdcApiKey === undefined) {
            state.fdcApiKey = "";
          }
        }
        if (version < 14) {
          const state = persistedState as {
            artKey?: string;
            apiKey?: string;
            composioApiKey?: string;
            uploadSecret?: string;
            fdcApiKey?: string;
          };
          if (state) {
            if (state.artKey === undefined) state.artKey = "";
            delete state.apiKey;
            delete state.composioApiKey;
            delete state.uploadSecret;
            delete state.fdcApiKey;
          }
        }
        if (version < 15) {
          const state = persistedState as {
            composioUserId?: string;
            exaKey?: string;
          };
          if (state) {
            delete state.composioUserId;
            delete state.exaKey;
          }
        }
        if (version < 16) {
          const state = persistedState as {
            keySource?: KeySource;
            ownKeys?: Partial<OwnKeys>;
          };
          if (state) {
            state.keySource = state.keySource ?? "art";
            state.ownKeys = {
              gateway: state.ownKeys?.gateway ?? "",
              exa: state.ownKeys?.exa ?? "",
              usda: state.ownKeys?.usda ?? "",
              upload: state.ownKeys?.upload ?? "",
            };
          }
        }
        return persistedState as SettingsState;
      },
    },
  ),
);

export const useHasKey = (type?: KeyType): boolean =>
  useSettingsStore((state) => {
    if (!type) return true;
    if (type === "uploads") {
      return state.keySource === "own"
        ? state.ownKeys.upload.length > 0
        : state.artKey.length > 0;
    }
    const keys = state.keys;
    if (!keys) return false;
    return type === "gateway"
      ? keys.gateway.length > 0
      : type === "exa"
        ? keys.exa.length > 0
        : keys.usda.length > 0;
  });

/** True while a configured art key is still resolving, so callers can avoid
 * flashing a "add a key" prompt for keys that may already exist. */
export const useKeysLoading = (): boolean =>
  useSettingsStore((state) => state.keysStatus === "loading");
