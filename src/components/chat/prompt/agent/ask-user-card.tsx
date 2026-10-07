import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useQuestionStore,
  type AskUserAnswer,
  type AskUserQuestion,
  type QuestionStatus,
} from "@/lib/store/use-question-store";

interface Props {
  toolCallId: string;
  questions: AskUserQuestion[];
  status: QuestionStatus;
  variant?: "default" | "embedded";
}

const OptionRow: React.FC<{
  option: { label: string; description?: string };
  selected: boolean;
  multiple: boolean;
  disabled: boolean;
  onSelect: () => void;
}> = ({ option, selected, multiple, disabled, onSelect }) => {
  const rowClasses = cn(
    "flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left",
    "outline-none transition-colors duration-150",
    "focus-visible:ring-2 focus-visible:ring-ring/50",
    selected ? "bg-primary/10" : "hover:bg-muted/40",
    disabled && "cursor-default hover:bg-transparent",
    disabled && !selected && "opacity-50",
  );

  const indicatorClasses = cn(
    "mt-0.5 flex size-4 shrink-0 items-center justify-center border transition-colors",
    multiple ? "rounded-[4px]" : "rounded-full",
    selected
      ? "border-primary bg-primary text-primary-foreground"
      : "border-muted-foreground/30",
  );

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      role={multiple ? "checkbox" : "radio"}
      aria-checked={selected}
      className={rowClasses}
    >
      <span className={indicatorClasses}>
        {selected && <Check size={10} strokeWidth={3} aria-hidden />}
      </span>

      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[13px] leading-snug text-foreground/90">
          {option.label}
        </span>
        {option.description && (
          <span className="text-xs leading-snug text-muted-foreground/70">
            {option.description}
          </span>
        )}
      </span>
    </button>
  );
};

const QuestionBlock: React.FC<{
  question: AskUserQuestion;
  selected: string[];
  custom: string;
  disabled: boolean;
  onToggle: (label: string) => void;
  onCustomChange: (value: string) => void;
}> = ({ question, selected, custom, disabled, onToggle, onCustomChange }) => {
  const multiple = Boolean(question.multiple);
  const hasOptions = Boolean(question.options?.length);

  const inputClasses = cn(
    "h-8 w-full rounded-md bg-muted/30 px-2.5 text-[13px] text-foreground/90",
    "outline-none transition-colors duration-150",
    "placeholder:text-muted-foreground/40",
    "focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/30",
    "disabled:opacity-50",
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] font-medium text-muted-foreground/60">
          {question.header}
          {multiple && " · Select all that apply"}
        </span>
        <span className="text-[13px] leading-snug font-medium text-foreground/90">
          {question.question}
        </span>
      </div>

      {hasOptions && (
        <div
          role={multiple ? "group" : "radiogroup"}
          aria-label={question.question}
          className="flex flex-col gap-0.5"
        >
          {question.options?.map((option) => (
            <OptionRow
              key={option.label}
              option={option}
              selected={selected.includes(option.label)}
              multiple={multiple}
              disabled={disabled}
              onSelect={() => onToggle(option.label)}
            />
          ))}
        </div>
      )}

      <input
        type="text"
        value={custom}
        disabled={disabled}
        onChange={(event) => onCustomChange(event.target.value)}
        placeholder={hasOptions ? "Or type your own answer…" : "Your answer…"}
        aria-label={`Custom answer: ${question.question}`}
        className={inputClasses}
      />
    </div>
  );
};

export const AskUserCard: React.FC<Props> = ({
  toolCallId,
  questions,
  status,
  variant = "default",
}) => {
  const answer = useQuestionStore((state) => state.answer);
  const skip = useQuestionStore((state) => state.skip);

  const [selected, setSelected] = useState<Record<number, string[]>>({});
  const [custom, setCustom] = useState<Record<number, string>>({});

  const isPending = status === "pending";

  const statusLabel = isPending
    ? "Needs your input"
    : status === "answered"
      ? "Answered"
      : "Skipped";

  const toggle = (index: number, label: string, multiple: boolean) => {
    if (!isPending) return;
    setSelected((prev) => {
      const current = prev[index] ?? [];
      if (multiple) {
        return {
          ...prev,
          [index]: current.includes(label)
            ? current.filter((entry) => entry !== label)
            : [...current, label],
        };
      }
      return { ...prev, [index]: [label] };
    });
  };

  const handleCustomChange = (index: number, value: string) => {
    setCustom((prev) => ({ ...prev, [index]: value }));
  };

  const handleSubmit = () => {
    const answers: AskUserAnswer[] = questions.map((question, index) => ({
      question: question.question,
      selected: selected[index] ?? [],
      custom: custom[index]?.trim() || undefined,
    }));
    answer(toolCallId, answers);
  };

  const hasAnyAnswer = questions.some(
    (_, index) =>
      (selected[index]?.length ?? 0) > 0 || Boolean(custom[index]?.trim()),
  );

  const containerClasses = cn(
    "overflow-hidden transition-colors duration-200",
    variant === "default" && [
      "mb-2 max-w-3xl rounded-lg border bg-muted/10",
      isPending ? "border-primary/30" : "border-border/40",
    ],
    variant === "embedded" && "w-full",
  );

  const dotClasses = cn(
    "size-1.5 rounded-full",
    isPending
      ? "animate-pulse bg-primary motion-reduce:animate-none"
      : "bg-muted-foreground/30",
  );

  return (
    <div className={containerClasses}>
      <div className="flex items-center gap-2 px-3.5 pt-3 pb-1">
        <span aria-hidden className={dotClasses} />
        <span className="text-xs font-medium text-muted-foreground">
          {statusLabel}
        </span>
      </div>

      <div className="flex flex-col gap-5 px-3.5 pt-2 pb-3.5">
        {questions.map((question, index) => (
          <QuestionBlock
            key={index}
            question={question}
            selected={selected[index] ?? []}
            custom={custom[index] ?? ""}
            disabled={!isPending}
            onToggle={(label) =>
              toggle(index, label, Boolean(question.multiple))
            }
            onCustomChange={(value) => handleCustomChange(index, value)}
          />
        ))}

        {isPending && (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => skip(toolCallId)}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              Skip
            </Button>
            <Button
              size="sm"
              disabled={!hasAnyAnswer}
              onClick={handleSubmit}
              className="h-7 text-xs"
            >
              Submit
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
