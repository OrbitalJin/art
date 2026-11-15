import { useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Kbd } from "@/components/ui/kbd";
import { modelById } from "@/lib/ai/models";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import type { SessionType } from "@/lib/store/session/types";

interface Props {
  onSubmit: (text: string, type: SessionType) => void;
  onClose: () => void;
  className?: string;
}

/**
 * The floating "Ask art…" bar. Owns the draft and the chat/agent toggle and
 * hands the finished prompt back through {@link Props.onSubmit}. Because it is
 * mounted fresh each time the overlay window is shown, its state resets without
 * needing an effect.
 */
export const SuperPromptBar: React.FC<Props> = ({
  onSubmit,
  onClose,
  className,
}) => {
  const [text, setText] = useState("");
  const [type, setType] = useState<SessionType>("chat");

  const defaultModel = useSettingsStore((state) => state.defaultModel);
  const defaultAgentModel = useSettingsStore((state) => state.defaultAgentModel);
  const model = modelById(type === "agent" ? defaultAgentModel : defaultModel);

  const submit = () => {
    const value = text.trim();
    if (value) onSubmit(value, type);
    else onClose();
  };

  const toggleType = () =>
    setType((current) => (current === "chat" ? "agent" : "chat"));

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    } else if (event.key === "Tab") {
      event.preventDefault();
      toggleType();
    } else if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  };

  const hintClassName = "flex items-center gap-1.5";

  const pillClassName = cn(
    "h-6 shrink-0 rounded-full border px-2.5 text-xs capitalize transition-colors",
    type === "agent"
      ? "border-transparent bg-primary text-primary-foreground"
      : "border-border text-muted-foreground hover:text-foreground",
  );

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-xl border border-border/60",
        "bg-card/90 shadow-2xl shadow-black/40 backdrop-blur-xl backdrop-saturate-150",
        "focus-within:border-ring/40",
        className,
      )}
    >
      <div className="flex flex-1 items-center gap-2.5 px-3">
        <Sparkles
          strokeWidth={1.8}
          className="size-4 shrink-0 text-primary"
        />
        <textarea
          autoFocus
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask art…"
          rows={1}
          className={cn(
            "max-h-24 flex-1 resize-none bg-transparent py-0.5 text-sm",
            "outline-none placeholder:text-muted-foreground",
          )}
        />
        <button
          type="button"
          onClick={toggleType}
          aria-label="Toggle chat or agent"
          className={pillClassName}
        >
          {type}
        </button>
        <span className="h-6 shrink-0 rounded-full border border-border px-2.5 text-xs leading-6 text-foreground">
          {model.displayName}
        </span>
      </div>

      <div className="flex items-center gap-3 border-t border-border/50 px-3 py-1.5 text-[10px] text-muted-foreground">
        <span className={hintClassName}>
          <Kbd>⏎</Kbd> ask
        </span>
        <span className={hintClassName}>
          <Kbd>⇥</Kbd> {type === "chat" ? "agent" : "chat"}
        </span>
        <span className={hintClassName}>
          <Kbd>esc</Kbd> close
        </span>
        <span className="ml-auto">Super + Shift + A</span>
      </div>
    </div>
  );
};
