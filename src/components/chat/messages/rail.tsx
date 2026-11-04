import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  useMessageScroller,
  useMessageScrollerVisibility,
} from "@/components/ui/message-scroller";
import { messageText, type Message } from "@/lib/store/session/types";

interface Props {
  messages: readonly Message[];
}

/** Target bar thickness and spacing in px; both scale down for long threads. */
const BAR_MAX = 2;
const BAR_MIN = 0.5;
const GAP_MAX = 12;
/** Share of the scroll area the stack is allowed to occupy. */
const RAIL_FRACTION = 0.6;

const previewOf = (message: Message): string => {
  const text = messageText(message).replace(/\s+/g, " ").trim();
  if (text) return text;
  if (message.attachments?.length) return "Attachment";
  if (message.toolCalls?.length) return "Tool call";
  return "Empty message";
};

/**
 * A quiet vertical stack of bars, one per message, pinned to the left edge of
 * the chat pane alongside the sidebar. Bars grow and brighten as their message
 * enters the viewport; clicking one scrolls to it. Thickness and spacing scale
 * down for long threads so the stack always stays inside its slot.
 */
export const MessageRail: React.FC<Props> = ({ messages }) => {
  const { scrollToMessage } = useMessageScroller();
  const { currentAnchorId, visibleMessageIds } = useMessageScrollerVisibility();
  const railRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [hovered, setHovered] = useState<number | null>(null);

  const visible = useMemo(
    () => new Set(visibleMessageIds),
    [visibleMessageIds],
  );
  const count = messages.length;

  useEffect(() => {
    const scroller = railRef.current?.parentElement;
    if (!scroller || count === 0) return;

    const measure = () => {
      const usable = scroller.clientHeight * RAIL_FRACTION;
      setScale(Math.min(1, usable / (count * (BAR_MAX + GAP_MAX))));
    };

    measure();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [count]);

  if (count < 2) return null;

  const gap = GAP_MAX * scale;
  const bar = Math.max(BAR_MIN, BAR_MAX * scale);
  const row = bar + gap;
  const hoveredMessage = hovered === null ? null : messages[hovered];
  // The anchor is the message at the reading position; fall back to the first
  // visible one so the rail always has a highlight while scrolling.
  const activeId =
    currentAnchorId && messages.some((m) => m.id === currentAnchorId)
      ? currentAnchorId
      : (visibleMessageIds[0] ?? null);

  return (
    <div
      ref={railRef}
      data-slot="message-rail"
      className={cn(
        "pointer-events-none absolute left-3 z-10 hidden -translate-y-1/2",
        "flex-col items-start @[54rem]:flex",
      )}
      style={{ top: "calc(50% - var(--prompt-height, 0px) / 2)" }}
    >
      {messages.map((message, index) => {
        const isCurrent = message.id === activeId;
        const isVisible = visible.has(message.id);

        return (
          <button
            key={message.id}
            type="button"
            tabIndex={-1}
            aria-label={`Jump to message ${index + 1} of ${count}`}
            aria-current={isCurrent ? "true" : undefined}
            onClick={() => scrollToMessage(message.id, { behavior: "smooth" })}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() =>
              setHovered((value) => (value === index ? null : value))
            }
            className="group/bar pointer-events-auto flex w-8 cursor-pointer items-center rounded-full outline-none"
            style={{ height: `${row}px` }}
          >
            <span
              className={cn(
                "rounded-full transition-[width,background-color,opacity,box-shadow] duration-300 ease-out",
                "motion-reduce:transition-none",
                message.role === "user" ? "bg-primary" : "bg-muted-foreground",
                isCurrent
                  ? "w-6 bg-primary opacity-100 ring-2 ring-primary/25"
                  : isVisible
                    ? "w-4 opacity-55"
                    : "w-3 opacity-20",
                "group-hover/bar:w-6 group-hover/bar:opacity-100",
              )}
              style={{ height: `${bar}px` }}
            />
          </button>
        );
      })}

      {hoveredMessage && hovered !== null && (
        <div
          role="tooltip"
          className={cn(
            "pointer-events-none absolute left-full ml-2 w-56 max-w-[40vw]",
            "rounded-md border border-border/60 bg-popover/95 px-2.5 py-1.5 shadow-md backdrop-blur-sm",
          )}
          style={{ top: `${hovered * row}px` }}
        >
          <p className="text-[10px] font-medium tracking-wide text-muted-foreground/70">
            {hoveredMessage.role === "user" ? "You" : "Assistant"}
          </p>
          <p className="mt-0.5 line-clamp-3 text-[11px] leading-snug text-foreground/80">
            {previewOf(hoveredMessage)}
          </p>
        </div>
      )}
    </div>
  );
};
