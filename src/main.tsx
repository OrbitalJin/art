import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LLMContextProvider } from "@/contexts/llm-context.tsx";
import { ThemeProvider } from "@/components/providers/theme-provider.tsx";
import App from "./App.tsx";
import { SessionsContextProvider } from "@/contexts/sessions-context.tsx";
import { ChatContextProvider } from "@/contexts/chat-context.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <SessionsContextProvider>
        <LLMContextProvider>
          <ChatContextProvider>
            <App />
          </ChatContextProvider>
        </LLMContextProvider>
      </SessionsContextProvider>
    </ThemeProvider>
  </StrictMode>,
);
