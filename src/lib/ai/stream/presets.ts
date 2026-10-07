import type { Session } from "@/lib/store/session/types";
import { system, type Profiles } from "../prompts/system";
import { ambientTools, toolsFor } from "../tools/tools";
import { stepCountIs, hasToolCall } from "ai";
import { DONE_TOOL_NAME } from "../tools/done";
import { adaptiveStopCondition, BACKSTOP_STEPS } from "./stop-conditions";

export interface RequestContext {
  session: Session;
  profiles: Profiles;
}

export const presetFor = (ctx: RequestContext) => {
  const { session } = ctx;

  if (session.type === "agent") {
    return {
      system: system({
        ...ctx,
        type: session.type,
        accessMode: session.accessMode,
      }),
      tools: toolsFor({ session }),
      stopWhen: [
        hasToolCall(DONE_TOOL_NAME),
        adaptiveStopCondition(),
        stepCountIs(BACKSTOP_STEPS),
      ],
    };
  }

  return {
    system: system({ ...ctx, type: session.type, mode: session.mode }),
    tools: ambientTools(),
    stopWhen: stepCountIs(5),
  };
};
