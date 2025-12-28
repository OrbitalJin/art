import { useMemo } from "react";
import { createContext, useContext } from "react";
import { AIProvider } from "@/lib/ai/provider";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { toast } from "sonner";

export interface AIContextType {
  ai: AIProvider | null;
}

const AIContext = createContext<AIContextType | null>(null);

export const AIContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const apiKey = useSettingsStore((state) => state.apiKey);
  const ai = useMemo(() => {
    if (!apiKey) {
      toast.error("API key is not set");
      return null;
    }

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
