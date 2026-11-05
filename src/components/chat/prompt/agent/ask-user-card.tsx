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
import { PromptCard, PromptStatus } from "./prompt-card";

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
}> = ({ option, selected, multiple, disabled, onSelect }) => {
  const buttonClassName = cn(
    "block w-full select-none rounded-lg text-left outline-none",
    "transition-colors duration-150",
    "hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring/50",
    "disabled:pointer-events-none",
    selected && "bg-accent/40",
  );

  const titleClassName = cn(
    selected && "text-foreground/90",
    disabled && !selected && "text-muted-foreground/45",
  );

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      role={multiple ? "checkbox" : "radio"}
      aria-checked={selected}
      className={buttonClassName}
    >
      <TraceLine className="pl-6">
        <TraceIcon>
          {selected ? (
            <CircleCheck className={chosenIconClasses} />
          ) : (
            <Circle />
          )}
        </TraceIcon>
        <TraceTitle className={titleClassName}>{option.label}</TraceTitle>
        {option.description ? (
          <TraceDescription>{option.description}</TraceDescription>
        ) : null}
      </TraceLine>
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
}) => {
  const skipClassName = cn(
    "h-7 rounded-full px-3 text-xs text-muted-foreground",
    "hover:text-foreground",
  );

  return (
    <>
      {isPending && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onSkip}
          className={skipClassName}
        >
          Skip
        </Button>
      )}
      {showNext && (
        <Button
          size="sm"
          variant={isPending ? "secondary" : "ghost"}
          onClick={onNext}
          className="h-7 rounded-full px-3 text-xs"
        >
          Next
        </Button>
      )}
      {showSubmit && (
        <Button
          size="sm"
          disabled={!canSubmit}
          onClick={onSubmit}
          className="h-7 rounded-full px-3 text-xs"
        >
          Submit
        </Button>
      )}
    </>
  );
};

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

  const placeholder =
    options.length > 0 ? "Or type your own answer…" : "Your answer…";

  const inputClassName = cn(
    "h-8 rounded-full border-border/40 bg-background/40 px-3 text-xs",
  );

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
          placeholder={placeholder}
          aria-label={`Custom answer: ${question.question}`}
          className={inputClassName}
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
}> = ({ current, total, onBack }) => {
  const navClassName = cn(
    "flex items-center gap-0.5 rounded-full bg-muted/40 p-0.5",
    !onBack && "pl-2.5",
  );

  return (
    <div className={navClassName}>
      {onBack && (
        <Button
          size="icon-xs"
          variant="ghost"
          aria-label="Previous question"
          onClick={onBack}
          className="rounded-full text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft aria-hidden />
        </Button>
      )}
      <span
        aria-live="polite"
        className="px-1.5 text-[11px] font-medium tabular-nums text-muted-foreground/70"
      >
        Question {current} of {total}
      </span>
    </div>
  );
};

const CardHeader: React.FC<{
  isPending: boolean;
  current: number;
  total: number;
  onBack?: () => void;
  trailing?: React.ReactNode;
}> = ({ isPending, current, total, onBack, trailing }) => {
  const hasMultiple = total > 1;
  const hasControls = hasMultiple || Boolean(trailing);

  return (
    <div className="flex items-center gap-2 px-3 pt-2.5">
      <PromptStatus
        tone={isPending ? "pending" : "positive"}
        label={isPending ? "Asking you" : "Asked you"}
      />

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
    <PromptCard variant={variant} pending={isPending}>
      <CardHeader
        isPending={isPending}
        current={activeIndex + 1}
        total={total}
        onBack={isFirst ? undefined : handleBack}
        trailing={trailing}
      />

      <div className="px-3 pb-3 pt-2">
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
    </PromptCard>
  );
};
