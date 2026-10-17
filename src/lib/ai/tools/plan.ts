import { tool } from "ai";
import { z } from "zod";
import { usePlanStore } from "@/lib/store/use-plan-store";

export const PLAN_TOOL_NAME = "plan_write";

const planStepSchema = z.object({
  content: z
    .string()
    .min(1)
    .describe(
      "Short, imperative description of the step (e.g. 'Fetch journal entries').",
    ),
  status: z
    .enum(["pending", "in_progress", "completed"])
    .describe(
      "Current state of the step. Exactly one step should be 'in_progress' at a time.",
    ),
});

const planInputSchema = z.object({
  title: z
    .string()
    .min(1)
    .optional()
    .describe(
      "Short title for the plan (e.g. 'Migrate to Base UI'). Omit if the task has no clear name.",
    ),
  steps: z.array(planStepSchema).min(1).max(20),
});
const planOutputSchema = z.object({
  total: z.number(),
  completed: z.number(),
  in_progress: z.number(),
});

export const planToolSchemas = {
  [PLAN_TOOL_NAME]: { input: planInputSchema, output: planOutputSchema },
} as const;

export const planTools = (sessionId: string) => ({
  [PLAN_TOOL_NAME]: tool({
    title: "Write Plan",
    description:
      "Write your working plan as a list of steps for the current task. " +
      "Always send the FULL plan with every call; the new plan replaces " +
      "the previous one. Use it to plan before starting multi-step work, " +
      "and re-send the plan whenever statuses change or steps are added. " +
      "Aim for a short plan (3-7 steps), mark steps `completed` as soon as " +
      "they finish, and add steps you discover along the way. Complete every " +
      "step before calling `done`. Skip the plan for trivial single-step " +
      "requests.",
    inputSchema: planInputSchema,
    outputSchema: planOutputSchema,
    execute: async ({ steps }) => {
      const plan = usePlanStore.getState().write(sessionId, steps);

      const completed = plan.steps.filter(
        (step) => step.status === "completed",
      ).length;
      const in_progress = plan.steps.filter(
        (step) => step.status === "in_progress",
      ).length;

      return { total: plan.steps.length, completed, in_progress };
    },
  }),
});

export type PlanToolName = keyof ReturnType<typeof planTools>;
