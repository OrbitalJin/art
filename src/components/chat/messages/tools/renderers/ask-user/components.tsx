import type { FC } from "react";
import { cn } from "@/lib/utils";
import type { ToolCallBlock } from "@/lib/store/session/types";
import {
  EmptyNote,
  ErrorNote,
  ListRow,
  ResultBadge,
  RowList,
  SummaryRow,
  SummaryText,
} from "../../primitives";
import { asArray, asRecord, formatCount, getString } from "../../helpers";

interface AnswerView {
  selected: string[];
  custom: string | null;
}

const questionsOf = (input: unknown) =>
  asArray(asRecord(input)?.questions).map((item) => asRecord(item) ?? {});

const optionsOf = (question: Record<string, unknown>) =>
  asArray(question.options).map((item) => asRecord(item) ?? {});

const errorOf = (output: unknown): string | null =>
  getString(asRecord(output), "error");

// Assumes the tool result is the submitted answers: an array of
// { question, selected, custom } (or { answers: [...] }), in question order.
// Anything else parses to [] and the options render neutral.
const answersOf = (output: unknown): AnswerView[] => {
  const direct = asArray(output);
  const list = direct.length > 0 ? direct : asArray(asRecord(output)?.answers);

  return list.map((item) => {
    const entry = asRecord(item);
    return {
      selected: asArray(entry?.selected).filter(
        (value): value is string => typeof value === "string",
      ),
      custom: getString(entry, "custom"),
    };
  });
};

const hasAnswer = (answer: AnswerView): boolean =>
  answer.selected.length > 0 || answer.custom !== null;

const givenOf = (answer: AnswerView): string =>
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
  question: Record<string, unknown>;
  answer: AnswerView | undefined;
}> = ({ question, answer }) => {
  const header = getString(question, "header");
  const text = getString(question, "question");
  const options = optionsOf(question);
  const answered = answer !== undefined && hasAnswer(answer);

  return (
    <ListRow>
      {header ? (
        <span className="text-[11px] font-medium text-muted-foreground/60">
          {header}
        </span>
      ) : null}

      {text ? (
        <p className="text-[12px] leading-snug text-foreground/85">{text}</p>
      ) : null}

      {options.length > 0 || answer?.custom ? (
        <ul className="mt-1 flex flex-col gap-1.5">
          {options.map((option, index) => {
            const label = getString(option, "label");
            if (!label) return null;

            return (
              <OptionRow
                key={index}
                label={label}
                description={getString(option, "description")}
                chosen={answer?.selected.includes(label) ?? false}
                answered={answered}
              />
            );
          })}

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
  questionCount: number;
}> = ({ block, questionCount }) => {
  if (errorOf(block.output)) {
    return <ResultBadge tone="error">failed</ResultBadge>;
  }

  if (block.state === "executing") return <ResultBadge>waiting</ResultBadge>;

  const answered = answersOf(block.output).filter(hasAnswer);
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

export const AskUserSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const questions = questionsOf(block.input);
  const first = questions[0];
  const text = getString(first, "header") ?? getString(first, "question");

  return (
    <SummaryRow>
      {text ? <SummaryText title={text}>{text}</SummaryText> : null}
      <AnswerBadge block={block} questionCount={questions.length} />
    </SummaryRow>
  );
};

export const AskUserDetail: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const error = errorOf(block.output);
  if (error) return <ErrorNote>{error}</ErrorNote>;

  const questions = questionsOf(block.input);
  if (questions.length === 0) return null;

  const answers = answersOf(block.output);
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
