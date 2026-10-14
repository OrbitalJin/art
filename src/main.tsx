import "./styles/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "@/contexts/theme-context.tsx";
import { ChatProvider } from "./contexts/chat-context.tsx";
import { hydrateSessions } from "@/lib/store/session/commands";

void hydrateSessions();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <ChatProvider>
        <App />
      </ChatProvider>
    </ThemeProvider>
  </StrictMode>,
);
