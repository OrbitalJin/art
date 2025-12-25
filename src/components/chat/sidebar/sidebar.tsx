import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PanelRight } from "lucide-react";
import { useChat } from "@/contexts/chat-context";
import { SidebarContent } from "./content";

export const ChatSidebar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { isSending } = useChat();

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
        <SidebarContent onSessionSwitch={() => setOpen(false)} />
      </div>

      {/* 4. Desktop Sidebar (Static) */}
      <aside
        className={cn(
          "hidden lg:flex flex-col w-[260px]",
          "rounded-xl border bg-card/70 backdrop-blur",
          "m-2 shadow-sm",
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
};
