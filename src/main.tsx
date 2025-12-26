import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/providers/theme-provider.tsx";
import App from "./App.tsx";
import { ChatContextProvider } from "@/contexts/chat-context.tsx";
import { AIContextProvider } from "./contexts/ai-context.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AIContextProvider>
        <ChatContextProvider>
          <App />
        </ChatContextProvider>
      </AIContextProvider>
    </ThemeProvider>
  </StrictMode>,
);
