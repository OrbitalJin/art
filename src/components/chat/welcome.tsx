import { cn } from "@/lib/utils";

const WelcomeMessage = () => {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-4 px-4 py-10 mt-[20%]",
        "text-center animate-in fade-in zoom-in-95 duration-500 fill-mode-forwards select-none",
      )}
    >
      <div className="max-w-md space-y-2">
        <h2 className="text-xl font-semibold">How can I help you?</h2>
        <p className="text-sm text-muted-foreground">
          I'm ready to assist with your tasks.
        </p>
      </div>
    </div>
  );
};

export default WelcomeMessage;
