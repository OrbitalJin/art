import { LLMContext, type LLMContextType } from "@/contexts/llm-context";
import { Models, type Model } from "@/lib/llm/common/provider";
import { LLMProvider } from "@/lib/llm/google";
import { useApp } from "@/contexts/app-context";
import { useMemo, useState, type ReactNode } from "react";

interface LLMProviderProps {
  children: ReactNode;
}

const defaultModelKey = "Art Genesis";
const defaultModel = Models.find((m) => m.key === defaultModelKey) as Model;

export const LLMContextProvider: React.FC<LLMProviderProps> = ({
  children,
}) => {
  const [model, setModel] = useState<Model>(defaultModel);
  const { artPersona } = useApp();

  const llm = useMemo(() => {
    return new LLMProvider({
      model: model,
      apiKey: "AIzaSyAJcnLZB8M1oSjm8X58Fyjx2nh2qTWv4nA",
      systemPrompt: artPersona,
    });
  }, [model, artPersona]);

  const value: LLMContextType = { model, setModel, llm };

  return <LLMContext.Provider value={value}>{children}</LLMContext.Provider>;
};
