import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { emitTo } from "@tauri-apps/api/event";
import { SuperPromptBar } from "./bar";
import { SUPER_PROMPT_SUBMIT } from "@/lib/super-prompt";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import type { SessionType } from "@/lib/store/session/types";

/**
 * The floating "Ask art…" window. It is a thin launcher: on submit it hands the
 * prompt to the main window (which owns all session state) and hides itself.
 */
export const SuperPromptWindow: React.FC = () => {
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    void useSettingsStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const win = getCurrentWindow();
    let unlisten: (() => void) | undefined;
    let everFocused = false;

    void win
      .onFocusChanged(({ payload: focused }) => {
        if (focused) {
          everFocused = true;
          setNonce((current) => current + 1);
        } else if (everFocused) {
          void win.hide();
        }
      })
      .then((fn) => {
        unlisten = fn;
      });

    return () => unlisten?.();
  }, []);

  const handleSubmit = async (text: string, type: SessionType) => {
    await emitTo("main", SUPER_PROMPT_SUBMIT, { text, type });
    await getCurrentWindow().hide();
  };

  const handleClose = () => {
    void getCurrentWindow().hide();
  };

  return (
    <div className="h-screen w-screen">
      <SuperPromptBar
        key={nonce}
        onSubmit={handleSubmit}
        onClose={handleClose}
      />
    </div>
  );
};
