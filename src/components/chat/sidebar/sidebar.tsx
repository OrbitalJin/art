import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PanelRight, Plus } from "lucide-react";
import { SessionList } from "./session/list";
import { useSessions } from "@/contexts/sessions-context";
import { useChat } from "@/contexts/chat-context";

export const ChatSidebar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { isSending, usage } = useChat();

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          disabled={isSending}
          onClick={() => setOpen(true)}
          className={cn(
            "bg-background/80 backdrop-blur shadow-sm transition-all duration-300",
            open && "opacity-0 pointer-events-none scale-90",
          )}
        >
          <PanelRight className="h-5 w-5" />
          <span className="sr-only">Open Sidebar</span>
        </Button>
      </div>

      {/* 2. Backdrop (Click outside to close) */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-all duration-500 ease-in-out",
          open
            ? "bg-black/20 backdrop-blur-[2px] opacity-100"
            : "bg-transparent opacity-0 pointer-events-none",
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* 3. Zen-style Floating Sidebar */}
      <div
        className={cn(
          "fixed top-4 bottom-4 left-4 z-50 lg:hidden",
          "w-[85%] max-w-[320px] flex flex-col",

          "rounded-xl border bg-card/90 backdrop-blur-xl shadow-2xl",

          "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          open
            ? "translate-x-0 opacity-100 scale-100"
            : "-translate-x-[120%] opacity-0 scale-95",
        )}
      >
        <SidebarContent
          disabled={isSending}
          usage={usage}
          onSessionSwitch={() => setOpen(false)}
        />
      </div>

      {/* 4. Desktop Sidebar (Static) */}
      <aside
        className={cn(
          "hidden lg:flex flex-col w-[260px]",
          "rounded-xl border bg-card/70 backdrop-blur",
          "m-2 shadow-sm",
        )}
      >
        <SidebarContent disabled={isSending} usage={usage} />
      </aside>
    </>
  );
};

interface SidebarContentProps {
  disabled?: boolean;
  usage?: string;
  onSessionSwitch?: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  disabled,
  usage,
  onSessionSwitch,
}) => {
  const { createSession } = useSessions();

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b bg-card/50">
        <span className="text-sm font-semibold tracking-tight px-1">
          Sessions
        </span>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          disabled={disabled}
          onClick={() => createSession()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Session list */}
      <SessionList disabled={disabled} onSessionSwitch={onSessionSwitch} />

      {/* Footer */}
      <div className="border-t bg-card/50">
        <UsageIndicator usage={usage} />
        <div className="p-3 pt-0">
          <Button
            variant="outline"
            className="w-full gap-2 justify-start pl-3"
            disabled={disabled}
            onClick={() => createSession()}
          >
            <Plus className="h-4 w-4" />
            New chat
          </Button>
        </div>
      </div>
    </div>
  );
};

const UsageIndicator = ({ usage }: { usage?: string }) => {
  if (!usage) return null;

  return (
    <div className="px-4 py-3 space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Memory</span>
        <span className="font-medium text-foreground">{usage}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
        <div
          className="h-full bg-primary/80 transition-all duration-500 ease-out"
          style={{ width: usage }}
        />
      </div>
    </div>
  );
};
