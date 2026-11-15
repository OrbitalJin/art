import "./styles/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/contexts/theme-context.tsx";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { SUPER_PROMPT_LABEL } from "@/lib/super-prompt";

const root = document.getElementById("root")!;

// The Super Prompt overlay is the same bundle in a second, transparent window.
// It renders only the floating bar, so the dashboard modules are imported
// lazily on the other branch — otherwise their module-level side effects
// (settings/session store loads, toast bridge) would run in the overlay too.
const isSuperPrompt = (() => {
  try {
    if (getCurrentWindow().label === SUPER_PROMPT_LABEL) return true;
  } catch {
    // Not running inside Tauri (e.g. plain browser dev); fall through.
  }
  return new URLSearchParams(window.location.search).get("window") === SUPER_PROMPT_LABEL;
})();

const renderSuperPrompt = async () => {
  const { SuperPromptWindow } = await import(
    "@/components/super-prompt/window"
  );

  createRoot(root).render(
    <StrictMode>
      <ThemeProvider>
        <SuperPromptWindow />
      </ThemeProvider>
    </StrictMode>,
  );
};

const renderDashboard = async () => {
  const [
    { default: App },
    { ChatProvider },
    { hydrateSessions },
    { hydrateJournal },
    { initTray },
    { initToastNotifications },
  ] = await Promise.all([
    import("./App.tsx"),
    import("./contexts/chat-context.tsx"),
    import("@/lib/store/session/commands"),
    import("@/lib/store/journal/commands"),
    import("@/lib/tray"),
    import("@/lib/notifications/toast-bridge"),
  ]);

  void hydrateSessions();
  void hydrateJournal();
  void initTray();
  void initToastNotifications();

  createRoot(root).render(
    <StrictMode>
      <ThemeProvider>
        <ChatProvider>
          <App />
        </ChatProvider>
      </ThemeProvider>
    </StrictMode>,
  );
};

void (isSuperPrompt ? renderSuperPrompt() : renderDashboard());
