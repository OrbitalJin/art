import { useEffect, useMemo, useState } from "react";
import { createContext, useContext } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AIProvider } from "@/lib/ai/provider";

export interface AIContextType {
  ai: AIProvider | null;
}

const AIContext = createContext<AIContextType | null>(null);

export const AIContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [apiKey, setApiKey] = useState<string>("");
  useEffect(() => {
    invoke<string>("get_env_var", { key: "GOOGLE_API_KEY" })
      .then(setApiKey)
      .catch((err) => console.log(err));
  }, []);

  const ai = useMemo(() => {
    if (!apiKey) return null;

    return new AIProvider(apiKey);
  }, [apiKey]);

  const value: AIContextType = { ai };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error("useLLM must be wrapped in a LLMContextProvider");
  }
  return context;
};
