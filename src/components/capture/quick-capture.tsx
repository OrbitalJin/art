import { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useHotkey } from "@tanstack/react-hotkeys";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { useCaptureStore } from "@/lib/store/use-capture-store";
import { useUIStateStore } from "@/lib/store/use-ui-state-store";
import { cn } from "@/lib/utils";

const URL_PATTERN = /^https?:\/\/\S+$/;

export const QuickCapture = () => {
  const dialogOpen = useUIStateStore((state) => state.captureState.dialogOpen);
  const setCaptureState = useUIStateStore((state) => state.setCaptureState);
  const add = useCaptureStore((state) => state.add);

  const location = useLocation();
  const [text, setText] = useState("");
  const sourceRef = useRef<string>("/");

  const setOpen = (open: boolean) => {
    if (open) {
      sourceRef.current = location.pathname;
      setText("");
    }
    setCaptureState({ dialogOpen: open });
  };

  useHotkey("Mod+Shift+C", () => setOpen(!dialogOpen), {
    ignoreInputs: false,
  });

  const isEmpty = !text.trim();

  const submit = () => {
    const content = text.trim();
    if (!content) return;
    const kind = URL_PATTERN.test(content) ? "link" : "text";
    add({ kind, content, source: sourceRef.current });
    toast.success("Captured");
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape" && !isEmpty) {
      e.stopPropagation();
      setText("");
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setOpen}>
      <DialogContent className="gap-0 p-0 sm:max-w-md">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <DialogTitle className="text-sm font-medium text-foreground/70">
            Quick Capture
          </DialogTitle>
        </div>

        <div className="px-4 pb-4">
          <div
            className={cn(
              "relative rounded-lg border bg-card/50 shadow-sm transition-all",
              "focus-within:border-ring/30 focus-within:ring-4 focus-within:ring-ring/10",
              !isEmpty ? "border-primary/40" : "border-border/60",
            )}
          >
            <Textarea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Drop a thought, link, or note…"
              className={cn(
                "min-h-28 max-h-[300px] resize-none border-0 shadow-none",
                "bg-transparent p-3 text-base md:text-sm",
                "text-foreground/80 placeholder:text-muted-foreground/50",
                "focus-visible:ring-0",
              )}
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t px-4 py-3">
          <div className="hidden items-center gap-2 text-[11px] text-muted-foreground/60 sm:flex">
            <Kbd className="text-[10px]">Enter</Kbd>
            <span>to capture</span>
            <span className="text-muted-foreground/30">·</span>
            <Kbd className="text-[10px]">Shift</Kbd>
            <span>+</span>
            <Kbd className="text-[10px]">Enter</Kbd>
            <span>newline</span>
          </div>

          <Button
            size="sm"
            onClick={submit}
            disabled={isEmpty}
            variant={isEmpty ? "outline" : "default"}
            className={cn(
              "ml-auto transition-all duration-300 gap-1.5",
              isEmpty && "text-muted-foreground/50 border-muted-foreground/20",
            )}
          >
            <Plus className="size-4" />
            Capture
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
