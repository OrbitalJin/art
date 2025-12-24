import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LLMContextProvider } from "@/components/providers/llm-provider.tsx";
import { ThemeProvider } from "./components/providers/theme-provider.tsx";
import App from "./App.tsx";
import { SessionsContextProvider } from "./contexts/sessions-context.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <SessionsContextProvider>
        <LLMContextProvider>
          <App />
        </LLMContextProvider>
      </SessionsContextProvider>
    </ThemeProvider>
  </StrictMode>,
);
