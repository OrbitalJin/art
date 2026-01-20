import { cn } from "@/lib/utils";

const WelcomeMessage = () => {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-6 pt-[50%] md:pt-[40%] lg:pt-[25%]",
        "text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 select-none",
      )}
    >
      <div className="max-w-sm space-y-3">
        <h2 className="text-2xl lg:text-3xl font-semibold text-foreground transition-all">
          How can I help you <span className="text-primary">today?</span>
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Ask me anything. What's on your mind?
        </p>
      </div>
    </div>
  );
};

export default WelcomeMessage;
