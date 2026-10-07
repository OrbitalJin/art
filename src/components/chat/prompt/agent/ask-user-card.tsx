import { useState } from "react";
import { Check, ChevronLeft } from "lucide-react";
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
    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left",
    "outline-none transition-colors duration-150",
    "focus-visible:ring-2 focus-visible:ring-ring/50",
    selected ? "bg-primary/10" : "hover:bg-muted/40",
    disabled && "cursor-default hover:bg-transparent",
    disabled && !selected && "opacity-50",
  );

  const indicatorClasses = cn(
    "flex size-4 shrink-0 items-center justify-center border transition-colors",
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

      <span className="flex min-w-0 flex-col">
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

const CardActions: React.FC<{
  isPending: boolean;
  showNext: boolean;
  showSubmit: boolean;
  canSubmit: boolean;
  onSkip: () => void;
  onNext: () => void;
  onSubmit: () => void;
}> = ({
  isPending,
  showNext,
  showSubmit,
  canSubmit,
  onSkip,
  onNext,
  onSubmit,
}) => (
  <>
    {isPending && (
      <Button
        size="sm"
        variant="ghost"
        onClick={onSkip}
        className="h-8 shrink-0 px-2.5 text-xs text-muted-foreground hover:text-foreground"
      >
        Skip
      </Button>
    )}
    {showNext && (
      <Button
        size="sm"
        variant={isPending ? "secondary" : "ghost"}
        onClick={onNext}
        className="h-8 shrink-0 px-3 text-xs"
      >
        Next
      </Button>
    )}
    {showSubmit && (
      <Button
        size="sm"
        disabled={!canSubmit}
        onClick={onSubmit}
        className="h-8 shrink-0 px-3 text-xs"
      >
        Submit
      </Button>
    )}
  </>
);

const QuestionBlock: React.FC<{
  question: AskUserQuestion;
  selected: string[];
  custom: string;
  disabled: boolean;
  onToggle: (label: string) => void;
  onCustomChange: (value: string) => void;
  actions: React.ReactNode;
}> = ({
  question,
  selected,
  custom,
  disabled,
  onToggle,
  onCustomChange,
  actions,
}) => {
  const multiple = Boolean(question.multiple);
  const hasOptions = Boolean(question.options?.length);

  const inputClasses = cn(
    "h-8 min-w-0 flex-1 rounded-md bg-muted/30 px-2.5 text-[13px] text-foreground/90",
    "outline-none transition-colors duration-150",
    "placeholder:text-muted-foreground/40",
    "focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/30",
    "disabled:opacity-50",
  );

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-col">
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
          className="flex max-h-[40vh] flex-col overflow-y-auto"
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

      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={custom}
          disabled={disabled}
          onChange={(event) => onCustomChange(event.target.value)}
          placeholder={hasOptions ? "Or type your own answer…" : "Your answer…"}
          aria-label={`Custom answer: ${question.question}`}
          className={inputClasses}
        />
        {actions}
      </div>
    </div>
  );
};

const CardHeader: React.FC<{
  isPending: boolean;
  current: number;
  total: number;
  onBack?: () => void;
}> = ({ isPending, current, total, onBack }) => {
  const dotClasses = cn(
    "size-1.5 rounded-full",
    isPending
      ? "animate-pulse bg-primary motion-reduce:animate-none"
      : "bg-muted-foreground/30",
  );

  const hasMultiple = total > 1;

  return (
    <div className="flex items-center gap-2 px-3 pt-2.5">
      <span aria-hidden className={dotClasses} />
      <span className="text-[11px] font-medium text-muted-foreground/70">
        {isPending ? "Asking you" : "Asked you"}
      </span>

      {hasMultiple && (
        <div className="ml-auto flex items-center gap-1">
          {onBack && (
            <Button
              size="icon"
              variant="ghost"
              aria-label="Previous question"
              onClick={onBack}
              className="size-5 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft size={12} aria-hidden />
            </Button>
          )}
          <span
            aria-live="polite"
            className="text-[11px] font-medium text-muted-foreground/60 tabular-nums"
          >
            {current} / {total}
          </span>
        </div>
      )}
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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<Record<number, string[]>>({});
  const [custom, setCustom] = useState<Record<number, string>>({});

  const isPending = status === "pending";

  const total = questions.length;
  const hasMultiple = total > 1;
  const activeIndex = Math.min(currentIndex, Math.max(total - 1, 0));
  const activeQuestion = questions[activeIndex];
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === total - 1;

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

  const handleBack = () => {
    setCurrentIndex(Math.max(activeIndex - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex(Math.min(activeIndex + 1, total - 1));
  };

  const handleSkip = () => {
    skip(toolCallId);
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

  const showNext = hasMultiple && !isLast;
  const showSubmit = isPending && isLast;

  const containerClasses = cn(
    "overflow-hidden transition-colors duration-200",
    variant === "default" && [
      "mb-2 max-w-3xl rounded-lg border bg-muted/10",
      isPending ? "border-primary/30" : "border-border/40",
    ],
    variant === "embedded" && "w-full",
  );

  if (!activeQuestion) return null;

  const actions = (
    <CardActions
      isPending={isPending}
      showNext={showNext}
      showSubmit={showSubmit}
      canSubmit={hasAnyAnswer}
      onSkip={handleSkip}
      onNext={handleNext}
      onSubmit={handleSubmit}
    />
  );

  return (
    <div className={containerClasses}>
      <CardHeader
        isPending={isPending}
        current={activeIndex + 1}
        total={total}
        onBack={isFirst ? undefined : handleBack}
      />

      <div className="px-3 pt-1.5 pb-2.5">
        <QuestionBlock
          key={activeIndex}
          question={activeQuestion}
          selected={selected[activeIndex] ?? []}
          custom={custom[activeIndex] ?? ""}
          disabled={!isPending}
          onToggle={(label) =>
            toggle(activeIndex, label, Boolean(activeQuestion.multiple))
          }
          onCustomChange={(value) => handleCustomChange(activeIndex, value)}
          actions={actions}
        />
      </div>
    </div>
  );
};
