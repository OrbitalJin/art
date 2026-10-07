import { tool, type Tool } from "ai";
import { useApprovalStore } from "@/lib/store/use-approval-store";

export class ToolApprovalDeniedError extends Error {
  constructor() {
    super("User denied approval to run this tool");
    this.name = "ToolApprovalDeniedError";
  }
}

interface RequireApprovalArgs {
  toolCallId: string;
  toolName: string;
  input: unknown;
  sessionId: string;
  abortSignal?: AbortSignal;
}

export const requireApproval = async ({
  toolCallId,
  toolName,
  input,
  sessionId,
  abortSignal,
}: RequireApprovalArgs): Promise<void> => {
  const approved = await useApprovalStore.getState().requestApproval({
    toolCallId,
    toolName,
    input,
    sessionId,
    abortSignal,
  });

  if (!approved) throw new ToolApprovalDeniedError();
};

export interface ApprovalOptions<INPUT> {
  name: string;
  sessionId: string;
  needsApproval?: boolean | ((input: INPUT) => boolean);
}

export const withApprovalTool = <INPUT, OUTPUT>(
  config: Tool<INPUT, OUTPUT>,
  options: ApprovalOptions<INPUT>,
): Tool<INPUT, OUTPUT> => {
  const execute = config.execute;
  if (!execute) return tool(config);

  const { name, sessionId, needsApproval = true } = options;

  return tool({
    ...config,
    execute: async (input, execOptions) => {
      const required =
        typeof needsApproval === "function"
          ? needsApproval(input)
          : needsApproval;

      if (required) {
        await requireApproval({
          toolCallId: execOptions.toolCallId,
          toolName: name,
          input,
          sessionId,
          abortSignal: execOptions.abortSignal,
        });
      }

      return execute(input, execOptions);
    },
  } as Tool<INPUT, OUTPUT>);
};
