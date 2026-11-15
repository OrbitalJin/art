import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { toast, type ExternalToast } from "sonner";

/**
 * Toast kinds that should also surface as OS notifications when the app isn't
 * visible. `info`/`loading` stay in-app only.
 */
const MIRRORED = ["success", "error", "warning"] as const;

/** OS notification bodies are short-lived; keep them readable. */
const MAX_BODY = 200;

let focused = true;
let ready = false;

/** True when the window is hidden to tray/minimized or simply not focused. */
const shouldMirror = (): boolean => document.hidden || !focused;

const mirror = (message: unknown, data?: ExternalToast): void => {
  if (!shouldMirror()) return;
  // OS notifications need plain text; React nodes can't be serialized here.
  if (typeof message !== "string" || message.length === 0) return;

  const description = data?.description;
  sendNotification({
    title: message,
    body:
      typeof description === "string" && description.length > 0
        ? description.slice(0, MAX_BODY)
        : undefined,
  });
};

/**
 * Routes the app's sonner toasts (error/success/warning) to the OS as well,
 * but only while the window is hidden or unfocused. Patches the sonner
 * singleton's methods once, so every existing `toast.*` call site is covered
 * without changes.
 *
 * Idempotent: safe to call multiple times (e.g. under StrictMode).
 */
export async function initToastNotifications(): Promise<void> {
  if (ready) return;
  ready = true;

  if (!(await isPermissionGranted())) await requestPermission();

  const appWindow = getCurrentWindow();
  focused = await appWindow.isFocused();

  void appWindow.onFocusChanged(({ payload }) => {
    focused = payload;
  });

  for (const name of MIRRORED) {
    const original = toast[name];
    toast[name] = (message, data) => {
      mirror(message, data);
      return original(message, data);
    };
  }
}
