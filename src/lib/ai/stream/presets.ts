import type { Session } from "@/lib/store/session/types";
import { system, type Profiles } from "../prompts/system";
import { toolsFor } from "../tools/tools";
import { useConnectionsStore } from "@/lib/store/use-connections-store";
import { toolkitEnabled } from "../tools/toolkits";
import { TOOL_FAMILIES } from "../tools/registry";
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
  TOOL_FAMILIES.filter(
    (family) =>
      family.source === "builtin" && toolkitEnabled(session, family.key),
  ).map((family) => family.key);

export const presetFor = async (ctx: RequestContext) => {
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
      tools: await toolsFor({ session }),
      stopWhen: [
        hasToolCall(DONE_TOOL_NAME),
        adaptiveStopCondition(),
        stepCountIs(BACKSTOP_STEPS),
      ],
    };
  }

  return {
    system: system({ ...ctx, type: session.type, persona: session.persona }),
    tools: {},
    stopWhen: stepCountIs(5),
  };
};
