import React from "react";
import { cn } from "@/lib/utils";
import { HelpCircle, MessagesSquare, Type, Pi } from "lucide-react";
import { useActiveSession } from "@/contexts/active-session-context";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
}

const suggestions: Suggestion[] = [
  {
    id: "explain",
    title: "Explain a concept",
    description: "Break down complex topics simply.",
    icon: <HelpCircle className="w-5 h-5" />,
    prompt: "Explain how ",
  },
  {
    id: "converse",
    title: "Have a conversation",
    description: "Discuss, brainstorm, or chat.",
    icon: <MessagesSquare className="w-5 h-5" />,
    prompt: "Let's have a conversation about ",
  },
  {
    id: "write",
    title: "Write & edit",
    description: "Draft or translate content.",
    icon: <Type className="w-5 h-5" />,
    prompt: "Help me write ",
  },
  {
    id: "sciences",
    title: "Science & math",
    description: "Solve equations, explain concepts.",
    icon: <Pi className="w-5 h-5" />,
    prompt: "Help me understand ",
  },
];

interface Props {
  textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
}

const WelcomeMessage: React.FC<Props> = ({ textAreaRef }) => {
  const { setPrompt } = useActiveSession();

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setPrompt(suggestion.prompt);
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  };

  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-8 px-4",
        "text-center select-none",
        "animate-in fade-in slide-in-from-bottom-4 duration-1000",
        "fill-mode-backwards",
      )}
    >
      <div
        className={cn(
          "max-w-md space-y-4",
          "animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-200",
          "fill-mode-backwards",
        )}
      >
        <h2 className="text-2xl lg:text-3xl text-foreground">
          How can I help you{" "}
          <span className="text-primary relative inline-block">today?</span>
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
          Ask me anything. What's on your mind?
        </p>
      </div>

      <div className="w-full max-w-2xl hidden md:grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => handleSuggestionClick(suggestion)}
            className={cn(
              "group relative flex items-start gap-4 p-4 rounded-xl",
              "bg-card hover:bg-accent/20",
              "border border-border hover:border-primary/50",
              "hover:shadow-lg hover:shadow-primary/5",
              "transition-all duration-300 ease-out",
              "hover:-translate-y-0.5 active:translate-y-0",
              "text-left",
              "animate-in fade-in slide-in-from-bottom-4",
              "fill-mode-backwards",
            )}
          >
            <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
              {suggestion.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors duration-200 flex items-center gap-2">
                {suggestion.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {suggestion.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div
        className={cn(
          "text-xs text-muted-foreground/60 mt-4 flex items-center gap-4",
          "animate-in fade-in duration-1000 delay-500",
          "fill-mode-backwards",
        )}
      >
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[10px] border border-border">
            Ctrl
          </kbd>
          <span className="text-muted-foreground/60 text-[10px]">+</span>
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[10px] border border-border">
            /
          </kbd>
          focus
        </span>
        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[10px] border border-border">
            Ctrl
          </kbd>
          <span className="text-muted-foreground/60 text-[10px]">+</span>
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[10px] border border-border">
            K
          </kbd>
          commands
        </span>
        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[10px] border border-border">
            ↵
          </kbd>
          send
        </span>
      </div>
    </div>
  );
};

export default WelcomeMessage;
