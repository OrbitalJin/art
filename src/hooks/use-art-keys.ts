import { useEffect } from "react";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { resolveKeys } from "@/lib/keys/resolve";

/**
 * Resolves the key set whenever the art key changes. Because the settings
 * store hydrates asynchronously, the empty initial key resolves to a no-op and
 * the effect re-runs once the persisted art key arrives.
 */
export const useArtKeys = (): void => {
  const artKey = useSettingsStore((state) => state.artKey);

  useEffect(() => {
    void resolveKeys();
  }, [artKey]);
};
