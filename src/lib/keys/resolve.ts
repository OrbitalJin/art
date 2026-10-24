import { pb } from "@/lib/upload/pocketbase";
import { useSettingsStore, type ArtKeys } from "@/lib/store/use-settings-store";

export const ART_KEYS_COLLECTION = "keys";

let inFlight: { artKey: string; promise: Promise<void> } | null = null;

/**
 * Resolves the full key set for the currently configured art key. The keys are
 * never persisted: they are fetched live on launch and whenever the art key
 * changes. A missing key clears the resolved set; a failed fetch records an
 * error and leaves the set empty so tool gating disables features.
 */
export const resolveKeys = async (): Promise<void> => {
  const artKey = useSettingsStore.getState().artKey;

  if (!artKey) {
    useSettingsStore.setState({
      keys: null,
      keysStatus: "idle",
      keysError: null,
    });
    return;
  }

  if (inFlight?.artKey === artKey) return inFlight.promise;

  const promise = (async () => {
    useSettingsStore.setState({
      keys: null,
      keysStatus: "loading",
      keysError: null,
    });

    try {
      const record = await pb
        .collection(ART_KEYS_COLLECTION)
        .getOne<ArtKeys>(artKey, { requestKey: null });

      useSettingsStore.setState({
        keys: {
          gateway: record.gateway ?? "",
          usda: record.usda ?? "",
          composio: record.composio ?? "",
        },
        keysStatus: "ready",
        keysError: null,
      });
    } catch (error) {
      useSettingsStore.setState({
        keys: null,
        keysStatus: "error",
        keysError:
          error instanceof Error
            ? error.message
            : "Could not resolve the art key.",
      });
    } finally {
      if (inFlight?.artKey === artKey) inFlight = null;
    }
  })();

  inFlight = { artKey, promise };
  return promise;
};
