import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { LLMContextProvider } from "./providers/llm-provider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LLMContextProvider>
      <App />
    </LLMContextProvider>
  </StrictMode>,
);
