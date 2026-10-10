import type { ToolSet } from "ai";
import type { AccessMode } from "./registry";
import { withApprovalTool } from "./approval";
import { isMutating } from "./define";

export const applyAccessPolicy = (
  tools: ToolSet,
  mode: AccessMode,
  sessionId: string,
): ToolSet => {
  const result: ToolSet = {};

  for (const [name, entry] of Object.entries(tools)) {
    if (!isMutating(entry)) {
      result[name] = entry;
      continue;
    }

    if (mode === "readonly") continue;

    if (mode === "autonomous") {
      result[name] = entry;
      continue;
    }

    result[name] = withApprovalTool(entry, { name, sessionId });
  }

  return result;
};
