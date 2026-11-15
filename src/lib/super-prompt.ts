import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

/** Label of the floating overlay window. */
export const SUPER_PROMPT_LABEL = "super-prompt";

/** Event the overlay emits to the main window when a prompt is submitted. */
export const SUPER_PROMPT_SUBMIT = "super-prompt:submit";

/** Event a secondary launch / CLI (`--ask`) emits to summon the overlay. */
export const SUPER_PROMPT_SUMMON = "super-prompt:summon";

let creating: Promise<WebviewWindow> | null = null;

const createWindow = (): Promise<WebviewWindow> => {
  const win = new WebviewWindow(SUPER_PROMPT_LABEL, {
    url: "index.html?window=super-prompt",
    title: "Ask Art",
    width: 600,
    height: 120,
    resizable: false,
    decorations: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    center: true,
    focus: true,
    dragDropEnabled: false,
    visible: false,
  });

  return new Promise<WebviewWindow>((resolve) => {
    win.once("tauri://created", () => resolve(win));
    // A failed create should not reject the caller; showing is best-effort.
    win.once("tauri://error", () => resolve(win));
  });
};

/**
 * Shows and focuses the floating "Ask art…" window, creating it on first use.
 * Safe to call from anywhere the main window runs, including while it is hidden.
 */
export const showSuperPrompt = async (): Promise<void> => {
  const existing = await WebviewWindow.getByLabel(SUPER_PROMPT_LABEL);

  if (existing) {
    await existing.show();
    await existing.setFocus();
    return;
  }

  if (!creating) creating = createWindow();
  const win = await creating;
  creating = null;

  await win.show();
  await win.setFocus();
};
