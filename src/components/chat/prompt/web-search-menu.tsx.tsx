import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStreamingState } from "@/hooks/use-streaming-state";
import { useSessionStore } from "@/lib/store/use-session-store";
import { cn } from "@/lib/utils";
import { Globe, Link as LinkIcon, Lock, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

export const WebSearchMenu = () => {
  const [urlInput, setUrlInput] = useState("");
  const { isCurrentSessionStreaming: disabled } = useStreamingState();

  const activeId = useSessionStore((state) => state.activeId);
  const toggleSearchGrounding = useSessionStore(
    (state) => state.toggleSearchGrounding,
  );
  const addWebUrl = useSessionStore((state) => state.addWebCtxUrl);
  const removeWebUrl = useSessionStore((state) => state.removeWebCtxUrl);
  const clearWebUrls = useSessionStore((state) => state.clearWebCtxUrls);

  const session = useSessionStore((state) =>
    state.sessions.find((s) => s.id === activeId),
  );

  if (!activeId || !session) return null;

  const grounded = !!session.searchGrounding;
  const selectedUrls = session.webCtxUrls || [];
  const hasActiveFeatures = grounded || selectedUrls.length > 0;
  const groundingForced = selectedUrls.length > 0;

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    try {
      // Basic validation
      new URL(urlInput.startsWith("http") ? urlInput : `https://${urlInput}`);
      addWebUrl(activeId, urlInput.trim());
      if (!grounded) {
        toggleSearchGrounding(activeId);
      }
      setUrlInput("");
    } catch (err) {
      toast.error("Please enter a valid URL");
    }
  };

  return (
    <DropdownMenu>
      <Tooltip delayDuration={400}>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild disabled={disabled}>
            <div className="relative inline-block">
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-9 w-9 transition-all",
                  hasActiveFeatures && "border-primary/50 bg-primary/5",
                )}
              >
                <Globe
                  className={cn(
                    "h-4 w-4 transition-colors",
                    hasActiveFeatures
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                />
              </Button>
              {selectedUrls.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {selectedUrls.length}
                </span>
              )}
            </div>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Web & Search Settings</TooltipContent>
      </Tooltip>

      <DropdownMenuContent
        align="end"
        className="w-80 p-0 shadow-xl border-muted-foreground/20 overflow-hidden"
      >
        {/* --- Section 1: Search Grounding Toggle --- */}
        <div
          className={cn(
            "flex flex-col gap-1 border-b p-3 transition-colors",
            grounded
              ? groundingForced
                ? "bg-primary/10 cursor-default"
                : "bg-primary/5 cursor-pointer hover:bg-accent/50"
              : "bg-muted/30 cursor-pointer hover:bg-accent/50",
          )}
          onClick={() => !groundingForced && toggleSearchGrounding(activeId)}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold flex items-center gap-2">
              Search Grounding
              {groundingForced && <Lock className="h-3 w-3 text-primary" />}
            </p>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold",
                grounded
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-muted border-border text-muted-foreground",
              )}
            >
              {grounded ? "Enabled" : "Disabled"}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
            {groundingForced
              ? "Enabled by reference links"
              : "Browse the internet to add real-time context."}
          </p>
        </div>

        {/* --- Section 2: Web Context (URLs) --- */}
        <div className="p-3 bg-muted/10 border-b">
          <p className="text-xs font-medium mb-2 text-foreground/70">
            Reference URLs
          </p>
          <form onSubmit={handleAddUrl} className="flex gap-2">
            <Input
              placeholder="example.com"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="h-8 text-xs"
            />
            <Button type="submit" size="sm" className="h-8 w-8 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <div className="flex flex-col p-2 gap-1 max-h-[200px] overflow-y-auto">
          {selectedUrls.length === 0 ? (
            <div className="py-6 text-center">
              <LinkIcon className="h-6 w-6 text-muted-foreground/20 mx-auto mb-1" />
              <p className="text-[11px] text-muted-foreground">
                No custom links added
              </p>
            </div>
          ) : (
            selectedUrls.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="flex items-center justify-between p-2 rounded-md bg-accent/30 group"
              >
                <span className="text-[11px] truncate flex-1 pr-2 text-foreground/80">
                  {url}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeWebUrl(activeId, url);
                  }}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {selectedUrls.length > 0 && (
          <div className="flex items-center justify-between p-2 border-t bg-muted/10">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 text-muted-foreground hover:text-destructive px-2"
              onClick={clearWebUrls.bind(null, activeId)}
            >
              Clear all links
            </Button>
            <p className="text-[10px] text-muted-foreground px-2 italic">
              {selectedUrls.length} context link(s)
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
