import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { connectionsStorage } from "@/lib/store/connections/adapter";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { showConnectionErrorToast } from "@/lib/utils/error-toast";
import {
  authorizeService,
  disconnect as disconnectAccount,
  getOrCreateCSession,
  getCSession,
  listConnections,
} from "@/lib/services/composio";

export interface ServiceConnection {
  isActive: boolean;
  status?: string;
  connectedAccountId?: string;
}

interface ConnectionsState {
  hydrated: boolean;
  sessionId: string | null;
  /** API key the current `sessionId` was created under. */
  sessionKey: string | null;
  connections: Record<string, ServiceConnection>;
  synced: boolean;
  error: string | null;

  setHydrated: (value: boolean) => void;
  ensureSession: (force?: boolean) => Promise<string | null>;
  syncConnections: (
    force?: boolean,
    options?: { silent?: boolean },
  ) => Promise<void>;
  connect: (service: string) => Promise<string | null>;
  awaitConnection: (service: string, timeoutMs?: number) => Promise<boolean>;
  disconnect: (service: string) => Promise<void>;
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
      connections: {},
      synced: false,
      error: null,

      setHydrated: (value: boolean) => set({ hydrated: value }),

      ensureSession: async (force = false) => {
        const key = useSettingsStore.getState().composioApiKey;
        const existing = get().sessionId;
        // A session is only valid for the key that created it, so a key change
        // (e.g. from Settings) must not reuse the previous session.
        const reusable = !force && get().sessionKey === key ? existing : null;
        if (existing && !force && get().sessionKey === key) return existing;
        if (inFlightSession) return inFlightSession;

        inFlightSession = (async () => {
          try {
            const csession = await getOrCreateCSession(userId(), reusable);
            if (!csession) return null;
            set({
              sessionId: csession.sessionId,
              sessionKey: key,
              synced: false,
              error: null,
            });
            return csession.sessionId;
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
        const csession = await getCSession(sessionId);
        if (!csession) return;

        try {
          const services = await listConnections(csession);
          const connections: Record<string, ServiceConnection> = {};
          for (const item of services) {
            connections[item.service] = {
              isActive: item.isActive,
              status: item.status,
              connectedAccountId: item.connectedAccountId,
            };
          }
          set({ connections, synced: true, error: null });
        } catch (err) {
          reportError(set, err, silent);
        }
      },

      connect: async (service: string) => {
        const sessionId = await get().ensureSession();
        if (!sessionId) return null;

        try {
          const redirectUrl = await authorizeService(sessionId, service);
          set((state) => ({
            connections: {
              ...state.connections,
              [service]: { isActive: false, status: "INITIATED" },
            },
            error: null,
          }));
          return redirectUrl;
        } catch (err) {
          reportError(set, err);
          return null;
        }
      },

      awaitConnection: async (service: string, timeoutMs = 120_000) => {
        const deadline = Date.now() + timeoutMs;
        while (Date.now() < deadline) {
          await get().syncConnections(true, { silent: true });
          if (get().connections[service]?.isActive === true) return true;
          await new Promise((resolve) => setTimeout(resolve, 2500));
        }
        return get().connections[service]?.isActive === true;
      },

      disconnect: async (service: string) => {
        await get().syncConnections(true);
        const accountId = get().connections[service]?.connectedAccountId;
        try {
          if (accountId) await disconnectAccount(accountId);
          set((state) => ({
            connections: {
              ...state.connections,
              [service]: { isActive: false },
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
          connections: {},
          synced: false,
          error: null,
        });
      },
    }),
    {
      name: "connections-storage",
      version: 4,
      storage: createJSONStorage(() => connectionsStorage),
      migrate: (persisted) => ({
        ...(persisted as object),
        connections: {},
      }),
      partialize: (state) => ({
        sessionId: state.sessionId,
        sessionKey: state.sessionKey,
        connections: state.connections,
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
