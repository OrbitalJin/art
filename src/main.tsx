import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/providers/theme-provider.tsx";
import App from "./App.tsx";
import { ActiveSessionContextProvider } from "@/contexts/active-session-context.tsx";
import { AIContextProvider } from "./contexts/ai-context.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AIContextProvider>
        <ActiveSessionContextProvider>
          <App />
        </ActiveSessionContextProvider>
      </AIContextProvider>
    </ThemeProvider>
  </StrictMode>,
);
