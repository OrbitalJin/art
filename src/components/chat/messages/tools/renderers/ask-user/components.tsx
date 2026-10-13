import type { FC } from "react";
import { cn } from "@/lib/utils";
import type { ToolCallBlock } from "@/lib/store/session/types";
import type {
  AskUserAnswer,
  AskUserQuestion,
} from "@/lib/ai/tools/ask-user";
import {
  EmptyNote,
  ErrorNote,
  ListRow,
  ResultBadge,
  RowList,
  SummaryRow,
  SummaryText,
} from "../../primitives";
import { formatCount } from "../../helpers";
import type { RendererProps } from "../../types";

interface AskUserInput {
  questions: AskUserQuestion[];
}

interface AskUserOutput {
  skipped: boolean;
  answers: AskUserAnswer[];
}

const hasAnswer = (answer: AskUserAnswer): boolean =>
  answer.selected.length > 0 || Boolean(answer.custom);

const givenOf = (answer: AskUserAnswer): string =>
  [...answer.selected, answer.custom].filter(Boolean).join(", ");

export const OptionMarker: FC<{ chosen: boolean }> = ({ chosen }) => {
  const dotClasses = cn(
    "size-1.5 rounded-full",
    chosen ? "bg-emerald-500" : "bg-muted-foreground/25",
  );

  return (
    <span
      aria-hidden
      className="flex h-4 w-3 shrink-0 items-center justify-center"
    >
      <span className={dotClasses} />
    </span>
  );
};

export const OptionRow: FC<{
  label: string;
  description: string | null;
  chosen: boolean;
  answered: boolean;
}> = ({ label, description, chosen, answered }) => {
  const dimmed = answered && !chosen;

  const labelClasses = cn(
    "text-[12px] leading-4",
    chosen && "text-foreground/90",
    dimmed && "text-muted-foreground/45",
    !answered && "text-foreground/75",
  );

  return (
    <li className="flex min-w-0 items-start gap-2">
      <OptionMarker chosen={chosen} />
      <span className="flex min-w-0 flex-col">
        <span className={labelClasses}>{label}</span>
        {description ? (
          <span className="text-[11px] leading-[14px] text-muted-foreground/50">
            {description}
          </span>
        ) : null}
      </span>
    </li>
  );
};

export const QuestionView: FC<{
  question: AskUserQuestion;
  answer: AskUserAnswer | undefined;
}> = ({ question, answer }) => {
  const options = question.options ?? [];
  const answered = answer !== undefined && hasAnswer(answer);

  return (
    <ListRow>
      <span className="text-[11px] font-medium text-muted-foreground/60">
        {question.header}
      </span>

      <p className="text-[12px] leading-snug text-foreground/85">
        {question.question}
      </p>

      {options.length > 0 || answer?.custom ? (
        <ul className="mt-1 flex flex-col gap-1.5">
          {options.map((option, index) => (
            <OptionRow
              key={index}
              label={option.label}
              description={option.description ?? null}
              chosen={answer?.selected.includes(option.label) ?? false}
              answered={answered}
            />
          ))}

          {answer?.custom ? (
            <OptionRow
              label={answer.custom}
              description="Custom answer"
              chosen
              answered
            />
          ) : null}
        </ul>
      ) : null}
    </ListRow>
  );
};

export const AnswerBadge: FC<{
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

export const AskUserSummary: FC<RendererProps<AskUserInput, AskUserOutput>> = ({
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
      <AnswerBadge block={block} output={output} questionCount={questions.length} />
    </SummaryRow>
  );
};

export const AskUserDetail: FC<RendererProps<AskUserInput, AskUserOutput>> = ({
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
      <RowList>
        {questions.map((question, index) => (
          <QuestionView
            key={index}
            question={question}
            answer={answers[index]}
          />
        ))}
      </RowList>
      {waiting ? <EmptyNote>Waiting for an answer…</EmptyNote> : null}
    </div>
  );
};
