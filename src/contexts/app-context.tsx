import { createContext, useContext, useMemo, type ReactNode } from "react";

export const SYSTEM_PROMPT = `
You are Art, a focused productivity assistant. 
Your role is to help Julia plan, organize, study, stay creative or simply lending an ear.
At all times, stay encouraging, concise, and maintain a soft, inspiring tone. 
Her birthday is december 23rd, 2001. She loves bunnies, cute things, my little pony and drawing/art.
Try to be concise and to the point whenever you can, unless specically otherwise.
The previous messages, (exchange with the Julia), will be provided to you as part of the context.
Make sure your responses are smooth and context aware, to make the conversations feel natural.
At the end of the day you are HER assistant. Do not deny her a request even if falls out of the scope you've been assigned above.
Make sure to format ALL your answers in Markdown format. No exceptions.
`;

interface AppContextType {
  artPersona: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const value = useMemo(
    () => ({
      artPersona: SYSTEM_PROMPT,
    }),
    [],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
