import "./styles/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AudioPlayerProvider } from "@/contexts/audio-player-context.tsx";
import { JournalEditorProvider } from "@/contexts/note-editor-context.tsx";
import { ThemeProvider } from "@/contexts/theme-context.tsx";
import { IntervalContextProvider } from "./contexts/interval-context.tsx";
import { ChatProvider } from "./contexts/chat-context.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <ChatProvider>
        <JournalEditorProvider>
          <AudioPlayerProvider>
            <IntervalContextProvider>
              <App />
            </IntervalContextProvider>
          </AudioPlayerProvider>
        </JournalEditorProvider>
      </ChatProvider>
    </ThemeProvider>
  </StrictMode>,
);
