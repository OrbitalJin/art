import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { connectionsStorage } from "@/lib/store/connections/adapter";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { showConnectionErrorToast } from "@/lib/utils/error-toast";
import {
  authorize,
  createSession,
  disconnect as disconnectAccount,
  listConnections,
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
      return value ? "UNKNOWN" : "NOT_CONNECTED";
  }
};

interface ConnectionsState {
  hydrated: boolean;
  sessionId: string | null;
  /** API key the current `sessionId` was created under. */
  sessionKey: string | null;
  toolkits: Record<string, ToolkitConnection>;
  synced: boolean;
  error: string | null;

  setHydrated: (value: boolean) => void;
  ensureSession: (force?: boolean) => Promise<string | null>;
  syncConnections: (
    force?: boolean,
    options?: { silent?: boolean },
  ) => Promise<void>;
  connect: (toolkit: string) => Promise<string | null>;
  awaitConnection: (toolkit: string, timeoutMs?: number) => Promise<boolean>;
  disconnect: (toolkit: string) => Promise<void>;
  clear: () => void;
}

const userId = (): string =>
  useSettingsStore.getState().ensureComposioUserId();

let inFlightSession: Promise<string | null> | null = null;

const reportError = (
  set: (partial: Partial<ConnectionsState>) => void,
  err: unknown,
  silent = false,
): void => {
  set({ error: err instanceof Error ? err.message : String(err) });
  if (!silent) showConnectionErrorToast(err);
};

export const useConnectionsStore = create<ConnectionsState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      sessionId: null,
      sessionKey: null,
      toolkits: {},
      synced: false,
      error: null,

      setHydrated: (value: boolean) => set({ hydrated: value }),

      ensureSession: async (force = false) => {
        const key = useSettingsStore.getState().composioApiKey;
        const existing = get().sessionId;
        // A session is only valid for the key that created it, so a key change
        // (e.g. from Settings) must not reuse the previous session.
        if (existing && !force && get().sessionKey === key) return existing;
        if (inFlightSession) return inFlightSession;

        inFlightSession = (async () => {
          try {
            const sessionId = await createSession(userId());
            set({ sessionId, sessionKey: key, synced: false, error: null });
            return sessionId;
          } catch (err) {
            reportError(set, err);
            return null;
          } finally {
            inFlightSession = null;
          }
        })();

        return inFlightSession;
      },

      syncConnections: async (force = false, options) => {
        const silent = options?.silent ?? false;
        if (!force && get().synced) return;

        const sessionId = await get().ensureSession();
        if (!sessionId) return;

        try {
          const connections = await listConnections(sessionId);
          const toolkits: Record<string, ToolkitConnection> = {};
          for (const item of connections) {
            const current = toolkits[item.toolkit];
            const next: ToolkitConnection = {
              status: statusOf(item.status),
              connectedAccountId: item.connectedAccountId,
            };
            if (!current || next.status === "ACTIVE") {
              toolkits[item.toolkit] = next;
            }
          }
          set({ toolkits, synced: true, error: null });
        } catch (err) {
          reportError(set, err, silent);
        }
      },

      connect: async (toolkit: string) => {
        const sessionId = await get().ensureSession();
        if (!sessionId) return null;

        try {
          const redirectUrl = await authorize(sessionId, toolkit);
          set((state) => ({
            toolkits: {
              ...state.toolkits,
              [toolkit]: { status: "INITIATED" },
            },
            error: null,
          }));
          return redirectUrl;
        } catch (err) {
          reportError(set, err);
          return null;
        }
      },

      awaitConnection: async (toolkit: string, timeoutMs = 120_000) => {
        const deadline = Date.now() + timeoutMs;
        while (Date.now() < deadline) {
          await get().syncConnections(true, { silent: true });
          if (get().toolkits[toolkit]?.status === "ACTIVE") return true;
          await new Promise((resolve) => setTimeout(resolve, 2500));
        }
        return get().toolkits[toolkit]?.status === "ACTIVE";
      },

      disconnect: async (toolkit: string) => {
        await get().syncConnections(true);
        const accountId = get().toolkits[toolkit]?.connectedAccountId;
        try {
          if (accountId) await disconnectAccount(accountId);
          set((state) => ({
            toolkits: {
              ...state.toolkits,
              [toolkit]: { status: "NOT_CONNECTED" },
            },
            synced: false,
            error: null,
          }));
          await get().syncConnections(true);
        } catch (err) {
          reportError(set, err);
        }
      },

      clear: () => {
        set({
          sessionId: null,
          sessionKey: null,
          toolkits: {},
          synced: false,
          error: null,
        });
      },
    }),
    {
      name: "connections-storage",
      version: 2,
      storage: createJSONStorage(() => connectionsStorage),
      partialize: (state) => ({
        sessionId: state.sessionId,
        sessionKey: state.sessionKey,
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
