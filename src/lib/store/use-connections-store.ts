import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { connectionsStorage } from "@/lib/store/connections/adapter";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import {
  clearToolCache,
  createSession,
  getComposio,
  refreshComposioTools,
  getOrCreateSession,
} from "@/lib/services/composio";

export type ToolkitStatus =
  | "ACTIVE"
  | "INITIATED"
  | "INITIALIZING"
  | "INACTIVE"
  | "FAILED"
  | "EXPIRED"
  | "REVOKED"
  | "NOT_CONNECTED"
  | "UNKNOWN";

export interface ToolkitConnection {
  status: ToolkitStatus;
  connectedAccountId?: string;
}

const statusOf = (value: string | undefined): ToolkitStatus => {
  switch (value) {
    case "ACTIVE":
    case "INITIATED":
    case "INITIALIZING":
    case "INACTIVE":
    case "FAILED":
    case "EXPIRED":
    case "REVOKED":
      return value;
    default:
      return "UNKNOWN";
  }
};

interface ConnectionsState {
  hydrated: boolean;
  sessionId: string | null;
  toolkits: Record<string, ToolkitConnection>;
  slugs: string[];
  refreshing: boolean;
  synced: boolean;
  error: string | null;

  setHydrated: (value: boolean) => void;
  ensureSession: (force?: boolean) => Promise<string | null>;
  refreshTools: () => Promise<string[]>;
  syncConnections: (force?: boolean) => Promise<void>;
  connect: (toolkit: string) => Promise<string | null>;
  awaitConnection: (toolkit: string, timeoutMs?: number) => Promise<boolean>;
  disconnect: (toolkit: string) => Promise<void>;
  clear: () => void;
}

const userId = (): string =>
  useSettingsStore.getState().ensureComposioUserId();

let inFlightSession: Promise<string | null> | null = null;

export const useConnectionsStore = create<ConnectionsState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      sessionId: null,
      toolkits: {},
      slugs: [],
      refreshing: false,
      synced: false,
      error: null,

      setHydrated: (value: boolean) => set({ hydrated: value }),

      ensureSession: async (force = false) => {
        const existing = get().sessionId;
        if (existing && !force) return existing;
        if (inFlightSession) return inFlightSession;

        inFlightSession = (async () => {
          try {
            const previous = get().sessionId;
            const session = await createSession(userId());
            if (!session) return null;
            if (previous && previous !== session.sessionId) {
              clearToolCache(previous);
            }
            set({
              sessionId: session.sessionId,
              slugs: [],
              synced: false,
              error: null,
            });
            return session.sessionId;
          } catch (err) {
            set({ error: String(err) });
            return null;
          } finally {
            inFlightSession = null;
          }
        })();

        return inFlightSession;
      },

      refreshTools: async () => {
        const { sessionId } = get();
        if (!sessionId) return [];
        set({ refreshing: true });
        try {
          let cache = await refreshComposioTools(sessionId);
          if (!cache) {
            const recreated = await get().ensureSession(true);
            if (recreated) cache = await refreshComposioTools(recreated);
          }
          const slugs = cache?.slugs ?? [];
          set({ slugs, error: null });
          return slugs;
        } catch (err) {
          set({ error: String(err) });
          return [];
        } finally {
          set({ refreshing: false });
        }
      },

      syncConnections: async (force = false) => {
        if (!force && get().synced) return;
        const composio = getComposio();
        if (!composio) {
          set({ error: "Add a Composio key in Settings > Chat." });
          return;
        }
        const sessionId = await get().ensureSession();
        if (!sessionId) return;

        try {
          const accounts = await composio.connectedAccounts.list({
            userIds: [userId()],
          });
          const toolkits: Record<string, ToolkitConnection> = {};
          for (const item of accounts.items ?? []) {
            const slug = item.toolkit?.slug;
            if (!slug) continue;
            const current = toolkits[slug];
            const next: ToolkitConnection = {
              status: statusOf(item.status),
              connectedAccountId: item.id,
            };
            if (!current || next.status === "ACTIVE") toolkits[slug] = next;
          }
          set({ toolkits, synced: true, error: null });

          const hasActive = Object.values(toolkits).some(
            (t) => t.status === "ACTIVE",
          );
          if (hasActive) await get().refreshTools();
          else {
            clearToolCache();
            set({ slugs: [] });
          }
        } catch (err) {
          set({ error: String(err) });
        }
      },

      connect: async (toolkit: string) => {
        const sessionId = await get().ensureSession();
        if (!sessionId) return null;
        let session = await getOrCreateSession(sessionId);
        if (!session) {
          const recreated = await get().ensureSession(true);
          if (!recreated) return null;
          session = await getOrCreateSession(recreated);
        }
        if (!session) {
          set({ error: "Could not open a Composio session." });
          return null;
        }
        try {
          const request = await session.authorize(toolkit);
          set((state) => ({
            toolkits: {
              ...state.toolkits,
              [toolkit]: { status: "INITIATED" },
            },
            error: null,
          }));
          return request.redirectUrl ?? null;
        } catch (err) {
          set({ error: String(err) });
          return null;
        }
      },

      awaitConnection: async (toolkit: string, timeoutMs = 120_000) => {
        const deadline = Date.now() + timeoutMs;
        while (Date.now() < deadline) {
          await get().syncConnections(true);
          if (get().toolkits[toolkit]?.status === "ACTIVE") return true;
          await new Promise((resolve) => setTimeout(resolve, 2500));
        }
        return get().toolkits[toolkit]?.status === "ACTIVE";
      },

      disconnect: async (toolkit: string) => {
        const composio = getComposio();
        if (!composio) return;
        await get().syncConnections(true);
        const accountId = get().toolkits[toolkit]?.connectedAccountId;
        try {
          if (accountId) await composio.connectedAccounts.delete(accountId);
          clearToolCache();
          set((state) => ({
            toolkits: {
              ...state.toolkits,
              [toolkit]: { status: "NOT_CONNECTED" },
            },
            slugs: [],
            synced: false,
            error: null,
          }));
          await get().syncConnections(true);
        } catch (err) {
          set({ error: String(err) });
        }
      },

      clear: () => {
        clearToolCache();
        set({
          sessionId: null,
          toolkits: {},
          slugs: [],
          synced: false,
          refreshing: false,
          error: null,
        });
      },
    }),
    {
      name: "connections-storage",
      version: 1,
      storage: createJSONStorage(() => connectionsStorage),
      partialize: (state) => ({
        sessionId: state.sessionId,
        toolkits: state.toolkits,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Failed to rehydrate connections storage", error);
          useConnectionsStore.setState({ hydrated: true });
          return;
        }
        if (!state) {
          useConnectionsStore.setState({ hydrated: true });
          return;
        }
        state.setHydrated(true);
      },
    },
  ),
);
