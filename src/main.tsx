import "./styles/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ActiveSessionProvider } from "@/contexts/active-session-context.tsx";
import { AudioPlayerProvider } from "@/contexts/audio-player-context.tsx";
import { LLMContextProvider } from "@/contexts/llm-context.tsx";
import { JournalEditorProvider } from "@/contexts/note-editor-context.tsx";
import { ThemeProvider } from "@/contexts/theme-context.tsx";

// import { scan } from "react-scan";
//
// if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
//   scan({
//     enabled: true,
//   });
// }

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <LLMContextProvider>
        <JournalEditorProvider>
          <ActiveSessionProvider>
            <AudioPlayerProvider>
              <App />
            </AudioPlayerProvider>
          </ActiveSessionProvider>
        </JournalEditorProvider>
      </LLMContextProvider>
    </ThemeProvider>
  </StrictMode>,
);
