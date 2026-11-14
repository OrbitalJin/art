import { defaultWindowIcon } from "@tauri-apps/api/app";
import { Menu } from "@tauri-apps/api/menu";
import { TrayIcon } from "@tauri-apps/api/tray";
import { getCurrentWindow } from "@tauri-apps/api/window";

const TRAY_ID = "main-tray";

/**
 * Creates the app's tray icon exactly once.
 *
 * The tray lives on the Rust side keyed by id and survives webview reloads/HMR,
 * so guarding on {@link TrayIcon.getById} prevents duplicate (orphan) trays when
 * this module is re-evaluated.
 */
export async function initTray(): Promise<void> {
  if (await TrayIcon.getById(TRAY_ID)) return;

  const appWindow = getCurrentWindow();

  const menu = await Menu.new({
    items: [
      {
        id: "show",
        text: "Show Art",
        action: () => {
          void appWindow.show();
        },
      },
      {
        id: "quit",
        text: "Quit",
        action: () => {
          void appWindow.close();
        },
      },
    ],
  });

  await TrayIcon.new({
    id: TRAY_ID,
    icon: (await defaultWindowIcon()) ?? undefined,
    tooltip: "Art",
    menu,
  });
}
