import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AppProvider } from "@/contexts/app-context";
import { LLMContextProvider } from "@/components/providers/llm-provider.tsx";
import { ThemeProvider } from "./components/providers/theme-provider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
      <ThemeProvider>
        <LLMContextProvider>
          <App />
        </LLMContextProvider>
      </ThemeProvider>
    </AppProvider>
  </StrictMode>,
);
