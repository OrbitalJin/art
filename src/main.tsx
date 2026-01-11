import "./styles/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ActiveSessionProvider } from "@/contexts/active-session-context.tsx";
import { AIContextProvider } from "@/contexts/ai-context.tsx";
import { NoteEditorProvider } from "@/contexts/note-editor-context.tsx";
import { ThemeProvider } from "@/contexts/theme-context.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AIContextProvider>
        <NoteEditorProvider>
          <ActiveSessionProvider>
            <App />
          </ActiveSessionProvider>
        </NoteEditorProvider>
      </AIContextProvider>
    </ThemeProvider>
  </StrictMode>,
);
