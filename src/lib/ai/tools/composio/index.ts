import type { ToolSet } from "ai";
import type { Session } from "@/lib/store/session/types";
import { toolkitEnabled } from "../toolkits";
import { gmailTools } from "../gmail";
import { slackTools } from "../slack";
import { googlesheetsTools } from "../googlesheets";

const BUILDERS: Record<string, () => ToolSet> = {
  gmail: gmailTools,
  slack: slackTools,
  googlesheets: googlesheetsTools,
};

export const composioTools = (session: Session): ToolSet => {
  const tools: ToolSet = {};
  for (const [toolkit, build] of Object.entries(BUILDERS)) {
    if (toolkitEnabled(session, toolkit)) Object.assign(tools, build());
  }
  return tools;
};

export const composioToolCount = (toolkit: string): number => {
  const build = BUILDERS[toolkit];
  return build ? Object.keys(build()).length : 0;
};
