import type { Session } from "@/lib/store/session/types";
import { system, type Profiles } from "../prompts/system";
import { ambientTools, toolsFor } from "../tools/tools";
import { stepCountIs } from "ai";

export interface RequestContext {
  session: Session;
  profiles: Profiles;
}

export const presetFor = (ctx: RequestContext) => {
  const { session } = ctx;

  if (session.type === "agent") {
    return {
      system: system({ ...ctx, type: session.type }),
      tools: toolsFor({ session }),
      stopWhen: stepCountIs(10),
    };
  }

  return {
    system: system({ ...ctx, type: session.type, mode: session.mode }),
    tools: ambientTools(),
    stopWhen: stepCountIs(5),
  };
};
