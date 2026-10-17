import { useState } from "react";
import { ChevronLeft, Circle, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Trace,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace";
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
  trailing?: React.ReactNode;
}

const chosenIconClasses = "text-emerald-600/90 dark:text-emerald-400/90";

const headerOf = (question: AskUserQuestion): string => {
  const parts = [question.header];
  if (question.multiple) parts.push("Select all that apply");
  return parts.filter(Boolean).join(" · ");
};

const OptionButton: React.FC<{
  option: { label: string; description?: string };
  selected: boolean;
  multiple: boolean;
  disabled: boolean;
  onSelect: () => void;
}> = ({ option, selected, multiple, disabled, onSelect }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onSelect}
    role={multiple ? "checkbox" : "radio"}
    aria-checked={selected}
    className="select-none disabled:pointer-events-none"
  >
    <TraceLine className="pl-6">
      <TraceIcon>
        {selected ? <CircleCheck className={chosenIconClasses} /> : <Circle />}
      </TraceIcon>
      <TraceTitle
        className={cn(
          selected && "text-foreground/90",
          disabled && !selected && "text-muted-foreground/45",
        )}
      >
        {option.label}
      </TraceTitle>
      {option.description ? (
        <TraceDescription>{option.description}</TraceDescription>
      ) : null}
    </TraceLine>
  </button>
);

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
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        Skip
      </Button>
    )}
    {showNext && (
      <Button
        size="sm"
        variant={isPending ? "secondary" : "ghost"}
        onClick={onNext}
        className="text-xs"
      >
        Next
      </Button>
    )}
    {showSubmit && (
      <Button
        size="sm"
        disabled={!canSubmit}
        onClick={onSubmit}
        className="text-xs"
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
  const options = question.options ?? [];

  return (
    <div className="flex flex-col gap-2">
      <Trace>
        <TraceLine>
          <TraceTitle>{question.question}</TraceTitle>
          <TraceDescription>{headerOf(question)}</TraceDescription>
        </TraceLine>
      </Trace>

      {options.length > 0 ? (
        <Trace
          role={multiple ? "group" : "radiogroup"}
          aria-label={question.question}
        >
          {options.map((option) => (
            <OptionButton
              key={option.label}
              option={option}
              selected={selected.includes(option.label)}
              multiple={multiple}
              disabled={disabled}
              onSelect={() => onToggle(option.label)}
            />
          ))}
        </Trace>
      ) : null}

      <div className="flex items-center gap-1.5">
        <Input
          value={custom}
          disabled={disabled}
          onChange={(event) => onCustomChange(event.target.value)}
          placeholder={
            options.length > 0 ? "Or type your own answer…" : "Your answer…"
          }
          aria-label={`Custom answer: ${question.question}`}
          className="h-7 text-xs"
        />
        {actions}
      </div>
    </div>
  );
};

const QuestionNav: React.FC<{
  current: number;
  total: number;
  onBack?: () => void;
}> = ({ current, total, onBack }) => (
  <div className="flex items-center gap-1">
    {onBack && (
      <Button
        size="icon-xs"
        variant="ghost"
        aria-label="Previous question"
        onClick={onBack}
        className="text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft aria-hidden />
      </Button>
    )}
    <span
      aria-live="polite"
      className="text-[11px] font-medium text-muted-foreground/60 tabular-nums"
    >
      Question {current} of {total}
    </span>
  </div>
);

const CardHeader: React.FC<{
  isPending: boolean;
  current: number;
  total: number;
  onBack?: () => void;
  trailing?: React.ReactNode;
}> = ({ isPending, current, total, onBack, trailing }) => {
  const dotClasses = cn(
    "size-1.5 shrink-0 rounded-full",
    isPending
      ? "animate-pulse bg-amber-500 motion-reduce:animate-none"
      : "bg-emerald-500/70",
  );

  const hasMultiple = total > 1;
  const hasControls = hasMultiple || Boolean(trailing);

  return (
    <div className="flex items-center gap-2 px-3 pt-2.5">
      <span aria-hidden className={dotClasses} />
      <span className="text-[11px] font-medium text-muted-foreground/70">
        {isPending ? "Asking you" : "Asked you"}
      </span>

      {hasControls ? (
        <div className="ml-auto flex shrink-0 items-center gap-3">
          {hasMultiple ? (
            <QuestionNav current={current} total={total} onBack={onBack} />
          ) : null}
          {trailing ? (
            <div className="flex items-center gap-1">{trailing}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export const AskUserCard: React.FC<Props> = ({
  toolCallId,
  questions,
  status,
  variant = "default",
  trailing,
}) => {
  const answer = useQuestionStore((state) => state.answer);
  const skip = useQuestionStore((state) => state.skip);

  const [prevToolCallId, setPrevToolCallId] = useState(toolCallId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<Record<number, string[]>>({});
  const [custom, setCustom] = useState<Record<number, string>>({});

  if (prevToolCallId !== toolCallId) {
    setPrevToolCallId(toolCallId);
    setCurrentIndex(0);
    setSelected({});
    setCustom({});
  }

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
      isPending ? "border-amber-500/30" : "border-border/40",
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
        trailing={trailing}
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
