import { LLMContext, type LLMContextType } from "@/contexts/llm-context";
import { Models, type Model } from "@/lib/llm/common/types";
import { LLMProvider } from "@/lib/llm/provider";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { invoke } from "@tauri-apps/api/core";

interface LLMProviderProps {
  children: ReactNode;
}

const defaultModelKey = "Art Genesis";
const defaultModel = Models.find((m) => m.key === defaultModelKey) as Model;

export const LLMContextProvider: React.FC<LLMProviderProps> = ({
  children,
}) => {
  const [model, setModel] = useState<Model>(defaultModel);
  const [apiKey, setApiKey] = useState<string>("");

  useEffect(() => {
    invoke<string>("get_env_var", { key: "GOOGLE_API_KEY" })
      .then(setApiKey)
      .catch((err) => console.log(err));
  }, []);

  const llm = useMemo(() => {
    if (!apiKey) return null;

    return new LLMProvider({
      model: model,
      apiKey: apiKey,
    });
  }, [model, apiKey]);

  const value: LLMContextType = { model, setModel, llm };

  return <LLMContext.Provider value={value}>{children}</LLMContext.Provider>;
};
