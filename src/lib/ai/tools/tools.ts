import type { Session } from "@/lib/store/session/types";
import type { ToolSet } from "ai";
import { journalTools } from "./journal";
import { tasksTools } from "./tasks";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { sessionTools } from "./session";
import { searchTools } from "./search";
import { knowledgeTools } from "./knowledge";

export interface Opts {
  session?: Session;
}

export const ambientTools = (): ToolSet => {
  return {
    ...searchTools(),
  };
};

export const toolsFor = ({ session }: Opts): ToolSet => {
  const tools: ToolSet = {};
  const { journal, tasks } = useSettingsStore.getState().toolOptions;
  return {
    ...tools,
    ...sessionTools({ session }),
    ...(session?.knowledgeBase &&
      knowledgeTools({ root: session.knowledgeBase })),
    ...(journal && journalTools()),
    ...(tasks && tasksTools()),
    ...ambientTools(),
  };
};
