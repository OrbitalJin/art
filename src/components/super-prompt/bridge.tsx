import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  isRegistered,
  register,
  unregister,
} from "@tauri-apps/plugin-global-shortcut";
import { toast } from "sonner";
import { startPromptSession } from "@/lib/store/session/commands";
import {
  SUPER_PROMPT_SUBMIT,
  SUPER_PROMPT_SUMMON,
  showSuperPrompt,
} from "@/lib/super-prompt";
import type { SessionType } from "@/lib/store/session/types";

/** Global accelerator that summons the overlay (Cmd on macOS, Win on Windows). */
const ACCELERATOR = "Super+Shift+A";

interface SubmitPayload {
  text: string;
  type: SessionType;
}

/**
 * Lives in the main window. Registers the global shortcut that opens the
 * overlay, handles the prompt the overlay submits (start the session, navigate
 * to it, bring the window forward), and answers summon requests from the tray,
 * the command palette, or a `--ask` launch.
 */
export const SuperPromptBridge: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        await register(ACCELERATOR, () => {
          void showSuperPrompt();
        });
        if (cancelled) return;
        const active = await isRegistered(ACCELERATOR).catch(() => false);
        console.info(`Super Prompt: shortcut ${ACCELERATOR} registered=${active}`);
        if (!active) {
          toast.warning(
            "The global shortcut could not be grabbed. Open Ask Art from the tray or Ctrl/Cmd+K.",
          );
        }
      } catch (error) {
        console.error("Super Prompt: failed to register shortcut", error);
        if (!cancelled) {
          toast.warning(
            "Global shortcuts aren't available here (Wayland). Open Ask Art from the tray or Ctrl/Cmd+K.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      void unregister(ACCELERATOR).catch(() => {});
    };
  }, []);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    void listen(SUPER_PROMPT_SUMMON, () => {
      void showSuperPrompt();
    }).then((fn) => {
      unlisten = fn;
    });
    return () => unlisten?.();
  }, []);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    void listen<SubmitPayload>(SUPER_PROMPT_SUBMIT, async (event) => {
      const { text, type } = event.payload;
      const id = await startPromptSession(
        type,
        text,
        type === "agent" ? "Quick Agent" : "Quick Chat",
      );
      navigate(`/session/${type}/${id}`);

      const win = getCurrentWindow();
      await win.show();
      await win.unminimize();
      await win.setFocus();
    }).then((fn) => {
      unlisten = fn;
    });

    return () => unlisten?.();
  }, [navigate]);

  return null;
};
