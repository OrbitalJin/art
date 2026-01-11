import { useEffect, useMemo } from "react";
import { createContext, useContext } from "react";
import { LLMProvider } from "@/lib/llm/llm-provider";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { toast } from "sonner";

export interface LLMContextType {
  llm: LLMProvider | null;
}

const LLMContext = createContext<LLMContextType | null>(null);

export const LLMContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const apiKey = useSettingsStore((state) => state.apiKey);

  useEffect(() => {
    if (apiKey === "") {
      toast.error("API key is not set");
    }
  }, [apiKey]);

  const llm = useMemo(() => {
    if (apiKey === "") return null;

    return new LLMProvider(apiKey);
  }, [apiKey]);

  const value: LLMContextType = { llm };

  return <LLMContext.Provider value={value}>{children}</LLMContext.Provider>;
};

export const useLLM = () => {
  const context = useContext(LLMContext);
  if (!context) {
    throw new Error("useLLM must be wrapped in a LLMContextProvider");
  }
  return context;
};
