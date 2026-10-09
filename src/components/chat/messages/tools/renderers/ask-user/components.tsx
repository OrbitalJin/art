import type { FC } from "react";
import { cn } from "@/lib/utils";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { ListRow, ResultBadge, RowList, SummaryRow, SummaryText } from "../../primitives";
import { asArray, asRecord, getString } from "../../helpers";

interface AnswerView {
  selected: string[];
  custom: string | null;
}

const questionsOf = (input: unknown) =>
  asArray(asRecord(input)?.questions).map((item) => asRecord(item) ?? {});

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

export const OptionRow: FC<{
  label: string | null;
  description: string | null;
  chosen: boolean;
}> = ({ label, description, chosen }) => {
  const dotClasses = cn(
    "mt-[7px] size-1.5 shrink-0 rounded-full",
    chosen ? "bg-emerald-500" : "bg-muted-foreground/25",
  );

  const labelClasses = cn(
    "text-[12px]",
    chosen ? "text-foreground/90" : "text-muted-foreground/70",
  );

  return (
    <li className="flex min-w-0 items-start gap-2">
      <span aria-hidden className={dotClasses} />
      <span className="flex min-w-0 flex-col">
        <span className={labelClasses}>{label}</span>
        {description ? (
          <span className="text-[11px] leading-snug text-muted-foreground/50">
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
  const options = asArray(question.options).map((item) => asRecord(item) ?? {});

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

      {options.length > 0 ? (
        <ul className="mt-1 flex flex-col gap-1.5">
          {options.map((option, index) => {
            const label = getString(option, "label");
            const chosen = Boolean(
              label && answer && answer.selected.includes(label),
            );

            return (
              <OptionRow
                key={index}
                label={label}
                description={getString(option, "description")}
                chosen={chosen}
              />
            );
          })}
        </ul>
      ) : null}

      {answer?.custom ? (
        <p className="mt-1 text-[12px] text-foreground/85">
          <span className="text-muted-foreground/60">Your answer: </span>
          {answer.custom}
        </p>
      ) : null}
    </ListRow>
  );
};

export const AskUserSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const first = questionsOf(block.input)[0];
  const text = getString(first, "header") ?? getString(first, "question");
  const answer = answersOf(block.output)[0];
  const given = answer
    ? [...answer.selected, answer.custom].filter(Boolean).join(", ")
    : "";

  return (
    <SummaryRow>
      {text ? <SummaryText title={text}>{text}</SummaryText> : null}
      {given ? <ResultBadge tone="success">{given}</ResultBadge> : null}
    </SummaryRow>
  );
};

export const AskUserDetail: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const questions = questionsOf(block.input);
  if (questions.length === 0) return null;

  const answers = answersOf(block.output);

  return (
    <RowList>
      {questions.map((question, index) => (
        <QuestionView key={index} question={question} answer={answers[index]} />
      ))}
    </RowList>
  );
};
