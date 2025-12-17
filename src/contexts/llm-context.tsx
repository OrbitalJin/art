import { createContext, useContext } from "react";
import type { Model } from "@/lib/llm/common/provider";
import { LLMProvider } from "@/lib/llm/google";

export interface LLMContextType {
  llm: LLMProvider;
  model: Model;
  setModel: (model: Model) => void;
}

export const LLMContext = createContext<LLMContextType | null>(null);

export const useLLM = () => {
  const context = useContext(LLMContext);
  if (!context) {
    throw new Error("useLLM must be wrapped in a FooBar.Provider");
  }
  return context;
};
