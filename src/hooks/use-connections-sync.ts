import { useEffect, useRef } from "react";
import { useConnectionsStore } from "@/lib/store/use-connections-store";
import { useSettingsStore } from "@/lib/store/use-settings-store";

export const useConnectionsSync = (): void => {
  const apiKey = useSettingsStore((state) => state.composioApiKey);
  const hydrated = useConnectionsStore((state) => state.hydrated);
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (syncedRef.current === apiKey) return;
    syncedRef.current = apiKey;

    const store = useConnectionsStore.getState();
    store.clear();

    if (!apiKey) return;

    void (async () => {
      await store.ensureSession();
      await store.syncConnections(true);
    })();
  }, [apiKey, hydrated]);
};
