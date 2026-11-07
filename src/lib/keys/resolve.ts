import { pb } from "@/lib/upload/pocketbase";
import { useSettingsStore, type ArtKeys } from "@/lib/store/use-settings-store";

export const ART_KEYS_COLLECTION = "keys";

let inFlight: { artKey: string; promise: Promise<void> } | null = null;

/**
 * Resolves the full key set for the active key source. With the `"art"` source
 * the keys are fetched live from PocketBase and never persisted; a missing art
 * key clears the set and a failed fetch records an error. With the `"own"`
 * source the keys are read straight from the user-supplied set, no network.
 */
export const resolveKeys = async (): Promise<void> => {
  const { keySource, artKey, ownKeys } = useSettingsStore.getState();

  if (keySource === "own") {
    useSettingsStore.setState({
      keys: {
        gateway: ownKeys.gateway,
        usda: ownKeys.usda,
        exa: ownKeys.exa,
      },
      keysStatus: "ready",
      keysError: null,
    });
    return;
  }

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

      if (useSettingsStore.getState().keySource !== "art") return;

      useSettingsStore.setState({
        keys: {
          gateway: record.gateway ?? "",
          usda: record.usda ?? "",
          exa: record.exa ?? "",
        },
        keysStatus: "ready",
        keysError: null,
      });
    } catch (error) {
      if (useSettingsStore.getState().keySource !== "art") return;

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
