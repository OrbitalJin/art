export type PlanStepStatus = "pending" | "in_progress" | "completed";

export interface ParsedPlanStep {
  content: string;
  status: PlanStepStatus;
}
