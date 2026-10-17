import type { FC } from "react";
import { Circle, CircleCheck, CircleDot, Route } from "lucide-react";
import { PLAN_TOOL_NAME, planToolSchemas } from "@/lib/ai/tools/plan";
import { Trace, TraceIcon, TraceLine, TraceTitle } from "@/components/ui/trace";
import {
  EmptyNote,
  ErrorNote,
  ResultBadge,
  SummaryRow,
  SummaryText,
} from "../../shared";
import type { RendererProps, ToolRenderer } from "../../types";
import type { ParsedPlanStep, PlanStepStatus } from "./helpers";

interface PlanInput {
  title?: string;
  steps: ParsedPlanStep[];
}

interface PlanOutput {
  total: number;
  completed: number;
  in_progress: number;
}

const countCompleted = (steps: ParsedPlanStep[]): number =>
  steps.filter((step) => step.status === "completed").length;

const traceStatus = (
  status: PlanStepStatus,
): "running" | "pending" | undefined => {
  if (status === "in_progress") return "running";
  if (status === "pending") return "pending";
  return undefined;
};

const StepIcon: FC<{ status: PlanStepStatus }> = ({ status }) => {
  if (status === "completed") return <CircleCheck />;
  if (status === "in_progress") return <CircleDot />;
  return <Circle />;
};

const Detail: FC<RendererProps<PlanInput, PlanOutput>> = ({ block, input }) => {
  if (block.state === "error") {
    return <ErrorNote>Couldn't update the plan.</ErrorNote>;
  }

  const steps = input?.steps ?? [];

  if (steps.length === 0) {
    return (
      <EmptyNote>
        {block.state === "executing" ? "Planning…" : "No plan steps."}
      </EmptyNote>
    );
  }

  return (
    <Trace>
      {steps.map((step, index) => (
        <TraceLine key={index} status={traceStatus(step.status)}>
          <TraceIcon>
            <StepIcon status={step.status} />
          </TraceIcon>
          <TraceTitle>{step.content}</TraceTitle>
        </TraceLine>
      ))}
    </Trace>
  );
};

const Summary: FC<RendererProps<PlanInput, PlanOutput>> = ({
  block,
  input,
}) => {
  const steps = input?.steps ?? [];
  const failed = block.state === "error";

  if (steps.length === 0 && !failed) return null;

  const completed = countCompleted(steps);
  const allDone = steps.length > 0 && completed === steps.length;
  const focus =
    steps.find((step) => step.status === "in_progress") ??
    steps.find((step) => step.status !== "completed");
  const label = allDone ? "Plan complete" : (focus?.content ?? null);

  return (
    <SummaryRow>
      {label ? <SummaryText title={label}>{label}</SummaryText> : null}
      {failed ? (
        <ResultBadge tone="error">failed</ResultBadge>
      ) : (
        <ResultBadge tone={allDone ? "success" : "default"}>
          {completed} of {steps.length}
        </ResultBadge>
      )}
    </SummaryRow>
  );
};

export const renderer: ToolRenderer<PlanInput, PlanOutput> = {
  icon: Route,
  title: "Updated plan",
  executingTitle: "Updating plan",
  inputSchema: planToolSchemas[PLAN_TOOL_NAME].input,
  outputSchema: planToolSchemas[PLAN_TOOL_NAME].output,
  Summary,
  Detail,
};
