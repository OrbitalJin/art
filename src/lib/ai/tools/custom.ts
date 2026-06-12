import type { Session } from "@/lib/store/session/types";
import type { ToolSet } from "ai";
import { journalTools } from "./journal";
import { tasksTools } from "./tasks";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { sessionTools } from "./session";

export interface Opts {
  session?: Session;
}

export const customToolsFor = ({ session }: Opts): ToolSet => {
  const tools: ToolSet = {};
  const { journal, tasks } = useSettingsStore.getState().toolOptions;
  return {
    ...tools,
    ...sessionTools({ session }),
    ...(journal && journalTools()),
    ...(tasks && tasksTools()),
  };
};
