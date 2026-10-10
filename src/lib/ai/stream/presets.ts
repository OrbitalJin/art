import type { Session } from "@/lib/store/session/types";
import { system, type Profiles } from "../prompts/system";
import { ambientTools, toolsFor } from "../tools/tools";
import { useConnectionsStore } from "@/lib/store/use-connections-store";
import { toolkitEnabled } from "../tools/toolkits";
import { stepCountIs, hasToolCall } from "ai";
import { DONE_TOOL_NAME } from "../tools/names";
import { adaptiveStopCondition, BACKSTOP_STEPS } from "./stop-conditions";

export interface RequestContext {
  session: Session;
  profiles: Profiles;
}

const connectedToolkits = (session: Session): string[] =>
  Object.entries(useConnectionsStore.getState().toolkits)
    .filter(
      ([slug, entry]) =>
        entry.status === "ACTIVE" && toolkitEnabled(session, slug),
    )
    .map(([slug]) => slug);

const enabledToolkits = (session: Session): string[] =>
  ["askUser", "todo"].filter((key) => toolkitEnabled(session, key));

export const presetFor = (ctx: RequestContext) => {
  const { session } = ctx;

  if (session.type === "agent") {
    return {
      system: system({
        ...ctx,
        type: session.type,
        accessMode: session.accessMode,
        connections: { toolkits: connectedToolkits(session) },
        toolkits: enabledToolkits(session),
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
