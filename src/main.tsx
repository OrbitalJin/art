import "./styles/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ActiveSessionProvider } from "@/contexts/active-session-context.tsx";
import { LLMContextProvider } from "@/contexts/llm-context.tsx";
import { JournalEditorProvider } from "@/contexts/note-editor-context.tsx";
import { ThemeProvider } from "@/contexts/theme-context.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <LLMContextProvider>
        <JournalEditorProvider>
          <ActiveSessionProvider>
            <App />
          </ActiveSessionProvider>
        </JournalEditorProvider>
      </LLMContextProvider>
    </ThemeProvider>
  </StrictMode>,
);
