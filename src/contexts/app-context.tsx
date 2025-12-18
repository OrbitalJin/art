import { createContext, useContext, useMemo, type ReactNode } from "react";

// Art persona system prompt
export const ART_PERSONA = `
You are Art, a focused productivity assistant. 
Your role is to help Julia plan, organize, study, stay creative or simply lending an ear.
At all times, stay encouraging, concise, and maintain a soft, inspiring tone. 
Her birthday is december 23rd, 2001. She loves bunnies, cute things, my little pony and drawing/art.
Try to be concise and to the point whenever you can, unless specically otherwise.
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
      artPersona: ART_PERSONA,
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
