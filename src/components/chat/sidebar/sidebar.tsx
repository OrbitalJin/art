import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PanelRight, Plus } from "lucide-react";
import { SessionList } from "./session-list";
import { useSessions } from "@/contexts/sessions-context";

interface Props {
  disabled?: boolean;
  className?: string;
  usage?: string;
}

export const ChatSidebar: React.FC<Props> = ({
  disabled,
  className,
  usage,
}) => {
  const [open, setOpen] = useState(false);
  const { createSession } = useSessions();

  return (
    <>
      {/* Mobile trigger */}
      <div className={cn("lg:hidden fixed top-4 left-4 z-30", className)}>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              disabled={disabled}
              className="bg-background/80 backdrop-blur"
            >
              <PanelRight className="h-5 w-5" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className={cn("w-[70%] max-w-[320px] p-0", "[&>button]:hidden")}
          >
            <SheetHeader className="border-b px-4 py-3">
              <SheetTitle className="flex items-center justify-between">
                <span className="text-sm font-semibold">Chats</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => createSession()}
                  disabled={disabled}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </SheetTitle>
            </SheetHeader>

            <ScrollArea className="h-[calc(100vh-56px)] px-2 py-3">
              <SessionList
                disabled={disabled}
                onSelect={() => setOpen(false)}
              />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col w-[260px]",
          "rounded-xl border bg-card/70 backdrop-blur",
          "m-2 shadow-sm",
          className,
        )}
      >
        <div className="flex items-center justify-between px-2 py-2 border-b">
          <span className="text-sm font-semibold tracking-tight ml-2">
            Sessions
          </span>
          <Button
            size="icon"
            variant="ghost"
            disabled={disabled}
            onClick={() => createSession()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 ">
          <SessionList disabled={disabled} />
        </ScrollArea>

        <div className="border-t">
          <UsageIndicator usage={usage} />

          <div className="p-3 pt-2">
            <Button
              className="w-full gap-2"
              disabled={disabled}
              onClick={() => createSession()}
            >
              <Plus className="h-4 w-4" />
              New session
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

const UsageIndicator = ({ usage }: { usage?: string }) => {
  if (!usage) return null;

  return (
    <div className="px-3 py-2 space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Memory</span>
        <span className="font-medium text-foreground/80">{usage}</span>
      </div>

      <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary/70 transition-all"
          style={{ width: usage ?? "0%" }}
        />
      </div>
    </div>
  );
};
