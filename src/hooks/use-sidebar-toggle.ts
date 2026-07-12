import { useHotkey } from "@tanstack/react-hotkeys";

export const useSidebarToggle = (onToggle: () => void) => {
  useHotkey("Alt+S", () => onToggle(), { ignoreInputs: false });
};
