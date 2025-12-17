import { LLMContext, type LLMContextType } from "@/contexts/llm-context";
import type { Model } from "@/lib/llm/common/provider";
import { LLMProvider } from "@/lib/llm/google";
import { useMemo, useState, type ReactNode } from "react";

const sysPrompt = `
You are Art, a focused productivity assistant. 
Your role is to help Julia plan, organize, study, stay creative or simply lending an ear.
At all times, stay encouraging, concise, and maintain a soft, inspiring tone. 
Her birthday is december 23rd, 2001. She loves bunnies, cute things, my little pony and drawing/art.
`;

interface LLMProviderProps {
  children: ReactNode;
}

const defaultModel: Model = {
  key: "genesis",
  type: "gemma-3-27b-it",
};

export const LLMContextProvider: React.FC<LLMProviderProps> = ({
  children,
}) => {
  const [model, setModel] = useState<Model>(defaultModel);

  const llm = useMemo(() => {
    return new LLMProvider({
      model: model,
      apiKey: "AIzaSyAJcnLZB8M1oSjm8X58Fyjx2nh2qTWv4nA",
      systemPrompt: sysPrompt,
    });
  }, [model]);

  const value: LLMContextType = { model, setModel, llm };

  return <LLMContext.Provider value={value}>{children}</LLMContext.Provider>;
};
