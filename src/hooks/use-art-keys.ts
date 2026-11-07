import { useEffect } from "react";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { resolveKeys } from "@/lib/keys/resolve";

/**
 * Resolves the key set whenever the source, art key, or own keys change.
 * Because the settings store hydrates asynchronously, the initial empty state
 * resolves to a no-op and the effect re-runs once the persisted state arrives.
 */
export const useArtKeys = (): void => {
  const keySource = useSettingsStore((state) => state.keySource);
  const artKey = useSettingsStore((state) => state.artKey);
  const ownKeys = useSettingsStore((state) => state.ownKeys);

  useEffect(() => {
    void resolveKeys();
  }, [keySource, artKey, ownKeys]);
};
