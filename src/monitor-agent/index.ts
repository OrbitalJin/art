import { useEffect } from "react";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { startControlChannel } from "./control-channel";

/**
 * Always-on screenshot agent. Mount once at the app root; it listens for
 * PocketBase commands addressed to the configured art key and is otherwise
 * invisible.
 *
 * This module is self-contained. To unmount the whole feature: remove the call
 * in `App.tsx`, delete `src/monitor-agent/`, delete
 * `src-tauri/src/monitor_agent.rs`, drop the four references in `lib.rs`'s
 * `run()`, and remove the `xcap` / `image` / `tauri-plugin-single-instance` /
 * `tauri-plugin-autostart` dependencies from `Cargo.toml`.
 */
export const useMonitorAgent = (): void => {
  const artKey = useSettingsStore((state) => state.artKey);

  useEffect(() => {
    if (!artKey) return;

    let stop: (() => void) | undefined;
    let cancelled = false;

    void startControlChannel().then((fn) => {
      if (cancelled) fn();
      else stop = fn;
    });

    return () => {
      cancelled = true;
      stop?.();
    };
  }, [artKey]);
};
