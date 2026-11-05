import type { SessionMeta } from "@/lib/store/session/types";
import { system, type Profiles } from "../prompts/system";
import { toolsFor } from "../tools/tools";
import { DONE_TOOL_NAME } from "../tools/done";
import { stepCountIs, hasToolCall } from "ai";
import { adaptiveStopCondition, BACKSTOP_STEPS } from "./stop-conditions";

export interface RequestContext {
  session: SessionMeta;
  profiles: Profiles;
}

export const presetFor = async (ctx: RequestContext) => {
  const { session } = ctx;
  const tools = await toolsFor(session);

  if (session.type === "agent") {
    return {
      system: system({
        ...ctx,
        type: session.type,
        accessMode: session.accessMode,
      }),
      tools,
      stopWhen: [
        hasToolCall(DONE_TOOL_NAME),
        adaptiveStopCondition(),
        stepCountIs(BACKSTOP_STEPS),
      ],
    };
  }

  return {
    system: system({ ...ctx, type: session.type, persona: session.persona }),
    tools,
    stopWhen: stepCountIs(5),
  };
};
