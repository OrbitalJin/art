import type { Session } from "@/lib/store/session/types";
import type { ToolSet } from "ai";
import { journalTools } from "./journal";
import { tasksTools } from "./tasks";
import { useSettingsStore } from "@/lib/store/use-settings-store";

export interface Opts {
  session?: Session;
}

export const customTools = (): ToolSet => {
  const tools: ToolSet = {};
  const { journal, tasks } = useSettingsStore.getState().toolOptions;
  return {
    ...tools,
    ...(journal && journalTools()),
    ...(tasks && tasksTools()),
  };
};
