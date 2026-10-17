import { Fragment, type FC } from "react";
import { Circle, CircleCheck, MessageCircleQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToolCallBlock } from "@/lib/store/session/types";
import {
  ASK_USER_TOOL_NAME,
  askUserToolSchemas,
  type AskUserAnswer,
  type AskUserQuestion,
} from "@/lib/ai/tools/ask-user";
import {
  Trace,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace";
import {
  EmptyNote,
  ErrorNote,
  ResultBadge,
  SummaryRow,
  SummaryText,
  formatCount,
} from "../../shared";
import type { RendererProps, ToolRenderer } from "../../types";

interface AskUserInput {
  questions: AskUserQuestion[];
}

interface AskUserOutput {
  skipped: boolean;
  answers: AskUserAnswer[];
}

const chosenIconClasses = "text-emerald-600/90 dark:text-emerald-400/90";

const hasAnswer = (answer: AskUserAnswer): boolean =>
  answer.selected.length > 0 || Boolean(answer.custom);

const givenOf = (answer: AskUserAnswer): string =>
  [...answer.selected, answer.custom].filter(Boolean).join(", ");

const headerOf = (question: AskUserQuestion): string => {
  const parts = [question.header];
  if (question.multiple) parts.push("Select all that apply");
  return parts.filter(Boolean).join(" · ");
};

const OptionLine: FC<{
  label: string;
  description: string | null;
  chosen: boolean;
  answered: boolean;
}> = ({ label, description, chosen, answered }) => (
  <TraceLine className="pl-6">
    <TraceIcon>
      {chosen ? <CircleCheck className={chosenIconClasses} /> : <Circle />}
    </TraceIcon>
    <TraceTitle
      className={cn(
        chosen && "text-foreground/90",
        answered && !chosen && "text-muted-foreground/45",
      )}
    >
      {label}
    </TraceTitle>
    {description ? <TraceDescription>{description}</TraceDescription> : null}
  </TraceLine>
);

const AnswerBadge: FC<{
  block: ToolCallBlock;
  output: AskUserOutput | null;
  questionCount: number;
}> = ({ block, output, questionCount }) => {
  if (block.state === "error") {
    return <ResultBadge tone="error">failed</ResultBadge>;
  }

  if (block.state === "executing") return <ResultBadge>waiting</ResultBadge>;

  const answered = (output?.answers ?? []).filter(hasAnswer);
  if (answered.length === 0) return null;

  if (questionCount > 1) {
    return (
      <ResultBadge tone="success">
        {formatCount(answered.length, "answer")}
      </ResultBadge>
    );
  }

  return <ResultBadge tone="success">{givenOf(answered[0])}</ResultBadge>;
};

const Summary: FC<RendererProps<AskUserInput, AskUserOutput>> = ({
  block,
  input,
  output,
}) => {
  const questions = input?.questions ?? [];
  const first = questions[0];
  const text = first?.header ?? first?.question ?? null;

  return (
    <SummaryRow>
      {text ? <SummaryText title={text}>{text}</SummaryText> : null}
      <AnswerBadge
        block={block}
        output={output}
        questionCount={questions.length}
      />
    </SummaryRow>
  );
};

const Detail: FC<RendererProps<AskUserInput, AskUserOutput>> = ({
  block,
  input,
  output,
}) => {
  if (block.state === "error") {
    return <ErrorNote>Couldn't get an answer.</ErrorNote>;
  }

  const questions = input?.questions ?? [];
  if (questions.length === 0) return null;

  const answers = output?.answers ?? [];
  const waiting = block.state === "executing";

  return (
    <div className="flex flex-col gap-2">
      <Trace>
        {questions.map((question, index) => {
          const answer = answers[index];
          const answered = answer !== undefined && hasAnswer(answer);
          const options = question.options ?? [];
          const header = headerOf(question);

          return (
            <Fragment key={index}>
              <TraceLine status={waiting ? "running" : undefined}>
                <TraceTitle>{question.question}</TraceTitle>
                {header ? <TraceDescription>{header}</TraceDescription> : null}
              </TraceLine>

              {options.map((option, optionIndex) => (
                <OptionLine
                  key={optionIndex}
                  label={option.label}
                  description={option.description ?? null}
                  chosen={answer?.selected.includes(option.label) ?? false}
                  answered={answered}
                />
              ))}

              {answer?.custom ? (
                <OptionLine
                  label={answer.custom}
                  description="custom"
                  chosen
                  answered
                />
              ) : null}
            </Fragment>
          );
        })}
      </Trace>

      {waiting ? <EmptyNote>Waiting for an answer…</EmptyNote> : null}
    </div>
  );
};

export const renderer: ToolRenderer<AskUserInput, AskUserOutput> = {
  icon: MessageCircleQuestion,
  title: "Asked a question",
  executingTitle: "Asking a question",
  inputSchema: askUserToolSchemas[ASK_USER_TOOL_NAME].input,
  outputSchema: askUserToolSchemas[ASK_USER_TOOL_NAME].output,
  Summary,
  Detail,
};
