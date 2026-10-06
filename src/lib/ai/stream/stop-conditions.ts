import { stepCountIs, type StopCondition, type ToolSet } from "ai";

export const BACKSTOP_STEPS = 50;

const NO_PROGRESS_STEPS = 3;
const TOKEN_BUDGET = 250_000;

const signatureOf = (call: { toolName: string; input: unknown }): string =>
  `${call.toolName}:${JSON.stringify(call.input ?? null)}`;

export const adaptiveStopCondition = (): StopCondition<ToolSet> => {
  return ({ steps }) => {
    if (steps.length === 0) return false;

    const totalTokens = steps.reduce(
      (sum, step) => sum + (step.usage?.totalTokens ?? 0),
      0,
    );
    if (totalTokens > TOKEN_BUDGET) return true;

    if (steps.length >= NO_PROGRESS_STEPS) {
      const recent = steps.slice(-NO_PROGRESS_STEPS);
      const signatures = recent.map((step) =>
        step.toolCalls.map(signatureOf).join("|"),
      );
      const everyStepHasCalls = recent.every((step) => step.toolCalls.length > 0);
      const repeating =
        everyStepHasCalls &&
        signatures.every((signature) => signature === signatures[0]);
      if (repeating) return true;
    }

    return false;
  };
};

export const agentStopWhen = (): Array<StopCondition<ToolSet>> => [
  adaptiveStopCondition(),
  stepCountIs(BACKSTOP_STEPS),
];
