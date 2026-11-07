import { useSettingsStore } from "@/lib/store/use-settings-store";

/** Prompt shown when a required key is missing, phrased for the active source. */
export const useKeyNotice = (): string =>
  useSettingsStore((state) =>
    state.keySource === "own"
      ? "Add your key in Settings"
      : "Add your art key in Settings",
  );
